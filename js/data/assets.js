// ẢNH ĐỘNG CHO ĐÁM CHÁY. Đổi mode và src là xong, không cần sửa code khác.
//  'procedural' : lửa vẽ bằng code (mặc định)
//  'sprite'     : 1 file PNG nền trong suốt, các khung xếp thành 1 dải ngang (frames khung, mỗi khung fw×fh) — nhẹ nhất, nên dùng
//  'gif'        : file .gif nền trong suốt
//  'video'      : file .webm có kênh trong suốt (mp4 không có nền trong suốt nên sẽ hiện khung đen)
// w,h = kích thước hiển thị gốc (pixel) của đám cháy; game tự phóng to/nhỏ theo độ lớn của lửa và mức zoom.
Game.fxAssets = { fire: { mode: 'procedural', src: 'assets/fx/fire.png', w: 64, h: 96, frames: 8, fps: 10, fw: 64, fh: 96 } };
