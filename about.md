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
    <p class="about-japanese">本とお酒を楽しめる女子 🍷</p>
    <p class="about-bio">坐标北美，平成废物<br>一般读者，又宅又腐<br>好好吃饭，随时摆烂</p>

    <nav class="about-links" aria-label="Shiori 的公开链接">
      <a href="https://gravatar.com/shiorizh20216ad72941ad?utm_source=hovercard" target="_blank" rel="me noopener">Gravatar</a>
      <span aria-hidden="true">·</span>
      <a href="https://open.spotify.com/show/6hUUlQ8zkJkx2CzdLXiI0F" target="_blank" rel="noopener">Podcast</a>
    </nav>
  </section>

  <section class="about-popular" id="about-popular" aria-labelledby="about-popular-label" hidden>
    <div class="about-section-heading">
      <p class="about-section-kicker" id="about-popular-label">POPULAR READS</p>
      <span>30 DAYS</span>
    </div>
    <div class="about-popular-list" id="about-popular-list"></div>
  </section>

  <section class="about-support" aria-labelledby="about-support-label">
    <p class="about-section-kicker" id="about-support-label">SUPPORT</p>
    <p>如果喜欢这里，可以请我喝一杯咖啡。</p>
    <a class="about-kofi-button" href="https://ko-fi.com/shioriblog" target="_blank" rel="noopener">
      <img src="{{ '/assets/images/kofi-logo.png' | relative_url }}" alt="" aria-hidden="true">
      <span>Buy me a coffee</span>
    </a>
  </section>

  <section class="about-subscribe" aria-labelledby="about-subscribe-label">
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

              const link = document.createElement('a')
              link.href = item.label
              link.textContent = meta.title

              const details = document.createElement('p')
              details.textContent = [meta.date, meta.category].filter(Boolean).join(' · ')

              article.append(link, details)
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
    font-size: .66rem;
    font-weight: 500;
    letter-spacing: .16em;
  }

  .about-kicker {
    margin-bottom: 1.7rem;
  }

  .about-portrait {
    display: block;
    width: 116px;
    height: 116px;
    margin: 0 auto 1.3rem;
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
  }

  .about-bio {
    margin: 0;
    color: var(--body);
    font-size: .96rem;
    line-height: 1.95;
  }

  .about-links {
    display: flex;
    justify-content: center;
    gap: .62rem;
    margin-top: 1.45rem;
    color: var(--line);
    font-family: var(--sans);
    font-size: .72rem;
  }

  .about-links a {
    color: var(--muted);
    text-decoration: none;
  }

  .about-links a:hover {
    color: var(--accent);
  }

  .about-popular,
  .about-support,
  .about-subscribe {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--line);
  }

  .about-popular[hidden] {
    display: none;
  }

  .about-section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.15rem;
  }

  .about-section-heading span {
    color: var(--muted);
    font-family: var(--sans);
    font-size: .59rem;
    letter-spacing: .08em;
  }

  .about-popular-list {
    display: grid;
    gap: 0;
  }

  .about-popular-item {
    padding: .95rem 0 1rem;
    border-bottom: 1px solid var(--line);
  }

  .about-popular-item:first-child {
    padding-top: .15rem;
  }

  .about-popular-item:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .about-popular-item a {
    color: var(--body);
    font-family: var(--serif);
    font-size: 1.04rem;
    line-height: 1.5;
    text-decoration: none;
  }

  .about-popular-item a:hover {
    color: var(--accent);
  }

  .about-popular-item p {
    margin: .25rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .65rem;
    line-height: 1.5;
  }

  .about-support > p:not(.about-section-kicker) {
    margin: .8rem 0 1.05rem;
    color: var(--body);
    line-height: 1.8;
  }

  .about-kofi-button {
    display: inline-flex;
    align-items: center;
    gap: .58rem;
    padding: .58rem .82rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--soft);
    color: var(--body);
    font-family: var(--sans);
    font-size: .72rem;
    text-decoration: none;
    transition: border-color .15s ease, color .15s ease, transform .15s ease;
  }

  .about-kofi-button:hover {
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
  }

  .about-kofi-button img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }

  .about-subscribe-copy {
    max-width: 34rem;
    margin: .8rem 0 1.15rem;
    color: var(--body);
    line-height: 1.85;
  }

  .about-subscribe-copy a,
  .about-privacy-note a {
    color: var(--accent);
  }

  .about-subscribe-form-row {
    display: flex;
    align-items: stretch;
    width: min(100%, 380px);
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
    font-size: .78rem;
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
    font-size: .76rem;
    cursor: pointer;
  }

  .about-subscribe-form-row button:disabled {
    opacity: .65;
    cursor: wait;
  }

  .about-subscribe-status {
    width: min(100%, 380px);
    margin: 0 0 .9rem;
    padding: .6rem .7rem;
    border-left: 2px solid var(--accent);
    background: var(--soft);
    color: var(--body);
    font-family: var(--sans);
    font-size: .74rem;
    line-height: 1.55;
  }

  .about-privacy-note {
    max-width: 36rem;
    margin: 1.35rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .68rem;
    line-height: 1.7;
  }

  @media (max-width: 640px) {
    .about-page {
      width: min(100% - 2rem, 34rem);
      padding-top: 3rem;
    }

    .about-popular,
    .about-support,
    .about-subscribe {
      margin-top: 3.2rem;
    }

    .about-subscribe-form-row {
      width: 100%;
    }
  }
</style>
