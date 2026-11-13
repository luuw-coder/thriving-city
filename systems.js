// Nghiên cứu (3 nhánh), chiếu chỉ, báo cáo năm, cảnh báo có nguyên nhân, chuẩn hóa trạng thái.
export const BR=['Dân sinh','Lao tác','Phồn vinh'];
export const TECH=[
 {id:'ngoi',b:0,n:'Nhà ngói',c:20,req:'',d:'Cho nâng nhà tranh lên nhà ngói.'},
 {id:'gieng',b:0,n:'Giếng đá',c:15,req:'',d:'Giếng dập lửa trong 3 ô thay vì 2.'},
 {id:'cuutro',b:0,n:'Quỹ cứu trợ',c:25,req:'ngoi',d:'Đói kém làm lòng dân tụt chậm hơn.'},
 {id:'thanh',b:0,n:'Tường thành',c:40,req:'gieng',d:'Sức giặc giảm 25%.'},
 {id:'cay',b:1,n:'Cày bừa',c:20,req:'',d:'Ruộng +20% sản lượng.'},
 {id:'thuy',b:1,n:'Thủy lợi',c:30,req:'cay',d:'Ruộng +15%, không bị nước dâng.'},
 {id:'cho',b:2,n:'Chợ lớn',c:20,req:'',d:'Thu nhập chợ +25%.'},
 {id:'duong',b:2,n:'Đường đá',c:25,req:'cho',d:'Đường tăng sản lượng +40% thay vì +25%.'},
 {id:'thuong',b:2,n:'Thương hội',c:35,req:'duong',d:'Bán bánh và lụa giá +30%.'}];
export function research(G,i){const t=TECH[i];if(!t)return'';if(G.rs[t.id])return'Đã nghiên cứu rồi.';
 if(t.req&&!G.rs[t.req])return'Cần nghiên cứu "'+TECH.find(x=>x.id==t.req).n+'" trước.';
 if(G.rp<t.c)return`Chưa đủ điểm nghiên cứu (${G.rp|0}/${t.c}). Xây và cấp người cho Học đường.`;
 G.rp-=t.c;G.rs[t.id]=1;return'Đã nghiên cứu: '+t.n+'.'}
export function quest(G,n,L){
 const q=G.q;
 if(q){const ok=q.t=='f'?G.f>=q.n:q.t=='p'?G.p>=q.n:(n[q.b]||0)>=q.n;
  if(ok){G.c+=q.r;G.qd=(G.qd||0)+1;L.push('Chiếu chỉ hoàn thành! Triều đình thưởng '+q.r+' tiền.');G.q=null}
  else if(G.m>=q.d){G.h=Math.max(0,G.h-10);G.qf=(G.qf||0)+1;L.push('Chiếu chỉ thất bại, lòng dân giảm.');G.q=null}}
 if(!G.q&&G.m%6==3){const T=[{t:'f',n:150+G.m*4,x:'Tích trữ {n} lương thực'},{t:'p',n:G.p+25,x:'Đưa dân số lên {n}'},
  {t:'b',b:'d',n:(n.d||0)+2,x:'Có {n} chợ'},{t:'b',b:'f',n:(n.f||0)+1,x:'Có {n} học đường'},{t:'b',b:'j',n:(n.j||0)+1,x:'Có {n} đội cứu hỏa'}],a=T[(G.m/6|0)%T.length];
  G.q={t:a.t,b:a.b||'',n:a.n,d:G.m+10,r:40+G.m*2,x:a.x.replace('{n}',a.n)};L.push('Chiếu chỉ mới: '+G.q.x+'.')}}
export function report(G){
 if(G.m%12!=0||G.m==0)return;const y0=G.y0||{p:8,c:140,f:50};
 const cc=G.sv?'Vấn đề lớn nhất: nạn đói. Hãy tăng ưu tiên Nông nghiệp và xây thêm ruộng, kho.':G.h<45?'Vấn đề lớn nhất: lòng dân thấp. Xây miếu, quán trọ, học đường hoặc giảm chính sách nặng.':(G.st&&G.st.nh>5)?'Nhiều người nhàn rỗi. Xây thêm công trình để tạo việc làm.':G.c<40?'Ngân khố cạn. Giảm số vị trí lao động (tiền công) hoặc xây thêm chợ.':'Thành phố ổn định. Năm tới hãy mở rộng chuỗi sản xuất và nghiên cứu.';
 G.rep={y:G.m/12,p0:y0.p,p1:G.p,c0:Math.floor(y0.c),c1:Math.floor(G.c),f0:Math.floor(y0.f),f1:Math.floor(G.f),b:G.bd||0,fc:G.fc||0,qd:G.qd||0,qf:G.qf||0,h:Math.floor(G.h),cc};
 G.bd=0;G.fc=0;G.qd=0;G.qf=0;G.y0={p:G.p,c:G.c,f:G.f}}
export function alerts(G,E,d){const a=[];
 if(G.f<G.p*.12*d*3)a.push('Thiếu lương thực: dự trữ chỉ đủ vài tháng. Xây thêm ruộng hoặc đưa Nông nghiệp lên đầu bảng Lao động.');
 if(E.need>E.total)a.push(`Thiếu lao động: cần ${E.need}, chỉ có ${E.total}. Giảm số vị trí hoặc xây thêm nhà.`);
 if(E.pool>3)a.push(E.pool+' người nhàn rỗi: xây thêm công trình tạo việc làm.');
 if(G.c<30)a.push('Ngân khố gần cạn: giảm vị trí lao động hoặc xây thêm chợ.');
 if(G.cap&&G.p>=G.cap)a.push('Nhà đã đầy: xây thêm nhà để thu hút dân.');
 return a}
export const norm=G=>{G.cn=G.cn||'0'.repeat(G.n*G.n);G.pr=G.pr||[0,1,2,3,4];G.sl=G.sl||{};G.rs=G.rs||{};G.rp=G.rp||0;return G};
