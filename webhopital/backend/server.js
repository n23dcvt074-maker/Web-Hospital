const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Helper function for consistent API responses
function sendResponse(res, statusCode, success, data = null, message = '') {
  res.status(statusCode).json({
    success,
    message,
    data: success ? data : null,
    error: !success ? data : null,
    timestamp: new Date().toISOString()
  });
}

const app = express();

// Security middleware - DISABLED
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
//       imgSrc: ["'self'", "data:", "https:"],
//       fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
//       connectSrc: ["'self'"]
//     }
//   }
// }));
// app.use(compression());

// CORS - DISABLED (allow all origins)
// const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'];
// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

// Disable CSP headers completely
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Security-Policy');
  next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

const db = new sqlite3.Database("./database.db");
const JWT_SECRET = process.env.JWT_SECRET || "d91a71eb841e2ad5788351dec6e41f8f0be3adad3d62e4acb3597bf157253c53";

// Rate limiting - DISABLED
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', apiLimiter);

// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 login attempts per windowMs
//   message: 'Too many login attempts, please try again later.'
// });

// CREATE TABLES - Schema mới toàn diện

// Đọc và thực thi schema.sql
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSQL, (err) => {
    if (err) {
      console.error('Error creating tables:', err);
    } else {
      console.log('Database schema initialized successfully');
    }
  });
}

// Seed data nếu cần
const seedPath = path.join(__dirname, 'seed.sql');
if (fs.existsSync(seedPath)) {
  const seedSQL = fs.readFileSync(seedPath, 'utf8');
  db.exec(seedSQL, (err) => {
    if (err) {
      console.error('Error seeding data:', err);
    } else {
      console.log('Sample data seeded successfully');
    }
  });
}

// API: GET DOCTORS (cập nhật để lấy thông tin đầy đủ từ doctors và users)
app.get("/doctors", (req, res) => {
  const query = `
    SELECT d.id, u.name, s.name as specialty, d.experience_years, d.consultation_fee, d.bio
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN specialties s ON d.specialty_id = s.id
    WHERE u.is_active = 1 AND d.is_available = 1
    ORDER BY u.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.json({ success: false, message: "Lỗi khi lấy danh sách bác sĩ" });
    }
    res.json({ success: true, doctors: rows });
  });
});

// API: CREATE APPOINTMENT (cập nhật cho schema mới)
app.post("/appointments", (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, symptoms, appointment_type = 'consultation' } = req.body;

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.json({ success: false, message: "Vui lòng điền đầy đủ thông tin!" });
  }

  // Kiểm tra bác sĩ có tồn tại và khả dụng không
  db.get("SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ? AND u.is_active = 1 AND d.is_available = 1", [doctor_id], (err, doctor) => {
    if (err || !doctor) {
      return res.json({ success: false, message: "Bác sĩ không tồn tại hoặc không khả dụng!" });
    }

    // Kiểm tra bệnh nhân có tồn tại không
    db.get("SELECT id FROM users WHERE id = ? AND role = 'patient' AND is_active = 1", [patient_id], (err, patient) => {
      if (err || !patient) {
        return res.json({ success: false, message: "Bệnh nhân không tồn tại!" });
      }

      // Kiểm tra lịch trùng
      const checkQuery = `
        SELECT id FROM appointments
        WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
      `;

      db.get(checkQuery, [doctor_id, appointment_date, appointment_time], (err, existing) => {
        if (existing) {
          return res.json({ success: false, message: "Lịch hẹn này đã được đặt!" });
        }

        // Tạo lịch hẹn
        const insertQuery = `
          INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, symptoms, appointment_type)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [patient_id, doctor_id, appointment_date, appointment_time, symptoms, appointment_type], function (err) {
          if (err) {
            return res.json({ success: false, message: "Lỗi khi đặt lịch!" });
          }
          res.json({ success: true, message: "Đặt lịch khám thành công!", appointment_id: this.lastID });
        });
      });
    });
  });
});

