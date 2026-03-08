-- Dữ liệu mẫu cho cơ sở dữ liệu Bệnh viện Quân Dân Y Miền Đông

-- Chèn dữ liệu chuyên khoa
INSERT OR IGNORE INTO specialties (name, description) VALUES
('Tim mạch', 'Chuyên khoa về bệnh tim mạch và hệ tuần hoàn'),
('Tai mũi họng', 'Chuyên khoa về tai, mũi, họng'),
('Nội tổng quát', 'Khám nội khoa tổng quát'),
('Phụ khoa', 'Chuyên khoa sản phụ khoa'),
('Nhi khoa', 'Chuyên khoa nhi khoa'),
('Chỉnh hình', 'Chuyên khoa chỉnh hình'),
('Hóa học lâm sàng', 'Xét nghiệm hóa học lâm sàng'),
('Mắt', 'Chuyên khoa mắt'),
('Ngoại khoa', 'Phẫu thuật ngoại khoa'),
('Da liễu', 'Chuyên khoa da liễu'),
('Tâm thần', 'Chuyên khoa tâm thần kinh'),
('Nha khoa', 'Chuyên khoa răng hàm mặt'),
('Cột sống', 'Chuyên khoa cột sống'),
('Tiêu hóa', 'Chuyên khoa tiêu hóa'),
('Hô hấp', 'Chuyên khoa hô hấp');

-- Chèn dữ liệu khoa phòng
INSERT OR IGNORE INTO departments (name, description, phone, location) VALUES
('Khoa Nội', 'Khoa nội tổng hợp', '028-77777777', 'Tầng 2'),
('Khoa Ngoại', 'Khoa phẫu thuật ngoại', '028-77777778', 'Tầng 3'),
('Khoa Sản', 'Khoa sản phụ khoa', '028-77777779', 'Tầng 4'),
('Khoa Nhi', 'Khoa nhi khoa', '028-77777780', 'Tầng 5'),
('Khoa Cấp cứu', 'Khoa cấp cứu 24/7', '028-77777781', 'Tầng 1'),
('Khoa Xét nghiệm', 'Khoa xét nghiệm', '028-77777782', 'Tầng trệt');

