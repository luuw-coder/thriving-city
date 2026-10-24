// Mô phỏng: thời gian, xây dựng, hỏa hoạn, người xách nước. Không đụng đến việc vẽ.
Game.sim = {
  DAY: 6, // 1 ngày trong game = 6 giây thật (ở tốc độ ×1)
  reset() {
    Game.state = { res: { G: 300, 'Đ': 150, Ga: 60, Ng: 40, S: 30, V: 20, T: 800, LT: 60, 'Sét': 0 }, day: 0, speed: 1, acc: 0,
      fires: [], carriers: [], notes: [], tool: null, sel: null, cid: 0, pid: 0, people: [], hunger: 0, title: 0, stats: { pop: 0, cap: 0, emp: 0, unemp: 0, open: 0 } };
  },
  notify(text, lv, x, y) {
    const s = Game.state; s.notes.unshift({ text, lv: lv || 'info', x, y, day: s.day });
    if (s.notes.length > 40) s.notes.pop();
  },
  list(role) { return Game.world.objects.filter(o => o.type === 'building' && o.prog >= 1 && o.def.role === role); },
  near(list, x, y) { let b = null, bd = 1e9; for (const o of list) { const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; b = o; } } return b; },
  tryBuild(id, x, y) {
    const d = Game.buildingDefs[id], r = Game.state.res, need = Game.UNLOCK[id] || 0;
    if (Game.state.stats.pop < need) { this.notify('Cần ' + need + ' dân để xây ' + d.name, 'warn', x, y); return false; }
    if (!Game.world.canPlace(d, x, y)) { this.notify('Không thể xây ở vị trí này', 'warn', x, y); return false; }
    for (const k in d.cost) if ((r[k] || 0) < d.cost[k]) { this.notify('Thiếu ' + k + ' để xây ' + d.name, 'warn', x, y); return false; }
    for (const k in d.cost) r[k] -= d.cost[k];
    Game.world.place(id, x, y, false); return true;
  },
  demolish(o) {
    if (o.type === 'building') { for (const k in o.def.cost) Game.state.res[k] += Math.floor(o.def.cost[k] / 2); this.clearFire(o); }
    Game.world.remove(o); if (Game.state.sel === o) Game.state.sel = null; Game.econ.assign();
  },
  clearFire(o) { const s = Game.state; if (o.fire) { s.fires = s.fires.filter(f => f !== o.fire); o.fire = null; } },
  ignite(o) {
    if (o.type !== 'building' || o.fire || o.prog < 1) return;
    const f = { o, i: 12, t: 0, sp: 0, disp: 0 }; o.fire = f; Game.state.fires.push(f);
    this.notify('Hỏa hoạn tại ' + o.def.name, 'red', o.x, o.y);
  },
  update(dt) {
    const s = Game.state; if (!s.speed) return;
    dt *= s.speed; s.acc += dt;
    while (s.acc >= this.DAY) { s.acc -= this.DAY; s.day++; this.newDay(); }
    this.build(dt); this.fire(dt);
  },
  newDay() {
    Game.econ.day();
    if (Game.state.day % 360 === 0 && Game.multiplayer && Game.multiplayer.mode === 'solo') Game.save.write(); // xác suất cháy mỗi ngày phụ thuộc độ dễ cháy; giếng gần làm giảm một nửa
    const winter = Math.floor(Game.state.day % 360 / 90) === 3, wells = this.list('well');
    for (const o of Game.world.objects) {
      if (o.type !== 'building' || !o.def.flam || o.fire || o.prog < 1) continue;
      const w = this.near(wells, o.x, o.y), covered = w && Math.hypot(w.x - o.x, w.y - o.y) <= w.def.range;
      if (Math.random() < 0.0005 * o.def.flam * (covered ? 0.5 : 1) * (winter ? 1.5 : 1)) this.ignite(o);
    }
  },
  build(dt) {
    for (const o of Game.world.objects) {
      if (o.type !== 'building') continue;
      if (o.prog < 1) {
        const work = 1 + Object.values(o.def.cost).reduce((a, b) => a + b, 0) / 15;
        o.prog = Math.min(1, o.prog + dt / (this.DAY * work));
        if (o.prog >= 1) { this.notify('Hoàn thành: ' + o.def.name, 'info', o.x, o.y); Game.econ.assign(); }
      } else if (!o.fire && o.hp < 100) o.hp = Math.min(100, o.hp + dt * 0.5); // hư hỏng được sửa dần (tạm thời)
    }
  },
  fire(dt) {
    const s = Game.state;
    for (const f of s.fires.slice()) {
      const o = f.o; f.t += dt; f.sp += dt; f.disp += dt;
      f.i = Math.min(100, f.i + dt * (2 + o.def.flam * 1.2));
      o.hp -= f.i * dt * 0.02;
      if (o.hp <= 0) { this.notify(o.def.name + ' bị thiêu rụi', 'red', o.x, o.y); this.demolishBurnt(o); continue; }
      if (f.sp >= 3) { f.sp = 0; // cháy lan sang công trình lân cận
        for (const q of Game.world.objects) if (q.type === 'building' && !q.fire && q.prog >= 1 && Math.hypot(q.x - o.x, q.y - o.y) <= 2.5 + o.w / 2 && Math.random() < 0.2 * (q.def.flam / 3) * (f.i / 100)) this.ignite(q);
      }
      const st = this.near(this.list('fire'), o.x, o.y), want = Math.min(4, 1 + Math.floor(f.i / 30), st ? (st.workers || 0) : 0);
      if (st && f.disp >= 0.8 && s.carriers.filter(c => c.f === f).length < want) {
        f.disp = 0; const hasWell = this.list('well').length > 0;
        s.carriers.push({ id: ++s.cid, f, x: st.x + st.w / 2, y: st.y + st.h, phase: hasWell ? 'well' : 'fire', wait: 0, load: false });
      }
    }
    for (const c of s.carriers.slice()) {
      if (!s.fires.includes(c.f)) { s.carriers.splice(s.carriers.indexOf(c), 1); continue; }
      const wells = this.list('well'), wl = this.near(wells, c.x, c.y), fo = c.f.o;
      const tx = c.phase === 'well' && wl ? wl.x + .5 : fo.x + fo.w / 2, ty = c.phase === 'well' && wl ? wl.y + 1.5 : fo.y + fo.h / 2;
      const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy);
      if (d > 1.2) { c.x += dx / d * 3.2 * dt; c.y += dy / d * 3.2 * dt; continue; }
      c.wait += dt; if (c.wait < 0.6) continue; c.wait = 0;
      if (c.phase === 'well' && wl) { c.phase = 'fire'; c.load = true; }
      else { // đổ nước vào đám cháy
        c.f.i -= 22; c.load = false; Game.fx.splash(fo); c.phase = wells.length ? 'well' : 'fire';
        if (c.f.i <= 0) { this.clearFire(fo); this.notify('Đã dập tắt đám cháy tại ' + fo.def.name, 'info', fo.x, fo.y); }
      }
    }
  },
  demolishBurnt(o) { this.clearFire(o); Game.world.remove(o); if (Game.state.sel === o) Game.state.sel = null; Game.econ.assign(); }
};
Game.notify = (...a) => Game.sim.notify(...a);
