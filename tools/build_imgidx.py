#!/usr/bin/env python3
# 抓取 saphirus.com.ar 商品图索引 -> sources/saphirus_img.json  [[名称, 缩略图相对路径, 是否Saphirus品牌, 全部分类用|连接]]
import json,html,urllib.request,sys
UA="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1"
P="https://saphirus.com.ar/wp-content/uploads/"
out=[];p=1
while True:
    r=urllib.request.Request(f"https://saphirus.com.ar/wp-json/wc/store/v1/products?per_page=100&page={p}",headers={"User-Agent":UA})
    try:a=json.load(urllib.request.urlopen(r,timeout=60))
    except Exception as e:break
    if not a:break
    for x in a:
        im=(x.get("images") or [{}])[0];t=im.get("thumbnail") or im.get("src")
        if not t:continue
        cats=[c["name"] for c in x.get("categories",[])]
        out.append([html.unescape(x["name"]),t.replace(P,""),0 if "Ambar" in cats else 1,"|".join(html.unescape(c) for c in cats)])
    p+=1
json.dump({"v":2,"base":P,"date":__import__("datetime").date.today().isoformat(),"items":out},open("sources/saphirus_img.json","w"),ensure_ascii=False,separators=(",",":"))
print(len(out))
