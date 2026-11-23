/* ================= 拍照识别商品：本地文字识别 + 视觉模型(OpenAI 兼容) 兜底 ================= */
const AI_KEY="pedidos_ai_v1";
let AIC=(()=>{try{return Object.assign({url:"https://api.openai.com/v1",key:"",model:"gpt-4o-mini",mode:"hybrid",thr:80},JSON.parse(localStorage.getItem(AI_KEY))||{})}catch(e){return{url:"https://api.openai.com/v1",key:"",model:"gpt-4o-mini",mode:"hybrid",thr:80}}})();
function aiSave(){try{localStorage.setItem(AI_KEY,JSON.stringify(AIC))}catch(e){}}
const aiReady=()=>!!(AIC.url&&AIC.key&&AIC.model);
function aiEndpoint(){let u=AIC.url.trim().replace(/\/+$/,"");return /\/chat\/completions$/.test(u)?u:u+"/chat/completions"}
function aiSettings(){
 modal(`<div class="mh">AI 密钥设置</div><div class="mt">用于拍照识别、AI 文字搜索、AI 生成搜图词。本地先查、读不准或没有时才调用下面的模型（需联网，按次计费）。接口须兼容 OpenAI 的 chat/completions 且支持图片输入。</div>
 <div class="opt">模式：<select id="aim" onchange="AIC.mode=this.value;aiSave()"><option value="hybrid" ${AIC.mode=="hybrid"?"selected":""}>混合（推荐）</option><option value="local" ${AIC.mode=="local"?"selected":""}>只本地</option><option value="api" ${AIC.mode=="api"?"selected":""}>只用 API</option></select></div>
 <input class="sq" id="aiu" style="border:1px solid #e3d8c8;margin:4px 0" placeholder="接口地址，如 https://api.openai.com/v1" value="${esc(AIC.url)}" oninput="AIC.url=this.value.trim();aiSave()">
 <input class="sq" id="aik" type="password" autocomplete="off" style="border:1px solid #e3d8c8;margin:4px 0" placeholder="API 密钥（只保存在本机）" value="${esc(AIC.key)}" oninput="AIC.key=this.value.trim();aiSave()">
 <input class="sq" id="aid" style="border:1px solid #e3d8c8;margin:4px 0" placeholder="模型名，如 gpt-4o-mini" value="${esc(AIC.model)}" oninput="AIC.model=this.value.trim();aiSave()">
 <div class="mt" id="ait"></div>
 <div class="mb2"><button class="g" onclick="aiTest()">测试连接</button><button onclick="closeModal()">完成</button></div>`)}
async function aiTest(){const t=$("ait");t.textContent="测试中…";try{const r=await aiCall([{role:"user",content:"只回复 OK 两个字母"}],20);t.innerHTML='<span style="color:#3a8a4a">连接成功：'+esc(String(r).slice(0,40))+"</span>"}catch(e){t.innerHTML='<span style="color:#c0392b">失败：'+esc(e.message)+"</span>"}}
async function aiCall(messages,maxTok){
 if(!aiReady())throw new Error("还没填写接口地址 / 密钥 / 模型");
 const body={model:AIC.model,messages,max_tokens:maxTok||800,temperature:0};
 let r,txt;
 if(NATIVE){r=await fetch("api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:aiEndpoint(),key:AIC.key,body})})}
 else{r=await fetch(aiEndpoint(),{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+AIC.key},body:JSON.stringify(body)})}
 txt=await r.text();let j;try{j=JSON.parse(txt)}catch(e){throw new Error("返回内容不是 JSON（HTTP "+r.status+"）")}
 if(!r.ok||j.error)throw new Error((j.error&&(j.error.message||j.error))||("HTTP "+r.status));
 const c=j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;if(!c)throw new Error("模型没有返回内容");return c}
/* 图片压缩到 1280 像素 JPEG */
function aiShrink(file,max){return new Promise((res,rej)=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(u);cv.toBlob(b=>b?res({blob:b,url:cv.toDataURL("image/jpeg",.85),w:cv.width,h:cv.height}):rej(new Error("压缩失败")),"image/jpeg",.9)};im.onerror=()=>rej(new Error("无法读取图片"));im.src=u})}
async function aiOcr(blob){if(!NATIVE)return null;try{const r=await fetch("api/ocr",{method:"POST",body:blob});if(!r.ok)return null;const j=await r.json();return j.lines||[]}catch(e){return null}}
/* 候选库：官方图片索引 + 品名库 + 本单已有品项 */
function aiPool(cat){const x=picIdx(),f=x&&cat?picCatFilter(cat):null,out=[],seen=new Set();
 localPool(cat).forEach(p=>{if(seen.has(p.k))return;seen.add(p.k);out.push(p)});
 if(x)x.list.forEach(o=>{if(f&&!f(o))return;if(!srcOn(o.cs.includes("cigarrillos")?"cigarrillos":"saphirus"))return;const k=skey(o.n);if(seen.has(k)){const e=out.find(p=>p.k==k);if(e&&!e.t&&!e.img)e.t=o.t;return}seen.add(k);out.push({n:o.n,k,core:o.core,t:o.t,off:1})});
 return out}
