(function() {
  'use strict';

  // Knowledge base for chatbot
  const knowledgeBase = {
    // Appointments
    'đặt lịch': 'Để đặt lịch khám, hãy vào mục "Đặt lịch" trên website hoặc nhấn nút "Đặt Lịch Ngay" tại trang chính. Bạn cần chọn bác sĩ, ngày, giờ phù hợp.',
    'hủy lịch': 'Để hủy lịch khám, vui lòng liên hệ với chúng tôi qua số hotline hoặc email. Hủy lịch trước 24 giờ để được hoàn tiền hoàn toàn.',
    'xác nhận lịch': 'Lịch khám của bạn sẽ được xác nhận trong vòng 24 giờ. Bạn sẽ nhận được email và SMS xác nhận.',
    
    // Doctors
    'bác sĩ': 'Bệnh viện của chúng tôi có đội ngũ bác sĩ có kinh nghiệm, chuyên môn cao. Hãy ghé trang "Các Bác Sĩ" để xem chi tiết về từng bác sĩ.',
    'chuyên khoa': 'Chúng tôi có các chuyên khoa: Tim mạch, Nội khoa, Ngoại khoa, Nhi khoa, Phụ khoa, Nha khoa, Mắt, Tai Mũi Họng.',
    
    // Services
    'dịch vụ': 'Các dịch vụ chính: Khám tổng quát, Xét nghiệm máu, Chụp X-quang, Siêu âm, CT scan, MRI, Phẫu thuật, Phục hồi chức năng.',
    'giá dịch vụ': 'Giá dịch vụ khác nhau tùy theo loại khám. Liên hệ hotline hoặc ghé trực tiếp để được tư vấn chi tiết.',
    
    // Hours & Contact
    'giờ làm': 'Bệnh viện mở cửa 24/7 để phục vụ bệnh nhân. Bạn có thể đặt lịch bất cứ lúc nào.',
    'liên hệ': 'Hotline: 1900 9999 | Email: info@hospital.com | Địa chỉ: Tân Bình, TP. HCM',
    'điện thoại': 'Số điện thoại liên hệ: 1900 9999. Chúng tôi sẵn sàng hỗ trợ 24/7.',
    'email': 'Email liên hệ: info@hospital.com',
    'địa chỉ': 'Địa chỉ: Đường ABC, Phường XYZ, Quận Tân Bình, TP. Hồ Chí Minh.',
    
    // Registration
    'đăng ký': 'Để đăng ký tài khoản, nhấn vào "Đăng Ký" trên trang chính. Điền thông tin cá nhân và tạo mật khẩu.',
    'quên mật khẩu': 'Nhấn "Quên Mật Khẩu" trên trang đăng nhập. Chúng tôi sẽ gửi link đặt lại mật khẩu qua email.',
    'đăng nhập': 'Sử dụng email và mật khẩu để đăng nhập. Bạn cũng có thể đăng nhập bằng Google hoặc Facebook.',
    
    // Profile
    'hồ sơ': 'Quản lý hồ sơ cá nhân tại mục "Hồ Sơ". Cập nhật thông tin liên hệ, bệnh sử, dị ứng dược.',
    'cập nhật thông tin': 'Vào mục "Hồ Sơ", nhấn "Chỉnh Sửa" và cập nhật thông tin của bạn. Nhấn "Lưu" để hoàn tất.',
    
    // Other
    'bệnh viện': 'Bệnh viện của chúng tôi là một cơ sở y tế hiện đại, được trang bị những thiết bị y tế tân tiến nhất.',
    'hỗ trợ': 'Tôi luôn sẵn sàng giúp bạn. Có câu hỏi gì khác không?',
    'cảm ơn': 'Rất vui được giúp bạn! 😊 Có gì khác tôi có thể giúp không?',
    'xin chào': 'Xin chào! 👋 Tôi là chatbot của bệnh viện. Tôi có thể giúp bạn về đặt lịch, bác sĩ, dịch vụ, hoặc thông tin khác về bệnh viện.'
  };

  // Function to find answer
  function findAnswer(query) {
    const lowerQuery = query.toLowerCase();
    
    // Exact match
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerQuery.includes(key)) {
        return value;
      }
    }
    
    // Partial match
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (key.includes(lowerQuery) || lowerQuery.includes(key.substring(0, 3))) {
        return value;
      }
    }
    
    // Default response
    return 'Xin lỗi, tôi không hiểu câu hỏi của bạn. Vui lòng thử hỏi về đặt lịch, bác sĩ, dịch vụ, hoặc thông tin liên hệ.';
  }

  // Function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize chatbot
  function initChatbot() {
    // Check if chatbot widget already exists
    if (document.getElementById('chatbot-widget')) {
      return;
    }

    // Create chatbot HTML
    const chatbotHTML = `
      <div id="chatbot-widget" class="chatbot-widget">
        <div class="chatbot-header">
          <span>Hỗ Trợ Khách Hàng</span>
          <button id="chatbot-close" class="chatbot-close" aria-label="Close chatbot">×</button>
        </div>
        <div id="chatbot-messages" class="chatbot-messages">
          <div class="chatbot-message bot-message">
            <p>Xin chào! 👋 Tôi có thể giúp bạn về đặt lịch, bác sĩ, dịch vụ, hoặc thông tin khác về bệnh viện. Hỏi tôi bất cứ điều gì!</p>
          </div>
        </div>
        <div class="chatbot-input-area">
          <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Gõ câu hỏi của bạn..." />
          <button id="chatbot-send" class="chatbot-send" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Toggle chatbot">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
        </svg>
      </button>
    `;

    // Append to body
    const chatbotContainer = document.createElement('div');
    chatbotContainer.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotContainer);

    // Event listeners
    const toggleBtn = document.getElementById('chatbot-toggle');
    const widget = document.getElementById('chatbot-widget');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');
    const messagesDiv = document.getElementById('chatbot-messages');

    // Toggle chatbot
    toggleBtn.addEventListener('click', () => {
      widget.classList.toggle('active');
      if (widget.classList.contains('active')) {
        input.focus();
      }
    });

    // Close chatbot
    closeBtn.addEventListener('click', () => {
      widget.classList.remove('active');
    });

    // Send message
    function sendMessage() {
      const message = input.value.trim();
      if (message === '') return;

      // Add user message
      const userMsgDiv = document.createElement('div');
      userMsgDiv.className = 'chatbot-message user-message';
      userMsgDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
      messagesDiv.appendChild(userMsgDiv);

      // Clear input
      input.value = '';

      // Scroll to bottom
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      // Get bot response
      setTimeout(() => {
        const answer = findAnswer(message);
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'chatbot-message bot-message';
        botMsgDiv.innerHTML = `<p>${escapeHtml(answer)}</p>`;
        messagesDiv.appendChild(botMsgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }, 500);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Initialize chatbot when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
