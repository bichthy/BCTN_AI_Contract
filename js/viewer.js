/* ═══════════════════════════════════════
   viewer.js — Zoom & Tìm kiếm trong văn bản
═══════════════════════════════════════ */

let currentZoom = 100;

function changeZoom(delta) {
  currentZoom = Math.min(200, Math.max(50, currentZoom + delta));
  document.getElementById('zoom-val').textContent = currentZoom + '%';
  const pages = document.querySelectorAll('.doc-page, .toanvan-content');
  pages.forEach(p => {
    p.style.transform = `scale(${currentZoom / 100})`;
    p.style.transformOrigin = 'top center';
  });
}

function resetZoom() {
  currentZoom = 100;
  document.getElementById('zoom-val').textContent = '100%';
  document.querySelectorAll('.doc-page, .toanvan-content').forEach(p => {
    p.style.transform = '';
    p.style.transformOrigin = '';
  });
}

function doSearch(val) {
  // Xoá highlight cũ
  document.querySelectorAll('.search-hl').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
  if (!val.trim()) return;
  document.querySelectorAll('.toanvan-content, .doc-page').forEach(panel => {
    highlight(panel, val.trim());
  });
}

function highlight(node, term) {
  if (node.nodeType === 3) {
    const idx = node.nodeValue.toLowerCase().indexOf(term.toLowerCase());
    if (idx < 0) return;
    const span = document.createElement('mark');
    span.className = 'search-hl';
    span.style.cssText = 'background:#FFE066;color:#111;border-radius:2px;';
    const before = document.createTextNode(node.nodeValue.slice(0, idx));
    span.textContent = node.nodeValue.slice(idx, idx + term.length);
    const after  = document.createTextNode(node.nodeValue.slice(idx + term.length));
    const parent = node.parentNode;
    parent.insertBefore(before, node);
    parent.insertBefore(span, node);
    parent.insertBefore(after, node);
    parent.removeChild(node);
  } else if (node.nodeType === 1 && !['SCRIPT','STYLE','MARK'].includes(node.tagName)) {
    Array.from(node.childNodes).forEach(child => highlight(child, term));
  }
}

/* ═══════════════════════════════════════
   Render ảnh thật vào tab Văn bản gốc
═══════════════════════════════════════ */
async function renderVanBanGoc(files) {
  const container = document.getElementById('vanbangoc-pages');
  const empty     = document.getElementById('vanbangoc-empty');
  if (!container) return;

  container.innerHTML = '';

  if (!files || files.length === 0) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Wrapper từng trang — giống doc-page style
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      background:#fff;
      border-radius:10px;
      box-shadow:0 2px 16px rgba(0,0,0,.12);
      padding:0;
      overflow:hidden;
      width:100%;
      max-width:680px;
      position:relative;
    `;

    // Label số trang
    const lbl = document.createElement('div');
    lbl.style.cssText = `
      position:absolute;top:10px;left:10px;
      background:rgba(0,0,0,.5);color:#fff;
      font-size:11px;font-weight:600;
      padding:3px 8px;border-radius:20px;
      z-index:2;pointer-events:none;
    `;
    lbl.textContent = `Trang ${i + 1}`;
    wrap.appendChild(lbl);

    if (file._isPdfPage) {
      // Render trang PDF cụ thể
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;display:block;';
      wrap.appendChild(canvas);
      container.appendChild(wrap);
      await renderPdfPageFull(file._pdfFile, file._pageNum, canvas);
    } else if (file.type && file.type.startsWith('image/')) {
      // Hiển thị ảnh trực tiếp
      const img = document.createElement('img');
      img.style.cssText = 'width:100%;display:block;';
      img.src = URL.createObjectURL(file);
      wrap.appendChild(img);
      container.appendChild(wrap);
    } else if (file.type === 'application/pdf') {
      // PDF chưa split — render trang 1
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'width:100%;display:block;';
      wrap.appendChild(canvas);
      container.appendChild(wrap);
      await renderPdfPageFull(file, 1, canvas);
    } else {
      // Fallback
      const fb = document.createElement('div');
      fb.style.cssText = 'height:200px;display:flex;align-items:center;justify-content:center;color:#9CA3AF;font-size:13px;';
      fb.textContent = 'Không thể hiển thị trang này';
      wrap.appendChild(fb);
      container.appendChild(wrap);
    }
  }
}

async function renderPdfPageFull(file, pageNum, canvas) {
  if (typeof pdfjsLib === 'undefined') return;
  const url = URL.createObjectURL(file);
  try {
    const pdf      = await pdfjsLib.getDocument(url).promise;
    const page     = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.6 });
    canvas.width   = viewport.width;
    canvas.height  = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  } catch(e) {
    console.warn('renderPdfPageFull error:', e);
  } finally {
    URL.revokeObjectURL(url);
  }
}
