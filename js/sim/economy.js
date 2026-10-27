// Dân cư, nhân công, sản xuất, vận chuyển về kho, lương thực, tiền, danh xưng. Chạy mỗi ngày trong game.
Game.econ = {
  init() { const s = Game.state; s.people = []; for (let i = 0; i < 10; i++) this.add(); this.assign(); },
  restore(n, keep) {   // keep: người cũ (khách giữ lại để họ không "nhảy" vị trí mỗi lần nhận ảnh chụp mới)
    const s = Game.state, W = Game.world; s.people = [];
    for (let i = 0; i < n; i++) { const p = keep && keep[i]; if (p) { p.home = p.job = p.task = p.dst = p.path = null; const a = p.at && W.occ[W.key(p.at.x, p.at.y)]; p.at = a && a.type === 'building' ? a : null; s.pid = Math.max(s.pid, p.id); s.people.push(p); } else this.add(); }
    this.assign();
  },
  add() { const s = Game.state; s.people.push({ id: ++s.pid, home: null, job: null }); },
  siteWant(o) { return Math.min(5, 1 + Math.floor(o.w * o.h / 3)); },   // số thợ cần cho 1 công trường
  want(o) { if (o.prog < 1) return this.siteWant(o); if (!o.def.jobs) return 0; return o.want === undefined ? o.def.jobs : o.want; },
  prio(o) { return o.prog < 1 ? -1 : o.def.g === 'farm' ? 0 : (o.def.role === 'store' || o.def.role === 'fire') ? 1 : 2; },
  titleIdx(pop) { let k = 0; Game.TITLES.forEach((t, i) => { if (pop >= t[0]) k = i; }); return k; },
  winter() { return Math.floor(Game.state.day % 360 / 90) === 3; },
  assign() { // xếp nhà ở và việc làm cho từng người
    const s = Game.state, objs = Game.world.objects, alive = new Set(objs);
    const B = objs.filter(o => o.type === 'building'); B.forEach(o => { o.workers = 0; o.res = 0; });
    const W = B.filter(o => this.want(o) > 0).sort((a, b) => this.prio(a) - this.prio(b));
    const H = B.filter(o => o.prog >= 1 && Game.CAP[o.def.id]);
    for (const p of s.people) { if (p.home && alive.has(p.home) && p.home.res < Game.CAP[p.home.def.id]) p.home.res++; else p.home = null; }
    let hk = 0; for (const p of s.people) if (!p.home) { while (hk < H.length && H[hk].res >= Game.CAP[H[hk].def.id]) hk++; if (hk >= H.length) break; p.home = H[hk]; H[hk].res++; }
    const cap = Math.max(2, Math.ceil(s.people.length * .5)); let sb = 0;   // tối đa nửa số dân đi làm thợ xây
    for (const p of s.people) { const j = p.job; if (j && alive.has(j) && j.workers < this.want(j)) { j.workers++; if (j.prog < 1) sb++; } else p.job = null; }
    let k = 0; for (const p of s.people) { if (p.job) continue; while (k < W.length && (W[k].workers >= this.want(W[k]) || (W[k].prog < 1 && sb >= cap))) k++; if (k >= W.length) break; p.job = W[k]; W[k].workers++; if (W[k].prog < 1) sb++; }
    let open = 0; for (const o of W) if (o.prog >= 1) open += Math.max(0, this.want(o) - o.workers);
    const emp = s.people.filter(p => p.job).length;
    s.stats = { pop: s.people.length, cap: H.reduce((a, h) => a + Game.CAP[h.def.id], 0), emp, unemp: s.people.length - emp, open, homeless: s.people.filter(p => !p.home).length };
  },
  day() {
    const s = Game.state, r = s.res; this.assign();
    // sản xuất
    for (const o of Game.world.objects) {
      if (o.type !== 'building' || o.prog < 1) continue;
      const P = Game.PROD[o.def.id]; o.why = '';
      if (!P) { if (o.def.jobs > 0 && o.workers < this.want(o)) o.why = 'Thiếu nhân công'; continue; }
      o.buf = o.buf || {};
      if (!o.workers) { o.why = 'Không có nhân công'; continue; }
      const f = o.workers / o.def.jobs, m = (o.def.id === 'field' || o.def.id === 'veg') && this.winter() ? 0.4 : 1;
      if (Object.values(o.buf).reduce((a, b) => a + b, 0) >= Game.BUFFER) { o.why = 'Hàng chờ đầy — cần kho và nhân công vận chuyển'; continue; }
      let miss = null; for (const k in P.in || {}) if ((r[k] || 0) < P.in[k] * f) miss = k;
      if (miss) { o.why = 'Thiếu nguyên liệu: ' + miss; continue; }
      for (const k in P.in || {}) r[k] -= P.in[k] * f;
      for (const k in P.out) o.buf[k] = (o.buf[k] || 0) + P.out[k] * f * m;
      if (f < 1) o.why = `Thiếu nhân công (${o.workers}/${o.def.jobs})`; else if (m < 1) o.why = 'Mùa đông: ruộng cho ít';
    }
    // vận chuyển hàng chờ về kho (đơn giản hóa: chưa đi theo đường)
    const stores = Game.sim.list('store');
    if (stores.length) {
      const cap = Game.BASE_CAP + stores.reduce((a, o) => a + Game.STORE_CAP[o.def.id], 0);
      let left = Game.HAUL_PER_WORKER * stores.reduce((a, o) => a + (o.workers || 0), 0);
      let tot = Object.entries(r).filter(([k]) => k !== 'T').reduce((a, [, v]) => a + v, 0);
      for (const o of Game.world.objects) if (o.buf) for (const k in o.buf) {
        const q = Math.min(o.buf[k], left, Math.max(0, cap - tot), Math.max(0, cap * Game.RES_SHARE - (r[k] || 0))); if (q <= 0) continue;
        o.buf[k] -= q; r[k] = (r[k] || 0) + q; left -= q; tot += q;
      }
      if (tot >= cap - 1 && s.day % 10 === 0) Game.notify('Kho đầy — hãy xây thêm kho', 'warn');
    }
    // lương thực
    const need = s.people.length * Game.FOOD_PER_PERSON;
    if (r.LT >= need) { r.LT -= need; s.hunger = 0; }
    else { r.LT = 0; s.hunger++; if (s.hunger % 3 === 1) Game.notify('Thiếu lương thực! Dân đang đói', 'red'); if (s.hunger >= 8 && s.hunger % 3 === 0 && s.people.length > 1) { s.people.pop(); s.left = (s.left || 0) + 1; } }
    // tiền: thuế từ người có việc, trả lương nhân viên công
    let wage = 0; for (const o of Game.world.objects) if (o.type === 'building' && ['civic', 'army', 'store'].includes(o.def.g) && o.workers) wage += o.workers;
    r.T += s.stats.emp * 1.2 * Game.TAX[s.tax].m - wage;
    if (r.T < 0 && s.day % 10 === 0) Game.notify('Ngân khố âm', 'warn');
    // nhập cư: cần nhà trống, lương thực, và việc làm
    const pop = s.people.length, free = s.stats.cap - pop;
    if (free > 0 && pop < Game.MAX_POP && s.hunger === 0 && r.LT >= pop * 1.5 && (s.stats.open > 0 || pop < 15) && s.day % 2 === 0) {
      const n = Math.min(free, Math.max(1, Math.ceil(pop * 0.04)), 8); for (let i = 0; i < n; i++) this.add(); s.arrived = (s.arrived || 0) + n;
    }
    if (s.day % 10 === 0 && s.arrived) { Game.notify(s.arrived + ' người mới nhập cư', 'info'); s.arrived = 0; }
    if (s.day % 10 === 0 && s.left) { Game.notify(s.left + ' người bỏ đi vì đói', 'red'); s.left = 0; }
    this.assign();
    const P = Math.max(1, s.people.length), clin = Game.world.objects.filter(o => o.type === 'building' && o.prog >= 1 && o.def.id === 'clinic').length;   // hạnh phúc & sức khỏe → mức "kêu ca"
    s.happy = Math.max(0, Math.min(100, Math.round(72 + Game.TAX[s.tax].h - s.stats.homeless / P * 45 - s.stats.unemp / P * 25 - (s.hunger ? 30 : 0) - s.fires.length * 4)));
    s.health = Math.max(0, Math.min(100, Math.round(92 - Math.min(40, s.hunger * 4) + Math.min(8, clin * 4) - s.fires.length * 2)));
    const t = this.titleIdx(s.stats.pop); if (t > s.title) Game.notify('Thăng cấp: ' + Game.TITLES[t][1], 'info');
    s.title = t;
  }
};
