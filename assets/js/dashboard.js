(() => {
  const config = window.SHIO_STATS_CONFIG || {}
  const endpoint = config.endpoint || ''
  const titles = config.titles || {}

  const setup = document.getElementById('stats-setup')
  const errorBox = document.getElementById('stats-error')
  const views = document.getElementById('stat-views')
  const visits = document.getElementById('stat-visits')
  const pagesPerVisit = document.getElementById('stat-pages-per-visit')
  const chart = document.getElementById('stats-chart')
  const periodLabel = document.getElementById('stats-period-label')
  const pages = document.getElementById('stats-pages')
  const referrers = document.getElementById('stats-referrers')
  const countries = document.getElementById('stats-countries')
  const rangeButtons = Array.from(document.querySelectorAll('[data-days]'))

  const number = new Intl.NumberFormat('en-US')

  const clearLists = () => {
    pages.innerHTML = ''
    referrers.innerHTML = ''
    countries.innerHTML = ''
    chart.innerHTML = ''
  }

  const showEmpty = (list) => {
    const item = document.createElement('li')
    item.className = 'stats-empty'
    item.textContent = '暂无数据'
    list.appendChild(item)
  }

  const addRankedItems = (list, items, kind) => {
    list.innerHTML = ''
    if (!items || !items.length) {
      showEmpty(list)
      return
    }

    items.slice(0, 10).forEach((item) => {
      const li = document.createElement('li')
      let label = item.label || '—'

      if (kind === 'page') {
        label = titles[label] || decodeURIComponent(label).replace(/\/$/, '') || '/'
        const link = document.createElement('a')
        link.href = item.label
        link.textContent = label
        link.title = item.label
        li.appendChild(link)
      } else {
        const span = document.createElement('span')
        span.textContent = label
        li.appendChild(span)
      }

      const value = document.createElement('span')
      value.className = 'stats-value'
      value.textContent = number.format(item.views || 0)
      li.appendChild(value)
      list.appendChild(li)
    })
  }

  const drawChart = (series) => {
    chart.innerHTML = ''
    if (!series || !series.length) {
      const empty = document.createElement('p')
      empty.className = 'stats-empty'
      empty.textContent = '暂无数据'
      chart.appendChild(empty)
      return
    }

    const max = Math.max(...series.map((item) => item.views), 1)
    series.forEach((item) => {
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

  const render = (data) => {
    views.textContent = number.format(data.views || 0)
    visits.textContent = number.format(data.visits || 0)
    pagesPerVisit.textContent = data.visits ? (data.views / data.visits).toFixed(2) : '—'
    periodLabel.textContent = data.label || ''
    drawChart(data.series || [])
    addRankedItems(pages, data.pages || [], 'page')
    addRankedItems(referrers, data.referrers || [], 'referrer')
    addRankedItems(countries, data.countries || [], 'country')
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

  if (!endpoint) {
    setup.hidden = false
    clearLists()
    showEmpty(pages)
    showEmpty(referrers)
    showEmpty(countries)
    return
  }

  load(7)
})()
