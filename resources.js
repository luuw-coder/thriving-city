// Quản lý tài nguyên: chuỗi chế biến, kho bãi, bán hàng ở chợ.
export const RES={f:'Lương thực',w:'Gỗ',s:'Đá',c:'Tiền',fl:'Bột',bk:'Bánh',si:'Tơ',lu:'Lụa'};
// b = công trình, in = nguyên liệu tiêu hao mỗi tháng, out = sản phẩm làm ra
export const CHAIN=[
 {b:'m',in:{f:6},out:{fl:6}},     // lúa -> bột
 {b:'o',in:{fl:4},out:{bk:6}},    // bột -> bánh
 {b:'z',in:{},out:{si:3}},        // trại tằm -> tơ
 {b:'v',in:{si:2},out:{lu:1}}];   // tơ -> lụa
export const storage=n=>200+250*(n.k||0);
export function run(G,n,E={eff:{}}){const L=[],g=r=>G[r]||0,cnt=b=>{let s=0;for(const i in E.eff)if(G.g[i]==b)s+=E.eff[i];return Math.round(s)};
 for(const c of CHAIN){for(let k=cnt(c.b);k>0;k--){
   if(c.b=='m'&&G.f<60)break;                       // giữ lại lương thực cho dân
   if(!Object.entries(c.in).every(([r,v])=>g(r)>=v))break;
   for(const[r,v]of Object.entries(c.in))G[r]=g(r)-v;
   for(const[r,v]of Object.entries(c.out))G[r]=g(r)+v}}
 const mk=cnt('d');                                   // chợ bán bánh và lụa
 if(mk){const sb=Math.min(g('bk'),6*mk),sl=Math.min(g('lu'),2*mk);G.bk=g('bk')-sb;G.lu=g('lu')-sl;
  const gain=(sb*2+sl*12)*(G.rs&&G.rs.thuong?1.3:1);if(gain){G.c+=gain;G.h=Math.min(100,G.h+sb*.3)}}
 const cap=storage(n);
 for(const r of['f','w','s','fl','bk','si','lu'])if(g(r)>cap){G[r]=cap;if(r=='f'||r=='w')L.push('Kho đầy, '+RES[r]+' bị thất thoát. Hãy xây thêm Kho!')}
 return L}
