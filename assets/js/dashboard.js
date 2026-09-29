(() => {
  const config = window.SHIO_STATS_CONFIG || {}
  const endpoint = config.endpoint || ''
  const twikooEnvId = config.twikooEnvId || ''

  const normalizePath = (value) => {
    const raw = String(value || '').trim()
    if (!raw) return '/'

    let path = raw
    try {
      path = new URL(raw, window.location.origin).pathname
    } catch (_) {
      path = raw.split('#')[0].split('?')[0]
    }

    try { path = decodeURIComponent(path) } catch (_) {}
    if (!path.startsWith('/')) path = `/${path}`
    path = path.replace(/\/{2,}/g, '/')
    if (path.length > 1) path = path.replace(/\/+$/, '')
    return path || '/'
  }

  const normalizePathMap = (map) => Object.fromEntries(
    Object.entries(map || {}).map(([path, value]) => [normalizePath(path), value])
  )

  const titles = normalizePathMap(config.titles)
  const categoriesByPath = normalizePathMap(config.categories)
  const likeIdsByPath = normalizePathMap(config.likeIds)
  const validPaths = new Set((config.validPaths || []).map(normalizePath))
  const datesByPath = normalizePathMap(config.dates)
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
  const recentPosts = document.getElementById('stats-recent-posts')
  const referrers = document.getElementById('stats-referrers')
  const sources = document.getElementById('stats-sources')
  const categories = document.getElementById('stats-categories')
  const sitePages = document.getElementById('stats-site-pages')
  const sitePagesToggle = document.getElementById('stats-site-pages-toggle')
  const countries = document.getElementById('stats-countries')
  const postAge = document.getElementById('stats-post-age')
  const referrerPosts = document.getElementById('stats-referrer-posts')
  const comments = document.getElementById('stats-comments')
  const rangeButtons = Array.from(document.querySelectorAll('[data-days]'))

  const responseMostLiked = document.getElementById('response-most-liked')
  const responseMostLikedMeta = document.getElementById('response-most-liked-meta')
  const periodDetails = document.getElementById('stats-period-details')
  const readerOnly = document.getElementById('stats-comments-reader-only')
  const commentsNote = document.getElementById('stats-comments-note')
  const siteTimeZone = 'America/Chicago'

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
    ;[posts, recentPosts, referrers, sources, categories, sitePages, countries, postAge, referrerPosts].forEach((list) => {
      if (list) list.innerHTML = ''
    })
    chart.innerHTML = ''
  }

  const showEmpty = (list) => {
    const item = document.createElement(list.tagName === 'TBODY' ? 'tr' : 'li')
    if (list.tagName === 'TBODY') {
      const cell = document.createElement('td')
      cell.colSpan = 4
      cell.className = 'stats-empty'
      cell.textContent = '暂无数据'
      item.appendChild(cell)
    } else {
      item.className = 'stats-empty'
      item.textContent = '暂无数据'
    }
    list.appendChild(item)
  }

  const pathLabel = (path) => {
    const normalized = normalizePath(path)
    return titles[normalized] || normalized || '/'
  }

  const normalizePageItems = (items) => {
    const totals = new Map()
    ;(items || []).forEach((item) => {
      const label = normalizePath(item.label)
      const existing = totals.get(label) || { label, views: 0, visits: 0 }
      existing.views += Number(item.views || 0)
      existing.visits += Number(item.visits || 0)
      totals.set(label, existing)
    })
    return Array.from(totals.values())
  }

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
        if (item.rawHosts) span.title = item.rawHosts.join('、')
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


  const renderPostTable = (body, rows, withDates = false, likesAvailable = true) => {
    body.innerHTML = ''
    if (!rows?.length) return showEmpty(body)
    rows.slice(0, 10).forEach((row) => {
      const tr = document.createElement('tr')
      const title = document.createElement('td')
      const link = document.createElement('a')
      link.href = row.label
      link.textContent = pathLabel(row.label)
      title.appendChild(link)
      if (withDates && datesByPath[row.label]) {
        const date = new Date(datesByPath[row.label])
        if (!Number.isNaN(date.getTime())) {
          const time = document.createElement('time')
          time.dateTime = date.toISOString()
          time.textContent = date.toLocaleDateString('zh-CN', { timeZone: siteTimeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
          title.appendChild(time)
        }
      }
      tr.appendChild(title)
      ;['views', 'visits', 'likes'].forEach((key) => {
        const cell = document.createElement('td')
        cell.textContent = key === 'likes' && !likesAvailable ? '—' : number.format(row[key] || 0)
        tr.appendChild(cell)
      })
      body.appendChild(tr)
    })
  }

  let showArchivedSitePages = false
  let cachedSitePages = []

  const isCurrentSitePath = (path) => {
    const normalized = normalizePath(path)
    if (validPaths.has(normalized)) return true
    return /^\/page\/\d+$/.test(normalized)
  }

  const renderSitePages = (items) => {
    cachedSitePages = items || []
    const current = cachedSitePages.filter((item) => isCurrentSitePath(item.label))
    const archived = cachedSitePages.filter((item) => !isCurrentSitePath(item.label))
    const visible = showArchivedSitePages ? [...current, ...archived] : current

    sitePages.innerHTML = ''
    if (!visible.length) {
      showEmpty(sitePages)
    } else {
      visible.slice(0, 10).forEach((item) => {
        const archivedPath = !isCurrentSitePath(item.label)
        const li = document.createElement('li')
        if (archivedPath) li.classList.add('is-archived')

        const left = document.createElement(archivedPath ? 'span' : 'a')
        if (!archivedPath) left.href = item.label
        left.textContent = pathLabel(item.label)
        left.title = item.label

        if (archivedPath) {
          const badge = document.createElement('small')
          badge.className = 'stats-page-status'
          badge.textContent = '404 / old'
          left.appendChild(badge)
        }

        const metric = document.createElement('span')
        metric.className = 'stats-value'
        metric.textContent = `${number.format(item.views || 0)} · ${number.format(item.visits || 0)}`

        li.append(left, metric)
        sitePages.appendChild(li)
      })
    }

    if (sitePagesToggle) {
      sitePagesToggle.hidden = archived.length === 0
      sitePagesToggle.textContent = showArchivedSitePages ? 'Hide archived / 404' : `Show archived / 404 (${archived.length})`
    }
  }

  if (sitePagesToggle) {
    sitePagesToggle.addEventListener('click', () => {
      showArchivedSitePages = !showArchivedSitePages
      renderSitePages(cachedSitePages)
    })
  }

  const drawChart = (series, range = {}) => {
    chart.innerHTML = ''
    if (!series?.length) {
      const empty = document.createElement('p')
      empty.className = 'stats-empty'
      empty.textContent = '暂无数据'
      chart.appendChild(empty)
      return
    }

    chart.classList.toggle('is-dense', series.length > 12)
    const startDay = String(range.startDate || '')
    const endDay = String(range.endDate || '')
    const ordered = [...series].sort((a, b) => String(a.date).localeCompare(String(b.date)))
    const max = Math.max(...ordered.map((item) => item.views), 1)
    ordered.forEach((item) => {
      const node = document.createElement('div')
      node.className = 'stats-bar-item'
      const partial = item.date === startDay || item.date === endDay
      node.classList.toggle('is-partial', partial)
      node.dataset.tooltip = `${item.date} · ${number.format(item.views)} 次${partial ? '（部分时段）' : ''}`
      node.setAttribute('aria-label', node.dataset.tooltip)
      node.tabIndex = 0

      const wrap = document.createElement('div')
      wrap.className = 'stats-bar-wrap'
      const bar = document.createElement('div')
      bar.className = 'stats-bar'
      bar.style.height = `${Math.max(2, (item.views / max) * 100)}%`
      wrap.appendChild(bar)

      const time = document.createElement('time')
      time.dateTime = item.date
      const [, month, day] = String(item.date).split('-')
      time.textContent = `${Number(month)}/${Number(day)}`

      node.appendChild(wrap)
      node.appendChild(time)
      chart.appendChild(node)
    })
  }

  const pctChange = (current, previous) => {
    if (current == null || previous == null || !Number.isFinite(Number(current)) || !Number.isFinite(Number(previous))) return null
    if (Number(previous) === 0) return Number(current) === 0 ? 0 : null
    return ((Number(current) - Number(previous)) / Number(previous)) * 100
  }

  const setChange = (node, current, previous, label) => {
    const change = pctChange(current, previous)
    node.classList.remove('is-up', 'is-down')
    if (change == null) {
      node.textContent = '暂无可比数据'
      return
    }
    const rounded = Math.round(change)
    const arrow = rounded > 0 ? '↑' : rounded < 0 ? '↓' : '→'
    node.textContent = `${arrow} ${Math.abs(rounded)}% ${label}`
    if (rounded > 0) node.classList.add('is-up')
    if (rounded < 0) node.classList.add('is-down')
  }

  const normalizeHost = (host) => String(host || '').trim().toLowerCase().replace(/^www\./, '')

  const isMailHost = (host) => /(^|\.)sendib[mt]\d*\.com$/.test(host)
  const sourceKey = (label) => {
    const host = normalizeHost(label)
    if (!host || host === 'direct') return 'direct'
    return isMailHost(host) ? 'brevo-email' : host
  }
  const sourceLabel = (key) => ({
    direct: '直接 / 未知来源',
    'douban.com': '豆瓣',
    'brevo-email': '邮件订阅（Brevo）'
  }[key] || key)

  const externalReferrers = (items) => (items || []).filter((item) => normalizeHost(item.label) !== siteHost)

  const mergeReferrers = (items) => {
    const totals = new Map()
    externalReferrers(items).forEach((item) => {
      const key = sourceKey(item.label)
      const row = totals.get(key) || { key, label: sourceLabel(key), views: 0, visits: 0, rawHosts: [] }
      row.views += Number(item.views || 0)
      row.visits += Number(item.visits || 0)
      if (!row.rawHosts.includes(item.label)) row.rawHosts.push(item.label || 'Direct')
      totals.set(key, row)
    })
    return [...totals.values()].sort((a, b) => b.visits - a.visits || b.views - a.views)
  }

  const sourceType = (label) => {
    const host = normalizeHost(label)
    if (!host || host === 'direct') return '直接 / 未知来源'
    if (isMailHost(host)) return '邮件订阅'
    const searchHosts = ['google.', 'bing.com', 'duckduckgo.com', 'yahoo.', 'baidu.com', 'yandex.']
    if (searchHosts.some((needle) => host.includes(needle))) return '搜索引擎'
    const socialHosts = ['douban.com', 'mastodon.', 'bsky.app', 'facebook.com', 'instagram.com', 'threads.net', 'twitter.com', 'x.com', 'weibo.com', 'reddit.com', 't.co', 'linkedin.com']
    if (socialHosts.some((needle) => host.includes(needle))) return '社交网站'
    return '其他网站'
  }

  const groupSources = (items) => {
    const totals = new Map()
    externalReferrers(items).forEach((item) => {
      const label = sourceType(item.label)
      totals.set(label, (totals.get(label) || 0) + Number(item.visits || 0))
    })
    return [...totals].map(([label, visits]) => ({ label, visits })).filter((item) => item.visits > 0).sort((a, b) => b.visits - a.visits)
  }

  const splitPages = (items, likes) => {
    const postRows = []
    const siteRows = []
    normalizePageItems(items).forEach((item) => {
      const path = normalizePath(item.label)
      if (Object.prototype.hasOwnProperty.call(titles, path)) {
        const likeId = likeIdsByPath[path]
        postRows.push({ ...item, label: path, likes: Number(likes?.[likeId] || 0) })
      } else {
        siteRows.push({ ...item, label: path })
      }
    })
    postRows.sort((a, b) => b.views - a.views)
    siteRows.sort((a, b) => b.views - a.views)
    return { postRows, siteRows }
  }

  const recentPostRows = (pageItems, likes) => {
    const pageMap = new Map(normalizePageItems(pageItems).map((item) => [normalizePath(item.label), item]))
    return Object.keys(datesByPath)
      .sort((a, b) => new Date(datesByPath[b]) - new Date(datesByPath[a]))
      .slice(0, 5)
      .map((path) => {
        const normalized = normalizePath(path)
        const item = pageMap.get(normalized) || {}
        const likeId = likeIdsByPath[normalized]
        return {
          label: normalized,
          views: Number(item.views || 0),
          visits: Number(item.visits || 0),
          likes: Number(likes?.[likeId] || 0)
        }
      })
  }

  const categoryRows = (pageItems) => {
    const totals = new Map()
    const postsPerCategory = new Map()

    Object.entries(categoriesByPath).forEach(([path, postCategories]) => {
      if (!Array.isArray(postCategories)) return
      postCategories.forEach((category) => {
        if (category === '食べたり、歩いたり') return
        if (!postsPerCategory.has(category)) postsPerCategory.set(category, new Set())
        postsPerCategory.get(category).add(path)
      })
    })

    normalizePageItems(pageItems).forEach((item) => {
      const postCategories = categoriesByPath[normalizePath(item.label)]
      if (!Array.isArray(postCategories)) return
      postCategories.forEach((category) => {
        if (category === '食べたり、歩いたり') return
        totals.set(category, (totals.get(category) || 0) + Number(item.views || 0))
      })
    })

    return Array.from(postsPerCategory.entries())
      .map(([label, paths]) => {
        const views = totals.get(label) || 0
        const postCount = paths.size || 0
        return { label, views, avgPerPost: postCount ? views / postCount : 0, postCount }
      })
      .sort((a, b) => b.views - a.views)
  }

  const renderCategoryRows = (items) => {
    categories.innerHTML = ''
    if (!items?.length) {
      showEmpty(categories)
      return
    }

    items.slice(0, 10).forEach((item) => {
      const li = document.createElement('li')
      const label = document.createElement('span')
      label.textContent = item.label
      const metric = document.createElement('span')
      metric.className = 'stats-value'
      metric.textContent = `${number.format(item.views || 0)} · ${item.avgPerPost.toFixed(1)} avg/post`
      li.append(label, metric)
      categories.appendChild(li)
    })
  }

  const postAgeRows = (postRows) => {
    const now = Date.now()
    const buckets = [
      { label: '≤ 7 days', min: 0, max: 7 },
      { label: '8–30 days', min: 8, max: 30 },
      { label: '1–6 months', min: 31, max: 183 },
      { label: '6–12 months', min: 184, max: 365 },
      { label: '> 1 year', min: 366, max: Infinity }
    ]

    const rows = buckets.map((bucket) => ({ ...bucket, views: 0 }))
    ;(postRows || []).forEach((row) => {
      const published = new Date(datesByPath[row.label] || '')
      if (Number.isNaN(published.getTime())) return
      const ageDays = Math.max(0, Math.floor((now - published.getTime()) / 86400000))
      const bucket = rows.find((item) => ageDays >= item.min && ageDays <= item.max)
      if (bucket) bucket.views += Number(row.views || 0)
    })

    const total = rows.reduce((sum, row) => sum + row.views, 0)
    return rows.map((row) => ({
      label: row.label,
      views: row.views,
      share: total ? (row.views / total) * 100 : 0
    }))
  }

  const renderPostAge = (items) => {
    postAge.innerHTML = ''
    if (!items?.some((item) => item.views > 0)) {
      showEmpty(postAge)
      return
    }
    items.forEach((item) => {
      const li = document.createElement('li')
      const label = document.createElement('span')
      label.textContent = item.label
      const metric = document.createElement('span')
      metric.className = 'stats-value'
      metric.textContent = `${number.format(item.views)} · ${item.share.toFixed(0)}%`
      li.append(label, metric)
      postAge.appendChild(li)
    })
  }

  const renderReferrerPosts = (items) => {
    referrerPosts.innerHTML = ''
    const totals = new Map()
    ;(items || []).forEach((item) => {
      const path = normalizePath(item.path)
      if (!Object.prototype.hasOwnProperty.call(titles, path) || normalizeHost(item.referrer) === siteHost) return
      const source = sourceKey(item.referrer)
      const key = `${path}\u0000${source}`
      const row = totals.get(key) || { path, referrer: sourceLabel(source), views: 0, visits: 0, rawHosts: [] }
      row.views += Number(item.views || 0)
      row.visits += Number(item.visits || 0)
      if (!row.rawHosts.includes(item.referrer)) row.rawHosts.push(item.referrer || 'Direct')
      totals.set(key, row)
    })
    const filtered = [...totals.values()].sort((a, b) => b.visits - a.visits || b.views - a.views).slice(0, 10)

    if (!filtered.length) {
      showEmpty(referrerPosts)
      return
    }

    filtered.forEach((item) => {
      const li = document.createElement('li')
      const left = document.createElement('span')
      const source = document.createElement('span')
      source.className = 'stats-source-label'
      source.textContent = item.referrer
      source.title = item.rawHosts.join('、')
      const arrow = document.createTextNode(' → ')
      const link = document.createElement('a')
      link.href = normalizePath(item.path)
      link.textContent = pathLabel(item.path)
      left.append(source, arrow, link)

      const metric = document.createElement('span')
      metric.className = 'stats-value'
      metric.textContent = number.format(item.visits || 0)

      li.append(left, metric)
      referrerPosts.appendChild(li)
    })
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

  const renderReaderResponse = (likes, available = true) => {
    const mostLiked = Object.keys(titles)
      .map((path) => ({ label: path, likes: Number(likes?.[likeIdsByPath[path]] || 0) }))
      .filter((row) => row.likes > 0)
      .sort((a, b) => b.likes - a.likes || a.label.localeCompare(b.label))[0]
    setResponseCard(responseMostLiked, responseMostLikedMeta, available ? mostLiked : null,
      (row) => `♥ ${number.format(row.likes)} 次累计点赞`)
    if (!available) responseMostLikedMeta.textContent = '点赞暂时无法读取'
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
    const normalized = normalizePath(path)
    return titles[normalized] || pathLabel(normalized)
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

  let cachedComments = []
  const authorNames = new Set((config.commentAuthorNames || []).map((name) => name.replace(/\s+/g, '').toLowerCase()))
  const isAuthorComment = (item) => item.master === true || item.master === 1 || authorNames.has(String(item.nick || '').replace(/\s+/g, '').toLowerCase())

  const renderRecentComments = () => {
    comments.innerHTML = ''
    const items = readerOnly?.checked ? cachedComments.filter((item) => !isAuthorComment(item)) : cachedComments
    commentsNote.textContent = `最新 ${Math.min(items.length, 8)} 条 · ${readerOnly?.checked ? '已隐藏博主留言' : '包含博主回复'} · 不随上方时段切换`
    if (!items.length) {
      const empty = document.createElement('li')
      empty.className = 'stats-comments-empty'
      empty.textContent = readerOnly?.checked ? '最近暂无读者留言' : '暂无留言'
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
      const created = new Date(item.created)
      if (!Number.isNaN(created.getTime())) time.dateTime = created.toISOString()
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

  readerOnly?.addEventListener('change', renderRecentComments)

  const loadRecentComments = async () => {
    if (!comments) return
    if (readerOnly) readerOnly.disabled = true

    if (!twikooEnvId || typeof window.twikoo?.getRecentComments !== 'function') {
      comments.innerHTML = '<li class="stats-comments-empty">留言暂时无法读取</li>'
      commentsNote.textContent = ''
      return
    }

    try {
      const items = await window.twikoo.getRecentComments({
        envId: twikooEnvId,
        pageSize: 100,
        includeReply: true
      })
      cachedComments = Array.isArray(items) ? items : []
      renderRecentComments()
      if (readerOnly) readerOnly.disabled = false
    } catch (error) {
      console.warn('Unable to load recent comments', error)
      comments.innerHTML = '<li class="stats-comments-empty">留言读取失败</li>'
      commentsNote.textContent = ''
    }
  }

  const render = (data, days) => {
    const range = data.range || {}
    const formatTime = (value) => new Date(value).toLocaleString('zh-CN', { timeZone: siteTimeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
    const updated = data.generatedAt ? formatTime(data.generatedAt) : formatTime(Date.now())
    periodDetails.textContent = range.start && range.end
      ? `${formatTime(range.start)} — ${formatTime(range.end)} · 芝加哥时间 · 数据更新于 ${updated}`
      : `最近 ${days === 1 ? '24 小时' : `${days} 天`} · 芝加哥时间 · 本次读取于 ${updated}`
    const comparisonLabel = days === 1 ? '较前 24 小时' : `较前 ${days} 天`
    const likesAvailable = data.likesAvailable !== false
    const currentPpv = data.visits ? data.views / data.visits : null
    const previousPpv = data.previous?.pagesPerVisit

    views.textContent = number.format(data.views || 0)
    visits.textContent = number.format(data.visits || 0)
    pagesPerVisit.textContent = currentPpv == null ? '—' : currentPpv.toFixed(2)
    periodLabel.textContent = days === 1 ? '最近 24 小时' : `最近 ${days} 天`

    setChange(viewsChange, data.views || 0, data.previous?.views, comparisonLabel)
    setChange(visitsChange, data.visits || 0, data.previous?.visits, comparisonLabel)
    setChange(pagesPerVisitChange, currentPpv, previousPpv, comparisonLabel)

    drawChart(data.series || [], range)

    const { postRows, siteRows } = splitPages(data.pages || [], data.likes || {})
    renderReaderResponse(data.likes || {}, likesAvailable)
    renderPostTable(recentPosts, recentPostRows(data.pages || [], data.likes || {}), true, likesAvailable)
    renderPostTable(posts, postRows, false, likesAvailable)
    renderSitePages(siteRows)

    const external = mergeReferrers(data.referrers || [])
    addItems(referrers, external, { value: 'visits' })
    addItems(sources, groupSources(data.referrers || []), { value: 'visits' })
    renderCategoryRows(categoryRows(data.pages || []))
    renderPostAge(postAgeRows(postRows))
    renderReferrerPosts(data.referrerPosts || [])
    addItems(countries, data.countries || [], { country: true, value: 'views' })
  }

  const load = async (days) => {
    errorBox.hidden = true
    rangeButtons.forEach((button) => {
      const active = Number(button.dataset.days) === days
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-pressed', String(active))
      button.disabled = true
    })

    try {
      const response = await fetch(`${endpoint}?days=${days}`, { headers: { Accept: 'application/json' } })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`)
      render(payload, days)
    } catch (error) {
      clearLists()
      ;[views, visits, pagesPerVisit].forEach((node) => { node.textContent = '—' })
      ;[viewsChange, visitsChange, pagesPerVisitChange].forEach((node) => { node.textContent = '' })
      periodDetails.textContent = '统计数据暂时无法读取'
      periodLabel.textContent = ''
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
    periodDetails.textContent = '尚未连接统计数据'
    rangeButtons.forEach((button) => { button.disabled = true })
    clearLists()
    ;[posts, recentPosts, referrers, sources, categories, sitePages, countries, postAge, referrerPosts].forEach((list) => {
      if (list) showEmpty(list)
    })
    return
  }

  load(7)
})()
