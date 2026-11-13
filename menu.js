import * as S from './store.js';
import {PRESETS,gen,preview,specOf,COL} from './maps.js';
import {init,setName,startSolo,startHost,joinRoom} from './game.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const show=id=>$$('#menu section').forEach(s=>s.hidden=s.id!=id);
const err=m=>$$('.er').forEach(e=>e.textContent=m||'');
let pick=null;
async function home(){setName(S.user());$('#hi').innerHTML='Thịnh Thế Đại Tống<small></small>';$('#hi small').textContent='Xin chào, '+S.user();err();show('s-home');await S.pull()}
$('#b-in').onclick=()=>{const n=$('#nm').value.trim();if(n){S.login(n);home()}};
$('#nm').onkeydown=e=>{if(e.key=='Enter')$('#b-in').click()};
$('#b-out').onclick=()=>{S.logout();show('s-login')};
$$('.bk').forEach(b=>b.onclick=()=>{err();show('s-home')});
// ---- chọn bản đồ ----
function maps(){err();show('s-maps');const mg=$('#mg');mg.innerHTML='';
 const list=[...PRESETS,...S.data().maps.map(m=>({...m,custom:1,d:'Bản đồ do bạn tạo.',lv:'Tự do'}))];
 pick=pick&&list.find(m=>m.id==pick.id)||list[0];
 list.forEach(m=>{const d=document.createElement('div'),c=document.createElement('canvas'),b=document.createElement('b'),i=document.createElement('span'),t=document.createElement('span');
  d.className='mc'+(m.id==pick.id?' on':'');c.width=c.height=96;preview(c,m.g||gen(m),m.size);
  b.textContent=m.n;i.textContent=`${m.size}x${m.size}, độ khó: ${m.lv}`;t.textContent=m.d;d.append(c,b,i,t);
  if(m.custom){const x=document.createElement('button');x.className='x';x.textContent='x';x.onclick=e=>{e.stopPropagation();S.delMap(m.id);maps()};d.append(x)}
  d.onclick=()=>{pick=m;$$('.mc').forEach(e=>e.classList.toggle('on',e==d))};mg.append(d)})}
$('#b-new').onclick=maps;
$('#b-solo').onclick=()=>startSolo(init(specOf(pick)));
$('#b-room').onclick=async()=>{const e=await startHost(init(specOf(pick)));if(e)err(e)};
$('#b-join').onclick=async()=>{const e=await joinRoom($('#cd').value);if(e)err(e)};
// ---- màn đã lưu ----
$('#b-con').onclick=()=>{const l=$('#sl');l.innerHTML='';const sv=S.data().saves;err();show('s-saves');
 if(!sv.length)l.textContent='Chưa có màn nào được lưu. Bấm "Lưu" trong lúc chơi, hoặc chờ game tự lưu mỗi năm.';
 sv.forEach(s=>{const r=document.createElement('div'),n=document.createElement('span');r.className='row';n.textContent=`${s.name} (${new Date(s.t).toLocaleString('vi-VN')})`;
  const a=document.createElement('button'),b=document.createElement('button'),c=document.createElement('button');
  a.textContent='Chơi 1 người';a.onclick=()=>startSolo(JSON.parse(JSON.stringify(s.G)));
  b.textContent='Mở phòng 4 người';b.onclick=async()=>{const e=await startHost(JSON.parse(JSON.stringify(s.G)));if(e)err(e)};
  c.textContent='Xóa';c.onclick=()=>{S.delSave(s.id);$('#b-con').click()};r.append(n,a,b,c);l.append(r)})};
// ---- tự tạo bản đồ ----
const ec=$('#ec'),ex=ec.getContext('2d');let eg='',en=20,brush='0',dn=0;
function edraw(){const t=ec.width/en;for(let i=0;i<en*en;i++){ex.fillStyle=COL[eg[i]];ex.fillRect(i%en*t,(i/en|0)*t,t,t)}
 ex.strokeStyle='rgba(0,0,0,.12)';ex.beginPath();for(let k=0;k<=en;k++){ex.moveTo(k*t,0);ex.lineTo(k*t,ec.height);ex.moveTo(0,k*t);ex.lineTo(ec.width,k*t)}ex.stroke()}