// API: ĐĂNG NHẬP (cập nhật cho bảng users)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ? AND is_active = 1", [email], (err, user) => {
    if (!user) {
      return res.json({ success: false, message: "Email không tồn tại hoặc tài khoản bị khóa!" });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.json({ success: false, message: "Mật khẩu không đúng!" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  });
});

// API: ĐĂNG KÝ (cập nhật cho bảng users)
app.post("/signup", (req, res) => {
  const { email, password, name, phone, date_of_birth, gender, address } = req.body;

  // Kiểm tra email đã tồn tại
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (user) {
      return res.json({ success: false, message: "Email đã tồn tại!" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
      `INSERT INTO users (email, password, name, phone, date_of_birth, gender, address, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'patient')`,
      [email, hashedPassword, name, phone || "", date_of_birth || null, gender || null, address || ""],
      function (err) {
        if (err) {
          return res.json({ success: false, message: "Lỗi khi đăng ký!" });
        }

        // Tạo JWT token
        const token = jwt.sign(
          { id: this.lastID, email: email, name: name, role: 'patient' },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.json({
          success: true,
          message: "Đăng ký thành công!",
          token: token,
          user: {
            id: this.lastID,
            email: email,
            name: name,
            phone: phone || "",
            role: 'patient'
          }
        });
      }
    );
  });
});

// API: XÁC MINH TOKEN
app.post("/verify-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.json({ success: false, message: "Không có token!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.json({ success: false, message: "Token không hợp lệ!" });
  }
});

// API: QUÊN MẬT KHẨU
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Vui lòng nhập email!" });
  }

  // Kiểm tra email tồn tại
  db.get("SELECT * FROM users WHERE email = ? AND is_active = 1", [email], (err, user) => {
    if (!user) {
      return res.json({ success: false, message: "Email không tồn tại trong hệ thống!" });
    }

    // Tạo reset token (hiện tại chỉ demo - trong thực tế cần gửi email)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Trong thực tế, gửi email với link reset
    console.log(`🔗 Reset password link: ${window.location.origin}/reset-password?token=${resetToken}`);

    res.json({
      success: true,
      message: "Đã gửi link đặt lại mật khẩu vào email của bạn!",
      note: "Trong phiên bản demo, link reset sẽ được hiển thị trong console server."
    });
  });
});

// API: ĐẶT LẠI MẬT KHẨU
app.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.json({ success: false, message: "Thiếu thông tin cần thiết!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type !== 'password_reset') {
      return res.json({ success: false, message: "Token không hợp lệ!" });
    }

    // Hash mật khẩu mới
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Cập nhật mật khẩu
    db.run(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, decoded.id],
      function (err) {
        if (err) {
          return res.json({ success: false, message: "Lỗi khi cập nhật mật khẩu!" });
        }

        res.json({ success: true, message: "Mật khẩu đã được đặt lại thành công!" });
      }
    );
  } catch (err) {
    res.json({ success: false, message: "Token đã hết hạn hoặc không hợp lệ!" });
  }
});

