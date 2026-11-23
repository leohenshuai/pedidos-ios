/* ================= 海报 ================= */
function rr(x,c,X,y,w,h,r){x.beginPath();x.roundRect(X,y,w,h,r);x.fillStyle=c;x.fill()}
function fit(x,t,font,maxw,min){let s=parseInt(font.match(/(\d+)px/)[1]);min=min||16;while(s>min){x.font=font.replace(/\d+px/,s+"px");if(x.measureText(t).width<=maxw)return t;s-=2}x.font=font.replace(/\d+px/,min+"px");while(t.length>1&&x.measureText(t).width>maxw)t=t.slice(0,-1);return t}
function hexA(h,a){return h+a}
function poster(){
 const o=cur();if(o&&ensureColors(o)){o.upd=Date.now();save();renderEdit()}
 if(!o.cats.some(c=>c.items.some(i=>i.q>0))){toast("没有数量大于 0 的品项");return}
 $("thm").innerHTML=THEMES.map((t,i)=>`<button class="th ${o.theme==i?'on':''}" style="background:${t[2]}" onclick="setTheme(${i})"></button>`).join("");
 $("pv").style.display="block";$("pv").scrollTop=0;drawPoster();
}
function setTheme(i){mut(o=>{o.theme=i},"",true);$("thm").querySelectorAll(".th").forEach((b,k)=>b.classList.toggle("on",k==i));drawPoster()}
function setLang(l){mut(o=>{o.lang=l},"",true);drawPoster()}
function setDk(v){mut(o=>{o.dk=v},"",true);drawPoster()}
let DPT=0;
async function drawPoster(){
 const tk=++DPT,o=cur(),L=LANG[o.lang||"es"],T=THEMES[o.theme||0],dk=!!o.dk;let [ ,BG,DK,GD]=T;
 const HD=dk?"#"+tint(DK,.16).toLowerCase():DK,CARD=dk?"#241f1b":"#fff",TX=dk?"#f1e8de":DK,LINE=dk?"#4a423b":"#ddd",DATE=dk?"#a89a8e":"#7a6a60",SUBC=dk?"#9a8d82":"#888",HT=dk?"#f5efe6":BG,TOTT=dk?"#2a2018":DK;
 if(dk)BG="#14110f";
 $("dkL").classList.toggle("on",!o.dk);$("dkD").classList.toggle("on",!!o.dk);$("lgEs").classList.toggle("on",(o.lang||"es")=="es");$("lgZh").classList.toggle("on",o.lang=="zh");
 const cats=o.cats.map(c=>({...c,items:sorted(o,c).map(i=>c.items[i]).filter(i=>i.q>0)})).filter(c=>c.items.length);
 const IM=await picPre(cats);if(tk!==DPT)return;
 const W=1080,P=50,IW=W-2*P,CP=32,COLW=(IW-2*CP-44)/2,RH=IM.size?112:58,TH=RH-12,SF='-apple-system,"PingFang SC","Microsoft YaHei",Helvetica,Arial,sans-serif';
 const showAmt=o.price&&amtO(o)>0,sup=(o.sup||"").trim().toUpperCase();
 let H=P+270+44+30+90+(showAmt?20+70:0)+P;cats.forEach(c=>H+=12+86+Math.ceil(c.items.length/2)*RH+24+28);
 const SC=Math.min(2,Math.sqrt(14e6/(W*H))),cv=document.createElement("canvas");cv.width=Math.round(W*SC);cv.height=Math.round(H*SC);const x=cv.getContext("2d");x.setTransform(cv.width/W,0,0,cv.height/H,0,0);x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";
 x.fillStyle=BG;x.fillRect(0,0,W,H);
 let y=P;rr(x,HD,P,y,IW,270,28);
 x.textAlign="center";x.fillStyle=HT+"b3";x.font="22px "+SF;x.letterSpacing="8px";const p1=L.p1(sup);if(p1)x.fillText(p1,W/2+4,y+68);
 x.fillStyle=HT;x.letterSpacing="6px";x.fillText(fit(x,sup||L.big,'bold 88px '+SF,IW-60,36),W/2+3,y+160);
 x.fillStyle=GD;x.font="26px "+SF;x.letterSpacing="4px";const p2=L.p2(sup);if(p2)x.fillText(p2,W/2+2,y+225);x.letterSpacing="0px";
 y+=270+44;x.font="24px "+SF;x.fillStyle=DATE;x.textAlign="left";
 x.fillText(L.date+": "+(o.dt||"____/____/______"),P+8,y);y+=30;
 cats.forEach(c=>{
  const rows=Math.ceil(c.items.length/2),h=12+86+rows*RH+24;
  x.save();x.beginPath();x.roundRect(P,y,IW,h,24);x.clip();x.fillStyle=CARD;x.fillRect(P,y,IW,h);x.fillStyle=c.color;x.fillRect(P,y,IW,12);x.restore();
  x.fillStyle=c.color;x.font="bold 44px "+SF;x.letterSpacing="3px";x.textAlign="left";const nm=fit(x,c.name||" ","bold 44px "+SF,IW-2*CP-40,24);x.fillText(nm,P+CP,y+12+58);
  const nw=x.measureText(nm).width;x.letterSpacing="0px";
  if(c.sub){x.fillStyle=SUBC;x.font="italic 22px "+SF;const sw=IW-2*CP-nw-30;if(sw>80)x.fillText(fit(x,c.sub,"italic 22px "+SF,sw,14),P+CP+nw+18,y+12+58)}
  c.items.forEach((it,i)=>{
   const col=i%2,r=Math.floor(i/2),cx=P+CP+col*(COLW+44),cy=y+12+86+r*RH;
   x.strokeStyle=LINE;x.setLineDash([2,6]);x.lineWidth=2;x.lineCap="round";x.beginPath();x.moveTo(cx,cy+RH-4);x.lineTo(cx+COLW,cy+RH-4);x.stroke();x.setLineDash([]);
   x.font="bold 26px "+SF;const q=String(it.q)+(unitOf(o,it)?" "+unitTr(unitOf(o,it),o.lang||"es",it.q):""),pw=Math.max(54,x.measureText(q).width+30);
   const im=IM.get(it),tw=im?TH+12:0;
   if(im){const ty=cy+(RH-4-TH)/2,sc=Math.min(TH/im.width,TH/im.height);x.save();x.beginPath();x.roundRect(cx,ty,TH,TH,10);x.clip();x.fillStyle="#fff";x.fillRect(cx,ty,TH,TH);x.drawImage(im,cx+(TH-im.width*sc)/2,ty+(TH-im.height*sc)/2,im.width*sc,im.height*sc);x.restore();x.strokeStyle=LINE;x.lineWidth=1;x.setLineDash([]);x.beginPath();x.roundRect(cx,ty,TH,TH,10);x.stroke()}
   x.fillStyle=TX;x.textAlign="left";const t=fit(x,it.n,"28px "+SF,COLW-pw-16-tw,18);x.fillText(t,cx+tw,cy+RH/2+6);
   rr(x,c.color,cx+COLW-pw,cy+(RH-4)/2-20,pw,40,20);x.fillStyle="#fff";x.font="bold 26px "+SF;x.textAlign="center";x.fillText(q,cx+COLW-pw/2,cy+(RH-4)/2+9);
  });
  x.textAlign="left";y+=h+28;
 });
 rr(x,GD,P,y,IW,90,24);x.fillStyle=TOTT;x.font="bold 38px "+SF;x.textAlign="center";x.fillText(L.total(totTxt(o,o.lang||"es")),W/2,y+58);y+=90;
 if(showAmt){y+=20;x.font="30px "+SF;x.fillStyle=TX;x.fillText(L.amount+": "+o.cur+fmt(amtO(o)),W/2,y+46)}
 PCV=cv;const url=cv.toDataURL("image/png");$("pimg").src=url;$("dl").href=url;
 $("dl").download="pedido_"+((o.sup||"orden").replace(/[^\w\u4e00-\u9fa5-]+/g,"_"))+"_"+(o.dt||"").replace(/\//g,"-")+".png";
}

/* ---------- PDF（纯前端，不依赖外部库：把 JPEG 直接封装成单页 PDF） ---------- */
function exportPdf(){
 if(!PCV)return;
 const jpg=atob(PCV.toDataURL("image/jpeg",0.95).split(",")[1]),w=PCV.width,h=PCV.height,pw=595,ph=Math.round(595*h/w);
 const bin=s=>{const a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i)&255;return a};
 const parts=[],offs=[];let len=0;
 const add=s=>{const b=typeof s=="string"?bin(s):s;parts.push(b);len+=b.length};
 const obj=(n,s)=>{offs[n]=len;add(n+" 0 obj\n"+s+"\nendobj\n")};
 add("%PDF-1.4\n");
 obj(1,"<< /Type /Catalog /Pages 2 0 R >>");obj(2,"<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
 obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
 offs[4]=len;add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);add(bin(jpg));add("\nendstream\nendobj\n");
 const cs=`q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;obj(5,`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
 const xr=len;add("xref\n0 6\n0000000000 65535 f \n"+[1,2,3,4,5].map(i=>String(offs[i]).padStart(10,"0")+" 00000 n \n").join(""));
 add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);
 const o=cur();dlBlob(new Blob(parts,{type:"application/pdf"}),"pedido_"+((o.sup||"orden").replace(/[^\w\u4e00-\u9fa5-]+/g,"_"))+".pdf");toast("PDF 已生成");
}
if(NATIVE)$("dl").addEventListener("click",e=>{e.preventDefault();nativeSave($("dl").download||"pedido.png",($("dl").href||"").split(",")[1]||"")});
setInterval(()=>{if(!MOPEN&&cur())syncUndo()},2000);

