// Lưu/tải vào localStorage. Mỗi (chế độ một người | nhiều người) × bản đồ có MỘT chỗ lưu riêng. Có kiểm tra dữ liệu: lưu hỏng thì không ghi đè bản cũ.
Game.save = {
  key(mode, map) { return 'dai-thanh-v2-' + (mode === 'solo' ? 'solo' : 'multi') + '-' + map; },
  get(k) { try { const d = JSON.parse(localStorage.getItem(k)); return this.valid(d) ? d : null; } catch (e) { return null; } },
  info(mode, map) { const d = this.get(this.key(mode, map)); return d ? { year: Math.floor(d.day / 360) + 1, pop: d.pop } : null; },
  valid(d) {   // cũng dùng để kiểm tra dữ liệu nhận từ người chơi kia qua mạng
    const C = Game.config;
    return !!(d && d.v === 2 && Game.maps[d.map] && Array.isArray(d.objs) && d.objs.length < 4000 && Number.isFinite(d.day) && Number.isFinite(d.pop) && d.res && typeof d.res === 'object' &&
      d.objs.every(e => e && Number.isInteger(e.x) && Number.isInteger(e.y) && e.x >= 0 && e.y >= 0 && e.x < C.MAP_W && e.y < C.MAP_H && (e.t === 'tree' || Game.buildingDefs[e.t])));
  },
  pack(notes) {
    const s = Game.state, W = Game.world;
    return { v: 2, map: Game.map.id, day: s.day, res: s.res, pop: s.people.length, started: s.started, speed: s.speed, notes: notes ? s.notes.slice(0, 12) : undefined,
      objs: W.objects.map(o => o.type === 'tree' ? { t: 'tree', x: o.x, y: o.y } : { t: o.def.id, x: o.x, y: o.y, prog: o.prog, hp: o.hp, want: o.want, fire: o.fire ? Math.round(o.fire.i) : 0 }) };
  },
  write(quiet) {
    const S = Game.session; if (!Game.state.started) return false;
    if (Game.multiplayer.mode === 'guest') { if (!quiet) Game.notify('Chỉ chủ phòng mới lưu được', 'warn'); return false; }
    try { localStorage.setItem(this.key(S.mode, S.map), JSON.stringify(this.pack())); if (!quiet) Game.notify('Đã lưu game', 'info'); return true; }
    catch (e) { Game.notify('Lưu thất bại: ' + e.message, 'red'); return false; }
  },
  read(mode, map) {
    const S = Game.session; if (Game.multiplayer.mode === 'guest') return false;
    const d = this.get(this.key(mode || S.mode, map || S.map)); if (!d) { Game.notify('Không tải được bản lưu', 'red'); return false; }
    Game.world.loadData(d); return true;
  }
};