// API: LẤY THÔNG TIN NGƯỜI DÙNG (cập nhật cho bảng users)
app.get("/user/:id", (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT id, email, name, phone, date_of_birth, gender, address, role, created_at, updated_at
    FROM users WHERE id = ? AND is_active = 1
  `, [id], (err, user) => {
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại!" });
    }

    res.json({ success: true, user: user });
  });
});

// Demo OAuth flow (simulates Google/Facebook OAuth)
app.get('/auth/:provider', (req, res) => {
  const { provider } = req.params;
  const demoEmail = `${provider}_user@example.com`;

  // Try find existing user by demo email
  db.get('SELECT * FROM users WHERE email = ?', [demoEmail], (err, user) => {
    if (user) {
      // Create JWT token
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
      const redirectUrl = `/auth/success?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify({ id: user.id, email: user.email, name: user.name, phone: user.phone }))}`;
      return res.redirect(redirectUrl);
    }

    // Create a demo user
    const name = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    db.run(
      `INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)`,
      [demoEmail, '', name, ''],
      function (err) {
        const newUser = { id: this.lastID, email: demoEmail, name: name, phone: '' };
        const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
        const redirectUrl = `/auth/success?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(newUser))}`;
        return res.redirect(redirectUrl);
      }
    );
  });
});

// Page opened by provider redirect to pass token back to opener window
app.get('/auth/success', (req, res) => {
  const { token = '', user = '' } = req.query;
  const styledHtml = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đang đăng nhập...</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Inter', 'Segoe UI', sans-serif;
        background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .container {
        text-align: center;
        background: white;
        padding: 3rem 2rem;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 400px;
      }

      .loader {
        margin: 0 auto 1.5rem;
        width: 50px;
        height: 50px;
      }

      .loader::after {
        content: '';
        display: block;
        width: 40px;
        height: 40px;
        margin: 5px;
        border-radius: 50%;
        border: 4px solid #0066cc;
        border-color: #0066cc transparent #0066cc transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }

      @keyframes lds-dual-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      h2 {
        margin: 0 0 0.5rem;
        color: #0066cc;
        font-size: 1.2rem;
      }

      p {
        margin: 0;
        color: #666;
        font-size: 0.95rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="loader"></div>
      <h2>Đang xử lý đăng nhập</h2>
      <p>Vui lòng chờ...</p>
    </div>
    <script>
      try {
        const token = decodeURIComponent(${JSON.stringify(token)});
        const user = JSON.parse(decodeURIComponent(${JSON.stringify(user)}));
        if (window.opener) {
          window.opener.postMessage({ success: true, token: token, user: user }, '*');
        }
      } catch (e) {
        if (window.opener) window.opener.postMessage({ success: false, message: 'Auth parsing error' }, '*');
      }
      setTimeout(() => { window.close(); }, 1000);
    </script>
  </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(styledHtml);
});

// API: CẬP NHẬT THÔNG TIN NGƯỜI DÙNG
app.put("/user/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, date_of_birth, gender, address, emergency_contact, emergency_phone } = req.body;

  if (!name) {
    return res.json({ success: false, message: "Vui lòng nhập tên!" });
  }

  db.run(
    "UPDATE users SET name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?, emergency_contact = ?, emergency_phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [name, phone || "", date_of_birth || null, gender || null, address || "", emergency_contact || "", emergency_phone || "", id],
    function (err) {
      if (err) {
        return res.json({ success: false, message: "Lỗi khi cập nhật!" });
      }

      res.json({ success: true, message: "Cập nhật thành công!" });
    }
  );
});

// API: LẤY LỊCH KHÁM CỦA NGƯỜI DÙNG (theo user_id)
app.get("/appointments/user/:user_id", (req, res) => {
  const { user_id } = req.params;

  const query = `
    SELECT
      a.id, a.appointment_date, a.appointment_time, a.status, a.appointment_type,
      a.symptoms, a.notes, a.room_number, a.created_at,
      d.id as doctor_id, u.name as doctor_name, s.name as specialty_name,
      dept.name as department_name
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users u ON d.user_id = u.id
    LEFT JOIN specialties s ON d.specialty_id = s.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE a.patient_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.all(query, [user_id], (err, rows) => {
    if (err) {
      return res.json({ success: false, message: "Lỗi khi lấy lịch khám" });
    }
    res.json({ success: true, appointments: rows || [] });
  });
});

