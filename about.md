---
layout: page
title: About
permalink: /about/
nav: about
---

<div class="about-profile-page">
  <section class="about-author-hero">
    <div class="about-author-copy">
      <p class="about-section-label">关于作者</p>
      <h2 class="about-name">Shiori</h2>
      <p class="about-japanese">本とお酒を楽しめる女子🍷</p>
      <p class="about-bio">坐标北美，平成废物<br>
      一般读者，又宅又腐<br>
      好好吃饭，随时摆烂</p>
    </div>
    <img class="about-portrait" src="{{ '/assets/images/about-shiori.jpg' | relative_url }}" alt="Shiori 的作者头像">
  </section>

  <div class="about-support-card">
    <img src="{{ '/assets/images/kofi-logo.png' | relative_url }}" alt="Ko-fi">
    <p>如果喜欢我的博客<br><a href="https://ko-fi.com/shioriblog">欢迎请我喝一杯咖啡 ☕️</a></p>
  </div>
</div>

<style>
  .about-profile-page {
    margin-top: .4rem;
  }

  .about-author-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 230px;
    gap: 3.2rem;
    align-items: center;
    padding: 1.1rem 0 3.7rem;
  }

  .about-section-label {
    margin: 0 0 1rem;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .72rem;
    font-weight: 500;
    letter-spacing: .12em;
  }

  .about-name {
    margin: 0 0 .35rem;
    color: var(--ink);
    font-size: 1.75rem;
    font-weight: 500;
    line-height: 1.35;
  }

  .about-japanese {
    margin: 0 0 1.6rem;
    color: var(--accent);
    font-size: .92rem;
  }

  .about-bio {
    margin: 0;
    color: var(--body);
    line-height: 2;
  }

  .about-portrait {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
  }

  .about-support-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    max-width: 34rem;
    padding: 1.25rem 1.4rem;
    background: var(--soft);
  }

  .about-support-card img {
    width: 58px;
    height: auto;
    flex: 0 0 auto;
  }

  .about-support-card p {
    margin: 0;
    color: var(--muted);
    font-family: var(--sans);
    font-size: .8rem;
    line-height: 1.75;
  }

  .about-support-card a {
    color: var(--accent);
  }

  @media (max-width: 640px) {
    .about-author-hero {
      grid-template-columns: 1fr;
      gap: 1.8rem;
      padding-bottom: 2.8rem;
    }

    .about-portrait {
      width: min(230px, 72vw);
    }
  }
</style>
