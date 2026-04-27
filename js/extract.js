/* ═══════════════════════════════════════
   extract.js — Trích xuất & tab viewer
═══════════════════════════════════════ */

// Chuyển tab Toàn văn / Văn bản gốc
function switchDocTab(tab) {
  document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel-doc').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

// Bắt đầu trích xuất
function doExtract() {
  if (uploadedFiles.length === 0) return;
  document.getElementById('progress-wrap').classList.add('show');
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-pct').textContent = '0%';
  document.getElementById('step-ocr').className = 'step-pill active-step';
  document.getElementById('step-ocr').innerHTML = '● OCR';
  document.getElementById('step-hc').className = 'step-pill idle';
  document.getElementById('step-hc').innerHTML = 'Hiệu chỉnh';
  document.getElementById('step-tx').className = 'step-pill idle';
  document.getElementById('step-tx').innerHTML = 'Trích xuất';
  document.getElementById('result-idle').style.display = 'none';
  document.getElementById('result-processing').style.display = 'flex';
  document.getElementById('result-content').classList.remove('show');
  document.getElementById('result-actions').style.display = 'none';
  startProgress();
}

// Animate thanh progress
function startProgress() {
  let pct = 0;
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    pct += Math.random() * 3.5;
    if (pct > 100) pct = 100;

    if (pct >= 35 && document.getElementById('step-ocr').className !== 'step-pill done') {
      document.getElementById('step-ocr').className = 'step-pill done';
      document.getElementById('step-ocr').innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> OCR';
      document.getElementById('step-hc').className = 'step-pill active-step';
      document.getElementById('step-hc').innerHTML = '● Hiệu chỉnh';
    }
    if (pct >= 70 && document.getElementById('step-hc').className !== 'step-pill done') {
      document.getElementById('step-hc').className = 'step-pill done';
      document.getElementById('step-hc').innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Hiệu chỉnh';
      document.getElementById('step-tx').className = 'step-pill active-step';
      document.getElementById('step-tx').innerHTML = '● Trích xuất';
    }

    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-pct').textContent = Math.round(pct) + '%';

    if (pct >= 100) {
      clearInterval(progressInterval);
      document.getElementById('step-tx').className = 'step-pill done';
      document.getElementById('step-tx').innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Trích xuất';
      setTimeout(() => {
        document.getElementById('progress-wrap').classList.remove('show');
        document.getElementById('doc-tabs').classList.add('show');
        switchDocTab('toanvan');
        document.getElementById('result-processing').style.display = 'none';
        document.getElementById('result-content').classList.add('show');
        document.getElementById('result-actions').style.display = 'flex';
        document.getElementById('btn-luu-nhap').style.display = 'flex';
        document.getElementById('chat-fab').style.display = 'flex';
        document.getElementById('btn-export-word').disabled = false;
      }, 500);
    }
  }, 180);
}

