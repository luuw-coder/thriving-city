// Vòng lặp vẽ hình. Chỉ lo việc vẽ, không chứa luật game.
Game.renderer = {
  canvas: null, ctx: null, running: false, mouse: { x: 0, y: 0 }, ready: false,
  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    if (!this.ready) {
      this.ready = true;
      Game.camera.attach(this.canvas);
      window.addEventListener('resize', () => this.resize());
      this.canvas.addEventListener('pointermove', e => { this.mouse = { x: e.clientX, y: e.clientY }; });
    }
    this.resize();
    const mid = Game.iso.toScreen(Game.config.MAP_W / 2, Game.config.MAP_H / 2);
    Game.camera.x = mid.x; Game.camera.y = mid.y; Game.camera.zoom = 1;
  },
  resize() { this.canvas.width = innerWidth; this.canvas.height = innerHeight; },
  start() { if (!this.running) { this.running = true; requestAnimationFrame(() => this.frame()); } },
  stop() { this.running = false; },
  frame() {
    if (!this.running) return;
    const { ctx, canvas } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#14110d'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    Game.camera.apply(ctx, canvas.width, canvas.height);
    Game.world.draw(ctx);
    const w = Game.camera.screenToWorld(this.mouse.x, this.mouse.y, canvas.width, canvas.height);
    const t = Game.iso.toTile(w.x, w.y);
    const inMap = t.x >= 0 && t.y >= 0 && t.x < Game.config.MAP_W && t.y < Game.config.MAP_H;
    if (inMap) {
      Game.map.tilePath(ctx, t.x, t.y);
      ctx.strokeStyle = '#e0b050'; ctx.lineWidth = 2; ctx.stroke();
    }
    document.getElementById('coord').textContent = inMap ? `Ô: x=${t.x}, y=${t.y}` : 'Ô: ngoài bản đồ';
    requestAnimationFrame(() => this.frame());
  }
};
