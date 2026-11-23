const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql'
const SITE_HOST = 'shioriblog.org'
const ALLOWED_ORIGIN = 'https://shioriblog.org'
const SITE_TIME_ZONE = 'America/Chicago'
const LIKE_STORE_NAME = 'shioriblog-post-likes'
const DASHBOARD_CACHE_NAME = 'shioriblog-dashboard-cache'
const DASHBOARD_RANGES = [1, 7, 30]
// Likes given before this log existed have no time attached, so the
// "recently liked" list only starts filling from the day it was deployed.
const RECENT_LIKES_KEY = 'recent-likes'
const RECENT_LIKES_LIMIT = 300
// A cron trigger (wrangler.jsonc) refreshes every range every 10 minutes,
// so the dashboard normally reads a ready-made copy instead of waiting on GraphQL.
const DASHBOARD_FRESH_MS = 15 * 60 * 1000
// 总浏览从开站那天算起。每天的浏览数算好后存进 Durable Object（daily:日期），
// 这样就算 Cloudflare 以后不再保留很早的数据，总数也不会变少。
const SITE_START = '2026-09-14'
const GITHUB_REPO = 'Shioriblog/shioriblog.github.io'
const ZINE_REFRESH_MS = 60 * 60 * 1000

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

    // 统计用的小存储：每天的浏览数（daily:）、每天的快照（snap:）、ZINE 下载数（zine）
    if (url.pathname === '/__kvlist' && request.method === 'GET') {
      const prefix = `kv:${url.searchParams.get('prefix') || ''}`
      const entries = await this.ctx.storage.list({ prefix })
      const values = {}
      for (const [key, value] of entries) values[key.slice(3)] = value
      return internalJson({ values })
    }
    if (url.pathname === '/__kvput' && request.method === 'POST') {
      const body = await safeJson(request)
      const values = body?.values
      if (!values || typeof values !== 'object') return internalJson({ error: 'Invalid values' }, 400)
      const entries = {}
      for (const [key, value] of Object.entries(values)) {
        if (typeof key === 'string' && key.length <= 80) entries[`kv:${key}`] = value
      }
      const keys = Object.keys(entries)
      for (let i = 0; i < keys.length; i += 100) {
        const chunk = {}
        keys.slice(i, i + 100).forEach((key) => { chunk[key] = entries[key] })
        await this.ctx.storage.put(chunk)
      }
      return internalJson({ ok: true, saved: keys.length })
    }

    if (url.pathname === '/__summary' && request.method === 'GET') {
      const entries = await this.ctx.storage.list({ prefix: 'count:' })
      const likes = {}
      for (const [key, value] of entries) {
        likes[key.slice('count:'.length)] = Number(value) || 0
      }
      const recent = (await this.getRecent()).map(({ post, at, country, from }) => ({ post, at, country, from }))
      return internalJson({ likes, recent })
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

      const recent = (await this.getRecent()).filter((item) => !(item.post === postId && item.visitor === visitor))
      if (liked) {
        count = Math.max(0, count - 1)
        await this.ctx.storage.delete(key)
      } else {
        const at = Date.now()
        count += 1
        await this.ctx.storage.put(key, at)
        // 只记大概的国家/地区和来源网站名，不记 IP
        const entry = { post: postId, visitor, at }
        if (normalizeCountry(body?.country)) entry.country = normalizeCountry(body.country)
        if (normalizeFrom(body?.from)) entry.from = normalizeFrom(body.from)
        recent.unshift(entry)
      }
      // The visitor id never leaves the Durable Object; it is kept only so an
      // un-like can take the matching entry back out of the list.
      await this.ctx.storage.put(RECENT_LIKES_KEY, recent.slice(0, RECENT_LIKES_LIMIT))

      await this.ctx.storage.put(countKey(postId), count)
      return internalJson({ likes: count, liked: !liked })
    }

    return internalJson({ error: 'Method not allowed' }, 405)
  }

  async getRecent() {
    const stored = await this.ctx.storage.get(RECENT_LIKES_KEY)
    return Array.isArray(stored) ? stored.filter((item) => item && validPostId(item.post) && Number.isFinite(item.at)) : []
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
  try {
    await updateMetrics(env)
  } catch (error) {
    console.error('Metrics update failed', error)
  }
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

async function buildDashboard(env, days) {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  const previousEnd = start
  const previousStart = new Date(previousEnd.getTime() - days * 24 * 60 * 60 * 1000)
  const currentFilter = rumFilter(start, end)
  const previousFilter = rumFilter(previousStart, previousEnd)
  const todayKey = localDateKey(end)
  const todayFilter = rumFilter(zonedMidnight(todayKey), end)

  const query = `
    query BlogDashboard {
      viewer {
        accounts(filter: { accountTag: ${JSON.stringify(env.CF_ACCOUNT_ID)} }) {
          total: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 1) {
            count
            avg { sampleInterval }
            sum { visits }
          }
          today: rumPageloadEventsAdaptiveGroups(filter: ${todayFilter}, limit: 1) {
            count
          }
          previousTotal: rumPageloadEventsAdaptiveGroups(filter: ${previousFilter}, limit: 1) {
            count
            avg { sampleInterval }
            sum { visits }
          }
          series: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 1000, orderBy: [datetimeHour_ASC]) {
            count
            avg { sampleInterval }
            dimensions { datetimeHour }
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
          referrerPosts: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 500, orderBy: [count_DESC]) {
            count
            avg { sampleInterval }
            sum { visits }
            dimensions { requestPath refererHost }
          }
          referrerPages: rumPageloadEventsAdaptiveGroups(filter: ${currentFilter}, limit: 300, orderBy: [count_DESC]) {
            count
            sum { visits }
            dimensions { refererHost refererPath refererScheme }
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

  const payload = await runGraphQL(env, query)
  const account = payload.data?.viewer?.accounts?.[0]
  if (!account) throw new Error('No analytics data returned for this account')

  const total = account.total?.[0] || {}
  const previousTotal = account.previousTotal?.[0] || {}
  const views = estimate(total)
  const visits = Math.round(total.sum?.visits || 0)
  const previousViews = estimate(previousTotal)
  const previousVisits = Math.round(previousTotal.sum?.visits || 0)

  const pageMap = mergeRows(account.pages, (row) => normalizeRequestPath(row.dimensions?.requestPath || '/'), (row) => ({
    views: estimate(row),
    visits: Math.round(row.sum?.visits || 0)
  }))

  const referrerMap = mergeRows(account.referrers, (row) => row.dimensions?.refererHost || 'Direct', (row) => ({
    views: estimate(row),
    visits: Math.round(row.sum?.visits || 0)
  }))

  const referrerPostMap = mergeRows(account.referrerPosts, (row) => {
    const path = normalizeRequestPath(row.dimensions?.requestPath || '')
    const referrer = row.dimensions?.refererHost || 'Direct'
    return path ? `${path}\u0000${referrer}` : ''
  }, (row) => ({
    views: estimate(row),
    visits: Math.round(row.sum?.visits || 0)
  }))

  // 从对方网站的哪一页点进来的（浏览器常常只给网站名、不给具体页面，这时路径是 /）
  const referrerPageMap = mergeRows(account.referrerPages, (row) => {
    const host = String(row.dimensions?.refererHost || '').toLowerCase()
    if (!host || host === SITE_HOST || host === `www.${SITE_HOST}`) return ''
    const path = row.dimensions?.refererPath || '/'
    const scheme = row.dimensions?.refererScheme === 'http' ? 'http' : 'https'
    return `${scheme}\u0000${host}\u0000${path}`
  }, (row) => ({
    views: estimate(row),
    visits: Math.round(row.sum?.visits || 0)
  }))

  // 「今天」那一档：每一次从外面进来的访问，按时间排（几点几分、从哪里来、进了哪一页、哪个国家）
  const timeline = days === 1 ? await fetchVisitTimeline(env, start, end).catch((error) => {
    console.error('Visit timeline failed', error)
    return null
  }) : null

  const likes = await getLikeSummary(env)
  const totals = await buildTotals(env, { start, end, days, todayKey, todayViews: estimate(account.today?.[0]), likes })

  return {
    views,
    visits,
    totals,
    timeline,
    likes: likes?.likes || {},
    recentLikes: likes?.recent || [],
    likesAvailable: likes !== null,
    generatedAt: end.toISOString(),
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
      views: previousViews,
      visits: previousVisits,
      pagesPerVisit: previousVisits ? previousViews / previousVisits : null
    },
    label: days === 1 ? 'Last 24 hours' : `Last ${days} days`,
    comparisonLabel: days === 1 ? 'vs previous 24h' : `vs previous ${days} days`,
    series: dailySeries(account.series, start, end),
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
    referrerPages: Array.from(referrerPageMap.entries())
      .map(([key, value]) => {
        const [scheme, host, path] = key.split('\u0000')
        return { scheme, host, path, ...value }
      })
      .sort((a, b) => (b.visits - a.visits) || (b.views - a.views)),
    countries: mergeNumeric(account.countries, (row) => row.dimensions?.countryName || 'Unknown', (row) => estimate(row))
      .map(([label, value]) => ({ label, views: value }))
  }
}

// ---------- 今天的访问，按时间 ----------

async function fetchVisitTimeline(env, start, end) {
  // 先按分钟分组；如果这个字段用不了，退一步按 15 分钟、再退到按小时
  for (const field of ['datetimeMinute', 'datetimeFifteenMinutes', 'datetimeHour']) {
    let payload
    try {
      payload = await runGraphQL(env, `
        query VisitTimeline {
          viewer {
            accounts(filter: { accountTag: ${JSON.stringify(env.CF_ACCOUNT_ID)} }) {
              rows: rumPageloadEventsAdaptiveGroups(filter: ${rumFilter(start, end)}, limit: 500, orderBy: [${field}_DESC]) {
                count
                sum { visits }
                dimensions { ${field} refererHost requestPath countryName }
              }
            }
          }
        }
      `)
    } catch (error) {
      continue
    }
    const rows = payload.data?.viewer?.accounts?.[0]?.rows || []
    const items = rows
      .filter((row) => Number(row.sum?.visits || 0) > 0)
      .map((row) => {
        const host = String(row.dimensions?.refererHost || '').toLowerCase()
        return {
          at: row.dimensions?.[field],
          precision: field === 'datetimeMinute' ? 'minute' : field === 'datetimeFifteenMinutes' ? '15min' : 'hour',
          from: !host || host === SITE_HOST || host === `www.${SITE_HOST}` ? 'direct' : host,
          path: normalizeRequestPath(row.dimensions?.requestPath || '/'),
          country: row.dimensions?.countryName || '',
          visits: Math.round(row.sum?.visits || 0)
        }
      })
      .filter((item) => item.at)
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))
      .slice(0, 100)
    return items
  }
  return null
}

// ---------- 总浏览、心、ZINE 下载、订阅 ----------

async function kvList(env, prefix) {
  const stub = dashboardCacheStub(env)
  if (!stub) return {}
  const response = await stub.fetch(`https://likes.internal/__kvlist?prefix=${encodeURIComponent(prefix)}`)
  if (!response.ok) throw new Error(`Metrics store returned ${response.status}`)
  const data = await response.json()
  return data.values || {}
}

async function kvPut(env, values) {
  const stub = dashboardCacheStub(env)
  if (!stub || !Object.keys(values).length) return
  await stub.fetch('https://likes.internal/__kvput', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  })
}