// API: LẤY LỊCH KHÁM CỦA NGƯỜI DÙNG (theo số ĐT - fallback)
app.get("/appointments/:phone", (req, res) => {
  const { phone } = req.params;

  const query = `
    SELECT
      a.id, a.appointment_date, a.appointment_time, a.status, a.appointment_type,
      a.symptoms, a.notes, a.room_number, a.created_at,
      d.id as doctor_id, u.name as doctor_name, s.name as specialty_name,
      dept.name as department_name
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users u ON d.user_id = u.id
    LEFT JOIN specialties s ON d.specialty_id = s.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    JOIN users p ON a.patient_id = p.id
    WHERE p.phone = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.all(query, [phone], (err, rows) => {
    if (err) {
      return res.json({ success: false, message: "Lỗi khi lấy lịch khám" });
    }
    res.json({ success: true, appointments: rows || [] });
  });
});

// Middleware xác thực JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Middleware kiểm tra role
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

// API: DOCTOR - Lấy danh sách appointments của doctor
app.get("/api/doctor/appointments", authenticateToken, requireRole('doctor'), (req, res) => {
  const doctorUserId = req.user.id;

  // Tìm doctor_id từ user_id
  db.get("SELECT id FROM doctors WHERE user_id = ?", [doctorUserId], (err, doctor) => {
    if (err || !doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const query = `
      SELECT
        a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes,
        a.created_at, a.updated_at,
        p.id as patient_id, p.name as patient_name, p.email as patient_email,
        p.phone as patient_phone, p.date_of_birth as patient_dob,
        s.name as specialty_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN specialties s ON d.specialty_id = s.id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;

    db.all(query, [doctor.id], (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error fetching appointments" });
      }
      res.json(rows || []);
    });
  });
});

// API: ADMIN - Lấy danh sách tất cả users
app.get("/api/admin/users", authenticateToken, requireRole('admin'), (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const query = `
    SELECT id, email, name, phone, date_of_birth, gender, address, role, is_active, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách người dùng" });
    }

    // Get total count
    db.get("SELECT COUNT(*) as total FROM users", [], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Lỗi khi đếm người dùng" });
      }

      res.json({ 
        success: true, 
        users: rows || [],
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      });
    });
  });
});

// API: ADMIN - Tạo user mới
app.post("/api/admin/users", authenticateToken, requireRole('admin'), (req, res) => {
  const { email, password, name, phone, date_of_birth, address, role, status = 'active' } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Kiểm tra email đã tồn tại
  db.get("SELECT id FROM users WHERE email = ?", [email], (err, existing) => {
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = `
      INSERT INTO users (email, password, name, phone, date_of_birth, address, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [email, hashedPassword, name, phone || null, date_of_birth || null, address || null, role, status], function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Error creating user" });
      }
      res.status(201).json({ success: true, message: "User created successfully", userId: this.lastID });
    });
  });
});

// API: ADMIN - Cập nhật user
app.put("/api/admin/users/:id", authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { email, password, name, phone, date_of_birth, gender, address, role, status } = req.body;

  if (!name || !role) {
    return res.json({ success: false, message: "Tên và vai trò là bắt buộc" });
  }

  let query = `
    UPDATE users
    SET name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?, role = ?, is_active = ?, updated_at = datetime('now')
  `;
  
  const is_active = status === 'active' ? 1 : 0;
  let params = [name, phone || null, date_of_birth || null, gender || null, address || null, role, is_active];

  // Thêm email vào query nếu được cung cấp
  if (email) {
    query += ", email = ?";
    params.push(email);
  }

  // Thêm password vào query nếu được cung cấp
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    query += ", password = ?";
    params.push(hashedPassword);
  }

  query += " WHERE id = ?";
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi khi cập nhật người dùng" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }
    res.json({ success: true, message: "Cập nhật thông tin người dùng thành công" });
  });
});

// API: ADMIN - Xóa user
app.delete("/api/admin/users/:id", authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;

  // Không cho phép xóa admin cuối cùng
  db.get("SELECT COUNT(*) as adminCount FROM users WHERE role = 'admin' AND status = 'active'", [], (err, result) => {
    if (result.adminCount <= 1) {
      db.get("SELECT role FROM users WHERE id = ?", [id], (err, user) => {
        if (user && user.role === 'admin') {
          return res.status(400).json({ success: false, message: "Cannot delete the last admin" });
        }
      });
    }

    // Đánh dấu user là inactive thay vì xóa hoàn toàn
    db.run("UPDATE users SET status = 'inactive', updated_at = datetime('now') WHERE id = ?", [id], function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Error deleting user" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      res.json({ success: true, message: "User deleted successfully" });
    });
  });
});

