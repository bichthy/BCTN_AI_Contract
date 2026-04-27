/* ═══════════════════════════════════════
   chatbot.js — Trợ lý AI NuverxAI
═══════════════════════════════════════ */

let chatOpen = false;

const SUMMARY_ANSWER = `Hợp đồng này được lập vào ngày 03/07/2025 tại Phòng Công chứng số 1 Hà Nội, ghi nhận việc vợ chồng ông Trần Văn Thuấn và bà Lê Thị Thanh Thủy (Bên A) tự nguyện chuyển nhượng chiếc xe ô tô Honda City RS (biển số 30H-489.96, màu đen, 5 chỗ) cho ông Bùi Đức Thành (Bên B).

Các bên thống nhất thực hiện giao dịch dựa trên giấy chứng nhận đăng ký xe do Công an TP. Hà Nội cấp và tự chịu trách nhiệm hoàn toàn về giá cả, nguồn gốc cũng như hiện trạng thực tế của tài sản mà không yêu cầu công chứng viên phải xác minh các chi tiết này.

Công chứng viên thực hiện nhiệm vụ xác nhận tính tự nguyện của các bên và không chịu trách nhiệm về các vấn đề thương lượng giá cả hay chất lượng kỹ thuật của chiếc xe.`;

// Mở / đóng chat panel
function toggleChat() {
  chatOpen = !chatOpen;
  const panel = document.getElementById('chat-panel');
  const fab   = document.getElementById('chat-fab');
  if (chatOpen) {
    panel.style.display = 'flex';
    setTimeout(() => panel.classList.add('chat-visible'), 10);
    fab.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  } else {
    closeChat();
  }
}

function closeChat() {
  chatOpen = false;
  const panel = document.getElementById('chat-panel');
  const fab   = document.getElementById('chat-fab');
  panel.classList.remove('chat-visible');
  setTimeout(() => { panel.style.display = 'none'; }, 250);
  fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
}

// Gửi gợi ý nhanh
function sendSuggestion(text) {
  document.getElementById('chat-input').value = text;
  sendChat();
}

// Gửi tin nhắn
function sendChat() {
  const input = document.getElementById('chat-input');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';

  appendMsg(msg, 'user');

  // Ẩn suggestions
  const sugg = document.getElementById('chat-suggestions');
  if (sugg) sugg.style.display = 'none';

  // Hiện typing
  const typingId = 'typing-' + Date.now();
  appendTyping(typingId);

  setTimeout(() => {
    removeTyping(typingId);
    appendMsg(getReply(msg), 'bot');
  }, 900);
}

// Logic trả lời
function getReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('tóm tắt') || lower.includes('tom tat')) return SUMMARY_ANSWER;
  if (lower.includes('bên bán') || lower.includes('ben ban'))
    return 'Bên bán (Bên A) là ông Trần Văn Thuấn (CCCD: 031073016234) và vợ là bà Lê Thị Thanh Thủy (CCCD: 001172022895), thường trú tại Căn hộ chung cư số 307, TT Thông Tấn Xã VN, phường Bạch Mai, Hà Nội.';
  if (lower.includes('bên mua') || lower.includes('ben mua'))
    return 'Bên mua (Bên B) là ông Bùi Đức Thành, sinh ngày 09/03/2001, CCCD số 001201005875, thường trú tại P314 B11, phường Thanh Xuân, thành phố Hà Nội.';
  if (lower.includes('xe') || lower.includes('tài sản'))
    return 'Tài sản là 01 xe ô tô HONDA, loại CITYRS, màu Đen, biển số 30H-489.96, số máy L15ZC1012027, số khung RLHGN2681MY008687, 5 chỗ ngồi.';
  if (lower.includes('giá') || lower.includes('giá trị'))
    return 'Giá trị hợp đồng là 200.000.000 đồng (Hai trăm triệu đồng chẵn).';
  if (lower.includes('ngày') || lower.includes('thời gian'))
    return 'Hợp đồng được lập ngày 03 tháng 7 năm 2025, tại Phòng Công chứng số 1 thành phố Hà Nội.';
  return 'Xin lỗi, tôi chưa có đủ thông tin để trả lời. Bạn có thể hỏi về: tóm tắt hợp đồng, bên bán, bên mua, tài sản, giá trị hoặc ngày lập hợp đồng.';
}

