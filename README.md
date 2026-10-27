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
- **Chuột phải kéo = di chuyển bản đồ** · **chuột trái = tương tác** (đặt, chọn, phá, chặt) · lăn chuột = thu phóng · chuột phải bấm nhanh hoặc Esc = hủy lệnh · Space = tạm dừng.
- **Thanh xây dựng:** rê chuột vào 1 trong 8 nút nhóm thì hiện danh sách công trình; bấm chỗ khác để đóng. Đường/ruộng nhỏ: giữ chuột trái kéo để đặt liên tục.
- **Nút thoi bên phải thanh xây dựng:** ✔ chọn · ✖ phá dỡ · 🪓 chặt cây (bấm hoặc kéo lên cây; người rảnh rỗi sẽ ra chặt, +4 gỗ/cây) · ↺ bỏ đánh dấu.
- **4 nút tròn bên trái (kính lúp):** 🙂 ai rảnh rỗi/chưa có nhà · 💧 phạm vi giếng, chữa cháy · 🔨 việc làm (người/chỗ) · 🏠 nhà ở (số người/sức chứa).
- **Công trình 3 giai đoạn:** vừa đặt (móng + cọc) → xây dở (tường + giàn giáo) → hoàn thành. Công trình chỉ xây tiếp khi **thợ thật sự có mặt** ở công trường.
- **Dân có AI:** ban ngày đi làm (thợ ra công trường, nông dân ra ruộng…), chiều tối về nhà và vào trong nhà (nhà hiện số người đang ở), người chưa có nhà đứng gần Trấn Sở và tự đi tìm nhà trống, người rảnh rỗi đi loanh quanh hoặc ra chặt cây. Họ tránh nước/công trình và thích đi trên đường.
- **Bảng trái:** hạnh phúc, sức khỏe, "Kêu ca" (4 nắm đấm — càng nhiều dân càng bất mãn), thuế má (bấm để đổi mức), xem kho lúa / kho hàng.

## Nhiều người (2 người)
- Chủ phòng: *Nhiều người chơi → Tạo phòng* → chọn bản đồ (hoặc *Chơi tiếp*) → đọc **mã phòng** ở giữa trên cùng, gửi cho bạn.
- Khách: *Nhiều người chơi* → nhập mã → *Vào phòng*.
- Hai người xây chung một thành trấn và thấy chuột của nhau (đỏ = chủ phòng, xanh = khách). Chủ phòng chạy mô phỏng, điều khiển tốc độ và lưu game.
- Dùng WebRTC + PeerJS (máy chủ bắt tay miễn phí của PeerJS), nên **cả hai cần Internet**. Một số mạng công ty/trường chặn WebRTC thì sẽ không vào được phòng.

## Cấu trúc
`js/world/map.js` bản đồ (thêm bản đồ ở `Game.maps`) · `js/network/multiplayer.js` phòng 2 người · `js/sim/save.js` lưu game · `js/ui/menu.js` menu · còn lại giữ nguyên như bản cũ (sim, economy, fx, buildings…).
Công trình lập trấn `hall` khai báo cuối `js/data/buildings.js`.

## Thay hình (khi bạn có ảnh)
Mở `js/data/sprites.js`, bỏ dấu `//` ở dòng ví dụ và trỏ tới file PNG nền trong suốt trong thư mục `assets/`:
- Công trình: `house1: { src: ['assets/a_0.png', 'assets/a_1.png', 'assets/a_2.png'] }` — ba ảnh = vừa đặt / xây dở / hoàn thành.
- `_site`: ảnh công trường chung cho mọi công trình chưa có ảnh riêng · `_tree`: cây · `_person`: người.
- Đáy giữa ảnh nằm ở đỉnh dưới hình thoi nền; ảnh nên rộng bằng (rộng+dài)×32 px của công trình (chỉnh bằng `scale`, `dy`). Không cần sửa code nào khác.
Muốn đổi nền đất: sửa màu ở `js/world/map.js` (hàm `bake`).
