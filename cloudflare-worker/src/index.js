const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql'
const SITE_HOST = 'shioriblog.org'
const ALLOWED_ORIGIN = 'https://shioriblog.org'
const SITE_TIME_ZONE = 'America/Chicago'
const LIKE_STORE_NAME = 'shioriblog-post-likes'
const DASHBOARD_CACHE_NAME = 'shioriblog-dashboard-cache'
const DASHBOARD_RANGES = [1, 7, 30]
// A cron trigger (wrangler.jsonc) refreshes every range every 10 minutes,
// so the dashboard normally reads a ready-made copy instead of waiting on GraphQL.
const DASHBOARD_FRESH_MS = 15 * 60 * 1000

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) })
    }

    if (url.pathname.startsWith('/likes/')) {
      return handleLikeRequest(request, env, url)
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, request)
    }

    return handleDashboard(request, env, url, ctx)
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshDashboardCache(env))
  }
}

export class LikeStore {
  constructor(ctx) {
    this.ctx = ctx
  }

  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/__cache/')) {
      const key = `cache:${url.pathname.slice('/__cache/'.length)}`
      if (request.method === 'GET') {
        const entry = await this.ctx.storage.get(key)
        return entry ? internalJson(entry) : internalJson({ error: 'Not cached' }, 404)
      }
      if (request.method === 'PUT') {
        const entry = await safeJson(request)
        if (typeof entry?.body !== 'string' || !Number.isFinite(entry?.at)) return internalJson({ error: 'Invalid cache entry' }, 400)
        await this.ctx.storage.put(key, { body: entry.body, at: entry.at })
        return internalJson({ ok: true })
      }
      return internalJson({ error: 'Method not allowed' }, 405)
    }

    if (url.pathname === '/__summary' && request.method === 'GET') {
      const entries = await this.ctx.storage.list({ prefix: 'count:' })
      const likes = {}
      for (const [key, value] of entries) {
        likes[key.slice('count:'.length)] = Number(value) || 0
      }
      return internalJson({ likes })
    }

    const postId = decodeURIComponent(url.pathname.replace(/^\//, ''))
    if (!validPostId(postId)) return internalJson({ error: 'Invalid post id' }, 400)

    if (request.method === 'GET') {
      const visitor = normalizeVisitor(url.searchParams.get('visitor'))
      const count = await this.getCount(postId)
      const liked = visitor ? Boolean(await this.ctx.storage.get(voterKey(postId, visitor))) : false
      return internalJson({ likes: count, liked })
    }

    if (request.method === 'POST') {
      const body = await safeJson(request)
      const visitor = normalizeVisitor(body?.visitor)
      if (!visitor) return internalJson({ error: 'A visitor id is required' }, 400)

      let count = await this.getCount(postId)
      const key = voterKey(postId, visitor)
      const liked = Boolean(await this.ctx.storage.get(key))

      if (liked) {
        count = Math.max(0, count - 1)
        await this.ctx.storage.delete(key)
      } else {
        count += 1
        await this.ctx.storage.put(key, true)
      }

      await this.ctx.storage.put(countKey(postId), count)
      return internalJson({ likes: count, liked: !liked })
    }

    return internalJson({ error: 'Method not allowed' }, 405)
  }

  async getCount(postId) {
    const key = countKey(postId)
    const existing = await this.ctx.storage.get(key)
    if (existing !== undefined) return Number(existing) || 0
    await this.ctx.storage.put(key, 0)
    return 0
  }
}

async function handleDashboard(request, env, url, ctx) {
  const days = Number(url.searchParams.get('days') || 7)
  if (!DASHBOARD_RANGES.includes(days)) {
    return json({ error: 'days must be 1, 7, or 30' }, 400, request)
  }

  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
    return json({ error: 'Worker secrets are not configured' }, 500, request)
  }

  const cached = await readDashboardCache(env, days)
  if (cached && Date.now() - cached.at < DASHBOARD_FRESH_MS) {
    return cachedResponse(cached.body, request, 'hit')
  }

  try {
    const body = JSON.stringify(await buildDashboard(env, days))
    const write = writeDashboardCache(env, days, body)
    if (ctx?.waitUntil) ctx.waitUntil(write)
    else await write
    return cachedResponse(body, request, 'miss')
  } catch (error) {
    // Analytics API hiccup: an older copy is better than an empty page.
    if (cached) return cachedResponse(cached.body, request, 'stale')
    return json({ error: error.message || 'Unexpected Worker error' }, 500, request)
  }
}

