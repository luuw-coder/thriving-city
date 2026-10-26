// Giao diện trong game: thanh trên, thông báo bên trái, công cụ xây phía dưới, bảng thông tin bên phải.
Game.hud = {
  group: 'house', acc: 0, noteKey: '',
  $: id => document.getElementById(id),
  init() {
    const $ = this.$;
    $('tabs').innerHTML = '';
    for (const [g, n] of Game.groups) { const b = document.createElement('button'); b.textContent = n; b.dataset.g = g; b.onclick = () => { this.group = g; this.items(); }; $('tabs').appendChild(b); }
    const d = document.createElement('button'); d.textContent = '🔨 Phá dỡ'; d.onclick = () => this.setTool('demolish'); $('tabs').appendChild(d);
    $('speed').innerHTML = [0, 1, 2, 3].map(n => `<button data-s="${n}">${n ? '×' + n : '⏸'}</button>`).join('');
    $('speed').onclick = e => { const s = e.target.dataset.s; if (s !== undefined) this.setSpeed(+s); };
    $('b-music').onclick = () => Game.menu.openSettings();
    $('b-save').onclick = () => Game.save.write(); $('b-load').onclick = () => { if (Game.save.read()) this.items(); }; $('b-labor').onclick = () => this.openLabor();
    const cv = $('game'); let p0 = null;
    cv.addEventListener('pointerdown', e => { p0 = { x: e.clientX, y: e.clientY }; });
    cv.addEventListener('pointerup', e => { if (p0 && Math.hypot(e.clientX - p0.x, e.clientY - p0.y) < 5 && e.button === 0) this.click(e); p0 = null; });
    cv.addEventListener('contextmenu', e => { e.preventDefault(); this.setTool(null); });
    addEventListener('keydown', e => {
      if (!Game.state || $('game').hidden) return;
      if (e.key === 'Escape') this.setTool(null);
      else if (e.key === ' ') { e.preventDefault(); this.setSpeed(Game.state.speed ? 0 : 1); }
      else if ('123'.includes(e.key)) this.setSpeed(+e.key);
    });
    $('notes').onclick = e => { const li = e.target.closest('[data-i]'); if (li) { const n = Game.state.notes[+li.dataset.i]; if (n.x !== undefined) this.focus(n.x, n.y); } };
    $('info').onclick = e => {
      const a = e.target.dataset.act, o = Game.state.sel; if (!a || !o) return;
      if (a === 'del') Game.act.demolish(o); else if (a === 'fire') { if (Game.multiplayer.mode !== 'guest') Game.sim.ignite(o); }
      else if (a === 'inc' || a === 'dec') Game.act.want(o, Math.max(0, Math.min(o.def.jobs, Game.econ.want(o) + (a === 'inc' ? 1 : -1))));
    };
  },
  show(v) { for (const id of ['topbar', 'tools', 'left', 'panel', 'bottom']) this.$(id).hidden = !v; this.$('info').hidden = true; if (v) { this.items(); } },
  setSpeed(n) { if (!Game.state.started || Game.multiplayer.mode === 'guest') return; Game.state.speed = n; },
  focus(x, y) { const p = Game.iso.toScreen(x, y); Game.camera.x = p.x; Game.camera.y = p.y; Game.state.sel = Game.world.occ[Game.world.key(x, y)] || null; this.infoKey = ''; },
  setTool(t) { Game.state.tool = t; Game.state.sel = null; this.items(); },
  costStr: c => Object.entries(c).map(([k, v]) => k + ' ' + v).join(' + ') || 'Miễn phí',
  items() {
    const $ = this.$, box = $('items'), tool = Game.state && Game.state.tool; box.innerHTML = '';
    for (const b of $('tabs').children) b.className = (b.dataset.g === this.group ? 'on' : '') + (b.textContent.includes('Phá') && tool === 'demolish' ? ' on' : '');
    for (const d of Object.values(Game.buildingDefs).filter(d => d.g === this.group)) {
      const b = document.createElement('button'); b.className = 'item' + (tool === d.id ? ' on' : '');
      b.innerHTML = `<i style="background:${d.c}"></i><b>${d.name}</b><small>${this.costStr(d.cost)}</small>`;
      const need = Game.UNLOCK[d.id] || 0, lock = Game.state.stats.pop < need;
      b.title = lock ? `Mở khi đạt ${need} dân` : `${d.name} — ${d.w}×${d.h} ô, nhân công ${d.jobs}`; b.disabled = lock;
      if (lock) b.querySelector('small').textContent = `Mở ở ${need} dân`; b.onclick = () => this.setTool(d.id); box.appendChild(b);
    }
  },
  click(e) {
    const t = Game.renderer.tileAt(e.clientX, e.clientY), s = Game.state; if (!t) return;
    const o = Game.world.occ[Game.world.key(t.x, t.y)];
    if (s.tool === 'demolish') { if (o) Game.act.demolish(o); }
    else if (s.tool) { if (Game.act.build(s.tool, t.x, t.y) && s.tool === 'hall') this.setTool(null); }
    else { s.sel = o && o.type === 'building' ? o : null; this.infoKey = ''; }
  },
  openLabor() {
    const m = this.$('modal'), S = Game.state.stats, rows = {};
    for (const o of Game.world.objects) { if (o.type !== 'building' || o.prog < 1 || !o.def.jobs) continue; const r = rows[o.def.g] || (rows[o.def.g] = { w: 0, n: 0 }); r.w += o.workers || 0; r.n += Game.econ.want(o); }
    m.hidden = false;
    m.innerHTML = `<div class="box"><h3>Nhân lực toàn thành</h3><p>Dân ${S.pop} · Có việc ${S.emp} · Thất nghiệp ${S.unemp} · Chỗ trống ${S.open}</p><table>${Game.groups.filter(([g]) => rows[g]).map(([g, n]) => `<tr><td>${n}</td><td>${rows[g].w} / ${rows[g].n}</td></tr>`).join('')}</table><small>Chỉnh nhân công từng công trình trong bảng thông tin bên phải.</small><button id="mx2">Đóng</button></div>`;
    m.querySelector('#mx2').onclick = () => { m.hidden = true; };
  },
  update(dt) {
    this.acc += dt; if (this.acc < 0.25) return; this.acc = 0;
    const s = Game.state, $ = this.$, day = s.day, season = ['Xuân', 'Hạ', 'Thu', 'Đông'][Math.floor(day % 360 / 90)];
    $('town').textContent = '【' + Game.TITLES[s.title][1] + '】';
    $('date').textContent = `Tháng ${Math.floor(day % 360 / 30) + 1} Năm thứ ${Math.floor(day / 360) + 1} · ${season}`;
    const S = s.stats, r = s.res, mat = Math.floor(r.G + r['Đ'] + r.Ga + r.Ng + r.S + r.V + r['Sét']);
    $('stats').innerHTML = `<div class="chips"><span title="Cư dân">👥 ${S.pop}</span><span title="Có việc">⚒ ${S.emp}</span><span title="Rảnh rỗi (thất nghiệp)">💤 ${S.unemp}</span><span title="Việc còn trống">📋 ${S.open}</span></div><div>Cư dân <b>${S.pop}</b> · Chỗ ở <b>${S.cap}</b></div><div class="g3"><div>Tài Chính<br>💰 <b>${Math.floor(r.T)}</b></div><div>Thức Ăn<br>🍚 <b>${Math.floor(r.LT)}</b></div><div>Vật Tư<br>📦 <b>${mat}</b></div></div>`;
    if (this.lastTitle !== s.title) { this.lastTitle = s.title; this.items(); }
    for (const b of $('speed').children) b.className = +b.dataset.s === s.speed ? 'on' : '';
    $('res').innerHTML = Object.entries(s.res).filter(([k]) => k !== 'T' && k !== 'LT').map(([k, v]) => `<span>${k} <b>${Math.floor(v)}</b></span>`).join('');
    const ns = !s.started, M = Game.multiplayer, hint = $('hint'), room = $('room');   // chưa đặt Trấn Sở thì chưa chơi được
    document.body.classList.toggle('nostart', ns); if (ns && s.tool !== 'hall') s.tool = 'hall'; if (!ns && s.tool === 'hall') s.tool = null;
    hint.hidden = !(ns || s.tool);
    hint.textContent = ns ? 'Chọn nơi lập trấn: bấm lên đất liền để đặt Trấn Sở (3×3). Thời gian chỉ chạy sau khi đặt.' : s.tool === 'demolish' ? 'Đang phá dỡ — bấm vào công trình · chuột phải/Esc hủy' : s.tool ? 'Đang xây: ' + Game.buildingDefs[s.tool].name + ' · bấm để đặt · chuột phải/Esc hủy' : '';
    room.hidden = M.mode === 'solo'; room.textContent = M.mode === 'host' ? 'Mã phòng: ' + (M.code || '…') + ' · 👥 ' + (M.connected() ? '2/2' : '1/2 (đang chờ)') : '👥 2/2 · bạn là Khách';
    const key = s.notes.length + '|' + (s.notes[0] ? s.notes[0].text + s.notes[0].day : '');
    if (key !== this.noteKey) { this.noteKey = key; $('notes').innerHTML = s.notes.map((n, i) => `<div class="n ${n.lv}" data-i="${i}">${n.text}<small>Ngày ${n.day + 1}</small></div>`).join('') || '<small>Chưa có thông báo.</small>'; }
    const o = s.sel, info = $('info');
    if (!o || !Game.world.objects.includes(o)) { info.hidden = true; return; }
    const d = o.def, st = o.fire ? `🔥 Đang cháy (${Math.floor(o.fire.i)}%)` : o.prog < 1 ? `Đang xây ${Math.floor(o.prog * 100)}%` : 'Hoạt động';
    info.hidden = false;
    info.innerHTML = `<h3>${d.name}</h3><p>Trạng thái: <b>${st}</b></p>` + (o.why ? `<p class="why">⚠ ${o.why}</p>` : '') + `<p>Độ bền: ${Math.floor(o.hp)}%</p>` +
      (d.jobs ? `<p>Nhân công: <b>${o.workers || 0}</b> / ${Game.econ.want(o)} (tối đa ${d.jobs}) <button data-act="dec">−</button><button data-act="inc">+</button></p>` : '') +
      (Game.CAP[d.id] ? `<p>Cư dân: ${o.res || 0} / ${Game.CAP[d.id]}</p>` : '') +
      (o.buf ? `<p>Hàng chờ chuyển: ${Object.entries(o.buf).map(([k, v]) => k + ' ' + Math.floor(v)).join(', ') || '—'}</p>` : '') +
      `<p>Dễ cháy: ${d.flam}/5` + (d.range ? ` · Phạm vi: ${d.range} ô` : '') + `</p><p>Chi phí xây: ${this.costStr(d.cost)}</p><button data-act="del">Phá dỡ</button> <button data-act="fire">🔥 Thử gây cháy</button>`;
  }
};
