---
layout: default
title: About
permalink: /about/
nav: about
---

<main class="about-page" id="content">
  <section class="about-profile" aria-labelledby="about-name">
    <img class="about-portrait" src="{{ '/assets/images/about-shiori.jpg' | relative_url }}" alt="Shiori 的作者头像">

    <div class="about-profile-copy">
      <p class="about-kicker">ABOUT</p>
      <h1 id="about-name">Shiori 栞</h1>
      <p class="about-japanese">本とお酒を楽しめる女子 <span class="about-heart" aria-hidden="true">♡</span></p>
      <p class="about-bio">坐标北美，平成废物<br>一般读者，又宅又腐<br>好好吃饭，随时摆烂</p>
      <a class="about-podcast" href="https://open.spotify.com/show/6hUUlQ8zkJkx2CzdLXiI0F" target="_blank" rel="noopener"><span>Podcast:</span> 普通读者</a>
    </div>

    <aside class="about-profile-support" aria-label="Support this blog">
      <p class="about-mini-label">SUPPORT</p>
      <a class="about-kofi-button" href="https://ko-fi.com/shioriblog" target="_blank" rel="noopener">
        <img src="{{ '/assets/images/kofi-logo.png' | relative_url }}" alt="" aria-hidden="true">
        <span>Buy me a coffee</span>
      </a>
    </aside>
  </section>

  <section class="about-popular" id="about-popular" aria-labelledby="about-popular-label" hidden>
    <div class="about-section-heading">
      <p class="about-section-kicker" id="about-popular-label">POPULAR READS</p>
      <span>PAST 30 DAYS</span>
    </div>
    <div class="about-popular-list" id="about-popular-list"></div>
  </section>

  <section class="about-subscribe" aria-labelledby="about-subscribe-label">
    <p class="about-section-kicker" id="about-subscribe-label">SUBSCRIBE</p>
    <p class="about-subscribe-copy">可以通过 Email 或 <a href="{{ '/feed.xml' | relative_url }}">RSS</a> 订阅这个博客的新文章。</p>

    <div id="about-subscribe-success" class="about-subscribe-status" role="status" hidden>
      感谢订阅！您会在博客更新时收到邮件推送 ^_^
    </div>

    <form id="about-subscribe-form" class="about-subscribe-form" action="https://3693b1ad.sibforms.com/serve/MUIFAJi0O7F8qH7agDpwSWg6oAHlzhb-LHTu98WhY3r3yl4pYcWiAApt44BkjoJrBlTeQHIAJRBKyCJLlhjq-y0oURNC0TfTIjtSMN0A_Ft5ATNSyb3dfEkz3_sxQ9YSL7eF-0Q37f-Mm-WN_-Aq0HFa6-1qqdu-e6LoV3T2ivgpGah7gtKfxP7jitbT8coO_FQfJm_yvkHp_6SzIQ==" method="POST" target="about-brevo-subscribe-target">
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
    width: min(680px, calc(100% - 4rem));
    margin: 0 auto;
    padding: 4rem 0 5.6rem;
  }

  .about-profile {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr) auto;
    gap: 1.8rem;
    align-items: center;
  }

  .about-profile-copy {
    text-align: left;
  }

  .about-kicker,
  .about-section-kicker,
  .about-mini-label {
    margin: 0;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .62rem;
    font-weight: 500;
    letter-spacing: .17em;
  }

  .about-kicker {
    margin-bottom: .62rem;
  }

  .about-portrait {
    display: block;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
  }

  .about-profile h1 {
    margin: 0;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 2.08rem;
    font-weight: 500;
    line-height: 1.2;
  }

  .about-japanese {
    margin: .36rem 0 1rem;
    color: var(--accent);
    font-family: var(--serif-ja);
    font-size: .88rem;
    line-height: 1.45;
  }

  .about-heart {
    display: inline-block;
    margin-left: .08em;
    color: var(--muted);
    font-family: var(--sans);
    font-size: 1.16rem;
    line-height: 1;
    vertical-align: -.07em;
  }

  .about-bio {
    margin: 0;
    color: var(--body);
    font-size: .91rem;
    line-height: 1.82;
  }

  .about-podcast {
    display: inline-block;
    margin-top: .85rem;
    color: var(--body);
    font-family: var(--sans);
    font-size: .69rem;
    text-decoration: none;
  }

  .about-podcast span {
    color: var(--muted);
  }

  .about-podcast:hover {
    color: var(--accent);
  }

  .about-profile-support {
    align-self: end;
    margin-bottom: .2rem;
    white-space: nowrap;
  }

  .about-mini-label {
    margin-bottom: .5rem;
    color: var(--muted);
    font-size: .55rem;
  }

  .about-kofi-button {
    display: inline-flex;
    align-items: center;
    gap: .44rem;
    padding: .48rem .68rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--paper);
    color: var(--body);
    font-family: var(--sans);
    font-size: .66rem;
    text-decoration: none;
    transition: border-color .15s ease, color .15s ease, transform .15s ease;
  }

  .about-kofi-button:hover {
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
  }

  .about-kofi-button img {
    width: 19px;
    height: 19px;
    object-fit: contain;
  }

  .about-popular {
    margin-top: 4rem;
  }

  .about-popular[hidden] {
    display: none;
  }

  .about-section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .about-section-heading > span {
    color: var(--muted);
    font-family: var(--sans);
    font-size: .54rem;
    letter-spacing: .09em;
  }

  .about-popular-list {
    display: grid;
    gap: 1.3rem;
  }

  .about-popular-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: center;
  }

  .about-popular-copy {
    min-width: 0;
  }

  .about-popular-copy a {
    display: inline-block;
    color: var(--body);
    font-family: var(--serif);
    font-size: 1.02rem;
    line-height: 1.45;
    text-decoration: none;
    transition: color .15s ease, transform .15s ease;
  }

  .about-popular-item:hover .about-popular-copy a {
    color: var(--accent);
    transform: translateX(2px);
  }

  .about-popular-copy p {
    margin: .16rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .59rem;
    line-height: 1.5;
  }

  .about-popular-arrow {
    color: var(--muted);
    font-family: var(--sans);
    font-size: .7rem;
    transition: color .15s ease, transform .15s ease;
  }

  .about-popular-item:hover .about-popular-arrow {
    color: var(--accent);
    transform: translate(2px, -2px);
  }

  .about-subscribe {
    width: min(100%, 440px);
    margin-top: 4rem;
  }

  .about-subscribe-copy {
    margin: .75rem 0 .95rem;
    color: var(--body);
    font-size: .9rem;
    line-height: 1.75;
  }

  .about-subscribe-copy a,
  .about-privacy-note a {
    color: var(--accent);
  }

  .about-subscribe-form-row {
    display: flex;
    align-items: stretch;
    width: 100%;
    gap: .5rem;
  }

  .about-subscribe-form-row input {
    min-width: 0;
    flex: 1 1 auto;
    padding: .66rem .7rem;
    border: 1px solid var(--line);
    border-radius: 3px;
    background: var(--paper);
    color: var(--body);
    font-family: var(--sans);
    font-size: .74rem;
  }

  .about-subscribe-form-row input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .about-subscribe-form-row button {
    flex: 0 0 auto;
    padding: .66rem .86rem;
    border: 1px solid var(--accent);
    border-radius: 3px;
    background: var(--accent);
    color: #fff;
    font-family: var(--sans);
    font-size: .72rem;
    cursor: pointer;
  }

  .about-subscribe-form-row button:disabled {
    opacity: .65;
    cursor: wait;
  }

  .about-subscribe-status {
    margin: 0 0 .85rem;
    padding: .58rem .68rem;
    border-left: 2px solid var(--accent);
    background: var(--soft);
    color: var(--body);
    font-family: var(--sans);
    font-size: .68rem;
    line-height: 1.55;
  }

  .about-privacy-note {
    margin: .85rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .59rem;
    line-height: 1.62;
  }

  @media (max-width: 700px) {
    .about-page {
      width: min(100% - 2rem, 36rem);
      padding-top: 3rem;
    }

    .about-profile {
      grid-template-columns: 132px minmax(0, 1fr);
      gap: 1.4rem 1.5rem;
    }

    .about-portrait {
      width: 132px;
      height: 132px;
    }

    .about-profile h1 {
      font-size: 1.9rem;
    }

    .about-profile-support {
      grid-column: 2;
      align-self: start;
      margin: -.25rem 0 0;
    }
  }

  @media (max-width: 520px) {
    .about-profile {
      grid-template-columns: 1fr;
      gap: 1.15rem;
    }

    .about-portrait {
      width: 146px;
      height: 146px;
    }

    .about-profile-support {
      grid-column: 1;
      margin-top: .1rem;
    }

    .about-popular {
      margin-top: 3.5rem;
    }

    .about-subscribe {
      margin-top: 3.5rem;
    }
  }
</style>
