/* ═══════════════════════════════════════
   upload.js — Xử lý upload file
═══════════════════════════════════════ */

let uploadedFiles = [];
let progressInterval = null;

// Kéo thả file
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.remove('drag-over');
  if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
}

// Nhận file và chuyển sang màn Extract
async function handleFiles(files) {
  const fileArr = Array.from(files);
  uploadedFiles = [];

  for (const file of fileArr) {
    if (file.type === 'application/pdf') {
      // Tách từng trang PDF thành blob riêng
      const pages = await splitPdfPages(file);
      uploadedFiles.push(...pages);
    } else {
      uploadedFiles.push(file);
    }
  }

  buildThumbs(uploadedFiles);
  updatePageCount(uploadedFiles.length);
  // Render ảnh thật vào tab Văn bản gốc
  if (typeof renderVanBanGoc === 'function') renderVanBanGoc(uploadedFiles);
  document.getElementById('result-idle').style.display = 'flex';
  document.getElementById('result-processing').style.display = 'none';
  document.getElementById('result-content').classList.remove('show');
  document.getElementById('result-actions').style.display = 'none';
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-pct').textContent = '0%';
  showPage('page-extract');
}

// Tách PDF thành từng trang — mỗi trang là 1 object {file, pdfPage}
async function splitPdfPages(file) {
  if (typeof pdfjsLib === 'undefined') return [file];
  const url = URL.createObjectURL(file);
  const pages = [];
  try {
    const pdf = await pdfjsLib.getDocument(url).promise;
    for (let p = 1; p <= pdf.numPages; p++) {
      // Tạo object giả có đủ thông tin để render thumbnail
      pages.push({ _isPdfPage: true, _pdfFile: file, _pageNum: p, type: 'application/pdf', name: `${file.name}_p${p}` });
    }
  } catch(e) {
    pages.push(file);
  }
  URL.revokeObjectURL(url);
  return pages;
}

// Thêm trang
async function addPages(files) {
  const fileArr = Array.from(files);
  for (const file of fileArr) {
    if (file.type === 'application/pdf') {
      const pages = await splitPdfPages(file);
      uploadedFiles.push(...pages);
    } else {
      uploadedFiles.push(file);
    }
  }
  buildThumbs(uploadedFiles);
  updatePageCount(uploadedFiles.length);
  if (typeof renderVanBanGoc === 'function') renderVanBanGoc(uploadedFiles);
  document.getElementById('file-input-add').value = '';
}

// Xoá trang
function removePage(e, idx) {
  e.stopPropagation();
  uploadedFiles.splice(idx, 1);
  if (uploadedFiles.length === 0) { goToUpload(); return; }
  buildThumbs(uploadedFiles);
  updatePageCount(uploadedFiles.length);
  if (typeof renderVanBanGoc === 'function') renderVanBanGoc(uploadedFiles);
}

// Cập nhật số trang trên nút Trích xuất
function updatePageCount(n) {
  const lbl = document.querySelector('.extract-label');
  if (lbl) lbl.innerHTML = `Trích xuất (<span id="page-count">${n}</span> trang)`;
}

// Quay lại trang Upload
function goToUpload() {
  uploadedFiles = [];
  document.getElementById('file-input').value = '';
  clearInterval(progressInterval);
  document.getElementById('progress-wrap').classList.remove('show');
  document.getElementById('progress-fill').style.width = '0%';
  document.getElementById('progress-pct').textContent = '0%';
  document.getElementById('doc-tabs').classList.remove('show');
  document.querySelectorAll('.tab-panel-doc').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-vanbangoc').classList.add('active');
  document.getElementById('result-idle').style.display = 'flex';
  document.getElementById('result-processing').style.display = 'none';
  document.getElementById('result-content').classList.remove('show');
  document.getElementById('result-actions').style.display = 'none';
  document.getElementById('btn-luu-nhap').style.display = 'none';
  document.getElementById('chat-fab').style.display = 'none';
  const btnExport = document.getElementById('btn-export-word');
  if (btnExport) btnExport.disabled = true;
  closeChat();
  showPage('page-upload');
}

// Build thumbnail sidebar với drag-to-reorder
function buildThumbs(files) {
  const list = document.getElementById('thumb-list');
  list.innerHTML = '';
  files.forEach((file, i) => {
    const item = document.createElement('div');
    item.className = 'thumb-item' + (i === 0 ? ' active' : '');
    item.dataset.index = i;
    item.onclick = () => {
      document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
      item.classList.add('active');
    };

    // Tạo container preview
    const previewWrap = document.createElement('div');
    previewWrap.className = 'thumb-preview-wrap';

    // Icon hamburger góc trên trái — handle kéo thả
    const menuIcon = document.createElement('div');
    menuIcon.className = 'thumb-menu-icon';
    menuIcon.title = 'Kéo để sắp xếp';
    menuIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;

    // Chỉ handle kéo được từ icon hamburger
    menuIcon.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      startDrag(e, item, list);
    });
    menuIcon.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      startDragTouch(e, item, list);
    }, { passive: true });

    previewWrap.appendChild(menuIcon);

    const canvas = document.createElement('canvas');
    canvas.className = 'thumb-canvas';
    previewWrap.appendChild(canvas);
    item.appendChild(previewWrap);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'thumb-footer-row';
    footer.innerHTML = `
      <span class="thumb-name">Trang ${i + 1}</span>
      <span class="thumb-del" onclick="removePage(event,${i})">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </span>`;
    item.appendChild(footer);
    list.appendChild(item);

    // Render preview
    if (file._isPdfPage) {
      renderPdfPageThumb(file._pdfFile, file._pageNum, canvas);
    } else if (file.type && file.type.startsWith('image/')) {
      renderImageThumb(file, canvas);
    } else if (file.type === 'application/pdf') {
      renderPdfThumb(file, canvas);
    } else {
      renderFallbackThumb(canvas);
    }
  });
}

