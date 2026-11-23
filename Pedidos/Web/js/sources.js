/* ================= 官方目录导入 ================= */
/* ================= 外挂商品源（Saphirus 源 / 香烟源 / 自定义） ================= */
const SRC_KEY="pedidos_sources_v1",SRC_DEF="https://raw.githubusercontent.com/leohenshuai/pedidos-ios/main/sources/saphirus.json",CIG_DEF="https://raw.githubusercontent.com/leohenshuai/pedidos-ios/main/sources/cigarrillos.json";
const CIG_BUILTIN={"src":"Cigarrillos Argentina (ARCA)","name":"香烟","date":"2026-11-13","cats":{"LUCKY STRIKE":[["Luckies Red SC 20",2250,0],["Lucky Strike 43/70",5250,0],["Lucky Strike Charged Box 12",3400,0],["Lucky Strike Charged Box 20",5650,0],["Lucky Strike Convertible Box 12",3400,0],["Lucky Strike Convertible Box 20",5650,0],["Lucky Strike Convertible KS 20",5250,0],["Lucky Strike Convertible XL",5650,0],["Lucky Strike Double Plus Box 12",3700,0],["Lucky Strike Double Plus Box 20",6200,0],["Lucky Strike Double Plus XL Box 20",6200,0],["Lucky Strike Eclipse Box 20",6200,0],["Lucky Strike Fresh Crisp Box 20",6200,0],["Lucky Strike Origen Convertible Box 10",2200,0],["Lucky Strike Origen Convertible SC 20",3650,0],["Lucky Strike Origen Convertibles Box 20",4050,0],["Lucky Strike Origen Red Box 10",2000,0],["Lucky Strike Origen Red Box 20",4050,0],["Lucky Strike Origen Red SC 20",3650,0],["Lucky Strike Original (Red) Box 12",3360,0],["Lucky Strike Paris Box 20",6750,0],["Lucky Strike Purple Mix Box 20",6200,0],["Lucky Strike Purple Mix XL Box 20",6200,0],["Lucky Strike Red (Original) Box 20",5650,0],["Lucky Strike Red (Original) KS 20",5250,0],["Lucky Strike Red Mix Box 12",3700,0],["Lucky Strike Red Mix Box 20",6200,0],["Lucky Strike Red Mix XL Box 20",6200,0],["Lucky Strike Silver SC 20",5250,0],["Lucky Strike Wild Mix Box 10",360,0],["Lucky Strike Wild Mix Box 20",6200,0]],"OTRAS MARCAS":[["357 Blue (Openbox)",118,0],["357 Red (Openbox)",118,0],["51 King Size",1750,0],["51 Suave",1750,0],["Black Infinity (Openbox)",120,0],["Bold Full Flavor",520,0],["Bold Mint Flavor",520,0],["Corona",650,0],["Dolar",1750,0],["Dollar",1750,0],["Eight King Size (Openbox)",125,0],["Go!",409,0],["Harmony Colorado KS 20",4650,0],["Harmony Dorados KS 20",4650,0],["JG Box 20",250,0],["Kiel",900,0],["Kiel Box",917,0],["Marbella Box 20",450,0],["Master Box",1017,0],["Master Filter",920,0],["Pablo Emilio",410,0],["Parliament (Blue) KS RCB 20",6750,0],["Parliament Superslims 100 Box 20 SSL",6750,0],["Rodeo Classic Limited Edition (Openbox)",125,0],["Rodeo Original Blend",37,0],["Six One",1750,0],["VIP King Size",920,0],["West Red FF Box",1217,0],["Winston Box 20",3490,0]],"MARLBORO":[["Marlboro (Red Fwd) KS Box 12",3700,0],["Marlboro Blue Titanium KS RCB 20",6750,0],["Marlboro Crafted (Silver Blue) KS 20",3650,0],["Marlboro Crafted 2.0 (Red) KS 20",3650,0],["Marlboro Crafted 2.0 (Red) KS Box 20",4050,0],["Marlboro Crafted 3.0 Purple KS Box 20",4050,0],["Marlboro Crafted Coral KS Box 20",4050,0],["Marlboro Crafted Forward KS Box 20",4050,0],["Marlboro Crafted Forward KS SOF 20",3650,0],["Marlboro Gold KS RCB 20",6200,0],["Marlboro Gold Titanium 100 Box 20 SSL",6750,0],["Marlboro KS SOF 20",5800,0],["Marlboro Purple Fusion 2 100 Box 20",6200,0],["Marlboro Red KS Box 20",6200,0],["Marlboro Red Titanium Edition KS Box 20",6200,0],["Marlboro Vista Blue Mnt 100 Box 20",6200,0],["Marlboro Vista Coral Fusion 2 100 Box 20",6200,0],["Marlboro Vista Limited Edition 100 Box 20",6200,0],["Marlboro Vista Purple Fusion 2 KS Box 12",3700,0]],"ROTHMANS":[["Rothmans Citrus (Click Sunset) SC 20",1650,0],["Rothmans Convertible Box 12",1280,0],["Rothmans Convertible Box 20",1650,0],["Rothmans Convertible- Lucky Origen",1650,0],["Rothmans International XL Purple Box 20",1650,0],["Rothmans Red - Lucky Origen",1650,0],["Rothmans Red 43/70 XL Box 20",5250,0],["Rothmans Red Box 12",1060,0],["Rothmans XL Convertible Box 20",1650,0],["Rothmans XL Convertible KS 20",1650,0],["Rothmans XL Red Box 20",1650,0],["Rothmans XL Red KS 20",1650,0]],"RED POINT":[["Red Point Blue",1000,0],["Red Point Box (10)",600,0],["Red Point Eco Filters Box 20",1107,0],["Red Point Filter",1000,0],["Red Point Filter Box",1200,0],["Red Point Green",1000,0],["Red Point ON Box",1217,0],["Red Point ON Box 10",600,0],["Red Point ON Duo Box 20",1217,0],["Red Point ON Six Box 10",600,0],["Red Point ON Six Box 20",1217,0]],"CHESTERFIELD":[["Chesterfield Blue Motion Box 20",5050,0],["Chesterfield Blue Motion KS Box 12",3010,0],["Chesterfield Blue Motion KS SOF 20",4650,0],["Chesterfield Purple Motion 1 KS SOF 20",4650,0],["Chesterfield Purple Motion 2 KS Box 20",5050,0],["Chesterfield Red 4.0 KS 20",4650,0],["Chesterfield Red 4.0 KS Box 10",2525,0],["Chesterfield Red 4.0 KS Box 12",3010,0],["Chesterfield Red 4.0 KS Box 20",5050,0]],"GOLDEN KING":[["Golden King Box Blue",500,0],["Golden King Box Click",550,0],["Golden King Box Exclusive",520,0],["Golden King Box Green",300,0],["Golden King Box Red",300,0],["Golden King Soft Blue",450,0],["Golden King Soft Green",450,0],["Golden King Soft Red",450,0],["Golden KIng Soft Uva",450,0]],"PHILIP MORRIS":[["Philip Morris (Red) KS Box 20",5650,0],["Philip Morris (Red) KS SOF 20",5250,0],["Philip Morris Blue Select KS SOF 20",2250,0],["Philip Morris Blue Spin KS Box 12",3400,0],["Philip Morris Blue Spin KS Box 20",5650,0],["Philip Morris Original KS Box 12",3360,0],["Philip Morris Random Spin KS Box 12",3400,0],["Philip Morris Red Select KS SOF 20",2250,0]],"CAMEL":[["Camel Blue Box 20",6200,0],["Camel Box 11",3700,0],["Camel Box 12",3700,0],["Camel Circle Box 20",6000,0],["Camel Filters Box 20",6200,0],["Camel KS 20",5800,0],["Camel Legend - The Original Story SC 20",3650,0],["Camel Legend Box 20 - The Original Story",4050,0]],"PIER":[["Pier Box 10",146,0],["Pier Box 20",250,0],["Pier Caps",970,0],["Pier Caps Purple",970,0],["Pier Green",730,0],["Pier Menthol Box 10",146,0],["Pier Menthol Box 20",250,0],["Pier Original",730,0]],"LIVERPOOL":[["Liverpool Blue Box 20",250,0],["Liverpool Blue Pop",970,0],["Liverpool Menthol Box 20",250,0],["Liverpool Red Box 20",250,0],["Liverpool Special Blue",730,0],["Liverpool Special Green",730,0],["Liverpool Special Red",730,0]],"MILENIO":[["Milenio Gold",700,0],["Milenio Icergy",750,0],["Milenio Menta",700,0],["Milenio Pink Wave Mintz",750,0],["Milenio Red",700,0],["Milenio Vid Icergy",750,0]],"DOLCHESTER":[["Dolchester Black",730,0],["Dolchester Box 10",146,0],["Dolchester Box 20",250,0],["Dolchester Deluxe Box 20",250,0],["Dolchester Golden Edition",730,0],["Dolchester Silver Edition",730,0]],"MELBOURNE":[["Melbourne Blue Aura",600,0],["Melbourne Full",600,0],["Melbourne Mild",600,0],["Melbourne Mint",600,0],["Melbourne Mintz Caps",750,0]],"V8":[["V8 Classic",37,0],["V8 Classic (Soft)",118,0],["V8 Finest",37,0],["V8 Finest (Soft)",118,0],["V8 Menthol (Soft)",118,0]],"BLACK KING":[["Black King Classic Red (Openbox)",120,0],["Black King Finest Blend (Openbox)",120,0],["Black King Menthol (Openbox)",120,0],["Black King Only For Queens (Openbox)",120,0]],"MILL":[["Mill Explosion",600,0],["Mill Mintz Verde",600,0],["Mill Red",600,0]],"DIESEL":[["Classic Silver Diesel Box 20",700,0],["Diesel Classic Box 20",700,0],["Diesel Menthol Box 20",700,0]],"MELBO":[["Melbo Classic Soft 20",660,0],["Melbo Menthol Soft 20",660,0],["Melbo Silver Soft 20",660,0]],"BOXER":[["Boxer Classic",905,0],["Boxer Light",905,0],["Boxer Menthol",905,0]],"CJ":[["CJ Convertible",420,0],["CJ Mentolado",410,0],["CJ Tradicional",410,0]]}};
let SRCS=(()=>{try{const x=JSON.parse(localStorage.getItem(SRC_KEY));if(x&&Array.isArray(x.list)&&x.list.length)return x}catch(e){}return{list:[{id:"saphirus",name:"Saphirus 源",url:SRC_DEF}],cache:{},sel:"saphirus"}})();
/* 迁移：旧数据补上香烟源；旧名「Saphirus」改「Saphirus 源」 */
(()=>{let ch=false;const sp=SRCS.list.find(x=>x.id==="saphirus");if(sp&&sp.name==="Saphirus"){sp.name="Saphirus 源";ch=true}
 if(!SRCS.list.some(x=>x.id==="cigarrillos")&&!SRCS.cigDel){SRCS.list.push({id:"cigarrillos",name:"香烟源",url:CIG_DEF});ch=true}
 if(ch)try{localStorage.setItem(SRC_KEY,JSON.stringify(SRCS))}catch(e){}})();
