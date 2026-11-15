// Lao động theo đặc tả: bảng Công việc (thứ tự ưu tiên ngành) + bảng Vị trí (số chỗ làm mỗi loại công trình).
export const SECTORS=['Nông nghiệp','Khai thác','Thủ công','Thương thị','Dân chính'];
// công trình: [ngành, số vị trí mặc định]
export const JOBS={b:[0,2],z:[0,2],c:[1,2],q:[1,3],m:[2,2],o:[2,2],v:[2,3],k:[2,1],d:[3,2],e:[3,3],f:[4,2],h:[4,1],t:[4,2],j:[4,3],y:[4,2],n:[4,2]};
export const slots=(G,t)=>Math.max(0,Math.min(6,(G.sl&&G.sl[t]!=null)?G.sl[t]:JOBS[t][1]));
export function allocate(G,N){
 const total=Math.floor(G.p*.7),eff={},by=SECTORS.map(()=>({need:0,got:0})),list=[];let pool=total,need=0;
 for(let i=0;i<N*N;i++){const t=G.g[i],j=JOBS[t];if(!j||G.cn[i]!='0')continue;
  const s=slots(G,t);if(!s){eff[i]=0;continue}list.push([i,j[0],s]);by[j[0]].need+=s;need+=s}
 for(const sec of G.pr)for(const[i,s,n]of list)if(s==sec){const g=Math.min(n,pool);pool-=g;eff[i]=g/n;by[s].got+=g}
 return{eff,by,pool,need,work:total-pool,total}}
