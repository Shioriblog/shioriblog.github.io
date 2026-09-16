---
layout: default
title: About
permalink: /about/
nav: about
---

<main class="about-page" id="content">
  <section class="about-profile" aria-labelledby="about-name">
    <p class="about-kicker">ABOUT</p>
    <img class="about-portrait" src="{{ '/assets/images/about-shiori.jpg' | relative_url }}" alt="Shiori 的作者头像">
    <h1 id="about-name">Shiori 栞</h1>
    <p class="about-japanese">本とお酒を楽しめる女子 <span class="about-heart" aria-hidden="true">♡</span></p>
    <p class="about-bio">坐标北美，平成废物<br>一般读者，又宅又腐<br>好好吃饭，随时摆烂</p>

    <a class="about-podcast" href="https://open.spotify.com/show/6hUUlQ8zkJkx2CzdLXiI0F" target="_blank" rel="noopener">
      <span>Podcast:</span> 普通读者
    </a>
  </section>

  <section class="about-popular" id="about-popular" aria-labelledby="about-popular-label" hidden>
    <div class="about-section-heading">
      <p class="about-section-kicker" id="about-popular-label">POPULAR READS</p>
      <span>PAST 30 DAYS</span>
    </div>
    <div class="about-popular-list" id="about-popular-list"></div>
  </section>

  <section class="about-section about-support" aria-labelledby="about-support-label">
    <p class="about-section-kicker" id="about-support-label">SUPPORT</p>
    <div class="about-support-row">
      <p>如果喜欢这里，可以请我喝一杯咖啡。</p>
      <a class="about-kofi-button" href="https://ko-fi.com/shioriblog" target="_blank" rel="noopener">
        <img src="{{ '/assets/images/kofi-logo.png' | relative_url }}" alt="" aria-hidden="true">
        <span>Buy me a coffee</span>
      </a>
    </div>
  </section>

  <section class="about-section about-subscribe" aria-labelledby="about-subscribe-label">
    <p class="about-section-kicker" id="about-subscribe-label">SUBSCRIBE</p>
    <p class="about-subscribe-copy">可以通过 Email 或 <a href="{{ '/feed.xml' | relative_url }}">RSS</a> 订阅这个博客的新文章。</p>

    <div id="about-subscribe-success" class="about-subscribe-status" role="status" hidden>
      感谢订阅！您会在博客更新时收到邮件推送 ^_^
    </div>

    <form
      id="about-subscribe-form"
      class="about-subscribe-form"
      action="https://3693b1ad.sibforms.com/serve/MUIFAJi0O7F8qH7agDpwSWg6oAHlzhb-LHTu98WhY3r3yl4pYcWiAApt44BkjoJrBlTeQHIAJRBKyCJLlhjq-y0oURNC0TfTIjtSMN0A_Ft5ATNSyb3dfEkz3_sxQ9YSL7eF-0Q37f-Mm-WN_-Aq0HFa6-1qqdu-e6LoV3T2ivgpGah7gtKfxP7jitbT8coO_FQfJm_yvkHp_6SzIQ=="
      method="POST"
      target="about-brevo-subscribe-target"
    >
      <label class="sr-only" for="about-brevo-email">Email address</label>
      <div class="about-subscribe-form-row">
        <input id="about-brevo-email" type="email" name="EMAIL" placeholder="Email address" autocomplete="email" required>
        <button id="about-subscribe-button" type="submit">订阅</button>
      </div>
      <input type="text" name="email_address_check" value="" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;">
      <input type="hidden" name="locale" value="en">
    </form>

    <iframe id="about-brevo-subscribe-target" name="about-brevo-subscribe-target" title="订阅提交结果" hidden></iframe>

    <p class="about-privacy-note">Email 仅用于发送博客更新通知，可以随时退订。关于本站如何处理访问统计、留言和订阅信息，可以阅读 <a href="{{ '/privacy/' | relative_url }}">Privacy</a>。</p>
  </section>

  <script>
    (() => {
      const popularSection = document.getElementById('about-popular')
      const popularList = document.getElementById('about-popular-list')
      const endpoint = {{ site.dashboard_api_url | jsonify }}
      const posts = {
        {% for post in site.posts %}
          {{ post.url | jsonify }}: {
            title: {{ post.title | jsonify }},
            date: {{ post.date | date: '%Y.%m.%d' | jsonify }},
            category: {{ post.categories | first | default: '' | jsonify }}
          }{% unless forloop.last %},{% endunless %}
        {% endfor %}
      }

      if (popularSection && popularList && endpoint) {
        fetch(`${endpoint.replace(/\/$/, '')}?days=30`, { headers: { Accept: 'application/json' } })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return response.json()
          })
          .then((data) => {
            const popular = (data.pages || [])
              .filter((item) => posts[item.label])
              .sort((a, b) => Number(b.views || 0) - Number(a.views || 0))
              .slice(0, 3)

            if (!popular.length) return

            popular.forEach((item) => {
              const meta = posts[item.label]
              const article = document.createElement('article')
              article.className = 'about-popular-item'

              const copy = document.createElement('div')
              copy.className = 'about-popular-copy'

              const link = document.createElement('a')
              link.href = item.label
              link.textContent = meta.title

              const details = document.createElement('p')
              details.textContent = [meta.date, meta.category].filter(Boolean).join(' · ')

              const arrow = document.createElement('span')
              arrow.className = 'about-popular-arrow'
              arrow.setAttribute('aria-hidden', 'true')
              arrow.textContent = '↗'

              copy.append(link, details)
              article.append(copy, arrow)
              popularList.appendChild(article)
            })

            popularSection.hidden = false
          })
          .catch(() => {})
      }

      const form = document.getElementById('about-subscribe-form')
      const frame = document.getElementById('about-brevo-subscribe-target')
      const success = document.getElementById('about-subscribe-success')
      const button = document.getElementById('about-subscribe-button')
      if (!form || !frame || !success || !button) return

      let submitted = false

      form.addEventListener('submit', () => {
        submitted = true
        button.disabled = true
        button.textContent = '提交中…'
        success.hidden = true
      })

      frame.addEventListener('load', () => {
        if (!submitted) return
        submitted = false
        success.hidden = false
        form.reset()
        button.disabled = false
        button.textContent = '订阅'
      })
    })()
  </script>