// ── Drag & Drop sắp xếp trang ──
let dragEl = null, dragGhost = null, dragStartY = 0, dragOffsetY = 0;

function startDrag(e, item, list) {
  dragEl = item;
  dragStartY = e.clientY;
  const rect = item.getBoundingClientRect();
  dragOffsetY = e.clientY - rect.top;

  // Tạo ghost
  dragGhost = item.cloneNode(true);
  dragGhost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;opacity:.75;pointer-events:none;z-index:9999;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.25);transform:rotate(1.5deg);transition:none;`;
  document.body.appendChild(dragGhost);

  item.style.opacity = '0.3';
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e) {
  if (!dragGhost) return;
  const rect = dragEl.parentElement.getBoundingClientRect();
  dragGhost.style.top = (e.clientY - dragOffsetY) + 'px';

  // Tìm phần tử đích
  const items = [...dragEl.parentElement.querySelectorAll('.thumb-item:not([style*="opacity: 0.3"])')];
  const target = items.find(it => {
    const r = it.getBoundingClientRect();
    return e.clientY >= r.top && e.clientY <= r.bottom;
  });
  if (target && target !== dragEl) {
    const targetRect = target.getBoundingClientRect();
    const mid = targetRect.top + targetRect.height / 2;
    if (e.clientY < mid) {
      target.parentElement.insertBefore(dragEl, target);
    } else {
      target.parentElement.insertBefore(dragEl, target.nextSibling);
    }
  }
}

function onDragEnd() {
  if (!dragEl) return;
  dragEl.style.opacity = '';
  if (dragGhost) { dragGhost.remove(); dragGhost = null; }
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);

  // Cập nhật lại mảng uploadedFiles theo thứ tự DOM mới
  const list = document.getElementById('thumb-list');
  const newOrder = [...list.querySelectorAll('.thumb-item')].map(el => uploadedFiles[+el.dataset.index]);
  uploadedFiles = newOrder;
  buildThumbs(uploadedFiles);
  dragEl = null;
}

// Touch version
function startDragTouch(e, item, list) {
  const touch = e.touches[0];
  const fakeE = { clientY: touch.clientY };
  dragEl = item;
  const rect = item.getBoundingClientRect();
  dragOffsetY = touch.clientY - rect.top;

  dragGhost = item.cloneNode(true);
  dragGhost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;opacity:.75;pointer-events:none;z-index:9999;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.25);transform:rotate(1.5deg);`;
  document.body.appendChild(dragGhost);
  item.style.opacity = '0.3';

  const onMove = (ev) => {
    const t = ev.touches[0];
    dragGhost.style.top = (t.clientY - dragOffsetY) + 'px';
    const items = [...item.parentElement.querySelectorAll('.thumb-item:not([style*="opacity: 0.3"])')];
    const target = items.find(it => {
      const r = it.getBoundingClientRect();
      return t.clientY >= r.top && t.clientY <= r.bottom;
    });
    if (target && target !== item) {
      const mid = target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2;
      t.clientY < mid ? target.parentElement.insertBefore(item, target) : target.parentElement.insertBefore(item, target.nextSibling);
    }
  };
  const onEnd = () => {
    item.style.opacity = '';
    if (dragGhost) { dragGhost.remove(); dragGhost = null; }
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
    const newOrder = [...item.parentElement.querySelectorAll('.thumb-item')].map(el => uploadedFiles[+el.dataset.index]);
    uploadedFiles = newOrder;
    buildThumbs(uploadedFiles);
    dragEl = null;
  };
  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('touchend', onEnd);
}

function renderImageThumb(file, canvas) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const ratio = img.width / img.height;
    canvas.width  = 300;
    canvas.height = Math.round(300 / ratio);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

function renderPdfThumb(file, canvas) {
  renderPdfPageThumb(file, 1, canvas);
}

function renderPdfPageThumb(file, pageNum, canvas) {
  if (typeof pdfjsLib === 'undefined') { renderFallbackThumb(canvas); return; }
  const url = URL.createObjectURL(file);
  pdfjsLib.getDocument(url).promise.then(pdf => {
    return pdf.getPage(pageNum);
  }).then(page => {
    const viewport = page.getViewport({ scale: 0.45 });
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    return page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  }).catch(() => renderFallbackThumb(canvas))
    .finally(() => URL.revokeObjectURL(url));
}

function renderFallbackThumb(canvas) {
  canvas.width  = 80;
  canvas.height = 107;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Vẽ icon file
  ctx.strokeStyle = '#E65134';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(18, 14, 44, 60, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(48, 14); ctx.lineTo(62, 28); ctx.lineTo(48, 28);
  ctx.closePath();
  ctx.stroke();
}
