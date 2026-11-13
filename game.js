
import {db,ref,set,get,push,update,remove,onValue,onChildAdded,onDisconnect,query,limitToLast} from './fb.js';
import * as S from './store.js';
import {nb as gnb,zoneOf,ZONES} from './grid.js';
import * as R from './resources.js';
import {SN,fm,fi,heating} from './clock.js';
import {TECH,BR,research,quest,report,alerts,norm} from './systems.js';
import {SECTORS,JOBS,slots,allocate} from './labor.js';
const $=s=>document.querySelector(s),cv=$('#cv'),x=cv.getContext('2d');
let N=20;const COLS=['#b0382d','#2f6f8f','#c8a24a','#6a4c93'],BL='abcdefhtwjqyrkmozvA';
// c = [tiền, gỗ, đá]
const B={a:{n:'Nhà tranh',g:'宅',c:[10,5,0]},b:{n:'Ruộng',g:'田',c:[15,0,0]},c:{n:'Xưởng gỗ',g:'林',c:[10,0,0]},
 q:{n:'Mỏ đá',g:'石',c:[15,5,0]},d:{n:'Chợ',g:'市',c:[25,10,0]},e:{n:'Quán trọ',g:'楼',c:[40,20,0]},
 f:{n:'Học đường',g:'学',c:[50,20,10]},h:{n:'Miếu',g:'庙',c:[30,10,10]},t:{n:'Tháp cung',g:'塔',c:[40,20,15]},
 w:{n:'Giếng nước',g:'井',c:[20,0,10]},j:{n:'Đội cứu hỏa',g:'防',c:[45,15,5]},i:{n:'Xem thông tin',g:'察',c:[0,0,0]},r:{n:'Đường',g:'路',c:[3,0,0]},n:{n:'Nha môn',g:'衙',c:[0,0,0],hid:1},k:{n:'Kho',g:'倉',c:[30,20,5]},m:{n:'Cối xay',g:'磨',c:[30,15,5]},o:{n:'Lò bánh',g:'饼',c:[35,15,10]},z:{n:'Trại tằm',g:'蚕',c:[30,10,0]},v:{n:'Xưởng dệt',g:'织',c:[40,15,10]},g:{n:'Nâng cấp nhà',g:'升',c:[20,10,5]},A:{n:'Nhà ngói',g:'瓦',c:[0,0,0],hid:1},
 y:{n:'Y quán',g:'医',c:[40,15,5]},x:{n:'Phá',g:'除',c:[0,0,0]}};
const FL={a:1,c:.8,d:.8,e:.8,h:.5,f:.5,b:.25,t:.15,y:.4,A:.5,k:.7,m:.8,o:.9,z:.8,v:.8}; // độ dễ cháy
const GR=['#cdd49b','#d4c48c','#d8b682','#edf1f0'],FD=['#b8d070','#6fae4f','#d9b44a','#dfe9e3'];
let tz=1,tx=0,ty=0,intro=0,insp=-1,repSeen=0,noRep=0;let G,mode=0,room='',host=1,cur={},sel='a',seed=1,z=.6,cx=0,cy=0,hov=-1,acc=0,lc=0,last=0,tt=0,ev0='',notes=[],wk=[],pt=[],run=0;
const me={id:Math.random().toString(36).slice(2,8),n:'Quan',col:COLS[0]};
const sea=()=>G.m%12/3|0;
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
export const init=o=>{N=o.n;let c=-1,bd=1e9;
 for(let i=0;i<N*N;i++)if(o.g[i]!='2'&&o.g[i]!='3'){const d=(i%N-N/2)**2+((i/N|0)-N/2)**2;if(d<bd){bd=d;c=i}}
 const gg=o.g.slice(0,c)+'n'+o.g.slice(c+1);
 return norm({m:0,n:o.n,c:o.c||140,f:50,w:50,s:20,p:8,h:60,cap:0,fl:0,bk:0,si:0,lu:0,st:{},g:gg,fr:'0'.repeat(N*N),rm:o.rm||1,gl:o.gl||150,mp:o.id||'',ev:'Bạn nhận chức quan huyện. Nha môn ở giữa bản đồ: hãy xây đường, nhà và ruộng.',sv:0,o:0,sp:1,pl:0,lx:-99,y0:{p:8,c:o.c||140,f:50}})};
