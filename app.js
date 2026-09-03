const products = [
  { id: 1, name: 'Pulse Pro Headphones', category: 'Audio', price: 4999, rating: 4.9, badge: 'Bestseller', color: '#f3b166', image: 'assets/headphones.svg', description: 'Immersive wireless sound with soft memory-foam comfort.' },
  { id: 2, name: 'Slate Mechanical Keyboard', category: 'Workspace', price: 3499, rating: 4.7, badge: 'New', color: '#cfd7d1', image: 'assets/keyboard.svg', description: 'Tactile, quiet keys in a compact desk-friendly layout.' },
  { id: 3, name: 'Orbit Smartwatch', category: 'Wearables', price: 5999, rating: 4.8, badge: 'Popular', color: '#c9d9ed', image: 'assets/watch.svg', description: 'Fitness, calls and notifications in one minimal watch.' },
  { id: 4, name: 'Frame Mini Camera', category: 'Creator', price: 7499, rating: 4.6, badge: 'Limited', color: '#e8d1bd', image: 'assets/camera.svg', description: 'Pocket-sized camera for crisp everyday photos and video.' },
  { id: 5, name: 'Arc Wireless Mouse', category: 'Workspace', price: 1499, rating: 4.7, badge: 'Value pick', color: '#d8cee8', image: 'assets/mouse.svg', description: 'Silent clicks, precise tracking and a comfortable profile.' },
  { id: 6, name: 'Beat Mini Speaker', category: 'Audio', price: 2299, rating: 4.8, badge: 'Trending', color: '#bfe0d3', image: 'assets/speaker.svg', description: 'Room-filling sound in a compact water-resistant design.' }
]

const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const state = {
  category: 'All',
  query: '',
  sort: 'featured',
  cart: JSON.parse(localStorage.getItem('shopcart-items') ?? '{}')
}

const productGrid = document.querySelector('#productGrid')
const categoryList = document.querySelector('#categoryList')
const searchInput = document.querySelector('#searchInput')
const sortSelect = document.querySelector('#sortSelect')
const cartDrawer = document.querySelector('#cartDrawer')
const overlay = document.querySelector('#overlay')
const toast = document.querySelector('#toast')

function renderCategories() {
  const categories = ['All', ...new Set(products.map((product) => product.category))]
  categoryList.innerHTML = categories.map((category) => `
    <button class="category-button ${category === state.category ? 'active' : ''}" data-category="${category}">${category}</button>
  `).join('')
}

function visibleProducts() {
  const query = state.query.trim().toLowerCase()
  const filtered = products.filter((product) =>
    (state.category === 'All' || product.category === state.category) &&
    (!query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query))
  )

  return [...filtered].sort((a, b) => {
    if (state.sort === 'low') return a.price - b.price
    if (state.sort === 'high') return b.price - a.price
    if (state.sort === 'rating') return b.rating - a.rating
    return a.id - b.id
  })
}

function renderProducts() {
  const items = visibleProducts()
  document.querySelector('#emptyState').hidden = items.length !== 0
  productGrid.innerHTML = items.map((product) => `
    <article class="product-card">
      <div class="product-visual" style="--visual:${product.color}">
        <span class="product-badge">${product.badge}</span>
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="product-info">
        <div class="product-meta"><span>${product.category}</span><span class="rating">★ ${product.rating}</span></div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-bottom"><span class="price">${money.format(product.price)}</span><button class="add-button" data-add="${product.id}">Add to cart</button></div>
      </div>
    </article>
  `).join('')
}

function saveCart() {
  localStorage.setItem('shopcart-items', JSON.stringify(state.cart))
}

function addToCart(id) {
  state.cart[id] = (state.cart[id] ?? 0) + 1
  saveCart()
  renderCart()
  showToast('Added to your cart')
}

function changeQuantity(id, change) {
  state.cart[id] = (state.cart[id] ?? 0) + change
  if (state.cart[id] <= 0) delete state.cart[id]
  saveCart()
  renderCart()
}

function renderCart() {
  const cartItems = products.filter((product) => state.cart[product.id])
  const quantity = cartItems.reduce((sum, product) => sum + state.cart[product.id], 0)
  const total = cartItems.reduce((sum, product) => sum + product.price * state.cart[product.id], 0)

  document.querySelector('#cartCount').textContent = quantity
  document.querySelector('#cartTotal').textContent = money.format(total)
  document.querySelector('#cartItems').innerHTML = cartItems.length ? cartItems.map((product) => `
    <article class="cart-item">
      <img src="${product.image}" alt="" style="--visual:${product.color}" />
      <div>
        <h3>${product.name}</h3>
        <p>${money.format(product.price)}</p>
        <div class="quantity"><button data-quantity="-1" data-id="${product.id}" aria-label="Reduce quantity">−</button><span>${state.cart[product.id]}</span><button data-quantity="1" data-id="${product.id}" aria-label="Increase quantity">+</button></div>
      </div>
      <button class="remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">×</button>
    </article>
  `).join('') : '<div class="cart-empty"><p>Your cart is waiting for something good.</p></div>'
}

function setCart(open) {
  document.body.classList.toggle('cart-open', open)
  cartDrawer.classList.toggle('open', open)
  overlay.classList.toggle('visible', open)
  cartDrawer.setAttribute('aria-hidden', String(!open))
}

let toastTimer
function showToast(message) {
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200)
}

categoryList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]')
  if (!button) return
  state.category = button.dataset.category
  renderCategories()
  renderProducts()
})

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]')
  if (button) addToCart(Number(button.dataset.add))
})

document.querySelector('#cartItems').addEventListener('click', (event) => {
  const quantityButton = event.target.closest('[data-quantity]')
  const removeButton = event.target.closest('[data-remove]')
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.id), Number(quantityButton.dataset.quantity))
  if (removeButton) changeQuantity(Number(removeButton.dataset.remove), -Infinity)
})

searchInput.addEventListener('input', (event) => { state.query = event.target.value; renderProducts() })
sortSelect.addEventListener('change', (event) => { state.sort = event.target.value; renderProducts() })
document.querySelector('#searchFocus').addEventListener('click', () => { searchInput.focus(); document.querySelector('#products').scrollIntoView() })
document.querySelector('#openCart').addEventListener('click', () => setCart(true))
document.querySelector('#closeCart').addEventListener('click', () => setCart(false))
overlay.addEventListener('click', () => setCart(false))
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setCart(false) })
document.querySelector('#checkoutButton').addEventListener('click', () => showToast('Demo checkout — no payment collected'))
document.querySelector('#newsletterForm').addEventListener('submit', (event) => { event.preventDefault(); event.target.reset(); showToast('Welcome to the ShopCart list!') })
document.querySelector('#year').textContent = new Date().getFullYear()

renderCategories()
renderProducts()
renderCart()

