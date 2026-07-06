# Module: Production Worker (QMS)

> Đây là 1 trong nhiều "role module" của hệ thống QMS/MES.
> Các role khác (QC Worker, QC Manager, Production Manager, Higher Department) nên được xây theo **đúng cấu trúc và design token** của module này để toàn hệ thống đồng bộ.

## 1. Vai trò & phạm vi
Production Worker là người nhận ticket sửa chữa (repair ticket) do QC tạo ra sau khi phát hiện lỗi (xem `system-flow.png` ở thư mục gốc dự án), thực hiện sửa chữa, và gửi kết quả về QC xác nhận.

## 2. Danh sách màn hình (đúng thứ tự flow)
| # | Màn hình | File tham chiếu trong `index.html` | Mô tả |
|---|----------|--------------------------------------|-------|
| 1 | Login | `#loginScreen` | Đăng nhập |
| 2 | Dashboard | `renderDashboard()` | KPI hôm nay + upcoming repair + notification |
| 3 | My Repair Tickets | `renderTickets()` | Danh sách ticket dạng "work-order tag" |
| 4 | Repair Ticket Detail | `renderDetail()` | Chi tiết ticket, có nút **View/Print Quarantine Report** |
| 5 | Repair Working | `renderWorking()` | Timer, checklist, vật tư, upload ảnh |
| 6 | Pause Repair | `#modalPause` | Modal lý do tạm dừng |
| 7 | Complete Repair | `#modalComplete` | Modal kết thúc sửa chữa |
| 8 | Repair History | `renderHistory()` | Lịch sử đã sửa |
| — | Quarantine Report (mới thêm) | `#modalQuarantine` / `openQuarantine()` | Phiếu cách ly, xem + in, format song ngữ EN/VN |

## 3. Data model
Xem chi tiết đầy đủ field + kiểu dữ liệu trong `DATA-MODEL.md`. Object chính: `Ticket` (mảng `tickets` trong file `index.html`, phần `MOCK DATA`).

## 4. Design system dùng trong module này
Xem `DESIGN-TOKENS.md`. **Bắt buộc dùng lại đúng token này cho các module role khác** (QC Worker, QC Manager, Production Manager, Higher Department) để UI đồng nhất toàn hệ thống.

## 5. Cách tích hợp vào dự án lớn
### Nếu dự án dùng framework (React / Next / Vue...)
1. Copy `DESIGN-TOKENS.md` → chuyển thành `tokens.css` hoặc `tailwind.config` dùng chung ở `/src/shared/styles/`.
2. Tách `index.html` thành component theo từng màn hình đã liệt kê ở mục 2 (mỗi hàm `renderXxx()` = 1 component/page).
3. Đặt module vào: `/src/modules/production-worker/` gồm `pages/`, `components/`, `data/`.
4. Model `Ticket` trong `DATA-MODEL.md` → chuyển thành `types/ticket.ts` (interface) dùng chung cho mọi role, vì QC Worker/QC Manager cũng thao tác trên cùng entity này (chỉ khác quyền + hành động).

### Nếu chỉ cần tham khảo UI (chưa code lại)
Đặt nguyên `index.html` vào `/docs/mockups/production-worker.html` — dùng làm reference khi AI agent code các role khác, **không** deploy file này làm production code.

## 6. Hướng dẫn để AI (Antigravity) replicate module này cho role khác
Khi prompt AI agent, nên nói rõ:
- "Đọc `README.md`, `DATA-MODEL.md`, `DESIGN-TOKENS.md` trong `/production-worker/` trước khi code."
- "Giữ nguyên design token (màu, font, style card 'work-order tag', status chip) — chỉ đổi nội dung/hành động theo quyền của role mới."
- "Entity `Ticket` dùng chung schema, không tạo field trùng lặp khác tên."
- Với mỗi role mới, liệt kê rõ: **hành động được phép** (approve/reject, tạo ticket, gán người, xác nhận QC...) để AI biết khác biệt so với Production Worker.

## 7. Ghi chú nghiệp vụ quan trọng
- Trường **Quarantine Report** là bổ sung mới sau khi đổi input data — không có trong Excel gốc của QC, được sinh ra khi `Quarantine = YES`. Nếu role QC Worker/QC Manager cần tạo/sửa report này, dùng chung field trong `DATA-MODEL.md` phần "Quarantine Report".
- Các field còn thiếu trong Excel gốc (Repair Ticket ID, Assigned Worker, Repair Status, Start/End Time, Before/After Images...) đã được thêm vào model để module hoạt động đủ — cần đồng bộ các field này với backend thật khi tích hợp.
