---
layout: default
title: About
permalink: /about/
nav: about
---

<main class="about-page" id="content">
  <p class="about-kicker">ABOUT</p>

  <section class="about-profile">
    <img class="about-portrait" src="{{ '/assets/images/about-shiori.jpg' | relative_url }}" alt="Shiori 的作者头像">

    <div class="about-copy">
      <h1>Shiori 栞</h1>
      <p class="about-japanese">本とお酒を楽しめる女子🍷</p>
      <p class="about-bio">坐标北美，平成废物<br>
      一般读者，又宅又腐<br>
      好好吃饭，随时摆烂</p>

      <div class="about-support-card">
        <img src="{{ '/assets/images/kofi-logo.png' | relative_url }}" alt="Ko-fi">
        <p>如果喜欢我的博客<br><a href="https://ko-fi.com/shioriblog">欢迎请我喝一杯咖啡 ☕️</a></p>
      </div>
    </div>
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
    width: min(720px, calc(100% - 4rem));
    margin: 0 auto;
    padding: 3.5rem 0 5rem;
  }

  .about-kicker,
  .about-section-kicker {
    margin: 0;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .72rem;
    font-weight: 500;
    letter-spacing: .16em;
  }

  .about-kicker {
    margin-bottom: 1.6rem;
  }

  .about-profile {
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    gap: 2.5rem;
    align-items: start;
  }

  .about-portrait {
    display: block;
    width: 190px;
    max-width: 100%;
    height: auto;
  }

  .about-copy h1 {
    margin: -.1rem 0 .35rem;
    color: var(--ink);
    font-size: 2rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .about-japanese {
    margin: 0 0 1.7rem;
    color: var(--accent);
    font-size: .92rem;
  }

  .about-bio {
    margin: 0;
    color: var(--body);
    line-height: 2;
  }

  .about-support-card {
    display: inline-flex;
    align-items: center;
    gap: .95rem;
    margin-top: 2rem;
    padding: .9rem 1rem;
    background: var(--soft);
  }

  .about-support-card img {
    width: 44px;
    height: auto;
    flex: 0 0 auto;
  }

  .about-support-card p {
    margin: 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .76rem;
    line-height: 1.7;
  }

  .about-support-card a {
    color: var(--accent);
  }

  .about-subscribe {
    margin-top: 3.8rem;
    padding-top: 2.2rem;
    border-top: 1px solid var(--line);
  }

  .about-subscribe-copy {
    max-width: 34rem;
    margin: .75rem 0 1.15rem;
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
    width: min(100%, 360px);
    gap: .55rem;
  }

  .about-subscribe-form-row input {
    min-width: 0;
    flex: 1 1 auto;
    padding: .68rem .72rem;
    border: 1px solid var(--line);
    background: var(--paper);
    color: var(--body);
    font-family: var(--sans);
    font-size: .78rem;
  }

  .about-subscribe-form-row button {
    flex: 0 0 auto;
    padding: .68rem .86rem;
    border: 1px solid var(--accent);
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
    width: min(100%, 360px);
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
    font-size: .72rem;
    line-height: 1.75;
  }

  @media (max-width: 640px) {
    .about-page {
      width: min(100% - 2rem, 34rem);
      padding-top: 2.8rem;
    }

    .about-profile {
      grid-template-columns: 1fr;
      gap: 1.7rem;
    }

    .about-portrait {
      width: min(190px, 62vw);
    }

    .about-subscribe-form-row {
      width: 100%;
    }
  }
</style>
