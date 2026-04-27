/* ═══════════════════════════════════════
   contracts.js — Logic cho màn Hợp đồng của tôi
═══════════════════════════════════════ */

/* ── DELETE POPUP ── */
let currentDeleteRow = null;

function openDeletePopup(btn, e) {
  e.stopPropagation();
  const row = btn.closest('.tbl-row');
  
  // Lấy sync status từ span trong cột đồng bộ (div thứ 5, index 4)
  const cells = row.querySelectorAll(':scope > div');
  const syncCell = cells[4];
  const syncSpan = syncCell ? syncCell.querySelector('span') : null;
  const syncText = syncSpan ? syncSpan.textContent.trim() : (syncCell ? syncCell.textContent.trim() : '');
  if (syncText !== 'Chưa đồng bộ') return;

  currentDeleteRow = row;
  const popup = document.getElementById('delete-popup');
  popup.classList.add('open');
  const rect   = btn.getBoundingClientRect();
  const popupW = 330;
  const popupH = popup.offsetHeight;
  let left = rect.right - popupW;
  let top  = rect.top - popupH - 12;
  if (left < 10) left = 10;
  if (top  < 10) top  = rect.bottom + 10;
  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
}

function closeDeletePopup() {
  document.getElementById('delete-popup').classList.remove('open');
  currentDeleteRow = null;
}

function confirmDelete() {
  if (currentDeleteRow) {
    currentDeleteRow.style.animation = 'fadeOut .3s ease forwards';
    setTimeout(() => { if (currentDeleteRow) currentDeleteRow.remove(); }, 300);
  }
  closeDeletePopup();
  showDeleteToast(); // ← thêm dòng này
}

/* ── CALENDAR ── */
const VI_MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const VI_DOW    = ['CN','T2','T3','T4','T5','T6','T7'];
const calState  = {};

function getOrInit(calId) {
  if (!calState[calId]) {
    const el  = document.getElementById(calId);
    const raw = el ? el.dataset.init : null;
    const t   = new Date();
    let y = t.getFullYear(), m = t.getMonth(), sel = null;
    if (raw) {
      const [ry,rm,rd] = raw.split('-').map(Number);
      y = ry; m = rm - 1; sel = { y: ry, m: rm - 1, d: rd };
    }
    calState[calId] = { year: y, month: m, selected: sel };
  }
  return calState[calId];
}

function renderCal(calId) {
  const el = document.getElementById(calId);
  if (!el) return;
  const s = getOrInit(calId);
  const { year, month, selected } = s;
  const today    = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMon= new Date(year, month + 1, 0).getDate();
  const prevTotal= new Date(year, month, 0).getDate();
  let html = `<div class="cal-head">
    <button class="cal-nav" onclick="calNav('${calId}',-1);event.stopPropagation()">&#171;</button>
    <div class="cal-month-label">${VI_MONTHS[month]} ${year}</div>
    <button class="cal-nav" onclick="calNav('${calId}',1);event.stopPropagation()">&#187;</button>
  </div><div class="cal-grid">`;
  VI_DOW.forEach(d => { html += `<div class="cal-dow">${d}</div>`; });
  for (let i = firstDay - 1; i >= 0; i--) html += `<div class="cal-day other-month">${prevTotal - i}</div>`;
  for (let d = 1; d <= daysInMon; d++) {
    let cls = 'cal-day';
    const isSel   = selected && selected.y === year && selected.m === month && selected.d === d;
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
    if (isSel) cls += ' selected'; else if (isToday) cls += ' today';
    html += `<div class="${cls}" onclick="calSelect('${calId}',${d});event.stopPropagation()">${d}</div>`;
  }
  const filled   = firstDay + daysInMon;
  const nextFill = filled % 7 === 0 ? 0 : 7 - (filled % 7);
  for (let d = 1; d <= nextFill; d++) html += `<div class="cal-day other-month">${d}</div>`;
  html += '</div>';
  el.innerHTML = html;
}