/* 本地：本单品项 > Saphirus 源 > 品名库（带上已设置的图片） */
function localPool(cat){const o=cur(),out=[],seen=new Set();
 const add=(n,src)=>{const k=skey(n);if(!k||seen.has(k))return;seen.add(k);const im=cat?picUrl(picOf(n,cat)):"";out.push({n,k,core:k,t:null,img:im||"",loc:src})};
 if(cat)cat.items.forEach(it=>it.n&&add(it.n,"本单"));
 if(o)o.cats.forEach(c=>c.items.forEach(it=>it.n&&add(it.n,"本单")));
 SRCS.list.forEach(sr=>{if(!srcOn(sr.id))return;const d=srcData(sr.id);if(!d)return;Object.values(d.cats).forEach(l=>l.forEach(it=>add(it[0],sr.name)))});
 if(srcOn("manual"))(S.vocab||[]).forEach(v=>add(v,"手动"));
 return out}
/* 本地关键词搜索：每个词都要命中 */
function localSearch(q,cat){const k=skey(q),ws=k.split(" ").filter(w=>w.length>=2);if(!k)return[];
 return aiPool(cat).map(p=>{let sc=matchScore(p.n,k);if(!sc&&ws.length>1&&ws.every(w=>p.k.includes(w)))sc=80;return sc?{p,s:Math.min(100,sc)}:null}).filter(Boolean)
  .sort((a,b)=>b.s-a.s||(b.p.loc?1:0)-(a.p.loc?1:0)).slice(0,16).map(r=>{if(r.p.loc&&!r.p.img&&!r.p.t&&cat){const c=picCands(r.p.n,cat,1)[0];if(c&&c.s>=85)r.p={...r.p,t:c.o.t}}return r})}
function aiLocalMatch(lines,pool){
 const toks=lines.map(l=>({k:skey(l.t),c:l.c==null?1:l.c})).filter(t=>t.k.length>=3);
 const big=toks.map(t=>t.k).join(" ");const res=[];
 pool.forEach(p=>{const nm=p.core||p.k;if(nm.length<3)return;let s=0;
  if(toks.some(t=>t.k===nm||t.k===p.k))s=100;
  else if(big.includes(" "+nm+" ")||(" "+big+" ").includes(" "+nm+" "))s=88;
  else{const ws=nm.split(" ");if(ws.length>1&&ws.every(w=>big.split(" ").includes(w)))s=82;else if(nm.length>=5&&toks.some(t=>lev(t.k,nm)<=1))s=72}
  if(s)res.push({p,s})});
 return res.sort((a,b)=>b.s-a.s||b.p.k.length-a.p.k.length)}
