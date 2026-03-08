# Thiết kế Cơ sở dữ liệu - Bệnh viện Quân Dân Y Miền Đông

## Tổng quan

Cơ sở dữ liệu được thiết kế cho hệ thống quản lý bệnh viện toàn diện, hỗ trợ các chức năng chính như quản lý bệnh nhân, bác sĩ, lịch hẹn, hồ sơ bệnh án, thanh toán và bảo hiểm.

## Cấu trúc Cơ sở dữ liệu

### Các bảng chính

#### 1. `specialties` - Chuyên khoa
- Lưu trữ thông tin các chuyên khoa trong bệnh viện
- **Trường chính**: `id`, `name`, `description`

#### 2. `departments` - Khoa phòng
- Quản lý các khoa phòng và thông tin liên lạc
- **Trường chính**: `id`, `name`, `description`, `phone`, `location`

#### 3. `users` - Người dùng
- Lưu trữ thông tin tất cả người dùng (bệnh nhân, bác sĩ, nhân viên)
- **Trường chính**: `id`, `email`, `password`, `name`, `phone`, `role`
- **Roles**: `patient`, `doctor`, `admin`, `nurse`, `staff`

#### 4. `doctors` - Bác sĩ
- Thông tin chi tiết về bác sĩ, liên kết với bảng `users`
- **Trường chính**: `id`, `user_id`, `specialty_id`, `license_number`, `experience_years`

#### 5. `doctor_schedules` - Lịch làm việc
- Quản lý lịch làm việc của từng bác sĩ
- **Trường chính**: `doctor_id`, `day_of_week`, `start_time`, `end_time`

#### 6. `appointments` - Cuộc hẹn
- Lưu trữ thông tin lịch hẹn khám bệnh
- **Trường chính**: `patient_id`, `doctor_id`, `appointment_date`, `status`
- **Status**: `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`

#### 7. `medical_records` - Hồ sơ bệnh án
- Lưu trữ chẩn đoán và điều trị cho từng bệnh nhân
- **Trường chính**: `patient_id`, `doctor_id`, `diagnosis`, `treatment`

#### 8. `medications` - Thuốc
- Danh mục thuốc trong kho
- **Trường chính**: `name`, `dosage_form`, `strength`, `price`, `stock_quantity`

#### 9. `prescriptions` - Đơn thuốc
- Chi tiết đơn thuốc cho từng cuộc hẹn
- **Trường chính**: `appointment_id`, `medication_id`, `dosage`, `frequency`

#### 10. `payments` - Thanh toán
- Quản lý thanh toán cho các dịch vụ
- **Trường chính**: `appointment_id`, `amount`, `payment_method`, `status`

#### 11. `insurance` - Bảo hiểm
- Thông tin bảo hiểm y tế của bệnh nhân
- **Trường chính**: `patient_id`, `provider`, `policy_number`

#### 12. `notifications` - Thông báo
- Hệ thống thông báo cho người dùng
- **Trường chính**: `user_id`, `title`, `message`, `type`

## Quan hệ giữa các bảng

```
users (1) ──── (1) doctors
  │                    │
  │                    │
  └─── (many) appointments ──── (1) medical_records
           │                           │
           │                           │
           └─── (many) prescriptions ──── (1) medications
                        │
                        │
                        └─── (1) payments
```

## Indexes và Tối ưu hóa

- **Primary Keys**: Tất cả bảng đều có PRIMARY KEY
- **Foreign Keys**: Đảm bảo tính toàn vẹn dữ liệu
- **Indexes**: Được tạo cho các truy vấn thường xuyên:
  - `appointments`: theo `patient_id`, `doctor_id`, `status`
  - `doctor_schedules`: theo `doctor_id`, `day_of_week`
  - `users`: theo `email`, `role`

## Triggers

- **Auto-update timestamps**: Tự động cập nhật trường `updated_at` khi có thay đổi

## Dữ liệu mẫu

File `seed.sql` chứa dữ liệu mẫu bao gồm:
- 15 chuyên khoa
- 6 khoa phòng
- 8 người dùng (1 admin, 5 bác sĩ, 2 bệnh nhân)
- Lịch làm việc mẫu
- Thuốc và đơn thuốc mẫu
- Cuộc hẹn và thanh toán mẫu

## Cách sử dụng

1. **Khởi tạo database**:
   ```sql
   sqlite3 database.db < schema.sql
   ```

2. **Chèn dữ liệu mẫu**:
   ```sql
   sqlite3 database.db < seed.sql
   ```

3. **Kết nối từ ứng dụng**:
   - Sử dụng SQLite3 driver trong Node.js
   - Connection string: `./database.db`

## Lưu ý bảo mật

- Mật khẩu được hash bằng bcrypt
- Sử dụng JWT cho authentication
- Validate input data trước khi insert/update
- Sử dụng prepared statements để tránh SQL injection

## Mở rộng tương lai

- **Audit logs**: Ghi log các thao tác quan trọng
- **File attachments**: Lưu trữ hình ảnh X-quang, kết quả xét nghiệm
- **Multi-language support**: Hỗ trợ đa ngôn ngữ
- **Backup/Restore**: Cơ chế sao lưu và khôi phục dữ liệu
- **Data partitioning**: Phân chia dữ liệu theo thời gian cho hiệu suất