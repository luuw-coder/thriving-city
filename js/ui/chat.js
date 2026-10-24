// Khung chat (chỉ hiện ở chế độ nhiều người). Bản thử dùng BroadcastChannel; khi có máy chủ chỉ cần thay hàm send/nhận.
Game.chat = {
  name: 'Người chơi ' + (Math.random() * 90 + 10 | 0), ch: null,
  init() {
    const log = document.getElementById('chat-log'), inp = document.getElementById('chat-in');
    this.add = (who, t) => { const d = document.createElement('div'); d.textContent = who + ': ' + t; log.appendChild(d); log.scrollTop = 1e9; };
    if (window.BroadcastChannel) { this.ch = new BroadcastChannel('dai-thanh-chat'); this.ch.onmessage = e => this.add(e.data.n, e.data.t); }
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && inp.value.trim()) { const t = inp.value.trim(); this.add(this.name, t); if (this.ch) this.ch.postMessage({ n: this.name, t }); inp.value = ''; } });
  },
  open() { document.getElementById('chat').hidden = false; document.getElementById('chat-log').innerHTML = ''; this.add('Hệ thống', 'Bản thử: chat giữa các tab cùng máy, thành phố chưa đồng bộ. Tên bạn: ' + this.name); },
  close() { document.getElementById('chat').hidden = true; }
};
