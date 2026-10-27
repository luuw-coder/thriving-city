// Vòng lặp: cập nhật mô phỏng rồi vẽ. Chỉ lo việc chạy khung hình.
Game.renderer = {
  canvas: null, ctx: null, running: false, mouse: { x: 0, y: 0 }, ready: false, last: 0,
  init() {
    this.canvas = document.getElementById('game'); this.ctx = this.canvas.getContext('2d');
    if (!this.ready) {
      this.ready = true; Game.camera.attach(this.canvas);
      addEventListener('resize', () => this.resize());
      this.canvas.addEventListener('pointermove', e => { this.mouse = { x: e.clientX, y: e.clientY }; Game.multiplayer.cursor(e.clientX, e.clientY); });
    }
    this.resize();
    const m = Game.iso.toScreen(Game.config.MAP_W / 2, Game.config.MAP_H / 2);
    Game.camera.x = m.x; Game.camera.y = m.y; Game.camera.zoom = 1;
  },
  resize() { this.canvas.width = innerWidth; this.canvas.height = innerHeight; },
  tileAt(cx, cy) {
    const w = Game.camera.screenToWorld(cx, cy, this.canvas.width, this.canvas.height), t = Game.iso.toTile(w.x, w.y), C = Game.config;
    return (t.x >= 0 && t.y >= 0 && t.x < C.MAP_W && t.y < C.MAP_H) ? t : null;
  },
  start() { if (!this.running) { this.running = true; this.last = performance.now(); requestAnimationFrame(t => this.frame(t)); } },
  stop() { this.running = false; },
  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    Game.sim.update(dt); Game.people.update(dt); Game.fx.update(dt);
    const { ctx, canvas } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#5fb3a5'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    Game.camera.apply(ctx, canvas.width, canvas.height);
    Game.world.draw(ctx); Game.fx.syncOverlay(canvas.width, canvas.height);
    const rc = Game.multiplayer.remote;   // con trỏ của người chơi kia
    if (rc && Date.now() - rc.t < 5000) {
      const p = Game.iso.toScreen(rc.x, rc.y), z = 1 / Game.camera.zoom; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(z, z);
      ctx.fillStyle = Game.multiplayer.remoteColor(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 18); ctx.lineTo(10, 12); ctx.lineTo(18, 15); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.font = 'bold 12px sans-serif'; ctx.fillText(Game.multiplayer.remoteName(), 20, 30); ctx.restore();
    }
    const t = this.tileAt(this.mouse.x, this.mouse.y), tool = Game.state.tool;
    if (t) {
      const d = tool && tool !== 'demolish' ? Game.buildingDefs[tool] : null;
      if (d) { const ok = Game.world.canPlace(d, t.x, t.y);   // bóng xanh/đỏ cho biết đặt được hay không
        for (let i = 0; i < d.w; i++) for (let j = 0; j < d.h; j++) { Game.map.tilePath(ctx, t.x + i, t.y + j); ctx.fillStyle = ok ? 'rgba(80,220,100,.45)' : 'rgba(230,70,60,.5)'; ctx.fill(); } }
      else { Game.map.tilePath(ctx, t.x, t.y); ctx.strokeStyle = tool === 'demolish' ? '#e04a3a' : '#e0b050'; ctx.lineWidth = 2; ctx.stroke(); }
    }
    document.getElementById('coord').textContent = t ? `Ô ${t.x},${t.y}` : '';
    Game.hud.update(dt);
    requestAnimationFrame(n => this.frame(n));
  }
};