async function refreshDashboardCache(env) {
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) return
  for (const days of DASHBOARD_RANGES) {
    try {
      await writeDashboardCache(env, days, JSON.stringify(await buildDashboard(env, days)))
    } catch (error) {
      console.error(`Dashboard refresh failed for ${days}d`, error)
    }
  }
}

function dashboardCacheStub(env) {
  if (!env.LIKES) return null
  return env.LIKES.get(env.LIKES.idFromName(DASHBOARD_CACHE_NAME))
}

async function readDashboardCache(env, days) {
  const stub = dashboardCacheStub(env)
  if (!stub) return null
  try {
    const response = await stub.fetch(`https://likes.internal/__cache/dashboard-${days}`)
    if (!response.ok) return null
    const entry = await response.json()
    return typeof entry?.body === 'string' && Number.isFinite(entry?.at) ? entry : null
  } catch (_) {
    return null
  }
}

async function writeDashboardCache(env, days, body) {
  const stub = dashboardCacheStub(env)
  if (!stub) return
  try {
    await stub.fetch(`https://likes.internal/__cache/dashboard-${days}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, at: Date.now() })
    })
  } catch (error) {
    console.error('Dashboard cache write failed', error)
  }
}

function cachedResponse(body, request, state) {
  return new Response(body, {
    status: 200,
    headers: {
      ...corsHeaders(request, 60),
      'Content-Type': 'application/json; charset=utf-8',
      'X-Dashboard-Cache': state
    }
  })
}

// Cloudflare Web Analytics went live on the site on 2026-09-15 around noon (Chicago).
// Anything before this has no data, so a comparison period that starts earlier is incomplete.
const ANALYTICS_SINCE = new Date('2026-09-15T17:00:00Z')
// Long ranges get sampled by Cloudflare (counts come back rounded to 10s). Querying in
// windows of at most a week keeps each query small enough to come back unsampled.
const QUERY_WINDOW_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

function timeWindows(start, end) {
  const windows = []
  let cursor = start.getTime()
  while (cursor < end.getTime()) {
    const next = Math.min(end.getTime(), cursor + QUERY_WINDOW_DAYS * DAY_MS)
    windows.push([new Date(cursor), new Date(next)])
    cursor = next
  }
  return windows
}

function windowQuery(accountId, start, end) {
  const filter = rumFilter(start, end)
  return `
    query BlogDashboard {
      viewer {
        accounts(filter: { accountTag: ${JSON.stringify(accountId)} }) {
          total: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 1) {
            count
            avg { sampleInterval }
            sum { visits }
          }
          series: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 1000, orderBy: [datetimeHour_ASC]) {
            count
            avg { sampleInterval }
            dimensions { datetimeHour }
          }
          pages: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 200, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            sum { visits }
            dimensions { requestPath }
          }
          referrers: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 100, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            sum { visits }
            dimensions { refererHost }
          }
          referrerPosts: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 500, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            sum { visits }
            dimensions { requestPath refererHost }
          }
          countries: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 40, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            dimensions { countryName }
          }
        }
      }
    }
  `
}

function totalQuery(accountId, start, end) {
  return `
    query BlogDashboardTotal {
      viewer {
        accounts(filter: { accountTag: ${JSON.stringify(accountId)} }) {
          total: rumPageloadEventsAdaptiveGroups(filter: ${rumFilter(start, end)}, limit: 1) {
            count
            avg { sampleInterval }
            sum { visits }
          }
        }
      }
    }
  `
}

async function queryAccount(env, query) {
  const payload = await runGraphQL(env, query)
  const account = payload.data?.viewer?.accounts?.[0]
  if (!account) throw new Error('No analytics data returned for this account')
  return account
}

function maxSampleInterval(rows) {
  return (rows || []).reduce((max, row) => Math.max(max, Number(row?.avg?.sampleInterval || 1)), 1)
}

async function buildDashboard(env, days) {
  const end = new Date()
  const start = new Date(end.getTime() - days * DAY_MS)
  const previousEnd = start
  const previousStart = new Date(previousEnd.getTime() - days * DAY_MS)
  const previousCoverageStart = new Date(Math.max(previousStart.getTime(), ANALYTICS_SINCE.getTime()))
  const previousPartial = previousStart < ANALYTICS_SINCE

  const currentAccounts = await Promise.all(
    timeWindows(start, end).map(([from, to]) => queryAccount(env, windowQuery(env.CF_ACCOUNT_ID, from, to)))
  )
  const previousAccounts = previousCoverageStart < previousEnd
    ? await Promise.all(timeWindows(previousCoverageStart, previousEnd).map(([from, to]) => queryAccount(env, totalQuery(env.CF_ACCOUNT_ID, from, to))))
    : []

  const rows = (accounts, key) => accounts.flatMap((account) => account[key] || [])
  const sumTotals = (accounts) => rows(accounts, 'total').reduce((acc, row) => ({
    views: acc.views + estimate(row),
    visits: acc.visits + Math.round(row.sum?.visits || 0)
  }), { views: 0, visits: 0 })

  const { views, visits } = sumTotals(currentAccounts)
  const { views: previousViews, visits: previousVisits } = sumTotals(previousAccounts)

  const sampleInterval = Math.max(
    ...['total', 'series', 'pages', 'referrers', 'referrerPosts', 'countries'].map((key) => maxSampleInterval(rows(currentAccounts, key))),
    maxSampleInterval(rows(previousAccounts, 'total'))
  )

  const pageMap = mergeRows(rows(currentAccounts, 'pages'), (row) => normalizeRequestPath(row.dimensions?.requestPath || '/'), (row) => ({
    views: estimate(row),
    visits: Math.round(row.sum?.visits || 0)
  }))

  const referrerMap = mergeRows(rows(currentAccounts, 'referrers'), (row) => row.dimensions?.refererHost || 'Direct', (row) => ({
    views: estimate(row),
    visits: Math.round(row.sum?.visits || 0)
  }))

  const referrerPostMap = mergeRows(rows(currentAccounts, 'referrerPosts'), (row) => {
    const path = normalizeRequestPath(row.dimensions?.requestPath || '')
    const referrer = row.dimensions?.refererHost || 'Direct'
    return path ? `${path}\u0000${referrer}` : ''
  }, (row) => ({
    views: estimate(row),
    visits: Math.round(row.sum?.visits || 0)
  }))

  const likes = await getLikeSummary(env)

  return {
    views,
    visits,
    likes: likes || {},
    likesAvailable: likes !== null,
    generatedAt: end.toISOString(),
    // true when Cloudflare sampled any part of the data: counts are estimates.
    sampled: sampleInterval > 1,
    sampleInterval,
    trackingSince: ANALYTICS_SINCE.toISOString(),
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
      startDate: localDateKey(start),
      endDate: localDateKey(end),
      timeZone: SITE_TIME_ZONE
    },
    previous: {
      start: previousStart.toISOString(),
      end: previousEnd.toISOString(),
      // The comparison period began before analytics existed, so its totals are incomplete.
      partial: previousPartial,
      coverageStart: previousCoverageStart.toISOString(),
      views: previousViews,
      visits: previousVisits,
      pagesPerVisit: previousVisits ? previousViews / previousVisits : null
    },
    label: days === 1 ? 'Last 24 hours' : `Last ${days} days`,
    comparisonLabel: days === 1 ? 'vs previous 24h' : `vs previous ${days} days`,
    series: dailySeries(rows(currentAccounts, 'series'), start, end),
    pages: Array.from(pageMap.entries())
      .map(([label, value]) => ({ label, ...value }))
      .sort((a, b) => b.views - a.views),
    referrers: Array.from(referrerMap.entries())
      .map(([label, value]) => ({ label, ...value }))
      .sort((a, b) => (b.visits - a.visits) || (b.views - a.views)),
    referrerPosts: Array.from(referrerPostMap.entries())
      .map(([key, value]) => {
        const [path, referrer] = key.split('\u0000')
        return { path, referrer, ...value }
      })
      .sort((a, b) => (b.visits - a.visits) || (b.views - a.views)),
    countries: mergeNumeric(rows(currentAccounts, 'countries'), (row) => row.dimensions?.countryName || 'Unknown', (row) => estimate(row))
      .map(([label, value]) => ({ label, views: value }))
  }
}

async function handleLikeRequest(request, env, url) {
  if (!env.LIKES) return json({ error: 'Likes storage is not configured' }, 500, request)

  const postId = decodeURIComponent(url.pathname.slice('/likes/'.length))
  if (!validPostId(postId)) return json({ error: 'Invalid post id' }, 400, request)
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed' }, 405, request)

  const objectId = env.LIKES.idFromName(LIKE_STORE_NAME)
  const stub = env.LIKES.get(objectId)
  const internalUrl = new URL(`https://likes.internal/${encodeURIComponent(postId)}`)

  if (request.method === 'GET') {
    const visitor = normalizeVisitor(url.searchParams.get('visitor'))
    if (visitor) internalUrl.searchParams.set('visitor', visitor)
  }

  const init = { method: request.method, headers: { 'Content-Type': 'application/json' } }
  if (request.method === 'POST') {
    const body = await safeJson(request)
    init.body = JSON.stringify({ visitor: normalizeVisitor(body?.visitor) })
  }

  try {
    const response = await stub.fetch(new Request(internalUrl, init))
    const data = await response.json()
    return json(data, response.status, request, 0)
  } catch (error) {
    return json({ error: error.message || 'Likes service unavailable' }, 500, request, 0)
  }
}