function aiParse(txt){const m=String(txt).match(/\[[\s\S]*\]/);if(!m)return[];try{const a=JSON.parse(m[0]);return Array.isArray(a)?a:[]}catch(e){return[]}}
async function aiVision(dataUrl,pool,lines){
 const names=pool.slice(0,400).map(p=>p.n).join("\n"),hint=lines&&lines.length?"\n照片里本地读到的文字（可能不准）："+lines.map(l=>l.t).join(" | "):"";
 const prompt=`你是商品识别助手。请识别照片里每个能看清的商品（可能是 Saphirus 阿根廷香氛，也可能是别的商品）。同款瓶身只有标签文字不同，请优先读标签上的名称。
下面是 Saphirus 官方候选清单：如果商品在清单里，name 必须用清单里的原样名称，"known" 填 true；如果不在清单里，name 写包装上看到的品牌和产品名（如实抄写，不要编造），"known" 填 false。
输出一个 JSON 数组，每项形如 {"name":"名称","brand":"品牌","kind":"商品类型(如 香烟/洗衣液/饮料)","known":true或false,"qty":看得出的数量或1,"conf":0到100的把握}。看不清的不要输出。只输出 JSON 数组，不要其它文字。
官方候选清单：
${names}${hint}`;
 const msg=[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:dataUrl}}]}];
 const out=aiParse(await aiCall(msg,900)),by=new Map(pool.map(p=>[skey(p.n),p]));
 return out.map(o=>{const nm=String(o.name||"").trim();if(!nm)return null;const p=by.get(skey(nm));
  if(p)return{p,s:Math.max(1,Math.min(100,+o.conf||70)),qty:Math.max(1,parseInt(o.qty)||1),ai:1};
  return{p:{n:tcName(nm),k:skey(nm),t:null,off:0},s:Math.max(1,Math.min(100,+o.conf||60)),qty:Math.max(1,parseInt(o.qty)||1),ai:1,fresh:1,brand:String(o.brand||"").trim(),kind:String(o.kind||"").trim()}}).filter(Boolean)}
function aiTextChips(lines){const bad=/^(\d+[\s.,/-]*)+$/,seen=new Set(),out=[];
 (lines||[]).forEach(l=>{const t=String(l.t||"").replace(/\s+/g," ").trim(),k=skey(t);if(t.length<3||t.length>40||bad.test(t)||seen.has(k)||(l.c!=null&&l.c<.5))return;seen.add(k);out.push(t)});
 return out.slice(0,10)}
/* 去官网按名称搜索：命中则用官方名称与官方图，没有再当作目录外新商品 */
let SHOPC={};
async function shopSearch(q){q=String(q||"").trim();if(q.length<3)return[];const k=skey(q);if(SHOPC[k])return SHOPC[k];
 let arr=null;
 try{if(NATIVE){const r=await fetch("api/shop?q="+encodeURIComponent(q));if(r.ok)arr=await r.json()}
  else{const r=await fetch("https://saphirus.com.ar/wp-json/wc/store/v1/products?per_page=12&search="+encodeURIComponent(q));if(r.ok)arr=(await r.json()).map(x=>{const im=(x.images||[])[0]||{},t=(im.thumbnail||im.src||"").replace(PIC_BASE,"");return{n:x.name,t,c:(x.categories||[]).map(c=>c.name).join("|")}})}}catch(e){}
 if(!arr)return null;
 const dec=document.createElement("textarea"),out=arr.map(x=>{dec.innerHTML=x.n;return{n:dec.value,t:x.t||"",c:String(x.c||"")}}).filter(x=>x.t);
 SHOPC[k]=out;return out}
function shopPick(q,list,cat){if(!list||!list.length)return null;const k=skey(q),f=cat?picCatFilter(cat):null;
 const sc=x=>{const kk=skey(x.n),core=kk.split(" ").slice(1).join(" ");let s=Math.max(matchScore(kk,k),core?matchScore(core,k):0);if(!s)return 0;
  if(f&&f({cs:x.c.split("|").map(norm)}))s+=15;return s};
 const r=list.map(x=>({x,s:sc(x)})).filter(r=>r.s>=65).sort((a,b)=>b.s-a.s);return r.length?r[0]:null}
const SAPH_BRAND=/saphirus|ambar|shiny|red\s*on|touch/i;
function otherBrand(it){const b=String(it.brand||"").trim();return !!b&&!SAPH_BRAND.test(b)}   /* 模型明确说是别家品牌 → 不必搜 Saphirus */
async function aiResolve(it,cat){if(!it.fresh||it.shopTried)return it;it.shopTried=1;if(otherBrand(it)){it.skipShop=1;return it}
 const list=await shopSearch(it.p.n),hit=shopPick(it.p.n,list,cat);
 if(list===null){it.shopErr=1;return it}
 if(hit){it.p={n:hit.x.n,k:skey(hit.x.n),t:hit.x.t,off:1};it.fresh=0;it.shop=1;it.s=Math.max(it.s,hit.s>=100?90:75);it.on=it.on||it.s>=AIC.thr}
 else it.shopMiss=1;
 return it}