/* 底栏页签：光圈停在当前页签，切换时拉伸滑动 */
let LENS_REL=()=>{},TAB="o",TABPOS=()=>{},setTab=()=>{};
(function(){const bk=document.querySelector(".foot .bk"),ln=$("lens");if(!bk||!ln)return;let lx=null,lw=0;
 const btn=k=>bk.querySelector('[data-t="'+k+'"]');
 function pos(anim){const el=btn(TAB);if(!el)return;const b=bk.getBoundingClientRect(),r=el.getBoundingClientRect();if(!r.width)return;const x=r.left-b.left,w=r.width;
  if(anim&&lx!==null&&Math.abs(x-lx)>4){const l0=Math.min(x,lx),w0=Math.max(x+w,lx+lw)-l0;ln.style.transition="left .16s ease-out,width .16s ease-out";ln.style.left=l0+"px";ln.style.width=w0+"px";
   setTimeout(()=>{ln.style.transition="";ln.style.left=x+"px";ln.style.width=w+"px"},150)}
  else{ln.style.transition="none";ln.style.left=x+"px";ln.style.width=w+"px";void ln.offsetWidth;ln.style.transition=""}
  lx=x;lw=w;ln.classList.add("on");bk.querySelectorAll("button").forEach(e=>e.classList.toggle("act",e.dataset.t==TAB))}
 TABPOS=()=>pos(false);
 setTab=function(k){if(k===TAB&&lx!==null)return;FX("sel");TAB=k;pos(true);["o","s","t"].forEach(t=>$("tab_"+t).style.display=t==k?"block":"none");
  const el=$("tab_"+k);el.classList.remove("vin");void el.offsetWidth;el.classList.add("vin");
  if(k=="o")renderHome();if(k=="s")vocPage();if(k=="t")setPage();scrollTo(0,0)};
 addEventListener("resize",()=>pos(false));setTimeout(()=>pos(false),50)})();
