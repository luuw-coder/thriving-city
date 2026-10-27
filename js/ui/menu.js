// Menu chính: chọn chế độ → chọn bản đồ (có chỗ lưu riêng cho từng bản đồ) → chơi. Có cả bảng nhạc/cài đặt.
Game.menu = {
  init(h) { this.h = h; this.page('main'); },
  show(v) { document.getElementById('menu').hidden = !v; },
  page(p, mode) {
    const box = document.getElementById('menu-buttons'); box.innerHTML = ''; box.className = p === 'maps' ? 'wide' : '';
    const btn = (label, note, fn, to) => { const b = document.createElement('button'); b.className = 'menu-btn'; b.innerHTML = label + (note ? `<small>${note}</small>` : ''); b.onclick = fn; (to || box).appendChild(b); return b; };
    if (p === 'main') {
      btn('Chơi một mình', 'Chọn bản đồ, xây thành trấn của bạn', () => this.page('maps', 'solo'));
      btn('Nhiều người chơi', 'Phòng 2 người, thấy chuột của nhau', () => this.page('multi'));
      btn('Âm nhạc & cài đặt', 'Thêm nhạc, chỉnh âm lượng', () => this.openSettings());
    } else if (p === 'multi') {
      btn('Tạo phòng', 'Chọn bản đồ, rồi gửi mã phòng cho bạn', () => this.page('maps', 'host'));
      const row = document.createElement('div'); row.className = 'join'; row.innerHTML = '<input id="jc" maxlength="8" placeholder="Mã phòng"><button id="jb">Vào phòng</button>'; box.appendChild(row);
      row.querySelector('#jb').onclick = () => { const c = row.querySelector('#jc').value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''); if (c) this.h({ mode: 'guest', code: c }); };
      btn('← Quay lại', '', () => this.page('main'));
    } else {
      for (const id in Game.maps) {
        const M = Game.maps[id], sv = Game.save.info(mode, id), c = document.createElement('div'); c.className = 'mapc';
        c.innerHTML = `<canvas width="96" height="96"></canvas><b>${M.name}</b><small>${M.desc}</small>` + (sv ? `<small class="sv">Đã lưu: Năm ${sv.year}, ${sv.pop} dân</small>` : '');
        Game.map.preview(c.querySelector('canvas'), id);
        if (sv) btn('Chơi tiếp', '', () => this.h({ mode, map: id, cont: true }), c);
        btn(sv ? 'Chơi mới' : (mode === 'host' ? 'Tạo phòng' : 'Chơi'), '', () => this.h({ mode, map: id }), c);
        box.appendChild(c);
      }
      btn('← Quay lại', '', () => this.page(mode === 'solo' ? 'main' : 'multi'));
    }
  },
  openSettings() {
    const m = document.getElementById('modal'), M = Game.music; m.hidden = false;
    const draw = () => {
      m.innerHTML = `<div class="box"><h3>Âm nhạc</h3>
        <label>Âm lượng <input id="vol" type="range" min="0" max="1" step="0.05" value="${M.vol}"></label>
        <div class="trk">${M.tracks.length ? M.tracks.map((t, i) => `<button data-i="${i}" class="${i === M.i ? 'on' : ''}">${t.name}</button>`).join('') : '<small>Chưa có bài nào. Thêm file .mp3 vào assets/audio/ rồi khai báo trong js/data/music.js, hoặc nạp thử từ máy bên dưới.</small>'}</div>
        <label class="file">+ Nạp nhạc từ máy (chỉ trong phiên này)<input id="addm" type="file" accept="audio/*" multiple hidden></label>
        <div><button id="mt">⏯ Phát/Tạm dừng</button> <button id="mn">⏭ Bài kế</button> <button id="mx">Đóng</button></div></div>`;
      m.querySelector('#vol').oninput = e => M.setVol(+e.target.value);
      m.querySelector('#addm').onchange = e => { M.addFiles(e.target.files); draw(); };
      m.querySelector('#mt').onclick = () => M.toggle(); m.querySelector('#mn').onclick = () => { M.next(); draw(); };
      m.querySelector('#mx').onclick = () => { m.hidden = true; };
      m.querySelectorAll('.trk button').forEach(b => b.onclick = () => { M.play(+b.dataset.i); draw(); });
    };
    draw();
  }
};
