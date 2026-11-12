# Thịnh Thế Đại Tống: kiến trúc

**Công nghệ:** HTML5 Canvas 2D + ES Modules thuần, Firebase Realtime Database. Chạy thẳng trên GitHub Pages, không cần build, mở được trên điện thoại. Chọn Canvas 2D thay vì Unity/Three.js vì game isometric 2D, bản đồ nhỏ, cần phát hành nhẹ.

```
index.html        khung giao diện (menu, HUD)
style.css         giao diện giấy da, menu cửa sổ, chuyển cảnh
fb.js             kết nối Firebase
store.js          tài khoản (theo tên), lưu màn chơi, bản đồ tự tạo
maps.js           bản đồ có sẵn + bộ sinh bản đồ
menu.js           các màn menu, trình tạo bản đồ, cảnh cửa sổ
grid.js           LƯỚI: láng giềng, khu chức năng, mạng đường
resources.js      TÀI NGUYÊN: chuỗi chế biến, kho, bán ở chợ
clock.js          THỜI GIAN: tháng, năm, bốn mùa, sưởi ấm
game.js           mô phỏng (step), sự kiện, vẽ, điều khiển, chơi mạng
```

**Luồng dữ liệu:** `step()` chạy mỗi tháng trên máy chủ phòng (hoặc máy người chơi đơn): grid.js -> sản xuất -> resources.js (chế biến, kho) -> dân số và lòng dân -> sự kiện (cháy, giặc, dịch) -> clock.js (mùa). Trạng thái `G` được đẩy lên Firebase cho 3 người còn lại.

**Đã có:** đường, kho, 2 chuỗi chế biến (lúa-bột-bánh, tơ-lụa), nâng nhà tranh lên nhà ngói, sưởi ấm mùa đông, thống kê.
**Chưa có:** tầng lớp xã hội, nhu cầu theo tầng lớp, phân bổ lao động, giao thương với thành lân cận, nha môn và sắc lệnh nâng cao, lễ hội, đất sét và quặng.
