// Lưới đô thị: láng giềng, khu chức năng, mạng đường (nền tảng cho vận chuyển hàng hóa giữa các khu).
export const nb=(i,N)=>[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[i%N+a,(i/N|0)+b]).filter(([a,b])=>a>=0&&a<N&&b>=0&&b<N).map(([a,b])=>b*N+a);
export const ZONES={res:'Khu dân cư',agri:'Khu nông nghiệp',ind:'Khu thủ công và kho',com:'Khu thương mại',adm:'Khu hành chính, dịch vụ'};
const Z={a:'res',A:'res',b:'agri',z:'agri',c:'ind',q:'ind',m:'ind',o:'ind',v:'ind',k:'ind',d:'com',e:'com',f:'adm',h:'adm',t:'adm',j:'adm',y:'adm',w:'adm'};
export const zoneOf=t=>Z[t]||null;
export const roadAdj=(g,i,N)=>nb(i,N).some(j=>g[j]=='r');
// Các cụm đường liền nhau (BFS). Dùng sau này để tính vận chuyển giữa kho và công trình.
export function roadNets(g,N){const seen=new Set(),nets=[];
 for(let i=0;i<N*N;i++){if(g[i]!='r'||seen.has(i))continue;const q=[i],net=[];seen.add(i);
  while(q.length){const c=q.pop();net.push(c);for(const j of nb(c,N))if(g[j]=='r'&&!seen.has(j)){seen.add(j);q.push(j)}}nets.push(net)}
 return nets}
