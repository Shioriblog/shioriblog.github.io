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

  <section class="about-subscribe" aria-labelledby="about-subscribe-title">
    <p class="about-section-kicker">SUBSCRIBE</p>
    <h2 id="about-subscribe-title">偶尔回来看看</h2>
    <p class="about-subscribe-copy">如果你愿意偶尔回来看看，可以通过 Email 或 RSS 订阅这个博客的新文章。</p>

    <div class="about-subscribe-links">
      <button id="about-email-subscribe" type="button">✉ Email 订阅</button>
      <a href="{{ '/feed.xml' | relative_url }}">RSS</a>
    </div>

    <p class="about-privacy-note">Email 仅用于发送博客更新通知，可以随时退订。关于本站如何处理访问统计、留言和订阅信息，可以阅读 <a href="{{ '/privacy/' | relative_url }}">Privacy</a>。</p>
  </section>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      const emailButton = document.getElementById('about-email-subscribe')
      if (!emailButton) return

      emailButton.addEventListener('click', () => {
        const launcher = document.getElementById('subscription-launcher')
        if (launcher) launcher.click()
      })
    })
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

  .about-subscribe h2 {
    margin: .7rem 0 .65rem;
    color: var(--ink);
    font-size: 1.25rem;
    font-weight: 500;
  }

  .about-subscribe-copy {
    max-width: 34rem;
    margin: 0;
    color: var(--body);
    line-height: 1.85;
  }

  .about-subscribe-links {
    display: flex;
    flex-wrap: wrap;
    gap: .7rem 1rem;
    margin-top: 1.25rem;
  }

  .about-subscribe-links button,
  .about-subscribe-links a {
    display: inline-flex;
    align-items: center;
    padding: .48rem .72rem;
    border: 1px solid var(--line);
    background: transparent;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .76rem;
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
  }

  .about-subscribe-links button:hover,
  .about-subscribe-links a:hover {
    border-color: #d7d1c8;
    background: var(--soft);
  }

  .about-privacy-note {
    max-width: 36rem;
    margin: 1.35rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .72rem;
    line-height: 1.75;
  }

  .about-privacy-note a {
    color: var(--accent);
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
  }
</style>
