(() => {
  const panel = document.getElementById('stats-zines')
  if (!panel) return

  const rows = Array.from(panel.querySelectorAll('[data-release-asset-id]'))
  const status = document.getElementById('stats-zine-status')
  const retry = document.getElementById('stats-zine-retry')
  const number = new Intl.NumberFormat('zh-CN')
  const repository = 'Shioriblog/shioriblog.github.io'
  if (!rows.length) return

  const loadCount = async (row) => {
    const count = row.querySelector('.stats-zine-count')
    const assetId = row.dataset.releaseAssetId
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    count.textContent = '—'
    count.classList.remove('is-unavailable')
    row.setAttribute('aria-busy', 'true')

    try {
      if (!/^\d+$/.test(assetId)) throw new Error('Missing release asset ID')
      const response = await fetch(`https://api.github.com/repos/${repository}/releases/assets/${assetId}`, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller.signal
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const asset = await response.json()
      if (!Number.isSafeInteger(asset.download_count) || asset.download_count < 0) {
        throw new Error('Invalid download count')
      }
      count.textContent = `${number.format(asset.download_count)} 次`
      return true
    } catch (_) {
      count.textContent = '暂时无法读取'
      count.classList.add('is-unavailable')
      return false
    } finally {
      clearTimeout(timeout)
      row.removeAttribute('aria-busy')
    }
  }

  const load = async () => {
    retry.hidden = true
    retry.disabled = true
    status.textContent = '正在读取下载次数…'

    const results = await Promise.all(rows.map(loadCount))
    const failures = results.filter((ok) => !ok).length
    if (failures) {
      status.textContent = failures === rows.length
        ? '下载统计暂时无法读取，请稍后重试。'
        : '部分下载统计暂时无法读取，请稍后重试。'
      retry.hidden = false
    } else {
      const updated = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      status.textContent = `本次读取于 ${updated}`
    }
    retry.disabled = false
  }

  retry.addEventListener('click', load)
  load()
})()
