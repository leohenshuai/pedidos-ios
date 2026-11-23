/* ================= 商品图片：官方匹配 / 自己的图片（按类别匹配） ================= */
const PIC_KEY="pedidos_pics_v2",IDX_KEY="pedidos_imgidx_v2",IDX_URL="https://raw.githubusercontent.com/leohenshuai/pedidos-ios/main/sources/saphirus_img.json",PIC_BASE="https://saphirus.com.ar/wp-content/uploads/";
const PIC_ALIAS={cigarrillo:"cigarrillos",cigarro:"cigarrillos",tabaco:"cigarrillos",cigarette:"cigarrillos",aroma:"aerosol",aromas:"aerosol",aromatizante:"aerosol",aromatizantes:"aerosol",perfume:"parfum",perfumes:"parfum"};
const PIC_STOP=new Set(["de","del","la","el","los","las","para","con","y","e","en","general"]);
let PICS=(()=>{try{return JSON.parse(localStorage.getItem(PIC_KEY))||{}}catch(e){return{}}})(),PIDX=null,PM=null;
function picSave(){try{localStorage.setItem(PIC_KEY,JSON.stringify(PICS));return true}catch(e){toast("⚠ 图片存储空间不足，请移除一些图片");return false}}
const itId=it=>it.id||(it.id=uid());
function picKey(n,c,it){return catKeyFor(c)+"|"+(skey(n)||"#"+(it?itId(it):""))}
function picOf(n,c,it){return PICS[picKey(n,c,it)]}
const CIGI_KEY="pedidos_cigimg_v2",CIGI_URL="https://raw.githubusercontent.com/leohenshuai/pedidos-ios/main/sources/cigarrillos_img.json",CIGI_BASE="https://raw.githubusercontent.com/leohenshuai/pedidos-ios/main/sources/cigimg/";
let CIGX=(()=>{try{return JSON.parse(localStorage.getItem(CIGI_KEY))}catch(e){return null}})();
async function cigFetchIdx(){try{const r=await fetch(CIGI_URL+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)return;const x=await r.json();if(!x||!x.items)return;CIGX=x;try{localStorage.setItem(CIGI_KEY,JSON.stringify(x))}catch(e){}if(PIDX&&PIDX._raw)PIDX=picPrep(PIDX._raw)}catch(e){}}
/* 香烟候选 → 目录行 [名称, 图片绝对地址, 0, "品牌分类|Cigarrillos"] */
function cigRows(){if(!CIGX||!CIGX.items)return[];const d=srcData("cigarrillos"),cat={};
 if(d)Object.entries(d.cats).forEach(([c,l])=>l.forEach(it=>{cat[skey(it[0])]=c}));
 const out=[];Object.entries(CIGX.items).forEach(([n,fs])=>(fs||[]).forEach(f=>{const c=cat[skey(n)]||"",b=c&&c!="OTRAS MARCAS"?c:n.split(" ")[0];out.push([n,CIGI_BASE+f,0,[b,c=="OTRAS MARCAS"?c:"","Cigarrillos"].filter(Boolean).join("|")])}));return out}
