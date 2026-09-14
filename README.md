# 独居日记

这是 `shioriblog.github.io`（之后连接 `shioriblog.org`）的 GitHub Pages / Jekyll 源文件。

## 发表一篇文章

1. 复制 `_drafts/post-template.md`。
2. 把副本放入 `_posts`，文件名写成 `YYYY-MM-DD-英文或拼音.md`。
3. 修改顶部的 `title`、`date`、`categories` 和 `excerpt`。
4. 在 Obsidian 中写正文并保存。
5. 使用 GitHub Desktop Commit，然后 Push。
6. GitHub Pages 会自动生成新页面、归档、分类和 RSS。

## 第一次上线

在 GitHub repository 的 **Settings → Pages → Build and deployment** 中把 Source 设为 **GitHub Actions**。

## 留言和订阅

- 在 `_config.yml` 填入 `buttondown_username` 后开启邮件订阅。
- 在 `_config.yml` 填入 `hyvor_website_id` 后开启访客留言和审核。

在服务尚未配置时，网站只显示“准备中”，不会收集访客资料。
