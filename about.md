---
layout: default
title: About
permalink: /about/
nav: about
# 关于页底部已经有订阅框，页脚和左下角的浮动订阅按钮都不再重复显示
footer_subscribe: false
subscription: false
---

<main class="about-page" id="content">
  <section class="about-profile" aria-labelledby="about-name">
    <img class="about-portrait" src="{{ '/assets/images/about-shiori.jpg' | relative_url }}" alt="Shiori 的作者头像">

    <div class="about-profile-copy">
      <p class="about-kicker">ABOUT</p>
      <h1 id="about-name">Shiori 栞</h1>
      <p class="about-japanese">本とお酒を楽しめる女子 <span class="about-heart" aria-hidden="true">♡</span></p>
      <p class="about-bio">坐标北美，平成废物<br>一般读者，又宅又腐<br>好好吃饭，随时摆烂</p>
      <a class="about-podcast" href="https://open.spotify.com/show/6hUUlQ8zkJkx2CzdLXiI0F" target="_blank" rel="noopener"><span class="about-podcast-label">Podcast:</span> 普通读者<span class="about-arrow" aria-hidden="true">↗</span></a>
    </div>
  </section>

  <section class="about-history" aria-labelledby="about-history-label">
    <p class="about-section-kicker" id="about-history-label">BLOG HISTORY</p>

    <div class="about-timeline">
      <article class="about-timeline-item">
        <time class="about-timeline-date" datetime="2022-06">2022.06</time>
        <span class="about-timeline-dot" aria-hidden="true"></span>
        <div class="about-timeline-copy">
          <p>在 Notion 上重新开始写 blog。<br>最初只是想记录生活上的一些改变和新的开始。</p>
          <a class="about-timeline-link" href="{{ '/2022/06/07/生活上的改变和新开始/' | relative_url }}">生活上的改变和新开始 <span aria-hidden="true">→</span></a>
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
          <a class="about-timeline-link" href="{{ '/2025/02/25/生活的基石/' | relative_url }}">生活的基石 <span aria-hidden="true">→</span></a>
        </div>
      </article>

      <article class="about-timeline-item">
        <time class="about-timeline-date" datetime="2026-09">2026.09</time>
        <span class="about-timeline-dot" aria-hidden="true"></span>
        <div class="about-timeline-copy">
          <p>从 WordPress 搬到 GitHub Pages。<br>和 ChatGPT 一起搭起了现在这个个人静态 blog。<br>发布了第一本 digital zine。</p>
          <a class="about-timeline-link" href="{{ '/2026/09/23/zine-issue-01/' | relative_url }}">独居日记 · zine · issue 01 <span aria-hidden="true">→</span></a>
        </div>
      </article>
    </div>
  </section>

  <section class="about-survey" aria-labelledby="about-survey-label">
    <p class="about-section-kicker" id="about-survey-label">READER SURVEY</p>
    <p class="about-survey-copy">如果你偶尔会来这里读东西，我很好奇你是怎么来到这里、喜欢看什么。愿意的话，可以花几分钟填写一份小问卷。</p>
    <a class="about-button" href="https://docs.google.com/forms/d/e/1FAIpQLSfvrh7kUD01h4HPE1ecbRLPFcDISm2tCY-r0zif0h6fe-2COA/viewform" target="_blank" rel="noopener">填写问卷 <span class="about-arrow" aria-hidden="true">↗</span></a>
  </section>

  <section class="about-subscribe" aria-labelledby="about-subscribe-label">
    <p class="about-section-kicker" id="about-subscribe-label">SUBSCRIBE</p>
    <p class="about-subscribe-copy">通过 Email 订阅更新，或使用 <a href="{{ '/newsletter.xml' | relative_url }}">RSS</a>。</p>

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

  <section class="about-support" aria-labelledby="about-support-label">
    <p class="about-section-kicker" id="about-support-label">SUPPORT</p>
    <a class="about-button" href="https://ko-fi.com/shioriblog" target="_blank" rel="noopener">
      <img src="{{ '/assets/images/kofi-logo.png' | relative_url }}" alt="" aria-hidden="true">
      <span>Buy me a coffee</span>
      <span class="about-arrow" aria-hidden="true">↗</span>
    </a>
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
  /* 字号只用这几档：
     小标签 .7rem（大写 + 字距）· 辅助信息 .8rem · 按钮 .85rem · 说明文字 .95rem · 正文 .98–1rem */

  .about-page {
    width: min(680px, calc(100% - 4rem));
    margin: 0 auto;
    padding: 4rem 0 5.4rem;
  }

  .about-profile {
    display: grid;
    grid-template-columns: 148px minmax(0, 1fr);
    gap: 2.2rem;
    align-items: center;
  }

  .about-profile-copy {
    text-align: left;
  }

  .about-kicker,
  .about-section-kicker {
    margin: 0;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .7rem;
    font-weight: 500;
    letter-spacing: .16em;
    line-height: 1.6;
  }

  .about-kicker {
    margin-bottom: .55rem;
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
    margin: .4rem 0 1rem;
    color: var(--accent);
    font-family: var(--serif-ja);
    font-size: .92rem;
    line-height: 1.5;
  }

  .about-heart {
    display: inline-block;
    margin-left: .1em;
    color: var(--muted);
    font-family: var(--sans);
    font-size: 1.1em;
    line-height: 1;
    vertical-align: -.05em;
  }

  .about-bio {
    margin: 0;
    color: var(--body);
    font-size: 1rem;
    line-height: 1.85;
  }

  .about-podcast {
    display: inline-block;
    margin-top: .85rem;
    color: var(--body);
    font-family: var(--sans);
    font-size: .82rem;
    line-height: 1.5;
    text-decoration: none;
  }

  .about-podcast-label {
    color: var(--muted);
  }

  .about-podcast:hover {
    color: var(--accent);
  }

  /* 链接末尾的小箭头：站内 →，站外 ↗ */
  .about-arrow {
    display: inline-block;
    margin-left: .15rem;
    color: var(--accent);
    transition: transform .15s ease;
  }

  .about-podcast:hover .about-arrow,
  .about-button:hover .about-arrow {
    transform: translate(2px, -2px);
  }

  .about-history {
    margin-top: 4rem;
  }

  .about-history > .about-section-kicker {
    margin-bottom: 1.6rem;
  }

  .about-timeline {
    position: relative;
  }

  /* 竖线对准圆点中心：日期列 78px + 圆点列的一半 16px */
  .about-timeline::before {
    content: '';
    position: absolute;
    top: .7rem;
    bottom: .7rem;
    left: 94px;
    width: 1px;
    background: var(--line);
  }

  .about-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 78px 32px minmax(0, 1fr);
    align-items: start;
    padding-bottom: 2.2rem;
  }

  .about-timeline-item:last-child {
    padding-bottom: 0;
  }

  .about-timeline-date {
    padding-top: .18rem;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .8rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: .02em;
    line-height: 1.7;
    white-space: nowrap;
  }

  .about-timeline-dot {
    z-index: 1;
    justify-self: center;
    width: 7px;
    height: 7px;
    margin-top: .68rem;
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
    font-size: .98rem;
    line-height: 1.8;
  }

  .about-timeline-link {
    display: inline-block;
    margin-top: .6rem;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .8rem;
    line-height: 1.5;
    text-decoration: none;
  }

  .about-timeline-link span {
    display: inline-block;
    margin-left: .1rem;
    transition: transform .15s ease;
  }

  .about-timeline-link:hover span {
    transform: translateX(3px);
  }

  .about-survey,
  .about-subscribe,
  .about-support {
    margin-top: 3.6rem;
  }

  .about-survey > .about-section-kicker,
  .about-subscribe > .about-section-kicker,
  .about-support > .about-section-kicker {
    margin-bottom: .8rem;
  }

  .about-survey-copy,
  .about-subscribe-copy {
    margin: 0 0 1.05rem;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .95rem;
    line-height: 1.7;
  }

  .about-subscribe-copy a {
    color: var(--accent);
    font-weight: 600;
    text-underline-offset: 2px;
  }

  /* 问卷和 Ko-fi 用同一种按钮 */
  .about-button {
    display: inline-flex;
    align-items: center;
    gap: .45rem;
    min-height: 44px;
    padding: .6rem .9rem;
    border: 1px solid var(--line);
    border-radius: 0;
    background: var(--paper);
    color: var(--accent);
    font-family: var(--sans);
    font-size: .85rem;
    line-height: 1.4;
    text-decoration: none;
    transition: border-color .15s ease, transform .15s ease;
  }

  .about-button:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .about-button img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  .about-button .about-arrow {
    margin-left: 0;
  }

  .about-side-subscribe-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: .5rem;
    width: min(100%, 440px);
  }

  .about-side-subscribe-form input {
    min-width: 0;
    width: 100%;
    padding: .72rem .8rem;
    border: 1px solid var(--line);
    border-radius: 0;
    background: var(--paper);
    color: var(--body);
    font-family: var(--sans);
    font-size: .88rem;
  }

  .about-side-subscribe-form input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .about-side-subscribe-form button {
    padding: .72rem 1rem;
    border: 1px solid var(--accent);
    border-radius: 0;
    background: var(--accent);
    color: #fff;
    font-family: var(--sans);
    font-size: .88rem;
    cursor: pointer;
  }

  .about-side-subscribe-form button:disabled {
    opacity: .65;
    cursor: wait;
  }

  .about-subscribe-status {
    width: min(100%, 440px);
    margin: 0 0 .65rem;
    padding: .55rem .62rem;
    border-left: 2px solid var(--accent);
    background: var(--soft);
    color: var(--body);
    font-family: var(--sans);
    font-size: .85rem;
    line-height: 1.5;
  }

  .about-side-privacy {
    margin: .6rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .78rem;
    line-height: 1.5;
  }

  .about-side-privacy a {
    color: var(--accent);
  }

  @media (max-width: 700px) {
    .about-page {
      width: min(100% - 2rem, 36rem);
      padding-top: 3rem;
    }

    .about-profile {
      grid-template-columns: 132px minmax(0, 1fr);
      gap: 1.6rem;
    }

    .about-portrait {
      width: 132px;
      height: 132px;
    }

    .about-profile h1 {
      font-size: 1.9rem;
    }
  }

  @media (max-width: 520px) {
    .about-profile {
      grid-template-columns: 1fr;
      gap: 1.2rem;
    }

    .about-portrait {
      width: 128px;
      height: 128px;
    }

    .about-history {
      margin-top: 3.4rem;
    }

    /* 日期列 58px + 圆点列的一半 12px */
    .about-timeline::before {
      left: 70px;
    }

    .about-timeline-item {
      grid-template-columns: 58px 24px minmax(0, 1fr);
      padding-bottom: 2rem;
    }

    .about-timeline-date {
      font-size: .76rem;
    }

    .about-timeline-copy p {
      font-size: .95rem;
    }

    .about-survey,
    .about-subscribe,
    .about-support {
      margin-top: 3rem;
    }

    .about-side-subscribe-form {
      width: 100%;
    }
  }
</style>