function srcSave(){try{localStorage.setItem(SRC_KEY,JSON.stringify(SRCS))}catch(e){}}
function srcData(id){return SRCS.cache[id]||(id==="saphirus"?OFFICIAL_BUILTIN:id==="cigarrillos"?CIG_BUILTIN:null)}
/* 品名 → 所在商品源名称（第一个命中的源为准） */
function srcNameOf(n){const k=skey(n);for(const x of SRCS.list){const d=srcData(x.id);if(d&&Object.values(d.cats).some(l=>l.some(it=>skey(it[0])==k)))return x.name}return ""}
function srcValid(d){return !!(d&&typeof d==="object"&&d.cats&&typeof d.cats==="object"&&Object.values(d.cats).every(l=>Array.isArray(l)&&l.every(it=>Array.isArray(it)&&typeof it[0]==="string"&&it[0])))}
function srcCount(d){return d?Object.values(d.cats).reduce((a,b)=>a+b.length,0):0}
async function srcFetch(s){const r=await fetch(s.url+(s.url.includes("?")?"&":"?")+"t="+Date.now(),{cache:"no-store"});if(!r.ok)throw new Error("HTTP "+r.status);const d=await r.json();if(!srcValid(d))throw new Error("数据格式不对");SRCS.cache[s.id]=d;srcSave();return d}
let OFFICIAL={cats:{},date:"",src:""};
function srcCur(){return SRCS.list.find(x=>x.id===SRCS.sel)||SRCS.list[0]}
function srcUse(id){const s=SRCS.list.find(x=>x.id===id)||SRCS.list[0];SRCS.sel=s.id;srcSave();OFFICIAL=srcData(s.id)||{cats:{},date:"未获取",src:s.name}}
function srcPick(id){srcUse(id);CSEL={};catRender();srcAuto()}
async function srcAuto(){const s=srcCur();try{const old=(srcData(s.id)||{}).date,d=await srcFetch(s);if(SRCS.sel===s.id&&$("cl")){if(d.date!==old)CSEL={};OFFICIAL=d;catRender()}}catch(e){if($("cinfo")&&!srcData(s.id))$("cinfo").innerHTML+=`<br><span style="color:#c0392b">获取失败：${esc(e.message)}（请检查网络或网址）</span>`}}
function srcModal(){
 modal(`<div class="mh">商品源管理</div><div class="mt">内置 Saphirus 源和香烟源（阿根廷 ARCA 官方香烟价目，按品牌分类）。商品源是一个网址，内容为 JSON：<code>{"src":"名称","date":"日期","cats":{"AROMA":[["品名",价格,0]],...}}</code>（每项 [名称, 参考价, 是否60ml(0/1)]）。可添加多个来源，在官方目录导入里切换。</div><div id="sl"></div>
 <div style="margin:8px 0"><input class="sq" id="sn" style="border:1px solid #e3d8c8;margin:0 0 6px" placeholder="名称，如 其他供应商"><input class="sq" id="su" style="border:1px solid #e3d8c8;margin:0 0 6px" placeholder="https://…/xxx.json"></div>
 <div class="mb2"><button class="g" onclick="closeModal()">关闭</button><button onclick="srcAdd()">添加并获取</button></div>`);srcList()}