function positionCal(calId, anchor) {
  const el = document.getElementById(calId);
  if (!el) return;
  const r = anchor.getBoundingClientRect();
  let top = r.bottom + 6, left = r.left;
  if (left + 290 > window.innerWidth - 10) left = window.innerWidth - 300;
  if (top + 320 > window.innerHeight) top = r.top - 326;
  el.style.top  = top  + 'px';
  el.style.left = left + 'px';
}

function openCal(calId, inputEl) {
  closeAllCals();
  getOrInit(calId);
  syncCalFromInput(calId, inputEl.value);
  renderCal(calId);
  positionCal(calId, inputEl);
  document.getElementById(calId).classList.add('open');
}

function toggleCalFromIcon(calId, inputId) {
  event.stopPropagation();
  const el  = document.getElementById(calId);
  const inp = document.getElementById(inputId);
  if (el.classList.contains('open')) { el.classList.remove('open'); }
  else { openCal(calId, inp); }
}

function closeAllCals() {
  document.querySelectorAll('.cal-popup.open').forEach(c => c.classList.remove('open'));
}

function calNav(calId, dir) {
  event.stopPropagation();
  const s = getOrInit(calId);
  s.month += dir;
  if (s.month > 11) { s.month = 0; s.year++; }
  if (s.month <  0) { s.month = 11; s.year--; }
  renderCal(calId);
}

function calSelect(calId, day) {
  const s   = getOrInit(calId);
  s.selected = { y: s.year, m: s.month, d: day };
  const tid  = document.getElementById(calId).dataset.target;
  document.getElementById(tid).value =
    `${String(day).padStart(2,'0')}/${String(s.month + 1).padStart(2,'0')}/${s.year}`;
  renderCal(calId);
  setTimeout(() => document.getElementById(calId).classList.remove('open'), 150);
}

function syncCalFromInput(calId, val) {
  const m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return;
  const d = parseInt(m[1]), mo = parseInt(m[2]) - 1, y = parseInt(m[3]);
  if (mo < 0 || mo > 11 || d < 1 || d > 31) return;
  const s = getOrInit(calId);
  s.year = y; s.month = mo; s.selected = { y, m: mo, d };
  if (document.getElementById(calId).classList.contains('open')) renderCal(calId);
}

/* ── Bộ lọc nâng cao calendar ── */
function toggleAdvCal(calId, inputId) {
  const el  = document.getElementById(calId);
  const inp = document.getElementById(inputId);
  if (el.classList.contains('open')) return;
  closeAllCals();
  getOrInit(calId);
  syncCalFromInput(calId, inp.value);
  renderCal(calId);
  positionCal(calId, inp);
  el.classList.add('open');
}

function toggleAdvCalIcon(calId, inputId) {
  const el  = document.getElementById(calId);
  const inp = document.getElementById(inputId);
  if (el.classList.contains('open')) { el.classList.remove('open'); }
  else {
    closeAllCals();
    getOrInit(calId);
    syncCalFromInput(calId, inp.value);
    renderCal(calId);
    positionCal(calId, inp);
    el.classList.add('open');
  }
}

function toggleAdvSelect(ddId, btnId) {
  event.stopPropagation();
  const dd  = document.getElementById(ddId);
  const btn = document.getElementById(btnId);
  const isOpen = dd.classList.contains('open');
  closeAllAdvDropdowns();
  if (!isOpen) { dd.classList.add('open'); btn.classList.add('open'); }
}

function closeAllAdvDropdowns() {
  document.querySelectorAll('.adv-dropdown.open').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.adv-select-btn.open').forEach(b => b.classList.remove('open'));
}

function selectAdvOption(ddId, btnId, valId, item) {
  event.stopPropagation();
  document.getElementById(valId).textContent = item.textContent.trim();
  document.querySelectorAll('#' + ddId + ' .adv-dropdown-item').forEach(i => i.classList.remove('selected'));
  item.classList.add('selected');
  document.getElementById(ddId).classList.remove('open');
  document.getElementById(btnId).classList.remove('open');
}

