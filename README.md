# Hướng dẫn Thiết lập và Chạy Dự án Bệnh viện Quân Dân Y Miền Đông

## Tổng quan

Dự án bao gồm:
- **Backend**: Node.js + Express + SQLite
- **Frontend**: HTML/CSS/JavaScript thuần
- **Database**: SQLite với schema toàn diện

## Yêu cầu hệ thống

- Node.js >= 14.0.0
- npm hoặc yarn

## Cài đặt và Chạy

### 1. Cài đặt Dependencies

```bash
# Backend
cd backend
npm install

# Frontend không cần cài đặt gì thêm
```

### 2. Khởi tạo Cơ sở dữ liệu

```bash
cd backend
npm run init-db
```

Lệnh này sẽ:
- Tạo database mới với schema toàn diện
- Thêm dữ liệu mẫu (bác sĩ, bệnh nhân, lịch hẹn, v.v.)

### 3. Chạy Backend Server

```bash
cd backend
npm start
```

Server sẽ chạy tại: http://localhost:3003

### 4. Truy cập ứng dụng

Mở trình duyệt và truy cập: http://localhost:3003

## Tài khoản Demo

Sau khi khởi tạo database, bạn có thể đăng nhập với các tài khoản sau:

### Admin
- Email: `admin@bvquandany.com`
- Password: `123456`

### Bác sĩ mẫu
- Email: `bs.nguyenvana@bvquandany.com`
- Password: `123456`

### Bệnh nhân mẫu
- Email: `nguyenvana@example.com`
- Password: `123456`

## Debug và Troubleshooting

### Server không khởi động được
```bash
# Dừng tất cả process Node.js
Stop-Process -Name node -Force

# Khởi động lại server
cd backend
npm start
```

### Database bị lỗi
```bash
# Xóa database cũ và tạo mới
cd backend
rm database.db
npm run init-db
npm start
```

### API không hoạt động
- Kiểm tra server có chạy trên port 3003
- Kiểm tra file .env có tồn tại và đúng cấu hình
- Test API bằng curl hoặc Postman

### Frontend không load được
- Đảm bảo server đang chạy
- Kiểm tra file static được serve từ thư mục frontend
- Mở Developer Tools (F12) để xem lỗi JavaScript

## Cấu trúc Dự án

```
webhopital/
├── backend/
│   ├── server.js          # Main server file
│   ├── init-db.js         # Database initialization
│   ├── schema.sql         # Database schema
│   ├── seed.sql          # Sample data
│   ├── package.json      # Dependencies
│   └── .env              # Environment variables
└── frontend/
    ├── index.html        # Homepage
    ├── login.html        # Login page
    ├── signup.html       # Registration page
    ├── doctors.html      # Doctors list
    ├── booking.html      # Appointment booking
    ├── profile.html      # User profile
    ├── my-appointments.html # User appointments
    ├── style.css         # Main stylesheet
    ├── auth.js           # Authentication helpers
    ├── app.js            # Main application logic
    └── chatbot.js        # Chatbot widget
```

## API Endpoints

### Authentication
- `POST /login` - Đăng nhập
- `POST /signup` - Đăng ký
- `POST /verify-token` - Xác minh token

### Data
- `GET /doctors` - Lấy danh sách bác sĩ
- `GET /user/:id` - Lấy thông tin user
- `POST /appointments` - Tạo lịch hẹn
- `GET /appointments/user/:user_id` - Lấy lịch hẹn của user

### Admin (yêu cầu authentication)
- `GET /api/admin/users` - Quản lý users
- `POST /api/admin/users` - Tạo user mới
- `PUT /api/admin/users/:id` - Cập nhật user
- `DELETE /api/admin/users/:id` - Xóa user

## Công nghệ Sử dụng

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Icons**: Font Awesome
- **Styling**: Custom CSS với responsive design

## Tính năng

✅ Đăng ký/Đăng nhập user
✅ Quản lý hồ sơ cá nhân
✅ Xem danh sách bác sĩ
✅ Đặt lịch khám
✅ Quản lý lịch hẹn
✅ Chatbot hỗ trợ
✅ Responsive design
✅ Admin panel
✅ Authentication & Authorization
✅ RESTful API

## License

ISC

Frontend được phục vụ trực tiếp từ backend server.

## Tài khoản Demo

### Admin
- Email: admin@bvquandany.com
- Password: 123456

### Bác sĩ
- Email: bs.nguyenvana@bvquandany.com
- Password: 123456

### Bệnh nhân
- Email: nguyenvana@example.com
- Password: 123456


### Cơ sở dữ liệu
- ✅ Indexes cho performance tối ưu
- ✅ Triggers tự động cập nhật timestamp
- ✅ Schema toàn diện với relationships

### Bảng chính:
- `users` - Thông tin người dùng
- `doctors` - Thông tin bác sĩ
- `specialties` - Chuyên khoa
- `departments` - Khoa phòng
- `appointments` - Lịch hẹn
- `medical_records` - Hồ sơ bệnh án
- `medications` - Thuốc
- `prescriptions` - Đơn thuốc
- `payments` - Thanh toán
- `insurance` - Bảo hiểm

### Quan hệ:
```
users (patient) ──── appointments ──── doctors
    │                       │
    └─── insurance          └─── medical_records
                              │
                              └─── prescriptions ──── medications
```

## API Endpoints

### Authentication
- `POST /login` - Đăng nhập
- `POST /signup` - Đăng ký
- `POST /verify-token` - Xác minh token

### Doctors
- `GET /doctors` - Lấy danh sách bác sĩ

### Appointments
- `POST /appointments` - Tạo lịch hẹn
- `GET /appointments/user/:user_id` - Lấy lịch hẹn theo user
- `GET /appointments/:phone` - Lấy lịch hẹn theo số điện thoại

### Users
- `GET /user/:id` - Lấy thông tin user

## Tính năng

### Cho Bệnh nhân:
- Đăng ký/Đăng nhập
- Đặt lịch khám
- Xem lịch khám đã đặt
- Xem hồ sơ cá nhân

### Cho Bác sĩ:
- Xem lịch hẹn
- Quản lý hồ sơ bệnh án
- Kê đơn thuốc

### Cho Admin:
- Quản lý người dùng
- Quản lý bác sĩ
- Quản lý chuyên khoa
- Báo cáo thống kê

## Phát triển thêm

### Thêm API mới:
1. Thêm route trong `server.js`
2. Cập nhật frontend tương ứng
3. Test kỹ lưỡng

### Mở rộng Database:
1. Thêm bảng mới trong `schema.sql`
2. Cập nhật `seed.sql` với dữ liệu mẫu
3. Chạy lại `npm run init-db`

## Troubleshooting

### Lỗi Database:
```bash
# Xóa database cũ và tạo mới
cd backend
rm database.db
npm run init-db
```

### Lỗi Port:
- Thay đổi port trong `server.js` nếu 3000 bị chiếm

### Lỗi Frontend:
- Đảm bảo backend đang chạy
- Kiểm tra console browser cho lỗi JavaScript
- Verify API endpoints match

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## License

MIT License