/* ── Tra cứu ngăn chặn ── */
function openNganChan() {
  document.getElementById('modal-ngan-chan').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeNganChan() {
  document.getElementById('modal-ngan-chan').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Toast helper ── */
function showToast(id) {
  const t = document.getElementById(id);
  if (!t) return;
  clearTimeout(t._hideTimer);
  t.classList.remove('hiding');
  t.classList.add('show');
  t._hideTimer = setTimeout(() => {
    t.classList.add('hiding');
    setTimeout(() => { t.classList.remove('show', 'hiding'); }, 400);
  }, 1500);
}

/* ── Lưu & Đồng bộ ── */
function luuVaDongBo() {
  showToast('toast-luu-dongbo');
}

/* ── Lưu nháp ── */
function luuNhap() {
  showToast('toast-luu-nhap');
}

/* ══════════════════════════════════════════
   MODAL LỜI CHỨNG CÔNG CHỨNG
══════════════════════════════════════════ */

function openLoiChung() {
  document.getElementById('modal-loi-chung').classList.add('open');
  document.body.style.overflow = 'hidden';
  updateLoiChungPreview();
}

function closeLoiChung() {
  document.getElementById('modal-loi-chung').classList.remove('open');
  document.body.style.overflow = '';
}

function updateLoiChungPreview() {
  const vaiTroA   = document.getElementById('lc-vai-tro-a').value.trim() || 'Bên bán';
  const noiDungA  = document.getElementById('lc-noi-dung-a').value.trim();
  const vaiTroB   = document.getElementById('lc-vai-tro-b').value.trim() || 'Bên mua';
  const noiDungB  = document.getElementById('lc-noi-dung-b').value.trim();

  // Lấy ngày hiện tại dạng "ngày DD tháng MM năm YYYY"
  const now = new Date();
  const ngay = `ngày ${String(now.getDate()).padStart(2,'0')} tháng ${String(now.getMonth()+1).padStart(2,'0')} năm ${now.getFullYear()}`;

  const html = `
    <p class="doc-center doc-bold">LỜI CHỨNG CỦA CÔNG CHỨNG VIÊN</p>
    <p style="margin-top:14px;">
      Ngày ${String(now.getDate()).padStart(2,'0')} tháng ${String(now.getMonth()+1).padStart(2,'0')} năm ${now.getFullYear()},
      tại trụ sở Phòng công chứng số 1 Thành phố Hà Nội – số 310 phố Bà Triệu, phường Hai Bà Trưng, Thành phố Hà Nội, tôi,
      Ngô Thị Thu Hoa – Công chứng viên, trong phạm vi quyền hạn và trách nhiệm của mình theo quy định pháp luật,
    </p>
    <p class="doc-center doc-bold" style="margin:14px 0 10px;"><span class="doc-underline">CHỨNG NHẬN</span></p>
    <p><em>Bản Hợp đồng mua bán này được giao kết giữa:</em></p>

    <p style="margin-top:10px;"><strong>${vaiTroA.toUpperCase()} (Bên A):</strong></p>
    <p class="doc-indent">${noiDungA.replace(/\n/g,'<br/>')}</p>

    <p style="margin-top:10px;"><strong>${vaiTroB.toUpperCase()} (Bên B):</strong></p>
    <p class="doc-indent">${noiDungB.replace(/\n/g,'<br/>')}</p>

    <p style="margin-top:12px;">- Các bên đã tự nguyện giao kết văn bản công chứng này;</p>
    <p>- Tại thời điểm ký vào văn bản công chứng này, các bên giao kết có năng lực hành vi dân sự theo qui định của pháp luật;</p>
    <p>- Các bên giao kết cam đoan chịu trách nhiệm trước pháp luật về tính chính xác, tính hợp pháp của những thông tin và các giấy tờ đã cung cấp liên quan đến việc giao kết văn bản công chứng này;</p>
    <p>- Mục đích, nội dung của văn bản công chứng không vi phạm pháp luật, không trái đạo đức xã hội;</p>
    <p>- Các bên giao kết đã tự đọc lại văn bản công chứng, đồng ý toàn bộ nội dung và ký vào từng trang của văn bản công chứng trước sự chứng kiến của tôi vào ${ngay}; chữ ký trong văn bản công chứng dùng là chữ ký của các bên nêu trên;</p>
    <p>- Văn bản công chứng này được lập thành 05 (năm) bản gốc, mỗi bản gốc gồm 06 (sáu) tờ, 06 (sáu) trang, có giá trị pháp lý như nhau; người yêu cầu công chứng giữ 04 (bốn) bản gốc; 01 (một) bản gốc lưu tại Phòng Công chứng số 1 Thành phố Hà Nội.</p>

    <p style="margin-top:16px;text-align:center;">Số công chứng ......../2026/CCGD</p>
    <p class="doc-center doc-bold">CÔNG CHỨNG VIÊN</p>

    <div class="doc-signatures">
      <div class="doc-sig-col">
        <p class="doc-bold">CÔNG CHỨNG VIÊN</p>
        <p style="font-size:11px;color:#888;margin:4px 0 40px;">(Ký, đóng dấu)</p>
      </div>
      <div class="doc-sig-col">
        <p class="doc-bold">BÊN BÁN</p>
        <p style="font-size:11px;color:#888;margin:4px 0 40px;">(Ký tên)</p>
      </div>
      <div class="doc-sig-col">
        <p class="doc-bold">BÊN MUA</p>
        <p style="font-size:11px;color:#888;margin:4px 0 40px;">(Ký tên)</p>
      </div>
    </div>
  `;

  document.getElementById('lc-preview-doc').innerHTML = html;
}

function doExportWord() {
  // Đóng modal và hiển thị thông báo xuất thành công
  closeLoiChung();
  // Hiện pill thông báo
  let pill = document.getElementById('hdr-export-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'hdr-export-pill';
    pill.style.cssText = 'position:fixed;top:14px;right:20px;z-index:9999;display:flex;align-items:center;gap:8px;padding:9px 20px;border-radius:20px;background:#2563EB;font-size:14px;font-weight:700;color:#fff;box-shadow:0 4px 16px rgba(37,99,235,.35);pointer-events:none;';
    document.body.appendChild(pill);
  }
  pill.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Xuất File Word thành công`;
  pill.style.display = 'flex';
  clearTimeout(pill._t);
  pill._t = setTimeout(() => { pill.style.display = 'none'; }, 2000);
}

/* ══ XÁC NHẬN XÓA ══ */
function openDeleteConfirm() {
  const modal = document.getElementById('modal-delete-confirm');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeDeleteConfirm() {
  const modal = document.getElementById('modal-delete-confirm');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function confirmDeleteAndReset() {
  closeDeleteConfirm();
  goToUpload();
}
