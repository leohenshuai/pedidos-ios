#!/usr/bin/env python3
# 阿根廷香烟源 -> sources/cigarrillos.json，格式同 saphirus.json：{"src","date","name","cats":{品牌:[[品名,参考价,0]]}}
# 数据：donkiosco.com.ar（自动同步 ARCA 官方香烟价目表，覆盖所有登记在册的烟草公司）
import json,re,html,urllib.request,datetime,sys
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15"
URL="https://donkiosco.com.ar/herramientas/precios-cigarrillos-hoy/"
s=urllib.request.urlopen(urllib.request.Request(URL,headers={"User-Agent":UA}),timeout=60).read().decode("utf-8","ignore")
upd=(re.search(r"(\d{2}/\d{2}/\d{4})",s) or [None,""])[1]
T=lambda x:html.unescape(re.sub(r"<[^>]+>","",x)).strip()
rows=[];cur=None
for h,t in re.findall(r"<h[23][^>]*>(.*?)</h[23]>|(<table.*?</table>)",s,re.S):
    if h:cur=T(h);continue
    for r in re.findall(r"<tr.*?</tr>",t,re.S):
        c=[T(x) for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>",r,re.S)]
        if len(c)>=2 and c[0]!="Marquilla":rows.append((cur,c[0],c[1]))
if len(rows)<100:sys.exit("抓到的行数太少(%d)，页面可能改版"%len(rows))

# 品牌（=类别）：按品名开头识别；未列出的取第一个词
BRANDS=["Lucky Strike","Luckies","Philip Morris","Marlboro","Chesterfield","Harmony","Camel","Rothmans","Pall Mall","Kent","Parliament","L&M",
        "Red Point","West","Kiel","Master","Melbourne","Milenio","Mill","Bold","Diesel","Melbo","Boxer","VIP","Corona","Dolchester","Liverpool","Pier",
        "CJ","Go!","Pablo Emilio","357","Black King","Black Infinity","Eight","Rodeo","V8","JG","Marbella","51","Dolar","Dollar","Six One","Golden King"]
SMALL={"de","y","con","sin"}
def tidy(n):
    n=re.sub(r"\s+"," ",n).replace("KS.BOX","KS BOX").strip()
    out=[]
    for w in n.split(" "):
        if re.fullmatch(r"(KS|SOF|RCB|SSL|SC|XL|FF|JG|CJ|VIP|L&M|V8|\d.*|\(?[A-Z]{1,2}\)?)",w,re.I) and (w.upper()==w or re.fullmatch(r"(ks|sof|rcb|ssl|sc|xl|ff)",w,re.I)):
            out.append(w.upper() if not re.match(r"\d",w) else w.lower() if w.isalpha() else w)
        elif w.lower() in SMALL and out:out.append(w.lower())
        else:
            m=re.match(r"^([(\-]*)(.*)$",w);pre,core=m.group(1),m.group(2)
            out.append(pre+(core[:1].upper()+core[1:].lower() if (core.isupper() or core.islower() or re.search(r"[a-z][A-Z]",core)) else core))
    return " ".join(out).replace("Philips Morris","Philip Morris").replace(" Ks. "," KS ")
def brand(n):
    for b in sorted(BRANDS,key=len,reverse=True):
        if n.lower().startswith(b.lower()+" ") or n.lower()==b.lower():return b
    return n.split(" ")[0]
MERGE={"Luckies":"Lucky Strike","Philips":"Philip Morris","Classic":"Diesel","Dollar":"Dolar"}
price=lambda p:int(re.sub(r"[^\d]","",p.split(",")[0]) or 0)
cats={};seen={}
for co,n,p in rows:
    nm=tidy(n);k=re.sub(r"[^a-z0-9]+"," ",nm.lower()).strip();v=price(p)
    if k in seen:                       # 同一品名在两家公司都有登记：留价格高的（通常是较新的登记）
        it=seen[k]
        if v>it[1]:it[1]=v
        continue
    b=MERGE.get(brand(nm),brand(nm)).upper();it=[nm,v,0];seen[k]=it;cats.setdefault(b,[]).append(it)
for b in cats:cats[b].sort(key=lambda x:x[0].lower())
# 只有 1~2 个品名的小牌子并进「OTRAS MARCAS」，避免类别太碎
small=[b for b,v in cats.items() if len(v)<3]
for b in small:cats.setdefault("OTRAS MARCAS",[]).extend(cats.pop(b))
cats["OTRAS MARCAS"].sort(key=lambda x:x[0].lower())
cats=dict(sorted(cats.items(),key=lambda kv:-len(kv[1])))
d=datetime.datetime.strptime(upd,"%d/%m/%Y").date().isoformat() if upd else datetime.date.today().isoformat()
json.dump({"src":"Cigarrillos Argentina (ARCA)","name":"香烟","date":d,"cats":cats},open("sources/cigarrillos.json","w"),ensure_ascii=False,separators=(",",":"))
print(len(rows),"行 →",sum(len(v) for v in cats.values()),"个品名，",len(cats),"个品牌；ARCA 更新",upd)
