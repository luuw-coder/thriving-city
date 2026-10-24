// Lưu/tải game vào localStorage của trình duyệt (có kiểm tra dữ liệu, lưu hỏng thì không ghi đè bản cũ).
Game.save = {
  KEY: 'dai-thanh-save-v1',
  has() { try { return !!localStorage.getItem(this.KEY); } catch (e) { return false; } },
  write() {
    try {
      const s = Game.state, W = Game.world;
      const data = { v: 1, day: s.day, res: s.res, pop: s.people.length, objs: W.objects.map(o => o.type === 'tree' ? { t: 'tree', x: o.x, y: o.y } :
        { t: o.def.id, x: o.x, y: o.y, prog: o.prog, hp: o.hp, want: o.want, fire: o.fire ? Math.round(o.fire.i) : 0 }) };
      const txt = JSON.stringify(data); localStorage.setItem(this.KEY, txt); Game.notify('Đã lưu game', 'info'); return true;
    } catch (e) { Game.notify('Lưu thất bại: ' + e.message, 'red'); return false; }
  },
  read() {
    let d; const C = Game.config;
    try {
      d = JSON.parse(localStorage.getItem(this.KEY));
      const ok = d && d.v === 1 && Array.isArray(d.objs) && Number.isFinite(d.day) && Number.isFinite(d.pop) && d.res &&
        d.objs.every(e => e && Number.isInteger(e.x) && Number.isInteger(e.y) && e.x >= 0 && e.y >= 0 && e.x < C.MAP_W && e.y < C.MAP_H && (e.t === 'tree' || Game.buildingDefs[e.t]));
      if (!ok) throw new Error('dữ liệu không hợp lệ');
    } catch (e) { Game.notify('Không tải được bản lưu: ' + e.message, 'red'); return false; }
    Game.world.loadData(d); return true;
  }
};
