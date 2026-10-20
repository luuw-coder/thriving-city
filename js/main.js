// Điểm khởi động: nối menu, thế giới và renderer lại với nhau.
(function () {
  const canvas = document.getElementById('game');
  const hud = document.getElementById('hud');
  function showGame(v) { canvas.hidden = !v; hud.hidden = !v; Game.menu.show(!v); }

  Game.menu.init({
    startSolo() {
      Game.world.load();
      showGame(true);
      Game.renderer.init();
      Game.renderer.start();
    },
    startMulti() { Game.multiplayer.connect(); }
  });

  document.getElementById('btn-back').addEventListener('click', () => {
    Game.renderer.stop();
    showGame(false);
  });
})();
