(() => {
  const config = window.SHIO_STATS_CONFIG || {}
  const endpoint = config.endpoint || ''
  const twikooEnvId = config.twikooEnvId || ''
  const siteHost = 'shioriblog.org'
  const timeZone = 'America/Chicago'
  const repository = 'Shioriblog/shioriblog.github.io'

  const $ = (id) => document.getElementById(id)
  const number = new Intl.NumberFormat('zh-CN')
  const fmt = (value) => number.format(Math.round(Number(value) || 0))

  // ---------- small DOM helpers ----------

  const h = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag)
    Object.entries(attrs).forEach(([key, value]) => {
      if (value == null || value === false) return
      if (key === 'className') node.className = value
      else if (key === 'text') node.textContent = value
      else node.setAttribute(key, value)
    })
    children.flat().forEach((child) => {
      if (child == null || child === false) return
      node.append(child instanceof Node ? child : document.createTextNode(String(child)))
    })
    return node
  }

  const setChildren = (node, ...children) => {
    node.replaceChildren()
    children.flat().forEach((child) => {
      if (child == null || child === false) return
      node.append(child instanceof Node ? child : document.createTextNode(String(child)))
    })
  }

  // ---------- paths, posts and dates ----------

  const normalizePath = (value) => {
    const raw = String(value || '').trim()
    if (!raw) return '/'
    let path = raw
    try { path = new URL(raw, window.location.origin).pathname } catch (_) { path = raw.split('#')[0].split('?')[0] }
    try { path = decodeURIComponent(path) } catch (_) {}
    if (!path.startsWith('/')) path = `/${path}`
    path = path.replace(/\/{2,}/g, '/')
    if (path.length > 1) path = path.replace(/\/+$/, '')
    return path || '/'
  }

  const posts = new Map(Object.entries(config.posts || {}).map(([path, info]) => [normalizePath(path), info]))
  const postHref = (path) => (path === '/' ? '/' : `${path}/`)

  const dayKeyFormat = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const dateParts = (value) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date(value))
    return Object.fromEntries(parts.map((part) => [part.type, part.value]))
  }
  const dayKey = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '' : dayKeyFormat.format(date)
  }
  const zhDate = (value, withYear = false) => {
    const p = dateParts(value)
    return withYear ? `${p.year} 年 ${p.month} 月 ${p.day} 日` : `${p.month} 月 ${p.day} 日`
  }
  const zhDateTime = (value) => {
    const p = dateParts(value)
    return `${p.month} 月 ${p.day} 日 ${p.hour}:${p.minute}`
  }
  const keyToUtc = (key) => new Date(`${key}T12:00:00Z`)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  const isoWeek = (key) => {
    const date = keyToUtc(key)
    const day = date.getUTCDay() || 7
    date.setUTCDate(date.getUTCDate() + 4 - day)
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
  }

  const publishedByDay = new Map()
  posts.forEach((info, path) => {
    const key = dayKey(info.date)
    if (!key) return
    if (!publishedByDay.has(key)) publishedByDay.set(key, [])
    publishedByDay.get(key).push(path)
  })

  const titleOf = (path) => posts.get(path)?.title || path
  const shortTitle = (title, max = 10) => (Array.from(title).length > max ? `${Array.from(title).slice(0, max).join('')}…` : title)
  const postLink = (path, attrs = {}) => h('a', { href: postHref(path), ...attrs }, titleOf(path))

  const WORDS = {
    1: { period: '最近 24 小时', prev: '前 24 小时', prevShort: '前一天', fresh: '今天新写' },
    7: { period: '这一周', prev: '上一周', prevShort: '上周', fresh: '本周新写' },
    30: { period: '这一个月', prev: '上一个月', prevShort: '上个月', fresh: '本月新写' }
  }

  // ---------- elements ----------

  const rangeButtons = Array.from(document.querySelectorAll('.dash-range [data-days]'))
  const el = {
    kicker: $('dash-kicker'),
    rangeText: $('dash-range-text'),
    setup: $('dash-setup'),
    error: $('dash-error'),
    lede: $('dash-lede'),
    views: $('dash-views'),
    viewsNote: $('dash-views-note'),
    visits: $('dash-visits'),
    visitsNote: $('dash-visits-note'),
    ppv: $('dash-ppv'),
    ppvNote: $('dash-ppv-note'),
    days: $('dash-days'),
    postsTitle: $('dash-h-posts'),
    posts: $('dash-posts'),
    oldPosts: $('dash-old-posts'),
    sourcesLede: $('dash-sources-lede'),
    sourcesBar: $('dash-sources-bar'),
    sources: $('dash-sources'),
    sourcesMore: $('dash-sources-more'),
    countriesLede: $('dash-countries-lede'),
    countries: $('dash-countries'),
    countriesMore: $('dash-countries-more'),
    likesTotal: $('dash-likes-total'),
    likes: $('dash-likes'),
    likesNote: $('dash-likes-note'),
    recentLikes: $('dash-recent-likes'),
    recentLikesNote: $('dash-recent-likes-note'),
    updated: $('dash-updated'),
    comments: $('dash-comments'),
    commentsNote: $('dash-comments-note'),
    readerOnly: $('dash-comments-reader-only')
  }

  const emptyItem = (text = '暂无数据') => h('li', { className: 'dash-empty' }, text)

  // ---------- opening ----------

  const changeNote = (node, current, previous, words) => {
    node.classList.remove('is-up')
    if (!previous) {
      node.textContent = `${words.prevShort}暂无数据`
      return
    }
    const ratio = current / previous
    let tail
    if (ratio >= 4) tail = `是${words.prevShort}的 ${Math.round(ratio)} 倍`
    else {
      const pct = Math.round((ratio - 1) * 100)
      tail = pct > 0 ? `多 ${pct}%` : pct < 0 ? `少 ${Math.abs(pct)}%` : '持平'
    }
    node.textContent = `${words.prevShort} ${fmt(previous)} · ${tail}`
    if (current > previous) node.classList.add('is-up')
  }

  const renderOpening = (data, days, postRows) => {
    const words = WORDS[days]
    const range = data.range || {}
    const views = Number(data.views || 0)
    const visits = Number(data.visits || 0)
    const prev = data.previous || {}
    const ppv = visits ? views / visits : null
    const prevPpv = prev.pagesPerVisit

    if (days === 1) el.rangeText.textContent = `${zhDateTime(range.start)} — ${zhDateTime(range.end)} · 芝加哥时间`
    else {
      const sameYear = dateParts(range.start).year === dateParts(range.end).year
      el.rangeText.textContent = `${zhDate(range.start, true)} — ${zhDate(range.end, !sameYear)} · 芝加哥时间`
    }
    el.kicker.textContent = days === 7 && range.endDate ? `Reading notes · No. ${isoWeek(range.endDate)}` : 'Reading notes'

    el.views.textContent = fmt(views)
    el.visits.textContent = fmt(visits)
    el.ppv.textContent = ppv == null ? '—' : ppv.toFixed(2)
    changeNote(el.viewsNote, views, Number(prev.views || 0), words)
    changeNote(el.visitsNote, visits, Number(prev.visits || 0), words)
    el.ppvNote.classList.remove('is-up')
    el.ppvNote.textContent = prevPpv ? `${words.prevShort} ${prevPpv.toFixed(2)}` : `${words.prevShort}暂无数据`

    if (!views) {
      setChildren(el.lede, `${words.period}，还没有人来读。`)
      return
    }

    const parts = [`${words.period}，独居日记被翻开了 `, h('b', {}, fmt(views)), ' 次，来自 ', h('b', {}, fmt(visits)), ' 次访问']
    const prevVisits = Number(prev.visits || 0)
    if (prevVisits) {
      const diff = visits - prevVisits
      parts.push(diff > 0 ? `，访问比${words.prev}多了 ${fmt(diff)} 次` : diff < 0 ? `，访问比${words.prev}少了 ${fmt(-diff)} 次` : `，访问和${words.prev}一样多`)
    }
    parts.push('。')
    if (ppv != null) {
      parts.push('每次来平均读 ', h('b', {}, ppv.toFixed(2)), ' 页')
      if (prevPpv) parts.push(`，${words.prev}是 ${prevPpv.toFixed(2)}`)
      parts.push('。')
    }
    const top = postRows[0]
    if (top) {
      const date = posts.get(top.path)?.date
      parts.push(`读得最多的，是${date ? ` ${zhDate(date)}写的` : ''}《${titleOf(top.path)}》。`)
    }
    setChildren(el.lede, parts)
  }

  // ---------- each day ----------

  const renderDays = (series) => {
    const ordered = [...(series || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)))
    el.days.classList.toggle('is-dense', ordered.length > 10)
    if (!ordered.length) {
      setChildren(el.days, emptyItem())
      return
    }
    const dense = ordered.length > 10
    const barHeight = dense ? 110 : 130
    const max = Math.max(...ordered.map((item) => Number(item.views || 0)), 1)
    const today = dayKey(Date.now())

    setChildren(el.days, ordered.map((item, index) => {
      const key = String(item.date)
      const viewsToday = Number(item.views || 0)
      const published = publishedByDay.get(key) || []
      const isToday = key === today
      const [, month, day] = key.split('-').map(Number)
      const weekday = weekdays[keyToUtc(key).getUTCDay()]

      let note = null
      if (published.length) {
        const first = `《${shortTitle(titleOf(published[0]))}》`
        note = h('span', { className: 'dash-day-note' }, '写了', h('br'), published.length > 1 ? `${first}等 ${published.length} 篇` : first)
      }

      const label = `${month} 月 ${day} 日 ${weekday}，${fmt(viewsToday)} 次浏览${isToday ? '（今天，未完）' : ''}${published.length ? `，发布了《${published.map(titleOf).join('》《')}》` : ''}`
      const dateText = dense && index > 0 && day !== 1 ? `${day}` : `${month}/${day}`
      return h('li', { className: [published.length ? 'is-published' : '', isToday ? 'is-today' : ''].join(' ').trim() || null, 'aria-label': label, title: label },
        h('span', { className: 'dash-day-count', 'aria-hidden': 'true' }, fmt(viewsToday)),
        h('span', { className: 'dash-day-bar', 'aria-hidden': 'true' }, Object.assign(h('i'), { style: `height:${Math.max(2, Math.round((viewsToday / max) * barHeight))}px` })),
        h('span', { className: 'dash-day-date', 'aria-hidden': 'true' }, dateText),
        h('span', { className: 'dash-day-week', 'aria-hidden': 'true' }, isToday ? '今天，未完' : weekday),
        note
      )
    }))
  }

  // ---------- posts ----------

  const postRowsFrom = (pages, likes) => {
    const totals = new Map()
    ;(pages || []).forEach((item) => {
      const path = normalizePath(item.label)
      if (!posts.has(path)) return
      const row = totals.get(path) || { path, views: 0, visits: 0 }
      row.views += Number(item.views || 0)
      row.visits += Number(item.visits || 0)
      totals.set(path, row)
    })
    return [...totals.values()]
      .map((row) => ({ ...row, likes: Number(likes?.[posts.get(row.path).like] || 0) }))
      .sort((a, b) => b.views - a.views || b.visits - a.visits)
  }

  const renderPosts = (rows, data, days, likesAvailable) => {
    const words = WORDS[days]
    el.postsTitle.textContent = `${words.period}被读的文章`
    const start = new Date(data.range?.start || 0).getTime()
    const shown = rows.slice(0, 8)

    if (!shown.length) {
      setChildren(el.posts, h('tr', {}, h('td', { colspan: '4', className: 'dash-empty' }, '暂无数据')))
    } else {
      setChildren(el.posts, shown.map((row) => {
        const date = posts.get(row.path)?.date
        const fresh = date && new Date(date).getTime() >= start
        return h('tr', {},
          h('td', {}, postLink(row.path), fresh ? h('small', {}, `${zhDate(date)} · ${words.fresh}`) : null),
          h('td', {}, fmt(row.views)),
          h('td', {}, fmt(row.visits)),
          h('td', { className: likesAvailable && row.likes > 0 ? 'has-likes' : null }, likesAvailable ? fmt(row.likes) : '—')
        )
      }))
    }

    const cutoff = new Date(data.range?.end || Date.now()).getTime() - 180 * 86400000
    const shownPaths = new Set(shown.map((row) => row.path))
    const old = rows
      .filter((row) => !shownPaths.has(row.path) && row.views >= 2 && new Date(posts.get(row.path)?.date || Date.now()).getTime() < cutoff)
      .slice(0, 3)
    el.oldPosts.hidden = !old.length
    if (old.length) {
      const parts = [`旧文重逢：${words.period}也有人翻到了`]
      old.forEach((row, index) => {
        parts.push(index ? '、《' : '《', postLink(row.path), `》${fmt(row.views)} 次`)
      })
      parts.push('。')
      setChildren(el.oldPosts, parts)
    }
  }

  // ---------- sources ----------

  const normalizeHost = (value) => String(value || '').trim().toLowerCase().replace(/^www\./, '')

  const sourceGroup = (label) => {
    const host = normalizeHost(label)
    if (!host || host === 'direct') return { key: 'direct', label: '直接打开', note: '书签、RSS 和没留下来源的访问' }
    if (host === 'douban.com' || host.endsWith('.douban.com')) return { key: 'douban', label: '豆瓣' }
    if (/(^|\.)sendib[mt]\d*\.com$/.test(host)) return { key: 'mail', label: '邮件通讯', note: 'Brevo' }
    if (host.startsWith('mastodon.') || host === 'org.joinmastodon.android') return { key: 'mastodon', label: 'Mastodon' }
    return { key: host, label: host }
  }

  const renderSources = (data) => {
    const groups = new Map()
    ;(data.referrers || []).forEach((item) => {
      const host = normalizeHost(item.label)
      if (host === siteHost || host === 'localhost') return
      const group = sourceGroup(item.label)
      const row = groups.get(group.key) || { ...group, visits: 0 }
      row.visits += Number(item.visits || 0)
      groups.set(group.key, row)
    })
    const rows = [...groups.values()].filter((row) => row.visits > 0).sort((a, b) => b.visits - a.visits)

    // Which post did each source send readers to most?
    const topTarget = new Map()
    ;(data.referrerPosts || []).forEach((item) => {
      const path = normalizePath(item.path)
      if (!posts.has(path)) return
      const key = sourceGroup(item.referrer).key
      const perPost = topTarget.get(key) || new Map()
      perPost.set(path, (perPost.get(path) || 0) + Number(item.visits || 0))
      topTarget.set(key, perPost)
    })

    const direct = groups.get('direct')?.visits || 0
    const total = Math.max(Number(data.visits || 0), rows.reduce((sum, row) => sum + row.visits, 0))
    const external = total - direct

    if (!total) {
      setChildren(el.sourcesLede, '暂无来源数据。')
      el.sourcesBar.replaceChildren()
      setChildren(el.sources)
      el.sourcesMore.hidden = true
      return
    }

    setChildren(el.sourcesLede, external
      ? `${fmt(total)} 次访问里，有 ${fmt(direct)} 次是直接打开的；另外 ${fmt(external)} 次，是从别的地方点进来的。`
      : `${fmt(total)} 次访问，都是直接打开的。`)

    const externalRows = rows.filter((row) => row.key !== 'direct')
    const biggest = externalRows[0]?.visits || 0
    setChildren(el.sourcesBar, [direct, biggest, external - biggest].map((value) => Object.assign(h('i'), { style: `flex:${value} 1 0` })))

    const shown = rows.filter((row, index) => row.key === 'direct' || (index < 6 && row.visits >= 3))
    const rest = rows.filter((row) => !shown.includes(row))

    setChildren(el.sources, shown.map((row) => {
      let note = row.note ? h('small', {}, ` · ${row.note}`) : null
      const targets = topTarget.get(row.key)
      if (row.key !== 'direct' && targets) {
        const [path, count] = [...targets.entries()].sort((a, b) => b[1] - a[1])[0]
        if (count >= 3 && count >= row.visits * 0.3) note = h('small', { className: 'is-accent' }, ` · 其中 ${fmt(count)} 次去读了《${titleOf(path)}》`)
      }
      return h('li', {}, h('span', {}, row.label, note), h('b', {}, fmt(row.visits)))
    }))

    el.sourcesMore.hidden = !rest.length
    if (rest.length) {
      const restVisits = rest.reduce((sum, row) => sum + row.visits, 0)
      el.sourcesMore.textContent = `还有 ${rest.length} 个地方共带来 ${fmt(restVisits)} 次：${rest.map((row) => row.label).join('、')}。`
    }
  }

  // ---------- countries ----------

  const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['zh-CN'], { type: 'region' }) : null
  const regionName = (code) => {
    const raw = String(code || '').trim().toUpperCase()
    if (/^[A-Z]{2}$/.test(raw)) {
      try { return regionNames?.of(raw) || raw } catch (_) { return raw }
    }
    return '未知地区'
  }

  const renderCountries = (data, days) => {
    const rows = (data.countries || []).filter((row) => Number(row.views) > 0)
    const known = rows.filter((row) => /^[A-Z]{2}$/i.test(String(row.label || '')))
    if (!rows.length) {
      setChildren(el.countriesLede, '暂无地区数据。')
      setChildren(el.countries)
      el.countriesMore.hidden = true
      return
    }
    el.countriesLede.textContent = `${WORDS[days].period}的浏览来自 ${known.length} 个地方。`
    const sizes = ['1.6rem', '1.5rem', '1.25rem', '1.25rem']
    const shown = rows.slice(0, 11)
    setChildren(el.countries, shown.map((row, index) => h('li', { style: `font-size:${sizes[index] || '1.05rem'}` }, `${regionName(row.label)} `, h('span', {}, fmt(row.views)))))

    const rest = rows.slice(11)
    el.countriesMore.hidden = !rest.length
    if (rest.length) {
      const listed = rest.slice(0, 12).map((row) => `${regionName(row.label)} ${fmt(row.views)}`).join('、')
      el.countriesMore.textContent = `另有 ${rest.length} 个地方：${listed}${rest.length > 12 ? '……' : '。'}`
    }
  }

  // ---------- likes ----------

  const renderLikes = (likes, available) => {
    if (!available) {
      el.likesTotal.textContent = '—'
      setChildren(el.likes)
      el.likesNote.textContent = '点赞暂时无法读取。'
      return
    }
    const total = Object.values(likes || {}).reduce((sum, value) => sum + (Number(value) || 0), 0)
    el.likesTotal.textContent = fmt(total)
    const rows = [...posts.entries()]
      .map(([path, info]) => ({ path, likes: Number(likes?.[info.like] || 0), date: info.date }))
      .filter((row) => row.likes > 0)
      .sort((a, b) => b.likes - a.likes || new Date(b.date) - new Date(a.date))

    if (!rows.length) {
      setChildren(el.likes, emptyItem('还没有收到心'))
      el.likesNote.textContent = ''
      return
    }
    setChildren(el.likes, rows.slice(0, 4).map((row) => h('li', {}, h('span', {}, postLink(row.path)), h('b', {}, fmt(row.likes)))))

    const top = rows[0]
    const age = Math.floor((Date.now() - new Date(top.date).getTime()) / 86400000)
    setChildren(el.likesNote, age >= 0 && age <= 14
      ? ['《', postLink(top.path), `》发出才${age < 1 ? '不到一天' : ` ${age} 天`}，就成了收到心最多的一篇。`]
      : ['收到心最多的是《', postLink(top.path), `》，一共 ${fmt(top.likes)} 颗。`])
  }

  // Newest first; one row per post, with how many of the logged hearts it got.
  // The log only began when like times started being recorded (2026-10-21).
  const renderRecentLikes = (recent, available) => {
    if (!available) {
      setChildren(el.recentLikes)
      el.recentLikesNote.textContent = ''
      return
    }
    const pathByLike = new Map([...posts.entries()].map(([path, info]) => [info.like, path]))
    const rows = new Map()
    for (const item of recent || []) {
      const path = pathByLike.get(item?.post)
      const at = Number(item?.at)
      if (!path || !Number.isFinite(at)) continue
      const row = rows.get(path)
      if (row) row.count += 1
      else rows.set(path, { path, at, count: 1 })
    }
    const list = [...rows.values()].sort((a, b) => b.at - a.at).slice(0, 5)
    el.recentLikesNote.textContent = '从 2026 年 10 月 21 日开始记录，更早的心没有时间 · 不随上方时段切换'
    if (!list.length) {
      setChildren(el.recentLikes, emptyItem('下一颗心会出现在这里'))
      return
    }
    setChildren(el.recentLikes, list.map((row) => {
      const when = new Date(row.at)
      return h('li', {},
        h('span', {}, postLink(row.path)),
        h('small', { className: Date.now() - row.at < 86400000 ? 'is-accent' : null },
          h('time', { datetime: when.toISOString(), title: zhDateTime(when) }, relativeTime(when)),
          row.count > 1 ? ` · ${row.count} 颗` : ''
        )
      )
    }))
  }

  // ---------- loading stats ----------

  const cache = new Map()
  let requestId = 0

  const render = (data, days) => {
    const likesAvailable = data.likesAvailable !== false
    const postRows = postRowsFrom(data.pages, data.likes)
    renderOpening(data, days, postRows)
    renderDays(data.series)
    renderPosts(postRows, data, days, likesAvailable)
    renderSources(data)
    renderCountries(data, days)
    renderLikes(data.likes, likesAvailable)
    renderRecentLikes(data.recentLikes, likesAvailable)
    el.updated.textContent = data.generatedAt
      ? `数据更新于 ${zhDateTime(data.generatedAt)} · 每 10 分钟刷新一次 · 来自 Cloudflare Web Analytics`
      : '数据来自 Cloudflare Web Analytics，每 10 分钟刷新一次。'
  }

  const showError = (message) => {
    el.error.textContent = `统计暂时无法读取：${message}`
    el.error.hidden = false
    setChildren(el.lede, '统计暂时无法读取。')
    ;[el.views, el.visits, el.ppv].forEach((node) => { node.textContent = '—' })
    ;[el.viewsNote, el.visitsNote, el.ppvNote].forEach((node) => { node.textContent = '' })
    setChildren(el.days)
    setChildren(el.posts)
    setChildren(el.sources)
    setChildren(el.countries)
    el.oldPosts.hidden = true
    el.sourcesMore.hidden = true
    el.countriesMore.hidden = true
  }

  const load = async (days) => {
    const id = ++requestId
    el.error.hidden = true
    rangeButtons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.days) === days)))

    if (cache.has(days)) {
      render(cache.get(days), days)
      return
    }

    document.querySelector('.dash')?.setAttribute('aria-busy', 'true')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    try {
      const response = await fetch(`${endpoint}?days=${days}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`)
      cache.set(days, payload)
      if (id === requestId) render(payload, days)
    } catch (error) {
      if (id === requestId) showError(error.name === 'AbortError' ? '请求超时' : error.message)
    } finally {
      clearTimeout(timeout)
      if (id === requestId) document.querySelector('.dash')?.removeAttribute('aria-busy')
    }
  }

  // ---------- comments (Twikoo) ----------

  let comments = []
  const authorNames = new Set((config.commentAuthorNames || []).map((name) => name.replace(/\s+/g, '').toLowerCase()))
  const isAuthor = (item) => item.master === true || item.master === 1 || authorNames.has(String(item.nick || '').replace(/\s+/g, '').toLowerCase())

  const plainComment = (html) => {
    // DOMParser builds an inert document: nothing in the comment runs or loads.
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html')
    doc.querySelectorAll('img').forEach((node) => node.replaceWith(' [图片] '))
    doc.querySelectorAll('pre').forEach((node) => node.replaceWith(' [代码] '))
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
  }

  const relativeTime = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const seconds = (date.getTime() - Date.now()) / 1000
    const abs = Math.abs(seconds)
    const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })
    if (abs < 60) return '刚刚'
    if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute')
    if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour')
    if (abs < 604800) return rtf.format(Math.round(seconds / 86400), 'day')
    return zhDate(date, dateParts(date).year !== dateParts(Date.now()).year)
  }

  const renderComments = () => {
    const readerOnly = el.readerOnly?.checked
    const items = (readerOnly ? comments.filter((item) => !isAuthor(item)) : comments).slice(0, 5)
    el.commentsNote.textContent = `最新 ${items.length} 条 · ${readerOnly ? '已隐藏博主留言' : '包含博主回复'} · 不随上方时段切换`
    if (!items.length) {
      setChildren(el.comments, emptyItem(readerOnly ? '最近还没有读者留言' : '还没有留言'))
      return
    }
    setChildren(el.comments, items.map((item) => {
      const path = normalizePath(item.url)
      const href = `${postHref(path)}${item.id ? `#${encodeURIComponent(item.id)}` : ''}`
      const created = new Date(item.created)
      return h('li', {},
        h('p', { className: 'dash-comment-meta' },
          h('b', {}, item.nick || '匿名'), ' · ',
          h('time', { datetime: Number.isNaN(created.getTime()) ? null : created.toISOString() }, relativeTime(item.created)),
          ' · 在《', h('a', { href: postHref(path) }, titleOf(path) === path ? path : titleOf(path)), '》'
        ),
        h('a', { className: 'dash-comment-text', href }, plainComment(item.comment) || '（空留言）')
      )
    }))
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = h('script', { src, async: 'async' })
    const timer = setTimeout(() => reject(new Error('timeout')), 15000)
    script.addEventListener('load', () => { clearTimeout(timer); resolve() })
    script.addEventListener('error', () => { clearTimeout(timer); reject(new Error('load failed')) })
    document.body.appendChild(script)
  })

  const loadComments = async () => {
    if (!el.comments) return
    if (el.readerOnly) el.readerOnly.disabled = true
    if (!twikooEnvId || !config.twikooScript) {
      setChildren(el.comments, emptyItem('留言暂时无法读取'))
      el.commentsNote.textContent = ''
      return
    }
    try {
      if (typeof window.twikoo?.getRecentComments !== 'function') await loadScript(config.twikooScript)
      const items = await window.twikoo.getRecentComments({ envId: twikooEnvId, pageSize: 50, includeReply: true })
      comments = Array.isArray(items) ? items : []
      renderComments()
      if (el.readerOnly) el.readerOnly.disabled = false
    } catch (error) {
      console.warn('Unable to load recent comments', error)
      setChildren(el.comments, emptyItem('留言暂时无法读取'))
      el.commentsNote.textContent = ''
    }
  }

  el.readerOnly?.addEventListener('change', renderComments)

  // ---------- ZINE downloads (GitHub Releases) ----------

  const loadZineCount = async (node) => {
    const assetId = node.dataset.releaseAssetId
    const target = node.querySelector('strong')
    if (!/^\d+$/.test(assetId || '') || !target) return
    const big = node.classList.contains('dash-zine-count')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    node.setAttribute('aria-busy', 'true')
    try {
      const response = await fetch(`https://api.github.com/repos/${repository}/releases/assets/${assetId}`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller.signal
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const asset = await response.json()
      if (!Number.isSafeInteger(asset.download_count) || asset.download_count < 0) throw new Error('Invalid download count')
      target.textContent = big ? fmt(asset.download_count) : `${fmt(asset.download_count)} 次`
    } catch (_) {
      target.textContent = '暂时无法读取'
      node.classList.add('is-unavailable')
      const unit = node.querySelector('span:last-child')
      if (big && unit) unit.hidden = true
    } finally {
      clearTimeout(timeout)
      node.removeAttribute('aria-busy')
    }
  }

  // ---------- start ----------

  rangeButtons.forEach((button) => {
    button.addEventListener('click', () => load(Number(button.dataset.days)))
  })

  if (!endpoint) {
    el.setup.hidden = false
    setChildren(el.lede, '尚未连接统计数据。')
    rangeButtons.forEach((button) => { button.disabled = true })
  } else {
    load(7)
  }

  document.querySelectorAll('[data-zine-count][data-release-asset-id]').forEach(loadZineCount)
  loadComments()
})()
