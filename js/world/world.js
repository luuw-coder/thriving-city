// Thế giới: danh sách vật thể + bảng ô bị chiếm. Cây và công trình đều là "vật thể".
Game.world = {
  objects: [], occ: {},
  key: (x, y) => x + ',' + y,
  load() {
    Game.map.init(); Game.sim.reset(); this.objects = []; this.occ = {};
    for (const p of Game.placements) this.add({ type: p.type, x: p.x, y: p.y, w: 1, h: 1 });
    for (const p of Game.startBuildings) this.place(p.id, p.x, p.y, true);
    Game.econ.init();
  },
  loadData(d) {
    Game.map.init(); Game.sim.reset(); this.objects = []; this.occ = {};
    for (const e of d.objs) {
      if (e.t === 'tree') { this.add({ type: 'tree', x: e.x, y: e.y, w: 1, h: 1 }); continue; }
      const o = this.place(e.t, e.x, e.y, true); if (!o) continue;
      o.prog = e.prog; o.hp = e.hp; if (e.want !== undefined) o.want = e.want;
      if (e.fire) { Game.sim.ignite(o); if (o.fire) o.fire.i = e.fire; }
    }
    Game.state.day = d.day; Object.assign(Game.state.res, d.res); Game.econ.restore(d.pop);
  },
  add(o) {
    this.objects.push(o);
    for (let i = 0; i < o.w; i++) for (let j = 0; j < o.h; j++) this.occ[this.key(o.x + i, o.y + j)] = o;
    this.objects.sort((a, b) => (a.x + a.y + a.w + a.h) - (b.x + b.y + b.w + b.h));
    return o;
  },
  remove(o) {
    this.objects = this.objects.filter(q => q !== o);
    for (let i = 0; i < o.w; i++) for (let j = 0; j < o.h; j++) delete this.occ[this.key(o.x + i, o.y + j)];
  },
  canPlace(d, x, y) {
    const C = Game.config;
    if (x < 0 || y < 0 || x + d.w > C.MAP_W || y + d.h > C.MAP_H) return false;
    for (let i = 0; i < d.w; i++) for (let j = 0; j < d.h; j++) if (this.occ[this.key(x + i, y + j)]) return false;
    return true;
  },
  place(id, x, y, instant) {
    const d = Game.buildingDefs[id];
    if (!d || !this.canPlace(d, x, y)) return null;
    return this.add({ type: 'building', def: d, x, y, w: d.w, h: d.h, prog: instant ? 1 : 0, hp: 100, fire: null });
  },
  draw(ctx) {
    Game.map.draw(ctx);
    for (const o of this.objects) Game.objectTypes[o.type].draw(ctx, o);
    Game.fx.drawAll(ctx);
  }
};
