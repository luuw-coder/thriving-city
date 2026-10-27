// CÂY THÔNG — chỉ lo việc "cây trông như thế nào". Muốn dùng ảnh: khai báo _tree trong js/data/sprites.js.
Game.registerObject('tree', {
  draw(ctx, o) {
    const c = Game.iso.toScreen(o.x + .5, o.y + .5); if (!Game.camera.sees(c.x, c.y - 30, 40, 60)) return;
    if (!Game.drawSprite(ctx, '_tree', 0, c.x, c.y + 4, 64)) {
      const k = .8 + ((o.x * 7 + o.y * 13) % 5) / 10, g = ['#2f5d4a', '#3d7059', '#4f8567'];
      ctx.fillStyle = '#0002'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 1, 12 * k, 5 * k, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#6b4a2f'; ctx.fillRect(c.x - 2, c.y - 14 * k, 4, 16 * k);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = g[i]; ctx.beginPath(); ctx.ellipse(c.x + (i === 1 ? 2 : -1), c.y - (13 + i * 10) * k, (17 - i * 3.5) * k, (8 - i * .8) * k, 0, 0, 7); ctx.fill(); }
    }
    if (o.mark) { ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(c.x, c.y - 52, 8, 0, 7); ctx.fill(); ctx.font = '11px sans-serif'; ctx.fillText('🪓', c.x - 6, c.y - 48); }   // cây đã đánh dấu chặt
  }
});
