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
      <p class="stats-lede">shioriblog.org 的阅读、互动与 ZINE 下载统计。</p>
    </div>
    <div class="stats-range" role="group" aria-label="统计范围">
      <button type="button" data-days="1" aria-pressed="false">24H</button>
      <button type="button" data-days="7" class="is-active" aria-pressed="true">7 DAYS</button>
      <button type="button" data-days="30" aria-pressed="false">30 DAYS</button>
    </div>
  </header>

  <p class="stats-period-details" id="stats-period-details" role="status">正在读取统计时段…</p>

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
  <p class="stats-summary-note">浏览为页面加载次数；访问为从站外进入的访问次数，不等同于独立读者人数。每次访问页数 = 浏览 ÷ 访问。</p>

  <section class="stats-panel stats-chart-panel">
    <div class="stats-panel-heading"><h2>Views</h2><span id="stats-period-label"></span></div>
    <div class="stats-chart" id="stats-chart" aria-label="每日浏览量图表"></div>
    <p class="stats-note">按芝加哥日期汇总；首尾日期可能只覆盖部分时段，今天尚未结束。</p>
  </section>

  <section class="stats-panel stats-recent-panel">
    <div class="stats-panel-heading"><h2>Recent posts</h2><span>最新 5 篇</span></div>
    <table class="stats-post-table">
      <caption class="stats-sr-only">最新文章：浏览与访问为所选时段，点赞为累计</caption>
      <thead><tr><th scope="col">文章</th><th scope="col">浏览</th><th scope="col">访问</th><th scope="col">累计赞</th></tr></thead>
      <tbody id="stats-recent-posts"></tbody>
    </table>
  </section>

  <section class="stats-panel stats-top-panel">
    <div class="stats-panel-heading"><h2>Top posts</h2><span>所选时段 · TOP 10</span></div>
    <table class="stats-post-table">
      <caption class="stats-sr-only">热门文章：浏览与访问为所选时段，点赞为累计</caption>
      <thead><tr><th scope="col">文章</th><th scope="col">浏览</th><th scope="col">访问</th><th scope="col">累计赞</th></tr></thead>
      <tbody id="stats-posts"></tbody>
    </table>
  </section>

  <section class="stats-comments" aria-labelledby="recent-comments-title">
    <div class="stats-panel-heading">
      <h2 id="recent-comments-title">Recent comments</h2>
      <label class="stats-comment-filter"><input id="stats-comments-reader-only" type="checkbox" checked>只看读者留言</label>
    </div>
    <ol class="stats-comments-list" id="stats-comments" aria-live="polite"><li class="stats-comments-loading">正在读取留言…</li></ol>
    <p class="stats-note" id="stats-comments-note">最新 8 条 · 不随上方时段切换</p>
  </section>

  <div class="stats-grid stats-support-grid">
  {% if site.data.zines.size > 0 %}
  <section class="stats-panel stats-zines" id="stats-zines" aria-labelledby="stats-zines-title">
    <div class="stats-panel-heading">
      <h2 id="stats-zines-title">ZINE downloads</h2>
      <span>累计下载次数</span>
    </div>
    <ol class="stats-zine-list">
      {% for zine in site.data.zines %}
      <li{% if zine.release_asset_id %} data-release-asset-id="{{ zine.release_asset_id | escape }}"{% endif %}>
        <div>
          <span class="stats-zine-issue">ISSUE {{ zine.issue | escape }}</span>
          <h3>{{ zine.title | escape }}</h3>
        </div>
        <strong class="stats-zine-count">{% if zine.release_asset_id %}—{% else %}未关联下载{% endif %}</strong>
      </li>
      {% endfor %}
    </ol>
    <div class="stats-zine-status-line">
      <p id="stats-zine-status" role="status"></p>
      <button id="stats-zine-retry" type="button" hidden>重新读取</button>
    </div>
    <p class="stats-zine-note">累计下载，不随上方时段切换；重复下载会重复计数。</p>
    <noscript><p class="stats-zine-note">开启 JavaScript 后可读取下载次数。</p></noscript>
  </section>
  {% endif %}


    <section class="stats-response" aria-labelledby="reader-response-title">
      <div class="stats-panel-heading"><h2 id="reader-response-title">Most liked</h2><span>全站累计</span></div>
      <div class="stats-response-card">
        <a id="response-most-liked">—</a>
        <small id="response-most-liked-meta">正在读取…</small>
      </div>
      <p class="stats-note">按当前文章的累计点赞比较，不随上方时段切换。</p>
    </section>
  </div>

  <div class="stats-grid stats-insight-grid">
    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>Traffic sources</h2><span>访问次数</span></div>
      <ol class="stats-list" id="stats-sources"></ol>
      <p class="stats-note">直接访问也包含未提供来源的访问。</p>
    </section>
    <section class="stats-panel">
      <div class="stats-panel-heading"><h2>Old post discovery</h2><span>文章浏览 · 占比</span></div>
      <ol class="stats-list" id="stats-post-age"></ol>
    </section>
  </div>

  <details class="stats-more">
    <summary>
      <span>More stats</span>
      <small>来源明细 · 分类 · 站内页面 · 国家</small>
    </summary>
    <section class="stats-panel stats-referrer-detail">
      <div class="stats-panel-heading"><h2>How readers found posts</h2><span>访问次数</span></div>
      <ol class="stats-list stats-referrer-post-list" id="stats-referrer-posts"></ol>
    </section>
    <div class="stats-grid stats-more-grid">
      <section class="stats-panel">
        <div class="stats-panel-heading"><h2>External referrers</h2><span>VISITS</span></div>
        <ol class="stats-list" id="stats-referrers"></ol>
      </section>

      <section class="stats-panel">
        <div class="stats-panel-heading">
          <h2>Site pages</h2>
          <div class="stats-heading-actions">
            <span>VIEWS · VISITS</span>
            <button id="stats-site-pages-toggle" type="button" hidden>Show archived / 404</button>
          </div>
        </div>
        <ol class="stats-list" id="stats-site-pages"></ol>
      </section>

      <section class="stats-panel">
        <div class="stats-panel-heading"><h2>Categories</h2><span>浏览 · 篇均浏览</span></div>
        <ol class="stats-list" id="stats-categories"></ol>
      </section>
      <section class="stats-panel">
        <div class="stats-panel-heading"><h2>Countries</h2><span>VIEWS</span></div>
        <ol class="stats-list" id="stats-countries"></ol>
      </section>
    </div>
  </details>

  <p class="stats-footnote">只显示汇总后的访问数据；这个页面本身不会计入 Cloudflare Analytics。External referrers 已排除 shioriblog.org 的站内跳转。</p>
