// DÂN CƯ CÓ "AI": mỗi người tự đi tới nơi làm / nhà / cây cần chặt, né nước và công trình, thích đi trên đường.
//  • Ban ngày: có việc → đi làm (thợ xây ra công trường — công trình CHỈ xây tiến lên khi thợ có mặt). Chiều tối → về nhà, vào nhà thì biến mất và nhà đếm số người bên trong.
//  • Không có việc → đi loanh quanh gần nhà, hoặc ra chặt cây đã đánh dấu (🪓). Chưa có nhà → đứng gần Trấn Sở; có nhà trống thì tự đi tìm tới (phân nhà/việc do economy.assign làm).
// Chỉ MAXV người đầu được mô phỏng chi tiết (cho nhẹ máy); phần còn lại vẫn tính trong kinh tế.
Game.people = {
  MAXV: 250, SPD: 4.5, lens: null, gv: -1, blk: null, mt: 0, marks: [],
  grid() {   // 0 trống · 1 chặn (nước, công trình) · 2 cây · 3 đường · 4 ruộng (đi xuyên được)
    const W = Game.config.MAP_W;
    if (this.gv !== Game.world.ver) {
      this.gv = Game.world.ver; const b = this.blk = new Uint8Array(W * W);
      for (let i = 0; i < W * W; i++) if (Game.map.water[i]) b[i] = 1;
      for (const o of Game.world.objects) { const v = o.type === 'tree' ? 2 : o.def.id === 'road' ? 3 : o.def.z <= 3 ? 4 : 1; for (let i = 0; i < o.w; i++) for (let j = 0; j < o.h; j++) b[(o.y + j) * W + o.x + i] = v; }
    }
    return this.blk;
  },
  route(sx, sy, o) {   // tìm đường (Dijkstra) tới ô sát công trình/cây; đường đi rẻ hơn đất trống, cây thì đắt
    const W = Game.config.MAP_W, b = this.grid(), goal = new Set(), N = W * W;
    for (let i = -1; i <= o.w; i++) for (let j = -1; j <= o.h; j++) {
      if (i >= 0 && i < o.w && j >= 0 && j < o.h) continue; const x = o.x + i, y = o.y + j; if (x < 0 || y < 0 || x >= W || y >= W) continue;
      const v = b[y * W + x]; if (v === 0 || v === 3 || v === 4) goal.add(y * W + x);
    }
    const dist = this.dist || (this.dist = new Float32Array(N)), prev = this.prev || (this.prev = new Int32Array(N)); dist.fill(1e9); prev.fill(-1);
    const s0 = Math.max(0, Math.min(W - 1, Math.floor(sy))) * W + Math.max(0, Math.min(W - 1, Math.floor(sx))), hp = [[0, s0]]; dist[s0] = 0;
    const push = e => { let i = hp.push(e) - 1; while (i > 0) { const p = (i - 1) >> 1; if (hp[p][0] <= e[0]) break; hp[i] = hp[p]; i = p; } hp[i] = e; };
    const pop = () => { const top = hp[0], last = hp.pop(); if (hp.length) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= hp.length) break; if (c + 1 < hp.length && hp[c + 1][0] < hp[c][0]) c++; if (hp[c][0] >= last[0]) break; hp[i] = hp[c]; i = c; } hp[i] = last; } return top; };
    let end = -1;
    while (hp.length) {
      const [d, u] = pop(); if (d > dist[u]) continue; if (goal.has(u)) { end = u; break; }
      const ux = u % W, uy = (u / W) | 0;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue; const x = ux + dx, y = uy + dy; if (x < 0 || y < 0 || x >= W || y >= W) continue;
        const v = y * W + x, t = b[v]; if (t === 1) continue;
        if (dx && dy && (b[uy * W + x] === 1 || b[y * W + ux] === 1)) continue;   // không cắt góc qua công trình
        const nd = d + (dx && dy ? 1.41 : 1) * (t === 3 ? 1 : t === 2 ? 3.5 : t === 4 ? 1.4 : 1.7);
        if (nd < dist[v]) { dist[v] = nd; prev[v] = u; push([nd, v]); }
      }
    }
    if (end < 0) return null;
    const path = []; for (let u = end; u !== s0 && u >= 0; u = prev[u]) path.push([u % W + .5, ((u / W) | 0) + .5]);
    return path.reverse();
  },
  door(o) { const C = Game.config; return [Math.min(C.MAP_W - 1, o.x + o.w / 2), Math.min(C.MAP_H - 1, o.y + o.h + .5)]; },
  spawn(p) {   // dân mới nhập cư xuất hiện ở cửa Trấn Sở
    const h = Game.world.objects.find(o => o.def && o.def.id === 'hall'), q = h ? this.door(h) : [Game.config.MAP_W / 2, Game.config.MAP_H / 2];
    p.x = q[0] + Math.random() - .5; p.y = q[1] + Math.random() * .5; p.path = null; p.dst = null; p.at = null; p.v = .85 + Math.random() * .3; p.w = 0;
  },
  walk(p, dt) {
    let left = this.SPD * dt * p.v;
    while (left > 0 && p.path && p.path.length) {
      const t = p.path[0], dx = t[0] - p.x, dy = t[1] - p.y, d = Math.hypot(dx, dy);
      if (d <= left) { p.x = t[0]; p.y = t[1]; p.path.shift(); left -= d; const nx = p.path[0]; if (nx && this.grid()[(nx[1] | 0) * Game.config.MAP_W + (nx[0] | 0)] === 1) { p.path = null; return; } }
      else { p.x += dx / d * left; p.y += dy / d * left; p.fx = dx; left = 0; }
    }
    if (p.path && !p.path.length) { p.at = p.dst; p.path = null; }
  },
  wander(p, dt) {
    if (p.path && p.path.length) { this.walk(p, dt); return; }
    p.at = null; p.w -= dt; if (p.w > 0) return; p.w = 2 + Math.random() * 4;
    const c = p.home || Game.world.objects.find(o => o.def && o.def.id === 'hall'); if (!c) return;
    const tx = Math.max(0, Math.min(Game.config.MAP_W - 1, Math.floor(c.x + (Math.random() * 2 - 1) * 5))), ty = Math.max(0, Math.min(Game.config.MAP_H - 1, Math.floor(c.y + c.h + Math.random() * 4)));
    p.path = this.route(p.x, p.y, { x: tx, y: ty, w: 1, h: 1 }); p.dst = null;
  },
  update(dt) {
    const s = Game.state; if (!s.started || !s.speed || !Game.map.water) return;
    dt *= s.speed; const W = Game.world, night = s.acc / Game.sim.DAY >= .72, P = s.people, n = Math.min(P.length, this.MAXV), guest = Game.multiplayer.mode === 'guest';
    for (const o of W.objects) if (o.type === 'building') { o.here = 0; o.inside = 0; }
    this.mt -= dt; if (this.mt <= 0) { this.mt = 1; this.marks = W.objects.filter(o => o.type === 'tree' && o.mark); }
    for (let i = 0; i < n; i++) {
      const p = P[i]; if (p.x === undefined) this.spawn(p); p.hide = false; p.act = null;
      if (p.rt > 0) { p.rt -= dt; continue; }
      if (p.task && (p.task.gone || !p.task.mark || night)) { p.task = null; p.path = null; }
      if (!p.task && !night && !p.job && p.home && !guest && this.marks.length) {   // người rảnh rỗi ra chặt cây đã đánh dấu
        let best = null, bd = 1e9;
        for (const t of this.marks) { if (t.claim && t.claim !== p && t.claim.task === t) continue; const d = Math.hypot(t.x - p.x, t.y - p.y); if (d < bd) { bd = d; best = t; } }
        if (best) { p.task = best; best.claim = p; p.path = null; p.at = null; p.w = 0; }
      }
      const tb = p.task || (night ? p.home : p.job);
      if (tb && p.at === tb) {   // đã tới nơi
        if (tb.type === 'tree') { p.act = 'chop'; p.w += dt; if (p.w > 2.5) { p.w = 0; p.task = null; p.at = null; if (!guest) { W.remove(tb); s.res.G += 4; } } }
        else if (tb === p.home && night) { tb.inside++; p.hide = true; }
        else if (tb === p.job) { tb.here++; p.act = 'work'; }
        else p.at = null;
        continue;
      }
      if (!tb) { this.wander(p, dt); continue; }
      if (!p.path || p.dst !== tb) {
        p.path = this.route(p.x, p.y, tb); p.dst = tb;
        if (!p.path) { p.rt = 1; p.fails = (p.fails || 0) + 1; if (p.fails >= 3) { const q = this.door(tb); p.x = q[0]; p.y = q[1]; p.at = tb; p.fails = 0; } continue; }
        p.fails = 0;
      }
      this.walk(p, dt);
    }
  },
  visible() { const P = Game.state.people, out = []; for (let i = 0; i < Math.min(P.length, this.MAXV); i++) if (P[i].x !== undefined && !P[i].hide) out.push(P[i]); return out; },
  drawOne(ctx, p) {
    const c = Game.iso.toScreen(p.x, p.y); if (!Game.camera.sees(c.x, c.y - 10, 30, 40)) return;
    if (Game.drawSprite(ctx, '_person', 0, c.x, c.y, 24)) return;
    const j = p.job, col = p.task ? '#8a5a2a' : j ? (j.prog < 1 ? '#d08a30' : j.def.g === 'farm' ? '#5a8a4a' : j.def.g === 'civic' ? '#4a6a9a' : '#8a6a4a') : !p.home ? '#b04a4a' : '#7a7a8a';
    const t = Game.fx.t, bob = p.path ? Math.abs(Math.sin(t * 10 + p.id)) * 1.5 : p.act ? Math.sin(t * 12 + p.id) * 1.5 : 0;
    ctx.fillStyle = '#0003'; ctx.beginPath(); ctx.ellipse(c.x, c.y, 5, 2.5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(c.x - 3, c.y - 11 - bob, 6, 9);
    ctx.fillStyle = '#f0d4a8'; ctx.beginPath(); ctx.arc(c.x, c.y - 13 - bob, 3.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(c.x - 3.2, c.y - 16.5 - bob, 6.4, 2);
  },
  drawLens(ctx) {   // 4 nút tròn bên trái: 🙂 người · 💧 nước/chữa cháy · 🔨 việc làm · 🏠 nhà ở
    const L = this.lens; if (!L) return; const I = Game.iso; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    const pill = (x, y, txt, col) => { const w = ctx.measureText(txt).width + 10; ctx.fillStyle = col; ctx.fillRect(x - w / 2, y - 8, w, 14); ctx.fillStyle = '#fff'; ctx.fillText(txt, x, y + 3); };
    const tone = (a, b) => a >= b ? '#3a8a4a' : a ? '#c08a20' : '#b0382a';
    for (const o of Game.world.objects) {
      if (o.type !== 'building') continue; const m = I.toScreen(o.x + o.w / 2, o.y + o.h / 2), y = m.y - o.def.z - 28;
      if (L === 'house' && o.prog >= 1 && Game.CAP[o.def.id]) { const c = Game.CAP[o.def.id], r = o.res || 0; pill(m.x, y, (r >= c ? 'Đủ ' : '') + r + '/' + c, tone(r, c)); }
      else if (L === 'work') { const w = Game.econ.want(o); if (w > 0) pill(m.x, y, (o.workers || 0) + '/' + w, tone(o.workers || 0, w)); }
      else if (L === 'water' && o.def.range && o.prog >= 1) { ctx.beginPath(); ctx.ellipse(m.x, m.y, o.def.range * 45.25, o.def.range * 22.6, 0, 0, 7); ctx.fillStyle = 'rgba(80,160,255,.18)'; ctx.fill(); ctx.strokeStyle = 'rgba(40,110,220,.7)'; ctx.lineWidth = 2; ctx.stroke(); }
    }
    if (L === 'people') for (const p of this.visible()) { const c = I.toScreen(p.x, p.y); if (!p.home) ctx.fillText('🏚', c.x, c.y - 20); else if (!p.job) ctx.fillText('💤', c.x, c.y - 20); }
    ctx.textAlign = 'start';
  }
};
