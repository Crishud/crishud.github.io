// Small, framework-free behaviour for every page.
document.documentElement.classList.add('js');

// Mobile menu
(function () {
  var h = document.getElementById('header'), b = h && h.querySelector('.icon-nav');
  if (!b) return;
  b.addEventListener('click', function () {
    var open = h.classList.toggle('open');
    b.setAttribute('aria-expanded', String(open));
  });
})();


// Home: the left side of the seam is my silhouette made of code; the seam follows the pointer
(function () {
  var face = document.querySelector('.face'), flujo = face && face.querySelector('.code-sil .flujo');
  if (!flujo) return;
  var src = ['lock.check("git push origin main")  // asks first', 'const verdict = await judge.review(task)', 'if (verdict !== "pass") return retry(task)', 'booking.hold(slot, { minutes: 15 })', 'lessons.add({ cause, rule })', 'plan.approve({ by: "cristian" })', 'archive.move(file)  // nothing gets deleted', 'client.portal.show(steps)'];
  var txt = ''; for (var r = 0; r < 70; r++) { var l = src[r % src.length]; txt += (l + '   ' + l + '   ' + l).slice((r * 7) % 23) + '\n'; }
  flujo.textContent = txt + txt; // twice, so the slow scroll loops without a jump
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var target = 50, x = 50, raf = 0;
  function paint() {
    x += (target - x) * 0.12;
    face.style.setProperty('--x', x.toFixed(2) + '%');
    face.dataset.lado = x > 56 ? 'ops' : x < 44 ? 'auto' : '';
    raf = Math.abs(target - x) > 0.05 ? requestAnimationFrame(paint) : 0;
  }
  function go(t) { target = Math.max(8, Math.min(92, t)); if (reduce) x = target; if (!raf) raf = requestAnimationFrame(paint); }
  face.addEventListener('pointermove', function (e) { var r = face.getBoundingClientRect(); go(100 - (e.clientX - r.left) / r.width * 100); });
  face.addEventListener('pointerleave', function () { go(50); });
  if (!reduce) { x = 8; face.style.setProperty('--x', '8%'); setTimeout(function () { go(50); }, 350); }
})();

// Home: on the <automation> side, a few lines of code type themselves out, then start over
(function () {
  var box = document.querySelector('.face .code code');
  if (!box) return;
  var lines = [["c","// before any agent acts"],["br"],["","lock.check("],["s","\"git push\""],["",")  "],["c","// asks"],["br"],["k","const "],["","v = "],["k","await "],["","judge.review(task)"],["br"],["k","if "],["","(v !== "],["s","\"pass\""],["",") retry(task)"],["br"],["","booking.hold(slot, "],["s","15"],["",")"],["br"],["","lessons.add({ cause, rule })"],["br"]];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function render(upto) {
    var html = '', n = upto;
    for (var i = 0; i < lines.length && n > 0; i++) {
      var cls = lines[i][0], txt = lines[i][1];
      if (cls === 'br') { html += '\n'; n--; continue; }
      var part = txt.slice(0, n); n -= part.length;
      html += cls ? '<span class="' + cls + '">' + esc(part) + '</span>' : esc(part);
    }
    box.innerHTML = html;
  }
  var total = lines.reduce(function (s, l) { return s + (l[0] === 'br' ? 1 : l[1].length); }, 0);
  if (reduce) { render(total); return; }
  var k = 0;
  (function tick() {
    k++; render(k);
    if (k < total) setTimeout(tick, 28 + Math.random() * 60);
    else setTimeout(function () { k = 0; tick(); }, 4200);
  })();
})();

// Blocks rise in as they enter the screen
(function () {
  var els = document.querySelectorAll('.rise, h1.draw');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0 });
  els.forEach(function (e) { io.observe(e); });
  // never leave anything hidden: reveal everything shortly after load whatever the observer did
  setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 3000);
})();

// Case studies: fit the 1280×800 desktop demo into its frame
(function () {
  function fit() {
    document.querySelectorAll('.pc .vp').forEach(function (vp) {
      var f = vp.querySelector('iframe');
      if (f) f.style.transform = 'scale(' + vp.clientWidth / 1280 + ')';
    });
  }
  fit();
  window.addEventListener('resize', fit);
})();

// Contact form: not connected to an inbox yet
(function () {
  var f = document.querySelector('form.form');
  if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = f.querySelector('.note');
    if (n) n.innerHTML = '<span class="pending">pending</span> Not sent: this form isn’t connected to my inbox yet.';
  });
})();
