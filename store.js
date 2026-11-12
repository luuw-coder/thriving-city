// Tài khoản = tên người chơi. Dữ liệu lưu ở localStorage (tự đăng nhập lại) và đồng bộ lên Firebase (users/<tên>).
import {db,ref,get,set} from './fb.js';
const K='tc_user',L=n=>'tc_data_'+n,C=n=>'users/'+encodeURIComponent(n.toLowerCase()).replace(/[.$#\[\]\/%]/g,'_');
export const user=()=>localStorage.getItem(K)||'';
export const login=n=>localStorage.setItem(K,n);
export const logout=()=>localStorage.removeItem(K);
export const data=()=>{try{const d=JSON.parse(localStorage.getItem(L(user())));return{saves:d.saves||[],maps:d.maps||[],t:d.t||0}}catch{return{saves:[],maps:[],t:0}}};
function put(d){d.t=Date.now();localStorage.setItem(L(user()),JSON.stringify(d));set(ref(db,C(user())),JSON.parse(JSON.stringify(d))).catch(()=>{})}
export async function pull(){try{const c=(await get(ref(db,C(user())))).val(),l=data();
 if(c&&(c.t||0)>l.t)localStorage.setItem(L(user()),JSON.stringify({saves:c.saves||[],maps:c.maps||[],t:c.t}));else if(l.t)put(l)}catch{}}
export function saveGame(G,label){const d=data(),e={id:'s'+Date.now(),name:`${label}: năm thứ ${(G.m/12|0)+1}, ${G.p} dân`,t:Date.now(),G:JSON.parse(JSON.stringify(G))};
 if(label=='Tự động lưu')d.saves=d.saves.filter(s=>!s.name.startsWith('Tự động'));
 d.saves=[e,...d.saves].slice(0,8);put(d)}
export const delSave=id=>{const d=data();d.saves=d.saves.filter(s=>s.id!=id);put(d)};
export const addMap=m=>{const d=data();d.maps=[m,...d.maps].slice(0,12);put(d)};
export const delMap=id=>{const d=data();d.maps=d.maps.filter(m=>m.id!=id);put(d)};
