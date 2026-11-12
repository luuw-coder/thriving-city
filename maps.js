// Bản đồ có sẵn + bộ sinh bản đồ. w/f/r = tỉ lệ nước/rừng/đá, rm = độ hung hãn của giặc, gl = mục tiêu dân số
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
export const PRESETS=[
 {id:'giangnam',n:'Giang Nam thủy hương',d:'Sông hồ chằng chịt, đất phù sa. Dễ chơi, coi chừng nước dâng.',lv:'Dễ',size:20,seed:11,w:.3,f:.12,r:.02,rm:.8,gl:130,c:160},
 {id:'bienkinh',n:'Đồng bằng Biện Kinh',d:'Đất rộng, một con sông lớn. Cân bằng.',lv:'Vừa',size:24,seed:23,w:.12,f:.16,r:.03,rm:1,gl:200,c:140},
 {id:'bienai',n:'Biên ải phương Bắc',d:'Núi đá, rừng thưa, giặc ngoại xâm liên miên.',lv:'Khó',size:22,seed:7,w:.07,f:.1,r:.13,rm:1.6,gl:170,c:120},
 {id:'rand',n:'Ngẫu nhiên',d:'Mỗi lần chơi một bản đồ khác.',lv:'Vừa',size:20,w:.2,f:.14,r:.04,rm:1,gl:150,c:140}];
export function gen(p){
 const n=p.size,r=rng(p.seed||7),a=r()*6,b=r()*6,c=r()*6,v=[];
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)v.push(Math.sin(x*.5+a)*Math.cos(y*.42+b)+Math.sin((x-y)*.31+c)+r()*.15);
 const o=[...v.keys()].sort((i,j)=>v[j]-v[i]),water=new Set(o.slice(0,Math.round(n*n*p.w)));let g='';
 for(let i=0;i<n*n;i++){const m=Math.hypot(i%n-n/2,(i/n|0)-n/2)<3;g+=(!m&&water.has(i))?'2':r()<p.f?'1':r()<p.r?'3':'0'}
 return g}
export const COL={0:'#d4c48c',1:'#3f7d4e',2:'#6fc2b6',3:'#9a9a94'};
export function preview(cv,g,n){const x=cv.getContext('2d'),t=cv.width/n;for(let i=0;i<n*n;i++){x.fillStyle=COL[g[i]];x.fillRect(i%n*t,(i/n|0)*t,t+.5,t+.5)}}
export const specOf=m=>({id:m.id,n:m.size,g:m.g||gen(m.id=='rand'?{...m,seed:Date.now()%99991}:m),rm:m.rm||1,gl:m.gl||150,c:m.c||140});