</main>

<script>
  window.SHIO_STATS_CONFIG = {
    endpoint: {{ site.dashboard_api_url | jsonify }},
    twikooEnvId: {{ site.twikoo_env_id | jsonify }},
    commentAuthorNames: ["Shiori", "Shiori栞", "Shiori 栞"],
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
        {% if post.categories contains '食べたり、歩いたり' %}
          {% assign dashboard_like_id = post.date | date: 'post-%Y%m%d%H%M%S' %}
        {% elsif post.wordpress_id %}
          {% assign dashboard_like_id = 'post-' | append: post.wordpress_id %}
        {% else %}
          {% assign dashboard_like_id = post.date | date: 'post-%Y%m%d%H%M%S' %}
        {% endif %}
        {{ post.url | jsonify }}: {{ dashboard_like_id | jsonify }}{% unless forloop.last %},{% endunless %}
      {% endfor %}
    },
    validPaths: [
      {% for page in site.pages %}{{ page.url | jsonify }},{% endfor %}
      {% for post in site.posts %}{{ post.url | jsonify }}{% unless forloop.last %},{% endunless %}{% endfor %}
    ]
  }
</script>
<script src="{{ '/assets/js/zine-downloads.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
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
  .stats-recent-panel { margin-bottom: 3rem; }
  .stats-panel-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin-bottom: .85rem; }
  .stats-panel-heading h2 { margin: 0; color: var(--ink); font-family: var(--serif); font-size: 1.05rem; font-weight: 500; }
  .stats-panel-heading span { color: var(--muted); font-size: .62rem; letter-spacing: .08em; }
  .stats-heading-actions { display: flex; align-items: baseline; gap: .7rem; }
  .stats-heading-actions button { padding: 0; border: 0; border-bottom: 1px solid currentColor; background: transparent; color: var(--muted); font: inherit; font-size: .58rem; cursor: pointer; }
  .stats-heading-actions button:hover, .stats-heading-actions button:focus-visible { color: var(--accent); }
  .stats-list li.is-archived { opacity: .62; }
  .stats-page-status { display: inline-block; margin-left: .45rem; padding: .03rem .28rem; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); font-size: .5rem; line-height: 1.4; vertical-align: .08em; }
  .stats-zines { margin-bottom: 3rem; }
  .stats-zine-list { margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--line); }
  .stats-zine-list li { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 1.25rem; padding: 1rem 0; border-bottom: 1px solid var(--line); }
  .stats-zine-issue { display: block; margin-bottom: .3rem; color: var(--muted); font-size: .6rem; letter-spacing: .1em; }
  .stats-zine-list h3 { margin: 0; color: var(--body); font-family: var(--serif); font-size: .95rem; font-weight: 400; line-height: 1.6; overflow-wrap: anywhere; }
  .stats-zine-count { color: var(--ink); font-family: var(--serif); font-size: 1.65rem; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .stats-zine-count.is-unavailable { color: var(--muted); font-family: var(--sans); font-size: .68rem; }
  .stats-zine-status-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: .3rem .75rem; margin-top: .55rem; }
  .stats-zine-status-line p, .stats-zine-note { margin: 0; color: var(--muted); font-size: .61rem; line-height: 1.6; }
  .stats-zine-status-line p:empty { display: none; }
  .stats-zine-status-line button { padding: 0; border: 0; border-bottom: 1px solid currentColor; background: transparent; color: var(--accent); font: inherit; font-size: .65rem; cursor: pointer; }
  .stats-zine-status-line button:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
  .stats-zine-note { margin-top: .25rem; }
  .stats-chart { display: flex; align-items: end; gap: min(.8rem, 2vw); height: 190px; padding: 1.2rem 0 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .stats-bar-item { display: flex; flex: 1 1 0; min-width: 0; height: 100%; flex-direction: column; justify-content: flex-end; align-items: center; gap: .45rem; }
  .stats-bar-wrap { display: flex; width: min(32px, 72%); flex: 1; align-items: flex-end; }
  .stats-bar { width: 100%; min-height: 2px; background: var(--accent); opacity: .82; }
  .stats-bar-item time { min-height: 1.4rem; color: var(--muted); font-size: .58rem; line-height: 1.2; text-align: center; white-space: nowrap; }

  .stats-response { margin: 0 0 3rem; }
  .stats-response-heading { margin-bottom: .85rem; }
  .stats-response-grid { display: grid; grid-template-columns: repeat(2, 1fr); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
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

  .stats-main-grid { margin-bottom: 3rem; }
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
  .stats-more { margin: 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .stats-more summary { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: .9rem 0; color: var(--ink); cursor: pointer; list-style: none; }
  .stats-more summary::-webkit-details-marker { display: none; }
  .stats-more summary span { font-family: var(--serif); font-size: 1rem; }
  .stats-more summary small { color: var(--muted); font-size: .6rem; font-weight: 400; letter-spacing: .08em; }
  .stats-more summary::after { content: '＋'; margin-left: auto; color: var(--muted); font-size: .72rem; }
  .stats-more[open] summary::after { content: '−'; }
  .stats-more-grid { padding: 1.6rem 0 1.8rem; border-top: 1px solid var(--line); }
  .stats-footnote { margin: 2rem 0 0; color: var(--muted); font-size: .67rem; }

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
    .stats-more summary small { display: none; }
    .stats-chart { gap: .35rem; height: 160px; }
    .stats-bar-item time { font-size: .5rem; }
  }
  .stats-page { --stats-muted: #666963; }
  .stats-header { margin-bottom: 1rem; }
  .stats-lede { font-size: .82rem; }
  .stats-range button { min-height: 40px; font-size: .75rem; }
  .stats-range button:focus-visible, .stats-more summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
  .stats-period-details { margin: 0 0 1.2rem; color: var(--stats-muted); font-size: .73rem; line-height: 1.7; }
  .stats-summary { margin-bottom: .6rem; }
  .stats-summary span { color: var(--stats-muted); font-size: .7rem; }
  .stats-change { color: var(--stats-muted); font-size: .68rem; line-height: 1.5; }
  .stats-note, .stats-summary-note { margin: .55rem 0 0; color: var(--stats-muted); font-size: .7rem; line-height: 1.65; }
  .stats-summary-note { margin-bottom: 2rem; }
  .stats-panel-heading h2 { font-size: 1.1rem; }
  .stats-panel-heading span { color: var(--stats-muted); font-size: .7rem; letter-spacing: .025em; }
  .stats-chart-panel, .stats-recent-panel, .stats-top-panel, .stats-comments, .stats-insight-grid, .stats-support-grid { margin-bottom: 2.4rem; }
  .stats-post-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: .84rem; }
  .stats-post-table th { padding: .65rem 0; color: var(--stats-muted); font-size: .72rem; font-weight: 400; border-top: 1px solid var(--line); }
  .stats-post-table th, .stats-post-table td { text-align: right; border-bottom: 1px solid var(--line); }
  .stats-post-table th:first-child, .stats-post-table td:first-child { text-align: left; padding-right: 1rem; }
  .stats-post-table th:not(:first-child) { width: 4.4rem; }
  .stats-post-table td { padding: .78rem 0; color: var(--body); font-variant-numeric: tabular-nums; vertical-align: middle; }
  .stats-post-table a { display: block; color: var(--body); text-decoration: none; line-height: 1.55; overflow-wrap: anywhere; }
  .stats-post-table a:hover { color: var(--accent); }
  .stats-post-table time { display: block; margin-top: .18rem; color: var(--stats-muted); font-size: .69rem; }
  .stats-post-table .stats-empty { text-align: left; }
  .stats-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .stats-list li { font-size: .82rem; }
  .stats-list .stats-value, .stats-source-label { color: var(--stats-muted); }
  .stats-list span:first-child { min-width: 0; overflow-wrap: anywhere; }
  .stats-support-grid { align-items: start; }
  .stats-support-grid .stats-zines, .stats-support-grid .stats-response { margin-bottom: 0; }
  .stats-zine-list li { padding: .7rem 0; gap: .8rem; }
  .stats-zine-count { font-size: 1.45rem; }
  .stats-zine-issue, .stats-zine-status-line p, .stats-zine-note { color: var(--stats-muted); font-size: .7rem; }
  .stats-response-card { padding: 1rem 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .stats-response-card a { display: block; color: var(--body); font-family: var(--serif); font-size: 1rem; line-height: 1.6; text-decoration: none; overflow-wrap: anywhere; }
  .stats-response-card small { display: block; margin-top: .4rem; color: var(--stats-muted); font-size: .76rem; }
  .stats-comment-filter { display: inline-flex; align-items: center; gap: .4rem; color: var(--stats-muted); font-size: .75rem; cursor: pointer; white-space: nowrap; }
  .stats-comment-filter input { width: 1rem; height: 1rem; margin: 0; accent-color: var(--accent); }
  .stats-comment-nick { font-size: .78rem; }
  .stats-comment-time, .stats-comment-post { color: var(--stats-muted); font-size: .7rem; }
  .stats-comment-text { font-size: .88rem; }
  .stats-referrer-detail { padding: 1.5rem 0 0; border-top: 1px solid var(--line); }
  .stats-referrer-post-list li > span:first-child { white-space: normal; }
  .stats-more-grid { border-top: 0; gap: 2rem 3rem; }
  .stats-more summary small, .stats-footnote { color: var(--stats-muted); font-size: .7rem; }
  .stats-bar-item { position: relative; }
  .stats-bar-item:focus-visible { outline: 1px solid var(--accent); outline-offset: 3px; }
  .stats-bar-item:hover::after, .stats-bar-item:focus::after { content: attr(data-tooltip); position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); z-index: 1; padding: .25rem .4rem; background: var(--ink); color: white; font-size: .68rem; white-space: nowrap; }
  .stats-bar-item.is-partial .stats-bar { opacity: .48; }
  @media (max-width: 700px) {
    .stats-header { gap: .8rem; }
    .stats-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .stats-summary article, .stats-summary article:first-child { padding: .8rem .6rem; border-bottom: 0; border-right: 1px solid var(--line); }
    .stats-summary article:first-child { padding-left: 0; }
    .stats-summary article:last-child { border-right: 0; padding-right: 0; }
    .stats-summary strong { font-size: 1.55rem; }
    .stats-summary span { font-size: .6rem; letter-spacing: .02em; }
    .stats-change { font-size: .64rem; }
    .stats-post-table { font-size: .8rem; }
    .stats-post-table th:not(:first-child) { width: 3.25rem; }
    .stats-post-table th:first-child, .stats-post-table td:first-child { padding-right: .65rem; }
    .stats-post-table th { font-size: .68rem; }
    .stats-grid { gap: 2rem; }
    .stats-bar-item time { font-size: .6rem; }
    .stats-chart.is-dense .stats-bar-item time { visibility: hidden; }
    .stats-chart.is-dense .stats-bar-item:nth-child(5n + 1) time, .stats-chart.is-dense .stats-bar-item:last-child time { visibility: visible; }
    .stats-panel-heading { flex-wrap: wrap; gap: .4rem .7rem; }
  }
</style>
