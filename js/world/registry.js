// "Sổ đăng ký" các loại vật thể. Mỗi file trong js/world/objects/ tự đăng ký vào đây.
Game.objectTypes = {};
Game.registerObject = function (name, definition) {
  Game.objectTypes[name] = definition;
};
