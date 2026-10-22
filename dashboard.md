---
layout: default
title: 阅读手记
permalink: /dashboard/
robots: noindex, nofollow
sitemap: false
analytics: false
subscription: false
---

<main class="dash" id="content">
  <header class="dash-header">
    <p class="dash-kicker" id="dash-kicker">Reading notes</p>
    <h1>阅读手记</h1>
    <p class="dash-range-text" id="dash-range-text">正在翻开记录…</p>
    <div class="dash-range" role="group" aria-label="统计时段">
      <button type="button" data-days="1" aria-pressed="false">今天</button>
      <button type="button" data-days="7" aria-pressed="true">这一周</button>
      <button type="button" data-days="30" aria-pressed="false">这一个月</button>
    </div>
  </header>

  <p class="dash-notice" id="dash-setup" hidden>统计页还没有连接 Cloudflare Worker（<code>_config.yml</code> 的 <code>dashboard_api_url</code>）。</p>
  <p class="dash-notice is-error" id="dash-error" role="alert" hidden></p>

  <section class="dash-opening" aria-label="概要">
    <p class="dash-lede" id="dash-lede" aria-live="polite">正在读取统计……</p>
    <div class="dash-metrics">
      <div><span class="dash-label">浏览</span><strong id="dash-views">—</strong><small id="dash-views-note"></small></div>
      <div><span class="dash-label">访问</span><strong id="dash-visits">—</strong><small id="dash-visits-note"></small></div>
      <div><span class="dash-label">每次访问页数</span><strong id="dash-ppv">—</strong><small id="dash-ppv-note"></small></div>
    </div>
  </section>

  <section class="dash-section" aria-labelledby="dash-h-echo">
    <div class="dash-heading"><span>i.</span><h2 id="dash-h-echo">回声</h2></div>
    <div class="dash-echo">
      <div class="dash-comments">
        <div class="dash-subhead">
          <span class="dash-label">最新的留言</span>
          <label class="dash-check"><input id="dash-comments-reader-only" type="checkbox" checked>只看读者留言</label>
        </div>
        <ol class="dash-comment-list" id="dash-comments" aria-live="polite"><li class="dash-empty">正在读取留言…</li></ol>
        <p class="dash-small" id="dash-comments-note">不随上方时段切换</p>
      </div>

      {% if site.data.zines.size > 0 %}
      {% assign latest_zine = site.data.zines | first %}
      <div class="dash-zine">
        <span class="dash-label">ZINE · ISSUE {{ latest_zine.issue | escape }}</span>
        <a class="dash-zine-cover" href="{{ '/zines/' | relative_url }}">
          <img src="{{ latest_zine.cover | relative_url }}" alt="独居日记 ZINE Issue {{ latest_zine.issue | escape }}《{{ latest_zine.title | escape }}》封面"{% if latest_zine.cover_width %} width="{{ latest_zine.cover_width }}" height="{{ latest_zine.cover_height }}"{% endif %}>
        </a>
        <p class="dash-zine-title">{{ latest_zine.title | escape }}</p>
        <p class="dash-zine-count" data-zine-count{% if latest_zine.release_asset_id %} data-release-asset-id="{{ latest_zine.release_asset_id | escape }}"{% endif %}>
          <strong>{% if latest_zine.release_asset_id %}—{% else %}未关联下载{% endif %}</strong>{% if latest_zine.release_asset_id %}<span>次下载</span>{% endif %}
        </p>
        <p class="dash-small">{% if latest_zine.date_label %}{{ latest_zine.date_label | escape }} 发布以来累计 · {% endif %}重复下载会重复计数</p>
        {% if site.data.zines.size > 1 %}
        <ol class="dash-zine-more">
          {% for zine in site.data.zines offset: 1 %}
          <li data-zine-count{% if zine.release_asset_id %} data-release-asset-id="{{ zine.release_asset_id | escape }}"{% endif %}>
            <span>Issue {{ zine.issue | escape }} · {{ zine.title | escape }}</span>
            <strong>{% if zine.release_asset_id %}—{% else %}未关联{% endif %}</strong>
          </li>
          {% endfor %}
        </ol>
        {% endif %}
      </div>
      {% endif %}
    </div>
  </section>

  <section class="dash-section" aria-labelledby="dash-h-days">
    <div class="dash-heading"><span>ii.</span><h2 id="dash-h-days">每一天</h2></div>
    <div class="dash-scroll">
      <ol class="dash-days" id="dash-days"></ol>
    </div>
    <p class="dash-small">按芝加哥日期汇总；第一天和最后一天可能只覆盖部分时段。柱子太窄放不下数字时，把鼠标停在柱子上可以看到当天的浏览数。</p>
  </section>

  <section class="dash-section" aria-labelledby="dash-h-posts">
    <div class="dash-heading"><span>iii.</span><h2 id="dash-h-posts" data-range-title="被读的文章">这一周被读的文章</h2></div>
    <div class="dash-scroll">
      <table class="dash-posts">
        <caption class="dash-sr-only">浏览与访问为所选时段，心为累计</caption>
        <thead><tr><th scope="col">文章</th><th scope="col">浏览</th><th scope="col">访问</th><th scope="col">累计心</th></tr></thead>
        <tbody id="dash-posts"></tbody>
      </table>
    </div>
    <p class="dash-note" id="dash-old-posts" hidden></p>
  </section>

  <section class="dash-section" aria-labelledby="dash-h-sources">
    <div class="dash-heading"><span>iv.</span><h2 id="dash-h-sources">从哪里来</h2></div>
    <p class="dash-note" id="dash-sources-lede"></p>
    <div class="dash-sources-bar" id="dash-sources-bar" aria-hidden="true"></div>
    <ol class="dash-rows" id="dash-sources"></ol>
    <p class="dash-small" id="dash-sources-more" hidden></p>
  </section>

  <section class="dash-section" aria-labelledby="dash-h-countries">
    <div class="dash-heading"><span>v.</span><h2 id="dash-h-countries">读者在哪里</h2></div>
    <p class="dash-note" id="dash-countries-lede"></p>
    <ol class="dash-countries" id="dash-countries"></ol>
    <p class="dash-small" id="dash-countries-more" hidden></p>
  </section>

  <section class="dash-section" aria-labelledby="dash-h-likes">
    <div class="dash-heading"><span>vi.</span><h2 id="dash-h-likes">收到的心</h2></div>
    <div class="dash-likes">
      <div>
        <span class="dash-label"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"></path></svg>全站累计的心</span>
        <strong class="dash-likes-total" id="dash-likes-total">—</strong>
        <ol class="dash-rows is-compact" id="dash-likes"></ol>
      </div>
      <div>
        <span class="dash-label"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l2.5 2.5"></path></svg>最近收到心的文章</span>
        <ol class="dash-rows is-compact dash-recent-likes" id="dash-recent-likes"><li class="dash-empty">正在读取…</li></ol>
        <p class="dash-small" id="dash-recent-likes-note">不随上方时段切换</p>
      </div>
      <p class="dash-note" id="dash-likes-note"></p>
    </div>
  </section>

  <footer class="dash-footer">
    <p>浏览是页面被打开的次数；访问是从站外进来的次数，不等于读者人数。</p>
    <p id="dash-updated">数据来自 Cloudflare Web Analytics，每 10 分钟刷新一次。</p>
    <label class="dash-check"><input id="stats-skip-self" type="checkbox">这台设备不计入统计</label>
  </footer>
