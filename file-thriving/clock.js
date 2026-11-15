// Vòng lặp thời gian và bốn mùa. Mỗi tick = 1 tháng, 12 tháng = 1 năm.
export const SN=['Xuân','Hạ','Thu','Đông'];
export const fm=[1,1.1,1.4,.4];      // hệ số sản lượng lương thực theo mùa
export const fi=[.8,1.2,1.5,2];      // hệ số nguy cơ hỏa hoạn theo mùa
export const season=m=>m%12/3|0;
export const date=m=>({year:(m/12|0)+1,month:m%12+1,season:SN[season(m)]});
export const heating=(m,p)=>season(m)==3?p/20:0;   // mùa đông: mỗi 20 dân đốt 1 gỗ/tháng
