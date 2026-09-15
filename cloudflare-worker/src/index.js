const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql'
const SITE_HOST = 'shioriblog.org'
const ALLOWED_ORIGIN = 'https://shioriblog.org'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) })
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

function corsHeaders(request) {
  const origin = request.headers.get('Origin')
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'public, max-age=300'
  }
}

function json(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8'
    }
  })
}
