// BẢN ĐỒ: đất liền + nước (biển/hồ/sông), không phải mặt phẳng. Mỗi bản đồ chỉ là 1 hàm cho biết ô nào là nước — thêm bản đồ mới ở Game.maps.
(function () {
  const H = (i, j, s) => { const n = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }, sm = u => u * u * (3 - 2 * u);
  const N = (x, y, s) => { const i = Math.floor(x), j = Math.floor(y), u = sm(x - i), v = sm(y - j); return H(i, j, s) * (1 - u) * (1 - v) + H(i + 1, j, s) * u * (1 - v) + H(i, j + 1, s) * (1 - u) * v + H(i + 1, j + 1, s) * u * v; };
  const nz = (x, y, s) => N(x / 7, y / 7, s) * .65 + N(x / 3.5, y / 3.5, s + 9) * .35;
  Game.maps = {   // water(x, y, n): true nếu ô là nước (n = nhiễu 0..1 làm bờ nước lượn)
    gn: { name: 'Giang Nam', seed: 1, desc: 'Hai vịnh xanh biếc, đất liền chạy chéo.', water: (x, y, n) => Math.max(1 - Math.hypot(x - 6, y - 8) / 17, 1 - Math.hypot(x - 43, y - 41) / 15) + (n - .5) * .7 > .2 },
    hk: { name: 'Hải Khẩu', seed: 2, desc: 'Biển lớn phía đông, vịnh nhỏ phía nam.', water: (x, y, n) => x + (n - .5) * 16 > 35 || Math.hypot(x - 12, y - 47) < 9 + (n - .5) * 8 },
    ht: { name: 'Hồ Sơn Thủy', seed: 3, desc: 'Hồ rộng bên trái, sông cắt ngang phía nam.', water: (x, y, n) => Math.hypot(x - 14, y - 20) < 10 + (n - .5) * 10 || Math.abs(y - (41 + 3 * Math.sin(x / 5))) < 1.6 + (n - .5) * 2.5 }
  };
  Game.map = {
    id: '', water: null, trees: [], cache: null, ox: 0,
    gen(id) {
      const C = Game.config, W = C.MAP_W, Hh = C.MAP_H, m = Game.maps[id], water = new Uint8Array(W * Hh), trees = [];
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = y * W + x; water[i] = m.water(x, y, nz(x, y, m.seed)) ? 1 : 0; if (!water[i] && nz(x, y, m.seed + 5) > .58 && H(x, y, m.seed) > .3) trees.push([x, y]); }
      return { water, trees };
    },
    init(id) { if (this.id === id && this.cache) return; const g = this.gen(id); this.id = id; this.water = g.water; this.trees = g.trees; this.bake(); },
    isWater(x, y) { const C = Game.config; return x < 0 || y < 0 || x >= C.MAP_W || y >= C.MAP_H || this.water[y * C.MAP_W + x] === 1; },
    tilePath(ctx, x, y) {
      const p = [Game.iso.toScreen(x, y), Game.iso.toScreen(x + 1, y), Game.iso.toScreen(x + 1, y + 1), Game.iso.toScreen(x, y + 1)];
      ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let i = 1; i < 4; i++) ctx.lineTo(p[i].x, p[i].y); ctx.closePath();
    },
    bake() {   // vẽ sẵn nền đất + vách đá bờ nước vào 1 ảnh, mỗi khung hình chỉ dán ảnh này
      const C = Game.config, I = Game.iso, W = C.MAP_W, Hh = C.MAP_H, cv = this.cache = document.createElement('canvas');
      this.ox = Hh * C.TILE_W / 2; cv.width = (W + Hh) * C.TILE_W / 2; cv.height = (W + Hh) * C.TILE_H / 2 + 20;
      const c = cv.getContext('2d'); c.translate(this.ox, 0);
      const face = (p, q, col) => { c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.lineTo(q.x, q.y + 10); c.lineTo(p.x, p.y + 10); c.closePath(); c.fillStyle = col; c.fill(); };
      for (let s = 0; s < W + Hh - 1; s++) for (let x = Math.max(0, s - Hh + 1); x <= Math.min(s, W - 1); x++) {
        const y = s - x; if (this.isWater(x, y)) continue;
        if (this.isWater(x, y + 1)) face(I.toScreen(x, y + 1), I.toScreen(x + 1, y + 1), '#9b7a55');
        if (this.isWater(x + 1, y)) face(I.toScreen(x + 1, y + 1), I.toScreen(x + 1, y), '#7d6044');
        this.tilePath(c, x, y); c.fillStyle = (x + y) % 2 ? '#ebe8dd' : '#e6e2d5'; c.fill(); c.strokeStyle = 'rgba(120,110,90,.1)'; c.stroke();
      }
    },
    draw(ctx) { ctx.drawImage(this.cache, -this.ox, 0); },
    preview(cv, id) {   // ảnh nhỏ cho menu chọn bản đồ
      const g = this.gen(id), c = cv.getContext('2d'), W = Game.config.MAP_W, tr = new Set(g.trees.map(t => t[1] * W + t[0]));
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { c.fillStyle = g.water[y * W + x] ? '#5fb3a5' : tr.has(y * W + x) ? '#8aa886' : '#ebe8dd'; c.fillRect(x * 2, y * 2, 2, 2); }
    }
  };
})();
