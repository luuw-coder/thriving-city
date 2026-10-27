// Thế giới: danh sách vật thể + bảng ô bị chiếm. Cây và công trình đều là "vật thể".
Game.world = {
  objects: [], occ: {}, ver: 0,   // ver tăng mỗi khi thế giới đổi (để người tính lại đường đi)
  key: (x, y) => x + ',' + y,
  sort() { this.objects.sort((a, b) => (a.x + a.y + a.w + a.h) - (b.x + b.y + b.w + b.h)); },
  reset(mapId) { Game.map.init(mapId); Game.sim.reset(); this.objects = []; this.occ = {}; this.ver++; },
  load(mapId) {   // ván mới: chỉ có cây; người chơi phải đặt Trấn Sở trước
    this.reset(mapId);
    for (const t of Game.map.trees) this.add({ type: 'tree', x: t[0], y: t[1], w: 1, h: 1 }, true);
    this.sort();
  },
  loadData(d) {
    const keep = Game.multiplayer.mode === 'guest' ? Game.state.people : null;   // khách giữ lại người cũ để không bị giật vị trí
    this.reset(d.map);
    for (const e of d.objs) {
      if (e.t === 'tree') { if (!Game.map.isWater(e.x, e.y)) this.add({ type: 'tree', x: e.x, y: e.y, w: 1, h: 1, mark: !!e.m }, true); continue; }
      const o = this.place(e.t, e.x, e.y, true, true); if (!o) continue;
      o.prog = Number.isFinite(e.prog) ? e.prog : 1; o.hp = Number.isFinite(e.hp) ? e.hp : 100; if (Number.isFinite(e.want)) o.want = e.want;
      if (e.fire) { Game.sim.ignite(o, true); if (o.fire) o.fire.i = +e.fire || 12; }
    }
    this.sort();
    const s = Game.state; s.day = d.day | 0; for (const k in s.res) if (Number.isFinite(d.res[k])) s.res[k] = d.res[k];
    s.started = !!d.started; s.speed = s.started ? 1 : 0; s.tax = Number.isInteger(d.tax) && d.tax >= 0 && d.tax < Game.TAX.length ? d.tax : 2; Game.econ.restore(Math.min(d.pop | 0, Game.MAX_POP), keep);
  },
  add(o, defer) {
    this.objects.push(o); this.ver++;
    for (let i = 0; i < o.w; i++) for (let j = 0; j < o.h; j++) this.occ[this.key(o.x + i, o.y + j)] = o;
    if (!defer) this.sort();
    return o;
  },
  remove(o) {
    o.gone = true; this.ver++; this.objects = this.objects.filter(q => q !== o);
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
    const L = this.objects.map(o => [o.x + o.y + o.w + o.h - 2, 0, o]);   // công trình và người cùng xếp theo độ sâu để người đi vòng sau nhà
    for (const p of Game.people.visible()) L.push([Math.floor(p.x) + Math.floor(p.y) + .5, 1, p]);
    L.sort((a, b) => a[0] - b[0]);
    for (const e of L) e[1] ? Game.people.drawOne(ctx, e[2]) : Game.objectTypes[e[2].type].draw(ctx, e[2]);
    Game.fx.drawAll(ctx); Game.people.drawLens(ctx);
  }
};