/* 网络找图：图片搜索(A) + 偏向零售/官方来源(B)；都没有就用拍的照片(C) */
const WEBC={};
const RETAIL=/rappi|golomax|carrefour|jumbo|disco|coto|diaonline|supermercad|mercadolibre|mlstatic|farmacity|walmart|vea|maxiconsumo|makro|nini|distribuidor|tienda|shop|store|oficial|official/i;
async function webImgSearch(q){q=String(q||"").trim();if(q.length<3)return null;if(WEBC[q])return WEBC[q];
 try{let arr=null;if(NATIVE){const r=await fetch("api/webimg?q="+encodeURIComponent(q));if(r.ok)arr=await r.json()}if(!arr)return null;WEBC[q]=arr;return arr}catch(e){return null}}
function webImgRank(arr,brand,name){const bw=skey(brand||"").split(" ").filter(w=>w.length>2),nw=skey(name||"").split(" ").filter(w=>w.length>2);
 if(!nw.length)return[];const need=Math.max(1,Math.ceil(nw.length*0.6));
 return arr.map(x=>{const t=skey((x.n||"")+" "+(x.s||"")+" "+x.u);const hit=nw.filter(w=>t.includes(w)).length;
  if(hit<need)return{x,sc:0};   /* 名字对不上直接淘汰：不能因为尺寸/来源好看就当成找到了 */
  let sc=hit*3;bw.forEach(w=>{if(t.includes(w))sc+=2});
  if(RETAIL.test(x.s||"")||RETAIL.test(x.u))sc+=3;if(x.w>=500&&x.h>=500)sc+=2;else if(x.w&&x.w<250)sc-=3;
  const ar=x.w&&x.h?x.w/x.h:1;if(ar>0.45&&ar<2.2)sc+=1;else sc-=3;return{x,sc}}).filter(r=>r.sc>=5).sort((a,b)=>b.sc-a.sc)}
async function webImgFor(it){const nm=it.p.n,q0=[it.brand&&!skey(nm).includes(skey(it.brand))?it.brand:"",nm,it.kind||""].join(" ").replace(/\s+/g," ").trim(),q=(it.p.loc||!it.brand?await aiImgQuery(nm,it.p.loc||it.kind||""):null)||q0;it.webQ=q;
 const arr=await webImgSearch(q);if(arr===null)return{err:1};const r=webImgRank(arr,it.brand,nm);return{list:r.length?r.slice(0,8):arr.slice(0,8).map(x=>({x})),best:r[0]||(arr[0]?{x:arr[0]}:null),q,loose:!r.length}}
async function webImgData(u){try{const r=await fetch("api/fetchimg?u="+encodeURIComponent(u));if(!r.ok)return null;const b=await r.blob();return await new Promise(res=>{const f=new FileReader();f.onload=()=>res(String(f.result));f.readAsDataURL(b)})}catch(e){return null}}
async function aiFindWeb(it){if((!it.fresh&&!(it.p&&!it.p.t&&!it.p.img))||it.webTried||!NATIVE)return it;it.webTried=1;const r=await webImgFor(it);
 if(r.err){it.webErr=1;return it}if(r.best){it.web=r.best.x;it.webAlt=r.list.map(z=>z.x)}else it.webMiss=1;return it}
let AIMP=-1;
let AMQ=[];function aiMoreQi(i){const q=AMQ[i];if(!q)return;$("pwq").value=q;document.querySelectorAll("#amq .aichip").forEach((b,j)=>b.style.outline=j==i?"2px solid var(--c,#c0562f)":"");aiMoreGo(q)}
async function aiMorePics(i){const h=AIR.items[i];if(!h)return;AIMP=i;AMQ=await aiImgQueries(h.p.n,h.p.loc||h.kind||"");const q=h.webQ||AMQ[0]||h.p.n;
 modal(`<div class="mh">选图 · ${esc(h.p.n)}</div>${AMQ.length?`<div class="mt">AI 搜索词候选（点一条换着搜）：</div><div id="amq">${qChips(AMQ,q,"aiMoreQi")}</div>`:""}<input class="sq" id="pwq" style="border:1px solid #e3d8c8;margin:0 0 6px" value="${esc(q)}" onkeydown="if(event.key=='Enter')aiMoreGo(this.value)"><div class="mt" id="pwinfo">⏳ 搜索中…</div><div id="pwl" class="pgrid"></div><div class="mb2"><button class="g" onclick="aiPanel()">返回</button><button class="g" onclick="aiMoreGo($('pwq').value)">重新搜索</button></div>`);aiMoreGo(q)}
