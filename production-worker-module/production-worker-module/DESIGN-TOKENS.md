# Design Tokens — QMS (dùng chung cho mọi role module)

## Màu sắc
| Token | Hex | Dùng cho |
|---|---|---|
| `--ink` | #14213D | Text chính, heading |
| `--steel` | #2D4A6B | Primary action, active nav |
| `--steel-dark` | #0F1B2E | Sidebar, timer box, login background |
| `--amber` | #E8A33D | Cảnh báo / priority / accent điểm nhấn |
| `--red` | #C0483B | Fail / overdue / reject |
| `--green` | #2F8F6E | Pass / completed / success |
| `--bg` | #EEF1F5 | Nền app |
| `--card` | #FFFFFF | Nền panel/card |
| `--border` | #DCE1E8 | Viền |
| `--muted` | #6B7686 | Text phụ |

## Typography
- **Display / heading**: `Oswald` (công nghiệp, chắc, phù hợp bảng hiệu nhà máy)
- **Body**: `Inter`
- **Mã / dữ liệu định danh** (WO No., Item Code, Partcode, Report No.): `IBM Plex Mono` — luôn dùng monospace cho các mã để dễ đọc/so khớp khi quét mã vạch.

## Component pattern (signature) — bắt buộc tái sử dụng
- **`.wo-tag`**: thẻ ticket dạng "work-order tag" vật lý — có dải màu trái theo priority, notch tròn bên trái, dải mã vạch trang trí phía dưới. Dùng cho mọi danh sách ticket/task ở tất cả role.
- **`.status-chip`**: pill bo tròn, viết hoa, màu theo trạng thái (wait/progress/paused/completed/overdue).
- **`.field-grid`**: layout 2 cột label-nhỏ-uppercase / value-đậm, dùng cho mọi màn hình chi tiết (detail screens) ở mọi role.
- **`.panel` + `.sect-title`**: khối thông tin có tiêu đề uppercase màu steel, viền dưới — dùng để chia section trong trang chi tiết.
- **Sidebar tối màu (`--steel-dark`) + nav item có thanh amber bên trái khi active** — giữ nguyên cho mọi role, chỉ đổi danh sách menu theo quyền.

## Nguyên tắc khi tạo role module mới
1. Không tạo màu/font mới ngoài bảng trên.
2. Mọi mã định danh (ID) đều dùng font mono.
3. Mọi danh sách task/ticket đều dùng `.wo-tag` pattern, không dùng bảng (table) thô cho danh sách chính — table chỉ dùng cho lịch sử/báo cáo (như `renderHistory()`).
4. Trạng thái luôn thể hiện bằng `.status-chip`, không dùng text thường.
