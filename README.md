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
