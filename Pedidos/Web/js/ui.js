/* ---------- 主页 ---------- */
function renderHome(){if(typeof bkHint=="function")bkHint();
 const os=[...S.orders].sort((a,b)=>b.upd-a.upd);
 $("hCnt").textContent=os.length+" 个订单";
 const cn={all:os.length};Object.keys(STAT).forEach(k=>cn[k]=os.filter(o=>o.status==k).length);
 $("hf").innerHTML=[["all","全部"],...Object.entries(STAT).map(([k,v])=>[k,v[0]])].map(([k,t])=>`<button class="${HF==k?'on':''} ${k=='all'?'all':''}" style="--c:${k=='all'?'#f0c987':STAT[k][1]}" onclick="HF='${k}';renderHome()">${t}<span class="nb">${cn[k]}</span></button>`).join("");
 const nq=norm(HQ);
 if(nq){
  HR=[];os.forEach(o=>o.cats.forEach(c=>c.items.forEach(it=>{if(norm(it.n).includes(nq))HR.push({o,c,it})})));
  const orders=new Set(HR.map(x=>x.o.id)).size,tot=HR.reduce((a,x)=>a+x.it.q,0);
  $("olist").innerHTML=`<div class="hl"><div class="hs">“${esc(HQ.trim())}”：${HR.length} 条，涉及 ${orders} 个订单，累计 ${tot} 件（点击进入订单）</div>`+
   HR.slice(0,150).map((x,i)=>`<div class="hr" style="--c:${x.c.color}" onclick="openHit(${i})"><div><b>${esc(x.it.n)}</b><small>${esc(x.c.name)} · ${esc(x.o.sup||"未命名订单")} · ${esc(x.o.dt)} · ${STAT[x.o.status][0]}</small></div><span class="pill">${x.it.q}</span></div>`).join("")+
   (HR.length?"":`<div class="empty">订单里没有包含这个名字的品项</div>`)+
   `<button class="cnew" style="background:#7a5cc7;margin-top:8px" onclick="homeAsk()">🔎 搜索商品“${esc(HQ.trim())}”并加入订单（先查本地，没有再联网 / AI）</button>`+`</div>`;
  return;
 }
 const list=os.filter(o=>HF=="all"||o.status==HF);
 $("olist").innerHTML=`<div class="g2">`+list.map(o=>{const c=(o.cats[0]||{}).color||COLORS[0],st=STAT[o.status];
  return `<div class="oc" style="--c:${c}" onclick="open_('${o.id}')"><div class="oct">${esc(o.sup||"未命名订单")}</div><div class="ocm"><span class="st" style="background:${st[1]}" onclick="event.stopPropagation();cycleSt('${o.id}')">${st[0]}</span> ${esc(o.dt)}</div><div class="ocs"><b>${unitSums(o,o.cats.flatMap(c=>c.items)).size>1?totTxt(o,"zh"):sumO(o)}</b> ${unitSums(o,o.cats.flatMap(c=>c.items)).size>1?"":(o.unit||"件")} · ${o.cats.length} 类 ${cnt(o)} 项${o.price&&amtO(o)?"<br>"+esc(o.cur)+fmt(amtO(o)):""}</div><div class="oca"><button onclick="event.stopPropagation();dup('${o.id}')">再订一单</button><button class="del" onclick="event.stopPropagation();arm(this,()=>delOrder('${o.id}'),'确认删除?')">删除</button></div></div>`}).join("")
  +`<button class="newo" onclick="newOrder()"><span class="np">＋</span><span class="nl">新建订单</span></button>`+(list.length?"":`<div class="empty">这个状态下没有订单</div>`)+`</div>`;
}
function homeAsk(){const q=HQ.trim();if(!q)return;const os=[...S.orders].sort((a,b)=>b.upd-a.upd),d=os.find(o=>o.status=="draft");
 modal(`<div class="mh">加入哪个订单？</div><div class="mt">搜索「${esc(q)}」，结果加到选中的订单和种类。</div><div class="ab" style="margin-top:6px">${os.slice(0,8).map(o=>[`<button class="${o===d?"":"g"}" onclick="homeAskGo('${o.id}',-1)">${esc(o.sup||"未命名订单")} · ✨ 自动分类 <small>${esc(o.dt)}</small></button>`].concat(o.cats.map((c,ci)=>`<button class="g" onclick="homeAskGo('${o.id}',${ci})">${esc(o.sup||"未命名订单")} · ${esc(c.name||"未命名")} <small>${esc(o.dt)}</small></button>`)).join("")).join("")}<button class="g" onclick="homeAskGo('',-1)">＋ 新建订单</button><button class="g" onclick="closeModal()">取消</button></div>`)}
function homeAskGo(id,ci){const q=HQ.trim();closeModal();if(!id){const o=blank();S.orders.push(o);save();id=o.id}HQ="";$("hq").value="";open_(id);setTimeout(()=>aiAsk(ci,q),120)}
function openHit(i){const h=HR[i];if(!h)return;PQ=h.it.n;open_(h.o.id)}
function cycleSt(id){const o=S.orders.find(x=>x.id==id);if(!o)return;const k=Object.keys(STAT);o.status=k[(k.indexOf(o.status)+1)%k.length];o.upd=Date.now();save();renderHome()}
function newOrder(){FX("add");const o=blank();S.orders.push(o);save();open_(o.id);setTimeout(()=>$("eSup").focus(),50)}
function dup(id){FX("add");const s=S.orders.find(o=>o.id==id);if(!s)return;const o=JSON.parse(JSON.stringify(s));o.id=uid();o.sup=s.sup||"未命名订单";o.dt=today();o.status="draft";o.upd=Date.now();S.orders.push(o);save();open_(o.id);toast("已按上次预填，改数量即可")}
function delOrder(id){FX("warn");const i=S.orders.findIndex(o=>o.id==id);if(i<0)return;bkSnap("pre-delete");const o=S.orders[i];S.orders.splice(i,1);S.del[id]=Date.now();save();renderHome();
 toast("已删除："+(o.sup||"未命名订单"),()=>{delete S.del[id];o.upd=Date.now();S.orders.splice(i,0,o);save();renderHome()})}
