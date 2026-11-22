#!/usr/bin/env python3
# 为香烟源每个品名找一张商品图（DuckDuckGo 图片搜索，优先阿根廷零售站），缩成 400px JPEG 存 sources/cigimg/，索引写 sources/cigarrillos_img.json
# 用法：python3 tools/build_cig_img.py [--redo]   已有图片默认跳过
import json,re,os,sys,time,io,hashlib,urllib.request,urllib.parse
sys.path.insert(0,"/tmp")
from PIL import Image
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15"
def get(u,h={},raw=False,t=20):
    d=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":UA,**h}),timeout=t).read()
    return d if raw else d.decode("utf-8","ignore")
VQD={}
def ddg(q):
    s=get("https://duckduckgo.com/?"+urllib.parse.urlencode({"q":q,"iax":"images","ia":"images"}))
    v=re.search(r'vqd=["\']?([\d-]+)',s).group(1)
    j=json.loads(get("https://duckduckgo.com/i.js?"+urllib.parse.urlencode({"l":"ar-es","o":"json","q":q,"vqd":v,"f":",,,,,","p":"1"}),{"Referer":"https://duckduckgo.com/"}))
    return j.get("results",[])
AR=re.compile(r"\.com\.ar|rappi\.com\.ar|mercadolibre\.com\.ar|mlstatic|carrefour\.com\.ar|cotodigital|jumbo\.com\.ar|disco\.com\.ar|vea\.com\.ar|dia\.com\.ar|pedidosya|golomax|maxiconsumo|yaguar|kiosco",re.I)
STOP={"ks","box","sof","rcb","ssl","sc","xl","ff","20","12","10","11","100","de","y","the","openbox","soft"}
def words(s):return [w for w in re.sub(r"[^a-z0-9]+"," ",s.lower()).split() if w not in STOP and len(w)>1]
def score(x,name):
    t=(x.get("title","")+" "+x.get("url","")+" "+x.get("image","")).lower()
    nw=words(name);hit=sum(1 for w in nw if w in t)
    if not nw or hit<max(1,round(len(nw)*0.6)) or nw[0] not in t:return 0   # 品牌词必须命中
    sc=hit*3+(4 if AR.search(x.get("url","")+x.get("image","")) else 0)
    w,h=x.get("width",0),x.get("height",0)
    if w>=400 and h>=400:sc+=2
    if w and h and not(0.5<w/h<2):sc-=4
    if re.search(r"cart[oó]n|carton|x\s*10\s*(paq|atado)|200\s*cig|10\s*pack|stick|iqos|heets|vape",t):sc-=3
    return sc
src=json.load(open("sources/cigarrillos.json"))
os.makedirs("sources/cigimg",exist_ok=True)
idxf="sources/cigarrillos_img.json"
idx=json.load(open(idxf)) if os.path.exists(idxf) else {}
redo="--redo" in sys.argv
names=[it[0] for l in src["cats"].values() for it in l]
ok=miss=0
for i,n in enumerate(names):
    if n in idx and not redo and os.path.exists("sources/cigimg/"+idx[n]):ok+=1;continue
    got=None
    for q in ["cigarrillos "+n+" argentina","cigarrillos "+re.sub(r"\b(KS|SOF|RCB|SSL|SC)\b","",n)]:
        try:res=ddg(q)
        except Exception as e:print("search err",n,e);time.sleep(3);continue
        cand=sorted([(score(x,n),x) for x in res],key=lambda r:-r[0])
        for sc,x in cand[:6]:
            if sc<5:break
            for u in [x.get("image"),x.get("thumbnail")]:
                try:
                    d=get(u,raw=True,t=15);im=Image.open(io.BytesIO(d)).convert("RGB")
                    if min(im.size)<120:continue
                    im.thumbnail((400,400));bg=Image.new("RGB",(400,400),"white");bg.paste(im,((400-im.width)//2,(400-im.height)//2))
                    fn=hashlib.md5(n.encode()).hexdigest()[:10]+".jpg";bg.save("sources/cigimg/"+fn,"JPEG",quality=82)
                    got=fn;break
                except Exception:continue
            if got:break
        if got:break
        time.sleep(1.5)
    if got:idx[n]=got;ok+=1
    else:miss+=1;print("没找到:",n)
    json.dump(idx,open(idxf,"w"),ensure_ascii=False,indent=0)
    print(f"[{i+1}/{len(names)}] {'✓' if got else '✗'} {n}",flush=True)
    time.sleep(1.2)
print("完成：有图",ok,"没图",miss)