// 每 10 分钟跑一次：补齐每天的浏览数、更新 ZINE 下载数、每天记一次快照
async function updateMetrics(env) {
  await archiveDailyViews(env).catch((error) => console.error('Daily archive failed', error))
  await refreshZineDownloads(env).catch((error) => console.error('ZINE downloads failed', error))
  await takeDailySnapshot(env).catch((error) => console.error('Snapshot failed', error))
}

async function archiveDailyViews(env) {
  const today = localDateKey(new Date())
  const stored = await kvList(env, 'daily:')
  const missing = []
  for (let day = SITE_START; day < today; day = nextDateKey(day)) {
    if (!(`daily:${day}` in stored)) missing.push(day)
  }
  // 一次最多补 6 段、每段最多 7 天，剩下的下一次再补
  const chunks = []
  for (const day of missing) {
    const last = chunks[chunks.length - 1]
    if (last && last.length < 7 && nextDateKey(last[last.length - 1]) === day) last.push(day)
    else chunks.push([day])
  }
  for (const chunk of chunks.slice(0, 6)) {
    const from = zonedMidnight(chunk[0])
    const to = zonedMidnight(nextDateKey(chunk[chunk.length - 1]))
    const payload = await runGraphQL(env, `
      query DailyViews {
        viewer {
          accounts(filter: { accountTag: ${JSON.stringify(env.CF_ACCOUNT_ID)} }) {
            hours: rumPageloadEventsAdaptiveGroups(filter: ${rumFilter(from, to)}, limit: 1000, orderBy: [datetimeHour_ASC]) {
              count
              dimensions { datetimeHour }
            }
          }
        }
      }
    `)
    const rows = payload.data?.viewer?.accounts?.[0]?.hours || []
    const totals = new Map(mergeNumeric(rows, (row) => localDateKey(row.dimensions?.datetimeHour), (row) => estimate(row)))
    const values = {}
    chunk.forEach((day) => { values[`daily:${day}`] = totals.get(day) || 0 })
    await kvPut(env, values)
  }
}