// API: Cập nhật trạng thái appointment (cho patient, doctor và admin)
app.put("/api/appointments/:id/status", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userRole = req.user.role;

  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  // Kiểm tra quyền truy cập
  let accessCheck = "";
  let params = [status, id];

  if (userRole === 'doctor') {
    // Doctor chỉ có thể cập nhật appointment của mình
    accessCheck = `
      AND a.doctor_id = (SELECT d.id FROM doctors d WHERE d.user_id = ?)
    `;
    params.push(req.user.id);
  } else if (userRole === 'admin') {
    // Admin có thể cập nhật tất cả
    accessCheck = "";
  } else if (userRole === 'patient') {
    // Patient chỉ có thể hủy appointment của mình
    if (status !== 'cancelled') {
      return res.status(403).json({ success: false, message: "Patients can only cancel appointments" });
    }
    accessCheck = `
      AND a.patient_id = ?
    `;
    params.push(req.user.id);
  } else {
    return res.status(403).json({ success: false, message: "Insufficient permissions" });
  }

  const query = `
    UPDATE appointments
    SET status = ?, updated_at = datetime('now')
    WHERE id = ? ${accessCheck}
  `;

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Error updating appointment status" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: "Appointment not found or access denied" });
    }
    res.json({ success: true, message: "Appointment status updated successfully" });
  });
});

// API: Dời lịch khám (reschedule) - chỉ cho patient
app.put("/api/appointments/:id/reschedule", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { appointment_date, appointment_time } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'patient') {
    return res.status(403).json({ success: false, message: "Only patients can reschedule appointments" });
  }

  if (!appointment_date || !appointment_time) {
    return res.status(400).json({ success: false, message: "Date and time are required" });
  }

  // Kiểm tra appointment tồn tại và thuộc về patient
  db.get(`
    SELECT a.*, d.user_id as doctor_user_id
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.id = ? AND a.patient_id = ?
  `, [id, req.user.id], (err, appointment) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: "Cannot reschedule completed or cancelled appointments" });
    }

    // Kiểm tra thời gian mới không trùng với lịch khác của bác sĩ
    db.get(`
      SELECT COUNT(*) as count FROM appointments
      WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
      AND status IN ('scheduled', 'confirmed') AND id != ?
    `, [appointment.doctor_id, appointment_date, appointment_time, id], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error" });
      }
      if (result.count > 0) {
        return res.status(400).json({ success: false, message: "Doctor is not available at this time" });
      }

      // Cập nhật lịch hẹn
      db.run(`
        UPDATE appointments
        SET appointment_date = ?, appointment_time = ?, status = 'scheduled', updated_at = datetime('now')
        WHERE id = ?
      `, [appointment_date, appointment_time, id], function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: "Error updating appointment" });
        }
        res.json({ success: true, message: "Appointment rescheduled successfully" });
      });
    });
  });
});

// ==================== DOCTOR MANAGEMENT API ====================

// GET /specialties - Lấy danh sách chuyên khoa
app.get("/specialties", (req, res) => {
  db.all("SELECT id, name, description FROM specialties ORDER BY name", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách chuyên khoa" });
    }
    res.json({ success: true, specialties: rows });
  });
});

