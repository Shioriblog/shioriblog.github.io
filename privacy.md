---
layout: default
title: Privacy
permalink: /privacy/
---

<main class="privacy-page" id="content">
  <p class="privacy-kicker">PRIVACY</p>
  <h1>关于隐私</h1>
  <p class="privacy-intro">这个博客会处理少量信息，用来了解网站使用情况，并提供留言、订阅和点赞功能。本站不会出售读者的个人信息。</p>

  <section>
    <h2>访问统计</h2>
    <p>本站使用 Cloudflare Web Analytics 了解页面访问量、热门页面、访问来源、大致的国家或地区，以及网页性能。Cloudflare Web Analytics 不使用 cookie 或 localStorage 来追踪访问者，也不会跨网站追踪个人。</p>
  </section>

  <section>
    <h2>留言</h2>
    <p>留言功能由 Twikoo 提供，后端部署在 Netlify。你在留言时主动填写的昵称、邮箱、网站和留言内容会用于显示留言及回复通知；邮箱不会公开显示。Twikoo 和 Netlify 会处理提交、保存和显示留言所需的信息。</p>
  </section>

  <section>
    <h2>邮件订阅</h2>
    <p>如果你主动订阅新文章，填写的邮箱地址会提交给 Brevo，并由 Brevo 保存相关的订阅记录，用于发送本站的新文章通知。你可以随时通过邮件中的退订链接取消订阅。</p>
  </section>

  <section>
    <h2>点赞</h2>
    <p>文章点赞使用本站自己的 Cloudflare Worker 和 Durable Object。浏览器会在 localStorage 中保存一个随机生成的访客标识，用来记住这个浏览器是否已经给某篇文章点过赞，并避免重复计数。这个标识不包含姓名或邮箱，也不会与留言或订阅信息关联。</p>
  </section>

  <section>
    <h2>网站托管与外部资源</h2>
    <p>本站托管在 GitHub Pages，并通过 Cloudflare 提供网络和图片优化服务。页面还会从 Google Fonts 和 jsDelivr 加载字体或前端脚本；这些服务可能会接收到浏览器请求资源时产生的常规技术信息。</p>
  </section>

  <p class="privacy-note">如果本站以后增加或更换会影响读者隐私的功能，这一页也会随之更新。</p>
  <p class="privacy-updated">Last updated: September 17, 2026</p>
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
