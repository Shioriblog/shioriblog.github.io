# 独居日记

[shioriblog.org](https://shioriblog.org/) 的 Jekyll 源文件。推送到 `main` 分支后，GitHub Pages 会自动重新生成网站，通常一两分钟内生效。

## 发表一篇文章

1. 复制 `_drafts/post-template.md`，放进 `_posts`，文件名写成 `YYYY-MM-DD-标题.md`。
2. 修改顶部的 `title`、`date`、`categories` 和 `excerpt`（首页显示的简介）。
3. 写正文，然后用 GitHub Desktop Commit 并 Push。

网址默认由 `date` 和文件名生成。如果写了 `permalink`，**发表后不要再改**：留言和点赞都跟着网址或日期走，改了会对不上。网址里最好不要有空格。

### 分类

| 分类 | 内容 | 页面 |
| --- | --- | --- |
| `日記の練習` | 日常随笔 | `/categories/daily/` |
| `うたかたの日々` | 岁月的泡沫：碎片、对话、月记 | `/categories/utakata/` |
| `言葉と歩く日記` | 旅行随笔 | `/categories/words/` |
| `食べたり、歩いたり` | 旅行吃喝记录 | `/travel/` |

`食べたり、歩いたり` 的文章需要多写几项，旅行页面会用到：

```yaml
travel_date: '2026-09-04'      # 旅行日期，旅行页按它排序
travel_place: 台南
travel_image: /assets/images/posts/2026/09/封面.jpg
travel_excerpt: 一两句话简介。
```

旅行页用的小图（`assets/images/thumbs/`）会在推送后由 GitHub Actions 的「生成旅行页缩略图」自动生成，也可以在本地运行 `python3 tools/make_travel_thumbs.py`。

### 引文

```markdown
> 原文
> <br>_（译文）_
> <br>—— 出处
```

译文会显示成浅灰色、不斜体的一行；出处显示成右对齐的小字。出处也可以单独成段（`> —— 出处`）。

### 图片

- 放在 `assets/images/posts/年/月/` 下面，文件名用英文、数字或连字符。
- 上传前把照片缩到最长边 2000px 左右，存成 JPG，单张最好在 1 MB 以内。
- **上传前关掉照片的位置信息**：iPhone 分享时点「选项」关掉「位置」，或在相册里上滑选「调整」→「无位置」。
  - 保险措施：推送后，GitHub Actions 的「去掉照片里的位置信息」会自动删掉照片里的 GPS 并重建网站（`.github/workflows/strip-photo-location.yml`）。但最初上传的那一版仍留在 git 历史里，所以上传前关掉位置仍然是最重要的一步。
- 写上图片说明：`![早饭的纳豆和味噌汤](/assets/images/posts/...)`，方便读屏软件和图片加载失败时显示。

文章里的图片会自动延迟加载。`default.html` 里还有一段按屏幕大小压缩图片的设置（Cloudflare 图片转换），只有在域名开启 Cloudflare 代理并打开图片转换后才会生效；没开启时直接显示原图。

## ZINE

1. 在 GitHub 的 Releases 里上传 PDF（下载按钮和下载统计用的是 Release 里的文件）。
2. 同一份 PDF 也放进 `assets/zines/`，在线阅读器读的是这里的文件。
3. 在 `_data/zines.yml` 最上面加一期，按文件里的注释填写。

## 网站用到的外部服务

| 功能 | 服务 | 设置在哪里 |
| --- | --- | --- |
| 留言 | Twikoo，后端在 Netlify | `_config.yml` 的 `twikoo_env_id` |
| 邮件订阅 | Brevo | `_includes/subscription.html` 和 `about.md` 里的表单 |
| 访问统计 | Cloudflare Web Analytics | `_config.yml` 的 `cloudflare_beacon_token` |
| 点赞、阅读统计页 | 自己的 Cloudflare Worker（`shiori-stats`） | `cloudflare-worker/`，网址在 `_config.yml` 的 `dashboard_api_url` |
| ZINE 下载数 | GitHub Releases 的下载计数 | `_data/zines.yml` 的 `release_asset_id` |
| 网络和图片压缩 | Cloudflare | 域名 DNS |

换服务或加服务时，记得同步更新 `privacy.md`。

### Cloudflare Worker

代码在 `cloudflare-worker/src/index.js`，配置是根目录的 `wrangler.jsonc`。Cloudflare 已经连接了这个仓库（Workers Builds），推送到 `main` 后会自动重新部署，不需要手动操作。需要手动部署时，在仓库根目录运行 `npx wrangler deploy`。

需要的密钥（已经设置过，换 token 时才需要重新设置）：

```sh
npx wrangler secret put CF_API_TOKEN
npx wrangler secret put CF_ACCOUNT_ID
```

阅读统计页在 `/dashboard/`，不会被搜索引擎收录，但没有密码，知道网址的人都能打开。

统计页顶部有「这台设备不计入统计」开关，勾选后这个浏览器访问博客不会被 Cloudflare 统计。每台设备、每个浏览器要分别勾选，清除浏览器数据后需要重新勾选。

## 其他页面

- `about.md` 关于、`friends.md` 友链、`privacy.md` 隐私说明
- `newsletter.xml` 是全站唯一对外的 RSS（最近 10 篇的摘要），页脚、订阅弹窗和关于页都链接到它；`feed.xml` 由插件自动生成（全文），网站上不再链接，但保留给已经订阅它的读者
