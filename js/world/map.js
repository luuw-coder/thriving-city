// Nền đất: lưới ô cỏ. Sau này thêm nước, đường, núi tại đây.
Game.map = {
  tiles: [],
  init() {
    const { MAP_W, MAP_H } = Game.config;
    this.tiles = [];
    for (let y = 0; y < MAP_H; y++) {
      const row = [];
      for (let x = 0; x < MAP_W; x++) row.push({ type: 'grass', shade: (x * 7 + y * 13) % 5 });
      this.tiles.push(row);
    }
  },
  tilePath(ctx, x, y) {
    const p = [Game.iso.toScreen(x, y), Game.iso.toScreen(x + 1, y),
               Game.iso.toScreen(x + 1, y + 1), Game.iso.toScreen(x, y + 1)];
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(p[i].x, p[i].y);
    ctx.closePath();
  },
  draw(ctx) {
    const { MAP_W, MAP_H } = Game.config;
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
      const t = this.tiles[y][x];
      this.tilePath(ctx, x, y);
      ctx.fillStyle = `hsl(95, 32%, ${34 + t.shade}%)`;
      ctx.fill();
    }
  }
};
