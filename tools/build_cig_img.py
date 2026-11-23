#!/usr/bin/env python3
# 香烟图片目录：每个香烟品名预搜 4 张候选图（DuckDuckGo，优先阿根廷零售站），缩成 400px 存 sources/cigimg/
# 索引 sources/cigarrillos_img.json = {"v":1,"date":..,"items":{品名:[文件名,...]}}；App 里「从官方匹配图片」列出候选让用户选，不自动套用
# 用法：python3 tools/build_cig_img.py [--redo]
import json,re,os,sys,time,io,hashlib,urllib.request,urllib.parse,datetime
from PIL import Image
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15"
N=4
def get(u,h={},raw=False,t=20):
    d=urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":UA,**h}),timeout=t).read()
    return d if raw else d.decode("utf-8","ignore")
def ddg(q):
    s=get("https://duckduckgo.com/?"+urllib.parse.urlencode({"q":q,"iax":"images","ia":"images"}))
    v=re.search(r'vqd=["\']?([\d-]+)',s).group(1)
    j=json.loads(get("https://duckduckgo.com/i.js?"+urllib.parse.urlencode({"l":"ar-es","o":"json","q":q,"vqd":v,"f":",,,,,","p":"1"}),{"Referer":"https://duckduckgo.com/"}))
    return j.get("results",[])
AR=re.compile(r"\.com\.ar|rappi|mercadolibre|mlstatic|carrefour|coto|jumbo|disco|vea|dia\.com|pedidosya|golomax|maxiconsumo|yaguar|kiosco",re.I)
STOP={"ks","box","sof","rcb","ssl","sc","xl","ff","20","12","10","11","100","de","y","the","openbox","soft"}
BAD=re.compile(r"vape|vaper|pod|e-?liquid|liquido|iqos|heets|terea|stick|cigarro|habano|puro|encendedor|lighter|remera|camiseta|shirt|short|ba[ñn]ador|logo|vector|wallpaper",re.I)
def words(s):return [w for w in re.sub(r"[^a-z0-9]+"," ",s.lower()).split() if w not in STOP and len(w)>1]
def score(x,name):
    t=(x.get("title","")+" "+x.get("url","")+" "+x.get("image","")).lower()
    if BAD.search(t):return 0
    nw=words(name);hit=sum(1 for w in nw if w in t)
    if not nw or nw[0] not in t or hit<max(1,round(len(nw)*0.5)):return 0
    sc=hit*3+(4 if AR.search(x.get("url","")+x.get("image","")) else 0)+(3 if re.search(r"cigarr|atado|paquete",t) else 0)
    w,h=x.get("width",0),x.get("height",0)
    if w>=400 and h>=400:sc+=2
    if w and h and not(0.5<w/h<2):sc-=4
    return sc
def save(d,n,i):
    im=Image.open(io.BytesIO(d)).convert("RGB")
    if min(im.size)<120:return None
    im.thumbnail((400,400));bg=Image.new("RGB",(400,400),"white");bg.paste(im,((400-im.width)//2,(400-im.height)//2))
    fn=hashlib.md5((n+"#"+str(i)).encode()).hexdigest()[:10]+".jpg";bg.save("sources/cigimg/"+fn,"JPEG",quality=80);return fn
src=json.load(open("sources/cigarrillos.json"))
os.makedirs("sources/cigimg",exist_ok=True)
idxf="sources/cigarrillos_img.json"
idx=json.load(open(idxf)) if os.path.exists(idxf) else {"v":1,"items":{}}
redo="--redo" in sys.argv
names=[it[0] for l in src["cats"].values() for it in l]
for k,n in enumerate(names):
    have=idx["items"].get(n,[])
    if len(have)>=N and not redo:continue
    got=[];seen=set()
    for q in ["cigarrillos "+n+" argentina","cigarrillos "+re.sub(r"\b(KS|SOF|RCB|SSL|SC)\b","",n)]:
        try:res=ddg(q)
        except Exception as e:print("search err",n,e);time.sleep(3);continue
        for sc,x in sorted([(score(x,n),x) for x in res],key=lambda r:-r[0]):
            if sc<5 or len(got)>=N:break
            u=x.get("image");
            if not u or u in seen:continue
            seen.add(u)
            for uu in [u,x.get("thumbnail")]:
                try:
                    fn=save(get(uu,raw=True,t=15),n,len(got))
                    if fn:got.append(fn);break
                except Exception:continue
        if len(got)>=N:break
        time.sleep(1.5)
    idx["items"][n]=got;idx["date"]=datetime.date.today().isoformat()
    json.dump(idx,open(idxf,"w"),ensure_ascii=False,indent=0)
    print(f"[{k+1}/{len(names)}] {len(got)} {n}",flush=True)
    time.sleep(1)
print("完成：",sum(1 for v in idx["items"].values() if v),"个品名有候选，共",sum(len(v) for v in idx["items"].values()),"张")
