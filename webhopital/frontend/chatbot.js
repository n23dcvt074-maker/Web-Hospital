// Chatbot Widget - BV Quân Dân Y Miền Đông
(function() {
  const API = window.location.origin;

  // Knowledge base for chatbot responses
  const knowledgeBase = {
    "đặt lịch": "Bạn có thể đặt lịch khám tại trang [Đặt lịch](booking.html) hoặc nhấp vào nút 'Đặt lịch khám ngay' trên trang chủ. Chúng tôi có đội ngũ bác sĩ giàu kinh nghiệm sẵn sàng phục vụ.",
    "bác sĩ": "Chúng tôi có 15+ bác sĩ chuyên gia trong nhiều lĩnh vực. Xem danh sách đầy đủ tại trang [Bác sĩ](doctors.html). Bạn có thể chọn bác sĩ mong muốn khi đặt lịch.",
    "giờ làm việc": "🏥 Giờ làm việc của bệnh viện: Mở cửa 24/7 để phục vụ bạn tốt nhất. Chúng tôi luôn sẵn sàng tiếp đón bạn bất cứ lúc nào.",
    "liên hệ": "📞 Liên hệ với chúng tôi:\n• Điện thoại: (028) 7777 7777\n• Email: info@bvquandany.com\n• Địa chỉ: 50 Lê Văn Việt, TP Thủ Đức, TP.HCM",
    "địa chỉ": "📍 Bệnh viện Quân Dân Y Miền Đông\n50 Lê Văn Việt, TP Thủ Đức, TP.HCM\nGần bến xe Miền Đông, dễ dàng giao thông.",
    "chuyên khoa": "Chúng tôi cung cấp dịch vụ khám chuyên khoa:\n• Tim mạch\n• Tai mũi họng\n• Nội tổng quát\n• Phụ khoa\n• Nhi khoa\n• Chỉnh hình\n• Mắt\n• Ngoại khoa\n• Da liễu\n• Nha khoa\nVà nhiều chuyên khoa khác.",
    "dịch vụ": "Chúng tôi cung cấp:\n✓ Khám tổng quát\n✓ Khám chuyên khoa\n✓ Xét nghiệm và chẩn đoán\n✓ Phẫu thuật\n✓ Chăm sóc 24/7\n✓ Thiết bị hiện đại",
    "giá": "Vui lòng liên hệ hotline (028) 7777 7777 hoặc email info@bvquandany.com để biết chi tiết bảng giá dịch vụ và gói khám.",
    "bảo hiểm": "Chúng tôi hỗ trợ thanh toán BHYT. Vui lòng mang theo thẻ BHYT khi đến khám. Nếu có thắc mắc, vui lòng liên hệ (028) 7777 7777.",
    "hủy lịch": "Bạn có thể hủy lịch khám tối thiểu 2 giờ trước giờ khám. Vui lòng gọi hotline (028) 7777 7777 để hủy hoặc chỉnh sửa lịch.",
    "xét nghiệm": "Chúng tôi cung cấp dịch vụ xét nghiệm máu, nước tiểu và các xét nghiệm chuyên biệt khác. Kết quả thường có trong 24-48 giờ.",
    "phẫu thuật": "Chúng tôi thực hiện các ca phẫu thuật với thiết bị hiện đại và đội bác sĩ chuyên gia. Vui lòng tư vấn với bác sĩ để biết thêm chi tiết.",
    "đăng ký": "Bạn có thể đăng ký tài khoản tại trang [Đăng ký](signup.html) để quản lý lịch khám và hồ sơ cá nhân.",
    "đăng nhập": "Đăng nhập vào tài khoản tại trang [Đăng nhập](login.html). Hỗ trợ đăng nhập bằng email/mật khẩu hoặc Google/Facebook.",
    "hồ sơ": "Sau khi đăng nhập, bạn có thể xem và chỉnh sửa hồ sơ cá nhân tại trang [Hồ sơ](profile.html).",
    "lịch khám": "Bạn có thể xem lịch khám của mình tại trang [Lịch khám của tôi](my-appointments.html) sau khi đăng nhập.",
    "hello": "👋 Xin chào! Tôi là trợ lý ảo của BV Quân Dân Y Miền Đông. Tôi có thể giúp bạn về:\n• Đặt lịch khám\n• Thông tin bác sĩ\n• Dịch vụ\n• Liên hệ\n• Giờ làm việc\n\nVui lòng hỏi bất cứ điều gì bạn muốn biết! 😊",
    "hi": "👋 Xin chào! Tôi có thể hỗ trợ bạn với các thông tin về bệnh viện. Hãy hỏi tôi!",
    "help": "Tôi có thể giúp bạn:\n• 📅 Đặt lịch khám\n• 👨‍⚕️ Tìm bác sĩ\n• 🏥 Thông tin dịch vụ\n• 📞 Liên hệ bệnh viện\n• 🕐 Giờ mở cửa\n• 💊 Thông tin chuyên khoa\n\nHỏi tôi bất cứ điều gì!",
    "😊": "Cảm ơn bạn! Chúng tôi luôn nỗ lực để mang đến dịch vụ tốt nhất. 💙",
    "cảm ơn": "Không có gì! Rất vui được giúp đỡ bạn. Nếu còn thắc mắc, vui lòng hỏi tiếp! 😊",
  };

  function findAnswer(query) {
    const q = query.toLowerCase().trim();
    
    // Exact match
    if (knowledgeBase[q]) {
      return knowledgeBase[q];
    }

    // Partial match
    for (const [key, answer] of Object.entries(knowledgeBase)) {
      if (q.includes(key) || key.includes(q)) {
        return answer;
      }
    }

    // No match - fallback
    return "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. 😊 Có thể bạn muốn hỏi về: đặt lịch, bác sĩ, dịch vụ, liên hệ, giờ làm việc, hoặc chuyên khoa?";
  }

  // Create chatbot widget
  function initChatbot() {
    const chatbotHTML = `
      <div id="chatbot-widget" class="chatbot-widget">
        <div class="chatbot-bubble" id="chatbot-toggle">
          <i class="fas fa-comments"></i>
          <span class="chatbot-badge">1</span>
        </div>
        
        <div class="chatbot-container" id="chatbot-container" style="display: none;">
          <div class="chatbot-header">
            <h3>Trợ lý ảo 🤖</h3>
            <button id="chatbot-close" class="chatbot-close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="chatbot-messages" id="chatbot-messages">
            <div class="chatbot-message bot">
              <div class="message-content">Xin chào! 👋 Tôi có thể giúp bạn về đặt lịch, bác sĩ, dịch vụ, hoặc thông tin khác về bệnh viện. Hỏi tôi bất cứ điều gì!</div>
            </div>
          </div>
          
          <div class="chatbot-input-area">
            <input 
              type="text" 
              id="chatbot-input" 
              placeholder="Gõ câu hỏi của bạn..."
              class="chatbot-input"
            >
            <button id="chatbot-send" class="chatbot-send-btn">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // Inject HTML
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Get elements
    const toggle = document.getElementById('chatbot-toggle');
    const container = document.getElementById('chatbot-container');
    const closeBtn = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const messagesDiv = document.getElementById('chatbot-messages');

    // Toggle chat
    toggle.addEventListener('click', () => {
      container.style.display = container.style.display === 'none' ? 'flex' : 'none';
      if (container.style.display === 'flex') {
        input.focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      container.style.display = 'none';
    });

    // Send message
    function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.className = 'chatbot-message user';
      userMsg.innerHTML = `<div class="message-content">${escapeHtml(message)}</div>`;
      messagesDiv.appendChild(userMsg);

      // Clear input
      input.value = '';

      // Scroll to bottom
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      // Get bot response
      setTimeout(() => {
        const answer = findAnswer(message);
        const botMsg = document.createElement('div');
        botMsg.className = 'chatbot-message bot';
        botMsg.innerHTML = `<div class="message-content">${answer}</div>`;
        messagesDiv.appendChild(botMsg);

        // Scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }, 500);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
