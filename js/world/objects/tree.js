// CÂY — chỉ lo việc "cây trông như thế nào". Vị trí nằm ở js/data/placements.js
Game.registerObject('tree', {
  draw(ctx, obj) {
    const c = Game.iso.toScreen(obj.x + 0.5, obj.y + 0.5); // tâm ô cây đứng
    ctx.fillStyle = '#5b3a1e';
    ctx.fillRect(c.x - 4, c.y - 22, 8, 24);                  // thân
    ctx.fillStyle = '#2f6b2f';
    ctx.beginPath(); ctx.arc(c.x, c.y - 34, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f8a3a';
    ctx.beginPath(); ctx.arc(c.x - 6, c.y - 40, 12, 0, Math.PI * 2); ctx.fill();
  }
});