// Render tin nhắn
function appendMsg(text, role) {
  const log  = document.getElementById('chat-log');
  const wrap = document.createElement('div');
  const isBot = role === 'bot';
  wrap.style.cssText = `display:flex;align-items:flex-end;gap:8px;margin-bottom:12px;${!isBot ? 'flex-direction:row-reverse;' : ''}`;

  const avatar = document.createElement('div');
  if (isBot) {
    avatar.style.cssText = 'width:28px;height:28px;border-radius:50%;background:#E65134;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;';
    avatar.textContent = '🤖';
  } else {
    avatar.style.cssText = 'width:28px;height:28px;border-radius:50%;background:#F78772;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
    avatar.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;
  }

  const bubble = document.createElement('div');
  bubble.style.cssText = `max-width:75%;padding:10px 13px;border-radius:${isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px'};font-size:13px;line-height:1.65;white-space:pre-wrap;${isBot ? 'background:#F3F4F6;color:#111;' : 'background:#E65134;color:#fff;'}`;
  bubble.textContent = text;

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
}

// Hiện typing indicator
function appendTyping(id) {
  const log  = document.getElementById('chat-log');
  const wrap = document.createElement('div');
  wrap.id = id;
  wrap.style.cssText = 'display:flex;align-items:flex-end;gap:8px;margin-bottom:12px;';
  wrap.innerHTML = `
    <div style="width:28px;height:28px;border-radius:50%;background:#E65134;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;">🤖</div>
    <div style="background:#F3F4F6;border-radius:4px 14px 14px 14px;padding:12px 16px;display:flex;gap:5px;align-items:center;">
      <span style="width:7px;height:7px;border-radius:50%;background:#9CA3AF;animation:dotPulse 1.2s ease-in-out infinite;"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:#9CA3AF;animation:dotPulse 1.2s ease-in-out .2s infinite;"></span>
      <span style="width:7px;height:7px;border-radius:50%;background:#9CA3AF;animation:dotPulse 1.2s ease-in-out .4s infinite;"></span>
    </div>`;
  log.appendChild(wrap);
  log.scrollTop = log.scrollHeight;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Reset về trạng thái ban đầu
function resetChat() {
  document.getElementById('chat-log').innerHTML = buildInitialChat();
}

function buildInitialChat() {
  return `
    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:14px;">
      <div style="width:28px;height:28px;border-radius:50%;background:#E65134;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;">🤖</div>
      <div style="background:#F3F4F6;border-radius:4px 14px 14px 14px;padding:12px 14px;font-size:13px;color:#111;line-height:1.65;max-width:80%;">
        Xin chào 👋<br/>Tôi là trợ lý AI của NuverxAI, sẵn sàng hỗ trợ bạn:
      </div>
    </div>
    <div id="chat-suggestions" style="margin-bottom:4px;">
      <div style="display:flex;flex-direction:column;gap:7px;">
        <div class="chat-sugg-item" onclick="sendSuggestion('Tóm tắt nội dung hợp đồng cho tôi')">
          <span class="chat-sugg-icon">✨</span>
          <div><div class="chat-sugg-text">Tóm tắt nội dung</div><div class="chat-sugg-sub">Hiểu nhanh tài liệu trong vài giây</div></div>
        </div>
        <div class="chat-sugg-item" onclick="sendSuggestion('Trích xuất thông tin các bên')">
          <span class="chat-sugg-icon">📋</span>
          <div><div class="chat-sugg-text">Trích xuất thông tin</div><div class="chat-sugg-sub">Tên, số CCCD, ngày tháng, địa chỉ,...</div></div>
        </div>
        <div class="chat-sugg-item" onclick="sendSuggestion('Phân tích rủi ro trong hợp đồng')">
          <span class="chat-sugg-icon">⚖️</span>
          <div><div class="chat-sugg-text">Phân tích rủi ro</div><div class="chat-sugg-sub">Nhận diện các điểm pháp lý cần lưu ý</div></div>
        </div>
        <div class="chat-sugg-item" onclick="sendSuggestion('Tìm kiếm thông tin chi tiết trong hợp đồng')">
          <span class="chat-sugg-icon">🔍</span>
          <div><div class="chat-sugg-text">Tìm kiếm chi tiết</div><div class="chat-sugg-sub">Hỏi bất kỳ thông tin nào trong tài liệu</div></div>
        </div>
        <div class="chat-sugg-item" onclick="sendSuggestion('Kiểm tra hợp lệ của hợp đồng')">
          <span class="chat-sugg-icon">📄</span>
          <div><div class="chat-sugg-text">Kiểm tra hợp lệ</div><div class="chat-sugg-sub">Phát hiện mâu thuẫn và thiếu sót</div></div>
        </div>
      </div>
    </div>`;
}
