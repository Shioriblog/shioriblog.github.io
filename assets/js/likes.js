(() => {
  const script = document.currentScript
  const apiBase = (script?.dataset.api || '').replace(/\/$/, '')
  const container = document.querySelector('.article-like [data-lyket-type="like"]')
  if (!apiBase || !container) return

  const postId = container.dataset.lyketId
  if (!postId) return

  const visitorKey = 'shioriblog-like-visitor'
  let visitor = localStorage.getItem(visitorKey)

  if (!visitor) {
    const bytes = new Uint8Array(18)
    crypto.getRandomValues(bytes)
    visitor = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
    localStorage.setItem(visitorKey, visitor)
  }

  const endpoint = `${apiBase}/likes/${encodeURIComponent(postId)}`
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'post-like-button'
  button.hidden = true
  button.disabled = true
  button.setAttribute('aria-label', '喜欢这篇文章')

  const heart = document.createElement('span')
  heart.className = 'post-like-heart'
  heart.setAttribute('aria-hidden', 'true')
  heart.textContent = '♡'

  const count = document.createElement('span')
  count.className = 'post-like-count'
  count.setAttribute('aria-live', 'polite')

  button.append(heart, count)
  container.replaceChildren(button)

  const render = (data) => {
    const liked = Boolean(data?.liked)
    const likes = Math.max(0, Number(data?.likes || 0))
    button.classList.toggle('is-liked', liked)
    button.setAttribute('aria-pressed', String(liked))
    button.setAttribute('aria-label', liked ? '取消喜欢这篇文章' : '喜欢这篇文章')
    heart.textContent = liked ? '♥' : '♡'
    count.textContent = String(likes)
    button.hidden = false
    button.disabled = false
  }

  const load = async () => {
    try {
      const response = await fetch(`${endpoint}?visitor=${encodeURIComponent(visitor)}`, {
        headers: { Accept: 'application/json' }
      })
      if (!response.ok) throw new Error(`Like API returned ${response.status}`)
      render(await response.json())
    } catch (error) {
      console.warn('Unable to load likes', error)
      button.hidden = true
    }
  }

  button.addEventListener('click', async () => {
    if (button.disabled) return
    button.disabled = true

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ visitor })
      })
      if (!response.ok) throw new Error(`Like API returned ${response.status}`)
      render(await response.json())
    } catch (error) {
      console.warn('Unable to update like', error)
      button.disabled = false
    }
  })

  load()
})()