function picPrep(x0){const x={...x0,_raw:x0._raw||x0,items:(x0._raw||x0).items.concat(cigRows())};x.list=x.items.map(r=>{const k=skey(r[0]),w=k.split(" "),cl=String(r[3]||"").split("|").filter(Boolean);return{n:r[0],k,core:w.slice(1).join(" "),t:r[1],s:r[2],cl,cs:cl.map(norm)}});x.cats=new Set(x.list.flatMap(o=>o.cs));return x}
function picIdx(){if(PIDX)return PIDX;try{const x=JSON.parse(localStorage.getItem(IDX_KEY));if(x&&x.items)PIDX=picPrep(x)}catch(e){}return PIDX}
async function picFetchIdx(force){if(!CIGX||force)await cigFetchIdx();else if(!picFetchIdx._c){picFetchIdx._c=1;cigFetchIdx()}if(PIDX&&PIDX.v>=2&&!force)return PIDX;try{const r=await fetch(IDX_URL+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;const x=await r.json();if(!x.items)throw 0;try{localStorage.setItem(IDX_KEY,JSON.stringify(x))}catch(e){}PIDX=picPrep(x)}catch(e){}return picIdx()}
let PIC_HOOK=null;const picSrc=u=>/^https?:/.test(u||"")?u:PIC_HOOK?PIC_HOOK(u):NATIVE?"api/img?p="+encodeURIComponent(u):PIC_BASE+u;
function hiRes(u){return u.replace(/-430x430(\.\w+)$/,"-800x800$1")}
function picUrl(p,hi){if(!p)return"";if(p.d)return p.d;if(p.u&&/^https?:/.test(p.u))return p.u;return p.u?picSrc(hi?hiRes(p.u):p.u):""}
/* 该商品所在种类 → 官方分类过滤器（认不出种类时返回 null = 不限制） */
function picCatFilter(c){const x=picIdx();if(!x)return null;
 const tk=s=>norm(s||"").split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!PIC_STOP.has(w)).map(w=>PIC_ALIAS[w]||w.replace(/(es|s)$/,"")).filter(w=>w.length>=3),all=[...x.cats];
 {const nn=norm(c.name||"").trim();if(nn&&all.includes(nn))return o=>o.cs.includes(nn);if(/烟/.test(c.name||"")||/烟/.test(c.sub||""))return o=>o.cs.includes("cigarrillos")}
 for(const s of [c.name,c.sub]){const hit=tk(s).filter(w=>all.some(cn=>cn.includes(w)));if(hit.length)return o=>o.cs.some(cn=>hit.some(w=>cn.includes(w)))}
 return null}
function picScore(o,q){const s=Math.max(matchScore(o.k,q),o.core?matchScore(o.core,q):0);return s?s+(o.s?3:0):0}
function cigExactRows(name){const k=skey(name||"");if(!CIGX||!CIGX.items||!k)return[];const d=srcData("cigarrillos"),out=[];let brand="";
 if(d)for(const [b,l] of Object.entries(d.cats))if(l.some(it=>skey(it[0])==k)){brand=b;break}
 if(!brand)return[];for(const [n,fs] of Object.entries(CIGX.items))if(skey(n)==k)for(const f of fs||[])out.push({n,t:CIGI_BASE+f,cl:[brand,"Cigarrillos"],cs:[norm(brand),"cigarrillos"],k:skey(n),core:skey(n).split(" ").slice(1).join(" "),s:0});return out}
function picCands(name,c,lim,all){const x=picIdx();if(!x)return[];const q=skey(name);if(!q)return[];
 // 香烟源的精确品名只显示该品名审核通过的图片，不再用模糊词匹配相似 SKU
 if(srcNameOf(name)==="香烟源")return x.list.filter(o=>o.cs.includes("cigarrillos")&&skey(o.n)==q).map(o=>({o,s:100})).slice(0,lim||12);
 const f=all?null:picCatFilter(c);
 return x.list.filter(o=>!f||f(o)).map(o=>({o,s:picScore(o,q)})).filter(r=>r.s>=55).sort((a,b)=>b.s-a.s).slice(0,lim||6)}
function picBtn(ci,i,n){const c=cur().cats[ci],u=picUrl(picOf(n,c,c.items[i]));
 return `<button class="pxb ${u?"has":""}" onclick="picModal(${ci},${i})" title="商品图片">${u?`<img src="${esc(u)}" loading="lazy" onerror="this.parentNode.classList.remove('has');this.remove()">`:"🖼"}</button>`}
