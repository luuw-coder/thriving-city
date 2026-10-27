// NHIỀU NGƯỜI (2 người) bằng WebRTC: không cần máy chủ riêng, chạy được trên GitHub Pages. PeerJS chỉ làm "bắt tay" (cần Internet), sau đó dữ liệu đi thẳng giữa 2 máy.
// Chủ phòng chạy mô phỏng và gửi ảnh chụp thành phố mỗi giây; khách gửi lệnh (xây / phá / chỉnh nhân công) cho chủ. Cả hai thấy chuột của nhau.
Game.multiplayer = {
  mode: 'solo',   // 'solo' | 'host' | 'guest'
  peer: null, conn: null, code: '', remote: null, lc: 0, timer: 0, jt: 0, began: false, got: false,
  name() { return this.mode === 'host' ? 'Chủ phòng' : 'Khách'; },
  remoteName() { return this.mode === 'host' ? 'Khách' : 'Chủ phòng'; },
  remoteColor() { return this.mode === 'host' ? '#2b6fc0' : '#c0392b'; },
  connected() { return !!(this.conn && this.conn.open); },
  send(m) { if (this.connected()) this.conn.send(m); },
  reset() {
    clearInterval(this.timer); clearTimeout(this.jt);
    try { this.conn && this.conn.close(); this.peer && this.peer.destroy(); } catch (e) {}
    Object.assign(this, { mode: 'solo', peer: null, conn: null, code: '', remote: null, began: false, got: false });
  },
  fail(msg) { alert(msg); Game.quit(); },
  host() {
    this.mode = 'host';
    if (!window.Peer) return this.fail('Chưa nạp được PeerJS — cần có Internet để tạo phòng.');
    const open = () => {
      const code = Math.random().toString(36).slice(2, 6), p = this.peer = new Peer('daithanh-' + code);
      p.on('open', () => { this.code = code; });
      p.on('error', e => { if (e.type === 'unavailable-id') { p.destroy(); open(); } else this.fail('Lỗi mạng: ' + e.type); });
      p.on('connection', c => {
        if (this.connected()) { c.on('open', () => { c.send({ t: 'full' }); setTimeout(() => c.close(), 400); }); return; }   // phòng chỉ 2 người
        this.bind(c);
      });
    };
    open(); this.timer = setInterval(() => this.snap(), 1000);
  },
  join(code) {
    this.mode = 'guest'; this.code = code;
    if (!window.Peer) return this.fail('Chưa nạp được PeerJS — cần có Internet để vào phòng.');
    const p = this.peer = new Peer();
    p.on('open', () => { this.bind(p.connect('daithanh-' + code, { reliable: true })); this.jt = setTimeout(() => { if (!this.got) this.fail('Không tìm thấy phòng ' + code); }, 10000); });
    p.on('error', e => this.fail(e.type === 'peer-unavailable' ? 'Không tìm thấy phòng ' + code : 'Lỗi mạng: ' + e.type));
  },
  bind(c) {
    this.conn = c;
    c.on('open', () => { Game.notify(this.mode === 'host' ? 'Một người chơi đã vào phòng' : 'Đã kết nối với phòng', 'info'); this.snap(); });
    c.on('data', m => this.onData(m));
    c.on('error', () => {});
    c.on('close', () => { this.conn = null; this.remote = null; if (this.mode === 'guest') this.fail('Chủ phòng đã đóng phòng.'); else Game.notify('Người chơi kia đã rời phòng', 'warn'); });
  },
  snap() { if (this.mode === 'host' && this.connected()) this.send({ t: 'snap', d: Game.save.pack(true) }); },
  apply(d) {   // khách nhận ảnh chụp: dựng lại thế giới nhưng giữ công cụ đang chọn, công trình đang xem và thông báo
    const s = Game.state, keep = { tool: s.tool, notes: s.notes, sel: s.sel && { x: s.sel.x, y: s.sel.y } };
    Game.world.loadData(d);
    const n = Game.state; n.tool = keep.tool; n.speed = d.speed | 0;
    n.notes = Array.isArray(d.notes) ? d.notes.slice(0, 12).map(q => ({ text: String(q.text).replace(/[<>&"]/g, '').slice(0, 120), lv: ['info', 'warn', 'red'].includes(q.lv) ? q.lv : 'info', x: Number.isFinite(q.x) ? q.x : undefined, y: Number.isFinite(q.y) ? q.y : undefined, day: q.day | 0 })) : keep.notes;
    if (keep.sel) { const o = Game.world.occ[Game.world.key(keep.sel.x, keep.sel.y)]; n.sel = o && o.type === 'building' ? o : null; }
  },
  onData(m) {
    if (!m || typeof m !== 'object') return;
    const g = this.mode === 'guest', int = Number.isInteger;
    if (m.t === 'full') return this.fail('Phòng đã đủ 2 người.');
    if (m.t === 'cur') { if (Number.isFinite(m.x) && Number.isFinite(m.y)) this.remote = { x: m.x, y: m.y, t: Date.now() }; }
    else if (m.t === 'chat') Game.chat.add(String(m.n).slice(0, 20), String(m.s).slice(0, 200));
    else if (g && m.t === 'snap' && Game.save.valid(m.d)) {
      this.got = true; clearTimeout(this.jt); Game.session.map = m.d.map; this.apply(m.d);
      if (!this.began) { this.began = true; Game.begin(); }
    } else if (!g && int(m.x) && int(m.y)) {   // lệnh của khách, chủ kiểm tra rồi mới làm
      const o = Game.world.occ[Game.world.key(m.x, m.y)];
      if (m.t === 'build' && Game.buildingDefs[m.id]) Game.sim.tryBuild(m.id, m.x, m.y);
      else if (m.t === 'demo' && o && o.type === 'building') Game.sim.demolish(o);
      else if ((m.t === 'chop' || m.t === 'unmark') && o && o.type === 'tree') o.mark = m.t === 'chop';
      else if (m.t === 'want' && o && o.type === 'building' && int(m.n)) { o.want = Math.max(0, Math.min(o.def.jobs, m.n)); Game.econ.assign(); }
      else return;
      this.snap();
    }
  },
  cursor(cx, cy) {   // gửi vị trí chuột (theo toạ độ ô nên mỗi người có thể zoom/kéo khác nhau)
    if (!this.connected() || Date.now() - this.lc < 60) return; this.lc = Date.now();
    const cv = Game.renderer.canvas, w = Game.camera.screenToWorld(cx, cy, cv.width, cv.height), t = Game.iso.toTileF(w.x, w.y);
    this.send({ t: 'cur', x: t.x, y: t.y });
  }
};
// Mọi hành động của người chơi đi qua đây: một người / chủ phòng làm ngay, khách gửi lệnh cho chủ.
Game.act = {
  build(id, x, y) {
    const M = Game.multiplayer, d = Game.buildingDefs[id];
    if (M.mode !== 'guest') { const ok = Game.sim.tryBuild(id, x, y); if (ok) M.snap(); return ok; }
    if (!Game.world.canPlace(d, x, y)) { Game.notify('Không thể xây ở vị trí này', 'warn', x, y); return false; }
    for (const k in d.cost) if ((Game.state.res[k] || 0) < d.cost[k]) { Game.notify('Thiếu ' + k + ' để xây ' + d.name, 'warn', x, y); return false; }
    M.send({ t: 'build', id, x, y }); return true;
  },
  demolish(o) { const M = Game.multiplayer; if (M.mode === 'guest') M.send({ t: 'demo', x: o.x, y: o.y }); else { Game.sim.demolish(o); M.snap(); } },
  mark(o, on) { const M = Game.multiplayer; o.mark = on; if (M.mode === 'guest') M.send({ t: on ? 'chop' : 'unmark', x: o.x, y: o.y }); else M.snap(); },
  want(o, n) { const M = Game.multiplayer; if (M.mode === 'guest') M.send({ t: 'want', x: o.x, y: o.y, n }); else { o.want = n; Game.econ.assign(); M.snap(); } }
};