function exportAll(){try{localStorage.setItem("pedidos_lastexp",String(Date.now()))}catch(e){}dlBlob(new Blob([JSON.stringify(S,null,1)],{type:"application/json"}),"pedidos_backup_"+today().replace(/\//g,"-")+".json")}
function importAll(inp){const f=inp.files[0];if(!f)return;bkSnap("pre-import");f.text().then(t=>{const j=fix(JSON.parse(t));if(!j||!j.orders.length)throw 0;const have=new Set(S.orders.map(o=>o.id));let n=0;j.orders.forEach(o=>{if(have.has(o.id))o.id=uid();S.orders.push(o);n++});(j.vocab||[]).forEach(addVocab);save();renderHome();toast("已导入 "+n+" 个订单")}).catch(()=>toast("⚠ 备份文件无法识别")).finally(()=>inp.value="")}
function nativeSave(name,b64){try{window.webkit.messageHandlers.native.postMessage({type:"save",name:name,b64:b64})}catch(e){toast("⚠ 无法保存文件")}}
function dlBlob(b,name){if(NATIVE){const r=new FileReader();r.onload=()=>nativeSave(name,String(r.result).split(",")[1]||"");r.readAsDataURL(b);return}const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove()}
function vocabModal(){
 modal(`<div class="mh">品名库（${S.vocab.length}）</div><div class="mt">所有订单里用过的品名会自动记下来，用于输入提示和拼写纠正。删掉某个名字只影响提示，不会改已有订单。</div><input class="sq" style="border:1px solid #e3d8c8;margin:0 0 8px" placeholder="搜索" oninput="vocabList(this.value)"><div id="vl"></div>`);vocabList("")}
function vocabList(q){const k=norm(q);const l=[...S.vocab].sort((a,b)=>norm(a).localeCompare(norm(b))).filter(v=>!k||norm(v).includes(k));
 $("vl").innerHTML=l.map(v=>`<div class="vr"><span>${esc(v)}</span><button onclick="vocabDel(${S.vocab.indexOf(v)})">删除</button></div>`).join("")||`<div class="hint" style="padding:12px;text-align:center;color:#bbb">没有匹配</div>`}
function vocabDel(i){S.vocab.splice(i,1);save();vocabModal()}

/* ================= 编辑页 ================= */
// 输入时实时转换，并保持光标位置
function liveCase(el,mode){
 const a=el.selectionStart,b=el.selectionEnd,v=el.value;
 let nv;
 if(mode=="upper")nv=v.toLocaleUpperCase();
 else nv=v.replace(/^(\s*)(\S)/,(m,sp,ch)=>sp+ch.toLocaleUpperCase()); // 首字母大写，其余保持原样
 if(nv!==v){el.value=nv;try{el.setSelectionRange(a,b)}catch(e){}}
 return el.value}
function sorted(o,c){const idx=c.items.map((_,i)=>i);
 if(o.sort=="az")idx.sort((a,b)=>norm(c.items[a].n).localeCompare(norm(c.items[b].n)));
 else if(o.sort=="qty")idx.sort((a,b)=>c.items[b].q-c.items[a].q||a-b);
 else if(o.sort=="new")idx.reverse();
 return idx}
function dupMap(c){const m={};c.items.forEach(it=>{const k=norm(it.n);if(k)m[k]=(m[k]||0)+1});return m}
function setIn(id,v){const e=$(id);if(document.activeElement!==e)e.value=v}
function setf(k,v){mut(o=>{o[k]=v},"f:"+k,true)}
function setSt(k){mut(o=>{o.status=k})}
function togglePrice(){mut(o=>{o.price=!o.price})}
function renderEdit(){
 const o=cur();if(!o){goHome();return}
 if(QC>=o.cats.length||(QC<0&&!QAUTO)){const m=QCMAP[o.id];QC=m===undefined?(o.cats.length?0:-1):Math.min(m,o.cats.length-1)}QAUTO=false;
 if(JUMP){JUMP=false;const k=norm(Q);if(k){const j=o.cats.findIndex(c=>c.items.some(i=>norm(i.n)==k));if(j>=0)QC=j}}
 if(!o.cats.length)QC=-1;QCMAP[o.id]=QC;
 $("qc").innerHTML=o.cats.length?`<button class="${QC<0?'on':''}" onclick="QAUTO=true;setQC(-1)">✨ 自动分类</button>`+o.cats.map((c,i)=>`<button class="${QC==i?'on':''}" style="--c:${c.color}" onclick="setQC(${i})">${esc(c.name||"未命名")}</button>`).join(""):"";
 $("q").placeholder=QC<0?"搜索品名来订货（自动分类）":"搜索品名来订货（加入 "+(o.cats[QC].name||"该类")+"）";
 const nq=norm(Q);let h="",anyMatch=false,exact=false;
 o.cats.forEach((c,ci)=>{
  if(QC>=0&&ci!=QC)return;
  c.items.forEach(it=>{if(nq&&norm(it.n)==nq)exact=true});
  const dm=dupMap(c);
  const idx=sorted(o,c).filter(i=>nq?norm(c.items[i].n).includes(nq):(c.items[i].q>0||JUST0.has(o.id+":"+ci+":"+i)));
  if(nq&&!idx.length)return;anyMatch=true;
  const hidden=c.items.filter(x=>x.q==0).length;
  const sum=c.items.reduce((a,b)=>a+b.q,0),am=amtC(c);
  const cards=idx.map(i=>{const it=c.items[i],isDup=dm[norm(it.n)]>1;
   return `<div class="ic ${it.q?'':'zero'} ${isDup?'dup':''}"><button class="dl" title="删除" onclick="delItem(${ci},${i})">×</button><div class="nmr">${picBtn(ci,i,it.n)}<textarea class="nm" placeholder="商品名（可空）" rows="2" autocapitalize="sentences" oninput="liveCase(this,'first')" onfocus="this.select()" onkeydown="if(event.key=='Enter'){event.preventDefault();this.blur()}" onchange="rename(${ci},${i},this.value)">${esc(it.n)}</textarea></div>${isDup?`<div class="dupb">⚠ 与本类别另一项重名</div>`:""}<button class="ub ${it.u?'on':''}" title="更换单位" onclick="unitPick(${ci},${i})">单位：${esc(unitOf(o,it)||"件")} ▾</button><div class="ctr"><button class="m" onclick="adj(${ci},${i},-1)">−</button><input type="number" inputmode="numeric" value="${it.q}" onfocus="this.select()" onchange="setq(${ci},${i},this.value)"><button onclick="adj(${ci},${i},1)">+</button></div>${o.price?`<div class="pr">${esc(o.cur)}<input type="number" inputmode="decimal" step="any" placeholder="单价" value="${it.p==null?'':it.p}" onchange="setp(${ci},${i},this.value)"><em>${it.p?esc(o.cur)+fmt(it.q*it.p):''}</em></div>`:""}</div>`}).join("")||(nq?"":`<div class="empty2"><div class="ei">🔍</div><b>${c.items.length?"还没有订货的品项":"这个种类还没有品项"}</b><small>点上方搜索框，输入品名开始订货${hidden?"（已收录 "+hidden+" 项）":""}<br>搜不到的新品名，可直接“＋ 新增”</small></div>`);
  const d=draft[ci]||{n:"",q:3};
  h+=`<section style="--c:${c.color}"><div class="sh"><button class="dot" title="换颜色" onclick="recolor(${ci})"></button><input class="cn" placeholder="种类名（可留空）" value="${esc(c.name)}" autocapitalize="characters" oninput="liveCase(this,'upper');catLive(${ci},'name',this.value)" onchange="cat(${ci},'name',this.value)" onblur="cat(${ci},'name',this.value)">${c.items.length?`<button class="x" onclick="arm(this,()=>clearCatItems(${ci}),'清空?')">清空</button>`:""}<button class="x" onclick="${c.items.length?`arm(this,()=>delCat(${ci}),'删?')`:`delCat(${ci})`}">删</button></div><span class="cnt">${c.items.filter(x=>x.q>0).length}/${c.items.length}项 · ${totTxt({...o,cats:[c]},"zh")}${o.price&&am?" · "+esc(o.cur)+fmt(am):""}</span><input class="cs" value="${esc(c.sub)}" placeholder="种类说明（可选）" oninput="catLive(${ci},'sub',this.value)" onchange="cat(${ci},'sub',this.value)" onblur="cat(${ci},'sub',this.value)"><div class="items">${cards}</div>
  </section>`;
 });
 $("cbox").innerHTML=(nq||SF)?candPanel(o,QC,nq,exact):"";if(!o.cats.length)h=`<div class="card"><div class="hint">这个订单还没有种类。可以直接在上方搜索加商品，会按商品源的分类自动建种类（如 AROMA、MARLBORO）；也可以在下方新增种类。</div></div>`+h;
 $("list").innerHTML=h;
 {const hq=o.cats.some(c=>c.items.some(i=>i.q>0));$("clrBtn").style.display=hq?"":"none"}
 $("eTotal").textContent="共 "+totTxt(o,"zh")+(o.price&&amtO(o)?"":"")+(o.price&&amtO(o)?" · "+o.cur+fmt(amtO(o)):"");
 $("eUnit").textContent="📏 单位："+(o.unit||"件");setIn("eSup",o.sup);setIn("eDt",o.dt);setIn("eCur",o.cur);$("eSort").value=o.sort;
 $("ePr").className=o.price?"on":"";
 segRender("eSt",Object.entries(STAT).map(([k,v])=>`<button class="${o.status==k?'on':''}" style="--c:${v[1]}" onclick="setSt('${k}')">${v[0]}</button>`).join(""),o.id);
 syncUndo();
}

/* ================= 搜索订货：品名库 + Saphirus 源 合并去重，常用优先，拼写容错 ================= */
let QCMAP={},JUMP=false,CAND=[],SF=false;
const NOCAT={name:"",sub:"",color:"#999",items:[]};
function catAt(o,ci){return o&&ci>=0&&o.cats[ci]?o.cats[ci]:NOCAT}
function srcCatOf(n){const k=skey(n||"");if(!k)return"";for(const x of SRCS.list){const d=srcData(x.id);if(!d)continue;for(const [c,l] of Object.entries(d.cats))if(l.some(it=>skey(it[0])==k))return c}return""}
/* 在 mut 内调用：ci 有效就用它；否则按品名所属商品源分类找/建种类 */
function ensureCat(o,ci,n){if(ci>=0&&o.cats[ci])return o.cats[ci];const key=srcCatOf(n)||"GENERAL";
 let i=o.cats.findIndex(c=>norm(c.name)==norm(key));if(i<0&&OFF_TARGET[key])i=offTargetIdx(o,key);if(i>=0)return o.cats[i];
 const c={name:key,sub:{AROMA:"Aromatizante",TEXTIL:"Perfume para telas",DIFUSORES:"Difusores"}[key]||"",color:pickColor(o),items:[]};o.cats.push(c);return c}
function refreshCand(){const o=cur();if(!o||!$("cbox"))return;const nq=norm(Q),c=catAt(o,QC);let exact=false;c.items.forEach(it=>{if(nq&&norm(it.n)==nq)exact=true});
 $("cbox").innerHTML=(nq||SF)?candPanel(o,QC,nq,exact):""}
const skey=s=>norm(s).replace(/\s*&\s*/g," y ").replace(/\s+/g," ").trim();
function bumpUse(n){const k=skey(n);if(!k)return;S.uses=S.uses||{};const u=S.uses[k]||(S.uses[k]=[0,0]);u[0]++;u[1]=Date.now()}
function useScore(n){const u=(S.uses||{})[skey(n)];if(!u)return 0;const d=(Date.now()-u[1])/864e5;return u[0]+Math.max(0,3-d/10)}
function catKeyFor(c){const nn=norm(c.name||""),ns=norm(c.sub||"");for(const k in OFF_TARGET){if(OFF_TARGET[k].some(x=>nn.includes(x)||ns.includes(x)))return k}return (c.name||"").toUpperCase()}
function matchScore(name,q){const n=skey(name);if(!q)return 1;if(n==q)return 100;if(n.startsWith(q))return 85;const ws=n.split(" ");if(ws.some(w=>w.startsWith(q)))return 75;if(n.includes(q))return 65;
 const ts=q.split(" ").filter(t=>t&&t!="y");if(ts.length>1&&ts.every(t=>n.split(" ").some(w=>w.startsWith(t))))return 60;if(ts.length>1&&ts.every(t=>n.includes(t)))return 55;
 if(q.length>=4){const m=q.length>=7?2:1;if(lev(q,n)<=m||ws.some(w=>lev(q,w)<=m))return 25}
 return 0}
function candidates(o,ci,nq){
 const q=skey(nq),c=catAt(o,ci),key=catKeyFor(c),have=new Map();c.items.forEach(i=>have.set(skey(i.n),i));
 const M=new Map();
 const add=(n,src,price,hasCat)=>{const k=skey(n);if(!k)return;let e=M.get(k);if(!e){e={n,src:0,price:null,hasCat:false};M.set(k,e)}
  if(src==1){e.src|=1;if(!(e.src&2))e.n=n}else{e.src|=2;e.n=n}
  if(price!=null&&hasCat){e.price=price;e.hasCat=true}else if(src==2&&hasCat===false&&!e.hasCat){}};
 if(srcOn("manual"))S.vocab.forEach(v=>add(v,1));
 SRCS.list.forEach(s=>{if(!srcOn(s.id))return;const d=srcData(s.id);if(!d)return;Object.entries(d.cats).forEach(([k,l])=>l.forEach(it=>add(it[0],2,it[1]||null,k==key)))});
 const out=[];M.forEach((e,k)=>{const ex=have.get(k);if(ex&&ex.q>0)return;const sc=matchScore(e.n,q);if(!sc)return;
  out.push(Object.assign(e,{ex:!!ex,score:sc+(q?0:0)+Math.min(useScore(e.n),20)*(q?.6:3)+(e.hasCat?6:0)}))});
 out.sort((a,b)=>b.score-a.score||a.n.localeCompare(b.n));
 return out.slice(0,q?18:12)}
function hl(n,nq){const q=norm(nq);if(!q)return esc(n);const i=norm(n).indexOf(q);if(i<0||norm(n).length!=n.length)return esc(n);return esc(n.slice(0,i))+"<mark>"+esc(n.slice(i,i+q.length))+"</mark>"+esc(n.slice(i+q.length))}
function candPanel(o,ci,nq,exact){
 CAND=candidates(o,ci,Q);const c=catAt(o,ci),cn=ci<0?"（自动分类）":(c.name||"未命名");
 let h="";
 if(nq&&!exact&&!CAND.some(x=>skey(x.n)==skey(Q)))h+=`<button class="cnew" onclick="quick(${ci})">＋ 新增 “${esc(Q.trim())}” 到 ${esc(cn)}</button>`;
 h+=CAND.map((x,i)=>`<button class="cb" style="--c:${c.color}" onclick="candAdd(${i})"><b>${hl(x.n,Q)}</b><small>${x.ex?"本单·数量0":(x.src&2?(srcNameOf(x.n)||"商品源"):"品名库")}${x.price&&o.price?" · "+esc(o.cur)+fmt(x.price):""}</small></button>`).join("");
 if(nq)h+=`<button class="cnew" style="background:#7a5cc7" onclick="qBlur();const t=Q;Q='';$('q').value='';aiAsk(${ci},t,${CAND.length?1:0})">🔎 ${CAND.length?"跳过本地，联网 / AI 搜索":"本地没有 · 联网 / AI 搜索"}“${esc(Q.trim())}”</button>`;
 if(!h)return nq?`<div class="cand"><div class="ct">搜索范围</div>${ssrcChips()}<div class="ct">没有匹配的品名</div></div>`:"";
 return `<div class="cand ${nq?"":"row"}">${nq?`<div class="ct">搜索范围</div>`+ssrcChips():""}<div class="ct">${nq?"点一下加入 "+esc(ci<0?cn:(c.name||""))+"（数量 1）":"常用 · 点一下加入 "+esc(ci<0?cn:(c.name||""))+" →"}</div><div class="cw">${h}</div></div>`}
function qBlur(){SF=false;const q=$("q");if(q&&document.activeElement===q)q.blur()}
function candAdd(i){const x=CAND[i],o=cur();if(!x||!o)return;qBlur();const ci=QC,k=skey(x.n);
 mut(o=>{const c=ensureCat(o,ci,x.n),ex=c.items.find(it=>skey(it.n)==k);
  if(ex){ex.q=Math.max(1,ex.q+1)}else c.items.push({n:x.n,q:1,p:o.price&&x.price&&x.hasCat?x.price:null})});
 FX("add");addVocab(x.n);bumpUse(x.n);save();Q="";$("q").value="";JUST0.clear();renderEdit();toast("已加入："+x.n)}
let SSRC=(()=>{try{return localStorage.getItem("pedidos_ssrc")||""}catch(e){return""}})();
function srcOn(id){return !SSRC||SSRC===id}
function setSSRC(v){SSRC=v;try{localStorage.setItem("pedidos_ssrc",v)}catch(e){}renderEdit();const q=$("q");if(q)q.focus()}
function ssrcChips(){const L=[["","全部"],...SRCS.list.map(x=>[x.id,x.name]),["manual","手动"]];if(SSRC&&!L.some(x=>x[0]===SSRC))SSRC="";
 return `<div class="qc" style="margin:0 0 6px">${L.map(([v,t])=>`<button class="${SSRC===v?"on":""}" onclick="setSSRC('${v}')">${esc(t)}</button>`).join("")}</div>`}
function onSearch(v){if(!v.trim())JUST0.clear();Q=v;renderEdit()}
function setQC(i){JUST0.clear();QC=i;renderEdit()}
const dr=ci=>draft[ci]||(draft[ci]={n:"",q:3});
const JUST0=new Set();
function unitPick(ci,i){const o=cur();if(!o)return;const it=ci>=0?o.cats[ci].items[i]:null,now=it?(it.u||""):(o.unit||"");
 const chips=(it?[["","跟随订单（"+(o.unit||"件")+"）"]]:[["","默认（件）"]]).concat(UNITS.map(u=>[u,u])).map(([v,t])=>`<button class="${v===now?"on":""}" onclick="unitSet(${ci},${i===undefined?-1:i},${JSON.stringify(v).replace(/"/g,"&quot;")})">${esc(t)}</button>`).join("");
 const ex=!it&&o.cats.some(c=>c.items.some(x=>x.u));
 modal(`<div class="mh">${it?"更换这个商品的单位":"订单默认单位"}</div><div class="mt">${it?esc(it.n||"图片商品")+" · 只改这一个商品":"本单没有单独设置的商品，都按这个单位显示。海报、表格、文字清单同步。"}</div>
 <div class="uchips">${chips}</div>
 <div class="opt" style="display:flex;gap:8px"><input id="uCus" maxlength="8" placeholder="自定义单位，如 袋 / caja" style="flex:1;min-width:0;padding:10px;border:1px solid #e3d8c8;border-radius:10px;font-size:16px;font-family:inherit"><button onclick="unitSet(${ci},${i===undefined?-1:i},$('uCus').value.trim())">确定</button></div>
 ${ex?`<div class="opt"><button class="g" onclick="unitClear()">清除所有商品的单独单位（统一跟随订单）</button></div>`:""}
 <div class="mb2"><button class="g" onclick="closeModal()">取消</button></div>`)}
function unitSet(ci,i,v){v=String(v||"").trim().slice(0,8);closeModal();mut(o=>{if(ci>=0)o.cats[ci].items[i].u=v;else o.unit=v})}
function unitClear(){closeModal();mut(o=>o.cats.forEach(c=>c.items.forEach(x=>{x.u=""})));toast("已统一跟随订单单位")}
function adj(ci,i,d){FX("tick");qBlur();const o0=cur();const it0=o0.cats[ci].items[i];if(it0.q>0&&it0.q+d<=0)JUST0.add(o0.id+":"+ci+":"+i);mut(o=>{const it=o.cats[ci].items[i];it.q=Math.max(0,it.q+d)},"q:"+ci+":"+i)}
function setq(ci,i,v){FX("tick");SF=false;const o0=cur();const it0=o0.cats[ci].items[i];const nv=Math.max(0,parseInt(v)||0);if(it0.q>0&&nv==0)JUST0.add(o0.id+":"+ci+":"+i);mut(o=>{o.cats[ci].items[i].q=nv})}
function setp(ci,i,v){mut(o=>{o.cats[ci].items[i].p=v===""?null:Math.max(0,parseFloat(v)||0)})}
function rename(ci,i,v){const nv=fixName(v),c0=cur().cats[ci],it0=c0.items[i];if(!nv&&!it0.n)return;itId(it0);const ok=picKey(it0.n,c0,it0),old=PICS[ok];
 mut(o=>{o.cats[ci].items[i].n=nv});if(old){const nk=picKey(nv,c0,it0);if(!PICS[nk]){PICS[nk]=old;picSave()}}if(nv)addVocab(nv);save();
 if(!nv)return;
 const c=cur().cats[ci];if(c.items.filter(x=>norm(x.n)==norm(nv)).length>1)toast("⚠ 本类别里已有同名品项，请确认是否重复")}
function delItem(ci,i){FX("warn");const n=cur().cats[ci].items[i].n;mut(o=>{o.cats[ci].items.splice(i,1)});toast("已删除："+n,undo)}
function catLive(ci,k,v){mut(o=>{o.cats[ci][k]=k=="name"?v.trim().toUpperCase():v.trim()},"cl:"+ci+k,true)}
function cat(ci,k,v){mut(o=>{o.cats[ci][k]=k=="name"?v.trim().toUpperCase():v.trim()})}
function recolor(ci){mut(o=>{const c=o.cats[ci],used=new Set(o.cats.filter((_,j)=>j!=ci).map(x=>x.color));let k=COLORS.indexOf(c.color),nc=null;for(let n=1;n<=COLORS.length;n++){const x=COLORS[(k+n)%COLORS.length];if(!used.has(x)){nc=x;break}}c.color=nc||extraColor(used)})}
function delCat(ci){FX("warn");const n=cur().cats[ci].name;QC=-1;mut(o=>{o.cats.splice(ci,1)});toast("已删除种类："+n,undo)}
function addCat(){const n=$("ncn").value.trim();FX("add");mut(o=>{o.cats.push({name:n.toUpperCase(),sub:"",color:pickColor(o),items:[]})});closeNC();scrollTo(0,document.body.scrollHeight)}
/* 原生拍照/相册：绕开 WebView 文件选择器（拍照后网页进程被系统杀掉会黑屏） */
let NPCB=null;
function nativePick(cb){NPCB=cb;try{webkit.messageHandlers.native.postMessage({type:"pickImage"})}catch(e){toast("⚠ 无法打开相机")}}
window.__nativeImg=async function(url){const cb=NPCB;NPCB=null;if(!cb||!url)return;try{const b=await (await fetch(url)).blob();cb(new File([b],"photo.jpg",{type:"image/jpeg"}))}catch(e){toast("⚠ 读取照片失败")}};
function addImgMenu(ci){const c=cur().cats[ci];
 modal(`<div class="mh">添加图片商品 · ${esc(c.name||"该类")}</div><div class="mt">不用写名字，只用图片也可以。识别后可以选「直接用这张图」或「从官方图片里选」。</div>
 <div class="ab" style="margin-top:6px">${NATIVE?`<button style="background:var(--c,#c0562f);color:#fff" onclick="closeModal();nativePick(f=>aiPickPhoto(${ci},{files:[f],value:''}))">📷 拍照或选图（自动识别；也可直接用图 / 选官方图）</button>`:`<label class="ab-l" style="background:var(--c,#c0562f);color:#fff"><span>📷 拍照或选图（自动识别；也可直接用图 / 选官方图）</span><input type="file" accept="image/*" style="display:none" onchange="closeModal();aiPickPhoto(${ci},this)"></label>`}
 <button style="background:var(--c,#c0562f);color:#fff" onclick="aiAskUI(${ci})">🔎 文字搜索（先查本地，没有再联网 / AI）</button>
 <button class="g" onclick="closeModal()">取消</button></div>`)}
function addBlank(ci){FX("add");const id=uid();mut(o=>{o.cats[ci].items.push({id,n:"",q:1,p:null})});const n=cur().cats[ci].items.length-1;setTimeout(()=>picModal(ci,n),60)}
function clearCatItems(ci){FX("warn");bkSnap("pre-clearcat");const c=cur().cats[ci],n=c.items.length,nm=c.name||"该种类";mut(o=>{o.cats[ci].items=[]});toast("已清空 "+nm+" 的 "+n+" 个商品（种类保留）",undo)}
function clearQty(){FX("warn");bkSnap("pre-clear");mut(o=>o.cats.forEach(c=>c.items.forEach(i=>i.q=0)));toast("所有数量已清零",undo)}

/* 添加: 重名提醒 + 近似拼写提醒 */
function addItem(ci,force){
 const d=dr(ci);let n=fixName(d.n);if(!n)return;
 const o=cur(),c=o.cats[ci],q=Math.max(0,parseInt(d.q)||1);
 const ex=c.items.findIndex(x=>norm(x.n)==norm(n));
 if(ex>=0&&force!="new"){
  ask(`<b>${esc(c.name)}</b> 里已经有 <b>${esc(c.items[ex].n)}</b>（当前 ${c.items[ex].q}）。`,[["add","数量合并：+"+q],["new","仍然新增一行",1],["x","取消",1]],a=>{
   if(a=="add"){mut(o=>{o.cats[ci].items[ex].q+=q});draft[ci]={n:"",q:d.q};renderEdit()}
   else if(a=="new")addItem(ci,"new")});return}
 if(!force&&!vocabFind(n)){const sg=fuzzy(n,2);if(sg.length){
  ask(`“<b>${esc(n)}</b>” 和已有品名很像，是不是想写：`,[...sg.map(s=>["use:"+s,esc(s)]),["keep","就用 “"+esc(n)+"”",1],["x","取消",1]],a=>{
   if(a.startsWith("use:")){d.n=a.slice(4);addItem(ci,"ok")}else if(a=="keep")addItem(ci,"ok")});return}}
 mut(o=>{o.cats[ci].items.push({n,q,p:null})});addVocab(n);bumpUse(n);draft[ci]={n:"",q:d.q};save();renderEdit();
}
function quick(ci){qBlur();const n=fixName(Q);if(!n)return;if(!(ci>=0&&cur().cats[ci])){let idx=-1;mut(o=>{const c=ensureCat(o,-1,n);idx=o.cats.indexOf(c)});ci=idx}dr(ci).n=n;dr(ci).q=1;Q="";$("q").value="";addItem(ci)}
function sug(ci){const v=dr(ci).n,k=norm(v),box=$("sg"+ci);if(!box)return;
 if(!k){box.innerHTML="";return}
 const c=cur().cats[ci],have=new Set(c.items.map(i=>norm(i.n)));
 SG[ci]=vocAll().filter(x=>{const kx=norm(x);return kx.includes(k)&&kx!=k&&!have.has(kx)}).sort((a,b)=>(norm(a).startsWith(k)?0:1)-(norm(b).startsWith(k)?0:1)||a.length-b.length).slice(0,6);
 box.innerHTML=SG[ci].map((x,i)=>`<button onmousedown="event.preventDefault()" onclick="pickSug(${ci},${i})">${esc(x)}</button>`).join("")}
function pickSug(ci,i){dr(ci).n=SG[ci][i];$("an"+ci).value=SG[ci][i];sug(ci);addItem(ci)}

/* ================= 批量导入 ================= */
function parseText(txt,defCat){
 const lines=String(txt).replace(/\r/g,"").split("\n"),cats=[];let cc=null;
 const getCat=n=>{let c=cats.find(x=>norm(x.name)==norm(n));if(!c){c={name:n,items:[]};cats.push(c)}return c};
 for(let li=0;li<lines.length;li++){const raw=lines[li];
  let s=raw.replace(/[\u200b\u00a0]/g," ").replace(/[：]/g,":").replace(/[，、;；]/g,",").replace(/[×✕✖]/g,"x").trim();
  s=s.replace(/^[\s\-*•·●▪\u2022\d]+[.)、]\s+(?=\D)/,"").replace(/^[-*•·●▪]\s*/,"");
  if(!s)continue;
  if(/^(saphirus.*|.*订货单|.*pedido.*|total.*|合计.*)$/i.test(s)&&!/\d\s*$/.test(s))continue;
  let m=s.match(/^(.*?)[\s:=,\-.xX]*[\s(（]*(\d{1,4})\s*(?:件|个|pcs|un\.?|u\.?|unidades|uds?\.?)?[)）]?\s*$/i);
  if(m&&m[1].trim()&&/\D/.test(m[1])){const n=m[1].trim().replace(/[\s:=,\-.xX]+$/,"");if(n){(cc||getCat(defCat||"GENERAL")).items.push({n:fixName(n),q:parseInt(m[2])});continue}}
  m=s.match(/^(\d{1,4})\s*(?:x|件|个|pcs|un\.?)?\s+(.+?)$/i);
  if(m&&/\D/.test(m[2])){(cc||getCat(defCat||"GENERAL")).items.push({n:fixName(m[2].trim()),q:parseInt(m[1])});continue}
  const h=s.replace(/[:：]\s*$/,"").trim();
  if(h.length<=40&&!/\d/.test(h)){
   // 只有当后面紧跟带数量的行时才算种类标题；否则当成一个没写数量的品项，避免静默丢失
   let nx="";for(let j=li+1;j<lines.length;j++){if(lines[j].trim()){nx=lines[j];break}}
   const nxItem=/\d{1,4}\s*(件|个|pcs|un\.?|u\.?|unidades|uds?\.?)?[)）]?\s*$/i.test(nx)||/^\s*\d{1,4}\s*(x|件|个)?\s+\D/i.test(nx);
   if(nxItem||/[:：]\s*$/.test(s)){cc=getCat(h.toUpperCase());continue}}
  (cc||getCat(defCat||"GENERAL")).items.push({n:fixName(s),q:1,guess:1});
 }
 return cats.filter(c=>c.items.length)}
function importModal(){
 const o=cur();MI={step:0,cats:[],mode:"merge"};
 modal(`<div class="mh">批量导入</div><div class="mt">粘贴文字清单。<b>单独一行、不带数字的名字</b>会被当作种类（如 AROMA），“品名 数量” 会被当作品项。支持 <code>Breeze 6</code>、<code>Breeze x6</code>、<code>6 Breeze</code>、<code>Breeze: 6</code>、<code>Breeze - 6</code>。</div><textarea id="it" placeholder="AROMA&#10;BREEZE  6&#10;VELOCITY  6&#10;&#10;TEXTIL&#10;ROCIO  6"></textarea><div class="mb2"><button class="g" onclick="closeModal()">取消</button><button onclick="importParse()">识别</button></div>`);
 setTimeout(()=>$("it")&&$("it").focus(),50)}
function importParse(){
 const t=$("it").value;if(!t.trim()){toast("先粘贴内容");return}
 const o=cur(),def=o.cats.length==1?o.cats[0].name:"GENERAL";
 const cats=parseText(t,def);if(!cats.length){toast("没有识别到品项，请检查格式");return}
 const flag=[];
 cats.forEach(c=>{const ex=o.cats.find(x=>norm(x.name)==norm(c.name));c.target=ex?o.cats.indexOf(ex):-1;
  c.items.forEach(it=>{const ei=ex?ex.items.findIndex(x=>norm(x.n)==norm(it.n)):-1;it.ex=ei;
   const kn=vocabFind(it.n);it.sug=(!kn&&!ei>=0)?fuzzy(it.n,1)[0]||"":""})});
 MI={step:1,cats,mode:"merge",text:t};importReview()}
function importReview(){
 const o=cur(),n=MI.cats.reduce((a,c)=>a+c.items.length,0),qs=MI.cats.reduce((a,c)=>a+c.items.reduce((s,i)=>s+i.q,0),0);
 modal(`<div class="mh">确认导入：${n} 项 · ${qs} 件</div><div class="mt">可以直接改名称和数量、删除不要的行。黄色表示已有同名品项（${MI.mode=="merge"?"数量会累加":MI.mode=="replace"?"数量会被替换":"会新增一行"}）；“q=1” 表示这行没写数量，默认 1。</div>
 <div class="opt">已有同名时：<select onchange="MI.mode=this.value;importReview()"><option value="merge" ${MI.mode=="merge"?"selected":""}>数量累加</option><option value="replace" ${MI.mode=="replace"?"selected":""}>替换数量</option><option value="new" ${MI.mode=="new"?"selected":""}>新增一行</option></select></div>`+
 MI.cats.map((c,ci)=>`<div class="ig"><div class="igh"><span>${esc(c.name)}</span>→<select onchange="MI.cats[${ci}].target=parseInt(this.value);importReview()"><option value="-1" ${c.target<0?"selected":""}>新建种类“${esc(c.name)}”</option>${o.cats.map((x,i)=>`<option value="${i}" ${c.target==i?"selected":""}>并入 ${esc(x.name)}</option>`).join("")}</select></div>`+
 c.items.map((it,ii)=>{const tgt=c.target>=0?o.cats[c.target]:null,e=tgt?tgt.items.findIndex(x=>norm(x.n)==norm(it.n)):-1,dupIn=c.items.some((x,j)=>j<ii&&norm(x.n)==norm(it.n));
  return `<div class="ir ${e>=0||dupIn?"dup":""}"><input class="irn" value="${esc(it.n)}" onchange="MI.cats[${ci}].items[${ii}].n=fixName(this.value);importReview()"><input class="irq" type="number" value="${it.q}" onchange="MI.cats[${ci}].items[${ii}].q=Math.max(0,parseInt(this.value)||0);importReview()">${it.guess?'<span class="tag">q=1</span>':""}${e>=0?'<span class="tag">已有</span>':dupIn?'<span class="tag">重复</span>':""}${it.sug&&!e>=0?`<button style="width:auto;padding:0 8px;color:#3a2e2a;font-size:12px" onclick="MI.cats[${ci}].items[${ii}].n='${esc(it.sug).replace(/'/g,"&#39;")}';importReview()" title="用已有品名">→${esc(it.sug)}</button>`:""}<button onclick="MI.cats[${ci}].items.splice(${ii},1);importReview()">×</button></div>`}).join("")+`</div>`).join("")+
 `<div class="mb2"><button class="g" onclick="importModal()">‹ 重新粘贴</button><button onclick="importApply()">导入 ${n} 项</button></div>`)}
function importApply(){
 const mode=MI.mode,cats=MI.cats;let add=0,mer=0,nc=0;
 mut(o=>{cats.forEach(c=>{let t;if(c.target>=0&&o.cats[c.target])t=o.cats[c.target];else{t=o.cats.find(x=>norm(x.name)==norm(c.name));if(!t){t={name:c.name,sub:"",color:pickColor(o),items:[]};o.cats.push(t);nc++}}
  c.items.forEach(it=>{if(!it.n)return;const e=t.items.find(x=>norm(x.n)==norm(it.n));
   if(e&&mode=="merge"){e.q+=it.q;mer++}else if(e&&mode=="replace"){e.q=it.q;mer++}else{t.items.push({n:it.n,q:it.q,p:null});add++}})})});
 cats.forEach(c=>c.items.forEach(i=>addVocab(i.n)));save();closeModal();
 toast(`已导入：新增 ${add} 项${mer?"，合并 "+mer+" 项":""}${nc?"，新建 "+nc+" 个种类":""}`,undo)}


/* ================= 发送表格 (Excel .xlsx，纯前端生成) ================= */
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC_T[(c^b[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function zipStore(files){ // 无压缩 zip，足够 xlsx 使用
 const enc=new TextEncoder(),parts=[],cd=[];let off=0;
 const d=new Date(),dt=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(),tm=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
 files.forEach(f=>{
  const nm=enc.encode(f.name),data=f.data instanceof Uint8Array?f.data:enc.encode(f.data),crc=crc32(data);
  const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint16(10,tm,true);lh.setUint16(12,dt,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,nm.length,true);lh.setUint16(28,0,true);
  parts.push(new Uint8Array(lh.buffer),nm,data);
  const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,tm,true);ch.setUint16(14,dt,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
  cd.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+data.length});
 const cdLen=cd.reduce((a,b)=>a+b.length,0),eo=new DataView(new ArrayBuffer(22));
 eo.setUint32(0,0x06054b50,true);eo.setUint16(8,files.length,true);eo.setUint16(10,files.length,true);eo.setUint32(12,cdLen,true);eo.setUint32(16,off,true);
 return new Blob([...parts,...cd,new Uint8Array(eo.buffer)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})}
const xe=s=>String(s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const shd=(hex,k)=>{const n=parseInt(hex.slice(1),16),m=v=>Math.round(v*k).toString(16).padStart(2,"0");return(m(n>>16&255)+m(n>>8&255)+m(n&255)).toUpperCase()};
const tint=(hex,k)=>{const n=parseInt(hex.slice(1),16),m=v=>Math.round(v+(255-v)*k).toString(16).padStart(2,"0");return(m(n>>16&255)+m(n>>8&255)+m(n&255)).toUpperCase()};
const XL={es:{cat:"Categoría",it:"Producto",q:"Cantidad",u:"Unidad",p:"Precio",a:"Importe",t:"TOTAL",sheet:"Pedido",img:"Imagen"},zh:{cat:"类别",it:"品名",q:"数量",u:"单位",p:"单价",a:"小计",t:"合计",sheet:"订货单",img:"图片"}};
function buildXlsx(o,IMG){IMG=IMG||new Map();
 const X=XL[o.lang||"es"],price=!!o.price,ncol=price?5:3,col="ABCDEFG",DKM=!!o.dk,rowC=c=>DKM?shd(c,.3):tint(c,.86);
 const cats=o.cats.map(c=>({c,items:sorted(o,c).map(i=>c.items[i]).filter(i=>i.q>0)})).filter(x=>x.items.length);
 // 样式表：每个种类一个浅色底
 const fills=['<fill><patternFill patternType="none"/></fill>','<fill><patternFill patternType="gray125"/></fill>','<fill><patternFill patternType="solid"><fgColor rgb="FF3A2E2A"/><bgColor indexed="64"/></patternFill></fill>','<fill><patternFill patternType="solid"><fgColor rgb="FFF0C987"/><bgColor indexed="64"/></patternFill></fill>'];
 const xfs=['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>', // 0 普通
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>', // 1 表头
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>', // 2 品名
  '<xf numFmtId="1" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>', // 3 数量
  '<xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>', // 4 金额
  '<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>', // 5 合计行文字
  '<xf numFmtId="1" fontId="2" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>', // 6 合计数量
  '<xf numFmtId="4" fontId="2" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"/>']; // 7 合计金额
 const catStyle={};
 const itStyle={},qtStyle={},amStyle={};
 cats.forEach(({c},i)=>{fills.push(`<fill><patternFill patternType="solid"><fgColor rgb="FF${rowC(c.color)}"/><bgColor indexed="64"/></patternFill></fill>`);const fid=fills.length-1;
  xfs.push(`<xf numFmtId="0" fontId="${DKM?4:2}" fillId="${fid}" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>`);catStyle[i]=xfs.length-1;
  xfs.push(`<xf numFmtId="0" fontId="${DKM?3:0}" fillId="${fid}" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>`);itStyle[i]=xfs.length-1;
  xfs.push(`<xf numFmtId="1" fontId="${DKM?3:0}" fillId="${fid}" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf>`);qtStyle[i]=xfs.length-1;
  xfs.push(`<xf numFmtId="4" fontId="${DKM?3:0}" fillId="${fid}" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>`);amStyle[i]=xfs.length-1});
 const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="5"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><sz val="11"/><color rgb="FFF1E8DE"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFF1E8DE"/><name val="Calibri"/></font></fonts><fills count="${fills.length}">${fills.join("")}</fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFD9D2C5"/></left><right style="thin"><color rgb="FFD9D2C5"/></right><top style="thin"><color rgb="FFD9D2C5"/></top><bottom style="thin"><color rgb="FFD9D2C5"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join("")}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
 // 数据行
 const T=(r,c,v,st)=>`<c r="${col[c]}${r}" s="${st}" t="inlineStr"><is><t xml:space="preserve">${xe(v)}</t></is></c>`;
 const N=(r,c,v,st)=>`<c r="${col[c]}${r}" s="${st}"><v>${v}</v></c>`;
 const F=(r,c,f,v,st)=>`<c r="${col[c]}${r}" s="${st}"><f>${f}</f><v>${v}</v></c>`;
 const E=(r,c,st)=>`<c r="${col[c]}${r}" s="${st}"/>`;
 const hasImg=IMG.size>0,hasU=cats.some(x=>x.items.some(it=>unitOf(o,it))),iN=hasImg?2:1,iQ=iN+1,iU=iQ+1,iP=iQ+(hasU?2:1),iA=iP+1,qL=col[iQ],hdr=[X.cat].concat(hasImg?[X.img]:[]).concat([X.it,X.q]).concat(hasU?[X.u]:[]).concat(price?[X.p,X.a]:[]);
 const rows=[`<row r="1" ht="24" customHeight="1">${hdr.map((h,i)=>T(1,i,h,1)).join("")}</row>`];
 let r=1,totQ=0,totA=0;const merges=[],pics=[];
 cats.forEach(({c,items},ci)=>{const start=r+1;items.forEach((it,ii)=>{
  r++;totQ+=it.q;let cells=(ii==0?T(r,0,c.name,catStyle[ci]):E(r,0,catStyle[ci]))+(hasImg?E(r,1,itStyle[ci]):"")+T(r,iN,it.n,itStyle[ci])+N(r,iQ,it.q,qtStyle[ci])+(hasU?T(r,iU,unitTr(unitOf(o,it),o.lang||"es",it.q),itStyle[ci]):"");
  if(price){if(it.p){cells+=N(r,iP,it.p,amStyle[ci])+F(r,iA,`${qL}${r}*${col[iP]}${r}`,Math.round(it.q*it.p*100)/100,amStyle[ci]);totA+=it.q*it.p}else cells+=E(r,iP,amStyle[ci])+E(r,iA,amStyle[ci])}
  const im=IMG.get(it);if(im)pics.push({r,im});
  rows.push(`<row r="${r}"${hasImg?' ht="54" customHeight="1"':''}>${cells}</row>`)});if(r>start)merges.push(`A${start}:A${r}`)});
 const last=r,tr=r+1;
 let tc=T(tr,0,X.t,5)+(hasImg?E(tr,1,5):"")+E(tr,iN,5)+F(tr,iQ,`SUM(${qL}2:${qL}${last})`,totQ,6)+(hasU?E(tr,iU,5):"");
 if(price)tc+=E(tr,iP,5)+F(tr,iA,`SUM(${col[iA]}2:${col[iA]}${last})`,Math.round(totA*100)/100,7);
 rows.push(`<row r="${tr}" ht="22" customHeight="1">${tc}</row>`);
 const widths=[Math.min(28,Math.max(12,...cats.map(x=>x.c.name.length*1.3+4))),Math.min(48,Math.max(16,...cats.flatMap(x=>x.items.map(i=>i.n.length*1.25+4)))),12].concat(hasU?[9]:[]).concat(price?[12,14]:[]);if(hasImg)widths.splice(1,0,13);
 const sheet=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0" tabSelected="1"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="16"/><cols>${widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${Math.round(w*10)/10}" customWidth="1"/>`).join("")}</cols><sheetData>${rows.join("")}</sheetData>${merges.length?`<mergeCells count="${merges.length}">${merges.map(m=>`<mergeCell ref="${m}"/>`).join("")}</mergeCells>`:""}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>${hasImg?'<drawing r:id="rId1"/>':""}</worksheet>`;
 const sn=(((o.sup||"").trim()||X.sheet).replace(/[\[\]:*?\/\\]/g," ").trim()||X.sheet).slice(0,31);
 const head='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
 return zipStore([
  {name:"[Content_Types].xml",data:head+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>'},
  {name:"_rels/.rels",data:head+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
  {name:"xl/workbook.xml",data:head+`<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="${xe(sn)}" sheetId="1" r:id="rId1"/></sheets></workbook>`},
  {name:"xl/_rels/workbook.xml.rels",data:head+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
  {name:"xl/styles.xml",data:styles},
  {name:"xl/worksheets/sheet1.xml",data:sheet}].concat(hasImg?xlImgParts(pics,1):[]).map(f=>f))}
function xlImgParts(pics,ncol){const E=9525,fs=[],hd='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';let anc="",rel="";
 pics.forEach((p,i)=>{const n=i+1,sc=Math.min(62/p.im.h,84/p.im.w),cx=Math.round(p.im.w*sc*E),cy=Math.round(p.im.h*sc*E),ox=Math.round((96-p.im.w*sc)/2*E),oy=Math.round((72-p.im.h*sc)/2*E);
  fs.push({name:"xl/media/image"+n+".jpeg",data:p.im.u});
  rel+=`<Relationship Id="rId${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${n}.jpeg"/>`;
  anc+=`<xdr:oneCellAnchor><xdr:from><xdr:col>${ncol}</xdr:col><xdr:colOff>${ox}</xdr:colOff><xdr:row>${p.r-1}</xdr:row><xdr:rowOff>${oy}</xdr:rowOff></xdr:from><xdr:ext cx="${cx}" cy="${cy}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${n+1}" name="img${n}"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId${n}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`});
 fs.push({name:"xl/drawings/drawing1.xml",data:hd+'<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'+anc+'</xdr:wsDr>'});
 fs.push({name:"xl/drawings/_rels/drawing1.xml.rels",data:hd+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+rel+'</Relationships>'});
 fs.push({name:"xl/worksheets/_rels/sheet1.xml.rels",data:hd+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>'});
 return fs}
function sheetName(o){return "pedido_"+((o.sup||"orden").replace(/[^\w\u4e00-\u9fa5-]+/g,"_"))+"_"+(o.dt||"").replace(/\//g,"-")+".xlsx"}
const isMobile=()=>/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Mac/.test(navigator.platform));
function sheetData(o){if(ensureColors(o)){o.upd=Date.now();save()}
 const cats=o.cats.map(c=>({c,items:sorted(o,c).map(i=>c.items[i]).filter(i=>i.q>0)})).filter(x=>x.items.length);
 let q=0,a=0,n=0;cats.forEach(x=>x.items.forEach(it=>{q+=it.q;n++;if(it.p)a+=it.q*it.p}));
 return {cats,q,a,n}}
function sendSheet(){
 const o=cur();if(!o)return;
 if(!sheetData(o).n){toast("没有数量大于 0 的品项");return}
 sheetPreview()}
function sheetPreview(){
 const o=cur(),X=XL[o.lang||"es"],d=sheetData(o),price=!!o.price;
 if(!d.n){closeModal();toast("没有数量大于 0 的品项");return}
 const hasI=d.cats.some(x=>x.items.some(it=>picUrl(picOf(it.n,x.c,it))));
 const hasU=d.cats.some(x=>x.items.some(it=>unitOf(o,it))),head=[X.cat].concat(hasI?[X.img]:[]).concat([X.it,X.q]).concat(hasU?[X.u]:[]).concat(price?[X.p,X.a]:[]);
 const bgs=cl=>o.dk?"background:#"+shd(cl,.3)+";color:#f1e8de":"background:#"+tint(cl,.86)+";color:#3a2e2a";
 let body="";
 d.cats.forEach(({c,items})=>items.forEach((it,ii)=>{const st=bgs(c.color),u=picUrl(picOf(it.n,c,it));
  body+=`<tr>${ii==0?`<td class="c" rowspan="${items.length}" style="${st}">${esc(c.name)}</td>`:""}${hasI?`<td class="im" style="${st}">${u?`<img src="${esc(u)}">`:""}</td>`:""}<td class="n" style="${st}">${esc(it.n)}</td><td class="q" style="${st}">${it.q}</td>`+(hasU?`<td class="q" style="${st}">${esc(unitTr(unitOf(o,it),o.lang||"es",it.q))}</td>`:"")+(price?`<td class="r" style="${st}">${it.p?fmt(it.p):""}</td><td class="r" style="${st}">${it.p?fmt(it.q*it.p):""}</td>`:"")+`</tr>`}));
 body+=`<tr class="tot"><td>${X.t}</td>${hasI?"<td></td>":""}<td></td><td class="q">${d.q}</td>`+(hasU?"<td></td>":"")+(price?`<td></td><td class="r">${d.a?fmt(d.a):""}</td>`:"")+`</tr>`;
 modal(`<div class="mh">表格预览</div>
 <div class="mt">共 ${d.n} 行 · 合计 ${totTxt(o,o.lang||"es")}${price&&d.a?" · "+esc(o.cur)+fmt(d.a):""}。数量为 0 的品项已隐藏；下面就是 Excel 里的内容。</div>
 <div class="opt">语言：<select onchange="mut(x=>{x.lang=this.value},'',true);sheetPreview()"><option value="es" ${o.lang!="zh"?"selected":""}>Español</option><option value="zh" ${o.lang=="zh"?"selected":""}>中文</option></select><span style="color:#999;font-size:12px">（只改表头和合计文字）</span></div>
 <div class="opt">底色：<select onchange="mut(x=>{x.dk=this.value=='1'?1:0},'',true);sheetPreview()"><option value="0" ${!o.dk?"selected":""}>浅色</option><option value="1" ${o.dk?"selected":""}>深色</option></select><span style="color:#999;font-size:12px">（只影响导出的表格，与软件外观无关）</span></div>
 <div class="xp"><table><thead><tr>${head.map((h,i)=>`<th class="${i>0?'q':''}">${esc(h)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>
 <div class="xm">文件名：${esc(sheetName(o))}</div>
 <div class="mb2" style="flex-wrap:wrap"><button class="g" onclick="copyOrderText()">复制文字</button><button class="g" onclick="shareText()">发送文字</button><button class="g" onclick="closeModal()">取消</button><button onclick="confirmSheet()">${isMobile()?"发送 Excel":"下载 Excel"}</button></div>`)}
async function confirmSheet(){
 const o=cur();let blob,name=sheetName(o);
 try{const cs=sheetData(o).cats,im=await picXl(cs);blob=buildXlsx(o,im)}catch(e){console.error(e);toast("⚠ 生成表格失败");return}
 if(NATIVE){closeModal();dlBlob(blob,name);toast("请在弹出的面板里选择发送方式");return}
 const f=new File([blob],name,{type:blob.type});
 if(isMobile()&&navigator.canShare&&navigator.canShare({files:[f]})){
  navigator.share({files:[f],title:name}).then(()=>{closeModal();toast("表格已发送")}).catch(e=>{if(e&&e.name!="AbortError"){closeModal();dlBlob(blob,name);toast("已下载表格："+name)}});
 }else{closeModal();dlBlob(blob,name);toast("已生成表格："+name)}}