async function aiMoreGo(q){const arr=await webImgSearch(q);if(!$("pwl"))return;if(arr===null){$("pwinfo").textContent="网上搜图失败";return}
 PWL=arr.filter(x=>x.t||x.u).slice(0,30);$("pwinfo").textContent="点一张作为这个商品的图片";
 $("pwl").innerHTML=PWL.map((x,j)=>`<button class="pxc" onclick="aiMorePick(${j})"><img src="${esc(x.t||x.u)}" loading="lazy" onerror="this.parentNode.remove()"><small>${esc((x.s||"").replace(/^www\./,"").slice(0,24))}</small></button>`).join("")}
function aiMorePick(j){const h=AIR.items[AIMP],x=PWL[j];if(!h||!x)return;h.web=x;h.webData=null;h.webAlt=[x,...(h.webAlt||[]).filter(z=>z.u!=x.u)];h.on=true;aiPanel()}
function aiPickAlt(i,j){const h=AIR.items[i],z=h&&h.webAlt&&h.webAlt[j];if(!z)return;h.web=z;h.webData=null;h.on=true;aiPanel()}
function aiNextWeb(i){const h=AIR.items[i];if(!h||!h.webAlt||h.webAlt.length<2)return;const k=h.webAlt.findIndex(z=>z.u==(h.web&&h.web.u));h.web=h.webAlt[(k+1)%h.webAlt.length];aiPanel()}
let AIR=null;
/* ================= AI 文字搜索：按描述/问题找商品，再去官网与网上找图 ================= */
function aiAskUI(ci){const c=catAt(cur(),ci);
 modal(`<div class="mh">搜索商品 · ${esc(c.name||"该类")}</div><div class="mt">先查本地（本单、Saphirus 源、香烟源、品名库、官方目录），没有再联网 / AI。可以输入品名，也可以用一句话描述，比如「薰衣草味的喷雾」「适合卧室的扩香」「Saphirus 新出的香味」。${aiReady()?"":"未配置 API：只按关键词搜官网和官方目录。"}</div>
 <textarea id="aiq" rows="3" style="width:100%;box-sizing:border-box;margin:6px 0;font-size:16px;border-radius:10px;padding:8px"></textarea>
 <div class="mb2"><button class="g" onclick="closeModal()">取消</button><button onclick="aiAsk(${ci},$('aiq').value)">搜索</button></div>`);setTimeout(()=>{const t=$("aiq");t&&t.focus()},80)}
async function aiAskModel(q,pool){const names=pool.slice(0,400).map(p=>p.n).join("\n");
 const prompt=`你是订货助手，帮用户按描述找商品。用户的问题：「${q}」
下面是 Saphirus 官方候选清单。优先从清单里挑符合的（name 用清单原样名称，"known":true）；清单里没有、但你确定真实存在的商品才写品牌+产品名（"known":false，不要编造）。
输出 JSON 数组，最多 12 项，每项 {"name":"名称","brand":"品牌","kind":"商品类型","known":true或false,"qty":用户提到的数量或1,"conf":0到100,"info":"一句中文说明：香型/用途/规格等，20字内","query":"去官网或网上搜索用的关键词(原文语言)"}。只输出 JSON 数组。
官方候选清单：
${names}`;
 const out=aiParse(await aiCall([{role:"user",content:prompt}],1200)),by=new Map(pool.map(p=>[skey(p.n),p]));
 return out.map(o=>{const nm=String(o.name||"").trim();if(!nm)return null;const p=by.get(skey(nm)),base={s:Math.max(1,Math.min(100,+o.conf||70)),qty:Math.max(1,parseInt(o.qty)||1),ai:1,info:String(o.info||"").trim().slice(0,60)};
  if(p)return{...base,p};
  return{...base,p:{n:tcName(nm),k:skey(nm),t:null,off:0},fresh:1,brand:String(o.brand||"").trim(),kind:String(o.kind||"").trim(),sq:String(o.query||"").trim()}}).filter(Boolean)}
