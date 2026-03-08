#!/usr/bin/env node

/**
 * Script khởi tạo cơ sở dữ liệu cho Bệnh viện Quân Dân Y Miền Đông
 * Chạy script này để tạo và seed database mới
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database.db');

console.log('🚀 Khởi tạo cơ sở dữ liệu...');

// Đọc và thực thi schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSQL, (err) => {
    if (err) {
      console.error('❌ Lỗi khi tạo schema:', err);
      process.exit(1);
    }
    console.log('✅ Schema đã được tạo thành công');
  });
} else {
  console.error('❌ Không tìm thấy file schema.sql');
  process.exit(1);
}

// Đọc và thực thi seed data
const seedPath = path.join(__dirname, 'seed.sql');
if (fs.existsSync(seedPath)) {
  const seedSQL = fs.readFileSync(seedPath, 'utf8');
  db.exec(seedSQL, (err) => {
    if (err) {
      console.error('❌ Lỗi khi seed dữ liệu:', err);
      process.exit(1);
    }
    console.log('✅ Dữ liệu mẫu đã được thêm thành công');
  });
} else {
  console.error('❌ Không tìm thấy file seed.sql');
  process.exit(1);
}

// Đóng kết nối
db.close((err) => {
  if (err) {
    console.error('❌ Lỗi khi đóng database:', err);
    process.exit(1);
  }
  console.log('✅ Cơ sở dữ liệu đã sẵn sàng!');
  console.log('🎉 Khởi tạo hoàn tất. Chạy "npm start" để bắt đầu server.');
});