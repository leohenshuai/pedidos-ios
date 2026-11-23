function checkUpd(){try{window.webkit.messageHandlers.native.postMessage({type:"checkUpdate"});toast("正在检查更新…")}catch(e){toast("⚠ 仅 App 内可用")}}/* ---------- 数据安全: 快照 / 恢复点 / 导出提醒 ---------- */
function bkSnap(label){if(!SERVER)return Promise.resolve();return fetch("api/snapshot?label="+encodeURIComponent(label),{method:"POST"}).catch(()=>{})}
const BKL={"pre-delete":"删除订单前","pre-import":"导入备份前","pre-clear":"清零前","pre-restore":"恢复前","manual":"手动"};
function bkTime(n){const m=n.match(/^pedidos_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);return m?`${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`:n}
async function bkModal(){
 modal(`<div class="mh">恢复点</div><div class="mt">每次保存、删除订单、导入、清零前都会自动留一份。恢复前会再备份当前数据，可以反悔。</div><div id="bkl" class="mt">读取中…</div><div class="mb2"><button class="g" onclick="closeModal()">关闭</button><button onclick="bkNow()">现在备份一份</button></div>`);
 let l=[];try{l=(await (await fetch("api/backups",{cache:"no-store"})).json()).list||[]}catch(e){}
 const box=$("bkl");if(!box)return;
 box.innerHTML=l.length?`<div style="max-height:46vh;overflow:auto">`+l.slice(0,60).map(b=>`<div class="bkr"><div><b>${bkTime(b.name)}</b><br><small>${b.orders>=0?b.orders+" 个订单":"无法读取"}${b.label?" · "+(BKL[b.label]||esc(b.label)):""}</small></div><button onclick="bkRestore('${b.name}')">恢复</button></div>`).join("")+`</div>`:"还没有恢复点（修改数据后会自动生成）";
}
async function bkNow(){await bkSnap("manual");toast("已备份当前数据");bkModal()}
async function bkRestore(name){
 if(!confirm("恢复到 "+bkTime(name)+" 的数据？\n当前数据会先自动备份。"))return;
 try{const r=await fetch("api/restore",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})});if(!r.ok)throw 0;
  const j=fix(await (await fetch("api/data",{cache:"no-store"})).json());S=j;REV=j.rev||0;lsSave();closeModal();location.hash="";route();toast("已恢复到 "+bkTime(name))}catch(e){toast("⚠ 恢复失败")}
}
function bkHint(){const el=$("bkHint");if(!el)return;const t=+(localStorage.getItem("pedidos_lastexp")||0),n=S.orders.length;
 const days=t?Math.floor((Date.now()-t)/864e5):null;
 el.innerHTML=(n&&(days===null||days>=7))?`<div class="bkh"><span>🛟 ${days===null?"还没有导出过备份":"已 "+days+" 天没导出备份"}，建议存一份到「文件」</span><button onclick="exportAll();bkHint()">导出</button></div>`:""}
/* ---------- 触觉 + 提示音 ---------- */
const PREF=(k,d)=>{try{const v=localStorage.getItem("pedidos_"+k);return v===null?d:v}catch(e){return d}};
const setPref=(k,v)=>{try{localStorage.setItem("pedidos_"+k,v)}catch(e){}};
let _ac=null;
function webTone(kind){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;_ac=_ac||new A();if(_ac.state=="suspended")_ac.resume();
 const f={tick:[900,.03],sel:[700,.03],add:[1180,.07],warn:[300,.12],ok:[1320,.09]}[kind]||[800,.03];
 const o=_ac.createOscillator(),g=_ac.createGain();o.type="sine";o.frequency.value=f[0];g.gain.setValueAtTime(.0001,_ac.currentTime);g.gain.exponentialRampToValueAtTime(.12,_ac.currentTime+.005);g.gain.exponentialRampToValueAtTime(.0001,_ac.currentTime+f[1]);
 o.connect(g);g.connect(_ac.destination);o.start();o.stop(_ac.currentTime+f[1]+.02)}catch(e){}}
function FX(kind){const hap=PREF("haptic","1")=="1",snd=PREF("sound","1")=="1";if(!hap&&!snd)return;
 if(NATIVE){try{window.webkit.messageHandlers.native.postMessage({type:"fx",kind:kind,haptic:hap,sound:snd})}catch(e){}}
 else if(snd)webTone(kind)}
/* ---------- 深色模式 ---------- */
function themePref(){return PREF("theme","auto")}
function isDarkNow(){const t=themePref();return t=="dark"||(t=="auto"&&!!(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches))}
function applyTheme(){const d=isDarkNow();document.documentElement.dataset.theme=d?"dark":"light";
 if(NATIVE){try{window.webkit.messageHandlers.native.postMessage({type:"theme",mode:themePref(),dark:d})}catch(e){}}}
function setThemePref(v){setPref("theme",v);applyTheme();setPage()}
function setFxPref(k,v){setPref(k,v?"1":"0");if(v)FX("ok");setPage()}
try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{if(themePref()=="auto")applyTheme()})}catch(e){}
applyTheme();
/* ---------- 分享文字 ---------- */
function orderText(o){const d=sheetData(o),X=XL[o.lang||"es"];const L=[];L.push((o.sup||X.sheet)+" · "+(o.dt||""));
 d.cats.forEach(({c,items})=>{L.push("");L.push(c.name||"");items.forEach(it=>L.push("• "+(it.n||"（图片商品）")+" x"+it.q+(unitOf(o,it)?" "+unitTr(unitOf(o,it),o.lang||"es",it.q):"")+(o.price&&it.p?"  "+o.cur+fmt(it.q*it.p):"")))});
 L.push("");L.push(X.t+": "+totTxt(o,o.lang||"es")+(o.price&&d.a?"  "+o.cur+fmt(d.a):""));return L.join("\n")}
