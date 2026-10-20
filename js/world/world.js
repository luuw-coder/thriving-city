// Thế giới: tạo vật thể từ placements, sắp xếp thứ tự vẽ (xa vẽ trước, gần vẽ sau).
Game.world = {
  objects: [],
  load() {
    Game.map.init();
    this.objects = [];
    for (const p of Game.placements) {
      if (!Game.objectTypes[p.type]) { console.warn('Chưa có loại vật thể:', p.type); continue; }
      this.objects.push({ ...p });
    }
    this.objects.sort((a, b) => (a.x + a.y) - (b.x + b.y));
  },
  draw(ctx) {
    Game.map.draw(ctx);
    for (const o of this.objects) Game.objectTypes[o.type].draw(ctx, o);
  }
};