async function refreshZineDownloads(env) {
  const stored = (await kvList(env, 'zine'))?.zine
  if (stored && Date.now() - Number(stored.at || 0) < ZINE_REFRESH_MS) return
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'shiori-stats' }
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=30`, { headers })
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
  const releases = await response.json()
  const assets = {}
  for (const release of releases || []) {
    for (const asset of release.assets || []) {
      if (Number.isSafeInteger(asset.download_count)) assets[String(asset.id)] = asset.download_count
    }
  }
  await kvPut(env, { zine: { at: Date.now(), assets } })
}

// 每天第一次运行时，记下当时的心、ZINE 下载数、订阅人数，用来算「这一周 +几」
async function takeDailySnapshot(env) {
  const today = localDateKey(new Date())
  const existing = await kvList(env, `snap:${today}`)
  if (existing[`snap:${today}`]) return
  const likes = await getLikeSummary(env)
  const zine = (await kvList(env, 'zine'))?.zine
  let subscribers = null
  if (env.BREVO_API_KEY) subscribers = await brevoContactCount(env).catch(() => null)
  await kvPut(env, {
    [`snap:${today}`]: {
      at: Date.now(),
      likes: likes ? sumValues(likes.likes) : null,
      zine: zine?.assets || null,
      subscribers
    }
  })
}

async function brevoContactCount(env, createdSince) {
  const url = new URL('https://api.brevo.com/v3/contacts')
  url.searchParams.set('limit', '1')
  if (createdSince) url.searchParams.set('createdSince', createdSince.toISOString())
  if (env.BREVO_LIST_ID) url.searchParams.set('listIds', String(env.BREVO_LIST_ID))
  const response = await fetch(url, { headers: { 'api-key': env.BREVO_API_KEY, Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Brevo returned ${response.status}`)
  const data = await response.json()
  return Number(data.count) || 0
}

