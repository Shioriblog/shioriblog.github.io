"""为旅行页生成缩略图。

读取 _posts 里每篇文章的 travel_image，在 assets/images/thumbs/ 下生成
同样路径、同样文件名的小图（居中裁成 3:2，480×320）。已经存在的小图会跳过。
旅行页（travel.html）优先使用小图；小图不存在时自动退回原图。

用法：在仓库根目录运行 python3 tools/make_travel_thumbs.py
GitHub Actions 的「生成旅行页缩略图」会在推送后自动运行它。
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
POSTS_PREFIX = "/assets/images/posts/"
THUMBS_PREFIX = "/assets/images/thumbs/"
SIZE = (480, 320)


def travel_images():
    for post in sorted((ROOT / "_posts").glob("*.md")):
        text = post.read_text(encoding="utf-8")
        match = re.match(r"---\n(.*?)\n---", text, re.S)
        if not match:
            continue
        found = re.search(r"^travel_image:\s*['\"]?([^'\"\n]+?)['\"]?\s*$", match.group(1), re.M)
        if found:
            yield post.name, found.group(1).strip()


def thumb_path(image):
    rest = image[len(POSTS_PREFIX):]
    return ROOT / (THUMBS_PREFIX.lstrip("/") + rest)


def main():
    made = []
    for post_name, image in travel_images():
        if not image.startswith(POSTS_PREFIX):
            print(f"跳过（不在 {POSTS_PREFIX} 下）：{post_name} → {image}")
            continue
        source = ROOT / image.lstrip("/")
        if not source.exists():
            print(f"找不到图片：{post_name} → {image}", file=sys.stderr)
            continue
        target = thumb_path(image)
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
    print(f"共生成 {len(made)} 张缩略图。")


if __name__ == "__main__":
    main()