function srcRows(){return SRCS.list.map(s=>{const d=srcData(s.id);return `<div class="srow ${SRCS.sel===s.id?"sel":""}"><span style="flex:1;min-width:0" onclick="srcSel('${s.id}')"><b>${esc(s.name)}</b><br><small style="color:#999;word-break:break-all">${d?srcCount(d)+" 项 · "+esc(d.date||""):"未获取"}</small></span><button onclick="srcUpd('${s.id}')">更新</button>${s.id==="saphirus"?"":`<button onclick="srcDel('${s.id}')" style="color:#c0392b">删除</button>`}</div>`}).join("")}
function srcList(){const r=srcRows();if($("sl"))$("sl").innerHTML=r;if($("sl2"))$("sl2").innerHTML=r;if(typeof srcPageList=="function")srcPageList()}
function srcSel(id){srcUse(id);srcList()}
async function srcUpd(id){const s=SRCS.list.find(x=>x.id===id);toast("获取中…");try{const d=await srcFetch(s);toast("已更新："+srcCount(d)+" 项");if(SRCS.sel===id)OFFICIAL=d}catch(e){toast("失败："+e.message)}srcList()}
function srcDel(id){if(!confirm("删除这个商品源？"))return;SRCS.list=SRCS.list.filter(x=>x.id!==id);delete SRCS.cache[id];if(id==="cigarrillos")SRCS.cigDel=1;if(SRCS.sel===id)SRCS.sel="saphirus";srcSave();srcList()}
async function srcAdd(){const m=$("md").style.display=="flex",I=m?["sn","su"]:["pn","pu"];const n=$(I[0]).value.trim(),u=$(I[1]).value.trim();if(!n||!/^https?:\/\//i.test(u)){toast("请填写名称和 http(s) 网址");return}
 const s={id:"s"+Date.now().toString(36),name:n,url:u};toast("获取中…");try{await srcFetch(s);SRCS.list.push(s);srcSave();toast("已添加："+n);$(I[0]).value=$(I[1]).value=""}catch(e){toast("失败："+e.message)}srcList()}
function homeCat(){const L=S.orders.filter(o=>!o.del);if(!L.length){toast("请先新建一个订单");return}
 if(L.length===1)return homeCatGo(L[0].id);
 modal(`<div class="mh">导入到哪个订单？</div><div class="ab" style="margin-top:6px">${L.map(o=>`<button onclick="homeCatGo('${o.id}')">${esc(o.sup||"未命名")} · ${esc(o.dt||"")}</button>`).join("")}<button class="g" onclick="closeModal()">取消</button></div>`)}
function homeCatGo(id){closeModal();CATO=id;catModal()}
let CQ="",CSEL={},CML=true;
const OFF_TARGET={AROMA:["aroma","aerosol","aromatizante"],TEXTIL:["textil","textile","tela"],DIFUSORES:["difusor","difusores","dif"]};
function offTargetIdx(o,key){const ks=OFF_TARGET[key]||[norm(key)];const i=o.cats.findIndex(c=>ks.some(k=>norm(c.name).includes(k)||norm(c.sub||"").includes(k)));return i}
function catModal(){CQ="";CSEL={};CML=true;srcUse(SRCS.sel);catRender(true);srcAuto()}
function catInfo(){return `来源 ${esc(OFFICIAL.src||srcCur().name)}（${esc(OFFICIAL.date||"")}），共 ${srcCount(OFFICIAL)} 个商品。勾选后导入，<b>数量默认 0</b>，订货时再改；数量为 0 的不会出现在海报和表格里。已在订单里的会标“已有”并跳过。`}
function catKey(k,i){return k+"|"+i}
function catRender(first){
 const o=cur(),nq=norm(CQ);
 let h="",total=0,newN=0;
 if(!first&&$("cinfo"))$("cinfo").innerHTML=catInfo();
 Object.entries(OFFICIAL.cats).forEach(([key,list])=>{
  const ti=offTargetIdx(o,key),tgt=ti>=0?o.cats[ti]:null,have=new Set(tgt?tgt.items.map(i=>norm(i.n)):[]);
  const rows=list.map((it,i)=>({it,i})).filter(({it})=>(CML||!it[2])&&(!nq||norm(it[0]).includes(nq)));
  const sel=rows.filter(({i})=>CSEL[catKey(key,i)]).length,addable=rows.filter(({it})=>!have.has(norm(it[0])));
  total+=sel;newN+=rows.filter(({it,i})=>CSEL[catKey(key,i)]&&!have.has(norm(it[0]))).length;
  h+=`<div class="cg"><div class="cgh"><b>${key} <small style="font-weight:400;color:#999">${rows.length} 项 · 已选 ${sel}${tgt?"":" · 将新建种类"}</small></b><button onclick="catAll('${key}',true)">全选未有</button><button onclick="catAll('${key}',false)">清除</button></div>`+
  rows.map(({it,i})=>{const ex=have.has(norm(it[0]));return `<label class="co ${ex?"have":""}"><input type="checkbox" ${CSEL[catKey(key,i)]&&!ex?"checked":""} ${ex?"disabled":""} onchange="CSEL['${catKey(key,i)}']=this.checked;catRender()"><span>${esc(it[0])}${it[2]?' <small>60ml</small>':''}</span>${ex?'<span class="tg">已有</span>':`<small>$${it[1]}</small>`}</label>`}).join("")+`</div>`;
 });
 if(first){
  modal(`<div class="mh">从商品源导入</div><div style="display:flex;gap:6px;margin:4px 0"><select id="csrc" style="flex:1;padding:6px;border:1px solid #e3d8c8;border-radius:8px;font-size:16px" onchange="srcPick(this.value)">${SRCS.list.map(s=>`<option value="${s.id}" ${s.id===SRCS.sel?"selected":""}>${esc(s.name)}</option>`).join("")}</select><button class="g" onclick="srcModal()">管理</button></div><div class="mt" id="cinfo"></div>
  <input class="sq" id="cq" style="border:1px solid #e3d8c8;margin:0 0 6px" placeholder="搜索官方品名" oninput="CQ=this.value;catRender()">
  ${Object.values(OFFICIAL.cats).some(l=>l.some(it=>it[2]))?`<label class="opt" style="margin:4px 0"><input type="checkbox" checked onchange="CML=this.checked;catRender()"> 包含 60ml 小规格（DIFUSORES）</label>`:""}
  <div class="cl" id="cl"></div>
  <div class="mb2"><button class="g" onclick="closeModal()">取消</button><button id="cgo" onclick="catApply()">导入</button></div>`);
 }
 $("cinfo").innerHTML=catInfo();
 const st=$("cl").scrollTop;$("cl").innerHTML=h;$("cl").scrollTop=st;$("cgo").textContent="导入 "+newN+" 项";$("cgo").disabled=!newN;
}
function catAll(key,on){const o=cur(),nq=norm(CQ),ti=offTargetIdx(o,key),have=new Set(ti>=0?o.cats[ti].items.map(i=>norm(i.n)):[]);
 OFFICIAL.cats[key].forEach((it,i)=>{if((CML||!it[2])&&(!nq||norm(it[0]).includes(nq))&&!have.has(norm(it[0])))CSEL[catKey(key,i)]=on});catRender()}
function catApply(){
 let add=0,newCats=0;
 mut(o=>{Object.entries(OFFICIAL.cats).forEach(([key,list])=>{
  const picked=list.filter((it,i)=>CSEL[catKey(key,i)]);if(!picked.length)return;
  let ti=offTargetIdx(o,key),tgt=ti>=0?o.cats[ti]:null;
  if(!tgt){tgt={name:key,sub:{AROMA:"Aromatizante",TEXTIL:"Perfume para telas",DIFUSORES:"Difusores"}[key]||"",color:pickColor(o),items:[]};o.cats.push(tgt);newCats++}
  const have=new Set(tgt.items.map(i=>norm(i.n)));
  picked.forEach(it=>{if(have.has(norm(it[0])))return;tgt.items.push({n:it[0],q:0,p:o.price&&it[1]?it[1]:null});have.add(norm(it[0]));addVocab(it[0]);add++})})});
 save();closeModal();if(CATO)renderHome();toast("已导入 "+add+" 项"+(newCats?"，新建 "+newCats+" 个种类":"")+"（数量均为 0）",undo)}

/* ================= 更多菜单 ================= */
function moreMenu(){
 modal(`<div class="mh">更多</div><div class="ab" style="margin-top:6px">
  <button onclick="closeModal();importModal()">📋 批量导入（粘贴文字清单）</button>
  <button class="g" onclick="closeModal()">关闭</button></div>`)}

function openNC(){$("ncb").hidden=true;$("ncw").hidden=false;$("ncn").focus()}
function closeNC(){$("ncw").hidden=true;$("ncb").hidden=false;$("ncn").value=""}

/* 分段控件光圈：保留 lens 元素，只换按钮；同一订单内切换时拉伸滑动 */
function segRender(id,btnsHtml,key){const seg=$(id);if(!seg)return;
 let ln=seg.querySelector(".slens");if(!ln){ln=document.createElement("i");ln.className="slens"}
 seg.innerHTML=btnsHtml;seg.insertBefore(ln,seg.firstChild);segPlace(seg,ln,key)}
function segPlace(seg,ln,key,tries){const act=seg.querySelector("button.on");if(!act)return;
 const b=seg.getBoundingClientRect(),r=act.getBoundingClientRect();
 if(!r.width){if((tries||0)<8)requestAnimationFrame(()=>segPlace(seg,ln,key,(tries||0)+1));return}
 const x=r.left-b.left-seg.clientLeft,w=r.width,same=seg.dataset.key===String(key)&&seg.dataset.lx!=null,lx=+seg.dataset.lx,lw=+seg.dataset.lw;
 if(same&&Math.abs(x-lx)>4){
  ln.style.transition="none";ln.style.left=lx+"px";ln.style.width=lw+"px";void ln.offsetWidth;ln.style.transition="";
  const l0=Math.min(x,lx),w0=Math.max(x+w,lx+lw)-l0;ln.classList.add("stretch");ln.style.left=l0+"px";ln.style.width=w0+"px";
  clearTimeout(seg._t);seg._t=setTimeout(()=>{ln.classList.remove("stretch");ln.style.left=x+"px";ln.style.width=w+"px"},150)}
 else{ln.style.transition="none";ln.style.left=x+"px";ln.style.width=w+"px";void ln.offsetWidth;ln.style.transition=""}
 ln.style.opacity=1;seg.dataset.key=key;seg.dataset.lx=x;seg.dataset.lw=w}