const np=()=>Math.max(1,Object.keys(cur).length);
const D=()=>mode?1+.3*(np()-1):1;
const goal=()=>Math.round((G.gl||150)*D());
const nb=i=>gnb(i,N);
const adj=(i,ch)=>nb(i).filter(j=>G.g[j]==ch).length;
const setT=(i,k)=>{G.g=G.g.slice(0,i)+k+G.g.slice(i+1);G.cn=G.cn.slice(0,i)+'0'+G.cn.slice(i+1);G.fr=G.fr.slice(0,i)+'0'+G.fr.slice(i+1)};
const ds=(a,b)=>Math.max(Math.abs(a%N-b%N),Math.abs((a/N|0)-(b/N|0)));
function step(){
 if(G.o)return;const d=D(),L=[],pl=G.pl,J=[],Wl=[];let c=0,f=0,w=0,s=0,cap=0,n={};const E=allocate(G,N);let rp=0;
 for(let i=0;i<N*N;i++){const t=G.g[i];if(G.cn[i]!='0')continue;n[t]=(n[t]||0)+1;
  const ef=E.eff[i]??1,rb=(nb(i).some(j=>G.g[j]=='r')?(G.rs.duong?1.4:1.25):1)*ef;if(t=='a')cap+=4;if(t=='A')cap+=8;if(t=='n')cap+=4;if(t=='b')f+=(3+Math.min(2,adj(i,'b')))*rb*(G.rs.cay?1.2:1)*(G.rs.thuy?1.15:1);if(t=='c')w+=4*rb;if(t=='q')s+=3*rb;if(t=='f')rp+=2*ef;
  if(t=='d')c+=(3+2*adj(i,'a'))*ef*(G.rs.cho?1.25:1);if(t=='e')c+=(2+2*adj(i,'d'))*ef;
  if(t=='j')J.push(i);if(t=='w')Wl.push(i)}
 f*=fm[sea()]*(pl&1?1.4:1);
 c+=G.p*.15*(G.h>40?1:.5)*(pl&2?2:1)-(pl&4?8:0)+(n.A||0)*3-E.work*.3;
 const hw=heating(G.m,G.p);G.st={ld:E.work,nh:E.pool,wg:+(E.work*.3).toFixed(1),c:+c.toFixed(1),f:+(f-G.p*.12*d).toFixed(1),w:+(w-hw).toFixed(1)};G.c=Math.max(0,G.c+c);G.w+=w-hw;G.s+=s;G.f+=f-G.p*.12*d;if(G.w<0){G.w=0;G.h-=5;L.push('Thiếu củi sưởi, dân chúng chịu rét!')}
 if(G.f<0){G.f=0;G.sv++;G.h-=G.rs.cuutro?3:8}else G.sv=0;
 G.rp=(G.rp||0)+1+rp;L.push(...R.run(G,n,E));
 const cn=[...G.cn].map(Number);cn.forEach((v,i)=>{if(v==1&&B[G.g[i]]){G.bd=(G.bd||0)+1;L.push(B[G.g[i]].n+' đã xây xong.')}});G.cn=cn.map(v=>v>0?v-1:0).join('');
 const base=50+(n.h||0)*6+(n.f||0)*5+(n.e||0)*3+(n.w||0)-G.p/15-(G.sv?20:0)-(pl&1?6:0)-(pl&2?10:0);
 G.h=Math.max(0,Math.min(100,G.h+(base-G.h)*.3));
 if(!G.sv&&G.h>35&&G.p<cap)G.p+=Math.min(cap-G.p,Math.ceil(G.p*.05));
 if(G.p>cap)G.p--;G.cap=cap;
 // ---- hỏa hoạn ----
 const cov=i=>Math.max(0,...J.map(j=>ds(i,j)<=4?.65:0),...Wl.map(j=>ds(i,j)<=(G.rs.gieng?3:2)?.35:0));
 const fr=[...G.fr].map(Number),nf=fr.slice();
 if(Math.random()<.07*fi[sea()]*d*(pl&4?.4:1)){
  const cd=[];for(let i=0;i<N*N;i++)if(FL[G.g[i]]&&!fr[i])cd.push(i);
  const i=cd[Math.random()*cd.length|0];
  if(i!=null&&Math.random()<FL[G.g[i]]){nf[i]=5;G.fc=(G.fc||0)+1;L.push('Hỏa hoạn! '+B[G.g[i]].n+' bốc cháy. Chạm vào ô lửa để dập!')}}
 fr.forEach((v,i)=>{if(!v)return;
  if(Math.random()<cov(i)){nf[i]=0;L.push('Lính và giếng nước đã dập một đám cháy.');return}
  nf[i]=v-1;
  for(const j of nb(i))if(FL[G.g[j]]&&!fr[j]&&!nf[j]&&Math.random()<FL[G.g[j]]*.3){nf[j]=5;L.push('Lửa lan sang '+B[G.g[j]].n+'!')}
  if(nf[i]==0){L.push(B[G.g[i]].n+' đã cháy rụi.');G.g=G.g.slice(0,i)+'0'+G.g.slice(i+1);G.h=Math.max(0,G.h-3)}});
 G.fr=nf.join('');
 // ---- giặc và cống nạp ----
 G.m++;const every=mode?8:12;
 if(G.m%every==0){const str=(2+G.m/6)*d*(G.rm||1)*(G.rs.thanh?.75:1),def=(n.t||0)*4+G.p/30;
  if(def>=str){G.c+=30;L.push('Giặc tới nhưng bị đánh lui. Triều đình thưởng 30 tiền.')}
  else{G.c=Math.floor(G.c/2);G.p=Math.floor(G.p*.85);
   const bs=[...G.g].map((t,i)=>BL.includes(t)?i:-1).filter(i=>i>=0);
   if(bs.length)setT(bs[Math.random()*bs.length|0],'0');
   L.push('Giặc cướp phá! Cần thêm tháp cung (sức giặc '+str.toFixed(0)+', thủ '+def.toFixed(0)+').')}}
 else if(G.m%12==6){const t=Math.round(30*d+G.m/2);G.c-=t;if(G.c<0){G.c=0;G.h-=10}L.push('Triều đình thu cống nạp '+t+' tiền.')}
 if(G.m%10==4&&G.p>40&&G.p>(n.y||0)*60){const l=Math.ceil(G.p*.08);G.p-=l;L.push('Dịch bệnh hoành hành, '+l+' người chết. Cần thêm Y quán!')}
 if(sea()==1&&!G.rs.thuy&&Math.random()<.12){const fl=[...G.g].map((t,i)=>t=='b'&&nb(i).some(j=>G.g[j]=='2')?i:-1).filter(i=>i>=0);
  if(fl.length){setT(fl[Math.random()*fl.length|0],'0');L.push('Nước sông dâng, một thửa ruộng bị ngập.')}}
 if(Math.random()<.04){const t=20+G.m;G.c+=t;L.push('Thương đoàn ghé chợ, mua bán được '+t+' tiền.')}
 quest(G,n,L);G.lg=[...(G.lg||[]),...L].slice(-8);report(G);
 if(L.length)G.ev=L.slice(0,3).join(' ');
 if(G.p>=goal())G.o='w';else if(G.sv>=6)G.o='l'}
