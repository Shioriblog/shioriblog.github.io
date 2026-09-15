---
layout: default
title: Privacy
permalink: /privacy/
---

<main class="privacy-page" id="content">
  <p class="privacy-kicker">PRIVACY</p>
  <h1>关于隐私</h1>
  <p class="privacy-intro">这个博客会收集少量信息，用来了解网站使用情况，以及提供留言、订阅和点赞功能。</p>

  <section>
    <h2>访问统计</h2>
    <p>本站使用 Cloudflare Web Analytics 统计访问量、热门页面和大致的访问来源，用于了解博客的阅读情况。</p>
  </section>

  <section>
    <h2>留言</h2>
    <p>留言功能由 Twikoo 提供。你在留言时主动填写的昵称、邮箱、网站等信息会用于显示留言及回复通知；邮箱不会公开显示。</p>
  </section>

  <section>
    <h2>邮件订阅</h2>
    <p>如果你主动订阅新文章，填写的邮箱地址会提交给 Brevo，用于发送博客更新通知。你可以随时通过邮件中的退订链接取消订阅。</p>
  </section>

  <section>
    <h2>第三方服务</h2>
    <p>本站还使用 Lyket 提供文章点赞功能。这些第三方服务可能会按照各自的隐私政策处理提供服务所需的技术信息。</p>
  </section>

  <p class="privacy-note">本站不会出售读者的个人信息。</p>
  <p class="privacy-updated">Last updated: September 2026</p>
</main>

<style>
  .privacy-page {
    width: min(680px, calc(100% - 4rem));
    margin: 0 auto;
    padding: 3.5rem 0 5rem;
  }

  .privacy-kicker {
    margin: 0 0 1.2rem;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .72rem;
    font-weight: 500;
    letter-spacing: .16em;
  }

  .privacy-page h1 {
    margin: 0 0 1rem;
    color: var(--ink);
    font-size: 2rem;
    font-weight: 500;
  }

  .privacy-intro {
    margin: 0 0 2.8rem;
    color: var(--muted);
    line-height: 1.9;
  }

  .privacy-page section {
    margin-top: 2rem;
  }

  .privacy-page h2 {
    margin: 0 0 .55rem;
    color: var(--ink);
    font-size: 1rem;
    font-weight: 500;
  }

  .privacy-page section p,
  .privacy-note {
    margin: 0;
    color: var(--body);
    line-height: 1.9;
  }

  .privacy-note {
    margin-top: 2.4rem;
    padding-top: 1.4rem;
    border-top: 1px solid var(--line);
  }

  .privacy-updated {
    margin: 1.2rem 0 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .72rem;
  }

  @media (max-width: 640px) {
    .privacy-page {
      width: min(100% - 2rem, 34rem);
      padding-top: 2.8rem;
    }
  }
</style>
