---
layout: default
title: Blog Stats
permalink: /dashboard/
robots: noindex, nofollow
sitemap: false
analytics: false
subscription: false
---

<main class="stats-page" id="content">
  <header class="stats-header">
    <div>
      <p class="stats-kicker">BLOG STATS</p>
      <h1>阅读统计</h1>
      <p class="stats-lede">shioriblog.org 的 Cloudflare Web Analytics 摘要。</p>
    </div>
    <div class="stats-range" role="group" aria-label="统计范围">
      <button type="button" data-days="1">24H</button>
      <button type="button" data-days="7" class="is-active">7 DAYS</button>
      <button type="button" data-days="30">30 DAYS</button>
    </div>
  </header>

  <div id="stats-setup" class="stats-notice" hidden>Dashboard 页面已经准备好，但还没有连接 Cloudflare Worker。</div>
  <div id="stats-error" class="stats-notice stats-error" hidden></div>

  <section class="stats-summary" aria-label="统计摘要">
    <article>
      <span>PAGE VIEWS</span>
      <strong id="stat-views">—</strong>
      <small id="stat-views-change" class="stats-change"></small>
    </article>
    <article>
      <span>VISITS</span>
      <strong id="stat-visits">—</strong>
      <small id="stat-visits-change" class="stats-change"></small>
    </article>
    <article>
      <span>PAGES / VISIT</span>
      <strong id="stat-pages-per-visit">—</strong>
      <small id="stat-pages-per-visit-change" class="stats-change"></small>
    </article>
  </section>

  <section class="stats-panel stats-chart-panel">
    <div class="stats-panel-heading">
      <h2>Views</h2>
      <span id="stats-period-label"></span>
    </div>
    <div class="stats-chart" id="stats-chart" aria-label="每日浏览量图表"></div>
  </section>

  <section class="stats-response" aria-labelledby="reader-response-title">
    <div class="stats-panel-heading stats-response-heading">
      <h2 id="reader-response-title">Reader response</h2>
      <span>LIKES ARE CUMULATIVE</span>
    </div>
    <div class="stats-response-grid">
      <article>
        <span>MOST READ</span>
        <a id="response-most-read" href="#">—</a>
        <small id="response-most-read-meta">—</small>
      </article>
      <article>
        <span>MOST LIKED</span>
        <a id="response-most-liked" href="#">—</a>
        <small id="response-most-liked-meta">—</small>
      </article>
      <article>
        <span>LIKE DENSITY</span>
        <a id="response-like-rate" href="#">—</a>
        <small id="response-like-rate-meta">—</small>
      </article>
    </div>
    <p class="stats-response-note">Like density = 当前累计点赞数 ÷ 所选时间段的浏览量 × 100；适合比较文章反馈强弱，但不是严格的转化率。</p>
  </section>

  <div class="stats-grid stats-insight-grid">
    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>Old post discovery</h2><span>POST VIEWS · SHARE</span></div>
      <ol class="stats-list" id="stats-post-age"></ol>
    </section>

    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>How readers found posts</h2><span>VISITS</span></div>
      <ol class="stats-list stats-referrer-post-list" id="stats-referrer-posts"></ol>
    </section>
  </div>

  <section class="stats-comments" aria-labelledby="recent-comments-title">
    <div class="stats-panel-heading">
      <h2 id="recent-comments-title">Recent comments</h2>
      <span>LATEST 8</span>
    </div>
    <ol class="stats-comments-list" id="stats-comments">
      <li class="stats-comments-loading">正在读取留言…</li>
    </ol>
  </section>

  <div class="stats-grid">
    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>Top posts</h2><span>VIEWS · VISITS · ♥</span></div>
      <ol class="stats-list" id="stats-posts"></ol>
    </section>

    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>External referrers</h2><span>VISITS</span></div>
      <ol class="stats-list" id="stats-referrers"></ol>
    </section>

    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>Traffic sources</h2><span>VISITS</span></div>
      <ol class="stats-list" id="stats-sources"></ol>
    </section>

    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>Categories</h2><span>VIEWS · AVG / POST</span></div>
      <ol class="stats-list" id="stats-categories"></ol>
    </section>

    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>Site pages</h2><span>VIEWS · VISITS</span></div>
      <ol class="stats-list" id="stats-site-pages"></ol>
    </section>

    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>Countries</h2><span>VIEWS</span></div>
      <ol class="stats-list" id="stats-countries"></ol>
    </section>
  </div>

  <p class="stats-footnote">只显示汇总后的访问数据；这个页面本身不会计入 Cloudflare Analytics。External referrers 已排除 shioriblog.org 的站内跳转。</p>
