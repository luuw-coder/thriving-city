// Khởi động: nối menu, thế giới, giao diện và nhạc.
(function () {
  const canvas = document.getElementById('game'), ov = document.getElementById('overlay');
  Game.music.init(); Game.chat.init(); Game.sim.reset(); Game.hud.init();
  Game.session = { mode: 'solo', map: 'gn' };
  Game.begin = () => {   // vào màn chơi (khách chỉ gọi sau khi nhận ảnh chụp đầu tiên từ chủ phòng)
    Game.menu.show(false); canvas.hidden = false; ov.hidden = false; Game.hud.show(true);
    Game.multiplayer.mode === 'solo' ? Game.chat.close() : Game.chat.open();
    Game.renderer.init(); Game.renderer.start(); Game.music.play();
  };
  Game.quit = () => {   // về menu (tự lưu nếu đang chơi)
    Game.save.write(true); Game.multiplayer.reset(); Game.renderer.stop(); canvas.hidden = true; ov.hidden = true;
    Game.hud.show(false); Game.chat.close(); Game.sim.reset(); Game.menu.show(true); Game.menu.init(Game.menu.h);
  };
  function start(o) {   // o = { mode: 'solo'|'host'|'guest', map, cont, code }
    Game.multiplayer.reset(); Game.session = { mode: o.mode, map: o.map || 'gn' };
    if (o.mode === 'guest') { Game.multiplayer.join(o.code); return; }
    if (o.cont) { if (!Game.save.read(o.mode, o.map)) return; } else Game.world.load(o.map);
    if (o.mode === 'host') Game.multiplayer.host();
    Game.begin();
  }
  Game.menu.init(start);
  document.getElementById('btn-back').onclick = Game.quit;
})();
