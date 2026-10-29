// Catálogo de productos — edita aquí nombres, precios y descripciones.
const PRODUCTS = [
  { id: 'logo-basico', cat: 'branding', name: 'Diseño de logotipo', desc: '3 propuestas, 2 rondas de revisiones y archivos en todos los formatos.', price: 180, oldPrice: 220, badge: 'Más vendido', art: 'Logo', color: '#ff5a36' },
  { id: 'identidad', cat: 'branding', name: 'Identidad de marca completa', desc: 'Logo, paleta, tipografías, papelería y manual de marca en PDF.', price: 490, art: 'Brand', color: '#3d5afe' },
  { id: 'pack-instagram', cat: 'redes', name: 'Pack Instagram · 30 posts', desc: 'Plantillas editables en Canva con tu identidad visual.', price: 65, badge: 'Nuevo', art: 'IG', color: '#e1306c' },
  { id: 'stories', cat: 'redes', name: 'Pack Stories · 20 diseños', desc: 'Stories animadas y estáticas para promociones y novedades.', price: 45, art: 'Story', color: '#8e44ad' },
  { id: 'cv', cat: 'plantillas', name: 'Plantilla de CV creativo', desc: 'Diseño minimalista editable en Word, Canva y Figma.', price: 15, art: 'CV', color: '#19a974' },
  { id: 'presentacion', cat: 'plantillas', name: 'Plantilla de presentación', desc: '40 diapositivas para Keynote, PowerPoint y Google Slides.', price: 29, art: 'Slides', color: '#161616' },
  { id: 'tarjetas', cat: 'print', name: 'Tarjetas de visita', desc: 'Diseño a doble cara listo para imprenta (CMYK + sangrado).', price: 40, art: 'Card', color: '#ffc83d', ink: '#161616' },
  { id: 'poster', cat: 'print', name: 'Póster personalizado', desc: 'Ilustración o póster tipográfico en A3, A2 o A1.', price: 85, oldPrice: 100, art: 'A3', color: '#0f2a44' },
];

const fmt = n => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const $ = sel => document.querySelector(sel);

// ---------- Tienda ----------
function renderProducts(cat = 'todos') {
  const list = cat === 'todos' ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat);
  $('#products').innerHTML = list.map(p => `
    <article class="product">
      <div class="product-art" style="background:${p.color};color:${p.ink || '#fff'}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        ${p.art}
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-foot">
          <span class="price">${fmt(p.price)}${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ''}</span>
          <button class="add-btn" data-id="${p.id}">Añadir</button>
        </div>
      </div>
    </article>`).join('');
}

$('#filters').addEventListener('click', e => {
  const btn = e.target.closest('.filter');
  if (!btn) return;
  document.querySelectorAll('.filter').forEach(f => f.classList.toggle('active', f === btn));
  renderProducts(btn.dataset.cat);
});

$('#products').addEventListener('click', e => {
  const btn = e.target.closest('.add-btn');
  if (btn) addToCart(btn.dataset.id);
});

// ---------- Carrito ----------
let cart = {};
try { cart = JSON.parse(localStorage.getItem('angeles-cart')) || {}; } catch { cart = {}; }

function saveCart() {
  try { localStorage.setItem('angeles-cart', JSON.stringify(cart)); } catch { /* sin almacenamiento */ }
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  toast(`“${PRODUCTS.find(p => p.id === id).name}” añadido al carrito`);
}

function changeQty(id, delta) {
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart).filter(([id]) => PRODUCTS.some(p => p.id === id));
  const count = entries.reduce((a, [, q]) => a + q, 0);
  const total = entries.reduce((a, [id, q]) => a + PRODUCTS.find(p => p.id === id).price * q, 0);

  $('#cartCount').textContent = count;
  $('#cartTotal').textContent = fmt(total);
  $('#cartItems').innerHTML = entries.length ? entries.map(([id, q]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return `
      <div class="cart-item">
        <div class="cart-thumb" style="background:${p.color}"></div>
        <div>
          <h4>${p.name}</h4>
          <div class="qty">
            <button data-id="${id}" data-d="-1" aria-label="Quitar uno">−</button>
            ${q}
            <button data-id="${id}" data-d="1" aria-label="Añadir uno">+</button>
            <button class="remove" data-id="${id}" data-d="${-q}">Eliminar</button>
          </div>
        </div>
        <b>${fmt(p.price * q)}</b>
      </div>`;
  }).join('') : '<p class="cart-empty">Tu carrito está vacío.</p>';
}

$('#cartItems').addEventListener('click', e => {
  const btn = e.target.closest('button[data-id]');
  if (btn) changeQty(btn.dataset.id, Number(btn.dataset.d));
});

function toggleCart(open) {
  $('#cart').classList.toggle('open', open);
  $('#overlay').classList.toggle('open', open);
}
$('#openCart').addEventListener('click', () => toggleCart(true));
$('#closeCart').addEventListener('click', () => toggleCart(false));
$('#overlay').addEventListener('click', () => toggleCart(false));

$('#checkout').addEventListener('click', () => {
  if (!Object.keys(cart).length) return toast('Añade algún producto primero');
  cart = {};
  saveCart();
  renderCart();
  toggleCart(false);
  toast('¡Gracias por tu pedido! Te escribiré por email con los siguientes pasos.');
});

// ---------- Varios ----------
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

$('#menuBtn').addEventListener('click', () => $('#nav').classList.toggle('open'));
$('#nav').addEventListener('click', e => { if (e.target.tagName === 'A') $('#nav').classList.remove('open'); });

$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  $('#formMsg').textContent = '¡Mensaje enviado! Te responderé en menos de 48 h.';
  e.target.reset();
});

$('#year').textContent = new Date().getFullYear();

renderProducts();
renderCart();
