// Hiệu ứng động vẽ bằng code (lửa, khói, người xách nước, nước té). Muốn dùng sprite thật: thay nội dung fire() và person().
Game.fx = {
  t: 0, sp: [], imgs: {}, ov: new Map(),
  update(dt) { this.t += dt; this.sp = this.sp.filter(p => (p.a += dt) < 0.6); },
  splash(o) { const m = Game.iso.toScreen(o.x + o.w / 2, o.y + o.h / 2);
    for (let k = 0; k < 9; k++) this.sp.push({ x: m.x, y: m.y - o.def.z * .5, a: 0, vx: (Math.random() - .5) * 70, vy: -40 - Math.random() * 50 }); },
  drawAll(ctx) {
    const s = Game.state; for (const f of s.fires) this.fire(ctx, f);
    this.citizens(ctx); for (const c of s.carriers) this.person(ctx, c);
    ctx.fillStyle = '#6ec6ff';
    for (const p of this.sp) { ctx.globalAlpha = 1 - p.a / .6; ctx.beginPath(); ctx.arc(p.x + p.vx * p.a, p.y + p.vy * p.a + 120 * p.a * p.a, 2.5, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
  },
  fire(ctx, f) {
    const A = Game.fxAssets.fire; if (A.mode === 'gif' || A.mode === 'video') return; if (A.mode === 'sprite' && A.src && this.spriteFire(ctx, f, A)) return;
    const o = f.o, m = Game.iso.toScreen(o.x + o.w / 2, o.y + o.h / 2), by = m.y - o.def.z * .55;
    const n = 2 + Math.floor(f.i / 18), sc = .5 + f.i / 100;
    for (let k = 0; k < 3; k++) { // khói
      const p = (this.t * .5 + k / 3) % 1; ctx.fillStyle = `rgba(60,60,60,${.35 * (1 - p)})`;
      ctx.beginPath(); ctx.arc(m.x + Math.sin(p * 6 + k) * 8, by - 20 - p * 50, 6 + p * 14, 0, 7); ctx.fill();
    }
    for (let k = 0; k < n; k++) { // ngọn lửa nhấp nháy
      const x = m.x + (k - (n - 1) / 2) * 11 * sc, fl = 1 + Math.sin(this.t * 9 + k * 2.1) * .18, hh = (22 + f.i * .4) * fl * sc, w = 7 * sc;
      for (const [col, s2] of [['#ff6a1a', 1], ['#ffd23f', .55]]) {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w * s2, by);
        ctx.quadraticCurveTo(x - w * s2, by - hh * s2 * .5, x + Math.sin(this.t * 7 + k) * 2, by - hh * s2);
        ctx.quadraticCurveTo(x + w * s2, by - hh * s2 * .5, x + w * s2, by); ctx.closePath(); ctx.fill();
      }
    }
  },
  person(ctx, c) {
    const p = Game.iso.toScreen(c.x, c.y), bob = Math.abs(Math.sin(this.t * 10 + c.id)) * 2;
    ctx.fillStyle = '#0004'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 6, 3, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(p.x - 2, p.y); ctx.lineTo(p.x - 2, p.y - 6 + bob); ctx.moveTo(p.x + 2, p.y); ctx.lineTo(p.x + 2, p.y - 6 - bob + 2); ctx.stroke();
    ctx.fillStyle = c.col || '#b0382a'; ctx.fillRect(p.x - 4, p.y - 16 - bob, 8, 10);       // áo lính cứu hỏa
    ctx.fillStyle = '#e8c9a0'; ctx.beginPath(); ctx.arc(p.x, p.y - 20 - bob, 4, 0, 7); ctx.fill();
    ctx.fillStyle = '#3a3a3a'; ctx.fillRect(p.x - 5, p.y - 25 - bob, 10, 3);          // mũ
    if (c.load) { ctx.fillStyle = '#7a5a30'; ctx.fillRect(p.x + 4, p.y - 12 - bob, 6, 6); ctx.fillStyle = '#6ec6ff'; ctx.fillRect(p.x + 5, p.y - 12 - bob, 4, 2); }
  },
  spriteFire(ctx, f, A) {
    const img = this.imgs[A.src] || (this.imgs[A.src] = Object.assign(new Image(), { src: A.src }));
    if (!img.complete || !img.naturalWidth) return false;
    const o = f.o, m = Game.iso.toScreen(o.x + o.w / 2, o.y + o.h / 2), sc = .5 + f.i / 100 * .8, fr = Math.floor(this.t * A.fps) % A.frames;
    ctx.drawImage(img, fr * A.fw, 0, A.fw, A.fh, m.x - A.w * sc / 2, m.y - o.def.z * .55 - A.h * sc, A.w * sc, A.h * sc); return true;
  },
  citizens(ctx) { // dân đi lại giữa nhà và nơi làm (tối đa 150 người vẽ; phần còn lại vẫn được mô phỏng đủ)
    const s = Game.state, n = Math.min(s.people.length, 150), t = this.t, cols = ['#4a6a8a', '#6a8a4a', '#8a6a4a', '#8a4a6a'];
    for (let i = 0; i < n; i++) {
      const p = s.people[i]; if (!p.home) continue; const h = p.home, j = p.job, hx = h.x + h.w / 2, hy = h.y + h.h + .3; let x = hx, y = hy;
      if (j) { const f = .5 + .5 * Math.sin(t * .12 + p.id * 1.7); x = hx + (j.x + j.w / 2 - hx) * f; y = hy + (j.y + j.h + .3 - hy) * f; }
      else { x = hx + Math.sin(t * .3 + p.id) * .8; y = hy + Math.cos(t * .25 + p.id) * .8; }
      this.person(ctx, { x, y, id: p.id, col: cols[p.id % 4], load: false });
    }
  },
  syncOverlay(w, h) { // ảnh động dạng gif/video: đặt phần tử HTML đè đúng vị trí đám cháy
    const A = Game.fxAssets.fire, box = document.getElementById('overlay'), cam = Game.camera, live = new Set();
    if (A.mode === 'gif' || A.mode === 'video') for (const f of Game.state.fires) {
      live.add(f); let el = this.ov.get(f);
      if (!el) { el = document.createElement(A.mode === 'gif' ? 'img' : 'video'); el.src = A.src;
        if (A.mode === 'video') { el.autoplay = el.loop = el.muted = el.playsInline = true; el.play().catch(() => {}); }
        box.appendChild(el); this.ov.set(f, el); }
      const o = f.o, m = Game.iso.toScreen(o.x + o.w / 2, o.y + o.h / 2), sc = (.5 + f.i / 100 * .8) * cam.zoom;
      const sx = (m.x - cam.x) * cam.zoom + w / 2, sy = (m.y - o.def.z * .55 - cam.y) * cam.zoom + h / 2;
      el.style.width = A.w * sc + 'px'; el.style.height = A.h * sc + 'px'; el.style.left = (sx - A.w * sc / 2) + 'px'; el.style.top = (sy - A.h * sc) + 'px';
    }
    for (const [f, el] of this.ov) if (!live.has(f)) { el.remove(); this.ov.delete(f); }
  }
};