function shareText(){const o=cur();if(!o)return;if(!sheetData(o).n){toast("没有数量大于 0 的品项");return}const t=orderText(o);
 if(NATIVE){try{window.webkit.messageHandlers.native.postMessage({type:"shareText",text:t});closeModal();return}catch(e){}}
 if(navigator.share){navigator.share({text:t}).then(()=>closeModal()).catch(()=>{});return}
 copyText(t)}
function copyText(t){const done=()=>{closeModal();FX("ok");toast("已复制文字，可直接粘贴到聊天")};
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done).catch(()=>fb())}else fb();
 function fb(){const a=document.createElement("textarea");a.value=t;a.style.cssText="position:fixed;opacity:0";document.body.appendChild(a);a.select();try{document.execCommand("copy");done()}catch(e){toast("⚠ 复制失败")}a.remove()}}
function copyOrderText(){const o=cur();if(!o)return;if(!sheetData(o).n){toast("没有数量大于 0 的品项");return}copyText(orderText(o))}
/* ---------- 键盘细节：键盘真的占掉屏幕时才收起底栏，避免被顶到输入框上方遮挡 ---------- */
(function(){const vv=window.visualViewport;if(!vv)return;let H=vv.height;
 const upd=()=>{const a=document.activeElement,typing=a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  const shrunk=(window.innerHeight-vv.height)>120;document.body.classList.toggle("kb",!!(typing&&shrunk))};
 vv.addEventListener("resize",upd);document.addEventListener("focusout",()=>setTimeout(upd,150))})();
function qKey(e){if(e.key!="Enter")return;e.preventDefault();const o=cur();if(!o)return;
 if(CAND&&CAND.length&&Q.trim()){candAdd(0);return}
 if(Q.trim()){quick(QC)}}

/* 种类标签：长按后左右拖动排序 */
let QDRAG=0;
function moveCat(from,to){const o=cur();if(!o||from===to||from<0||to<0||from>=o.cats.length||to>=o.cats.length)return;
 const mp=i=>i===from?to:(from<to?(i>from&&i<=to?i-1:i):(i>=to&&i<from?i+1:i));
 const nd={};Object.keys(draft).forEach(k=>{nd[mp(+k)]=draft[k]});draft=nd;SG={};
 QC=mp(QC);QCMAP[o.id]=QC;FX("add");
 mut(x=>{const [c]=x.cats.splice(from,1);x.cats.splice(to,0,c)})}
(function(){const qc=$("qc");let T=null,D=null,sx=0,sy=0;
 const cancelT=()=>{clearTimeout(T);T=null};
 qc.addEventListener("touchstart",e=>{const b=e.target.closest("button");if(!b||e.touches.length!=1)return;const ci=[...qc.children].indexOf(b);if(ci<0)return;const t=e.touches[0];sx=t.clientX;sy=t.clientY;cancelT();
  T=setTimeout(()=>{T=null;const r=b.getBoundingClientRect();D={ci,b,to:ci,x0:sx,sl:qc.scrollLeft,l0:r.left,r0:r.right};b.classList.add("drag");FX("tick")},420)},{passive:true});
 qc.addEventListener("touchmove",e=>{const t=e.touches[0];
  if(T){if(Math.abs(t.clientX-sx)>8||Math.abs(t.clientY-sy)>8)cancelT();return}
  if(!D)return;e.preventDefault();
  const R=qc.getBoundingClientRect();if(t.clientX>R.right-36)qc.scrollLeft+=10;else if(t.clientX<R.left+36)qc.scrollLeft-=10;
  const ds=qc.scrollLeft-D.sl;D.b.style.transform="translateX("+(t.clientX-D.x0+ds)+"px) scale(1.08)";
  const btns=[...qc.children];let to=D.to;
  if(t.clientX>=D.l0-ds&&t.clientX<=D.r0-ds)to=D.ci;
  btns.forEach((b,i)=>{if(b===D.b)return;const q=b.getBoundingClientRect();if(t.clientX>=q.left&&t.clientX<=q.right)to=i});
  if(to!==D.to){D.to=to;btns.forEach((b,i)=>b.classList.toggle("over",i===to&&b!==D.b));FX("tick")}},{passive:false});
 function end(){cancelT();if(!D)return;const d=D;D=null;d.b.classList.remove("drag");d.b.style.transform="";[...qc.children].forEach(b=>b.classList.remove("over"));QDRAG=Date.now();if(d.to!==d.ci)moveCat(d.ci,d.to)}
 qc.addEventListener("touchend",end);qc.addEventListener("touchcancel",end);
 qc.addEventListener("click",e=>{if(Date.now()-QDRAG<400){e.stopPropagation();e.preventDefault()}},true);
 qc.addEventListener("contextmenu",e=>e.preventDefault())})();

/* 左边缘右滑返回 */
(function(){let sx=0,sy=0,on=false,t0=0;
addEventListener("touchstart",e=>{const p=e.touches[0];on=e.touches.length==1&&p.clientX<26;sx=p.clientX;sy=p.clientY;t0=Date.now()},{passive:true});
addEventListener("touchend",e=>{if(!on)return;on=false;const p=e.changedTouches[0],dx=p.clientX-sx,dy=Math.abs(p.clientY-sy);
 if(dx<70||dy>dx*0.7||Date.now()-t0>900)return;
 if(typeof MOPEN!="undefined"&&MOPEN){closeModal();return}
 if(/^#o=/.test(location.hash)){if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();goHome();return}
 if(typeof TAB!="undefined"&&TAB!=="o"&&typeof setTab=="function")setTab("o")},{passive:true});
})();
boot();