function apply(a){
 if(G.o)return;const k=a.k,i=a.i;
 if(k=='v'){G.sp=i;return}
 if(k=='R'){G.ev=research(G,i);return}
 if(k=='P'){const o=G.pr,j=o.indexOf(a.s),m=j+a.d;if(j>=0&&m>=0&&m<o.length)[o[j],o[m]]=[o[m],o[j]];return}
 if(k=='S'){if(a.t in JOBS)G.sl[a.t]=Math.max(0,Math.min(6,slots(G,a.t)+a.d));return}
 if(k=='p'){G.pl^=1<<i;G.ev='Đã đổi chính sách.';return}
 if(k=='k'){const cc=Math.ceil(40*D()),sc=(G.g.match(/f/g)||[]).length;
  if(G.m-G.lx<12)G.ev='Khoa cử chỉ mở mỗi năm một lần.';else if(G.c<cc)G.ev='Không đủ tiền tổ chức khoa cử.';
  else{G.c+=20+sc*25-cc;G.lx=G.m;G.h=Math.min(100,G.h+8);G.ev=`Khoa cử xong: ${1+sc} sĩ tử đỗ đạt, nộp ${20+sc*25} tiền, lòng dân tăng.`}return}
 if(!(i>=0&&i<N*N))return;
 if(k=='u'){if(G.fr[i]!='0'){G.fr=G.fr.slice(0,i)+'0'+G.fr.slice(i+1);G.ev='Dập tắt lửa!'}return}
 const b=B[k],t=G.g[i];if(!b)return;
 if(k=='x'){if(BL.includes(t)){setT(i,t=='c'?'1':t=='q'?'3':'0');G.ev='Đã phá công trình.'}return}
 if(k=='g'&&!G.rs.ngoi){G.ev='Cần nghiên cứu "Nhà ngói" trước.';return}
 if(!ok(k,i)){G.ev='Ô này không xây được.';return}
 const[cc,cw,cs]=b.c.map(v=>Math.ceil(v*D()));
 if(G.c<cc||G.w<cw||G.s<cs){G.ev='Không đủ nguyên liệu để xây '+b.n+'.';return}
 G.c-=cc;G.w-=cw;G.s-=cs;setT(i,k=='g'?'A':k);if(k!='r'){const bt=Math.min(6,1+Math.floor((b.c[0]+b.c[1]*1.5+b.c[2]*2)/30));G.cn=G.cn.slice(0,i)+bt+G.cn.slice(i+1)}G.ev=(k=='g'?'Đã nâng cấp lên nhà ngói':'Đã xây '+b.n)+'.'}
const ok=(k,i)=>{const t=G.g[i];return k=='x'?BL.includes(t):k=='c'?t=='1':k=='q'?t=='3':k=='g'?t=='a'&&nb(i).some(j=>G.g[j]=='r'):t=='0'};
function act(a){if(G.o)return;if(host){apply(a);sync()}else push(ref(db,`rooms/${room}/acts`),a)}
function sync(){hud();if(room)set(ref(db,`rooms/${room}/state`),G);if(G.o)fin()}
const esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
function hud(){
 const s=sea(),fn=[...G.fr].filter(v=>v!='0').length;
 $('#dt').innerHTML=`Tháng ${G.m%12+1} Năm thứ ${(G.m/12|0)+1}<small>${SN[s]}, năm ${960+(G.m/12|0)}${room?', phòng '+room:''}</small>`;
 $('#rs').innerHTML=[['糧','Lương thực',G.f|0],['木','Gỗ',G.w|0],['石','Đá',G.s|0],['錢','Tiền',G.c|0],['民','Cư dân',`${G.p}/${G.cap} (đích ${goal()})`],['心','Lòng dân',G.h|0],['火','Đám cháy',fn],...[['粉','Bột',G.fl|0],['餅','Bánh',G.bk|0],['絲','Tơ',G.si|0],['綢','Lụa',G.lu|0]].filter(r=>r[2])]
  .map(([g,n,v])=>`<div class="${g=='火'&&fn?'bad':''}"><i>${g}</i>${n}<b>${v}</b></div>`).join('');
 if(!$('#stat').hidden)stat();if(!$('#lab').hidden)labor();if(!$('#rsch').hidden)tech();if(insp>=0)info();
 if(G.rep&&G.rep.y!==repSeen){repSeen=G.rep.y;showRep(G.rep)}
 $('#qs').textContent=G.q?`Chiếu chỉ: ${G.q.x} trước tháng ${G.q.d+1}, thưởng ${G.q.r} tiền.`:'Chưa có chiếu chỉ.';
 document.querySelectorAll('#sp button').forEach(b=>b.classList.toggle('on',+b.dataset.s==G.sp));
 document.querySelectorAll('#pol button').forEach(b=>b.classList.toggle('on',!!(G.pl>>b.dataset.i&1)));
 if(G.ev&&G.ev!=ev0){ev0=G.ev;notes.unshift(G.ev);notes.length=Math.min(4,notes.length);
  $('#nt').innerHTML=notes.map(t=>`<div class="nn${/[Cc]háy|[Hh]ỏa|[Ll]ửa/.test(t)?' f':''}">${esc(t)}</div>`).join('')}}
function labor(){const E=allocate(G,N);
 let h=`<b>Lao động: ${E.work} đang làm, ${E.pool} nhàn rỗi, ${E.total} người đủ tuổi</b><table><tr><th>Ưu tiên ngành (trên được chia người trước)</th><th>Cần</th><th>Có</th></tr>`;
 G.pr.forEach((s,k)=>{h+=`<tr><td>${k+1}. ${SECTORS[s]} <button data-a="P" data-s="${s}" data-d="-1">▲</button><button data-a="P" data-s="${s}" data-d="1">▼</button></td><td>${E.by[s].need}</td><td>${E.by[s].got}</td></tr>`});
 h+='</table><b>Số vị trí mỗi loại công trình</b><table>';
 for(const t of Object.keys(JOBS)){const c=(G.g.match(new RegExp(t,'g'))||[]).length;
  if(c)h+=`<tr><td>${B[t].n} x${c}</td><td><button data-a="S" data-t="${t}" data-d="-1">-</button> ${slots(G,t)} <button data-a="S" data-t="${t}" data-d="1">+</button></td></tr>`}
 $('#lab').innerHTML=h+'</table>'}