function picModal(ci,i){const o=cur(),c=o&&o.cats[ci],it=c&&c.items[i];if(!it)return;PM={ci,i,n:it.n,k:picKey(it.n,c,it),all:false};PWL=[];
 const p=PICS[PM.k],u=picUrl(p);
 modal(`<div class="mh">商品图片 · ${esc(it.n||"无名称商品")}</div>
 <div class="picnow">${u?`<img src="${esc(u)}">`:`<div class="noimg">🖼</div>`}<div><b>${u?"当前图片":"还没有图片"}</b><small>${esc(c.name||"未命名")} · 图片按类别记录</small>${p?`<button class="lnk" onclick="picDel()">移除图片</button>`:""}</div></div>
 <input class="sq" id="pq" style="border:1px solid #e3d8c8;margin:2px 0 2px" placeholder="换关键词：输入即筛官方，回车搜网上" oninput="picSearch(this.value)" onkeydown="if(event.key=='Enter'){event.preventDefault();picWebGo($('pq').value)}">
 <div class="pich"><span>🔎 官方图片</span><button class="lnk" id="pall" onclick="PM.all=!PM.all;picSearch($('pq').value)">搜全部类别</button></div>
 <div class="picsub" id="pinfo">加载官方目录…</div><div id="pl" class="pgrid"></div>
 ${NATIVE?`<div class="pich"><span>🌐 网上图片</span><button class="lnk" id="pwre" onclick="picWebGo($('pq').value)" hidden>重新搜索</button></div><div id="pwqs"></div><div class="picsub" id="pwinfo"><button class="webbtn" onclick="picWebGo($('pq').value)">🌐 搜网上图片${aiReady()?"（AI 生成搜索词）":""}</button></div><div id="pwl" class="pgrid"></div>`:""}
 <div class="ab picbar">${NATIVE?`<button onclick="nativePick(f=>picOwn({files:[f],value:''}))">📷 使用我的图片（拍照 / 相册）</button>`:`<label class="ab-l"><span>📷 使用我的图片（相册 / 文件）</span><input type="file" accept="image/*" style="display:none" onchange="picOwn(this)"></label>`}
 <button class="g" onclick="closeModal()">关闭</button></div>`);
 picFetchIdx().then(()=>{if(!$("pl"))return;picSearch("");if(NATIVE&&!$("pl").querySelector(".pxc"))picWebGo("")})}
function picSearch(q){if(!$('pl'))return;const c=cur().cats[PM.ci],x=picIdx();
 if(!x){$('pinfo').innerHTML='<span style="color:#c0392b">无法获取官方图片目录，请检查网络</span>';return}
 const cig=srcNameOf(PM.n)==="香烟源",f=PM.all?null:picCatFilter(c);let r;
 if(cig){const k=skey(PM.n);r=x.list.filter(o=>o.cs.includes("cigarrillos")&&skey(o.n)==k).map(o=>({o,s:100}));if(q.trim()){const z=skey(q);r=r.filter(y=>picScore(y.o,z)>0)}}
 else if(q.trim()){const k=skey(q);r=x.list.filter(o=>!f||f(o)).map(o=>({o,s:picScore(o,k)})).filter(y=>y.s>0).sort((a,b)=>b.s-a.s).slice(0,18)}else r=picCands(PM.n,c,12,PM.all);
 $('pinfo').textContent=cig?("精确品名「"+PM.n+"」· 已核对候选 · "+r.length+" 张"):(PM.all?"全部类别":(f?"只显示和「"+(c.name||"")+"」同类":"认不出对应类别，显示全部"))+" · "+r.length+" 张";
 $('pall').hidden=cig;$('pall').textContent=PM.all?"只搜本类别":"搜全部类别";
 $('pl').innerHTML=r.map(y=>`<button class="pxc" onclick="picPick(${x.list.indexOf(y.o)})"><img src="${esc(picSrc(y.o.t))}" loading="lazy"><span>${esc(y.o.n)}</span><small>${esc(y.o.cl[0]||"")}</small></button>`).join("")||`<div class="hint">${cig?"这个精确品名暂无审核通过的官方候选图":"官方目录没有匹配"+(NATIVE?"，看下面的网上图片":"，换个关键词试试")}</div>`}
/* 网上搜图：品名 + 所属商品源的提示词（香烟加 cigarrillos），列出多张让用户选 */
function picWebQ(n){const c=cur().cats[PM.ci],sc=srcNameOf(n)||"";const hint=/香烟/.test(sc)?"cigarrillos":/saphirus/i.test(sc)?"Saphirus":"";
 return [hint,n,!sc&&c&&c.name&&!/^general$/i.test(c.name)?c.name:""].filter(Boolean).join(" ")}