function ereset(){en=+$('#es').value;eg='0'.repeat(en*en);edraw()}
$('#tb').innerHTML=[['0','Đất'],['1','Rừng'],['2','Nước'],['3','Đá']].map(([k,n])=>`<button data-b="${k}" class="${k==brush?'on':''}">${n}</button>`).join('');
$('#tb').onclick=e=>{const b=e.target.closest('button');if(b){brush=b.dataset.b;$$('#tb button').forEach(x=>x.classList.toggle('on',x==b))}};
function paint(e){const r=ec.getBoundingClientRect(),t=r.width/en,X=(e.clientX-r.left)/t|0,Y=(e.clientY-r.top)/t|0;if(X<0||Y<0||X>=en||Y>=en)return;
 const i=Y*en+X;if(eg[i]!=brush){eg=eg.slice(0,i)+brush+eg.slice(i+1);edraw()}}
ec.onpointerdown=e=>{ec.setPointerCapture(e.pointerId);dn=1;paint(e)};ec.onpointermove=e=>dn&&paint(e);ec.onpointerup=()=>dn=0;
$('#es').onchange=ereset;
$('#b-edit').onclick=()=>{err();show('s-edit');ereset()};
$('#b-sv').onclick=()=>{const n=$('#en').value.trim();
 if(!n)return err('Hãy đặt tên cho bản đồ.');if((eg.match(/0/g)||[]).length<30)return err('Cần ít nhất 30 ô đất trống để xây thành.');
 S.addMap({id:'u'+Date.now(),n,size:en,g:eg});$('#en').value='';maps()};
// ---- khởi động: có tài khoản thì tự vào ----
function scene(){let a=7;const r=()=>(a=a*16807%2147483647)/2147483647;
 const ridge=(y,amp,c,o)=>{let d=`M0 ${y}`;for(let x=0;x<=1000;x+=25)d+=`L${x} ${(y-Math.abs(Math.sin(x*.009+y*.1))*amp-r()*amp*.25).toFixed(1)}`;return`<path d="${d}L1000 560L0 560Z" fill="${c}" opacity="${o}"/>`};
 let roofs='';for(let i=0;i<190;i++){const x=i%2?30+r()*330:620+r()*350,y=300+r()*230,s=7+(y-300)/13,c=['#4a4f55','#5a5f66','#6b5a48','#3f4850'][r()*4|0];
  roofs+=`<path d="M${x-s} ${y}L${x} ${y-s*.55}L${x+s} ${y}L${x} ${y+s*.35}Z" fill="${c}"/><path d="M${x-s} ${y}L${x} ${y+s*.35}L${x+s} ${y}V${y+s*.45}L${x} ${y+s*.8}L${x-s} ${y+s*.45}Z" fill="#e8dcc0"/>`}
 $('#scene').innerHTML=`<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice"><defs>
 <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f1ea"/><stop offset="1" stop-color="#cfe4dc"/></linearGradient>
 <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8c8"/><stop offset="1" stop-color="#5fb8a4"/></linearGradient>
 <filter id="bl"><feGaussianBlur stdDeviation="14"/></filter></defs>
 <rect width="1000" height="560" fill="url(#sk)"/><circle cx="780" cy="110" r="70" fill="#fff8e0" opacity=".8" filter="url(#bl)"/>
 ${ridge(250,90,'#a9bfb2',.7)}${ridge(290,80,'#8aa699',.8)}${ridge(330,60,'#6d8c7d',.9)}${roofs}
 <path d="M470 280C440 350 380 430 300 560L720 560C650 440 560 360 540 280Z" fill="url(#rv)"/>
 <g class="boat"><path d="M430 420h46l-8 10h-30z" fill="#4a3a2a"/><path d="M452 395v25" stroke="#4a3a2a" stroke-width="2"/><path d="M452 397l16 12h-16z" fill="#f3ead2"/></g>
 <g class="boat b2"><path d="M490 360h30l-5 7h-20z" fill="#4a3a2a"/></g>
 <ellipse class="mist" cx="300" cy="300" rx="260" ry="36" fill="#fff" opacity=".55" filter="url(#bl)"/>
 <ellipse class="mist m2" cx="720" cy="270" rx="240" ry="30" fill="#fff" opacity=".5" filter="url(#bl)"/></svg>`;
 for(let i=0;i<22;i++){const p=document.createElement('i');p.className='pt';p.style.cssText=`left:${r()*100}%;animation-duration:${8+r()*8}s;animation-delay:-${r()*12}s`;$('#scene').append(p)}}
scene();
const q=new URLSearchParams(location.search).get('room');if(q)$('#cd').value=q;
S.user()?home():show('s-login');
