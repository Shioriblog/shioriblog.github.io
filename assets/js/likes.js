(() => {
  const content = document.querySelector('.article-content')
  const lightbox = document.getElementById('image-lightbox')
  const lightboxImage = document.getElementById('image-lightbox-image')
  if (!content || !lightbox || !lightboxImage) return

  const allImages = Array.from(content.querySelectorAll('img'))
  if (!allImages.length) return

  const galleryForImage = new Map()
  const galleryContainers = Array.from(content.querySelectorAll(
    '.wp-block-jetpack-tiled-gallery, .wp-block-gallery, .article-image-pair-grid, .gallery, figure'
  ))

  galleryContainers.forEach((gallery) => {
    const images = Array.from(gallery.querySelectorAll('img'))
    if (images.length < 2) return

    images.forEach((image) => {
      if (!galleryForImage.has(image)) galleryForImage.set(image, images)
    })
  })

  const previousButton = document.createElement('button')
  previousButton.type = 'button'
  previousButton.className = 'image-lightbox-nav image-lightbox-prev'
  previousButton.setAttribute('aria-label', '上一张图片')
  previousButton.textContent = '‹'
  previousButton.hidden = true

  const nextButton = document.createElement('button')
  nextButton.type = 'button'
  nextButton.className = 'image-lightbox-nav image-lightbox-next'
  nextButton.setAttribute('aria-label', '下一张图片')
  nextButton.textContent = '›'
  nextButton.hidden = true

  lightbox.append(previousButton, nextButton)

  let activeImages = []
  let activeIndex = 0

  const sourceFor = (image) => image.dataset.originalSrc || image.currentSrc || image.src

  const updateButtons = () => {
    const showNavigation = activeImages.length > 1
    previousButton.hidden = !showNavigation
    nextButton.hidden = !showNavigation
  }

  const setActiveImage = (image) => {
    activeImages = galleryForImage.get(image) || [image]
    activeIndex = Math.max(0, activeImages.indexOf(image))
    updateButtons()
  }

  const showAt = (index) => {
    if (activeImages.length < 2) return
    activeIndex = (index + activeImages.length) % activeImages.length
    const image = activeImages[activeIndex]
    lightboxImage.src = sourceFor(image)
    lightboxImage.alt = image.alt || ''
  }

  content.addEventListener('click', (event) => {
    const image = event.target.closest('img')
    if (!image || !content.contains(image)) return
    setActiveImage(image)
  }, true)

  content.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    const image = event.target.closest('img')
    if (!image || !content.contains(image)) return
    setActiveImage(image)
  }, true)

  previousButton.addEventListener('click', (event) => {
    event.stopPropagation()
    showAt(activeIndex - 1)
  })

  nextButton.addEventListener('click', (event) => {
    event.stopPropagation()
    showAt(activeIndex + 1)
  })

  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden || activeImages.length < 2) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showAt(activeIndex - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      showAt(activeIndex + 1)
    }
  })
})()

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
