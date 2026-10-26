// Khung chat (chỉ hiện ở phòng nhiều người). Tin nhắn đi cùng đường kết nối với trò chơi.
Game.chat = {
  init() {
    const log = document.getElementById('chat-log'), inp = document.getElementById('chat-in');
    this.add = (who, t) => { const d = document.createElement('div'); d.textContent = who + ': ' + t; log.appendChild(d); log.scrollTop = 1e9; };
    inp.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter' && inp.value.trim()) { const t = inp.value.trim().slice(0, 200), n = Game.multiplayer.name(); this.add(n, t); Game.multiplayer.send({ t: 'chat', n, s: t }); inp.value = ''; }
    });
  },
  open() { document.getElementById('chat').hidden = false; document.getElementById('chat-log').innerHTML = ''; this.add('Hệ thống', 'Phòng 2 người: hai bạn cùng xây một thành trấn.'); },
  close() { document.getElementById('chat').hidden = true; }
};