function toggleAdvFilter() {
  const panel = document.getElementById('adv-filter-panel');
  const btn   = document.getElementById('adv-filter-btn');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open');
  btn.style.background = isOpen ? '#fff' : '#E651341A';
}

/* ── PDF ── */
function handlePdfDrop(e) {
  e.preventDefault();
  document.getElementById('pdf-drop-zone').classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f && f.type === 'application/pdf') handlePdfUpload(f);
}

function handlePdfUpload(file) {
  if (!file) return;
  document.getElementById('pdf-filename').textContent = file.name;
  document.getElementById('pdf-upload-state').style.display  = 'none';
  document.getElementById('pdf-preview-state').style.display = 'block';
  const lbl = document.getElementById('sidebar-pdf-label');
  lbl.style.color = '#E65134'; lbl.style.fontWeight = '600';
}

function removePdf() {
  document.getElementById('pdf-upload-state').style.display  = 'block';
  document.getElementById('pdf-preview-state').style.display = 'none';
  document.getElementById('pdf-file-input').value = '';
  const lbl = document.getElementById('sidebar-pdf-label');
  lbl.style.color = ''; lbl.style.fontWeight = '';
}

/* ── STATUS & NAVIGATION ── */
const statusConfig = {
  verified: { label:'Đã xác thực', border:'#4ADE80CC', bg:'#4ADE801A', color:'#15803d' },
  archived: { label:'Lưu trữ',     border:'#8FB8FFCC', bg:'#8FB8FF33', color:'#5578DB' },
  draft:    { label:'Nháp',        border:'#FCD34DCC', bg:'#FFF8E5',   color:'#CAA016' },
};
const syncStyle = {
  'Chờ phê duyệt': { border:'#FCD34DCC', bg:'#FFF8E5',   color:'#CAA016' },
  'Đã phê duyệt':  { border:'#4ADE80CC', bg:'#4ADE801A', color:'#15803d' },
  'Bị từ chối':    { border:'#DA251DB0', bg:'#DA251D1A', color:'#DA251D' },
  'Chưa đồng bộ':  { border:'#9CA3AF',   bg:'#ECEEF1',   color:'#6B7280' },
};
const BLOCKED = ['Chờ phê duyệt', 'Đã đồng bộ'];

const ALLOWED_SYNC = ['Bị từ chối', 'Chưa đồng bộ'];

const delIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;
const delTip = `<div style="display:flex;gap:10px;"><div style="width:34px;height:34px;flex-shrink:0;border-radius:8px;background:#fde8e8;display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E65134" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></div><div><div style="font-size:13px;font-weight:700;color:#111;margin-bottom:5px;">Không thể xóa hợp đồng</div><div style="font-size:12px;color:#444;line-height:1.6;">Hợp đồng này <span style="color:#E65134;font-weight:500;">đã được lưu và đồng bộ</span>, nên không thể thực hiện xóa.</div></div></div>`;

