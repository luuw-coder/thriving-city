// Thế giới: danh sách vật thể + bảng ô bị chiếm. Cây và công trình đều là "vật thể".
Game.world = {
  objects: [], occ: {},
  key: (x, y) => x + ',' + y,
  sort() { this.objects.sort((a, b) => (a.x + a.y + a.w + a.h) - (b.x + b.y + b.w + b.h)); },
  reset(mapId) { Game.map.init(mapId); Game.sim.reset(); this.objects = []; this.occ = {}; },
  load(mapId) {   // ván mới: chỉ có cây; người chơi phải đặt Trấn Sở trước
    this.reset(mapId);
    for (const t of Game.map.trees) this.add({ type: 'tree', x: t[0], y: t[1], w: 1, h: 1 }, true);
    this.sort();
  },
  loadData(d) {
    this.reset(d.map);
    for (const e of d.objs) {
      if (e.t === 'tree') { if (!Game.map.isWater(e.x, e.y)) this.add({ type: 'tree', x: e.x, y: e.y, w: 1, h: 1 }, true); continue; }
      const o = this.place(e.t, e.x, e.y, true, true); if (!o) continue;
      o.prog = Number.isFinite(e.prog) ? e.prog : 1; o.hp = Number.isFinite(e.hp) ? e.hp : 100; if (Number.isFinite(e.want)) o.want = e.want;
      if (e.fire) { Game.sim.ignite(o, true); if (o.fire) o.fire.i = +e.fire || 12; }
    }
    this.sort();
    const s = Game.state; s.day = d.day | 0; for (const k in s.res) if (Number.isFinite(d.res[k])) s.res[k] = d.res[k];
    s.started = !!d.started; s.speed = s.started ? 1 : 0; Game.econ.restore(Math.min(d.pop | 0, Game.MAX_POP));
  },
  add(o, defer) {
    this.objects.push(o);
    for (let i = 0; i < o.w; i++) for (let j = 0; j < o.h; j++) this.occ[this.key(o.x + i, o.y + j)] = o;
    if (!defer) this.sort();
    return o;
  },
  remove(o) {
    this.objects = this.objects.filter(q => q !== o);
    for (let i = 0; i < o.w; i++) for (let j = 0; j < o.h; j++) delete this.occ[this.key(o.x + i, o.y + j)];
  },
  canPlace(d, x, y) {   // không đặt được xuống nước, ra ngoài bản đồ, hoặc đè lên công trình khác (cây thì tự chặt)
    for (let i = 0; i < d.w; i++) for (let j = 0; j < d.h; j++) {
      if (Game.map.isWater(x + i, y + j)) return false;
      const o = this.occ[this.key(x + i, y + j)]; if (o && o.type !== 'tree') return false;
    }
    return true;
  },
  place(id, x, y, instant, defer) {
    const d = Game.buildingDefs[id];
    if (!d || !this.canPlace(d, x, y)) return null;
    for (let i = 0; i < d.w; i++) for (let j = 0; j < d.h; j++) { const t = this.occ[this.key(x + i, y + j)]; if (t) this.remove(t); }
    return this.add({ type: 'building', def: d, x, y, w: d.w, h: d.h, prog: instant ? 1 : 0, hp: 100, fire: null }, defer);
  },
  draw(ctx) {
    Game.map.draw(ctx);
    for (const o of this.objects) Game.objectTypes[o.type].draw(ctx, o);
    Game.fx.drawAll(ctx);
  }
};
