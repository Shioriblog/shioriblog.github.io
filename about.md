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

    <aside class="about-profile-side" aria-label="Support this blog">
      <div class="about-side-block about-side-support">
        <p class="about-mini-label">SUPPORT</p>
        <a class="about-kofi-button" href="https://ko-fi.com/shioriblog" target="_blank" rel="noopener">
          <img src="{{ '/assets/images/kofi-logo.png' | relative_url }}" alt="" aria-hidden="true">
          <span>Buy me a coffee</span>
        </a>
      </div>
    </aside>
  </section>

  <section class="about-history" aria-labelledby="about-history-label">
    <p class="about-section-kicker" id="about-history-label">BLOG HISTORY</p>

    <div class="about-timeline">
      <article class="about-timeline-item">
        <time class="about-timeline-date" datetime="2022-06">2022.06</time>
        <span class="about-timeline-dot" aria-hidden="true"></span>
        <div class="about-timeline-copy">
          <p>在 Notion 上重新开始写 blog。<br>最初只是想记录生活上的一些改变和新的开始。</p>
          <a class="about-timeline-link" href="{{ '/2022/06/07/生活上的改变和新开始/' | relative_url }}">生活上的改变和新开始 <span aria-hidden="true">↗</span></a>
        </div>
      </article>

      <article class="about-timeline-item">
        <time class="about-timeline-date" datetime="2023-12">2023.12</time>
        <span class="about-timeline-dot" aria-hidden="true"></span>
        <div class="about-timeline-copy">
          <p>从 Notion 搬到 WordPress。</p>
        </div>
      </article>

      <article class="about-timeline-item">
        <time class="about-timeline-date" datetime="2025-02">2025.02</time>
        <span class="about-timeline-dot" aria-hidden="true"></span>
        <div class="about-timeline-copy">
          <p>改变了写 blog 的方式，更加日常随笔化，并正式把这里改名为「独居日记」。</p>
          <a class="about-timeline-link" href="{{ '/2025/02/25/生活的基石/' | relative_url }}">生活的基石 <span aria-hidden="true">↗</span></a>
        </div>
      </article>

      <article class="about-timeline-item">
        <time class="about-timeline-date" datetime="2026-09">2026.09</time>
        <span class="about-timeline-dot" aria-hidden="true"></span>
        <div class="about-timeline-copy">
          <p>从 WordPress 搬到 GitHub Pages。<br>和 ChatGPT 一起搭起了现在这个个人静态 blog。</p>
        </div>
      </article>
    </div>
  </section>

  <section class="about-subscribe" aria-labelledby="about-subscribe-label">
    <p class="about-section-kicker" id="about-subscribe-label">SUBSCRIBE</p>
    <p class="about-subscribe-copy">通过 Email 订阅更新，或使用 <a href="{{ '/feed.xml' | relative_url }}">RSS</a>。</p>

    <div id="about-subscribe-success" class="about-subscribe-status" role="status" hidden>
      感谢订阅！更新时会收到邮件 ^_^
    </div>

    <form id="about-subscribe-form" class="about-side-subscribe-form" action="https://3693b1ad.sibforms.com/serve/MUIFAJi0O7F8qH7agDpwSWg6oAHlzhb-LHTu98WhY3r3yl4pYcWiAApt44BkjoJrBlTeQHIAJRBKyCJLlhjq-y0oURNC0TfTIjtSMN0A_Ft5ATNSyb3dfEkz3_sxQ9YSL7eF-0Q37f-Mm-WN_-Aq0HFa6-1qqdu-e6LoV3T2ivgpGah7gtKfxP7jitbT8coO_FQfJm_yvkHp_6SzIQ==" method="POST" target="about-brevo-subscribe-target">
      <label class="sr-only" for="about-brevo-email">Email address</label>
      <input id="about-brevo-email" type="email" name="EMAIL" placeholder="Email address" autocomplete="email" required>
      <button id="about-subscribe-button" type="submit">订阅</button>
      <input type="text" name="email_address_check" value="" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;">
      <input type="hidden" name="locale" value="en">
    </form>

    <iframe id="about-brevo-subscribe-target" name="about-brevo-subscribe-target" title="订阅提交结果" hidden></iframe>
    <p class="about-side-privacy">仅用于博客更新通知 · <a href="{{ '/privacy/' | relative_url }}">Privacy</a></p>
  </section>

  <script>
    (() => {
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
    padding: 4rem 0 5.4rem;
  }

  .about-profile {
    display: grid;
    grid-template-columns: 148px minmax(0, 1fr) 188px;
    gap: 1.55rem;
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
    font-size: .61rem;
    font-weight: 500;
    letter-spacing: .17em;
  }

  .about-kicker {
    margin-bottom: .6rem;
  }

  .about-portrait {
    display: block;
    width: 148px;
    height: 148px;
    border-radius: 50%;
    object-fit: cover;
  }

  .about-profile h1 {
    margin: 0;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 2.02rem;
    font-weight: 500;
    line-height: 1.2;
  }

  .about-japanese {
    margin: .34rem 0 .95rem;
    color: var(--accent);
    font-family: var(--serif-ja);
    font-size: .86rem;
    line-height: 1.45;
  }

  .about-heart {
    display: inline-block;
    margin-left: .08em;
    color: var(--muted);
    font-family: var(--sans);
    font-size: 1.14rem;
    line-height: 1;
    vertical-align: -.07em;
  }

  .about-bio {
    margin: 0;
    color: var(--body);
    font-size: .89rem;
    line-height: 1.8;
  }

  .about-podcast {
    display: inline-block;
    margin-top: .8rem;
    color: var(--body);
    font-family: var(--sans);
    font-size: .68rem;
    text-decoration: none;
  }

  .about-podcast span {
    color: var(--muted);
  }

  .about-podcast:hover {
    color: var(--accent);
  }

  .about-profile-side {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-self: center;
    min-width: 0;
  }

  .about-side-block {
    min-width: 0;
  }

  .about-mini-label {
    margin-bottom: .48rem;
    color: var(--muted);
    font-size: .60rem;
  }

  .about-side-subscribe-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: .4rem;
    width: min(100%, 360px);
  }

  .about-side-subscribe-form input {
    min-width: 0;
    width: 100%;
    padding: .52rem .58rem;
    border: 1px solid var(--line);
    border-radius: 3px;
    background: var(--paper);
    color: var(--body);
    font-family: var(--sans);
    font-size: .72rem;
  }

  .about-side-subscribe-form input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .about-side-subscribe-form button {
    padding: .52rem .62rem;
    border: 1px solid var(--accent);
    border-radius: 3px;
    background: var(--accent);
    color: #fff;
    font-family: var(--sans);
    font-size: .70rem;
    cursor: pointer;
  }

  .about-side-subscribe-form button:disabled {
    opacity: .65;
    cursor: wait;
  }

  .about-subscribe-status {
    width: min(100%, 360px);
    margin: 0 0 .6rem;
    padding: .45rem .5rem;
    border-left: 2px solid var(--accent);
    background: var(--soft);
    color: var(--body);
    font-family: var(--sans);
    font-size: .68rem;
    line-height: 1.45;
  }

  .about-side-privacy {
    margin: .45rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .60rem;
    line-height: 1.5;
  }

  .about-side-privacy a,
  .about-subscribe-copy a {
    color: var(--accent);
  }

  .about-side-support {
    padding-top: .1rem;
  }

  .about-kofi-button {
    display: inline-flex;
    align-items: center;
    gap: .42rem;
    padding: .46rem .64rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--paper);
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
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  .about-history {
    margin-top: 3.8rem;
  }

  .about-history > .about-section-kicker {
    margin-bottom: 1.55rem;
  }

  .about-timeline {
    position: relative;
  }

  .about-timeline::before {
    content: '';
    position: absolute;
    top: .52rem;
    bottom: .52rem;
    left: 84px;
    width: 1px;
    background: var(--line);
  }

  .about-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 68px 32px minmax(0, 1fr);
    align-items: start;
    padding-bottom: 2.05rem;
  }

  .about-timeline-item:last-child {
    padding-bottom: 0;
  }

  .about-timeline-date {
    padding-top: .05rem;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .65rem;
    letter-spacing: .04em;
    line-height: 1.7;
    white-space: nowrap;
  }

  .about-timeline-dot {
    z-index: 1;
    justify-self: center;
    width: 6px;
    height: 6px;
    margin-top: .47rem;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 4px var(--paper);
  }

  .about-timeline-copy {
    min-width: 0;
  }

  .about-timeline-copy p {
    margin: 0;
    color: var(--body);
    font-family: var(--serif);
    font-size: .88rem;
    line-height: 1.75;
  }

  .about-timeline-link {
    display: inline-block;
    margin-top: .58rem;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .67rem;
    line-height: 1.5;
    text-decoration: none;
  }

  .about-timeline-link span {
    display: inline-block;
    margin-left: .08rem;
    transition: transform .15s ease;
  }

  .about-timeline-link:hover span {
    transform: translate(2px, -2px);
  }

  .about-subscribe {
    margin-top: 3.6rem;
  }

  .about-subscribe > .about-section-kicker {
    margin-bottom: .65rem;
  }

  .about-subscribe-copy {
    margin: 0 0 .85rem;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .72rem;
    line-height: 1.55;
  }

  @media (max-width: 700px) {
    .about-page {
      width: min(100% - 2rem, 36rem);
      padding-top: 3rem;
    }

    .about-profile {
      grid-template-columns: 132px minmax(0, 1fr);
      gap: 1.35rem 1.45rem;
    }

    .about-portrait {
      width: 132px;
      height: 132px;
    }

    .about-profile h1 {
      font-size: 1.9rem;
    }

    .about-profile-side {
      grid-column: 2;
      margin-top: -.15rem;
    }
  }

  @media (max-width: 520px) {
    .about-profile {
      grid-template-columns: 1fr;
      gap: 1.1rem;
    }

    .about-portrait {
      width: 146px;
      height: 146px;
    }

    .about-profile-side {
      grid-column: 1;
      width: min(100%, 280px);
      margin-top: .15rem;
    }

    .about-history {
      margin-top: 3.4rem;
    }

    .about-timeline::before {
      left: 62px;
    }

    .about-timeline-item {
      grid-template-columns: 48px 28px minmax(0, 1fr);
      padding-bottom: 1.8rem;
    }

    .about-timeline-date {
      font-size: .59rem;
    }

    .about-timeline-copy p {
      font-size: .83rem;
    }

    .about-subscribe {
      margin-top: 3rem;
    }
  }
</style>