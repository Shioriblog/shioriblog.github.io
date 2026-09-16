const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql'
const SITE_HOST = 'shioriblog.org'
const ALLOWED_ORIGIN = 'https://shioriblog.org'
const LIKE_STORE_NAME = 'shioriblog-post-likes'
const POST_PATH = /^\/\d{4}\/\d{2}\/\d{2}\//

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) })
    }

    if (url.pathname === '/most-read') {
      return handleMostRead(request, env)
    }

    if (url.pathname.startsWith('/likes/')) {
      return handleLikeRequest(request, env, url)
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, request)
    }

    return handleDashboard(request, env, url)
  }
}

export class LikeStore {
  constructor(ctx) {
    this.ctx = ctx
  }

  async fetch(request) {
    const url = new URL(request.url)

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

async function handleDashboard(request, env, url) {
  const days = Number(url.searchParams.get('days') || 7)
  if (![1, 7, 30].includes(days)) {
    return json({ error: 'days must be 1, 7, or 30' }, 400, request)
  }

  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
    return json({ error: 'Worker secrets are not configured' }, 500, request)
  }

  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  const previousEnd = start
  const previousStart = new Date(previousEnd.getTime() - days * 24 * 60 * 60 * 1000)
  const currentFilter = rumFilter(start, end)
  const previousFilter = rumFilter(previousStart, previousEnd)

  const query = `
    query BlogDashboard {
      viewer {
        accounts(filter: { accountTag: ${JSON.stringify(env.CF_ACCOUNT_ID)} }) {
          total: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 1) {
            count
            avg { sampleInterval }
            sum { visits }
          }
          previousTotal: rumPageloadEventsAdaptiveGroups(filter: ${previousFilter}, limit: 1) {
            count
            avg { sampleInterval }
            sum { visits }
          }
          series: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 60, orderBy: [date_ASC]) {
            count
            avg { sampleInterval }
            dimensions { date }
          }
          pages: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 200, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            sum { visits }
            dimensions { requestPath }
          }
          referrers: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 100, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            sum { visits }
            dimensions { refererHost }
          }
          countries: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 40, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            dimensions { countryName }
          }
        }
      }
    }
  `

  try {
    const payload = await runGraphQL(env, query)
    const account = payload.data?.viewer?.accounts?.[0]
    if (!account) return json({ error: 'No analytics data returned for this account' }, 502, request)

    const total = account.total?.[0] || {}
    const previousTotal = account.previousTotal?.[0] || {}
    const views = estimate(total)
    const visits = Math.round(total.sum?.visits || 0)
    const previousViews = estimate(previousTotal)
    const previousVisits = Math.round(previousTotal.sum?.visits || 0)

    const pageMap = mergeRows(account.pages, (row) => row.dimensions?.requestPath || '/', (row) => ({
      views: estimate(row),
      visits: Math.round(row.sum?.visits || 0)
    }))

    const referrerMap = mergeRows(account.referrers, (row) => row.dimensions?.refererHost || 'Direct', (row) => ({
      views: estimate(row),
      visits: Math.round(row.sum?.visits || 0)
    }))

    const likes = await getLikeSummary(env)

    return json({
      views,
      visits,
      likes,
      previous: {
        views: previousViews,
        visits: previousVisits,
        pagesPerVisit: previousVisits ? previousViews / previousVisits : null
      },
      label: days === 1 ? 'Last 24 hours' : `Last ${days} days`,
      comparisonLabel: days === 1 ? 'vs previous 24h' : `vs previous ${days} days`,
      series: mergeNumeric(account.series, (row) => row.dimensions?.date || '', (row) => estimate(row))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, value]) => ({ date, views: value })),
      pages: Array.from(pageMap.entries())
        .map(([label, value]) => ({ label, ...value }))
        .sort((a, b) => b.views - a.views),
      referrers: Array.from(referrerMap.entries())
        .map(([label, value]) => ({ label, ...value }))
        .sort((a, b) => (b.visits - a.visits) || (b.views - a.views)),
      countries: mergeNumeric(account.countries, (row) => row.dimensions?.countryName || 'Unknown', (row) => estimate(row))
        .map(([label, value]) => ({ label, views: value }))
    }, 200, request)
  } catch (error) {
    return json({ error: error.message || 'Unexpected Worker error' }, 500, request)
  }
}

async function handleMostRead(request, env) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, request)
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
    return json({ error: 'Worker secrets are not configured' }, 500, request)
  }

  const end = new Date()
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
  const filter = rumFilter(start, end)
  const query = `
    query MostRead {
      viewer {
        accounts(filter: { accountTag: ${JSON.stringify(env.CF_ACCOUNT_ID)} }) {
          pages: rumPageloadEventsAdaptiveGroups(filter: ${filter}, limit: 100, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            dimensions { requestPath }
          }
        }
      }
    }
  `

  try {
    const payload = await runGraphQL(env, query)
    const rows = payload.data?.viewer?.accounts?.[0]?.pages || []
    const posts = mergeNumeric(rows, (row) => row.dimensions?.requestPath || '', (row) => estimate(row))
      .map(([path, views]) => ({ path, views }))
      .filter((item) => POST_PATH.test(item.path))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
    return json({ posts }, 200, request, 300)
  } catch (error) {
    return json({ error: error.message || 'Unable to load most-read posts' }, 500, request, 0)
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
  if (!env.LIKES) return {}
  try {
    const objectId = env.LIKES.idFromName(LIKE_STORE_NAME)
    const stub = env.LIKES.get(objectId)
    const response = await stub.fetch('https://likes.internal/__summary')
    if (!response.ok) return {}
    const data = await response.json()
    return data.likes || {}
  } catch (_) {
    return {}
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
    datetime_leq: ${JSON.stringify(end.toISOString())}
    requestHost: ${JSON.stringify(SITE_HOST)}
    bot: 0
  }`
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
  const sampleInterval = Number(row?.avg?.sampleInterval || 1)
  return Math.round(Number(row?.count || 0) * sampleInterval)
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