async function getLikeSummary(env) {
  if (!env.LIKES) return null
  try {
    const objectId = env.LIKES.idFromName(LIKE_STORE_NAME)
    const stub = env.LIKES.get(objectId)
    const response = await stub.fetch('https://likes.internal/__summary')
    if (!response.ok) return null
    const data = await response.json()
    return data.likes || {}
  } catch (_) {
    return null
  }
}

async function runGraphQL(env, query) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  })

  const payload = await response.json()
  if (!response.ok) throw new Error(`Cloudflare API returned ${response.status}`)
  if (payload.errors?.length) throw new Error(payload.errors.map((item) => item.message).join('; '))
  return payload
}

function rumFilter(start, end) {
  return `{
    datetime_geq: ${JSON.stringify(start.toISOString())}
    datetime_lt: ${JSON.stringify(end.toISOString())}
    requestHost: ${JSON.stringify(SITE_HOST)}
    bot: 0
  }`
}

function localDateKey(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SITE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${byType.year}-${byType.month}-${byType.day}`
}

function dailySeries(rows, start, end) {
  const totals = new Map(mergeNumeric(rows, (row) => localDateKey(row.dimensions?.datetimeHour), (row) => estimate(row)))
  const first = new Date(`${localDateKey(start)}T00:00:00Z`)
  const last = localDateKey(end)
  const series = []
  for (let date = first.toISOString().slice(0, 10); date <= last; first.setUTCDate(first.getUTCDate() + 1), date = first.toISOString().slice(0, 10)) {
    series.push({ date, views: totals.get(date) || 0 })
  }
  return series
}

function normalizeRequestPath(value) {
  const raw = typeof value === 'string' ? value : ''
  if (!raw) return ''
  try { return decodeURIComponent(raw) } catch (_) { return raw }
}

function countKey(postId) {
  return `count:${postId}`
}

function voterKey(postId, visitor) {
  return `vote:${postId}:${visitor}`
}

function validPostId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(value)
}

function normalizeVisitor(value) {
  if (typeof value !== 'string') return ''
  const cleaned = value.trim()
  return /^[A-Za-z0-9_-]{16,80}$/.test(cleaned) ? cleaned : ''
}

async function safeJson(request) {
  try { return await request.json() } catch (_) { return null }
}

function internalJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  })
}

function estimate(row) {
  // Adaptive Groups counts already include sampling extrapolation.
  // https://developers.cloudflare.com/analytics/graphql-api/sampling/
  // Multiplying by sampleInterval again inflates older, sampled periods.
  return Math.round(Number(row?.count || 0))
}

function mergeNumeric(rows = [], keyFn, valueFn) {
  const totals = new Map()
  for (const row of rows || []) {
    const key = keyFn(row)
    if (!key) continue
    totals.set(key, (totals.get(key) || 0) + valueFn(row))
  }
  return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
}

function mergeRows(rows = [], keyFn, valueFn) {
  const totals = new Map()
  for (const row of rows || []) {
    const key = keyFn(row)
    if (!key) continue
    const value = valueFn(row)
    const existing = totals.get(key) || { views: 0, visits: 0 }
    totals.set(key, {
      views: existing.views + Number(value.views || 0),
      visits: existing.visits + Number(value.visits || 0)
    })
  }
  return totals
}

function corsHeaders(request, maxAge = 300) {
  const origin = request.headers.get('Origin')
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': maxAge > 0 ? `public, max-age=${maxAge}` : 'no-store'
  }
}

function json(data, status, request, maxAge = 300) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request, maxAge),
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}
