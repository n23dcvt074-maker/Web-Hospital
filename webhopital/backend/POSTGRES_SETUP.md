# Hướng Dẫn Setup PostgreSQL + Supabase + Vercel

## 1. Tạo Project PostgreSQL trên Supabase

1. Vào https://supabase.com
2. Đăng nhập bằng GitHub hoặc email
3. Click **"New Project"**
4. Điền thông tin:
   - **Project Name**: `web-hospital` (hoặc tên khác)
   - **Database Password**: Lưu lại mật khẩu (sẽ dùng sau)
   - **Region**: Chọn gần nhất (VN: Singapore)
5. Click **"Create new project"** và chờ 1-2 phút

## 2. Lấy Connection String

Sau khi project được tạo:

1. Vào **Settings** → **Database** → **Connection String**
2. Chọn tab **URI**
3. Copy Connection String (dạng: `postgresql://user:password@host:5432/database`)
4. Nếu password bị ẩn, nhập password đã lưu ở bước 1

## 3. Setup Local Development

### 3.1 Tạo file .env

```bash
cd webhopital/backend
touch .env
```

Thêm vào file `.env`:
```
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/database_name
JWT_SECRET=d91a71eb841e2ad5788351dec6e41f8f0be3adad3d62e4acb3597bf157253c53
NODE_ENV=development
```

(Thay CONNECTION_STRING thành URL từ Supabase)

### 3.2 Cài Đặt Dependencies

```bash
npm install
```

### 3.3 Khởi Tạo Database Schema

```bash
npm run init-db
```

Command này sẽ:
- Tạo tất cả tables trên PostgreSQL
- Seed dữ liệu mẫu

### 3.4 Chạy Local Server

```bash
npm start
```

Server chạy tại: `http://localhost:3003`

## 4. Deploy lên Vercel

### 4.1 Kết Nối GitHub

1. Vào https://vercel.com
2. Đăng nhập bằng GitHub
3. Click **"New Project"**
4. Tìm repo `Web-Hospital` → Click **Import**

### 4.2 Cấu Hình Project

**Root Directory**: Chọn `webhopital/backend`

### 4.3 Thêm Environment Variables

1. Bỏ tích **"Add Environment Variables"**
2. Sau khi import xong, vào **Settings** → **Environment Variables**
3. Thêm:
   - Key: `DATABASE_URL`
   - Value: (Dán Connection String từ Supabase)
4. Thêm:
   - Key: `NODE_ENV`
   - Value: `production`

### 4.4 Deploy

1. Vào **Deployments**
2. Click **"Redeploy"** hoặc tự động deploy khi push code

## 5. Update Frontend để gọi Backend Vercel

Sau khi backend deploy xong, Vercel sẽ cung cấp URL (ví dụ: `https://web-hospital-backend.vercel.app`)

Cập nhật `webhopital/frontend/app.js` và `webhopital/frontend/auth.js`:

```javascript
// Thay từ:
window.API = 'http://localhost:3003';

// Thành:
window.API = 'https://web-hospital-backend.vercel.app';
```

Commit và push:
```bash
git add webhopital/frontend/app.js webhopital/frontend/auth.js
git commit -m "Update API URL to Vercel backend"
git push origin main
```

## 6. Kiểm Tra

1. Truy cập: `https://your-domain/` (GitHub Pages hoặc custom domain)
2. Kiểm tra console browser xem API calls có hoạt động không
3. Nếu có lỗi, kiểm tra:
   - DATABASE_URL đúng trên Vercel Settings
   - CORS settings trong backend (nếu cần)

## Troubleshooting

### Lỗi: "connection refused"
- Kiểm tra DATABASE_URL trong Vercel Environment Variables
- Đảm bảo Supabase project đang chạy

### Lỗi: "relation does not exist"
- Chạy `npm run init-db` trên máy local
- Check DATABASE_URL đúng

### Lỗi: "CORS policy"
- Kiểm tra frontend API URL có đúng không
- Thêm CORS headers nếu cần trong server.js

## Ghi Chú

- **Không commit .env**: Dùng .env.example để track template
- **Supabase Free Plan**: 2 projects, plenty of thời gian tính toán
- **Vercel**: Miễn phí, tự động deploy khi push
- **Database sẽ persistent** trên Supabase (khác SQLite)