</main>

<style>
  .about-page {
    width: min(640px, calc(100% - 4rem));
    margin: 0 auto;
    padding: 3.8rem 0 5.5rem;
  }

  .about-profile {
    text-align: center;
  }

  .about-kicker,
  .about-section-kicker {
    margin: 0;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .64rem;
    font-weight: 500;
    letter-spacing: .17em;
  }

  .about-kicker {
    margin-bottom: 1.7rem;
  }

  .about-portrait {
    display: block;
    width: 160px;
    height: 160px;
    margin: 0 auto 1.45rem;
    border-radius: 50%;
    object-fit: cover;
  }

  .about-profile h1 {
    margin: 0;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 2.15rem;
    font-weight: 500;
    line-height: 1.25;
  }

  .about-japanese {
    margin: .42rem 0 1.45rem;
    color: var(--accent);
    font-family: var(--serif-ja);
    font-size: .91rem;
    line-height: 1.4;
  }

  .about-heart {
    display: inline-block;
    margin-left: .12em;
    color: var(--muted);
    font-family: var(--sans);
    font-size: 1.22rem;
    line-height: 1;
    vertical-align: -.08em;
  }

  .about-bio {
    margin: 0;
    color: var(--body);
    font-size: .96rem;
    line-height: 1.95;
  }

  .about-podcast {
    display: inline-block;
    margin-top: 1.45rem;
    color: var(--body);
    font-family: var(--sans);
    font-size: .72rem;
    text-decoration: none;
  }

  .about-podcast span {
    color: var(--muted);
  }

  .about-podcast:hover {
    color: var(--accent);
  }

  .about-popular {
    margin-top: 4.2rem;
  }

  .about-popular[hidden] {
    display: none;
  }

  .about-section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: .7rem;
  }

  .about-section-heading > span {
    color: var(--muted);
    font-family: var(--sans);
    font-size: .56rem;
    letter-spacing: .09em;
  }

  .about-popular-list {
    border-top: 1px solid var(--line);
  }

  .about-popular-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--line);
  }

  .about-popular-copy {
    min-width: 0;
  }

  .about-popular-copy a {
    color: var(--body);
    font-family: var(--serif);
    font-size: 1.02rem;
    line-height: 1.45;
    text-decoration: none;
  }

  .about-popular-copy a:hover {
    color: var(--accent);
  }

  .about-popular-copy p {
    margin: .2rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .61rem;
    line-height: 1.5;
  }

  .about-popular-arrow {
    color: var(--muted);
    font-family: var(--sans);
    font-size: .7rem;
  }

  .about-section {
    margin-top: 3.2rem;
    padding-top: 1.6rem;
    border-top: 1px solid var(--line);
  }

  .about-support-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    margin-top: .8rem;
  }

  .about-support-row > p {
    margin: 0;
    color: var(--body);
    font-size: .94rem;
    line-height: 1.75;
  }

  .about-kofi-button {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: .48rem;
    padding: .5rem .72rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--paper);
    color: var(--body);
    font-family: var(--sans);
    font-size: .68rem;
    text-decoration: none;
    transition: border-color .15s ease, color .15s ease, transform .15s ease;
  }

  .about-kofi-button:hover {
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
  }

  .about-kofi-button img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .about-subscribe-copy {
    margin: .8rem 0 1rem;
    color: var(--body);
    font-size: .94rem;
    line-height: 1.8;
  }

  .about-subscribe-copy a,
  .about-privacy-note a {
    color: var(--accent);
  }

  .about-subscribe-form-row {
    display: flex;
    align-items: stretch;
    width: min(100%, 430px);
    gap: .5rem;
  }

  .about-subscribe-form-row input {
    min-width: 0;
    flex: 1 1 auto;
    padding: .68rem .72rem;
    border: 1px solid var(--line);
    border-radius: 3px;
    background: var(--paper);
    color: var(--body);
    font-family: var(--sans);
    font-size: .76rem;
  }

  .about-subscribe-form-row input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .about-subscribe-form-row button {
    flex: 0 0 auto;
    padding: .68rem .9rem;
    border: 1px solid var(--accent);
    border-radius: 3px;
    background: var(--accent);
    color: #fff;
    font-family: var(--sans);
    font-size: .74rem;
    cursor: pointer;
  }

  .about-subscribe-form-row button:disabled {
    opacity: .65;
    cursor: wait;
  }

  .about-subscribe-status {
    width: min(100%, 430px);
    margin: 0 0 .9rem;
    padding: .6rem .7rem;
    border-left: 2px solid var(--accent);
    background: var(--soft);
    color: var(--body);
    font-family: var(--sans);
    font-size: .7rem;
    line-height: 1.55;
  }

  .about-privacy-note {
    max-width: 36rem;
    margin: .95rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .63rem;
    line-height: 1.7;
  }

  @media (max-width: 640px) {
    .about-page {
      width: min(100% - 2rem, 34rem);
      padding-top: 3rem;
    }

    .about-portrait {
      width: 148px;
      height: 148px;
    }

    .about-popular {
      margin-top: 3.5rem;
    }

    .about-section {
      margin-top: 2.7rem;
      padding-top: 1.45rem;
    }

    .about-support-row {
      align-items: flex-start;
      flex-direction: column;
      gap: .9rem;
    }

    .about-subscribe-form-row {
      width: 100%;
    }
  }
</style>
