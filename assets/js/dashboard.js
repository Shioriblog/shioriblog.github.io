(() => {
  const config = window.SHIO_STATS_CONFIG || {}
  const endpoint = config.endpoint || ''
  const twikooEnvId = config.twikooEnvId || ''
  const titles = config.titles || {}
  const categoriesByPath = config.categories || {}
  const likeIdsByPath = config.likeIds || {}
  const siteHost = 'shioriblog.org'

  const setup = document.getElementById('stats-setup')
  const errorBox = document.getElementById('stats-error')
  const views = document.getElementById('stat-views')
  const visits = document.getElementById('stat-visits')
  const pagesPerVisit = document.getElementById('stat-pages-per-visit')
  const viewsChange = document.getElementById('stat-views-change')
  const visitsChange = document.getElementById('stat-visits-change')
  const pagesPerVisitChange = document.getElementById('stat-pages-per-visit-change')
  const chart = document.getElementById('stats-chart')
  const periodLabel = document.getElementById('stats-period-label')
  const posts = document.getElementById('stats-posts')
  const referrers = document.getElementById('stats-referrers')
  const sources = document.getElementById('stats-sources')
  const categories = document.getElementById('stats-categories')
  const sitePages = document.getElementById('stats-site-pages')
  const countries = document.getElementById('stats-countries')
  const comments = document.getElementById('stats-comments')
  const rangeButtons = Array.from(document.querySelectorAll('[data-days]'))

  const responseMostRead = document.getElementById('response-most-read')
  const responseMostReadMeta = document.getElementById('response-most-read-meta')
  const responseMostLiked = document.getElementById('response-most-liked')
  const responseMostLikedMeta = document.getElementById('response-most-liked-meta')
  const responseLikeRate = document.getElementById('response-like-rate')
  const responseLikeRateMeta = document.getElementById('response-like-rate-meta')

  const number = new Intl.NumberFormat('en-US')
  const regionNames = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null

  const countryFlag = (code) => {
    if (!/^[A-Z]{2}$/.test(code)) return '🌐'
    return String.fromCodePoint(...code.split('').map((char) => 127397 + char.charCodeAt(0)))
  }

  const formatCountry = (label) => {
    const raw = String(label || '').trim()
    const code = raw.toUpperCase()
    if (/^[A-Z]{2}$/.test(code)) {
      let name = raw
      try { name = regionNames?.of(code) || raw } catch (_) { name = raw }
      return `${countryFlag(code)} ${name}`
    }
    if (!raw || raw === 'Unknown') return '🌐 Unknown'
    return raw
  }

  const clearLists = () => {
    ;[posts, referrers, sources, categories, sitePages, countries].forEach((list) => { list.innerHTML = '' })
    chart.innerHTML = ''
  }

  const showEmpty = (list) => {
    const item = document.createElement('li')
    item.className = 'stats-empty'
    item.textContent = '暂无数据'
    list.appendChild(item)
  }

  const pathLabel = (path) => titles[path] || decodeURIComponent(path).replace(/\/$/, '') || '/'

  const addItems = (list, items, options = {}) => {
    const { link = false, country = false, value = 'views', dual = false, triple = false } = options
    list.innerHTML = ''
    if (!items?.length) {
      showEmpty(list)
      return
    }

    items.slice(0, 10).forEach((item) => {
      const li = document.createElement('li')
      let label = item.label || '—'
      if (country) label = formatCountry(label)

      if (link) {
        const anchor = document.createElement('a')
        anchor.href = item.label
        anchor.textContent = pathLabel(item.label)
        anchor.title = item.label
        li.appendChild(anchor)
      } else {
        const span = document.createElement('span')
        span.textContent = label
        li.appendChild(span)
      }

      const metric = document.createElement('span')
      metric.className = 'stats-value'
      if (triple) {
        metric.textContent = `${number.format(item.views || 0)} · ${number.format(item.visits || 0)} · ♥ ${number.format(item.likes || 0)}`
      } else if (dual) {
        metric.textContent = `${number.format(item.views || 0)} · ${number.format(item.visits || 0)}`
      } else {
        metric.textContent = number.format(item[value] || 0)
      }
      li.appendChild(metric)
      list.appendChild(li)
    })
  }

  const drawChart = (series) => {
    chart.innerHTML = ''
    if (!series?.length) {
      const empty = document.createElement('p')
      empty.className = 'stats-empty'
      empty.textContent = '暂无数据'
      chart.appendChild(empty)
      return
    }

    const ordered = [...series].sort((a, b) => String(a.date).localeCompare(String(b.date)))
    const max = Math.max(...ordered.map((item) => item.views), 1)
    ordered.forEach((item) => {
      const node = document.createElement('div')
      node.className = 'stats-bar-item'
      node.title = `${item.date}: ${number.format(item.views)} views`

      const wrap = document.createElement('div')
      wrap.className = 'stats-bar-wrap'
      const bar = document.createElement('div')
      bar.className = 'stats-bar'
      bar.style.height = `${Math.max(2, (item.views / max) * 100)}%`
      wrap.appendChild(bar)

      const time = document.createElement('time')
      time.dateTime = item.date
      const date = new Date(`${item.date}T12:00:00Z`)
      time.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

      node.appendChild(wrap)
      node.appendChild(time)
      chart.appendChild(node)
    })
  }

  const pctChange = (current, previous) => {
    if (previous == null || !Number.isFinite(Number(previous))) return null
    if (Number(previous) === 0) return Number(current) === 0 ? 0 : null
    return ((Number(current) - Number(previous)) / Number(previous)) * 100
  }

  const setChange = (node, current, previous, label) => {
    const change = pctChange(current, previous)
    node.classList.remove('is-up', 'is-down')
    if (change == null) {
      node.textContent = label ? `— ${label}` : ''
      return
    }
    const rounded = Math.round(change)
    const arrow = rounded > 0 ? '↑' : rounded < 0 ? '↓' : '→'
    node.textContent = `${arrow} ${Math.abs(rounded)}% ${label}`
    if (rounded > 0) node.classList.add('is-up')
    if (rounded < 0) node.classList.add('is-down')
  }

  const normalizeHost = (host) => String(host || '').trim().toLowerCase().replace(/^www\./, '')

  const externalReferrers = (items) => (items || []).filter((item) => {
    const host = normalizeHost(item.label)
    return !host || host !== siteHost
  })

  const sourceType = (label) => {
    const host = normalizeHost(label)
    if (!host || host === 'direct') return 'Direct'

    const searchHosts = ['google.', 'bing.com', 'duckduckgo.com', 'yahoo.', 'baidu.com', 'yandex.']
    if (searchHosts.some((needle) => host.includes(needle))) return 'Search'

    const socialHosts = [
      'douban.com', 'mastodon.', 'bsky.app', 'facebook.com', 'instagram.com', 'threads.net',
      'twitter.com', 'x.com', 'weibo.com', 'reddit.com', 't.co', 'linkedin.com'
    ]
    if (socialHosts.some((needle) => host.includes(needle))) return 'Social'

    return 'Other websites'
  }

  const groupSources = (items) => {
    const totals = new Map()
    externalReferrers(items).forEach((item) => {
      const label = sourceType(item.label)
      totals.set(label, (totals.get(label) || 0) + Number(item.visits || 0))
    })
    const order = ['Direct', 'Search', 'Social', 'Other websites']
    return order.map((label) => ({ label, visits: totals.get(label) || 0 })).filter((item) => item.visits > 0)
  }

  const splitPages = (items, likes) => {
    const postRows = []
    const siteRows = []
    ;(items || []).forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(titles, item.label)) {
        const likeId = likeIdsByPath[item.label]
        postRows.push({ ...item, likes: Number(likes?.[likeId] || 0) })
      } else {
        siteRows.push(item)
      }
    })
    postRows.sort((a, b) => b.views - a.views)
    siteRows.sort((a, b) => b.views - a.views)
    return { postRows, siteRows }
  }

  const categoryRows = (pageItems) => {
    const totals = new Map()
    ;(pageItems || []).forEach((item) => {
      const postCategories = categoriesByPath[item.label]
      if (!Array.isArray(postCategories)) return
      postCategories.forEach((category) => {
        if (category === '食べたり、歩いたり') return
        totals.set(category, (totals.get(category) || 0) + Number(item.views || 0))
      })
    })
    return Array.from(totals.entries())
      .map(([label, views]) => ({ label, views }))
      .sort((a, b) => b.views - a.views)
  }

  const setResponseCard = (link, meta, row, text) => {
    if (!row) {
      link.textContent = '—'
      link.removeAttribute('href')
      meta.textContent = '暂无数据'
      return
    }
    link.href = row.label
    link.textContent = pathLabel(row.label)
    meta.textContent = text(row)
  }

  const renderReaderResponse = (postRows) => {
    const mostRead = postRows[0]
    const mostLiked = [...postRows].sort((a, b) => (b.likes - a.likes) || (b.views - a.views))[0]
    const likeRateRows = postRows
      .filter((row) => row.views >= 5 && row.likes > 0)
      .map((row) => ({ ...row, likeDensity: (row.likes / row.views) * 100 }))
      .sort((a, b) => b.likeDensity - a.likeDensity)
    const highestDensity = likeRateRows[0]

    setResponseCard(responseMostRead, responseMostReadMeta, mostRead,
      (row) => `${number.format(row.views)} views · ${number.format(row.visits)} visits`)
    setResponseCard(responseMostLiked, responseMostLikedMeta, mostLiked,
      (row) => `♥ ${number.format(row.likes)} cumulative likes`)
    setResponseCard(responseLikeRate, responseLikeRateMeta, highestDensity,
      (row) => `${row.likeDensity.toFixed(1)} likes / 100 selected-period views`)
  }


  const plainComment = (html) => {
    const box = document.createElement('div')
    box.innerHTML = String(html || '')
    box.querySelectorAll('img').forEach((node) => node.replaceWith(document.createTextNode(' [图片] ')))
    box.querySelectorAll('pre').forEach((node) => node.replaceWith(document.createTextNode(' [代码] ')))
    return (box.textContent || '').replace(/\s+/g, ' ').trim()
  }

  const commentPath = (value) => {
    try {
      return new URL(value || '/', window.location.origin).pathname
    } catch (_) {
      return String(value || '/').split('#')[0].split('?')[0] || '/'
    }
  }

  const titleForComment = (path) => {
    if (titles[path]) return titles[path]
    try {
      const decoded = decodeURIComponent(path)
      if (titles[decoded]) return titles[decoded]
    } catch (_) {}
    return pathLabel(path)
  }

  const relativeTime = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const seconds = (date.getTime() - Date.now()) / 1000
    const abs = Math.abs(seconds)
    const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })

    if (abs < 60) return rtf.format(Math.round(seconds), 'second')
    if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute')
    if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour')
    if (abs < 604800) return rtf.format(Math.round(seconds / 86400), 'day')
    if (abs < 2592000) return rtf.format(Math.round(seconds / 604800), 'week')
    if (abs < 31536000) return rtf.format(Math.round(seconds / 2592000), 'month')
    return rtf.format(Math.round(seconds / 31536000), 'year')
  }

  const renderRecentComments = (items) => {
    comments.innerHTML = ''
    if (!items?.length) {
      const empty = document.createElement('li')
      empty.className = 'stats-comments-empty'
      empty.textContent = '暂无留言'
      comments.appendChild(empty)
      return
    }

    items.slice(0, 8).forEach((item) => {
      const path = commentPath(item.url)
      const href = item.id ? `${path}#${item.id}` : path

      const li = document.createElement('li')
      li.className = 'stats-comment-item'

      const meta = document.createElement('div')
      meta.className = 'stats-comment-meta'

      const nick = document.createElement('span')
      nick.className = 'stats-comment-nick'
      nick.textContent = item.nick || 'Anonymous'

      const time = document.createElement('time')
      time.className = 'stats-comment-time'
      time.dateTime = item.created || ''
      time.textContent = relativeTime(item.created)

      meta.append(nick, time)

      const textLink = document.createElement('a')
      textLink.className = 'stats-comment-text'
      textLink.href = href
      textLink.textContent = plainComment(item.comment) || '（空留言）'

      const postLink = document.createElement('a')
      postLink.className = 'stats-comment-post'
      postLink.href = href
      postLink.textContent = `→ ${titleForComment(path)}`

      li.append(meta, textLink, postLink)
      comments.appendChild(li)
    })
  }

  const loadRecentComments = async () => {
    if (!comments) return

    if (!twikooEnvId || typeof window.twikoo?.getRecentComments !== 'function') {
      comments.innerHTML = '<li class="stats-comments-empty">留言暂时无法读取</li>'
      return
    }

    try {
      const items = await window.twikoo.getRecentComments({
        envId: twikooEnvId,
        pageSize: 8,
        includeReply: true
      })
      renderRecentComments(items)
    } catch (error) {
      console.warn('Unable to load recent comments', error)
      comments.innerHTML = '<li class="stats-comments-empty">留言读取失败</li>'
    }
  }

  const render = (data) => {
    const currentPpv = data.visits ? data.views / data.visits : null
    const previousPpv = data.previous?.pagesPerVisit

    views.textContent = number.format(data.views || 0)
    visits.textContent = number.format(data.visits || 0)
    pagesPerVisit.textContent = currentPpv == null ? '—' : currentPpv.toFixed(2)
    periodLabel.textContent = data.label || ''

    setChange(viewsChange, data.views || 0, data.previous?.views, data.comparisonLabel || '')
    setChange(visitsChange, data.visits || 0, data.previous?.visits, data.comparisonLabel || '')
    setChange(pagesPerVisitChange, currentPpv || 0, previousPpv, data.comparisonLabel || '')

    drawChart(data.series || [])

    const { postRows, siteRows } = splitPages(data.pages || [], data.likes || {})
    renderReaderResponse(postRows)
    addItems(posts, postRows, { link: true, triple: true })
    addItems(sitePages, siteRows, { link: true, dual: true })

    const external = externalReferrers(data.referrers || [])
      .sort((a, b) => (b.visits - a.visits) || (b.views - a.views))
    addItems(referrers, external, { value: 'visits' })
    addItems(sources, groupSources(data.referrers || []), { value: 'visits' })
    addItems(categories, categoryRows(data.pages || []), { value: 'views' })
    addItems(countries, data.countries || [], { country: true, value: 'views' })
  }

  const load = async (days) => {
    errorBox.hidden = true
    rangeButtons.forEach((button) => {
      button.classList.toggle('is-active', Number(button.dataset.days) === days)
      button.disabled = true
    })

    try {
      const response = await fetch(`${endpoint}?days=${days}`, { headers: { Accept: 'application/json' } })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`)
      render(payload)
    } catch (error) {
      clearLists()
      errorBox.textContent = `读取统计失败：${error.message}`
      errorBox.hidden = false
    } finally {
      rangeButtons.forEach((button) => { button.disabled = false })
    }
  }

  rangeButtons.forEach((button) => {
    button.addEventListener('click', () => load(Number(button.dataset.days)))
  })

  loadRecentComments()

  if (!endpoint) {
    setup.hidden = false
    clearLists()
    ;[posts, referrers, sources, categories, sitePages, countries].forEach(showEmpty)
    return
  }

  load(7)
})()