async function aiAsk(ci,q,online){q=String(q||"").trim();if(!q){toast("请输入要找的商品");return}
 const c=catAt(cur(),ci);AIR={ci,items:[],busy:1,msg:"先查本地…",src:"",photo:"",chips:[],title:"AI 搜索",q};aiPanel();
 try{await picFetchIdx();const pool=aiPool(c);let hits=[],note="";
  if(!online){const lh=localSearch(q,c).filter(r=>r.s>=60);
   if(lh.length){AIR.items=lh.map(r=>({p:r.p,s:r.s,qty:1,on:r.s>=85,lc:1}));AIR.local=1;AIR.busy=0;AIR.msg="";AIR.note="";aiPanel();return}}
  AIR.local=0;AIR.msg=online?"联网搜索…":"本地没有，联网搜索…";aiPanel();
  if(aiReady()){AIR.msg="AI 分析问题…";aiPanel();try{hits=await aiAskModel(q,pool)}catch(e){note="AI 调用失败："+e.message+"；已改用关键词搜索"}}
  if(!hits.length){AIR.msg="按关键词搜索…";aiPanel();
   localSearch(q,c).filter(r=>r.s>=60&&r.p.loc).slice(0,8).forEach(r=>hits.push({p:r.p,s:r.s,qty:1}));
   picCands(q,c,8).filter(r=>r.s>=60).forEach(r=>hits.push({p:{n:r.o.n,k:skey(r.o.n),t:r.o.t,off:1},s:r.s,qty:1}));
   const l=await shopSearch(q);(l||[]).slice(0,8).forEach(x=>hits.push({p:{n:x.n,k:skey(x.n),t:x.t,off:1},s:75,qty:1,shop:1,info:x.c.replace(/\|/g," · ")}));
   if(!hits.length&&!note)note=aiReady()?"没有找到符合的商品":"官方目录和官网都没搜到；配置 API 后 AI 可以理解描述性的问题"}
  AIR.note=note;const seen=new Set();
  AIR.items=hits.filter(h=>{if(seen.has(h.p.k))return false;seen.add(h.p.k);return true}).slice(0,16).map(h=>({...h,on:h.s>=AIC.thr&&!h.fresh}));
  if(AIR.items.some(h=>h.fresh)){AIR.msg="去官网核对商品…";aiPanel();await Promise.all(AIR.items.map(h=>{if(h.sq&&h.sq!=h.p.n){const n0=h.p.n;h.p.n=h.sq;return aiResolve(h,c).then(()=>{if(h.fresh)h.p.n=n0})}return aiResolve(h,c)}));AIR.items=AIR.items.filter((h,i,a)=>a.findIndex(y=>y.p.k==h.p.k)==i)}
  if(online&&!AIR.items.length&&NATIVE){const it={p:{n:tcName(q),k:skey(q),t:null,off:0},s:100,qty:1,on:false,fresh:1,txt:1};AIR.items.push(it);AIR.note=""}
  if(AIR.items.some(h=>h.fresh||(!h.p.t&&!h.p.img))){AIR.msg="去网上找商品图…";aiPanel();await Promise.all(AIR.items.map(h=>aiFindWeb(h)))}
  AIR.busy=0;AIR.msg="";aiPanel()}catch(e){AIR.busy=0;AIR.msg="";AIR.note=e.message;aiPanel()}}
async function aiPickPhoto(ci,inp){const f=inp.files&&inp.files[0];inp.value="";if(!f)return;
 const o=cur(),c=catAt(o,ci);AIR={ci,items:[],busy:1,msg:"识别中…",src:"",photo:"",chips:[]};aiPanel();
 try{await picFetchIdx();const pool=aiPool(c);
  const sm=await aiShrink(f,1280);AIR.src=sm.url;aiPanel();
  try{AIR.photo=(await aiShrink(f,520)).url}catch(e){}
  let hits=[],lines=null,note="";
  if(AIC.mode!="api"){AIR.msg="本地读取标签文字…";aiPanel();lines=await aiOcr(sm.blob);AIR.chips=aiTextChips(lines);if(lines&&lines.length)hits=aiLocalMatch(lines,pool).filter(h=>h.s>=AIC.thr).map(h=>({...h,qty:1}))}
  const need=AIC.mode=="api"||(AIC.mode=="hybrid"&&!hits.length);
  if(need){if(!aiReady()){if(AIC.mode=="api")throw new Error("请先在「设置 → AI 密钥设置」里填写 API");note=lines==null?"本机没有文字识别能力，且未配置 API":"官方目录里没有匹配的商品。可点下面读到的文字直接新建，或在设置里配置 API 让视觉模型再试"}
   else{AIR.msg="调用视觉模型…";aiPanel();try{hits=await aiVision(sm.url,pool,lines)}catch(e){note="视觉模型失败："+e.message}}}
  if(!hits.length&&AIR.chips.length&&!(AIC.mode!="local"&&aiReady())){AIR.msg="去官网搜索读到的文字…";aiPanel();const found=[];for(const t of AIR.chips.slice(0,6)){const l=await shopSearch(t),h=shopPick(t,l,c);if(h&&!found.some(f=>f.p.k==skey(h.x.n))){found.push({p:{n:h.x.n,k:skey(h.x.n),t:h.x.t,off:1},s:h.s>=100?90:75,qty:1,shop:1,txt:1})}}hits=found;if(found.length)note=""}
  AIR.note=note;const seen=new Set();
  AIR.items=hits.filter(h=>{if(seen.has(h.p.k))return false;seen.add(h.p.k);return true}).slice(0,24).map(h=>({...h,on:h.fresh?h.s>=85:h.s>=AIC.thr,qty:h.qty||1}));
  if(AIR.items.some(h=>h.fresh)){AIR.msg="去官网搜索商品…";aiPanel();await Promise.all(AIR.items.map(h=>aiResolve(h,c)));AIR.items=AIR.items.filter((h,i,a)=>a.findIndex(y=>y.p.k==h.p.k)==i)}
  if(AIR.items.some(h=>h.fresh)){AIR.msg="去网上找商品图…";aiPanel();await Promise.all(AIR.items.map(h=>aiFindWeb(h)))}
  AIR.busy=0;AIR.msg="";aiPanel()}catch(e){AIR.busy=0;AIR.msg="";AIR.note=e.message;aiPanel()}}
