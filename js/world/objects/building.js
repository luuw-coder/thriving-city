// Vẽ công trình tạm bằng khối màu. Muốn dùng ảnh thật: sửa hàm draw này để vẽ ảnh d.img.
function shade(h, f) {
  const n = parseInt(h.slice(1), 16);
  const r = Math.min(255, (n >> 16) * f) | 0, g = Math.min(255, ((n >> 8) & 255) * f) | 0, b = Math.min(255, (n & 255) * f) | 0;
  return `rgb(${r},${g},${b})`;
}
Game.registerObject('building', {
  draw(ctx, o) {
    const d = o.def, I = Game.iso;
    const a = I.toScreen(o.x, o.y), b = I.toScreen(o.x + o.w, o.y), c = I.toScreen(o.x + o.w, o.y + o.h), e = I.toScreen(o.x, o.y + o.h);
    const done = o.prog >= 1, h = d.z * (done ? 1 : 0.25 + 0.5 * o.prog);
    const up = p => ({ x: p.x, y: p.y - h });
    const poly = (p, col) => { ctx.beginPath(); p.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
    const dk = 1 - (100 - o.hp) / 200;                  // hư hỏng thì sẫm màu
    if (d.z <= 3) poly([a, b, c, e], shade(d.c, dk * (done ? 1 : .7)));
    else {
      poly([e, c, up(c), up(e)], shade(d.c, .85 * dk));
      poly([c, b, up(b), up(c)], shade(d.c, .7 * dk));
      poly([up(a), up(b), up(c), up(e)], done ? shade('#7a2b20', dk) : shade(d.c, .6));
    }
    if (!done) {
      ctx.setLineDash([4, 3]); ctx.strokeStyle = '#e0b050'; ctx.lineWidth = 1.5;
      ctx.beginPath(); [a, b, c, e].forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
      const m = I.toScreen(o.x + o.w / 2, o.y + o.h / 2);
      ctx.fillStyle = '#000a'; ctx.fillRect(m.x - 16, m.y - h - 16, 32, 5);
      ctx.fillStyle = '#e0b050'; ctx.fillRect(m.x - 16, m.y - h - 16, 32 * o.prog, 5);
    }
  }
});