</main>

<script>
  window.SHIO_STATS_CONFIG = {
    endpoint: {{ site.dashboard_api_url | jsonify }},
    twikooEnvId: {{ site.twikoo_env_id | jsonify }},
    twikooScript: "https://cdn.jsdelivr.net/npm/twikoo@1.7.22/dist/twikoo.all.min.js",
    commentAuthorNames: ["Shiori", "Shiori栞", "Shiori 栞"],
    posts: {
      {% for post in site.posts %}
        {% if post.categories contains '食べたり、歩いたり' %}
          {% assign dashboard_like_id = post.date | date: 'post-%Y%m%d%H%M%S' %}
        {% elsif post.wordpress_id %}
          {% assign dashboard_like_id = 'post-' | append: post.wordpress_id %}
        {% else %}
          {% assign dashboard_like_id = post.date | date: 'post-%Y%m%d%H%M%S' %}
        {% endif %}
        {{ post.url | jsonify }}: { "title": {{ post.title | jsonify }}, "date": {{ post.date | date_to_xmlschema | jsonify }}, "like": {{ dashboard_like_id | jsonify }} }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    }
  }
</script>
<script>
  (() => {
    const toggle = document.getElementById('stats-skip-self')
    if (!toggle) return
    const key = 'shiori-skip-analytics'
    try {
      toggle.checked = localStorage.getItem(key) === '1'
    } catch (_) {
      toggle.disabled = true
      toggle.parentElement.title = '这个浏览器不能保存设置'
      return
    }
    toggle.addEventListener('change', () => {
      try {
        if (toggle.checked) localStorage.setItem(key, '1')
        else localStorage.removeItem(key)
      } catch (_) {}
    })
  })()
