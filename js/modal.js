/* ═══════════════════════════════════════
   modal.js — Login modal
═══════════════════════════════════════ */

function openModal() {
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Đóng modal khi nhấn Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// Toggle hiện/ẩn mật khẩu
function togglePw() {
  const inp = document.getElementById('login-pw');
  const eye = document.getElementById('pw-eye');
  if (inp.type === 'password') {
    inp.type = 'text';
    eye.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  } else {
    inp.type = 'password';
    eye.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }
}

// Đăng nhập
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-pw').value;
  if (!email || !pw) {
    alert('Vui lòng nhập đầy đủ email và mật khẩu!');
    return;
  }
  closeModal();
  showPage('page-upload');
}
