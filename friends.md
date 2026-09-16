---
layout: default
title: Friends
permalink: /friends/
nav: friends
---

<main class="friends-page" id="content">
  <p class="friends-kicker">FRIENDS</p>

  <div class="friends-intro">
    <p class="friends-intro-title">欢迎交换友情链接 🌿</p>
    <p>如果你也在写博客，欢迎在下面留言告诉我。<br>
    留下你的博客名字、网址，以及一句简单介绍就可以啦 ✉️</p>
  </div>

  <section class="friends-blogroll" aria-labelledby="blogroll-title">
    <h2 id="blogroll-title">BLOGROLL</h2>
    <ul class="friends-list">
      <li><a href="https://hippostank.org/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://hippostank.org&sz=32" alt="" loading="lazy">河马吐槽</a></li>
      <li><a href="https://thirdshire.com/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://thirdshire.com&sz=32" alt="" loading="lazy">第三夏尔 | Third Shire</a></li>
      <li><a href="https://tortie.me/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://tortie.me&sz=32" alt="" loading="lazy">A Purrception</a></li>
      <li><a href="https://imick.github.io/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://imick.github.io&sz=32" alt="" loading="lazy">Chiaroscuro</a></li>
      <li><a href="https://www.kylinbag.top/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://www.kylinbag.top&sz=32" alt="" loading="lazy">锁麟囊</a></li>
      <li><a href="https://www.after27.me/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://www.after27.me&sz=32" alt="" loading="lazy">After 27</a></li>
      <li><a href="https://blog.douchi.space/#gsc.tab=0"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://blog.douchi.space&sz=32" alt="" loading="lazy">椒盐豆豉</a></li>
      <li><a href="https://pensieve.wangxindi.org/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://pensieve.wangxindi.org&sz=32" alt="" loading="lazy">邓布利多的冥想盆</a></li>
      <li><a href="https://fourxiajiao.github.io/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://fourxiajiao.github.io&sz=32" alt="" loading="lazy">一笼虾饺有四个</a></li>
      <li><a href="https://blog.himikouchuu.com/"><img class="friend-favicon" src="{{ '/assets/images/friends/himikouchuu.svg' | relative_url }}" alt="" loading="lazy">愚人船</a></li>
      <li><a href="https://zhuzi.dev/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://zhuzi.dev&sz=32" alt="" loading="lazy">Blah Blah Booooom</a></li>
      <li><a href="https://blackcatmeiqiu.blogspot.com/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://blackcatmeiqiu.blogspot.com&sz=32" alt="" loading="lazy">两人森林|猫猫文学</a></li>
      <li><a href="https://www.joeyrambles.com/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://www.joeyrambles.com&sz=32" alt="" loading="lazy">小小日常</a></li>
      <li><a href="https://aliangx.blog/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://aliangx.blog&sz=32" alt="" loading="lazy">蛰洲</a></li>
      <li><a href="https://solanalifeblog.vercel.app/"><img class="friend-favicon" src="https://www.google.com/s2/favicons?domain_url=https://solanalifeblog.vercel.app&sz=32" alt="" loading="lazy">在世一日</a></li>
    </ul>
  </section>

  {% include comments.html %}
</main>

<style>
  .friends-page {
    width: min(720px, calc(100% - 4rem));
    margin: 0 auto;
    padding: 3.5rem 0 5rem;
  }

  .friends-kicker,
  .friends-blogroll h2,
  .friends-page .comments h2 {
    margin: 0;
    color: var(--accent);
    font-family: var(--sans);
    font-size: .72rem;
    font-weight: 500;
    letter-spacing: .16em;
  }

  .friends-kicker {
    margin-bottom: 1.8rem;
  }

  .friends-intro {
    max-width: 36rem;
    margin: 0 0 3.2rem;
    padding: .15rem 0 .15rem 1rem;
    border-left: 2px solid var(--accent);
  }

  .friends-intro-title {
    margin: 0 0 .35rem;
    color: var(--ink);
    font-size: 1rem;
    font-weight: 500;
  }

  .friends-intro p:last-child {
    margin: 0;
    color: var(--muted);
    font-size: .9rem;
    line-height: 1.85;
  }

  .friends-blogroll h2 {
    margin-bottom: .85rem;
  }

  .friends-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2rem;
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--line);
  }

  .friends-list li {
    min-width: 0;
    border-bottom: 1px solid var(--line);
  }

  .friends-list a {
    display: flex;
    align-items: center;
    gap: .65rem;
    padding: .82rem 0;
    color: var(--body);
    text-decoration: none;
    overflow-wrap: anywhere;
    transition: color .15s ease;
  }

  .friend-favicon {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
    border-radius: 4px;
    object-fit: contain;
  }

  .friends-list a:hover {
    color: var(--accent);
  }

  .friends-page .comments {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--line);
  }

  .friends-page .comments h2 {
    margin-bottom: 1.4rem;
  }

  @media (max-width: 640px) {
    .friends-page {
      width: min(100% - 2rem, 34rem);
      padding-top: 2.8rem;
    }

    .friends-list {
      grid-template-columns: 1fr;
    }
  }
</style>
