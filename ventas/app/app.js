// Shared shell: demo banner, sidebar, data loading and small helpers.
const ICONOS = {
  buscar: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  tablero: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/></svg>',
  llamada: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  perfil: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  codigo: '<svg viewBox="0 0 24 24"><path d="m8 7-5 5 5 5M16 7l5 5-5 5"/></svg>',
  correo: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  dolar: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 9a3 3 0 0 0-3-1.5c-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2A3 3 0 0 1 9 15M12 6v1.5M12 16.5V18"/></svg>',
  estado: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>',
};

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const icono = (n) => ICONOS[n] || '';
export const fecha = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const avatar = (nombre) => `<span class="av" aria-hidden="true">${esc(String(nombre || '?').trim().charAt(0).toUpperCase())}</span>`;
export const dinero = (v) => (v ? (v.max && v.max !== v.min ? `$${v.min.toLocaleString('en-US')}–$${v.max.toLocaleString('en-US')}/mo` : `$${v.min.toLocaleString('en-US')}/mo`) : '');
export const ETAPAS = ['Researched', 'Email drafted', 'Call held', 'Proposal', 'Won', 'Lost'];
export const claseEtapa = (e) => `e-${Math.max(0, ETAPAS.indexOf(e))}`;
export const CUMPLE = { si: 'Yes', en_parte: 'Partly', no: 'No', sin_dato: 'No data' };

export async function datos(nombre) {
  const r = await fetch(`../data/${nombre}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`No se pudo cargar ${nombre}`);
  return r.json();
}

// Draws the banner and sidebar around the page's <main>.
export function marco(actual) {
  const aviso = document.createElement('div');
  aviso.className = 'demo-aviso';
  aviso.innerHTML = '<b>Demo by Avasory.</b> Real runs on public store websites. Emails are drafts and are never sent.';
  const lateral = document.createElement('nav');
  lateral.className = 'lateral';
  lateral.setAttribute('aria-label', 'Sections');
  const enlace = (href, nombre, ic) => `<a href="${href}"${actual === href ? ' aria-current="page"' : ''}>${icono(ic)}${nombre}</a>`;
  lateral.innerHTML = `<div class="marca"><i>A</i><span>Sales desk</span></div>
    ${enlace('index.html', 'Prospects', 'buscar')}${enlace('pipeline.html', 'Pipeline', 'tablero')}${enlace('llamada.html', 'Calls', 'llamada')}
    <h6>About this demo</h6>${enlace('perfil.html', 'Ideal customer', 'perfil')}`;
  const app = document.createElement('div');
  app.className = 'app';
  const main = document.querySelector('main');
  main.before(app);
  app.append(lateral, main);
  app.before(aviso);
}

export function error(e) {
  document.querySelector('.cuerpo').innerHTML = `<p class="gris">${esc(e.message)}</p>`;
}
