// Khởi động: nối menu, thế giới, giao diện và nhạc.
(function () {
  const canvas = document.getElementById('game'), ov = document.getElementById('overlay');
  Game.music.init(); Game.chat.init(); Game.sim.reset(); Game.hud.init();
  function start(mode, load) {
    Game.multiplayer.mode = mode;
    if (load) { if (!Game.save.read()) return; } else Game.world.load();
    Game.menu.show(false); canvas.hidden = false; ov.hidden = false; Game.hud.show(true);
    mode === 'multi' ? Game.chat.open() : Game.chat.close();
    Game.renderer.init(); Game.renderer.start(); Game.music.play();
  }
  Game.menu.init({ startSolo: () => start('solo'), startMulti: () => start('multi'), cont: () => start('solo', true) });
  document.getElementById('btn-back').onclick = () => {
    Game.renderer.stop(); canvas.hidden = true; ov.hidden = true; Game.hud.show(false); Game.chat.close(); Game.menu.init(Game.menu.h); Game.menu.show(true);
  };
})();