function tech(){let h=`<b>Nghiên cứu: ${G.rp|0} điểm</b> (Học đường có người làm cho thêm điểm mỗi tháng)<div class="tg">`;
 BR.forEach((nm,b)=>{h+=`<div><b>${nm}</b>`;TECH.forEach((t,i)=>{if(t.b!=b)return;
  const st=G.rs[t.id]?'đã mở':t.req&&!G.rs[t.req]?'cần '+TECH.find(x=>x.id==t.req).n:t.c+' điểm';
  h+=`<button data-i="${i}" class="${G.rs[t.id]?'on':''}"><b>${t.n}</b><small>${st}</small><small>${t.d}</small></button>`});h+='</div>'});
 $('#rsch').innerHTML=h+'</div>'}
function inspect(i){insp=i;info()}
function info(){const el=$('#info'),t=G.g[insp],b=B[t];if(!b||'0123'.includes(t)){el.hidden=true;return}
 const E=allocate(G,N),cn=+G.cn[insp],j=JOBS[t],s=j?slots(G,t):0,e=E.eff[insp];
 const st=cn?`Đang xây, còn ${cn} tháng`:j?(s==0?'Tạm dừng (0 vị trí)':e>=.99?'Hoạt động đủ người':e>0?`Thiếu người: ${Math.round(e*100)}% công suất`:'Ngừng: không có lao động. Tăng ưu tiên ngành này trong bảng Lao động hoặc xây thêm nhà.'):'Hoạt động';
 el.innerHTML=`<b>${b.n}</b><div>${st}</div>${j?`<div>Ngành ${SECTORS[j[0]]}, ${s} vị trí</div>`:''}<div>Độ dễ cháy: ${Math.round((FL[t]||0)*100)}%</div><button id="ix">Đóng</button>`;
 el.hidden=false;$('#ix').onclick=()=>{insp=-1;el.hidden=true}}
function showRep(r){if(noRep)return;const el=$('#rep');
 const L=[['Dân số',`${r.p0} sang ${r.p1}`],['Lương thực',`${r.f0} sang ${r.f1}`],['Ngân khố',`${r.c0} sang ${r.c1}`],['Công trình xây xong',r.b],['Đám cháy',r.fc],['Chiếu chỉ',`${r.qd} thành, ${r.qf} bại`],['Lòng dân',r.h]];
 el.innerHTML=`<h2>Báo cáo năm thứ ${r.y}</h2>`+L.map(([a,b])=>`<div class="rw"><span>${a}</span><b>${b}</b></div>`).join('')+`<p>${esc(r.cc)}</p><label><input type="checkbox" id="nr"> Không tự hiện năm sau</label><button id="rx">Đóng</button>`;
 el.hidden=false;$('#rx').onclick=()=>{noRep=$('#nr').checked;el.hidden=true}}
function stat(){const z={},t=G.st||{},kho=(G.g.match(/k/g)||[]).length;
 for(const ch of G.g){const k=zoneOf(ch);if(k)z[k]=(z[k]||0)+1}
 $('#stat').innerHTML=alerts(G,allocate(G,N),D()).map(a=>`<div class="wr">${a}</div>`).join('')+`<b>Thống kê tháng này</b><div>Thu nhập ròng: ${t.c??0} (tiền công ${t.wg??0})</div><div>Lao động: ${t.ld??0} làm, ${t.nh??0} nhàn rỗi</div><div>Lương thực ròng: ${t.f??0}</div><div>Gỗ ròng (đã trừ củi sưởi): ${t.w??0}</div><div>Kho: ${kho} (chứa ${R.storage({k:kho})} mỗi loại)</div><hr>`+Object.entries(ZONES).map(([k,n])=>`<div>${n}: ${z[k]||0}</div>`).join('')+`<hr><div>Dân ${G.p}/${G.cap}, lòng dân ${G.h|0}</div>`}
function bar(){$('#bar').innerHTML=Object.entries(B).filter(([,b])=>!b.hid).map(([k,b])=>{const c=b.c.map(v=>Math.ceil(v*D()));
 return`<button data-k="${k}" class="${k==sel?'on':''}"><i>${b.g}</i>${b.n}<small>${'xi'.includes(k)?'miễn phí':[c[0]&&'錢'+c[0],c[1]&&'木'+c[1],c[2]&&'石'+c[2]].filter(Boolean).join(' ')}</small></button>`}).join('')}