function goToDetail(name, code, date, docStatus, syncStatus) {
  document.getElementById('detail-title').textContent = name;
  document.getElementById('sidebar-contract-name').textContent = name;
  document.getElementById('doc-main-title').textContent = name;
  document.getElementById('tq-contract-name').value = name;
  document.getElementById('detail-date').textContent = date;

  const dsCfg = statusConfig[docStatus];
  const ds = document.getElementById('detail-doc-status');
  ds.textContent = dsCfg.label;
  ds.style.cssText = `padding:6px 11px;border-radius:6px;font-size:13px;font-weight:500;border:1px solid ${dsCfg.border};background:${dsCfg.bg};color:${dsCfg.color};`;

  const ssCfg = syncStyle[syncStatus] || syncStyle['Chưa đồng bộ'];
  const ss = document.getElementById('detail-sync-status');
  ss.textContent = syncStatus;
  ss.style.cssText = `padding:6px 22px;border-radius:6px;font-size:13px;font-weight:500;border:1px solid ${ssCfg.border};background:${ssCfg.bg};color:${ssCfg.color};`;

  const saveBtn = document.getElementById('save-sync-btn');
  const tipMsg  = document.getElementById('save-tooltip-msg');
  if (ALLOWED_SYNC.includes(syncStatus)) {
    saveBtn.className = 'save-btn active-btn';
    saveBtn.onclick = () => showSaveToast();
    tipMsg.innerHTML = '';
  } else {
    saveBtn.className = 'save-btn';
    saveBtn.onclick = null;
    tipMsg.innerHTML = `Hợp đồng đang trong trạng thái <strong>${syncStatus.toLowerCase()}</strong>, bạn <span style="color:#E65134;font-weight:600;">không thể thao tác</span> lúc này.`;
  }

  document.getElementById('pdf-upload-state').style.display  = 'block';
  document.getElementById('pdf-preview-state').style.display = 'none';
  const lbl = document.getElementById('sidebar-pdf-label');
  lbl.style.color = ''; lbl.style.fontWeight = '';

  switchTabItem(document.querySelector('#detail-tab-bar .tab-item'), 'ct-panel-toanvan');
  showContractScreen('screen-detail');
}

// Quay về app chính (màn upload)
function backToApp() {
  // Reset file-input để chọn lại cùng file vẫn trigger onchange
  const fi = document.getElementById('file-input');
  if (fi) fi.value = '';
  showPage('page-upload');
}

function goBack() {
  // Quay về danh sách hợp đồng
  showContractScreen('screen-list');
}

// Hiện màn contracts — bật đúng .screen bên trong #page-contracts
function showContractScreen(id) {
  // Ẩn tất cả .screen rồi bật đúng màn
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) { target.classList.add('active'); }
  window.scrollTo(0, 0);

  // FAB chatbot: ẩn hoàn toàn trong màn contracts
  const fab = document.getElementById('chat-fab');
  if (fab) {
    fab.style.display = 'none';
    if (typeof closeChat === 'function') closeChat();
  }
}

function switchTabItem(el, panelId) {
  el.closest('.tab-bar').querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activatePanel(panelId);
  updateSidebarPdf(panelId);
}

function switchToTab(panelId) {
  const tabs = document.querySelectorAll('#detail-tab-bar .tab-item');
  const map  = { 'ct-panel-toanvan':0, 'ct-panel-vanbangoc':1, 'ct-panel-tongquan':2, 'ct-panel-pdf':3 };
  tabs.forEach((t, i) => t.classList.toggle('active', i === map[panelId]));
  activatePanel(panelId);
  updateSidebarPdf(panelId);
}

function activatePanel(panelId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
}

function updateSidebarPdf(panelId) {
  const link = document.getElementById('sidebar-pdf-link');
  link.classList.toggle('active', panelId === 'ct-panel-pdf');
}

function toggleDropdown(badge) {
  const dd   = badge.nextElementSibling;
  const open = dd.classList.contains('open');
  closeAllDropdowns();
  if (!open) {
    const row = badge.closest('[data-status]');
    const currentStatus = row ? row.dataset.status : '';
    dd.querySelectorAll('.status-dropdown-item.draft').forEach(item => {
      item.style.display = (currentStatus === 'draft') ? '' : 'none';
    });
    dd.classList.add('open');
    badge.classList.add('open');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.status-dropdown.open').forEach(d => {
    d.classList.remove('open');
    d.previousElementSibling.classList.remove('open');
  });
}

