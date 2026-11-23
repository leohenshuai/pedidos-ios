#!/usr/bin/env python3
"""拆分后的 Web 资源冒烟检查：文件齐全、pedidos.html 引用可解析、关键标识在正确文件里。
用法：python3 tools/smoke_web.py [仓库根目录]（默认取脚本所在目录的上级）"""
import re
import sys
from pathlib import Path

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
web = root / "Pedidos" / "Web"
fails = []

def check(cond, msg):
    print(("OK   " if cond else "FAIL ") + msg)
    if not cond:
        fails.append(msg)

html_path = web / "pedidos.html"
html = html_path.read_text(encoding="utf-8") if html_path.exists() else ""
check(bool(html), "Pedidos/Web/pedidos.html 存在")
refs = re.findall(r'(?:href|src)="(css/[^"]+|js/[^"]+)"', html)
expect = ["css/app.css", "js/core.js", "js/ui.js", "js/sources.js",
          "js/images.js", "js/ai.js", "js/export.js", "js/app.js"]
check(refs == expect, "pedidos.html 引用齐全且顺序正确: " + ", ".join(refs))
for r in expect:
    p = web / r
    check(p.exists() and p.stat().st_size > 0, r + " 存在且非空")

def has(rel, needle):
    p = web / rel
    return p.exists() and needle in p.read_text(encoding="utf-8")

check(has("js/core.js", "function boot"), "function boot 在 js/core.js")
check(has("js/images.js", "cigExactRows"), "cigExactRows 在 js/images.js")
check(has("js/ai.js", "pedidos_ai_v1"), "pedidos_ai_v1 在 js/ai.js")
check(has("js/ui.js", "function exportAll"), "exportAll 在 js/ui.js")
check("OFFICIAL_BUILTIN" not in html, "pedidos.html 已无内联大脚本")
# 资源交付回归防护：打包后 css/js 会被平铺到 App 包根目录，SchemeHandler 必须能按纯文件名
# 找到子资源（否则真机上整页无样式无脚本），且被引用的资源文件名不能冲突（平铺后会互相覆盖）。
names = [r.rsplit("/", 1)[-1] for r in expect]
check(len(set(names)) == len(names), "被引用资源的文件名互不冲突: " + ", ".join(names))
swift_path = root / "Pedidos" / "ContentView.swift"
swift = swift_path.read_text(encoding="utf-8") if swift_path.exists() else ""
check("lastPathComponent" in swift, "SchemeHandler 有纯文件名兜底查找 (ContentView.swift)")

print("SMOKE " + ("FAILED" if fails else "PASSED"))
sys.exit(1 if fails else 0)