</main>

<script>
  window.SHIO_STATS_CONFIG = {
    endpoint: {{ site.dashboard_api_url | jsonify }},
    twikooEnvId: {{ site.twikoo_env_id | jsonify }},
    titles: {
      {% for post in site.posts %}{{ post.url | jsonify }}: {{ post.title | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}
    },
    categories: {
      {% for post in site.posts %}{{ post.url | jsonify }}: {{ post.categories | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}
    },
    dates: {
      {% for post in site.posts %}{{ post.url | jsonify }}: {{ post.date | date_to_xmlschema | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}
    },
    likeIds: {
      {% for post in site.posts %}
        {% if post.wordpress_id %}
          {% assign dashboard_like_id = 'post-' | append: post.wordpress_id %}
        {% else %}
          {% assign dashboard_like_id = post.date | date: 'post-%Y%m%d%H%M%S' %}
        {% endif %}
        {{ post.url | jsonify }}: {{ dashboard_like_id | jsonify }}{% unless forloop.last %},{% endunless %}
      {% endfor %}
    }
  }
</script>
<script src="https://cdn.jsdelivr.net/npm/twikoo@1.7.22/dist/twikoo.all.min.js"></script>
<script src="{{ '/assets/js/dashboard.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>

<style>
  .stats-page { width: min(960px, calc(100% - 4rem)); margin: 0 auto; padding: 3.5rem 0 5.5rem; font-family: var(--sans); }
  .stats-header { display: flex; justify-content: space-between; gap: 2rem; align-items: flex-end; margin-bottom: 2.3rem; }
  .stats-kicker { margin: 0 0 .65rem; color: var(--accent); font-size: .7rem; letter-spacing: .15em; }
  .stats-header h1 { margin: 0; color: var(--ink); font-family: var(--serif); font-size: clamp(2rem, 5vw, 2.55rem); font-weight: 500; line-height: 1.25; }
  .stats-lede { margin: .55rem 0 0; color: var(--muted); font-size: .76rem; }
  .stats-range { display: flex; gap: .25rem; }
  .stats-range button { padding: .45rem .55rem; border: 0; border-bottom: 1px solid transparent; background: transparent; color: var(--muted); font: inherit; font-size: .68rem; cursor: pointer; }
  .stats-range button:hover, .stats-range button.is-active { color: var(--accent); border-bottom-color: var(--accent); }
  .stats-notice { margin: 0 0 1.5rem; padding: .8rem 1rem; border-left: 2px solid var(--accent); background: var(--soft); color: var(--body); font-size: .76rem; }
  .stats-error { border-left-color: #a65a4a; }
  .stats-summary { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); margin-bottom: 2.6rem; }
  .stats-summary article { padding: 1.3rem 1.2rem 1.25rem; border-right: 1px solid var(--line); }
  .stats-summary article:first-child { padding-left: 0; }
  .stats-summary article:last-child { border-right: 0; }
  .stats-summary span { display: block; margin-bottom: .25rem; color: var(--muted); font-size: .64rem; letter-spacing: .08em; }
  .stats-summary strong { display: block; color: var(--ink); font-family: var(--serif); font-size: 2rem; font-weight: 500; line-height: 1.25; font-variant-numeric: tabular-nums; }
  .stats-change { display: block; min-height: 1.1em; margin-top: .25rem; color: var(--muted); font-size: .6rem; font-weight: 400; font-variant-numeric: tabular-nums; }
  .stats-change.is-up { color: var(--accent); }
  .stats-change.is-down { color: #8a625a; }
  .stats-panel { min-width: 0; }
  .stats-chart-panel { margin-bottom: 3rem; }
  .stats-panel-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin-bottom: .85rem; }
  .stats-panel-heading h2 { margin: 0; color: var(--ink); font-family: var(--serif); font-size: 1.05rem; font-weight: 500; }
  .stats-panel-heading span { color: var(--muted); font-size: .62rem; letter-spacing: .08em; }
  .stats-chart { display: flex; align-items: end; gap: min(.8rem, 2vw); height: 190px; padding: 1.2rem 0 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .stats-bar-item { display: flex; flex: 1 1 0; min-width: 0; height: 100%; flex-direction: column; justify-content: flex-end; align-items: center; gap: .45rem; }
  .stats-bar-wrap { display: flex; width: min(32px, 72%); flex: 1; align-items: flex-end; }
  .stats-bar { width: 100%; min-height: 2px; background: var(--accent); opacity: .82; }
  .stats-bar-item time { min-height: 1.4rem; color: var(--muted); font-size: .58rem; line-height: 1.2; text-align: center; white-space: nowrap; }

  .stats-response { margin: 0 0 3rem; }
  .stats-response-heading { margin-bottom: .85rem; }
  .stats-response-grid { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .stats-response-grid article { min-width: 0; padding: 1rem 1.2rem 1.05rem; border-right: 1px solid var(--line); }
  .stats-response-grid article:first-child { padding-left: 0; }
  .stats-response-grid article:last-child { border-right: 0; }
  .stats-response-grid span { display: block; margin-bottom: .45rem; color: var(--muted); font-size: .61rem; letter-spacing: .1em; }
  .stats-response-grid a { display: block; overflow: hidden; color: var(--body); font-family: var(--serif); font-size: .95rem; line-height: 1.45; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }
  .stats-response-grid a:hover { color: var(--accent); }
  .stats-response-grid small { display: block; margin-top: .25rem; color: var(--muted); font-size: .62rem; font-variant-numeric: tabular-nums; }
  .stats-response-note { margin: .55rem 0 0; color: var(--muted); font-size: .61rem; line-height: 1.55; }

  .stats-insight-grid { margin: 0 0 3rem; }
  .stats-referrer-post-list li > span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .stats-referrer-post-list a { display: inline; white-space: normal; }
  .stats-source-label { color: var(--muted); }

  .stats-comments { margin: 0 0 3rem; }
  .stats-comments-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--line); }
  .stats-comment-item { min-width: 0; padding: .9rem 1.2rem 1rem 0; border-bottom: 1px solid var(--line); }
  .stats-comment-item:nth-child(even) { padding-right: 0; padding-left: 1.2rem; border-left: 1px solid var(--line); }
  .stats-comment-meta { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: .35rem; }
  .stats-comment-nick { overflow: hidden; color: var(--ink); font-size: .7rem; font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
  .stats-comment-time { flex: 0 0 auto; color: var(--muted); font-size: .6rem; white-space: nowrap; }
  .stats-comment-text { display: -webkit-box; overflow: hidden; margin: 0 0 .35rem; color: var(--body); font-family: var(--serif); font-size: .83rem; line-height: 1.65; text-decoration: none; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
  .stats-comment-text:hover { color: var(--accent); }
  .stats-comment-post { display: block; overflow: hidden; color: var(--muted); font-size: .61rem; line-height: 1.45; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }
  .stats-comment-post:hover { color: var(--accent); }
  .stats-comments-loading, .stats-comments-empty { grid-column: 1 / -1; padding: .9rem 0; border-bottom: 1px solid var(--line); color: var(--muted); font-size: .72rem; }

  .stats-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3rem 3.5rem; }
  .stats-list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--line); }
  .stats-list li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1rem; align-items: baseline; padding: .7rem 0; border-bottom: 1px solid var(--line); color: var(--body); font-size: .76rem; }
  .stats-list a { min-width: 0; overflow: hidden; text-overflow: ellipsis; color: var(--body); text-decoration: none; white-space: nowrap; }
  .stats-list a:hover { color: var(--accent); }
  .stats-list .stats-value { color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .stats-empty { color: var(--muted) !important; grid-template-columns: 1fr !important; }
  .stats-footnote { margin: 3rem 0 0; color: var(--muted); font-size: .67rem; }

  @media (max-width: 700px) {
    .stats-page { width: min(100% - 2rem, 38rem); padding-top: 2.8rem; }
    .stats-header { align-items: flex-start; flex-direction: column; gap: 1.2rem; }
    .stats-summary, .stats-response-grid { grid-template-columns: 1fr; }
    .stats-summary article, .stats-summary article:first-child,
    .stats-response-grid article, .stats-response-grid article:first-child { padding: 1rem 0; border-right: 0; border-bottom: 1px solid var(--line); }
    .stats-summary article:last-child, .stats-response-grid article:last-child { border-bottom: 0; }
    .stats-comments-list { grid-template-columns: 1fr; }
    .stats-comment-item, .stats-comment-item:nth-child(even) { padding: .85rem 0 .9rem; border-left: 0; }
    .stats-grid { grid-template-columns: 1fr; gap: 2.6rem; }
    .stats-chart { gap: .35rem; height: 160px; }
    .stats-bar-item time { font-size: .5rem; }
  }
</style>