async function aiAddText(i){const t=AIR.chips[i];if(!t)return;AIR.chips.splice(i,1);const k=skey(t);if(AIR.items.some(h=>h.p.k==k))return aiPanel();
 const it={p:{n:tcName(t),k,t:null,off:0},s:100,qty:1,on:true,fresh:1,txt:1};AIR.items.push(it);AIR.busy=1;AIR.msg="去官网搜索「"+t+"」…";aiPanel();
 await aiResolve(it,catAt(cur(),AIR.ci));it.s=it.shop?it.s:100;if(it.fresh){AIR.msg="去网上找商品图…";aiPanel();await aiFindWeb(it)}AIR.busy=0;AIR.msg="";AIR.items=AIR.items.filter((h,j,a)=>a.findIndex(y=>y.p.k==h.p.k)==j);aiPanel()}
function aiThumb(h){return h.p.img?h.p.img:h.p.t?picSrc(h.p.t):(h.web?h.web.t:(AIR.photo||""))}
function aiPanel(){const r=AIR;if(!r)return;const c=r.ci>=0&&cur().cats[r.ci]?cur().cats[r.ci]:{...NOCAT,name:"自动分类"};
 const rows=r.items.map((h,i)=>`<label class="aiit"><input type="checkbox" ${h.on?"checked":""} onchange="AIR.items[${i}].on=this.checked;aiPanel()"><img src="${esc(aiThumb(h))}" loading="lazy"><span class="ain"><b>${esc(h.p.n)}</b>${h.info?`<small style="opacity:.85">${esc(h.info)}</small>`:""}<small>${h.fresh?(h.web?"🌐 网上找到图 · 将新建商品"+((h.webAlt||[]).length>1?"（点下面换图）":""):(h.webErr||h.shopErr?"⚠ 联网搜索失败 · 将新建商品，图用你的照片":"⚠ 网上没找到图 · 将新建商品，图用你的照片")):(h.shop?"✅ 官网搜到 · 把握 ":(h.p.loc?"📂 本地"+h.p.loc+(h.web?" · 🌐 网上找到图":""):(h.ai?(AIR.q?"AI 推荐":"视觉模型"):(AIR.q?"官方目录":"标签文字")))+" · 把握 ")+(h.fresh?"":Math.min(100,h.s))}</small></span><span class="aiq"><button onclick="event.preventDefault();AIR.items[${i}].qty=Math.max(1,AIR.items[${i}].qty-1);aiPanel()">−</button><i>${h.qty}</i><button onclick="event.preventDefault();AIR.items[${i}].qty++;aiPanel()">+</button></span></label>${(h.webAlt=(h.webAlt||[]).filter((z,j,A)=>A.findIndex(y=>y.u==z.u)==j)).length>1?`<div class="aistrip">${h.webAlt.slice(0,8).map((z,j)=>`<button class="${h.web&&z.u==h.web.u?"on":""}" onclick="aiPickAlt(${i},${j})"><img src="${esc(z.t||z.u)}" loading="lazy" onerror="this.parentNode.remove()"></button>`).join("")}<button class="more" onclick="aiMorePics(${i})">更多…</button></div>`:""}`).join("");
 const chips=(r.chips||[]).map((t,i)=>`<button class="aichip" onclick="aiAddText(${i})">＋ ${esc(t)}</button>`).join("");
 const n=r.items.filter(h=>h.on).length,nf=r.items.filter(h=>h.on&&h.fresh).length;
 modal(`<div class="mh">${r.title||"拍照识别"} · 加入 ${esc(c.name||"该类")}</div>${r.q?`<div class="mt">问题：${esc(r.q)}</div>`:""}${r.src?`<img src="${esc(r.src)}" style="width:100%;max-height:22vh;object-fit:contain;border-radius:10px;margin:4px 0">`:""}
 ${r.busy?`<div class="mt">⏳ ${esc(r.msg)}</div>`:`<div class="mt">${r.items.length?""+(r.q?"找到 ":"识别出 ")+r.items.length+" 个"+(r.local?"（本地）":"")+"，请核对后加入（低把握的默认不勾选）":"没有识别出商品"}</div>${r.note?`<div class="mt" style="color:#c0392b">${esc(r.note)}</div>`:""}`}
 <div class="aiold">${rows}</div>
 ${!r.busy&&chips?`<div class="mt" style="margin-top:6px">照片里读到的文字（点一下会先去官网搜这个名字，搜到就用官方商品和图片，搜不到才新建）：</div><div class="aichips">${chips}</div>`:""}
 ${!r.busy&&r.q&&r.local?`<button class="g" style="width:100%;margin-top:6px" onclick="aiAsk(${r.ci},AIR.q,1)">🌐 本地结果不对？联网搜索</button>`:""}${!r.busy&&r.photo&&!r.q?`<div class="ab" style="margin-top:6px"><button class="g" onclick="aiUsePhoto()">🖼 不用识别，直接用这张图新建商品</button><button class="g" onclick="const ci=AIR.ci;closeModal();AIR=null;addBlank(ci)">🔎 从官方图片里选</button></div>`:""}
 <div class="mb2" style="flex-wrap:wrap"><button class="g" onclick="closeModal()">取消</button><button class="g" onclick="aiSettings()">设置</button>${r.busy?"":`<button onclick="aiApply()" ${n?"":"disabled"}>加入 ${n} 项${nf?"（新建 "+nf+"）":""}</button>`}</div>`)}