$('#bar').onclick=e=>{const b=e.target.closest('button');if(b){sel=b.dataset.k;bar()}};
$('#sp').onclick=e=>{const b=e.target.closest('button');if(b&&G)act({k:'v',i:+b.dataset.s})};
$('#pol').onclick=e=>{const b=e.target.closest('button');if(b&&G)act({k:'p',i:+b.dataset.i})};
$('#bp').onclick=()=>openP('#pol');
$('#bk').onclick=()=>G&&act({k:'k'});
$('#bc').onclick=()=>document.body.classList.toggle('chat');
$('#bs').onclick=()=>{if(G&&host){S.saveGame(G,'Lưu tay');G.ev='Đã lưu màn chơi vào tài khoản '+S.user()+'.';hud()}};
const PN=['#stat','#lab','#rsch','#pol'],openP=id=>{PN.forEach(p=>{$(p).hidden=p==id?!$(p).hidden:true});if(G)hud()};
$('#bt2').onclick=()=>openP('#stat');$('#bl').onclick=()=>openP('#lab');$('#br').onclick=()=>openP('#rsch');
$('#lab').onclick=e=>{const b=e.target.closest('button');if(b)act(b.dataset.a=='P'?{k:'P',s:+b.dataset.s,d:+b.dataset.d}:{k:'S',t:b.dataset.t,d:+b.dataset.d})};
$('#rsch').onclick=e=>{const b=e.target.closest('button');if(b)act({k:'R',i:+b.dataset.i})};
$('#bm').onclick=()=>confirm('Thoát về menu? Hãy lưu màn chơi trước.')&&(location.href=location.pathname);
// ---- vẽ ----
const sh=(c,f)=>{const n=parseInt(c.slice(1),16);return`rgb(${(n>>16)*f|0},${(n>>8&255)*f|0},${(n&255)*f|0})`};
const poly=(p,c,o=1)=>{x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fillStyle=c;x.fill();if(o){x.strokeStyle='rgba(50,35,20,.55)';x.lineWidth=.9;x.lineJoin='round';x.stroke()}};
const hs=i=>((i*2654435761>>>0)>>>8&255)/255;
function box(cx,cy,s,h,wl,rf,rh,j=1){
 const a=30*s,b=15*s,A=a*1.25,Bb=b*1.25,y=cy-h,ap=[cx,y-rh],w=sea()==3,r=sh(rf,j);
 x.fillStyle='rgba(40,30,20,.2)';x.beginPath();x.ellipse(cx+10,cy+b*.6,a*1.3,b*1.2,0,0,7);x.fill();
 poly([[cx-a,cy],[cx,cy+b],[cx,cy+b-h],[cx-a,cy-h]],sh(wl,.85));
 poly([[cx,cy+b],[cx+a,cy],[cx+a,cy-h],[cx,cy+b-h]],sh(wl,.62));
 const dh=Math.min(h*.7,11);poly([[cx-a*.5,cy+b*.5],[cx-a*.2,cy+b*.8],[cx-a*.2,cy+b*.8-dh],[cx-a*.5,cy+b*.5-dh]],'#6b3b24');
 if(h>12)poly([[cx+a*.3,cy+b*.7-h*.45],[cx+a*.7,cy+b*.3-h*.45],[cx+a*.7,cy+b*.3-h*.7],[cx+a*.3,cy+b*.7-h*.7]],'#f3d27a');
 poly([[cx-A-8,y-6],[cx-A,y],[cx-A+7,y+2]],r);poly([[cx+A+8,y-6],[cx+A,y],[cx+A-7,y+2]],r);
 [[[cx-A,y],[cx,y-Bb],ap,.9],[[cx+A,y],[cx,y-Bb],ap,.8],[[cx-A,y],[cx,y+Bb],ap,1],[[cx+A,y],[cx,y+Bb],ap,.7]]
  .forEach(([p,q,rr,f])=>{poly([p,q,rr],sh(rf,f*j));if(w)poly([p,q,rr],`rgba(255,255,255,${.8*f})`)})}
function round(px,py,k){const s=sea();poly([[px-1.5,py+6],[px+1.5,py+6],[px+1,py-4],[px-1,py-4]],'#5b3f26',0);
 if(s==3){x.strokeStyle='#5b3f26';x.lineWidth=1.2;x.beginPath();x.moveTo(px,py-4);x.lineTo(px-7*k,py-14*k);x.moveTo(px,py-4);x.lineTo(px+7*k,py-13*k);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(px,py-13*k,5*k,0,7);x.fill();return}
 x.fillStyle=['#e9a1b8','#4f9a55','#d9822f'][s];x.strokeStyle='rgba(50,35,20,.5)';x.lineWidth=.8;
 for(const[dx,dy,r]of[[-5,-8,7],[5,-9,7],[0,-14,8]]){x.beginPath();x.arc(px+dx*k,py+dy*k,r*k,0,7);x.fill();x.stroke()}}
function tree(px,py,k){const w=sea()==3;
 poly([[px-1.5,py+7],[px+1.5,py+7],[px+1.5,py+1],[px-1.5,py+1]],'#5b3f26');
 for(let j=0;j<3;j++){const ww=(11-j*2.5)*k,by=py+5-j*8*k;
  poly([[px-ww,by],[px+ww,by],[px,by-15*k]],sh('#3f7d4e',1-j*.08));
  if(w)poly([[px-ww*.6,by-6*k],[px+ww*.6,by-6*k],[px,by-15*k]],'#fff')}}
function rocks(cx,cy){poly([[cx-16,cy+4],[cx-8,cy-10],[cx+2,cy-6],[cx+8,cy+5]],'#9a9a94');poly([[cx-8,cy-10],[cx+2,cy-6],[cx-2,cy+4],[cx-12,cy+3]],'#c4c4bc');
 poly([[cx+4,cy+6],[cx+10,cy-3],[cx+18,cy+1],[cx+16,cy+8]],'#85857f')}
