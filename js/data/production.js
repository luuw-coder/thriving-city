// SỐ LIỆU KINH TẾ — chỉnh ở đây để cân bằng, không cần sửa code.
Game.CAP = { house1: 4, house2: 6, house3: 8, court: 10 };                 // sức chứa nhà ở
// Sản xuất mỗi ngày khi đủ nhân công: in = nguyên liệu lấy từ kho, out = sản phẩm (về hàng chờ của công trình)
Game.PROD = {
  field: { out: { LT: 8 } }, veg: { out: { LT: 3 } }, lumber: { out: { G: 5 } }, quarry: { out: { 'Đ': 4 } },
  claymine: { out: { 'Sét': 4 } }, ironmine: { out: { S: 2 } },
  kiln: { in: { 'Sét': 4, G: 2 }, out: { Ga: 3, Ng: 2 } }
};
Game.UNLOCK = { ironmine: 50, ranch: 50, watch: 50, house2: 30, house3: 100, hostel: 100, well2: 100, mill: 100, sawmill: 100, market: 100, yamen: 100, police: 100, archer: 100, wall: 100,
  store2: 300, tea: 300, tavern: 300, school: 300, clinic: 300, temple: 300, court: 500, barracks: 500, smelter: 500 };   // dân số tối thiểu để mở
Game.TITLES = [[0, 'Khu định cư sơ khai'], [50, 'Khởi Sơn Trại'], [100, 'Bình An Thôn'], [300, 'Tụ Thương Thị'], [500, 'Sầm Uất Trấn'], [1000, 'Thịnh Vượng Huyện'], [2000, 'Trầm Cổ Phủ'], [5000, 'Vạn Dân Châu']];
Game.FOOD_PER_PERSON = 0.25; Game.BUFFER = 20; Game.STORE_CAP = { store1: 400, store2: 1600 }; Game.BASE_CAP = 1000; Game.HAUL_PER_WORKER = 12; Game.MAX_POP = 5000; Game.RES_SHARE = 0.35; // mỗi loại hàng chỉ được chiếm tối đa 35% sức chứa kho, để không loại nào chặn hết kho