const AIQC={};
/* 返回多个搜图词候选（有 API 才用；按商品缓存） */
async function aiImgQueries(n,ctx){const k=skey(n)+"|"+(ctx||"");if(AIQC[k])return AIQC[k];if(!aiReady()||!n)return[];
 try{const t=await aiCall([{role:"user",content:`为下面这个商品写 5 条不同的图片搜索关键词，用来在网上（阿根廷零售网站，如 Rappi、超市网店）找到这个商品本身的包装照片。
商品：${n}${ctx?"\n所属：「"+ctx+"」":""}
要求：用西班牙语/商品原文；每条都包含品牌；从不同角度写（完整规格 / 常见叫法 / 加 Argentina / 加 atado、paquete、box 等包装词 / 只写品牌和系列）；KS、RCB、SOF 这类内部缩写换成常见说法；每条不超过 8 个词。
输出 JSON 字符串数组，只输出数组。`}],200);
  const m=String(t||"").match(/\[[\s\S]*\]/);let a=[];if(m){try{a=JSON.parse(m[0])}catch(e){}}
  if(!a.length)a=String(t||"").split("\n");
  a=[...new Set(a.map(x=>String(x).replace(/^[\s\-\d.)、]+|["'「“」”]+/g,"").trim()).filter(x=>x&&x.length<=90))].slice(0,5);
  if(a.length)AIQC[k]=a;return a}catch(e){return[]}}
async function aiImgQuery(n,ctx){const a=await aiImgQueries(n,ctx);return a[0]||null}
function qChips(list,cur,fn){return list.length?`<div class="aichips" style="margin:0 0 6px">${list.map((x,i)=>`<button class="aichip ${x===cur?"on":""}" style="${x===cur?"outline:2px solid var(--c,#c0562f)":""}" onclick="${fn}(${i})">🤖 ${esc(x)}</button>`).join("")}</div>`:""}
let PWL=[];
let PWQ=[];
function picWebQi(i){picWebGo(PWQ[i],1)}
async function picWebGo(q,chip){q=String(q||"").trim();if(!$("pwl"))return;
 if(PWQ.key!==PM.k){PWQ=[];PWQ.key=PM.k;if(aiReady()){$("pwinfo").textContent="⏳ AI 生成搜索词候选…";const a=await aiImgQueries(PM.n,srcNameOf(PM.n)||(cur().cats[PM.ci]||{}).name);PWQ=a.slice();PWQ.key=PM.k}}
 if(!$("pwl"))return;q=q||PWQ[0]||picWebQ(PM.n);const byAi=PWQ.includes(q);
 $("pwqs").innerHTML=PWQ.length?qChips(PWQ,q,"picWebQi"):"";$("pwl").innerHTML="";$("pwinfo").textContent="⏳ 搜索「"+q+"」…";if($("pwre"))$("pwre").hidden=false;
 const arr=await webImgSearch(q);if(!$("pwl"))return;
 if(arr===null){$("pwinfo").innerHTML='<span style="color:#c0392b">网上搜图失败，请检查网络后重试</span>';return}
 PWL=arr.filter(x=>x.t||x.u).filter(x=>!x.w||!x.h||(x.w/x.h>0.4&&x.w/x.h<2.5)).slice(0,30);
 $("pwinfo").textContent=(byAi?"🤖 AI 搜索词 · ":"")+(PWL.length?PWL.length+" 张 · 点一张即设为图片":"没找到，换个关键词再回车");
 $("pwl").innerHTML=PWL.map((x,i)=>`<button class="pxc" onclick="picWebPick(${i})"><img src="${esc(x.t||x.u)}" loading="lazy" onerror="this.parentNode.remove()"><small>${esc((x.s||"").replace(/^www\./,"").slice(0,24))}${x.w?" · "+x.w+"×"+x.h:""}</small></button>`).join("")}
async function picWebPick(i){const x=PWL[i];if(!x)return;toast("下载图片…");let d=await webImgData(x.u);if(!d&&x.t)d=await webImgData(x.t);
 if(!d){toast("⚠ 这张下载失败，换一张试试");return}PICS[PM.k]={d};if(picSave()){closeModal();renderEdit();toast("已设置图片")}}
function picPick(ix){const o=PIDX.list[ix];PICS[PM.k]={u:o.t};if(picSave()){closeModal();renderEdit();toast("已设置图片")}}
function picDel(){delete PICS[PM.k];picSave();closeModal();renderEdit()}
function picOwn(inp){const f=inp.files&&inp.files[0];inp.value="";if(!f)return;const im=new Image(),u=URL.createObjectURL(f);
 im.onload=()=>{const m=520,s=Math.min(1,m/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);
  const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);g.drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(u);
  PICS[PM.k]={d:cv.toDataURL("image/jpeg",.86)};if(picSave()){closeModal();renderEdit();toast("已设置我的图片")}};
 im.onerror=()=>toast("⚠ 无法读取这张图片");im.src=u}
/* 一键匹配：当前订单所有品项，只在各自类别里找；自己的图片永远不覆盖 */
async function picAuto(force){const o=cur();if(!o)return;toast("匹配中…");await picFetchIdx();if(!picIdx()){toast("⚠ 无法获取官方图片目录，请检查网络");return}
 let ok=0,skip=0;const miss=[];
 o.cats.forEach((c,ci)=>c.items.forEach((it,i)=>{if(!it.n)return;const k=picKey(it.n,c,it),p=PICS[k];if(p&&(!force||p.d)){skip++;return}
  const r=picCands(it.n,c,1)[0];if(r&&r.s>=85){PICS[k]={u:r.o.t};ok++}else if(!p)miss.push([ci,i,it.n])}));
 picSave();renderEdit();
 modal(`<div class="mh">图片匹配完成</div><div class="mt">新匹配 ${ok} 个${skip?"，已有图片跳过 "+skip+" 个":""}${miss.length?"，未匹配 "+miss.length+" 个（只在本类别里找）。点名字可手动选图：":"。"}</div>${miss.length?`<div class="ab" style="max-height:40vh;overflow:auto">${miss.map(m=>`<button class="g" onclick="picModal(${m[0]},${m[1]})">${esc(m[2])}</button>`).join("")}</div>`:""}<div class="mb2" style="flex-wrap:wrap">${force?"":`<button class="g" onclick="closeModal();picAuto(true)">🔄 覆盖重配官方图</button>`}<button onclick="closeModal()">好</button></div><div class="mt" style="font-size:12px">「覆盖重配」只换官方图，你自己的图片不会动。</div>`)}
/* 海报/表格用：预载图片 */
const IMGC={};
function picLoad(u){if(!u)return Promise.resolve(null);if(IMGC[u])return IMGC[u];return IMGC[u]=new Promise(r=>{const im=new Image();if(!/^(data:|api\/)/.test(u))im.crossOrigin="anonymous";im.onload=()=>r(im);im.onerror=()=>{delete IMGC[u];r(null)};im.src=u})}
async function picPre(cats){const m=new Map();await Promise.all(cats.flatMap(c=>c.items.map(async it=>{const u=picUrl(picOf(it.n,c,it),true);if(!u)return;const im=await picLoad(u)||await picLoad(picUrl(picOf(it.n,c,it)));if(im)m.set(it,im)})));return m}
async function picXl(cats){const m=new Map(),im=await picPre(cats.map(x=>({...x.c,items:x.items})));
 im.forEach((img,it)=>{const cv=document.createElement("canvas"),s=Math.min(1,420/Math.max(img.width,img.height));cv.width=Math.round(img.width*s);cv.height=Math.round(img.height*s);const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);g.drawImage(img,0,0,cv.width,cv.height);
  const b=atob(cv.toDataURL("image/jpeg",.92).split(",")[1]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);m.set(it,{u,w:cv.width,h:cv.height})});return m}