function obj(t,cx,cy,i){
 if(t=='1'){if(hs(i)>.5){tree(cx-9,cy+1,.85);tree(cx+9,cy-2,.7)}else{round(cx-8,cy+2,1);round(cx+9,cy-1,.8)}}
 else if(t=='3')rocks(cx,cy);
 else if(t=='q'){rocks(cx-4,cy+2);box(cx+12,cy+4,.35,7,'#a8845a','#6b5a3c',6)}
 else if(t=='b'){poly([[cx-28,cy],[cx,cy-14],[cx+28,cy],[cx,cy+14]],FD[sea()]);
  x.strokeStyle='rgba(40,70,20,.35)';x.lineWidth=1.2;x.beginPath();
  for(let k=1;k<5;k++){const q=k/5;x.moveTo(cx-28+28*q,cy-14*q);x.lineTo(cx+28*q,cy+14-14*q)}x.stroke()}
 else if(t=='w'){poly([[cx-26,cy],[cx,cy-13],[cx+26,cy],[cx,cy+13]],'#bdb5a3');poly([[cx-18,cy],[cx,cy-9],[cx+18,cy],[cx,cy+9]],'#8d8676');poly([[cx-14,cy],[cx,cy-7],[cx+14,cy],[cx,cy+7]],'#5fb8d0')}
 else{const v={a:[.62,10,'#c9a876','#b8893f',11],c:[.6,9,'#a8845a','#6b5a3c',8],d:[.85,8,'#e8dcc0','#d9894a',7],e:[.8,20,'#efe6d2','#4d6a8a',12],
  f:[.85,14,'#efe6d2','#3f8a6a',13],h:[.75,16,'#b0382d','#c8a24a',16],t:[.5,34,'#9a968c','#555e66',12],j:[.8,14,'#efe6d2','#9c3b30',10],y:[.8,13,'#efe6d2','#2f7a6a',10],A:[.78,14,'#efe6d2','#4d6a8a',12],k:[.9,12,'#a8845a','#6b5a3c',8],m:[.7,13,'#d9cdb4','#8a6a4a',10],o:[.7,11,'#e8dcc0','#b0382d',9],z:[.7,10,'#e8dcc0','#4f9a55',9],v:[.8,13,'#d9cdb4','#7a5a8a',10],n:[1,18,'#efe6d2','#8a3b2e',16]}[t];
  box(cx,cy,...v,.88+hs(i)*.24);if(t=='j'){x.fillStyle='#b0382d';x.fillRect(cx+16,cy-40,2,24);poly([[cx+18,cy-40],[cx+30,cy-35],[cx+18,cy-30]],'#c8a24a')}}}
function scaf(cx,cy,i){const p=+G.cn[i];x.globalAlpha=.45;obj(G.g[i],cx,cy,i);x.globalAlpha=1;
 x.strokeStyle='#8a5a2b';x.lineWidth=1.6;x.beginPath();for(const[dx,dy]of[[-22,0],[0,11],[22,0],[0,-11]]){x.moveTo(cx+dx,cy+dy);x.lineTo(cx+dx,cy+dy-28)}
 x.moveTo(cx-22,cy-20);x.lineTo(cx,cy-9);x.lineTo(cx+22,cy-20);x.stroke();
 x.fillStyle='#3b2a1a';x.fillRect(cx-15,cy-44,30,6);x.fillStyle='#c8a24a';x.fillRect(cx-14,cy-43,28*(1-p/7),4)}
function fire(cx,cy,i,v){
 for(let k=0;k<3;k++){const fx=cx-9+k*9,h=12+7*Math.abs(Math.sin(tt/180+i+k*2))+v;
  poly([[fx-6,cy+3],[fx+6,cy+3],[fx+Math.sin(tt/150+k)*3,cy-h]],'#e8541e');poly([[fx-3,cy+3],[fx+3,cy+3],[fx,cy-h*.6]],'#ffc83d')}
 x.fillStyle='rgba(60,60,60,.35)';
 for(let k=0;k<3;k++){const u=(tt/900+k/3)%1;x.beginPath();x.arc(cx+Math.sin(u*6+i)*6,cy-24-u*26,4+u*5,0,7);x.fill()}
 x.fillStyle='#b0382d';x.beginPath();x.arc(cx,cy-54,8,0,7);x.fill();x.fillStyle='#fff';x.font='700 11px sans-serif';x.textAlign='center';x.fillText('!',cx,cy-50)}
