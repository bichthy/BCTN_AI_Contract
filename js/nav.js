/* ═══════════════════════════════════════
   nav.js — Điều hướng giữa các màn hình
═══════════════════════════════════════ */

/* ── Chuyển màn .page (landing / upload / extract) ── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  closeAllAvatarPopups();

  // Quản lý FAB chatbot: chỉ hiện ở màn extract
  const fab = document.getElementById('chat-fab');
  if (fab) {
    if (id === 'page-extract') {
      // extract.js sẽ tự show FAB khi trích xuất xong — không force show ở đây
    } else {
      // Ẩn FAB và đóng chat khi rời khỏi extract
      fab.style.display = 'none';
      if (typeof closeChat === 'function') closeChat();
    }
  }
}

/* ── Avatar Popup ── */
function toggleAvatarPopup(e) {
  e.stopPropagation();
  const popup = e.currentTarget.closest('.avatar-wrap').querySelector('.avatar-popup');
  const isOpen = popup.classList.contains('open');
  closeAllAvatarPopups();
  if (!isOpen) popup.classList.add('open');
}

function closeAllAvatarPopups() {
  document.querySelectorAll('.avatar-popup').forEach(p => p.classList.remove('open'));
}

document.addEventListener('click', e => {
  closeAllAvatarPopups();
  // Đóng notif panel khi click ra ngoài
  if (!e.target.closest('#notif-panel') && !e.target.closest('.hdr-bell') && !e.target.closest('[onclick*="toggleNotif"]')) {
    const np = document.getElementById('notif-panel');
    if (np) np.classList.remove('open');
  }
});

/* ── Chuyển sang Hợp đồng của tôi ── */
function goToMyContracts() {
  closeAllAvatarPopups();
  // Reset về danh sách trước khi hiện page-contracts
  if (typeof showContractScreen === 'function') showContractScreen('screen-list');
  showPage('page-contracts');
}

/* ── Đăng xuất ── */
function openLogoutConfirm() {
  closeAllAvatarPopups();
  const m = document.getElementById('modal-logout-confirm');
  if (m) m.style.display = 'flex';
}

function closeLogoutConfirm() {
  const m = document.getElementById('modal-logout-confirm');
  if (m) m.style.display = 'none';
}

function doLogout() {
  closeLogoutConfirm();
  showPage('page-landing');
}

/* ── NOTIFICATION PANEL ── */
function toggleNotif(e) {
  e.stopPropagation();
  document.getElementById('notif-panel').classList.toggle('open');
}

function markRead(item) {
  if (item.classList.contains('unread')) {
    item.classList.remove('unread');
    item.classList.add('read');
    const dot = item.querySelector('.notif-dot');
    if (dot) dot.remove();
    updateNotifBadge();
  }
}

function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(item => {
    item.classList.remove('unread');
    item.classList.add('read');
    const dot = item.querySelector('.notif-dot');
    if (dot) dot.remove();
  });
  updateNotifBadge();
}

function updateNotifBadge() {
  const count = document.querySelectorAll('.notif-item.unread').length;
  const badge = document.querySelector('.notif-badge');
  if (badge) badge.textContent = count > 0 ? count + ' mới' : '';
}

/* ── AVATAR POPUP SHARED INJECTION ── */
// Sau khi loadPages xong, inject shared popup vào tất cả .avatar-wrap
function injectSharedAvatarPopup() {
  const popup = document.getElementById('avatar-popup-shared');
  if (!popup) return;
  document.querySelectorAll('.avatar-wrap').forEach(wrap => {
    // Chỉ inject nếu chưa có popup riêng
    if (!wrap.querySelector('.avatar-popup')) {
      const clone = popup.cloneNode(true);
      clone.removeAttribute('id');
      wrap.appendChild(clone);
    }
  });
}
