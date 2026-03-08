if (typeof API === 'undefined') {
  window.API = window.location.origin;
}

// Dữ liệu bác sĩ mặc định (demo)
const demoDoctor = [
  { id: 1, name: 'BS Nguyễn Văn A', specialty: 'Tim mạch' },
  { id: 2, name: 'BS Trần Thị B', specialty: 'Tai mũi họng' },
  { id: 3, name: 'BS Lê Văn C', specialty: 'Nội tổng quát' },
  { id: 4, name: 'BS Phạm Thị D', specialty: 'Phụ khoa' },
  { id: 5, name: 'BS Đỗ Văn E', specialty: 'Nhi khoa' },
  { id: 6, name: 'BS Vũ Thị F', specialty: 'Chỉnh hình' },
  { id: 7, name: 'BS Hoàng Văn G', specialty: 'Hóa học lâm sàng' },
  { id: 8, name: 'BS Đặng Thị H', specialty: 'Mắt' },
  { id: 9, name: 'BS Bùi Văn I', specialty: 'Ngoại khoa' },
  { id: 10, name: 'BS Trương Thị K', specialty: 'Da liễu' },
  { id: 11, name: 'BS Phan Văn L', specialty: 'Tâm thần' },
  { id: 12, name: 'BS Ngô Thị M', specialty: 'Nha khoa' },
  { id: 13, name: 'BS Tạ Văn N', specialty: 'Cột sống' },
  { id: 14, name: 'BS Đinh Thị O', specialty: 'Tiêu hóa' },
  { id: 15, name: 'BS Lâm Văn P', specialty: 'Hô hấp' }
];

function renderDoctors(data) {
  const select = document.getElementById("doctor");
  const list = document.getElementById("doctorList");

  data.forEach(d => {
    if (select) {
      const o = document.createElement("option");
      o.value = d.id;
      o.text = `${d.name} - ${d.specialty}`;
      select.add(o);
    }

    if (list) {
      const div = document.createElement("div");
      div.className = "doctor-card";
      div.innerHTML = `
        <div class="doctor-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <h3>${d.name}</h3>
        <p class="specialty">${d.specialty}</p>
        <p class="experience"><i class="fas fa-star"></i> Giàu kinh nghiệm</p>
        <a href="booking.html" class="btn btn-secondary" style="text-align: center; display: block;">
          <i class="fas fa-calendar"></i> Đặt lịch
        </a>
      `;
      list.appendChild(div);
    }
  });
}

// Thử kết nối tới backend
console.log('🔍 Bắt đầu tải danh sách bác sĩ...');
fetch(API + "/doctors")
  .then(res => {
    console.log('📡 Response status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('✅ Backend kết nối thành công, dữ liệu:', data);
    if (data && data.length > 0) {
      renderDoctors(data);
    } else {
      console.warn('⚠️ Backend trả về dữ liệu trống, sử dụng demo');
      renderDoctors(demoDoctor);
    }
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối:', err);
    console.warn('⚠️ Không kết nối được backend, sử dụng dữ liệu demo');
    renderDoctors(demoDoctor);
  });

function book() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const doctor = parseInt(document.getElementById("doctor").value);
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!name || !phone || !doctor || !date || !time) {
    alert('❌ Vui lòng điền đầy đủ tất cả thông tin!');
    return;
  }

  // Tìm tên bác sĩ từ danh sách demo
  const selectedDoctor = demoDoctor.find(d => d.id == doctor);
  const doctorName = selectedDoctor ? selectedDoctor.name : 'Bác sĩ được chọn';

  // Lấy user info nếu đã đăng nhập
  const user = typeof getUser !== 'undefined' ? getUser() : null;

  // Kiểm tra đăng nhập cho đặt lịch
  if (!user) {
    alert('⚠️ Vui lòng đăng nhập để đặt lịch khám!');
    window.location.href = 'login.html';
    return;
  }

  // Thử kết nối tới backend
  fetch(API + "/appointments", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user.token}`
    },
    body: JSON.stringify({
      patient_id: user.id,
      doctor_id: parseInt(doctor),
      appointment_date: date,
      appointment_time: time,
      symptoms: `Khám ${selectedDoctor ? selectedDoctor.specialty : 'tổng quát'} - ${name}`,
      appointment_type: 'consultation'
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('✅ ' + data.message);
        // Redirect to my appointments page
        window.location.href = 'my-appointments.html';
      } else {
        alert('❌ ' + (data.message || 'Lỗi không xác định'));
      }
    })
    .catch(err => {
      // Nếu backend không chạy, vẫn cho phép đặt lịch (demo mode)

      console.warn('⚠️ Backend không hoạt động, lưu dữ liệu tạm thời');
      
      const appointment = {
        patient_name: name,
        phone: phone,
        date: date,
        time: time,
        doctor_name: doctorName,
        doctor_id: doctor
      };

      // Lưu vào localStorage
      let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      appointments.push(appointment);
      localStorage.setItem('appointments', JSON.stringify(appointments));

      alert('✅ Đặt lịch thành công!\n\n' +
            '📋 Thông tin:\n' +
            '• Bệnh nhân: ' + name + '\n' +
            '• Số ĐT: ' + phone + '\n' +
            '• Bác sĩ: ' + doctorName + '\n' +
            '• Ngày: ' + date + '\n' +
            '• Giờ: ' + time + '\n\n' +
            '⚠️ (Lưu trên thiết bị - Backend chưa chạy)\n\n' +
            'Chúng tôi sẽ liên hệ với bạn sớm.');
      
      // Redirect to my appointments page
      window.location.href = 'my-appointments.html';
    });
}
