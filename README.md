# Đại Thành — Thịnh Thế Hoa Hạ (bản mới)

Game xây thành trấn Trung Hoa đẳng phối, lấy cảm hứng từ Thriving City: Song, chạy thẳng trên trình duyệt (không cần cài, không cần máy chủ).

## Đưa lên GitHub Pages
1. Tạo repo mới, tải **toàn bộ nội dung thư mục này** lên (file `index.html` phải nằm ở gốc repo).
2. Vào *Settings → Pages* → Source: *Deploy from a branch* → chọn nhánh `main`, thư mục `/ (root)` → Save.
3. Đợi ~1 phút, mở `https://<tên-bạn>.github.io/<tên-repo>/`.

Muốn thử trên máy: chạy `python3 -m http.server` trong thư mục này rồi mở `http://localhost:8000`.

## Cách chơi
- **Một người / Nhiều người → chọn bản đồ** (3 bản đồ có biển, hồ, sông, vách đá bờ nước).
- Mỗi bản đồ có chỗ lưu riêng cho từng chế độ. Menu hiện *Chơi tiếp* nếu có bản lưu. Tự lưu mỗi năm và khi bấm ⌂; nút 💾 lưu tay.
- Vào game phải **đặt Trấn Sở (3×3)** lên đất liền trước, lúc đó thời gian mới chạy và 10 cư dân đến.
- Chuột trái đặt/chọn · kéo chuột để di chuyển · lăn chuột để thu phóng · chuột phải hoặc Esc để hủy · Space tạm dừng.

## Nhiều người (2 người)
- Chủ phòng: *Nhiều người chơi → Tạo phòng* → chọn bản đồ (hoặc *Chơi tiếp*) → đọc **mã phòng** ở giữa trên cùng, gửi cho bạn.
- Khách: *Nhiều người chơi* → nhập mã → *Vào phòng*.
- Hai người xây chung một thành trấn và thấy chuột của nhau (đỏ = chủ phòng, xanh = khách). Chủ phòng chạy mô phỏng, điều khiển tốc độ và lưu game.
- Dùng WebRTC + PeerJS (máy chủ bắt tay miễn phí của PeerJS), nên **cả hai cần Internet**. Một số mạng công ty/trường chặn WebRTC thì sẽ không vào được phòng.

## Cấu trúc
`js/world/map.js` bản đồ (thêm bản đồ ở `Game.maps`) · `js/network/multiplayer.js` phòng 2 người · `js/sim/save.js` lưu game · `js/ui/menu.js` menu · còn lại giữ nguyên như bản cũ (sim, economy, fx, buildings…).
Công trình lập trấn `hall` khai báo cuối `js/data/buildings.js`.
