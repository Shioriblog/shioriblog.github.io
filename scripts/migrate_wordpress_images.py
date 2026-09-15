#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import html
import io
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
WP_PREFIX = "https://shioriblogorg.wordpress.com/wp-content/uploads/"
URL_RE = re.compile(r"https://shioriblogorg\.wordpress\.com/wp-content/uploads/[^\s\"'<>\)\]]+")
TEXT_EXTS = {".md", ".markdown", ".html", ".htm", ".yml", ".yaml", ".css"}
RASTER_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_DIMENSION = 2000
JPEG_QUALITY = 84
WEBP_QUALITY = 84


def text_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if rel.parts and rel.parts[0] in {".git", "_site"}:
            continue
        if str(rel).startswith("assets/images/posts/"):
            continue
        if path.suffix.lower() in TEXT_EXTS:
            files.append(path)
    return files


def canonicalize(raw_url: str) -> tuple[str, str]:
    clean = html.unescape(raw_url)
    parsed = urlsplit(clean)
    marker = "/wp-content/uploads/"
    if marker not in parsed.path:
        raise ValueError(clean)
    relative = parsed.path.split(marker, 1)[1]
    canonical = WP_PREFIX + relative
    return canonical, relative


def local_path_for(relative: str) -> tuple[Path, str]:
    parts = relative.split("/")
    year = parts[0] if len(parts) > 0 and re.fullmatch(r"\d{4}", parts[0]) else "misc"
    month = parts[1] if len(parts) > 1 and re.fullmatch(r"\d{2}", parts[1]) else "misc"
    source_name = unquote(parts[-1]) if parts else "image"
    ext = Path(source_name).suffix.lower()
    if not re.fullmatch(r"\.[a-z0-9]{2,5}", ext):
        ext = ".jpg"
    digest = hashlib.sha1(relative.encode("utf-8")).hexdigest()[:16]
    rel_path = Path("assets") / "images" / "posts" / year / month / f"{digest}{ext}"
    return ROOT / rel_path, "/" + rel_path.as_posix()


def optimized_bytes(content: bytes, ext: str) -> bytes:
    if ext not in RASTER_EXTS:
        return content
    try:
        with Image.open(io.BytesIO(content)) as source:
            image = ImageOps.exif_transpose(source)
            image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
            out = io.BytesIO()
            if ext in {".jpg", ".jpeg"}:
                if image.mode not in {"RGB", "L"}:
                    image = image.convert("RGB")
                image.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
            elif ext == ".png":
                image.save(out, format="PNG", optimize=True)
            elif ext == ".webp":
                image.save(out, format="WEBP", quality=WEBP_QUALITY, method=6)
            return out.getvalue()
    except Exception as exc:
        print(f"WARN: could not optimize image; keeping original bytes: {exc}")
        return content


def main() -> int:
    files = text_files()
    file_text: dict[Path, str] = {}
    raw_urls: set[str] = set()

    for path in files:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        file_text[path] = text
        raw_urls.update(URL_RE.findall(text))

    if not raw_urls:
        print("No WordPress upload URLs found.")
        return 0

    canonical_to_local: dict[str, tuple[Path, str]] = {}
    for raw in sorted(raw_urls):
        canonical, relative = canonicalize(raw)
        canonical_to_local.setdefault(canonical, local_path_for(relative))

    print(f"Found {len(raw_urls)} URL variants pointing to {len(canonical_to_local)} unique WordPress media files.")

    session = requests.Session()
    session.headers.update({"User-Agent": "ShioriBlog-Media-Migration/1.0"})
    failures: list[tuple[str, str]] = []
    downloaded = 0
    before_bytes = 0
    after_bytes = 0

    for index, (canonical, (dest, _public_url)) in enumerate(sorted(canonical_to_local.items()), start=1):
        if dest.exists():
            print(f"[{index}/{len(canonical_to_local)}] exists {dest.relative_to(ROOT)}")
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            response = session.get(canonical, timeout=90)
            response.raise_for_status()
            original = response.content
            if not original:
                raise RuntimeError("empty response")
            ext = dest.suffix.lower()
            final = optimized_bytes(original, ext)
            dest.write_bytes(final)
            downloaded += 1
            before_bytes += len(original)
            after_bytes += len(final)
            print(f"[{index}/{len(canonical_to_local)}] saved {dest.relative_to(ROOT)} ({len(final) / 1024:.0f} KiB)")
        except Exception as exc:
            failures.append((canonical, str(exc)))
            print(f"ERROR: {canonical}: {exc}")

    if failures:
        print("\nMigration stopped because some media could not be downloaded. No text references were changed.")
        for url, error in failures:
            print(f"- {url}: {error}")
        return 1

    changed_files = 0
    replacement_count = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal replacement_count
        raw = match.group(0)
        canonical, _relative = canonicalize(raw)
        replacement_count += 1
        return canonical_to_local[canonical][1]

    for path, text in file_text.items():
        updated = URL_RE.sub(replace, text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed_files += 1

    print(f"\nUpdated {changed_files} text files and {replacement_count} WordPress URL references.")
    print(f"Downloaded {downloaded} media files.")
    if downloaded:
        print(f"Image bytes: {before_bytes / 1024 / 1024:.1f} MiB original -> {after_bytes / 1024 / 1024:.1f} MiB stored.")
    print("All migrated media now live under /assets/images/posts/YYYY/MM/.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
