import * as S from './store.js';
import {PRESETS,gen,preview,specOf,COL} from './maps.js';
import {init,setName,startSolo,startHost,joinRoom} from './game.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const show=id=>$$('#menu section').forEach(s=>s.hidden=s.id!=id);
const err=m=>$$('.er').forEach(e=>e.textContent=m||'');
let pick=null;
async function home(){setName(S.user());$('#hi').textContent='Xin chào, '+S.user();err();show('s-home');await S.pull()}
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
const q=new URLSearchParams(location.search).get('room');if(q)$('#cd').value=q;
S.user()?home():show('s-login');
