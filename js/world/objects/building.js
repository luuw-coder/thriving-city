// Vẽ công trình tạm bằng khối màu. 3 giai đoạn: 0 = vừa đặt (móng, cọc) · 1 = xây dở (tường + giàn giáo) · 2 = hoàn thành.
// Muốn dùng ảnh thật cho từng giai đoạn: khai báo trong js/data/sprites.js (không cần sửa file này).
function shade(h, f) {
  const n = parseInt(h.slice(1), 16);
  const r = Math.min(255, (n >> 16) * f) | 0, g = Math.min(255, ((n >> 8) & 255) * f) | 0, b = Math.min(255, (n & 255) * f) | 0;
  return `rgb(${r},${g},${b})`;
}
Game.registerObject('building', {
  draw(ctx, o) {
    const d = o.def, I = Game.iso, st = o.prog >= 1 ? 2 : o.prog >= .5 ? 1 : 0, w = o.w, h0 = o.h, flat = d.z <= 3;
    const a = I.toScreen(o.x, o.y), b = I.toScreen(o.x + w, o.y), c = I.toScreen(o.x + w, o.y + h0), e = I.toScreen(o.x, o.y + h0), m = I.toScreen(o.x + w / 2, o.y + h0 / 2);
    const poly = (p, col, line) => { ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); if (col) { ctx.fillStyle = col; ctx.fill(); } if (line) { ctx.strokeStyle = line; ctx.lineWidth = 1.2; ctx.stroke(); } };
    const dk = 1 - (100 - o.hp) / 200, key = Game.sprites[d.id] ? d.id : st < 2 && Game.sprites._site ? '_site' : null;
    if (!(key && Game.drawSprite(ctx, key, st, c.x, c.y, (w + h0) * Game.config.TILE_W / 2))) {
      if (st === 0) {   // móng: nền đất + cọc gỗ
        poly([a, b, c, e], flat ? shade(d.c, .75) : '#b79c6e'); ctx.setLineDash([4, 3]); poly([a, b, c, e], null, '#e0b050'); ctx.setLineDash([]);
        ctx.fillStyle = '#6b4a2f'; for (const q of [a, b, c, e]) ctx.fillRect(q.x - 1.5, q.y - 9, 3, 9);
      } else if (flat) {
        poly([a, b, c, e], shade(d.c, st < 2 ? .85 : dk));
        if (d.id === 'field' && st === 2) { ctx.strokeStyle = '#8a7f3a'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 4; k++) { const p = I.toScreen(o.x + k * w / 4, o.y), q = I.toScreen(o.x + k * w / 4, o.y + h0); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); } ctx.stroke(); }
      } else if (st === 1) {   // xây dở: tường lên nửa chừng + giàn giáo
        const hh = d.z * (.3 + .5 * (o.prog - .5) * 2), up = p => ({ x: p.x, y: p.y - hh });
        poly([e, c, up(c), up(e)], shade('#d9cdb0', dk)); poly([c, b, up(b), up(c)], shade('#bcab88', dk)); poly([up(a), up(b), up(c), up(e)], '#cbbd9a');
        ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2; ctx.beginPath(); for (const q of [e, c, b]) { ctx.moveTo(q.x, q.y); ctx.lineTo(q.x, q.y - hh - 10); } ctx.stroke();
      } else {   // hoàn thành: tường + mái 4 mái
        const z = d.z, up = (p, k) => ({ x: p.x, y: p.y - k }), pk = { x: m.x, y: m.y - z - z * .5 };
        poly([e, c, up(c, z), up(e, z)], shade('#ddd1b4', dk), '#0002'); poly([c, b, up(b, z), up(c, z)], shade('#bcab88', dk), '#0002');
        poly([up(a, z), up(b, z), pk], shade(d.c, 1.1 * dk)); poly([up(e, z), up(a, z), pk], shade(d.c, dk));
        poly([up(e, z), up(c, z), pk], shade(d.c, .88 * dk), '#0003'); poly([up(c, z), up(b, z), pk], shade(d.c, .68 * dk), '#0003');
      }
    }
    if (st < 2) { ctx.fillStyle = '#000a'; ctx.fillRect(m.x - 16, m.y - d.z - 20, 32, 5); ctx.fillStyle = '#e0b050'; ctx.fillRect(m.x - 16, m.y - d.z - 20, 32 * o.prog, 5); }
  }
});
