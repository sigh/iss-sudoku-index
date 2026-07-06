// A single reusable modal that shows a puzzle's sandbox script in-page, with Copy
// and Open-in-ISS actions. Used for the Script action instead of a link, because a
// large script's ?code= URL exceeds the browser/ISS URL length limit — the modal
// lets you read and copy it regardless, and paste it into the ISS sandbox.

let overlay, titleEl, codeEl, copyBtn, issLink, closeBtn;
let lastFocus = null;

function build() {
  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Sandbox script">
      <div class="modal-head">
        <h2 class="modal-title"></h2>
        <button class="modal-close" type="button" aria-label="Close" title="Close">&#10005;</button>
      </div>
      <pre class="modal-code language-javascript"><code class="language-javascript"></code></pre>
      <div class="modal-foot">
        <a class="modal-hint" target="_blank" rel="noopener noreferrer"
           href="https://sigh.github.io/Interactive-Sudoku-Solver/help/index.html#javascript-sandbox">ISS Sandbox script</a>
        <div class="modal-actions">
          <button class="iss-link script copy" type="button">Copy</button>
          <a class="iss-link iss-open" target="_blank" rel="noopener noreferrer">Open in ISS</a>
        </div>
      </div>
    </div>`;
  document.body.append(overlay);
  titleEl = overlay.querySelector('.modal-title');
  codeEl = overlay.querySelector('.modal-code code');
  copyBtn = overlay.querySelector('.copy');
  issLink = overlay.querySelector('.iss-open');
  closeBtn = overlay.querySelector('.modal-close');

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.hidden && e.key === 'Escape') close();
  });
}

function close() {
  overlay.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastFocus) lastFocus.focus();
}

// Open the modal for a script. buildIssHref(text) -> the ?code= URL for that source.
export function openScriptModal({ title, fileUrl, buildIssHref }) {
  if (!overlay) build();
  lastFocus = document.activeElement;

  titleEl.textContent = title || 'Sandbox script';
  codeEl.textContent = 'Loading…';
  copyBtn.disabled = true;
  copyBtn.textContent = 'Copy';
  copyBtn.onclick = null;
  issLink.removeAttribute('href');
  issLink.classList.add('lazy');

  overlay.hidden = false;
  document.body.classList.add('modal-open');
  closeBtn.focus();

  fetch(fileUrl)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(text => {
      // Highlight with the same Prism build ISS uses; plain text if it's missing.
      if (window.Prism) {
        codeEl.innerHTML = Prism.highlight(text, Prism.languages.javascript, 'javascript');
      } else {
        codeEl.textContent = text;
      }
      copyBtn.disabled = false;
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.textContent = 'Copied';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
        });
      };
      issLink.href = buildIssHref(text);
      issLink.classList.remove('lazy');
    })
    .catch(() => { codeEl.textContent = 'Failed to load script.'; });
}
