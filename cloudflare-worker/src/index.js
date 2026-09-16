const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql'
const SITE_HOST = 'shioriblog.org'
const ALLOWED_ORIGIN = 'https://shioriblog.org'
const LYKET_API = 'https://api.lyket.dev/v1'
const LYKET_PUBLIC_KEY = 'pt_c74039748e1bf2994bb76504bf7222'
const LYKET_NAMESPACE = 'shioriblog-posts'
const LIKE_STORE_NAME = 'shioriblog-post-likes'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) })
    }

    if (url.pathname === '/likes/import') {
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405, request)
      }
      return importLyketLikes(request, env)
    }

    if (url.pathname.startsWith('/likes/')) {
      return handleLikeRequest(request, env, url)
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, request)
    }

    const days = Number(url.searchParams.get('days') || 7)
    if (![1, 7, 30].includes(days)) {
      return json({ error: 'days must be 1, 7, or 30' }, 400, request)
    }

    if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
      return json({ error: 'Worker secrets are not configured' }, 500, request)
    }

    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
    const startISO = start.toISOString()
    const endISO = end.toISOString()

    const filter = `{
      datetime_geq: ${JSON.stringify(startISO)}
      datetime_leq: ${JSON.stringify(endISO)}
      requestHost: ${JSON.stringify(SITE_HOST)}
      bot: 0
    }`

    const query = `
      query BlogDashboard {
        viewer {
          accounts(filter: { accountTag: ${JSON.stringify(env.CF_ACCOUNT_ID)} }) {
            total: rumPageloadEventsAdaptiveGroups(
              filter: ${filter}
              limit: 1
            ) {
              count
              avg { sampleInterval }
              sum { visits }
            }

            series: rumPageloadEventsAdaptiveGroups(
              filter: ${filter}
              limit: 60
              orderBy: [date_ASC]
            ) {
              count
              avg { sampleInterval }
              dimensions { date }
            }

            pages: rumPageloadEventsAdaptiveGroups(
              filter: ${filter}
              limit: 20
              orderBy: [count_DESC]
            ) {
              count
              avg { sampleInterval }
              dimensions { requestPath }
            }

            referrers: rumPageloadEventsAdaptiveGroups(
              filter: ${filter}
              limit: 20
              orderBy: [count_DESC]
            ) {
              count
              avg { sampleInterval }
              dimensions { refererHost }
            }

            countries: rumPageloadEventsAdaptiveGroups(
              filter: ${filter}
              limit: 20
              orderBy: [count_DESC]
            ) {
              count
              avg { sampleInterval }
              dimensions { countryName }
            }
          }
        }
      }
    `

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      const payload = await response.json()
      if (!response.ok) {
        return json({ error: `Cloudflare API returned ${response.status}` }, 502, request)
      }

      if (payload.errors?.length) {
        return json({ error: payload.errors.map((item) => item.message).join('; ') }, 502, request)
      }

      const account = payload.data?.viewer?.accounts?.[0]
      if (!account) {
        return json({ error: 'No analytics data returned for this account' }, 502, request)
      }

      const total = account.total?.[0] || {}
      const views = estimate(total)
      const visits = Math.round(total.sum?.visits || 0)

      return json({
        views,
        visits,
        label: days === 1 ? 'Last 24 hours' : `Last ${days} days`,
        series: mergeBy(account.series, (row) => row.dimensions?.date || '', (row) => estimate(row))
          .map(([date, value]) => ({ date, views: value })),
        pages: mergeBy(account.pages, (row) => row.dimensions?.requestPath || '/', (row) => estimate(row))
          .map(([label, value]) => ({ label, views: value })),
        referrers: mergeBy(account.referrers, (row) => row.dimensions?.refererHost || 'Direct', (row) => estimate(row))
          .map(([label, value]) => ({ label, views: value })),
        countries: mergeBy(account.countries, (row) => row.dimensions?.countryName || 'Unknown', (row) => estimate(row))
          .map(([label, value]) => ({ label, views: value }))
      }, 200, request)
    } catch (error) {
      return json({ error: error.message || 'Unexpected Worker error' }, 500, request)
    }
  }
}

export class LikeStore {
  constructor(ctx) {
    this.ctx = ctx
  }

