// Menu chính và bảng nhạc/cài đặt.
Game.menu = {
  init(h) {
    this.h = h;
    const items = [...(Game.save.has() ? [{ label: 'Tiếp tục', note: 'Tải thành trấn đã lưu', onClick: h.cont }] : []),
      { label: 'Chơi một mình', note: 'Xây dựng thành trấn của bạn', onClick: h.startSolo },
      { label: 'Nhiều người chơi', note: 'Bản thử: có khung chat, chưa đồng bộ thành phố', onClick: h.startMulti },
      { label: 'Âm nhạc & cài đặt', note: 'Thêm nhạc, chỉnh âm lượng', onClick: () => this.openSettings() }
    ];
    const box = document.getElementById('menu-buttons'); box.innerHTML = '';
    for (const it of items) { const b = document.createElement('button'); b.className = 'menu-btn'; b.innerHTML = `${it.label}<small>${it.note}</small>`; b.onclick = it.onClick; box.appendChild(b); }
  },
  show(v) { document.getElementById('menu').hidden = !v; },
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