function aiUsePhoto(){const r=AIR;if(!r||!r.photo)return;const id=uid();
 mut(o=>{const c=ensureCat(o,r.ci,""),it={id,n:"",q:1,p:null};c.items.push(it);PICS[picKey("",c,it)]={d:r.photo}});picSave();closeModal();AIR=null;renderEdit();toast("已用这张图新建商品，可以再补名字")}
async function aiApply(){const r=AIR;if(!r)return;const sel=r.items.filter(h=>h.on);if(!sel.length)return;let add=0,mer=0;const nNew=sel.filter(h=>h.fresh).length;
 for(const h of sel){if(h.web&&!h.webData&&(h.fresh||(!h.p.t&&!h.p.img))){h.webData=await webImgData(h.web.u)}}
 mut(o=>{sel.forEach(h=>{const nm=h.fresh?fixName(h.p.n):h.p.n,c=ensureCat(o,r.ci,nm),k=skey(nm),ex=c.items.find(it=>skey(it.n)==k);
  if(ex){ex.q+=h.qty;mer++}else{const it={n:nm,q:h.qty,p:null};c.items.push(it);add++;
   if(!h.fresh){if(h.p.t)PICS[picKey(it.n,c,it)]={u:h.p.t};else if(h.webData&&!h.p.img)PICS[picKey(it.n,c,it)]={d:h.webData};else if(!h.p.img&&nNew+sel.length==1&&r.photo)PICS[picKey(it.n,c,it)]={d:r.photo}}else if(h.webData)PICS[picKey(it.n,c,it)]={d:h.webData};else if(nNew==1&&r.photo)PICS[picKey(it.n,c,it)]={d:r.photo}}})});
 sel.forEach(h=>{const nm=h.fresh?fixName(h.p.n):h.p.n;addVocab(nm);bumpUse(nm)});picSave();save();closeModal();AIR=null;renderEdit();toast("已加入 "+add+" 项"+(mer?"，合并 "+mer+" 项":"")+"（已设置图片）",undo)}

