// NHÀ — ví dụ thứ hai: muốn thêm vật thể mới thì copy file này, đổi tên, đổi hình.
Game.registerObject('house', {
  draw(ctx, obj) {
    const I = Game.iso, h = 34;
    const a = I.toScreen(obj.x, obj.y),         b = I.toScreen(obj.x + 1, obj.y),
          c = I.toScreen(obj.x + 1, obj.y + 1), d = I.toScreen(obj.x, obj.y + 1);
    const poly = (pts, color) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    };
    const up = p => ({ x: p.x, y: p.y - h });
    poly([d, c, up(c), up(d)], '#c9b48a');          // tường trái
    poly([c, b, up(b), up(c)], '#a8946b');          // tường phải
    poly([up(a), up(b), up(c), up(d)], '#7a2b20');  // mái
  }
});