async function buildTotals(env, { start, end, days, todayKey, todayViews, likes }) {
  const result = {}
  let daily = {}
  let snaps = {}
  let zine = null
  try {
    ;[daily, snaps, zine] = await Promise.all([kvList(env, 'daily:'), kvList(env, 'snap:'), kvList(env, 'zine').then((values) => values.zine || null)])
  } catch (error) {
    console.error('Metrics store read failed', error)
  }

  // 总浏览 = 开站以来每天存下的数 + 今天到现在
  let archived = 0
  let archivedDays = 0
  let expectedDays = 0
  for (let day = SITE_START; day < todayKey; day = nextDateKey(day)) {
    expectedDays += 1
    if (`daily:${day}` in daily) {
      archived += Number(daily[`daily:${day}`]) || 0
      archivedDays += 1
    }
  }
  result.views = { allTime: archived + (todayViews || 0), since: SITE_START, complete: archivedDays === expectedDays }

  // 「这一周 +几」用的起点快照：起始那天或之后最早的一份。快照是每天零点左右记的，
  // 和「最近 24 小时」对不齐，所以 24 小时那一档用快照时总是写明从哪天起算
  const startKey = localDateKey(start)
  const snapKeys = Object.keys(snaps).map((key) => key.slice(5)).filter((key) => key >= startKey).sort()
  const baseKey = snapKeys[0] || null
  const base = baseKey ? snaps[`snap:${baseKey}`] : null
  const since = baseKey && (baseKey !== startKey || days === 1) ? baseKey : null

  // 心：最近的心有时间记录，范围被记录完整覆盖时直接数；否则用快照
  if (likes) {
    const total = sumValues(likes.likes)
    const recent = likes.recent || []
    const startMs = start.getTime()
    // 记录早先最多只留 30 条，所以少于 30 条、或者记录里有比起点更早的心，才算覆盖完整
    const covered = recent.length < 30 || recent.some((item) => Number(item.at) < startMs)
    const loggedSince = Date.parse('2026-10-21T00:00:00-05:00')
    let change = null
    let changeSince = null
    if (covered && startMs >= loggedSince) {
      change = recent.filter((item) => Number(item.at) >= startMs).length
    } else if (base && Number.isFinite(base.likes)) {
      change = total - base.likes
      changeSince = since
    }
    result.likes = { total, change, since: changeSince }
  }

  // ZINE 下载：每个文件的累计数，以及和起点快照相比多了几次
  if (zine?.assets) {
    const assets = {}
    Object.entries(zine.assets).forEach(([id, count]) => {
      const before = base?.zine?.[id]
      assets[id] = { count, change: Number.isFinite(before) ? count - before : null, since }
    })
    result.zine = { at: zine.at, assets }
  }

  // 订阅：Brevo 的联系人总数，以及这段时间新加的人数（只有人数，不读邮箱）
  if (env.BREVO_API_KEY) {
    try {
      const [total, added] = await Promise.all([brevoContactCount(env), brevoContactCount(env, start)])
      result.subscribers = { available: true, total, new: added }
    } catch (error) {
      result.subscribers = { available: false, error: error.message }
    }
  } else {
    result.subscribers = { available: false }
  }
  return result
}

