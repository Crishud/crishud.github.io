/* Páginas de ayuda de la maqueta: carrito y menú (abrir y cerrar, igual que producto.html), la foto de la tarjeta Shop del color recordado y el formulario de contacto (aquí no envía). */
(() => {
  const $ = id => document.getElementById(id);
  const velo = $('velo'); let abierto = null, desde = null;
  const abre = (p, b) => { cierra(); abierto = p; desde = b; p.hidden = false; if (p.id === 'carrito') velo.hidden = false; requestAnimationFrame(() => { p.classList.add('on'); velo.classList.add('on'); }); document.body.classList.add('cajon'); b.setAttribute('aria-expanded', 'true'); p.querySelector('[data-cierra]').focus(); };
  function cierra() { if (!abierto) return; const p = abierto, b = desde; abierto = null; p.classList.remove('on'); velo.classList.remove('on'); document.body.classList.remove('cajon'); b.setAttribute('aria-expanded', 'false'); setTimeout(() => { p.hidden = true; if (!abierto) velo.hidden = true; }, 500); b.focus({preventScroll: true}); }
  $('abreCarrito').addEventListener('click', e => abre($('carrito'), e.currentTarget));
  $('abreMenu').addEventListener('click', e => {
    let c = null; try { c = localStorage.getItem('thawtide-color'); } catch (_) {}
    const mi = document.querySelector('.mt-shop img'); if (mi) mi.src = c === 'blanco' ? 'producto/blanco-delante.webp' : 'producto/negro-delante.webp';   // la foto del menú, del color elegido
    abre($('menu'), e.currentTarget);
  });
  velo.addEventListener('click', cierra);
  document.querySelectorAll('[data-cierra]').forEach(el => el.addEventListener('click', cierra));
  addEventListener('keydown', e => { if (e.key === 'Escape') cierra(); });
  /* contacto: en la maqueta no se envía nada; en la tienda lo envía el formulario de Shopify al correo de la tienda */
  const f = $('fContacto');
  if (f) f.addEventListener('submit', e => {
    e.preventDefault();
    const a = $('fAviso'); a.hidden = false;
    if (!f.checkValidity()) { a.className = 'pg-aviso mal'; a.textContent = 'Please fill in your name, a valid email and your message.'; return; }
    a.className = 'pg-aviso ok'; a.textContent = 'Mockup: nothing is sent here. In the real store, Shopify’s form emails the store and shows “Thanks! We’ll reply within 1–2 business days.”';
  });
})();
