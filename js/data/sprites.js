// ẢNH THẬT CHO CÔNG TRÌNH / CÂY / NGƯỜI. Để trống = game vẽ khối màu tạm. Thêm ảnh vào thư mục assets/ rồi khai báo ở đây là xong, KHÔNG cần sửa code khác.
// Ảnh PNG nền trong suốt. Quy ước: đáy giữa ảnh nằm đúng đỉnh dưới của hình thoi nền công trình; chiều rộng ảnh vẽ = rộng hình thoi nền × scale (nên vẽ ảnh rộng đúng (w+h)×32 px cho công trình w×h ô).
// Công trình có 3 giai đoạn: src[0] = vừa đặt (móng) · src[1] = xây dở · src[2] = hoàn thành. Chỉ có 1 ảnh (src: 'a.png') thì dùng cho cả 3 giai đoạn.
Game.sprites = {
  // house1: { src: ['assets/house1_0.png', 'assets/house1_1.png', 'assets/house1_2.png'] },
  // field:  { src: 'assets/field.png', scale: 1, dy: 0 },          // dy: nâng/hạ ảnh (pixel)
  // _site:  { src: ['assets/site_0.png', 'assets/site_1.png'] },  // ảnh công trường CHUNG cho mọi công trình chưa có ảnh riêng (giai đoạn 0 và 1)
  // _tree:  { src: 'assets/pine.png' },                           // cây
  // _person:{ src: 'assets/person.png' },                         // người (đứng 1 tư thế, game tự nhún khi đi)
};
Game.img = src => { const c = Game._imgs || (Game._imgs = {}); if (!c[src]) c[src] = Object.assign(new Image(), { src }); return c[src]; };
Game.drawSprite = (ctx, key, stage, x, y, width) => {   // vẽ ảnh nếu đã khai báo và đã nạp xong; trả về true nếu đã vẽ
  const s = Game.sprites[key]; if (!s) return false;
  const src = Array.isArray(s.src) ? s.src[Math.min(stage, s.src.length - 1)] : s.src; if (!src) return false;
  const im = Game.img(src); if (!im.complete || !im.naturalWidth) return false;
  const w = width * (s.scale || 1), h = w * im.naturalHeight / im.naturalWidth;
  ctx.drawImage(im, x - w / 2, y - h + (s.dy || 0), w, h); return true;
};
