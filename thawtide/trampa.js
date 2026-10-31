
(() => {
  const t0 = Date.now(), MIN = 3000;
  const esperando = new WeakSet();
  document.addEventListener('submit', e => {
    const f = e.target;
    const trampa = f && f.querySelector ? f.querySelector('input[name="tt_extra"]') : null;
    if (!trampa) return;
    if (trampa.value !== '') { e.preventDefault(); e.stopImmediatePropagation(); return; }
    const falta = MIN - (Date.now() - t0);
    if (falta > 0) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (esperando.has(f)) return;
      esperando.add(f);
      const quien = e.submitter || null;
      setTimeout(() => {
        esperando.delete(f);
        if (typeof f.requestSubmit === 'function') { try { f.requestSubmit(quien); return; } catch (_) { f.requestSubmit(); return; } }
        if (trampa.value !== '') return;
        trampa.disabled = true; f.submit();
      }, falta + 50);
      return;
    }
    trampa.disabled = true;
  }, true);
  const pon = () => document.querySelectorAll('a[data-correo]').forEach(a => {
    const c = a.dataset.correo.split('').reverse().join('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return;
    a.href = 'mailto:' + c; a.textContent = c; a.removeAttribute('data-correo');
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pon); else pon();
})();
