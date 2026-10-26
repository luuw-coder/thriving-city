// Đổi qua lại giữa toạ độ ô (x, y) và toạ độ màn hình đẳng phối.
Game.iso = {
  toScreen(x, y) {
    const c = Game.config;
    return { x: (x - y) * c.TILE_W / 2, y: (x + y) * c.TILE_H / 2 };
  },
  toTileF(sx, sy) { const c = Game.config, a = sx / (c.TILE_W / 2), b = sy / (c.TILE_H / 2); return { x: (a + b) / 2, y: (b - a) / 2 }; },
  toTile(sx, sy) {
    const c = Game.config;
    const a = sx / (c.TILE_W / 2), b = sy / (c.TILE_H / 2);
    return { x: Math.floor((a + b) / 2), y: Math.floor((b - a) / 2) };
  }
};