function vocPage(){vocPageList()}
let VF="all";
function vocSrcSet(){const s=new Set();SRCS.list.forEach(x=>{const d=srcData(x.id);if(d)Object.values(d.cats).forEach(l=>l.forEach(it=>s.add(skey(it[0]))))});return s}
function vocFilter(f){VF=f;vocPageList()}
function vocRows(){const out=[],seen=new Set();
 SRCS.list.forEach(x=>{const d=srcData(x.id);if(!d)return;Object.entries(d.cats).forEach(([c,l])=>l.forEach(it=>{const kk=x.id+"|"+c+"|"+skey(it[0]);if(seen.has(kk))return;seen.add(kk);out.push({n:it[0],sid:x.id,sn:x.name,cat:c})}))});
 S.vocab.forEach((v,i)=>out.push({n:v,sid:"manual",sn:"手动",vi:i}));return out}
function vocPageList(){if(!$("vpl"))return;const k=norm($("sq2")?$("sq2").value:"");const all=vocRows();
 const tabs=[["all","全部",all.length],...SRCS.list.map(x=>[x.id,x.name,all.filter(r=>r.sid===x.id).length]),["manual","手动",S.vocab.length]];
 if(!tabs.some(t=>t[0]===VF))VF="all";
 $("vf").innerHTML=tabs.map(([f,t,n])=>`<button class="${VF==f?'on':''}" onclick="vocFilter('${f}')">${esc(t)} ${n}</button>`).join("");
 const rows=all.filter(r=>(VF=="all"||r.sid===VF)&&(!k||norm(r.n).includes(k)));
 $("sCnt").textContent=all.length+" 条";
 const grp=new Map();rows.forEach(r=>{const g=r.sid==="manual"?"手动":r.sn+" · "+r.cat;if(!grp.has(g))grp.set(g,[]);grp.get(g).push(r)});
 let shown=0,html="";for(const [g,l] of grp){if(shown>=400)break;l.sort((a,b)=>norm(a.n).localeCompare(norm(b.n)));
  html+=`<div class="pt" style="margin:10px 2px 4px">${esc(g)} <small style="color:#999">${l.length}</small></div>`+l.slice(0,400-shown).map(r=>`<div class="srow"><span style="flex:1">${esc(r.n)}</span>${r.sid==="manual"?`<button style="color:#c0392b" onclick="vocPageDel(${r.vi})">删除</button>`:""}</div>`).join("");shown+=l.length}
 $("vpl").innerHTML=html+(rows.length>400?`<div class="hint" style="text-align:center;color:#aaa;padding:6px">还有 ${rows.length-400} 条，请用搜索缩小范围</div>`:"")+(rows.length?"":`<div class="hint" style="text-align:center;color:#aaa;padding:12px">没有匹配的品名</div>`);return;
 $("vpl").innerHTML=l.slice(0,300).map(v=>`<div class="srow"><span style="flex:1">${esc(v)} <small style="color:${tag(v)?"#b07a3a":"#999"}">${tag(v)?esc(srcNameOf(v)||"商品源"):"手动"}</small></span><button style="color:#c0392b" onclick="vocPageDel(${S.vocab.indexOf(v)})">删除</button></div>`).join("")+(l.length>300?`<div class="hint" style="text-align:center;color:#aaa;padding:6px">还有 ${l.length-300} 条，搜索缩小范围</div>`:"")||`<div class="hint" style="padding:16px;text-align:center;color:#bbb">没有匹配</div>`}
