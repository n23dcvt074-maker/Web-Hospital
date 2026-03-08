// Helper functions for authentication

const API = window.location.origin;

// Lưu token và user info
function setAuthToken(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

// Lấy token
function getAuthToken() {
  return localStorage.getItem("token");
}

// Lấy thông tin user kèm token
function getUser() {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  
  if (!userStr) return null;
  
  const user = JSON.parse(userStr);
  if (token) {
    user.token = token;
  }
  return user;
}

// Kiểm tra đã đăng nhập
function isLoggedIn() {
  return !!getAuthToken();
}

// Đăng xuất
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("savedEmail");
  window.location.href = "index.html";
}

// Đăng nhập
async function login(email, password) {
  try {
    const response = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setAuthToken(data.token, data.user);
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: "Lỗi kết nối đến server" };
  }
}

// Đăng ký
async function signup(name, email, password, phone = "") {
  try {
    const response = await fetch(API + "/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setAuthToken(data.token, data.user);
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (err) {
    console.error("Signup error:", err);
    return { success: false, message: "Lỗi kết nối đến server" };
  }
}

// Xác minh token
async function verifyToken(token) {
  try {
    const response = await fetch(API + "/verify-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    return data.success;
  } catch (err) {
    return false;
  }
}

// Cập nhật navbar khi đã đăng nhập
function updateNavbarAuth() {
  if (isLoggedIn()) {
    const user = getUser();
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (loginLink) {
      loginLink.innerHTML = `<i class="fas fa-user"></i> ${user.name || "Tài khoản"}`;
      loginLink.href = "#";
      loginLink.onclick = showUserMenu;
    }
  }
}

// Cập nhật navbar khi đã đăng nhập
function updateNavbarAuth() {
  if (isLoggedIn()) {
    const user = getUser();
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (loginLink) {
      loginLink.innerHTML = `<i class="fas fa-user"></i> ${user.name || "Tài khoản"}`;
      loginLink.href = "#";
      loginLink.style.cursor = "pointer";
      loginLink.onclick = showUserMenu;
    }
  }
}

// Bảo vệ trang (chỉ người đã đăng nhập mới vào được)
function protectPage() {
  if (!isLoggedIn()) {
    alert("⚠️ Vui lòng đăng nhập để tiếp tục!");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Bảo vệ trang với thông báo tùy chỉnh
function protectPageWithMessage(message = "Vui lòng đăng nhập để tiếp tục!") {
  if (!isLoggedIn()) {
    alert("⚠️ " + message);
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Hiển thị menu người dùng
function showUserMenu(e) {
  e.preventDefault();
  const user = getUser();
  
  // Xóa menu cũ nếu có
  const oldMenu = document.querySelector('.user-menu');
  if (oldMenu) {
    oldMenu.remove();
    return;
  }
  
  const menu = document.createElement("div");
  menu.className = "user-menu";
  menu.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    z-index: 1000;
    min-width: 220px;
    padding: 1rem 0;
  `;
  
  // Header với thông tin user
  let menuHTML = `
    <div style="padding: 1rem; border-bottom: 1px solid #eee; text-align: center;">
      <p style="margin: 0; font-weight: 600; color: #333; font-size: 0.95rem;">${user.name || "Người dùng"}</p>
      <p style="margin: 0.3rem 0 0; font-size: 0.85rem; color: #999; word-break: break-all;">${user.email}</p>
      <span style="display: inline-block; margin-top: 0.5rem; padding: 0.2rem 0.6rem; background: #0066cc; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">
        ${user.role === 'admin' ? 'Quản trị viên' : user.role === 'doctor' ? 'Bác sĩ' : 'Bệnh nhân'}
      </span>
    </div>
  `;
  
  // Menu items dựa trên role
  if (user.role === 'patient') {
    // Menu cho bệnh nhân
    menuHTML += `
      <a href="profile.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-user-circle" style="width: 20px;"></i> Hồ sơ cá nhân
      </a>
      <a href="my-appointments.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-calendar-check" style="width: 20px;"></i> Lịch khám của tôi
      </a>
      <a href="booking.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-calendar-plus" style="width: 20px;"></i> Đặt lịch khám
      </a>
    `;
  } else if (user.role === 'doctor') {
    // Menu cho bác sĩ
    menuHTML += `
      <a href="profile.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-user-md" style="width: 20px;"></i> Hồ sơ cá nhân
      </a>
      <a href="doctor-appointments.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-calendar-check" style="width: 20px;"></i> Lịch hẹn bệnh nhân
      </a>
      <a href="medical-records.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-file-medical" style="width: 20px;"></i> Hồ sơ bệnh án
      </a>
      <a href="prescriptions.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-pills" style="width: 20px;"></i> Kê đơn thuốc
      </a>
    `;
  } else if (user.role === 'admin') {
    // Menu cho admin
    menuHTML += `
      <a href="profile.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-user-shield" style="width: 20px;"></i> Hồ sơ cá nhân
      </a>
      <a href="admin-users.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-users" style="width: 20px;"></i> Quản lý người dùng
      </a>
      <a href="admin-doctors.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-user-md" style="width: 20px;"></i> Quản lý bác sĩ
      </a>
      <a href="admin-specialties.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-stethoscope" style="width: 20px;"></i> Quản lý chuyên khoa
      </a>
      <a href="admin-reports.html" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #333; transition: 0.2s; border-bottom: 1px solid #eee;">
        <i class="fas fa-chart-bar" style="width: 20px;"></i> Báo cáo thống kê
      </a>
    `;
  }
  
  // Đăng xuất
  menuHTML += `
    <a href="#" id="logoutLink" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem 1rem; text-decoration: none; color: #ff6b6b; transition: 0.2s;">
      <i class="fas fa-sign-out-alt" style="width: 20px;"></i> Đăng xuất
    </a>
  `;
  
  menu.innerHTML = menuHTML;
  document.body.appendChild(menu);

  // attach logout listener
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }

  // Đóng menu khi click bên ngoài
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target) && e.target.getAttribute('href') !== 'login.html') {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 100);
}

// Chạy khi trang load
window.addEventListener("DOMContentLoaded", updateNavbarAuth);
