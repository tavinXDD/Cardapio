const phoneNumber = "5518997844443";

const menuItems = [
  {
    name: "Ouro Negro",
    category: "Pão brioche",
    description: "Blend angus 180g, cheddar inglês, cebola brûlée, aioli de alho negro e brioche.",
    price: 46,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&h=700&fit=crop&auto=format",
    tag: "Mais pedido",
  },
  {
    name: "Bourbon Smoke",
    category: "Pão de hambúrguer",
    description: "Costela desfiada por 12h, glaze de bourbon, picles artesanal e coleslaw.",
    price: 52,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900&h=700&fit=crop&auto=format",
    tag: "Edição da casa",
  },
  {
    name: "Trufa & Brie",
    category: "Pão de hambúrguer",
    description: "Angus 160g, brie maçaricado, cogumelos, rúcula e maionese de trufas.",
    price: 58,
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=900&h=700&fit=crop&auto=format",
    tag: "Premium",
  },
  {
    name: "Red Ember",
    category: "Pão de hambúrguer",
    description: "Double smash, cheddar, bacon caramelizado, jalapeño e molho ember picante.",
    price: 49,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=900&h=700&fit=crop&auto=format",
    tag: "Picante",
  },
  {
    name: "Garden Noir",
    category: "Pão de hambúrguer",
    description: "Portobello na brasa, queijo meia cura, tomate confit e pesto de castanhas.",
    price: 44,
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=900&h=700&fit=crop&auto=format",
    tag: "Vegetariano",
  },
  {
    name: "Fritas de Trufa",
    category: "Porções",
    description: "Batatas crocantes, parmesão curado, flor de sal e azeite trufado.",
    price: 29,
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=900&h=700&fit=crop&auto=format",
    tag: "Para compartilhar",
  },
];

const categories = ["Todos", "Baguete", "Pão brioche", "Pão de dog", "Pão de hambúrguer", "Porções", "Bebidas"];
const cart = new Map();
const deliveryFee = 5;
const money = (value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const filterContainer = document.getElementById("filters");
const menuGrid = document.getElementById("menu-grid");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartFooter = document.getElementById("cart-footer");
const cartBackdrop = document.getElementById("cart-backdrop");
const toast = document.getElementById("toast");
let activeCategory = "Todos";
let orderMethod = "delivery";
let toastTimeout;

function renderFilters() {
  filterContainer.innerHTML = categories.map((category) => `
    <button class="filter-button${category === activeCategory ? " active" : ""}"
      type="button" aria-pressed="${category === activeCategory}" data-category="${category}">
      ${category}
    </button>
  `).join("");
}

function renderMenu() {
  const visibleItems = activeCategory === "Todos"
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory);

  menuGrid.innerHTML = visibleItems.map((item) => `
    <article class="menu-card">
      <div class="menu-card-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <span class="tag">${item.tag}</span>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-title">
          <div><small>${item.category}</small><h3>${item.name}</h3></div>
          <strong>${money(item.price)}</strong>
        </div>
        <p>${item.description}</p>
        <button class="add-button" type="button" data-add="${item.name}">
          Adicionar ao pedido <span aria-hidden="true">＋</span>
        </button>
      </div>
    </article>
  `).join("") || `<p class="muted">Nenhum item disponível nesta categoria no momento.</p>`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2400);
}

function renderCart() {
  const quantity = [...cart.values()].reduce((total, entry) => total + entry.quantity, 0);
  const subtotal = [...cart.values()].reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);
  const fee = orderMethod === "delivery" ? deliveryFee : 0;
  const total = subtotal + fee;

  cartCount.textContent = String(quantity);
  cartCount.hidden = quantity === 0;
  document.getElementById("open-cart").setAttribute("aria-label", `Abrir sacola com ${quantity} itens`);

  if (quantity === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Sua sacola ainda está vazia.</p>';
    cartFooter.hidden = true;
    return;
  }

  cartItems.innerHTML = [...cart.values()].map(({ item, quantity: itemQuantity }) => `
    <div class="cart-line">
      <div><h3>${item.name}</h3><p>${money(item.price)} cada</p></div>
      <div class="quantity">
        <button type="button" data-remove="${item.name}" aria-label="Remover uma unidade de ${item.name}">−</button>
        <span>${itemQuantity}</span>
        <button type="button" data-add="${item.name}" aria-label="Adicionar uma unidade de ${item.name}">+</button>
      </div>
    </div>
  `).join("");

  const orderLines = [...cart.values()].map(({ item, quantity: itemQuantity }) =>
    `${itemQuantity}x ${item.name}`,
  ).join("\n");
  const methodLabel = orderMethod === "delivery" ? "Entrega" : "Retirada no local";
  const message = `Olá! Gostaria de fazer este pedido:\n${orderLines}\nModalidade: ${methodLabel}\nSubtotal: ${money(subtotal)}\nTaxa de entrega: ${money(fee)}\nTotal: ${money(total)}`;
  cartFooter.hidden = false;
  cartFooter.innerHTML = `
    <label class="delivery-choice" for="order-method">Como deseja receber?</label>
    <select class="delivery-select" id="order-method">
      <option value="delivery"${orderMethod === "delivery" ? " selected" : ""}>Entrega — taxa de ${money(deliveryFee)}</option>
      <option value="pickup"${orderMethod === "pickup" ? " selected" : ""}>Retirada no local — grátis</option>
    </select>
    <div class="cart-total cart-subtotal"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
    <div class="cart-total cart-delivery-fee"><span>Taxa de entrega</span><strong>${money(fee)}</strong></div>
    <div class="cart-total"><span>Total</span><strong>${money(total)}</strong></div>
    <a class="button button-primary" href="https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}"
      target="_blank" rel="noreferrer">Finalizar pelo WhatsApp <span aria-hidden="true">→</span></a>
  `;
}

cartFooter.addEventListener("change", (event) => {
  if (event.target.id !== "order-method") return;
  orderMethod = event.target.value;
  renderCart();
});

function changeQuantity(name, difference) {
  const item = menuItems.find((entry) => entry.name === name);
  if (!item) return;

  const existing = cart.get(name);
  const nextQuantity = (existing?.quantity ?? 0) + difference;
  if (nextQuantity <= 0) {
    cart.delete(name);
  } else {
    cart.set(name, { item, quantity: nextQuantity });
  }

  renderCart();
  if (difference > 0) showToast(`${name} foi adicionado ao pedido`);
}

filterContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderMenu();
});

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) changeQuantity(addButton.dataset.add, 1);
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) changeQuantity(removeButton.dataset.remove, -1);
});

const menuToggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menu" : "Fechar menu");
  mobileNav.hidden = isExpanded;
});

mobileNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }
});

function closeCart() {
  cartBackdrop.hidden = true;
  document.getElementById("open-cart").focus();
}

document.getElementById("open-cart").addEventListener("click", () => {
  cartBackdrop.hidden = false;
  document.getElementById("close-cart").focus();
});
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("close-cart-backdrop").addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cartBackdrop.hidden) closeCart();
});

document.getElementById("reservation-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const message = [
    "Olá! Gostaria de solicitar uma reserva.",
    `Nome: ${formData.get("name")}`,
    `Telefone: ${formData.get("phone")}`,
    `Data: ${formData.get("date")}`,
    `Pessoas: ${formData.get("guests")}`,
  ].join("\n");
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

renderFilters();
renderMenu();
renderCart();