  async fetch(request) {
    const url = new URL(request.url)
    const postId = decodeURIComponent(url.pathname.replace(/^\//, ''))
    if (!validPostId(postId)) {
      return new Response(JSON.stringify({ error: 'Invalid post id' }), { status: 400 })
    }

    if (request.method === 'GET') {
      const visitor = normalizeVisitor(url.searchParams.get('visitor'))
      const count = await this.getOrSeedCount(postId)
      const liked = visitor ? Boolean(await this.ctx.storage.get(voterKey(postId, visitor))) : false
      return internalJson({ likes: count, liked })
    }

    if (request.method === 'POST') {
      const body = await safeJson(request)
      const visitor = normalizeVisitor(body?.visitor)
      if (!visitor) {
        return internalJson({ error: 'A visitor id is required' }, 400)
      }

      let count = await this.getOrSeedCount(postId)
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

    if (request.method === 'PUT') {
      const body = await safeJson(request)
      const seed = Number(body?.seed)
      if (!Number.isFinite(seed) || seed < 0) {
        return internalJson({ error: 'Invalid seed' }, 400)
      }
      const existing = await this.ctx.storage.get(countKey(postId))
      if (existing === undefined) {
        await this.ctx.storage.put(countKey(postId), Math.round(seed))
        return internalJson({ likes: Math.round(seed), seeded: true })
      }
      return internalJson({ likes: Number(existing) || 0, seeded: false })
    }

    return internalJson({ error: 'Method not allowed' }, 405)
  }

  async getOrSeedCount(postId) {
    const key = countKey(postId)
    const existing = await this.ctx.storage.get(key)
    if (existing !== undefined) return Number(existing) || 0

    const legacy = await fetchLegacyLike(postId)
    await this.ctx.storage.put(key, legacy)
    return legacy
  }
}

async function handleLikeRequest(request, env, url) {
  if (!env.LIKES) {
    return json({ error: 'Likes storage is not configured' }, 500, request)
  }

  const postId = decodeURIComponent(url.pathname.slice('/likes/'.length))
  if (!validPostId(postId)) {
    return json({ error: 'Invalid post id' }, 400, request)
  }

  if (!['GET', 'POST'].includes(request.method)) {
    return json({ error: 'Method not allowed' }, 405, request)
  }

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

async function importLyketLikes(request, env) {
  if (!env.LIKES) {
    return json({ error: 'Likes storage is not configured' }, 500, request)
  }

  try {
    const response = await fetch(`${LYKET_API}/rank/like-buttons/${LYKET_NAMESPACE}`, {
      headers: {
        Authorization: `Bearer ${LYKET_PUBLIC_KEY}`,
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      return json({ error: `Lyket API returned ${response.status}` }, 502, request)
    }

    const payload = await response.json()
    const buttons = extractButtons(payload)
    const objectId = env.LIKES.idFromName(LIKE_STORE_NAME)
    const stub = env.LIKES.get(objectId)
    let imported = 0
    const items = []

    for (const button of buttons) {
      const postId = button?.id
      const likes = Number(button?.attributes?.totalLikes ?? button?.totalLikes ?? 0)
      if (!validPostId(postId) || !Number.isFinite(likes) || likes < 0) continue

      const seedResponse = await stub.fetch(new Request(`https://likes.internal/${encodeURIComponent(postId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: likes })
      }))
      const seeded = await seedResponse.json()
      if (seeded.seeded) imported += 1
      items.push({ id: postId, likes: seeded.likes })
    }

    return json({ imported, found: buttons.length, items }, 200, request, 0)
  } catch (error) {
    return json({ error: error.message || 'Unable to import Lyket likes' }, 500, request, 0)
  }
}

async function fetchLegacyLike(postId) {
  try {
    const response = await fetch(`${LYKET_API}/like-buttons/${LYKET_NAMESPACE}/${encodeURIComponent(postId)}`, {
      headers: {
        Authorization: `Bearer ${LYKET_PUBLIC_KEY}`,
        Accept: 'application/json'
      }
    })
    if (!response.ok) return 0
    const payload = await response.json()
    const button = payload?.data || payload
    const likes = Number(button?.attributes?.totalLikes ?? button?.totalLikes ?? 0)
    return Number.isFinite(likes) && likes >= 0 ? Math.round(likes) : 0
  } catch (_) {
    return 0
  }
}

function extractButtons(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.data?.items,
    payload?.data?.attributes?.ranking,
    payload?.attributes?.ranking,
    payload?.ranking
  ]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
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
  try {
    return await request.json()
  } catch (_) {
    return null
  }
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

function mergeBy(rows = [], keyFn, valueFn) {
  const totals = new Map()
  for (const row of rows || []) {
    const key = keyFn(row)
    if (!key) continue
    totals.set(key, (totals.get(key) || 0) + valueFn(row))
  }
  return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
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
