"""为首页文章列表生成方形小图。

每篇文章的封面图：
- front matter 写了 cover: 图片路径 → 用这张
- 写了 cover: false → 不显示图，跳过
- 都没写 → 用正文里的第一张图

在 assets/images/covers/ 下生成同样路径、同样文件名的小图（居中裁成 320×320）。
已经存在的小图会跳过。首页（index.html）优先使用小图；小图不存在时自动退回原图。

用法：在仓库根目录运行 python3 tools/make_cover_thumbs.py
GitHub Actions 的「生成缩略图」会在推送后自动运行它。
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
POSTS_PREFIX = "/assets/images/posts/"
COVERS_PREFIX = "/assets/images/covers/"
SIZE = (320, 320)

FRONT_MATTER = re.compile(r"---\n(.*?)\n---\n?(.*)", re.S)
COVER_LINE = re.compile(r"^cover:\s*['\"]?([^'\"\n]*?)['\"]?\s*$", re.M)
MARKDOWN_IMAGE = re.compile(r"!\[[^\]]*\]\(\s*<?([^)\s>]+)")
HTML_IMAGE = re.compile(r"<img\b[^>]*?\bsrc=[\"']([^\"']+)[\"']", re.I)


def cover_images():
    for post in sorted((ROOT / "_posts").glob("*.md")):
        text = post.read_text(encoding="utf-8")
        match = FRONT_MATTER.match(text)
        if not match:
            continue
        front, body = match.groups()

        cover = COVER_LINE.search(front)
        if cover:
            value = cover.group(1).strip()
            if value.lower() in ("false", "no", "none", ""):
                continue
            yield post.name, value
            continue

        found = [m for m in (MARKDOWN_IMAGE.search(body), HTML_IMAGE.search(body)) if m]
        if found:
            first = min(found, key=lambda m: m.start())
            yield post.name, first.group(1).strip()


def cover_path(image):
    rest = image[len(POSTS_PREFIX):]
    return ROOT / (COVERS_PREFIX.lstrip("/") + rest)


def main():
    made = []
    for post_name, image in cover_images():
        if not image.startswith(POSTS_PREFIX):
            print(f"跳过（不在 {POSTS_PREFIX} 下）：{post_name} → {image}")
            continue
        source = ROOT / image.lstrip("/")
        if not source.exists():
            print(f"找不到图片：{post_name} → {image}", file=sys.stderr)
            continue
        target = cover_path(image)
        if target.exists():
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            thumb = ImageOps.fit(im, SIZE, Image.LANCZOS)
            ext = target.suffix.lower()
            if ext in (".jpg", ".jpeg"):
                thumb.save(target, "JPEG", quality=80, optimize=True, progressive=True)
            elif ext == ".webp":
                thumb.save(target, "WEBP", quality=80, method=6)
            else:
                thumb.save(target, optimize=True)
        made.append(target.relative_to(ROOT))
    for path in made:
        print(f"生成：{path}")
    print(f"共生成 {len(made)} 张首页小图。")


if __name__ == "__main__":
    main()
