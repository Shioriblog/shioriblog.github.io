from pathlib import Path
import re

TAGS = {
    "2025-02-16-不甘心.md": ["読む・観る", "考える"],
    "2025-02-19-早餐的三明治.md": ["食べる", "暮らす"],
    "2025-02-20-そわそわ.md": ["言葉", "暮らす"],
    "2025-02-21-家务大罢工的周五.md": ["暮らす", "読む・観る"],
    "2025-02-23-春天来了，我所向无敌.md": ["暮らす"],
    "2025-02-25-2月：生活的基石.md": ["暮らす", "考える", "読む・観る"],
    "2025-02-28-食欲与情绪.md": ["食べる", "考える"],
    "2025-03-01-缺德舅就是我的花店和酒铺.md": ["食べる", "暮らす"],
    "2025-03-03-成年人的生活就是毫无情绪地未雨绸缪.md": ["暮らす", "考える"],
    "2025-03-04-维修和动手能力.md": ["暮らす", "考える"],
    "2025-03-06-待在自己的舒适区里.md": ["暮らす", "考える"],
    "2025-03-10-被偷走了一小时.md": ["暮らす", "考える"],
    "2025-03-11-出差随想.md": ["暮らす", "考える"],
    "2025-03-13-出差随想2.md": ["暮らす", "考える"],
    "2025-03-14-回到日常生活的琐碎中去.md": ["暮らす"],
    "2025-03-17-优秀的成年人.md": ["考える", "暮らす"],
    "2025-03-19-普通酒鬼.md": ["食べる", "暮らす"],
    "2025-03-23-春天啦！.md": ["暮らす"],
    "2025-03-24-3月：语言的无政府主义.md": ["言葉", "考える"],
    "2025-03-27-质疑老登，理解老登，超越老登.md": ["考える", "読む・観る"],
    "2025-03-30-我家的料理.md": ["食べる", "暮らす"],
    "2025-04-01-春愁.md": ["暮らす", "考える"],
    "2025-04-03-像养小孩一样养育自己.md": ["暮らす", "考える"],
    "2025-04-07-在风暴的中心.md": ["暮らす", "考える"],
    "2025-04-11-强大的人.md": ["考える"],
    "2025-04-17-焦虑，愤怒与反抗.md": ["考える"],
    "2025-04-30-4月：与世界的联系.md": ["暮らす", "考える"],
    "2025-05-02-生病.md": ["暮らす"],
    "2025-05-07-独处的时间.md": ["暮らす", "考える"],
    "2025-05-13-选择一个人活下去这件事情.md": ["暮らす", "考える"],
    "2025-05-19-开始学习贝斯啦.md": ["読む・観る", "暮らす"],
    "2025-05-22-有梦想无计划就是人生.md": ["考える", "暮らす"],
    "2025-05-29-5月：sumor-or-one-and-together.md": ["考える", "暮らす"],
    "2025-06-16-生日-2025.md": ["暮らす", "考える"],
    "2025-06-23-青春物语.md": ["読む・観る", "考える"],
    "2025-07-07-有惊无险.md": ["暮らす"],
    "2025-08-12-回家.md": ["暮らす", "考える"],
    "2025-08-24-故事的发生.md": ["暮らす", "考える", "読む・観る"],
    "2025-09-09-差不多.md": ["暮らす", "食べる"],
    "2025-09-20-吃东西是一项积极的行为.md": ["食べる", "考える"],
    "2025-09-24-某种中年危机.md": ["考える", "暮らす"],
    "2025-10-20-糖炒栗子是幸福的味道.md": ["食べる", "暮らす"],
    "2025-11-11-准备过冬.md": ["暮らす"],
    "2025-12-31-再见2025.md": ["暮らす", "考える"],
    "2026-01-26-起飞.md": ["暮らす", "考える"],
    "2026-03-09-回来了.md": ["暮らす"],
    "2026-04-17-酒和梦是四月的解药.md": ["暮らす", "考える"],
    "2026-06-29-6月的碎片.md": ["暮らす"],
    "2026-09-07-酷暑的残骸.md": ["暮らす", "考える"],
    "2026-09-13-早饭.md": ["食べる", "暮らす"],
}

ALLOWED = {"暮らす", "食べる", "読む・観る", "考える", "言葉"}


def update_tags(text: str, wanted: list[str]) -> str:
    if not text.startswith("---\n"):
        return text
    end = text.find("\n---\n", 4)
    if end == -1:
        return text
    front = text[4:end]
    body = text[end + 5:]
    if "日記の練習" not in front:
        return text

    lines = front.splitlines()
    new_lines = []
    existing = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("tags:"):
            inline = line[len("tags:"):].strip()
            if inline and inline != "[]":
                existing += [x.strip().strip("'\"") for x in inline.strip("[]").split(",") if x.strip()]
            i += 1
            while i < len(lines) and re.match(r"^\s*-\s+", lines[i]):
                existing.append(re.sub(r"^\s*-\s+", "", lines[i]).strip().strip("'\""))
                i += 1
            continue
        new_lines.append(line)
        i += 1

    preserved = [t for t in existing if t and t not in ALLOWED]
    final_tags = []
    for t in preserved + wanted:
        if t not in final_tags:
            final_tags.append(t)

    insert_at = next((idx + 1 for idx, line in enumerate(new_lines) if line.startswith("categories:")), None)
    if insert_at is not None:
        while insert_at < len(new_lines) and re.match(r"^\s*-\s+", new_lines[insert_at]):
            insert_at += 1
    else:
        insert_at = next((idx + 1 for idx, line in enumerate(new_lines) if line.startswith("permalink:")), len(new_lines))

    tag_lines = ["tags:"] + [f"- {tag}" for tag in final_tags]
    new_lines[insert_at:insert_at] = tag_lines
    return "---\n" + "\n".join(new_lines) + "\n---\n" + body


changed = 0
for filename, wanted in TAGS.items():
    path = Path("_posts") / filename
    if not path.exists():
        print(f"skip missing: {path}")
        continue
    old = path.read_text(encoding="utf-8")
    new = update_tags(old, wanted)
    if new != old:
        path.write_text(new, encoding="utf-8")
        changed += 1
        print(f"tagged: {filename} -> {', '.join(wanted)}")

print(f"changed {changed} posts")