function selectStatus(item, type) {
  const dd  = item.closest('.status-dropdown');
  const badge = dd.previousElementSibling;
  const row   = badge.closest('[data-status]');
  const cfg   = statusConfig[type];
  badge.querySelector('.label-text').textContent = cfg.label;
  badge.style.border     = '1px solid ' + cfg.border;
  badge.style.background = cfg.bg;
  badge.style.color      = cfg.color;
  badge.querySelector('svg').setAttribute('stroke', cfg.color);
  row.dataset.status = type;
  closeAllDropdowns();

  const ac     = row.querySelector('.action-cell');
  const els    = ac.querySelectorAll(':scope > *');
  const second = els[1];

  // Lấy sync status từ span trong cột đồng bộ (div thứ 5, index 4)
  const cells = row.querySelectorAll(':scope > div');
  const syncCell = cells[4]; // div chứa badge đồng bộ
  const syncSpan = syncCell ? syncCell.querySelector('span') : null;
  const syncText = syncSpan ? syncSpan.textContent.trim() : (syncCell ? syncCell.textContent.trim() : '');

  if (syncText === 'Chưa đồng bộ') {
    if (second.classList.contains('del-btn-wrap')) {
      const btn = document.createElement('button');
      btn.className = 'del-btn';
      btn.setAttribute('onclick', 'openDeletePopup(this,event)');
      btn.innerHTML = delIconSVG;
      second.replaceWith(btn);
    }
  } else {
    if (!second.classList.contains('del-btn-wrap')) {
      const w = document.createElement('div');
      w.className = 'del-btn-wrap';
      w.innerHTML = `<button class="del-btn disabled">${delIconSVG}</button><div class="tooltip-box">${delTip}</div>`;
      second.replaceWith(w);
    }
  }
}

/* ── NOTIFICATION ── */


/* ── GLOBAL CLICK HANDLERS ── */
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = '@keyframes fadeOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(20px)}}';
document.head.appendChild(fadeOutStyle);

document.addEventListener('click', e => {
  if (!e.target.closest('.status-wrapper'))  closeAllDropdowns();
  if (!e.target.closest('.adv-select-wrap')) closeAllAdvDropdowns();
  if (!e.target.closest('.adv-date-icon') && !e.target.closest('.cal-popup')) {
    ['cal-adv-from','cal-adv-to'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('open');
    });
  }
  if (!e.target.closest('.date-field') && !e.target.closest('.cal-popup')) closeAllCals();
  if (!e.target.closest('.delete-confirm-popup') && !e.target.closest('.del-btn')) closeDeletePopup();

});

window.addEventListener('scroll', () => { closeAllCals(); closeDeletePopup(); }, true);
window.addEventListener('resize', () => { closeAllCals(); closeDeletePopup(); });

/* ── Toast lưu & đồng bộ ── */
function showSaveToast() {
  let toast = document.getElementById('toast-save-sync');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-save-sync';
    toast.style.cssText = `
      position:fixed;top:80px;right:24px;z-index:99999;
      display:flex;align-items:center;gap:10px;
      padding:12px 20px 12px 14px;
      background:#DEF7E7;border:1.5px solid #4ADE80CC;
      border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);
      font-size:14px;font-weight:600;color:#15803d;
      opacity:0;transform:translateX(30px);
      transition:opacity .4s ease,transform .4s ease;
      pointer-events:none;
    `;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
      </svg>
      Lưu thành công và đang chờ duyệt
    `;
    document.body.appendChild(toast);
  }
  clearTimeout(toast._t);
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(30px)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });
  });
  toast._t = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
  }, 1500);
}

/* ── Toast xóa thành công ── */
function showDeleteToast() {
  let toast = document.getElementById('toast-delete-success');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-delete-success';
    toast.style.cssText = `
      position:fixed;top:80px;right:24px;z-index:99999;
      display:flex;align-items:center;gap:10px;
      padding:12px 20px 12px 14px;
      background:#DEF7E7;border:1.5px solid #4ADE80CC;
      border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);
      font-size:14px;font-weight:600;color:#15803d;
      opacity:0;transform:translateX(30px);
      transition:opacity .4s ease,transform .4s ease;
      pointer-events:none;
    `;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
      </svg>
      Xóa hợp đồng thành công
    `;
    document.body.appendChild(toast);
  }
  clearTimeout(toast._t);
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(30px)';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }));
  toast._t = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
  }, 1500);
}