function each(fn){for(let k=0;k<2*N-1;k++)for(let tx=Math.max(0,k-N+1);tx<=Math.min(k,N-1);tx++){const ty=k-tx;fn(ty*N+tx,tx,ty,(tx-ty)*32,(tx+ty)*16+16)}}
const tile=(sx,sy)=>{const wx=(sx-cx)/z,wy=(sy-cy)/z;return[(wx/32+wy/16)/2,(wy/16-wx/32)/2]};
function draw(dt){
 const d=devicePixelRatio||1,s=sea(),W=innerWidth,Hh=innerHeight;
 x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,W,Hh);
 x.setTransform(d*z,0,0,d*z,d*cx,d*cy);
 each((i,tx,ty,px,py)=>{const t=G.g[i];
  if(ty==N-1)poly([[px-32,py],[px,py+16],[px,py+27],[px-32,py+11]],'#8a6a3d',0);
  if(tx==N-1)poly([[px,py+16],[px+32,py],[px+32,py+11],[px,py+27]],'#a07c4a',0);
  const col=t=='2'?sh(s==3?'#a8d8d4':'#6fc2b6',.95+hs(i)*.08):t=='r'?sh(s==3?'#e2e4e2':'#bfae8c',.95+hs(i)*.06):sh(GR[s],.95+hs(i)*.08);
  poly([[px,py-16],[px+32,py],[px,py+16],[px-32,py]],col,0);
  if(t=='2'){const o=Math.sin(tt/700+i)*5,e=[[0,-1,[0,-16],[32,0]],[1,0,[32,0],[0,16]],[0,1,[0,16],[-32,0]],[-1,0,[-32,0],[0,-16]]];
  x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1.5;x.beginPath();x.moveTo(px-9+o,py-3+hs(i)*8);x.lineTo(px+3+o,py-3+hs(i)*8);x.stroke();
  x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=2.5;x.beginPath();
  for(const[dx,dy,p,q]of e){const X=tx+dx,Y=ty+dy;if(X<0||Y<0||X>=N||Y>=N||G.g[Y*N+X]!='2'){x.moveTo(px+p[0],py+p[1]);x.lineTo(px+q[0],py+q[1])}}x.stroke()}
  else if(t!='r'&&hs(i)>.55){x.strokeStyle=s==3?'rgba(150,170,175,.7)':'rgba(70,100,40,.5)';x.lineWidth=1;x.beginPath();
   for(let k=0;k<3;k++){const u=px-8+k*8+hs(i+k)*4,v=py-2+hs(i*3+k)*6;x.moveTo(u,v);x.lineTo(u-1,v-5);x.moveTo(u,v);x.lineTo(u+2,v-4)}x.stroke()}});
 // người đi bộ
 const want=Math.min(45,G.p/3|0);
 while(wk.length<want){let i=0;for(let q=0;q<30;q++){i=Math.random()*N*N|0;if('0r'.includes(G.g[i]))break}wk.push({x:i%N+.5,y:(i/N|0)+.5,tx:i%N+.5,ty:(i/N|0)+.5})}
 wk.length=Math.min(wk.length,want);
 for(const p of wk){const dx=p.tx-p.x,dy=p.ty-p.y,dd=Math.hypot(dx,dy);
  if(dd<.05){const i=(p.y|0)*N+(p.x|0),c=nb(i).filter(j=>'0r'.includes(G.g[j]));if(c.length){const j=c[Math.random()*c.length|0];p.tx=j%N+.5;p.ty=(j/N|0)+.5}}
  else{const v=.5*dt*[0,1,2,3][G.sp];p.x+=dx/dd*v;p.y+=dy/dd*v}
  const px=(p.x-p.y)*32,py=(p.x+p.y)*16;x.fillStyle=s==3?'#5a4a3a':'#6b3b2a';x.fillRect(px-1.5,py-7,3,6);x.fillStyle='#e8c9a0';x.beginPath();x.arc(px,py-9,2,0,7);x.fill()}
 each((i,tx,ty,px,py)=>{const t=G.g[i];if(t!='0'&&t!='2'&&t!='r'){if(G.cn[i]!='0')scaf(px,py,i);else obj(t,px,py,i)}const v=+G.fr[i];if(v)fire(px,py,i,v)});
 if(hov>=0){const px=(hov%N-(hov/N|0))*32,py=(hov%N+(hov/N|0))*16+16;
  x.beginPath();x.moveTo(px,py-16);x.lineTo(px+32,py);x.lineTo(px,py+16);x.lineTo(px-32,py);x.closePath();
  x.fillStyle=G.fr[hov]!='0'?'rgba(70,140,230,.35)':ok(sel,hov)?'rgba(60,170,80,.35)':'rgba(200,50,40,.35)';x.fill();x.strokeStyle='#3b2a1a';x.lineWidth=2;x.stroke()}
 x.font='600 12px "Be Vietnam Pro",sans-serif';x.textAlign='left';
 for(const[id,p]of Object.entries(cur)){if(id==me.id||p.x==null)continue;
  const px=(p.x-p.y)*32,py=(p.x+p.y)*16;x.fillStyle=p.col;poly([[px,py],[px+13,py+6],[px+5,py+13]],p.col);x.fillText(p.n,px+14,py+20)}
 // thời tiết theo mùa
 x.setTransform(d,0,0,d,0,0);
 if(s!=1){if(!pt.length)for(let k=0;k<70;k++)pt.push({x:Math.random()*W,y:Math.random()*Hh,v:20+Math.random()*30,ph:Math.random()*6});
  x.fillStyle=['#f2a7c0','','#d98a3a','#ffffff'][s];
  for(const q of pt){q.y+=q.v*dt*[0,1,2,3][G.sp||1];q.x+=Math.sin(tt/700+q.ph)*20*dt;if(q.y>Hh){q.y=-5;q.x=Math.random()*W}
   x.beginPath();x.arc(q.x,q.y,s==3?2:2.5,0,7);x.fill()}}
 const gr=x.createRadialGradient(W/2,Hh/2,Math.min(W,Hh)*.35,W/2,Hh/2,Math.max(W,Hh)*.75);
 gr.addColorStop(0,'rgba(255,240,200,0)');gr.addColorStop(1,'rgba(60,40,20,.38)');x.fillStyle=gr;x.fillRect(0,0,W,Hh);
 x.fillStyle=['rgba(255,200,230,.05)','rgba(255,240,150,.05)','rgba(255,140,40,.07)','rgba(180,210,255,.1)'][s];x.fillRect(0,0,W,Hh)}
function frame(t){
 const dt=Math.min(.1,(t-last)/1000||0);last=t;tt=t;
 if(intro>0){intro-=dt;const k=Math.min(1,dt*2.5);z+=(tz-z)*k;cx+=(tx-cx)*k;cy+=(ty-cy)*k}
 if(G){if(host&&!G.o&&G.sp){acc+=dt*[0,1,2,4][G.sp];if(acc>=2.4){acc=0;step();sync();if(!mode&&G.m%12==0)S.saveGame(G,'Tự động lưu')}}draw(dt)}
 requestAnimationFrame(frame)}
// ---- điều khiển: chạm = xây, kéo = di chuyển, 2 ngón/lăn chuột = thu phóng ----
const P=new Map();let drag=0,pd=0,sx0=0,sy0=0;
function zoomAt(mx,my,f){const z2=Math.min(2,Math.max(.25,z*f));cx=mx-(mx-cx)*z2/z;cy=my-(my-cy)*z2/z;z=z2}
function sendCur(a,b){if(!room)return;const n=Date.now();if(n-lc<70)return;lc=n;
 update(ref(db,`rooms/${room}/players/${me.id}`),{x:+a.toFixed(2),y:+b.toFixed(2)})}
cv.onpointerdown=e=>{cv.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);sx0=e.clientX;sy0=e.clientY;
 if(P.size==2){const[a,b]=[...P.values()];pd=Math.hypot(a[0]-b[0],a[1]-b[1]);drag=1}else{pd=0;drag=0}};