-- Chèn dữ liệu người dùng mẫu (bao gồm bác sĩ và bệnh nhân)
-- Mật khẩu đã được hash với bcrypt (password: 123456)
INSERT OR IGNORE INTO users (email, password, name, phone, date_of_birth, gender, role, is_active) VALUES
-- Admin
('admin@bvquandany.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'Quản trị viên', '028-77777770', '1980-01-01', 'Nam', 'admin', 1),

-- Bác sĩ
('bs.nguyenvana@bvquandany.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'BS Nguyễn Văn A', '0901234567', '1975-05-15', 'Nam', 'doctor', 1),
('bs.tranthib@bvquandany.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'BS Trần Thị B', '0901234568', '1978-08-20', 'Nữ', 'doctor', 1),
('bs.levanc@bvquandany.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'BS Lê Văn C', '0901234569', '1980-03-10', 'Nam', 'doctor', 1),
('bs.phamthid@bvquandany.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'BS Phạm Thị D', '0901234570', '1976-11-25', 'Nữ', 'doctor', 1),
('bs.dovane@bvquandany.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'BS Đỗ Văn E', '0901234571', '1979-07-30', 'Nam', 'doctor', 1),

-- Bệnh nhân mẫu
('nguyenvana@example.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'Nguyễn Văn A', '0912345678', '1990-01-15', 'Nam', 'patient', 1),
('tranthib@example.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'Trần Thị B', '0912345679', '1985-06-20', 'Nữ', 'patient', 1),
('levanc@example.com', '$2a$10$XPfwY6/LLbA.P.cI/NvgV.QXjRlgLA1DobbMwxzg/ztBJCLoa1IAy', 'Lê Văn C', '0912345680', '1992-09-10', 'Nam', 'patient', 1);

-- Chèn dữ liệu bác sĩ
INSERT OR IGNORE INTO doctors (user_id, specialty_id, department_id, license_number, experience_years, education, consultation_fee, bio) VALUES
(2, 1, 1, 'BS001', 15, 'Đại học Y Hà Nội', 500000, 'Bác sĩ chuyên khoa Tim mạch với 15 năm kinh nghiệm'),
(3, 2, 1, 'BS002', 12, 'Đại học Y TP.HCM', 450000, 'Chuyên gia Tai mũi họng'),
(4, 3, 1, 'BS003', 18, 'Đại học Y Hà Nội', 550000, 'Bác sĩ Nội tổng quát giàu kinh nghiệm'),
(5, 4, 3, 'BS004', 10, 'Đại học Y Dược TP.HCM', 480000, 'Chuyên khoa Phụ sản'),
(6, 5, 4, 'BS005', 14, 'Đại học Y Hà Nội', 520000, 'Bác sĩ Nhi khoa tận tâm');

-- Chèn lịch làm việc mẫu cho bác sĩ
INSERT OR IGNORE INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, max_patients) VALUES
-- BS Nguyễn Văn A (Thứ 2,4,6)
(1, 1, '08:00', '17:00', 20), -- Monday
(1, 3, '08:00', '17:00', 20), -- Wednesday
(1, 5, '08:00', '17:00', 20), -- Friday

-- BS Trần Thị B (Thứ 3,5,7)
(2, 2, '08:30', '16:30', 18), -- Tuesday
(2, 4, '08:30', '16:30', 18), -- Thursday
(2, 6, '08:30', '16:30', 18), -- Saturday

-- BS Lê Văn C (Thứ 2,3,4,5)
(3, 1, '07:30', '16:00', 25), -- Monday
(3, 2, '07:30', '16:00', 25), -- Tuesday
(3, 3, '07:30', '16:00', 25), -- Wednesday
(3, 4, '07:30', '16:00', 25); -- Thursday

-- Chèn dữ liệu thuốc mẫu
INSERT OR IGNORE INTO medications (name, generic_name, description, dosage_form, strength, manufacturer, price, stock_quantity) VALUES
('Paracetamol', 'Acetaminophen', 'Thuốc giảm đau, hạ sốt', 'Viên nén', '500mg', 'Công ty Dược phẩm 1', 5000, 1000),
('Amoxicillin', 'Amoxicillin', 'Kháng sinh', 'Viên nang', '500mg', 'Công ty Dược phẩm 2', 15000, 500),
('Ibuprofen', 'Ibuprofen', 'Thuốc chống viêm', 'Viên nén', '400mg', 'Công ty Dược phẩm 3', 8000, 800),
('Omeprazole', 'Omeprazole', 'Thuốc ức chế bơm proton', 'Viên nang', '20mg', 'Công ty Dược phẩm 4', 12000, 300),
('Amlodipine', 'Amlodipine', 'Thuốc hạ huyết áp', 'Viên nén', '5mg', 'Công ty Dược phẩm 5', 10000, 400);

-- Chèn dữ liệu bảo hiểm mẫu
INSERT OR IGNORE INTO insurance (patient_id, provider, policy_number, coverage_type, valid_from, valid_until) VALUES
(7, 'Bảo hiểm xã hội Việt Nam', 'BH123456789', 'Bảo hiểm y tế', '2024-01-01', '2024-12-31'),
(8, 'Bảo hiểm Bảo Việt', 'BV987654321', 'Bảo hiểm sức khỏe', '2024-03-01', '2025-02-28'),
(9, 'Bảo hiểm Prudential', 'PR456789123', 'Bảo hiểm bệnh hiểm nghèo', '2024-01-15', '2029-01-14');

-- Chèn dữ liệu cuộc hẹn mẫu
INSERT OR IGNORE INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, appointment_type, symptoms, room_number) VALUES
(7, 1, '2024-12-20', '09:00', 'completed', 'consultation', 'Đau ngực, khó thở', '201'),
(8, 2, '2024-12-21', '10:30', 'scheduled', 'consultation', 'Đau họng, ho', '105'),
(9, 3, '2024-12-22', '14:00', 'confirmed', 'follow_up', 'Kiểm tra định kỳ', '301'),
(7, 4, '2024-12-23', '11:00', 'scheduled', 'consultation', 'Đau bụng kinh', '401');

-- Chèn dữ liệu hồ sơ bệnh án mẫu
INSERT OR IGNORE INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, treatment, medications, notes) VALUES
(7, 1, 1, 'Viêm phổi nhẹ', 'Kháng sinh và nghỉ ngơi', 'Amoxicillin 500mg x 2 lần/ngày x 7 ngày', 'Theo dõi triệu chứng, tái khám sau 1 tuần'),
(8, 2, 2, 'Viêm họng cấp', 'Thuốc giảm đau và kháng sinh', 'Paracetamol 500mg khi cần, Amoxicillin 500mg x 2 lần/ngày x 5 ngày', 'Uống nhiều nước, súc miệng nước muối'),
(9, 3, 3, 'Tăng huyết áp nhẹ', 'Thay đổi lối sống và thuốc', 'Amlodipine 5mg x 1 lần/ngày', 'Theo dõi huyết áp hàng tuần');

-- Chèn dữ liệu đánh giá bác sĩ mẫu
INSERT OR IGNORE INTO doctor_ratings (doctor_id, patient_id, appointment_id, rating, review_text, is_anonymous, created_at) VALUES
(1, 7, 1, 5, 'Bác sĩ rất tận tâm và chuyên nghiệp. Giải thích rõ ràng về bệnh tình và cách điều trị.', 0, '2024-12-20 10:00:00'),
(2, 8, 2, 4, 'Khám khá kỹ, kê đơn phù hợp. Phòng khám sạch sẽ.', 0, '2024-12-21 11:00:00'),
(3, 9, 3, 5, 'Bác sĩ rất thân thiện, giải thích chi tiết. Rất hài lòng với dịch vụ.', 0, '2024-12-22 15:00:00'),
(1, 8, NULL, 4, 'Đã từng khám với bác sĩ này, luôn hài lòng với cách điều trị.', 1, '2024-12-15 09:00:00'),
(2, 9, NULL, 5, 'Bác sĩ giỏi, chẩn đoán chính xác. Khuyến khích mọi người nên đến.', 0, '2024-12-18 14:00:00'),
(3, 7, NULL, 4, 'Phục vụ tốt, thời gian chờ không lâu. Bác sĩ nhiệt tình.', 0, '2024-12-19 16:00:00'),
(4, 7, NULL, 5, 'Bác sĩ phụ khoa rất chuyên nghiệp và nhẹ nhàng. Cảm ơn bác sĩ!', 0, '2024-12-10 13:00:00'),
(5, 8, NULL, 4, 'Bác sĩ nhi khoa rất yêu trẻ, con mình rất thích bác sĩ.', 0, '2024-12-12 10:30:00');

-- Chèn dữ liệu đơn thuốc mẫu
INSERT OR IGNORE INTO prescriptions (appointment_id, medication_id, dosage, frequency, duration_days, instructions, quantity) VALUES
(1, 2, '500mg', '2 lần/ngày sau ăn', 7, 'Uống với nước đầy bụng', 14),
(2, 1, '500mg', 'Khi đau, tối đa 4 lần/ngày', 3, 'Không dùng quá liều', 12),
(2, 2, '500mg', '2 lần/ngày sau ăn', 5, 'Uống đủ nước', 10),
(3, 5, '5mg', '1 lần/ngày buổi sáng', 30, 'Theo dõi huyết áp', 30);

-- Chèn dữ liệu thanh toán mẫu
INSERT OR IGNORE INTO payments (appointment_id, patient_id, amount, payment_method, status, notes) VALUES
(1, 7, 500000, 'cash', 'completed', 'Thanh toán đầy đủ'),
(2, 8, 450000, 'insurance', 'completed', 'Thanh toán qua bảo hiểm'),
(3, 9, 550000, 'credit_card', 'completed', 'Thanh toán bằng thẻ'),
(4, 7, 480000, 'bank_transfer', 'pending', 'Chờ xác nhận chuyển khoản');

-- Chèn thông báo mẫu
INSERT OR IGNORE INTO notifications (user_id, title, message, type) VALUES
(7, 'Lịch hẹn sắp tới', 'Bạn có lịch khám với BS Nguyễn Văn A vào ngày 20/12/2024 lúc 09:00', 'info'),
(8, 'Xác nhận lịch hẹn', 'Lịch khám của bạn đã được xác nhận', 'success'),
(9, 'Nhắc nhở thanh toán', 'Vui lòng thanh toán phí khám bệnh', 'warning');