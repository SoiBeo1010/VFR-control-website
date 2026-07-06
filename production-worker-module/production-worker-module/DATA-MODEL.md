# Data Model — QMS Repair Ticket

Dùng chung cho mọi role (QC Worker tạo ra, Production Manager gán, Production Worker xử lý, QC Manager xác nhận).

## Ticket (từ Excel QC gốc)
| Field | Kiểu | Nguồn | Ghi chú |
|---|---|---|---|
| branchITW | string | Excel | Nhà máy |
| branchFGW | string | Excel | Nhà máy FG |
| id (WO No.) | string | Excel | Work Order, khoá chính |
| itemCode | string | Excel | Mã sản phẩm |
| partcode | string | Excel | Mã Part |
| woQty | number | Excel | Số lượng WO |
| inspector | string | Excel | ID QC |
| inspectorName | string | Excel | Người kiểm tra |
| inspectorDept | string | Excel | Bộ phận QC |
| stage | enum: Incoming / IPQC / Final | Excel | |
| inspectedDate | date | Excel | |
| inspectedTime | time | Excel | |
| inspectedQty | number | Excel | |
| passQty | number | Excel | |
| failQty | number | Excel | |
| quarantine | enum: YES / NO | Excel | Có bị cách ly hay không |
| defectCode | string | Excel | |
| defectCategory | string | Excel | Nhóm lỗi |
| defectOwner | string | Excel | Bộ phận chịu trách nhiệm |
| inspectorRecommend | string | Excel | Khuyến nghị QC |
| repairDept | string | Excel | Bộ phận sửa |
| remark | string | Excel | Ghi chú |

## Ticket — field bổ sung (không có trong Excel gốc, cần cho vận hành)
| Field | Kiểu | Mục đích |
|---|---|---|
| priority | enum: Low/Medium/High/Critical | Mức ưu tiên |
| deadline | datetime | Hạn hoàn thành |
| status | enum: Waiting Accept / In Progress / Paused / Completed / Overdue | Trạng thái ticket |
| repairMethod | string | Hướng dẫn sửa từ Production Manager |
| repairType | enum: Repair / Rework | |
| assignedWorker | string | Người được giao (chưa có trong bản demo, cần thêm khi nối backend) |
| startTime / endTime | datetime | Ghi nhận thời gian thực hiện |
| beforeImages / afterImages | file[] | Minh chứng |
| repairSummary | string | Kết quả sửa chữa |
| materialUsed | {name, qty}[] | Vật tư thực tế |

## Quarantine Report (mới thêm — gắn 1-1 với Ticket khi `quarantine = YES`)
| Field | Kiểu | Ghi chú |
|---|---|---|
| quarantineReportNo | string | Report No., vd TR2606-05494 |
| quarantineDate | date | |
| customerName | string | |
| itemName | string | Tên sản phẩm đầy đủ (khác itemCode) |
| totalOrder | number | Tổng số lượng đơn hàng |
| qtyQuarantine | number | Số lượng bị lỗi/cách ly |
| whereDetected | string | Vd "Final — CAR2-S5" |
| defectDescCode | string | Vd "F-04" |
| defectDescText | string | Mô tả lỗi |
| photos | file[] | Ảnh tham khảo (MC%, Sheen, Adhesion...) |
| correctiveAction | string | |
| preventiveAction | string | |

## Quan hệ giữa các role & entity này
- **QC Worker**: tạo `Ticket` + `Quarantine Report` khi Fail.
- **QC Manager**: xem, gán `defectOwner`/`repairDept`/`priority`/`deadline`, gửi notification.
- **Production Manager**: viết `repairMethod`, `repairType`, gán `assignedWorker`.
- **Production Worker** (module này): Approve/Reject, cập nhật `status`, `startTime/endTime`, `materialUsed`, `beforeImages/afterImages`, `repairSummary`.
- **Higher Department**: nhận lại ticket khi cần return-to-repair-department (theo `system-flow.png`), quét barcode cập nhật vị trí.