cv.onpointermove=e=>{if(!G)return;const[fx,fy]=tile(e.clientX,e.clientY),o=P.get(e.pointerId);
 hov=fx>=0&&fy>=0&&fx<N&&fy<N?(fy|0)*N+(fx|0):-1;sendCur(fx,fy);if(!o)return;
 if(P.size==1){if(Math.hypot(e.clientX-sx0,e.clientY-sy0)>8)drag=1;if(drag){cx+=e.clientX-o[0];cy+=e.clientY-o[1]}P.set(e.pointerId,[e.clientX,e.clientY])}
 else{P.set(e.pointerId,[e.clientX,e.clientY]);const[a,b]=[...P.values()],dd=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd)zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,dd/pd);pd=dd}};
cv.onpointerup=e=>{if(G&&!drag&&P.size==1){const[fx,fy]=tile(e.clientX,e.clientY);
  if(fx>=0&&fy>=0&&fx<N&&fy<N){const i=(fy|0)*N+(fx|0);hov=i;if(sel=='i'&&G.fr[i]=='0')inspect(i);else act({k:G.fr[i]!='0'?'u':sel,i})}}
 P.delete(e.pointerId);pd=0};
cv.onpointercancel=e=>{P.delete(e.pointerId)};
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,e.deltaY<0?1.12:.89)},{passive:false});
cv.onpointerleave=()=>{hov=-1};
function fit(){const d=devicePixelRatio||1;cv.width=innerWidth*d;cv.height=innerHeight*d;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px'}
function center(){tz=Math.max(.25,Math.min(1.2,Math.min(innerWidth/(N*64+60),(innerHeight-140)/(N*32+120))));tx=innerWidth/2;ty=innerHeight/2-N*16*tz-10;z=tz*.55;cx=innerWidth/2;cy=innerHeight/2-N*16*z;intro=2}
addEventListener('resize',fit);
// ---- chat, phòng chơi ----
function pl(){$('#pl').innerHTML=Object.values(cur).map(p=>`<span style="color:${p.col}">● ${esc(p.n)}</span>`).join('')+'<button id="lk">Chép link</button>';
 $('#lk').onclick=()=>navigator.clipboard&&navigator.clipboard.writeText(location.origin+location.pathname+'?room='+room)}
function chat(){const t=$('#ci').value.trim();if(!t||!room)return;$('#ci').value='';push(ref(db,`rooms/${room}/chat`),{n:me.n,col:me.col,t})}
$('#cs').onclick=chat;$('#ci').onkeydown=e=>{if(e.key=='Enter')chat()};
function listen(){const r=`rooms/${room}/`;
 onValue(ref(db,r+'players'),s=>{cur=s.val()||{};pl();bar();if(G)hud()});
 onChildAdded(query(ref(db,r+'chat'),limitToLast(40)),s=>{const m=s.val(),d=document.createElement('div'),a=document.createElement('b'),b=document.createElement('span');
  a.style.color=m.col;a.textContent=m.n+': ';b.textContent=m.t;d.append(a,b);$('#log').append(d);$('#log').scrollTop=1e9});
 if(host)onChildAdded(ref(db,r+'acts'),s=>{if(G)apply(s.val());remove(s.ref);sync()});
 else onValue(ref(db,r+'state'),s=>{if(!s.exists()){alert('Chủ phòng đã rời, phòng đóng.');location.href=location.pathname;return}
  G=norm(s.val());N=G.n;hud();if(G.o)fin()})}
function go(){$('#menu').classList.add('leave');setTimeout(()=>$('#menu').hidden=true,900);document.body.classList.add('playing');repSeen=G.rep?G.rep.y:0;document.body.classList.toggle('mp',!!mode);fit();center();bar();hud();
 if(!run){run=1;requestAnimationFrame(frame)}}
function fin(){const w=G.o=='w';$('#end').innerHTML=`<div class="card"><h1>${w?'Thịnh thế!':'Thành đã diệt vong'}</h1><p>${w?'Dân số đạt '+G.p+'. Thành của bạn vang danh thiên hạ.':'Nạn đói kéo dài khiến dân chúng nổi loạn.'}</p><button onclick="location.href=location.pathname">Về menu</button></div>`;$('#end').hidden=false}
export const setName=n=>{me.n=n};
export function startSolo(g){mode=0;host=1;room='';cur={};G=norm(g);N=G.n;go()}
export async function startHost(g){try{
 const code=Math.random().toString(36).slice(2,6).toUpperCase();
 mode=1;host=1;room=code;me.col=COLS[0];cur={[me.id]:{n:me.n,col:me.col}};G=norm(g);N=G.n;
 await set(ref(db,`rooms/${code}`),{host:me.id,state:G,players:{[me.id]:{n:me.n,col:me.col}}});
 onDisconnect(ref(db,`rooms/${code}`)).remove();listen();go();return''
}catch(e){room='';return'Lỗi Firebase: '+e.message+' (kiểm tra Rules của Realtime Database)'}}
export async function joinRoom(code){try{
 code=code.toUpperCase().trim();const s=await get(ref(db,`rooms/${code}`));
 if(!s.exists())return'Không tìm thấy phòng.';
 const v=s.val(),ps=v.players||{};if(Object.keys(ps).length>=4)return'Phòng đã đủ 4 người.';
 const used=Object.values(ps).map(p=>p.col);me.col=COLS.find(c=>!used.includes(c));
 mode=1;host=0;room=code;G=norm(v.state);N=G.n;
 const pr=ref(db,`rooms/${code}/players/${me.id}`);await set(pr,{n:me.n,col:me.col});onDisconnect(pr).remove();
 listen();go();return''
}catch(e){room='';return'Lỗi Firebase: '+e.message}}