// GET /doctors/:id - Chi tiết bác sĩ với đánh giá
app.get("/doctors/:id", (req, res) => {
  const { id } = req.params;

  // Lấy thông tin bác sĩ
  const doctorQuery = `
    SELECT
      d.id,
      d.user_id,
      d.specialty_id,
      d.department_id,
      d.license_number,
      d.experience_years,
      d.education,
      d.certifications,
      d.bio,
      d.consultation_fee,
      d.is_available,
      d.created_at,
      u.name,
      u.email,
      u.phone,
      u.date_of_birth,
      u.gender,
      s.name as specialty_name,
      dept.name as department_name,
      COALESCE(AVG(dr.rating), 0) as average_rating,
      COUNT(dr.id) as total_ratings
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN specialties s ON d.specialty_id = s.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    LEFT JOIN doctor_ratings dr ON d.id = dr.doctor_id
    WHERE d.id = ? AND d.is_available = 1
    GROUP BY d.id
  `;

  db.get(doctorQuery, [id], (err, doctor) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi khi lấy thông tin bác sĩ" });
    }
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bác sĩ" });
    }

    // Lấy lịch làm việc
    db.all(`
      SELECT DISTINCT day_of_week, start_time, end_time, is_available
      FROM doctor_schedules
      WHERE doctor_id = ? AND is_available = 1
      ORDER BY day_of_week, start_time
    `, [id], (err, schedules) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Lỗi khi lấy lịch làm việc" });
      }

      // Lấy đánh giá gần đây
      db.all(`
        SELECT
          dr.rating,
          dr.review_text,
          dr.created_at,
          CASE WHEN dr.is_anonymous = 1 THEN 'Ẩn danh' ELSE u.name END as patient_name
        FROM doctor_ratings dr
        LEFT JOIN users u ON dr.patient_id = u.id AND dr.is_anonymous = 0
        WHERE dr.doctor_id = ?
        ORDER BY dr.created_at DESC
        LIMIT 10
      `, [id], (err, ratings) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Lỗi khi lấy đánh giá" });
        }

        res.json({
          success: true,
          doctor: {
            ...doctor,
            schedules: schedules || [],
            ratings: ratings || [],
            average_rating: parseFloat(doctor.average_rating).toFixed(1),
            total_ratings: doctor.total_ratings
          }
        });
      });
    });
  });
});

// POST /doctors/:id/rate - Đánh giá bác sĩ
app.post("/doctors/:id/rate", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { rating, review_text, appointment_id, is_anonymous } = req.body;
  const patient_id = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Đánh giá phải từ 1 đến 5 sao" });
  }

  // Kiểm tra bác sĩ tồn tại
  db.get("SELECT id FROM doctors WHERE id = ?", [id], (err, doctor) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi database" });
    }
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bác sĩ" });
    }

    // Kiểm tra đã đánh giá chưa
    const checkQuery = appointment_id
      ? "SELECT id FROM doctor_ratings WHERE doctor_id = ? AND patient_id = ? AND appointment_id = ?"
      : "SELECT id FROM doctor_ratings WHERE doctor_id = ? AND patient_id = ? AND appointment_id IS NULL";

    const checkParams = appointment_id
      ? [id, patient_id, appointment_id]
      : [id, patient_id];

    db.get(checkQuery, checkParams, (err, existing) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Lỗi database" });
      }
      if (existing) {
        return res.status(400).json({ success: false, message: "Bạn đã đánh giá bác sĩ này rồi" });
      }

      // Thêm đánh giá mới
      db.run(`
        INSERT INTO doctor_ratings (doctor_id, patient_id, appointment_id, rating, review_text, is_anonymous)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, patient_id, appointment_id || null, rating, review_text || "", is_anonymous ? 1 : 0], function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: "Lỗi khi lưu đánh giá" });
        }
        res.json({ success: true, message: "Cảm ơn bạn đã đánh giá!", rating_id: this.lastID });
      });
    });
  });
});

// GET /api/admin/doctors - Lấy danh sách bác sĩ
app.get("/api/admin/doctors", authenticateToken, requireRole('admin'), (req, res) => {
  const query = `
    SELECT 
      d.id,
      d.user_id,
      d.specialty_id,
      d.department_id,
      d.license_number,
      d.experience_years,
      d.education,
      d.certifications,
      d.bio,
      d.consultation_fee,
      d.is_available,
      d.created_at,
      d.updated_at,
      u.name,
      u.email,
      u.phone,
      u.date_of_birth,
      u.gender,
      u.address,
      s.name as specialty_name,
      dept.name as department_name
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN specialties s ON d.specialty_id = s.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE u.is_active = 1
    ORDER BY u.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách bác sĩ" });
    }
    res.json({ success: true, doctors: rows });
  });
});