</script>
<script src="{{ '/assets/js/dashboard.js' | relative_url }}?v={{ site.time | date: '%s' }}" defer></script>

<style>
  .dash { width: min(760px, calc(100% - 2.5rem)); margin: 0 auto; padding: 1rem 0 5.5rem; color: var(--body); }
  .dash-header { padding: 3.5rem 0 2.4rem; border-bottom: 1px solid var(--line); }
  .dash-kicker { margin: 0 0 .8rem; color: var(--accent); font-family: "Source Serif 4", var(--serif); font-size: .8rem; font-style: italic; letter-spacing: .2em; }
  .dash-header h1 { margin: 0; color: var(--ink); font-size: clamp(2.1rem, 6vw, 2.75rem); font-weight: 500; line-height: 1.25; }
  .dash-range-text { margin: .8rem 0 0; color: var(--muted); font-family: "Source Serif 4", var(--serif); font-size: .92rem; }
  .dash-range { display: flex; flex-wrap: wrap; gap: .25rem; margin-top: 1.6rem; }
  .dash-range button { min-height: 44px; padding: 0 1rem; border: 1px solid transparent; background: transparent; color: var(--muted); font-family: var(--sans); font-size: .85rem; cursor: pointer; }
  .dash-range button:hover { color: var(--ink); }
  .dash-range button[aria-pressed="true"] { border-color: var(--ink); color: var(--ink); }
  .dash-range button:disabled { cursor: progress; }
  .dash-range button:focus-visible, .dash-check input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .dash-notice { margin: 2rem 0 0; padding: .8rem 1rem; background: var(--soft); font-family: var(--sans); font-size: .85rem; line-height: 1.7; }
  .dash-notice.is-error { color: #7a3f33; }

  .dash-opening { padding: 3rem 0 3.4rem; border-bottom: 1px solid var(--line); }
  .dash-lede { margin: 0; color: var(--ink); font-size: clamp(1.15rem, 3.2vw, 1.38rem); line-height: 2; }
  .dash-lede b { font-family: "Source Serif 4", var(--serif); font-weight: 600; border-bottom: 2px solid var(--accent); }
  .dash-metrics { display: flex; flex-wrap: wrap; gap: 1.5rem 2rem; margin-top: 2.2rem; font-family: var(--sans); }
  .dash-metrics > div { flex: 1 1 150px; }
  .dash-metrics strong { display: block; margin-top: .2rem; color: var(--ink); font-family: "Source Serif 4", var(--serif); font-size: 2.1rem; font-weight: 400; line-height: 1.25; font-variant-numeric: tabular-nums; }
  .dash-metrics small { display: block; min-height: 1.4em; color: var(--muted); font-size: .8rem; }
  .dash-metrics small.is-up { color: var(--accent); }
  .dash-label { display: inline-flex; align-items: center; gap: .45rem; color: var(--muted); font-family: var(--sans); font-size: .75rem; letter-spacing: .12em; }
  .dash-label svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

  .dash-section { padding: 3.4rem 0; border-bottom: 1px solid var(--line); }
  .dash-heading { display: flex; align-items: baseline; gap: .85rem; margin-bottom: 1.6rem; }
  .dash-heading span { color: var(--accent); font-family: "Source Serif 4", var(--serif); font-size: .95rem; font-style: italic; }
  .dash-heading h2 { margin: 0; color: var(--ink); font-size: 1.35rem; font-weight: 500; line-height: 1.4; }
  .dash-note { margin: 0 0 1.6rem; color: var(--body); font-size: 1rem; line-height: 1.9; }
  .dash-note:last-child { margin-bottom: 0; }
  .dash-small { margin: .9rem 0 0; color: var(--muted); font-family: var(--sans); font-size: .8rem; line-height: 1.9; }
  .dash-empty { color: var(--muted); font-family: var(--sans); font-size: .85rem; }
  .dash-scroll { max-width: 100%; overflow-x: auto; scrollbar-color: #c8c3bb transparent; }
  .dash-sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .dash-check { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; color: var(--muted); font-family: var(--sans); font-size: .8rem; cursor: pointer; }
  .dash-check input { width: 16px; height: 16px; margin: 0; accent-color: var(--accent); }

  .dash-echo { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 2.5rem 3rem; }
  .dash-comments { flex: 999 1 380px; min-width: 0; }
  .dash-subhead { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; }
  .dash-comment-list { margin: 0; padding: 0; list-style: none; border-bottom: 1px solid var(--line); }
  .dash-comment-list > li { padding: 1.05rem 0; border-top: 1px solid var(--line); }
  .dash-comment-meta { margin: 0 0 .3rem; color: var(--muted); font-family: var(--sans); font-size: .8rem; line-height: 1.7; }
  .dash-comment-meta b { color: var(--ink); font-weight: 500; }
  .dash-comment-meta a { color: var(--muted); }
  .dash-comment-text { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--body); font-size: 1rem; line-height: 1.9; text-decoration: none; }
  .dash-comment-text:hover { color: var(--accent); }
  .dash-zine { flex: 1 1 200px; min-width: 0; max-width: 280px; }
  .dash-zine-cover { display: block; margin-top: 1rem; }
  .dash-zine-cover img { display: block; width: 100%; max-width: 190px; height: auto; box-shadow: 6px 8px 0 var(--soft); }
  .dash-zine-title { margin: 1.3rem 0 .6rem; color: var(--ink); font-size: 1.1rem; line-height: 1.6; }
  .dash-zine-count { display: flex; align-items: baseline; gap: .55rem; margin: 0; }
  .dash-zine-count strong { color: var(--ink); font-family: "Source Serif 4", var(--serif); font-size: 2.6rem; font-weight: 400; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .dash-zine-count span { color: var(--muted); font-family: var(--sans); font-size: .85rem; }
  .dash-zine-count.is-unavailable strong { font-size: 1rem; color: var(--muted); }
  .dash-zine-more { margin: 1rem 0 0; padding: 0; list-style: none; font-family: var(--sans); font-size: .8rem; }
  .dash-zine-more li { display: flex; justify-content: space-between; gap: 1rem; padding: .4rem 0; border-top: 1px solid var(--line); }
  .dash-zine-more strong { font-weight: 400; color: var(--ink); }

  .dash-days { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(58px, 1fr); gap: .5rem; min-width: 100%; margin: 0; padding: 0; list-style: none; font-family: var(--sans); }
  .dash-days li { display: flex; flex-direction: column; align-items: center; gap: .45rem; min-width: 0; }
  .dash-day-count { color: var(--body); font-family: "Source Serif 4", var(--serif); font-size: .95rem; font-variant-numeric: tabular-nums; }
  .dash-day-bar { display: flex; align-items: flex-end; justify-content: center; width: 100%; height: 130px; }
  .dash-day-bar i { display: block; width: 22px; min-height: 2px; background: #d9d4cb; }
  .dash-days li.is-published .dash-day-bar i { background: var(--accent); }
  .dash-days li.is-published .dash-day-count { color: var(--ink); font-weight: 500; }
  .dash-days li.is-today .dash-day-bar i { width: 20px; border: 1px dashed #a8a29a; background: transparent; }
  .dash-day-date { color: var(--ink); font-size: .8rem; }
  .dash-day-week { color: var(--muted); font-size: .75rem; }
  .dash-day-note { color: var(--accent); font-family: var(--serif); font-size: .75rem; line-height: 1.5; text-align: center; overflow-wrap: anywhere; }
  .dash-days.is-dense { grid-auto-columns: minmax(18px, 1fr); gap: .25rem; }
  .dash-days.is-dense .dash-day-count { display: none; }
  .dash-days.is-dense .dash-day-bar { height: 110px; }
  .dash-days.is-dense .dash-day-bar i { width: 10px; }
  .dash-days.is-dense li.is-today .dash-day-bar i { width: 8px; }
  .dash-days.is-dense .dash-day-week, .dash-days.is-dense .dash-day-note { display: none; }
  .dash-days.is-dense .dash-day-date { font-size: .68rem; white-space: nowrap; }

  .dash-posts { width: 100%; min-width: 480px; border-collapse: collapse; margin-bottom: 1.6rem; }
  .dash-posts th { padding: 0 0 .6rem; color: var(--muted); font-family: var(--sans); font-size: .75rem; font-weight: 400; letter-spacing: .08em; text-align: right; }
  .dash-posts th:first-child { text-align: left; }
  .dash-posts td { padding: .85rem 0 .85rem .9rem; border-top: 1px solid var(--line); color: var(--muted); font-family: "Source Serif 4", var(--serif); font-size: 1.02rem; text-align: right; vertical-align: baseline; font-variant-numeric: tabular-nums; width: 4.2rem; }
  .dash-posts td:first-child { width: auto; padding-left: 0; text-align: left; font-family: var(--serif); }
  .dash-posts td:nth-child(2) { color: var(--ink); }
  .dash-posts td.has-likes { color: var(--ink); }
  .dash-posts tr:last-child td { border-bottom: 1px solid var(--line); }
  .dash-posts td a { color: var(--ink); text-decoration: none; border-bottom: 1px solid #d6d1c8; }
  .dash-posts td a:hover { color: var(--accent); border-bottom-color: var(--accent); }
  .dash-posts small { display: block; margin-top: .2rem; color: var(--accent); font-family: var(--sans); font-size: .75rem; }

  .dash-sources-bar { display: flex; gap: 2px; height: 10px; margin-bottom: 1.6rem; }
  .dash-sources-bar i { display: block; min-width: 2px; background: #d9d4cb; }
  .dash-sources-bar i:nth-child(2) { background: var(--accent); }
  .dash-sources-bar i:nth-child(3) { background: #8f978a; }
  .dash-rows { margin: 0; padding: 0; list-style: none; border-bottom: 1px solid var(--line); font-family: var(--sans); }
  .dash-rows li { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: .75rem 0; border-top: 1px solid var(--line); color: var(--ink); font-size: .95rem; }
  .dash-rows li > span:first-child { min-width: 0; overflow-wrap: anywhere; }
  .dash-rows small { color: var(--muted); font-size: .8rem; }
  .dash-rows small.is-accent { color: var(--accent); }
  .dash-rows b { color: var(--ink); font-family: "Source Serif 4", var(--serif); font-size: 1.05rem; font-weight: 400; font-variant-numeric: tabular-nums; }
  .dash-rows.is-compact li { padding: .55rem 0; font-family: var(--serif); font-size: .95rem; }
  .dash-rows.is-compact b { color: var(--muted); }

  .dash-countries { display: flex; flex-wrap: wrap; align-items: baseline; gap: .6rem 1.75rem; margin: 0; padding: 0; list-style: none; color: var(--ink); line-height: 1.5; }
  .dash-countries span { color: var(--muted); font-family: "Source Serif 4", var(--serif); }

  .dash-likes { display: flex; flex-wrap: wrap; gap: 2rem 2.5rem; }
  .dash-likes > div, .dash-likes > p { flex: 1 1 280px; min-width: 0; }
  .dash-recent-likes { margin-top: .9rem; }
  .dash-recent-likes small { flex: none; }
  .dash-likes-total { display: block; margin: .3rem 0 1rem; color: var(--ink); font-family: "Source Serif 4", var(--serif); font-size: 2.5rem; font-weight: 400; line-height: 1.2; }

  .dash-footer { padding-top: 2.4rem; color: var(--muted); font-family: var(--sans); font-size: .8rem; line-height: 1.9; }
  .dash-footer p { margin: 0; }
  .dash-footer .dash-check { margin-top: .6rem; }

  @media (max-width: 640px) {
    .dash-header { padding-top: 2.2rem; }
    .dash-section { padding: 2.6rem 0; }
    .dash-zine { max-width: none; }
    .dash-posts { min-width: 0; }
    .dash-posts td { width: 2.6rem; padding-left: .5rem; font-size: .95rem; }
    .dash-posts th { font-size: .7rem; letter-spacing: 0; }
  }
</style>