function vocPageAdd(){const e=$("vnew"),n=fixName(e.value);if(!n)return;if(vocabFind(n)){toast("已有这个品名");return}addVocab(n);save();e.value="";vocPageList();toast("已添加："+n)}
function vocPageDel(i){const n=S.vocab[i];if(n==null)return;if(!confirm("从品名库删除「"+n+"」？\n（只影响输入提示，不改已有订单）"))return;S.vocab.splice(i,1);save();vocPageList();toast("已删除："+n)}
function setPage(){const L=S.orders.filter(o=>!o.del).length,sc=srcCur();
 $("setp").innerHTML=`<div class="pt">商品源</div><div class="card">
 <button class="setb" onclick="srcModal()"><span>🏷</span><span style="flex:1">商品源管理</span><small style="color:#999">${SRCS.list.length} 个源</small></button>
 <button class="setb" onclick="homeCat()"><span>📥</span><span style="flex:1">从商品源导入到订单</span><small style="color:#999">${esc(sc.name)}</small></button></div>
 <div class="pt">AI</div><div class="card">
 <button class="setb" onclick="aiSettings()"><span>🔑</span><span style="flex:1">AI 密钥设置</span><small style="color:${aiReady()?"#3aa655":"#999"}">${aiReady()?"已配置 · "+esc(AIC.model):"未配置"}</small></button></div>
 <div class="pt">外观与反馈</div><div class="card">
 <div class="setb" style="flex-wrap:wrap"><span>🌗</span><span style="flex:1">外观</span><div class="seg3" style="display:flex;gap:4px">${[["auto","跟随系统"],["light","浅色"],["dark","深色"]].map(([k,t])=>`<button class="${themePref()==k?"on":""}" onclick="setThemePref('${k}')">${t}</button>`).join("")}</div></div>
 <button class="setb" onclick="setFxPref('haptic',${PREF("haptic","1")!="1"})"><span>📳</span><span style="flex:1">触感反馈（振动）</span><small style="color:${PREF("haptic","1")=="1"?"#3aa655":"#999"}">${PREF("haptic","1")=="1"?"已开":"已关"}</small></button>
 <button class="setb" onclick="setFxPref('sound',${PREF("sound","1")!="1"})"><span>🔔</span><span style="flex:1">提示音</span><small style="color:${PREF("sound","1")=="1"?"#3aa655":"#999"}">${PREF("sound","1")=="1"?"已开":"已关"}</small></button></div>
 <div class="pt">数据</div><div class="card">
 <button class="setb" onclick="exportAll()"><span>💾</span><span style="flex:1">导出全部备份</span><small style="color:#999">${L} 个订单</small></button>
 <button class="setb" onclick="exportToFile()"><span>📁</span><span style="flex:1">导出到「文件」App</span><small style="color:#999">Documents/订货单</small></button>
 <button class="setb" onclick="bkModal()"><span>🛟</span><span style="flex:1">恢复点（自动备份）</span><small style="color:#999">点开查看</small></button>
 <label class="setb"><span>📂</span><span style="flex:1">导入备份</span><input type="file" accept=".json,application/json" style="display:none" onchange="importAll(this)"></label></div>
 <div class="card">${NATIVE?`<button class="setb" onclick="checkUpd()"><span>🔄</span><span style="flex:1">检查更新</span><small style="color:#999">${esc(window.__BUILD__?"build "+window.__BUILD__:"")}</small></button>`:""}<div class="setb"><span>ℹ️</span><span style="flex:1">版本</span><small style="color:#999">${esc(APP_VERSION)}</small></div></div>`}

/* 把当前数据直接写到 Documents/订货单/（原生 /api/export-file），在“文件”App 里可见 */
async function exportToFile(){
 if(!NATIVE){toast("⚠ 仅 App 内可用");return}
 try{
  const r=await fetch("api/export-file",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(S)});
  const j=await r.json();
  if(r.ok&&j.name)toast("已导出到「文件」App：订货单/"+j.name);else toast("⚠ 导出失败");
 }catch(e){toast("⚠ 导出失败")}
}
