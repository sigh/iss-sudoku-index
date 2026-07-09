// Reusable in-page modal for viewing and copying a puzzle's sandbox script.

import { el } from './util.js';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let singleton = null;

class ScriptModal {
  constructor() {
    this.controller = null;
    this.copyResetTimer = null;
    this.requestId = 0;
    this.lastFocus = null;
    this.copyText = '';
    this.build();
  }

  build() {
    this.titleEl = el('h2', {
      className: 'modal-title',
      attrs: { id: 'script-modal-title' },
    });
    this.closeBtn = el('button', {
      className: 'modal-close',
      text: '✕',
      attrs: { type: 'button', 'aria-label': 'Close', title: 'Close' },
    });
    this.codeEl = el('code', { className: 'language-javascript' });
    this.copyBtn = el('button', {
      className: 'iss-link script copy',
      text: 'Copy',
      attrs: { type: 'button' },
    });
    this.issLink = el('a', {
      className: 'iss-link iss-open',
      text: 'Open in ISS',
      attrs: { target: '_blank', rel: 'noopener noreferrer' },
    });

    const modalHead = el('div', { className: 'modal-head' }, this.titleEl, this.closeBtn);
    const codePanel = el('pre', { className: 'modal-code language-javascript' }, this.codeEl);
    const helpLink = el('a', {
      className: 'modal-hint',
      text: 'ISS Sandbox script',
      attrs: {
        href: 'https://sigh.github.io/Interactive-Sudoku-Solver/help/index.html#javascript-sandbox',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    });
    const modalFoot = el('div', { className: 'modal-foot' },
      helpLink,
      el('div', { className: 'modal-actions' }, this.copyBtn, this.issLink),
    );

    this.modalEl = el('div', {
      className: 'modal',
      attrs: {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'script-modal-title',
        tabindex: '-1',
      },
    }, modalHead, codePanel, modalFoot);
    this.overlay = el('div', { className: 'modal-overlay' }, this.modalEl);
    this.overlay.hidden = true;
    document.body.append(this.overlay);

    this.closeBtn.addEventListener('click', () => this.close());
    this.copyBtn.addEventListener('click', () => this.copy(this.copyText));
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener('keydown', e => this.handleKeydown(e));
  }

  open({ title, fileUrl, buildIssHref }) {
    this.controller?.abort();
    this.controller = new AbortController();
    const thisRequest = ++this.requestId;
    this.lastFocus = document.activeElement;

    this.clearCopyResetTimer();
    this.titleEl.textContent = title || 'Sandbox script';
    this.codeEl.textContent = 'Loading...';
    this.copyBtn.disabled = true;
    this.copyBtn.textContent = 'Copy';
    this.copyText = '';
    this.issLink.removeAttribute('href');
    this.issLink.classList.add('lazy');

    this.overlay.hidden = false;
    document.body.classList.add('modal-open');
    this.closeBtn.focus();

    fetch(fileUrl, { signal: this.controller.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(text => this.showScript(text, buildIssHref, thisRequest))
      .catch(err => {
        if (err.name === 'AbortError' || thisRequest !== this.requestId) return;
        this.codeEl.textContent = 'Failed to load script.';
      });
  }

  showScript(text, buildIssHref, requestId) {
    if (requestId !== this.requestId) return;
    // Prism returns trusted markup for highlighting; otherwise keep the script as text.
    if (window.Prism) {
      this.codeEl.innerHTML = Prism.highlight(text, Prism.languages.javascript, 'javascript');
    } else {
      this.codeEl.textContent = text;
    }
    this.copyBtn.disabled = false;
    this.copyText = text;
    this.issLink.href = buildIssHref(text);
    this.issLink.classList.remove('lazy');
  }

  copy(text) {
    this.clearCopyResetTimer();
    navigator.clipboard.writeText(text)
      .then(() => this.setTemporaryCopyLabel('Copied'))
      .catch(() => this.setTemporaryCopyLabel('Copy failed'));
  }

  setTemporaryCopyLabel(label) {
    this.copyBtn.textContent = label;
    this.copyResetTimer = setTimeout(() => {
      this.copyBtn.textContent = 'Copy';
      this.copyResetTimer = null;
    }, 1500);
  }

  clearCopyResetTimer() {
    if (!this.copyResetTimer) return;
    clearTimeout(this.copyResetTimer);
    this.copyResetTimer = null;
  }

  close() {
    this.controller?.abort();
    this.controller = null;
    this.clearCopyResetTimer();
    this.requestId += 1;
    this.overlay.hidden = true;
    document.body.classList.remove('modal-open');
    if (this.lastFocus && document.contains(this.lastFocus)) this.lastFocus.focus();
  }

  handleKeydown(e) {
    if (this.overlay.hidden) return;
    if (e.key === 'Escape') {
      this.close();
      return;
    }
    if (e.key === 'Tab') this.trapFocus(e);
  }

  trapFocus(e) {
    const focusable = [...this.modalEl.querySelectorAll(FOCUSABLE)]
      .filter(node => node.offsetParent !== null);
    if (!focusable.length) {
      e.preventDefault();
      this.modalEl.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// Open the modal for a script. buildIssHref(text) -> the ?code= URL for that source.
export function openScriptModal(args) {
  if (!singleton) singleton = new ScriptModal();
  singleton.open(args);
}