// POST /api/admin/doctors - Tạo bác sĩ mới
app.post("/api/admin/doctors", authenticateToken, requireRole('admin'), (req, res) => {
  const {
    name, email, phone, date_of_birth, gender, address,
    specialty_id, department_id, license_number, experience_years,
    education, certifications, bio, consultation_fee, password
  } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Vui lòng điền đầy đủ thông tin cơ bản!" });
  }

  // Kiểm tra email đã tồn tại
  db.get("SELECT id FROM users WHERE email = ?", [email], (err, existingUser) => {
    if (existingUser) {
      return res.json({ success: false, message: "Email đã được sử dụng!" });
    }

    // Tạo user mới
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userQuery = `
      INSERT INTO users (email, password, name, phone, date_of_birth, gender, address, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'doctor', 1)
    `;

    db.run(userQuery, [email, hashedPassword, name, phone, date_of_birth, gender, address], function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Lỗi khi tạo tài khoản bác sĩ" });
      }

      const userId = this.lastID;

      // Tạo hồ sơ bác sĩ
      const doctorQuery = `
        INSERT INTO doctors (user_id, specialty_id, department_id, license_number, experience_years, education, certifications, bio, consultation_fee, is_available)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `;

      db.run(doctorQuery, [userId, specialty_id, department_id, license_number, experience_years, education, certifications, bio, consultation_fee], function(err) {
        if (err) {
          // Rollback user creation
          db.run("DELETE FROM users WHERE id = ?", [userId]);
          return res.status(500).json({ success: false, message: "Lỗi khi tạo hồ sơ bác sĩ" });
        }

        res.json({
          success: true,
          message: "Bác sĩ đã được tạo thành công!",
          doctor_id: this.lastID,
          user_id: userId
        });
      });
    });
  });
});

// PUT /api/admin/doctors/:id - Cập nhật bác sĩ
app.put("/api/admin/doctors/:id", authenticateToken, requireRole('admin'), (req, res) => {
  const doctorId = req.params.id;
  const {
    name, email, phone, date_of_birth, gender, address,
    specialty_id, department_id, license_number, experience_years,
    education, certifications, bio, consultation_fee, is_available
  } = req.body;

  // Cập nhật thông tin user
  const userQuery = `
    UPDATE users
    SET name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ?, updated_at = datetime('now')
    WHERE id = (SELECT user_id FROM doctors WHERE id = ?) AND role = 'doctor'
  `;

  db.run(userQuery, [name, phone, date_of_birth, gender, address, doctorId], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi khi cập nhật thông tin cá nhân" });
    }

    // Cập nhật hồ sơ bác sĩ
    const doctorQuery = `
      UPDATE doctors
      SET specialty_id = ?, department_id = ?, license_number = ?, experience_years = ?,
          education = ?, certifications = ?, bio = ?, consultation_fee = ?, is_available = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `;

    db.run(doctorQuery, [specialty_id, department_id, license_number, experience_years, education, certifications, bio, consultation_fee, is_available, doctorId], function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: "Lỗi khi cập nhật hồ sơ bác sĩ" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: "Bác sĩ không tồn tại" });
      }

      res.json({ success: true, message: "Hồ sơ bác sĩ đã được cập nhật thành công!" });
    });
  });
});

// DELETE /api/admin/doctors/:id - Xóa bác sĩ
app.delete("/api/admin/doctors/:id", authenticateToken, requireRole('admin'), (req, res) => {
  const doctorId = req.params.id;

  // Đánh dấu user không active thay vì xóa hoàn toàn
  const query = `
    UPDATE users
    SET is_active = 0, updated_at = datetime('now')
    WHERE id = (SELECT user_id FROM doctors WHERE id = ?) AND role = 'doctor'
  `;

  db.run(query, [doctorId], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Lỗi khi xóa bác sĩ" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: "Bác sĩ không tồn tại" });
    }

    res.json({ success: true, message: "Bác sĩ đã được xóa thành công!" });
  });
});

app.listen(3003, () => {
  console.log("✅ Backend chạy tại http://localhost:3003");
});
