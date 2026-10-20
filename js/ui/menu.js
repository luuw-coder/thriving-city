// Menu chính. Muốn thêm nút: thêm 1 dòng vào mảng items.
Game.menu = {
  init(handlers) {
    const mp = Game.multiplayer.available;
    const items = [
      { label: 'Chơi một mình', note: 'Xây dựng thành phố của bạn', onClick: handlers.startSolo },
      { label: 'Nhiều người chơi', note: mp ? 'Chơi cùng bạn bè' : 'Sắp ra mắt', disabled: !mp, onClick: handlers.startMulti },
      { label: 'Cài đặt', note: 'Chưa có', disabled: true }
    ];
    const box = document.getElementById('menu-buttons');
    box.innerHTML = '';
    for (const it of items) {
      const b = document.createElement('button');
      b.className = 'menu-btn';
      b.disabled = !!it.disabled;
      b.innerHTML = `${it.label}<small>${it.note}</small>`;
      if (it.onClick) b.addEventListener('click', it.onClick);
      box.appendChild(b);
    }
  },
  show(v) { document.getElementById('menu').hidden = !v; }
};
