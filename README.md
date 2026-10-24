# Đại Thành — Thịnh Thế Hoa Hạ

## Chạy thử
- Mở trực tiếp `index.html` bằng trình duyệt, hoặc
- Đẩy lên GitHub → Settings → Pages → chọn nhánh `main`, thư mục `/ (root)`.

## Cấu trúc
| Thư mục / file | Việc của nó |
|---|---|
| `index.html` | Khung trang + danh sách file nạp (thứ tự quan trọng) |
| `js/core/` | Cấu hình, đổi toạ độ đẳng phối, camera, vẽ hình |
| `js/world/map.js` | Nền đất |
| `js/world/objects/*.js` | MỖI LOẠI VẬT THỂ MỘT FILE (cây, nhà...) |
| `js/data/placements.js` | **Vị trí** đặt vật thể trên bản đồ |
| `js/ui/menu.js` | Menu chính |
| `js/network/multiplayer.js` | Chỗ dành cho nhiều người chơi (làm sau) |

## Thêm một vật thể mới (ví dụ: giếng nước)
1. Tạo `js/world/objects/well.js`, gọi `Game.registerObject('well', { draw(ctx, obj) {...} })`.
2. Thêm `<script src="js/world/objects/well.js"></script>` vào `index.html` (cùng chỗ với tree.js).
3. Thêm `{ type: 'well', x: 10, y: 12 }` vào `js/data/placements.js`.

## Lộ trình (theo bản thiết kế v2.0)
1. ✅ Nền tảng: bản đồ, camera, vật thể, menu
2. Dân cư + bảng phân bổ nhân lực
3. Nhà ở, nông nghiệp, kho, chợ, chuỗi cung ứng
4. Thu chi, lưu/tải, tổng kết cuối năm
5. Quan lại, trị an, y tế... (Mức 2)
6. Nhiều người chơi (Mức 3)

## Cập nhật v0.2
- `js/data/buildings.js`: 31 công trình (theo file thiết kế), vẽ tạm bằng khối màu.
- `js/sim/sim.js`: thời gian, xây dựng có tiến độ, hỏa hoạn (lan, giếng giảm nguy cơ), người xách nước.
- `js/fx/fx.js`: lửa, khói, người cứu hỏa, nước té — vẽ bằng code, thay bằng sprite sau.
- `js/data/music.js` + `assets/audio/`: thêm nhạc. `js/ui/chat.js`: khung chat chế độ nhiều người (bản thử).
- Điều khiển: chuột trái đặt/chọn, chuột phải hoặc Esc hủy, Space tạm dừng, 1-3 đổi tốc độ.

## Cập nhật v0.3
- Dân cư + nhà ở + nhân công thật (`js/sim/economy.js`): người dân tự tìm nhà và việc, nhập cư khi có nhà trống, lương thực và việc làm. Chỉnh số nhân công từng công trình trong bảng thông tin (nút − / +).
- Sản xuất: ruộng → lương thực; nhà đốn gỗ, mỏ đá, mỏ đất sét, mỏ sắt; lò gạch dùng đất sét + gỗ. Hàng đi từ công trình về kho nhờ nhân công kho. Kho đầy/thiếu nguyên liệu/thiếu người đều có thông báo lý do.
- Lương thực, thuế/lương, danh xưng theo dân số, mở khóa công trình theo dân số. Mùa đông ruộng cho ít.
- Lính cứu hỏa chỉ ra quân khi trạm cứu hỏa có nhân công.
- Lưu/tải (localStorage), tự lưu mỗi năm, nút "Tiếp tục" ở menu.
- Số liệu cân bằng nằm ở `js/data/production.js`.
- Ảnh động cho đám cháy: xem `js/data/assets.js` (sprite PNG / gif / webm).
