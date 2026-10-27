// Giao diện trong game theo bố cục Thriving City Song: khung ngày/tốc độ (trên trái), bảng cư dân + tài chính (dưới trái), 4 nút "kính lúp", thanh xây dựng + dải vật tư (dưới giữa), nút thoi phá dỡ/chặt cây.
Game.hud = {
  pin: false, grp: null, acc: 0, noteKey: '', lastTitle: -1, p0: null,
  ICON: { road: '🛣', house: '🏠', farm: '🌾', prod: '⚒', store: '💧', shop: '🏮', civic: '🏛', army: '⚔' },
  RES: [['G', '🪵', 'Gỗ'], ['Đ', '🪨', 'Đá'], ['Ga', '🧱', 'Gạch'], ['Ng', '🔷', 'Ngói'], ['S', '⛓', 'Sắt'], ['V', '🧵', 'Vải'], ['Sét', '🟤', 'Đất sét']],
  $: id => document.getElementById(id),
  init() {
    const $ = this.$, T = $('tabs'); T.innerHTML = '';
    for (const [g, n] of Game.groups) { const b = document.createElement('button'); b.dataset.g = g; b.title = n; b.textContent = this.ICON[g] || '▣'; b.onmouseenter = () => this.openPop(g); b.onclick = () => { this.pin = true; this.openPop(g); }; T.appendChild(b); }
    $('bottom').onmouseleave = () => { if (!this.pin) this.closePop(); };   // rê chuột vào nút nhóm thì hiện danh sách; rê ra là ẩn
    addEventListener('pointerdown', e => { if (!e.target.closest('#bottom')) { this.pin = false; this.closePop(); } });   // bấm chỗ khác thì đóng
    $('dia').innerHTML = [['select', '✔', 'Chọn / hủy lệnh'], ['demolish', '✖', 'Phá dỡ'], ['chop', '🪓', 'Chặt cây (bấm hoặc kéo lên cây)'], ['unmark', '↺', 'Bỏ đánh dấu chặt']].map(([t, i, n]) => `<button data-t="${t}" title="${n}"><span>${i}</span></button>`).join('');
    $('dia').onclick = e => { const b = e.target.closest('button'); if (b) this.setTool(b.dataset.t === 'select' ? null : b.dataset.t); };
    $('speed').innerHTML = [0, 1, 2, 3].map(n => `<button data-s="${n}">${n ? '×' + n : '⏸'}</button>`).join('');
    $('speed').onclick = e => { const s = e.target.dataset.s; if (s !== undefined) this.setSpeed(+s); };
    $('b-music').onclick = () => Game.menu.openSettings();
    $('b-save').onclick = () => Game.save.write(); $('b-load').onclick = () => { if (Game.save.read()) this.items(); };
    $('b-job').onclick = () => this.openLabor(); $('b-pos').onclick = () => this.openPos(); $('b-food').onclick = () => this.openFood(); $('b-stock').onclick = () => this.openStock();
    $('b-tax').onclick = () => { if (Game.multiplayer.mode === 'guest') return Game.notify('Chỉ chủ phòng chỉnh thuế', 'warn'); Game.state.tax = (Game.state.tax + 1) % Game.TAX.length; Game.multiplayer.snap(); };
    $('lens').onclick = e => { const b = e.target.closest('button'); if (!b) return; Game.people.lens = Game.people.lens === b.dataset.l ? null : b.dataset.l; for (const x of $('lens').children) x.className = x.dataset.l === Game.people.lens ? 'on' : ''; };
    // CHUỘT TRÁI = tương tác (xây/chọn/phá/chặt, giữ chuột kéo để vẽ đường/chặt nhiều cây) · CHUỘT PHẢI kéo = di chuyển bản đồ (camera.js), bấm nhanh = hủy lệnh
    const cv = $('game'); let down = false, last = '';
    const act = e => { const t = Game.renderer.tileAt(e.clientX, e.clientY); if (!t) return; const k = t.x + ',' + t.y; if (k === last) return; last = k; this.apply(t); };
    cv.addEventListener('pointerdown', e => { this.p0 = { x: e.clientX, y: e.clientY, b: e.button, touch: e.pointerType === 'touch' }; if (e.button === 0 && e.pointerType !== 'touch') { down = true; last = ''; act(e); } });
    cv.addEventListener('pointermove', e => { if (down && (e.buttons & 1) && this.paintable()) act(e); });
    addEventListener('pointerup', e => {
      down = false; const p = this.p0; this.p0 = null; if (!p || Math.hypot(e.clientX - p.x, e.clientY - p.y) > 5) return;
      if (p.b === 2) this.setTool(null); else if (p.touch && e.target === cv) { last = ''; act(e); }
    });
    cv.addEventListener('contextmenu', e => e.preventDefault());
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
  show(v) { for (const id of ['topbar', 'tools', 'left', 'panel', 'lens', 'bottom']) this.$(id).hidden = !v; this.$('info').hidden = true; this.closePop(); if (v) this.setTool(Game.state.tool); },
  paintable() { const t = Game.state.tool, d = Game.buildingDefs[t]; return t === 'chop' || t === 'unmark' || !!(d && d.w === 1 && d.h === 1 && d.id !== 'hall'); },
  apply(t) {
    const s = Game.state, o = Game.world.occ[Game.world.key(t.x, t.y)], tool = s.tool;
    if (tool === 'demolish') { if (o) Game.act.demolish(o); }
    else if (tool === 'chop' || tool === 'unmark') { if (o && o.type === 'tree') Game.act.mark(o, tool === 'chop'); }
    else if (tool) { if (Game.act.build(tool, t.x, t.y) && tool === 'hall') this.setTool(null); }
    else { s.sel = o && o.type === 'building' ? o : null; this.infoKey = ''; }
  },
  setSpeed(n) { if (!Game.state.started || Game.multiplayer.mode === 'guest') return; Game.state.speed = n; },
  focus(x, y) { const p = Game.iso.toScreen(x, y); Game.camera.x = p.x; Game.camera.y = p.y; Game.state.sel = Game.world.occ[Game.world.key(x, y)] || null; this.infoKey = ''; },
  setTool(t) { Game.state.tool = t; Game.state.sel = null; for (const b of this.$('dia').children) b.className = (b.dataset.t === 'select' ? !t : b.dataset.t === t) ? 'on' : ''; this.items(); },
  costStr: c => Object.entries(c).map(([k, v]) => k + ' ' + v).join(' + ') || 'Miễn phí',
  openPop(g) {
    this.grp = g; const box = this.$('pop'), tool = Game.state.tool; box.hidden = false; box.innerHTML = '';
    for (const b of this.$('tabs').children) b.className = b.dataset.g === g ? 'on' : '';
    for (const d of Object.values(Game.buildingDefs).filter(d => d.g === g)) {
      const need = Game.UNLOCK[d.id] || 0, lock = Game.state.stats.pop < need, b = document.createElement('button');
      b.className = 'item' + (tool === d.id ? ' on' : ''); b.disabled = lock;
      b.innerHTML = `<i style="background:${d.c}"></i><b>${d.name}</b><small>${lock ? 'Mở ở ' + need + ' dân' : this.costStr(d.cost)}</small>`;
      b.title = `${d.name} — ${d.w}×${d.h} ô, nhân công ${d.jobs}`; b.onclick = () => { this.setTool(d.id); this.pin = false; this.closePop(); };
      box.appendChild(b);
    }
  },
  closePop() { this.grp = null; this.$('pop').hidden = true; for (const b of this.$('tabs').children) b.className = ''; },
  items() { if (this.grp) this.openPop(this.grp); },
  modal(html) { const m = this.$('modal'); m.hidden = false; m.innerHTML = `<div class="box">${html}<button id="mx2">Đóng</button></div>`; m.querySelector('#mx2').onclick = () => { m.hidden = true; }; },
  openLabor() {
    const S = Game.state.stats, rows = {};
    for (const o of Game.world.objects) { if (o.type !== 'building' || o.prog < 1 || !o.def.jobs) continue; const r = rows[o.def.g] || (rows[o.def.g] = { w: 0, n: 0 }); r.w += o.workers || 0; r.n += Game.econ.want(o); }
    this.modal(`<h3>Công việc toàn thành</h3><p>Dân ${S.pop} · Có việc ${S.emp} · Rảnh rỗi ${S.unemp} · Chỗ trống ${S.open}</p><table>${Game.groups.filter(([g]) => rows[g]).map(([g, n]) => `<tr><td>${n}</td><td>${rows[g].w} / ${rows[g].n}</td></tr>`).join('')}</table><small>Chỉnh nhân công từng công trình trong bảng thông tin bên phải.</small>`);
  },
  openPos() {   // cương vị: từng loại việc, kể cả công trường (thợ xây)
    const rows = {};
    for (const o of Game.world.objects) { if (o.type !== 'building') continue; const w = Game.econ.want(o); if (w <= 0) continue; const k = o.prog < 1 ? 'Thợ xây (công trường)' : o.def.name, r = rows[k] || (rows[k] = { c: 0, w: 0, n: 0 }); r.c++; r.w += o.workers || 0; r.n += w; }
    this.modal(`<h3>Cương vị</h3><table>${Object.entries(rows).map(([k, r]) => `<tr><td>${k} ×${r.c}</td><td>${r.w} / ${r.n}</td></tr>`).join('') || '<tr><td>Chưa có vị trí nào.</td></tr>'}</table>`);
  },
  openFood() {
    const s = Game.state, cons = s.people.length * Game.FOOD_PER_PERSON; let prod = 0;
    for (const o of Game.world.objects) if (o.type === 'building' && o.prog >= 1 && Game.PROD[o.def.id] && Game.PROD[o.def.id].out.LT) prod += Game.PROD[o.def.id].out.LT * Math.min(1, (o.workers || 0) / o.def.jobs);
    const net = prod - cons;
    this.modal(`<h3>Kho lương thực</h3><p>Tồn kho: <b>${Math.floor(s.res.LT)}</b></p><p>Tiêu thụ: ${cons.toFixed(1)}/ngày · Sản xuất (ước tính): ${prod.toFixed(1)}/ngày</p><p>Cân đối: <b>${net >= 0 ? '+' : ''}${net.toFixed(1)}</b>/ngày → ${net < 0 ? 'hết sau ~' + Math.floor(s.res.LT / -net) + ' ngày' : 'đủ dùng'}</p><small>Thêm lương thực: xây ruộng lúa / vườn rau và bố trí nhân công.</small>`);
  },
  openStock() {
    const s = Game.state, st = Game.sim.list('store'), cap = Game.BASE_CAP + st.reduce((a, o) => a + Game.STORE_CAP[o.def.id], 0), tot = Object.entries(s.res).filter(([k]) => k !== 'T').reduce((a, [, v]) => a + v, 0);
    this.modal(`<h3>Kho hàng</h3><p>Đã dùng <b>${Math.floor(tot)}</b> / ${cap} (mỗi loại tối đa ${Math.round(Game.RES_SHARE * 100)}% sức chứa)</p><table>${this.RES.map(([k, ic, n]) => `<tr><td>${ic} ${n}</td><td>${Math.floor(s.res[k] || 0)}</td></tr>`).join('')}<tr><td>🍚 Lương thực</td><td>${Math.floor(s.res.LT)}</td></tr></table><small>Hết chỗ chứa thì xây thêm kho.</small>`);
  },
  update(dt) {
    this.acc += dt; if (this.acc < 0.25) return; this.acc = 0;
    const s = Game.state, $ = this.$, day = s.day, season = ['Xuân', 'Hạ', 'Thu', 'Đông'][Math.floor(day % 360 / 90)], set = (i, v) => { const e = $(i); if (e.textContent !== '' + v) e.textContent = v; };
    set('town', '【' + Game.TITLES[s.title][1] + '】'); set('date', `Tháng ${Math.floor(day % 360 / 30) + 1} Năm thứ ${Math.floor(day / 360) + 1} · ${season}`);
    const S = s.stats, r = s.res, mat = Math.floor(r.G + r['Đ'] + r.Ga + r.Ng + r.S + r.V + r['Sét']), lvl = Math.max(0, Math.min(4, Math.ceil((100 - s.happy) / 25)));
    set('c-happy', s.happy); set('c-health', s.health); set('c-fire', s.fires.length); set('c-home', S.homeless); set('pp', S.pop); set('cp', S.cap); set('idl', S.unemp);
    set('mo', Math.floor(r.T)); set('fo', Math.floor(r.LT)); set('vt', mat); set('b-tax', 'Thuế má: ' + Game.TAX[s.tax].n);
    $('fists').innerHTML = [1, 2, 3, 4].map(i => `<span class="${i <= lvl ? 'on' : ''}">✊</span>`).join('');
    if (this.lastTitle !== s.title) { this.lastTitle = s.title; this.items(); }
    for (const b of $('speed').children) b.className = +b.dataset.s === s.speed ? 'on' : '';
    $('res').innerHTML = this.RES.map(([k, ic, n]) => `<span class="slot" title="${n}"><i>${ic}</i><b>${Math.floor(r[k] || 0)}</b></span>`).join('');
    const ns = !s.started, M = Game.multiplayer, hint = $('hint'), room = $('room');   // chưa đặt Trấn Sở thì chưa chơi được
    document.body.classList.toggle('nostart', ns); if (ns && s.tool !== 'hall') s.tool = 'hall'; if (!ns && s.tool === 'hall') s.tool = null;
    hint.hidden = !(ns || s.tool);
    hint.textContent = ns ? 'Chọn nơi lập trấn: bấm lên đất liền để đặt Trấn Sở (3×3). Thời gian chỉ chạy sau khi đặt.' : s.tool === 'demolish' ? 'Đang phá dỡ — bấm vào công trình · chuột phải/Esc hủy' : s.tool === 'chop' ? 'Chặt cây: bấm hoặc kéo chuột lên cây để đánh dấu — người rảnh rỗi sẽ ra chặt (+4 gỗ/cây)' : s.tool === 'unmark' ? 'Bấm vào cây đã đánh dấu để bỏ' : s.tool ? 'Đang xây: ' + Game.buildingDefs[s.tool].name + ' · bấm để đặt (đường/ruộng nhỏ: giữ chuột kéo) · chuột phải/Esc hủy' : '';
    room.hidden = M.mode === 'solo'; room.textContent = M.mode === 'host' ? 'Mã phòng: ' + (M.code || '…') + ' · 👥 ' + (M.connected() ? '2/2' : '1/2 (đang chờ)') : '👥 2/2 · bạn là Khách';
    const key = s.notes.length + '|' + (s.notes[0] ? s.notes[0].text + s.notes[0].day : '');
    if (key !== this.noteKey) { this.noteKey = key; $('notes').innerHTML = s.notes.map((n, i) => `<div class="n ${n.lv}" data-i="${i}">${n.text}<small>Ngày ${n.day + 1}</small></div>`).join('') || '<small>Chưa có thông báo.</small>'; }
    const o = s.sel, info = $('info');
    if (!o || !Game.world.objects.includes(o)) { info.hidden = true; return; }
    const d = o.def, need = Game.econ.siteWant(o), st = o.fire ? `🔥 Đang cháy (${Math.floor(o.fire.i)}%)` : o.prog < 1 ? `Đang xây ${Math.floor(o.prog * 100)}% · giai đoạn ${o.prog >= .5 ? 2 : 1}/3 · thợ ${o.here || 0}/${need}` : 'Hoạt động';
    info.hidden = false;
    info.innerHTML = `<h3>${d.name}</h3><p>Trạng thái: <b>${st}</b></p>` + (o.why ? `<p class="why">⚠ ${o.why}</p>` : '') + `<p>Độ bền: ${Math.floor(o.hp)}%</p>` +
      (d.jobs && o.prog >= 1 ? `<p>Nhân công: <b>${o.workers || 0}</b> / ${Game.econ.want(o)} (tối đa ${d.jobs}) · có mặt ${o.here || 0} <button data-act="dec">−</button><button data-act="inc">+</button></p>` : '') +
      (Game.CAP[d.id] ? `<p>Cư dân: ${o.res || 0} / ${Game.CAP[d.id]} · đang ở nhà ${o.inside || 0}</p>` : '') +
      (o.buf ? `<p>Hàng chờ chuyển: ${Object.entries(o.buf).map(([k, v]) => k + ' ' + Math.floor(v)).join(', ') || '—'}</p>` : '') +
      `<p>Dễ cháy: ${d.flam}/5` + (d.range ? ` · Phạm vi: ${d.range} ô` : '') + `</p><p>Chi phí xây: ${this.costStr(d.cost)}</p><button data-act="del">Phá dỡ</button> <button data-act="fire">🔥 Thử gây cháy</button>`;
  }
};