function sumValues(map) {
  return Object.values(map || {}).reduce((sum, value) => sum + (Number(value) || 0), 0)
}

function nextDateKey(key) {
  const date = new Date(`${key}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
}

// 芝加哥时间某一天的零点（UTC 时间）
function zonedMidnight(key) {
  const [year, month, day] = key.split('-').map(Number)
  for (const offset of [5, 6, 4, 7]) {
    const candidate = new Date(Date.UTC(year, month - 1, day, offset))
    if (localDateKey(candidate) === key && localDateKey(new Date(candidate.getTime() - 1)) !== key) return candidate
  }
  return new Date(Date.UTC(year, month - 1, day, 6))
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
    init.body = JSON.stringify({
      visitor: normalizeVisitor(body?.visitor),
      from: normalizeFrom(body?.from),
      country: normalizeCountry(request.cf?.country)
    })
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
    return { likes: data.likes || {}, recent: Array.isArray(data.recent) ? data.recent : [] }
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

function normalizeCountry(value) {
  const code = typeof value === 'string' ? value.trim().toUpperCase() : ''
  return /^[A-Z]{2}$/.test(code) && code !== 'XX' && code !== 'T1' ? code : ''
}

function normalizeFrom(value) {
  const host = typeof value === 'string' ? value.trim().toLowerCase().replace(/^www\./, '') : ''
  if (host === 'direct') return 'direct'
  return /^[a-z0-9.-]{1,100}$/.test(host) && host.includes('.') ? host : ''
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
