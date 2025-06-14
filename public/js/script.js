'use strict';

/**
 * Product Filtering
 */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.textContent.toLowerCase(); 
    const products = document.querySelectorAll('.product-item');

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    products.forEach(item => {
      const itemCat = item.getAttribute('data-category');
      if (category === 'all' || itemCat === category) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
});

/**
 * Navbar Toggle
 */
const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");

const navElems = [overlay, navOpenBtn, navCloseBtn];

for (let i = 0; i < navElems.length; i++) {
  navElems[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
  });
}

/**
 * Header & Go Top Button Active on Scroll
 */
const header = document.querySelector("[data-header]");
const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 80) {
    header.classList.add("active");
    goTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    goTopBtn.classList.remove("active");
  }
});

/**
 * Add to Cart
 */
function getProductData(el) {
  const item = el.closest('.product-item');
  if (!item) return null;
  
  return {
    id: item.dataset.id,
    name: item.dataset.name,
    price: parseFloat(item.dataset.price),
    brand: item.dataset.brand,
    image: item.querySelector('.image-contain').src,
    quantity: 1,
    size: null
  };
}

function updateLocalStorage(key, newItem) {
  try {
    let existingItems = JSON.parse(localStorage.getItem(key)) || [];
    
    // Check if item with same ID and size already exists
    const existingItemIndex = existingItems.findIndex(item => 
      item.id === newItem.id && item.size === newItem.size
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      existingItems[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      existingItems.push(newItem);
    }

    // Save to localStorage
    localStorage.setItem(key, JSON.stringify(existingItems));
    
    // Update display
    updateCartDisplay();
    
    // Log for debugging
    console.log('Updated cart:', existingItems);
  } catch (error) {
    console.error('Error updating localStorage:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('sizeModal');
  const closeModal = document.getElementById('closeModal');
  const modalImg = document.getElementById('modalImg');
  const modalName = document.getElementById('modalName');
  const confirmBtn = document.getElementById('confirmAdd');
  const sizeButtons = document.querySelectorAll('.size-btn');

  let selectedProduct = null;
  let selectedSize = null;

  // Add to Cart with size selection
  document.querySelectorAll('[data-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedProduct = getProductData(btn);
      if (!selectedProduct) {
        console.error('Could not get product data');
        return;
      }
      
      modalImg.src = selectedProduct.image;
      modalName.textContent = selectedProduct.name;
      selectedSize = null;
      
      // Reset size selection
      sizeButtons.forEach(btn => btn.classList.remove('active'));
      
      // Show modal
      modal.classList.remove('hidden');
    });
  });

  // Size selection
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.textContent;
    });
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Click outside modal to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // Confirm add to cart
  confirmBtn.addEventListener('click', () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (!selectedProduct) {
      alert('Error: Product data not found');
      return;
    }

    selectedProduct.size = selectedSize;
    updateLocalStorage('cart', selectedProduct);
    
    alert(`${selectedProduct.name} (Size: ${selectedSize}) added to cart!`);
    modal.classList.add('hidden');
  });

  // Initialize cart display
  updateCartDisplay();

  // Check authentication state
  checkAuthState();

  // Clear cart functionality
  const clearCartBtn = document.getElementById('clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.setItem('cart', JSON.stringify([]));
        updateCartDisplay();
      }
    });
  }
});

function updateCartDisplay() {
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyCartMessage = document.querySelector('.empty-cart');
  const cartTable = document.querySelector('.cart-table tbody');
  
  if (cartItems.length === 0) {
    if (emptyCartMessage) emptyCartMessage.style.display = 'block';
    if (cartTable) cartTable.style.display = 'none';
    return;
  }

  if (emptyCartMessage) emptyCartMessage.style.display = 'none';
  if (cartTable) cartTable.style.display = 'table-row-group';

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  // Update cart table
  if (cartTable) {
    cartTable.innerHTML = cartItems.map(item => `
      <tr>
        <td>
          <div class="cart-item-info">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div>
              <h4>${item.name}</h4>
              <p class="item-size">Size: ${item.size}</p>
            </div>
          </div>
        </td>
        <td>$${item.price.toFixed(2)}</td>
        <td>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
        </td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
        <td>
          <div class="cart-item-actions">
            <button class="btn-remove" data-id="${item.id}">
              <ion-icon name="trash-outline"></ion-icon>
            </button>
            <button class="btn-wishlist" data-id="${item.id}">
              <ion-icon name="heart-outline"></ion-icon>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Add event listeners for quantity inputs
    cartTable.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const newQuantity = parseInt(e.target.value);
        updateItemQuantity(id, newQuantity);
      });
    });

    // Add event listeners for remove buttons
    cartTable.querySelectorAll('.btn-remove').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.closest('.btn-remove').dataset.id;
        removeFromCart(id);
      });
    });
  }

  // Update summary
  const summarySubtotal = document.querySelector('.summary-item.subtotal .amount');
  const summaryShipping = document.querySelector('.summary-item.shipping .amount');
  const summaryTotal = document.querySelector('.summary-item.total .amount');

  if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (summaryShipping) summaryShipping.textContent = `$${shipping.toFixed(2)}`;
  if (summaryTotal) summaryTotal.textContent = `$${total.toFixed(2)}`;
}

function updateItemQuantity(id, quantity) {
  try {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const itemIndex = cartItems.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
      cartItems[itemIndex].quantity = quantity;
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      updateCartDisplay();
    }
  } catch (error) {
    console.error('Error updating item quantity:', error);
  }
}

function removeFromCart(id) {
  try {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const updatedItems = cartItems.filter(item => item.id !== id);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    updateCartDisplay();
  } catch (error) {
    console.error('Error removing item from cart:', error);
  }
}

// Authentication functions
function checkAuthState() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const authLink = document.getElementById('authLink');
  
  if (currentUser) {
    if (currentUser.isAdmin) {
      authLink.innerHTML = `
        <a href="/admin/dashboard" class="nav-action-btn">
          <ion-icon name="person-outline"></ion-icon>
          <span class="nav-action-text">Admin Dashboard</span>
        </a>
      `;
    } else {
      authLink.innerHTML = `
        <a href="#" class="nav-action-btn" id="logoutBtn">
          <ion-icon name="person-outline"></ion-icon>
          <span class="nav-action-text">${currentUser.name}</span>
        </a>
      `;
      document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    }
  } else {
    authLink.innerHTML = `
      <a href="login.html" class="nav-action-btn">
        <ion-icon name="person-outline"></ion-icon>
        <span class="nav-action-text">Login / Register</span>
      </a>
    `;
  }
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Initialize admin user if not exists
function initializeAdminUser() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const adminExists = users.some(user => user.isAdmin);
  
  if (!adminExists) {
    users.push({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // In a real app, this should be hashed
      isAdmin: true,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(users));
  }
}

// Call these functions when the page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeAdminUser();
  checkAuthState();
  // ... rest of your existing initialization code ...
});



const toggleNavbar = function () {
    header.classList.toggle("active");
    overlay.classList.toggle("active");
}

navOpenBtn.addEventListener("click", toggleNavbar);
navCloseBtn.addEventListener("click", toggleNavbar);
overlay.addEventListener("click", toggleNavbar);

// Add active class to current page link
const currentPage = window.location.pathname;
const navLinks = document.querySelectorAll('.navbar-link');
navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// Size Modal functionality
const sizeModal = document.getElementById('sizeModal');
const closeModal = document.getElementById('closeModal');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const confirmAdd = document.getElementById('confirmAdd');
let selectedProduct = null;
let selectedSize = null;

// Close modal when clicking the close button or outside the modal
closeModal.addEventListener('click', () => {
    sizeModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === sizeModal) {
        sizeModal.classList.add('hidden');
    }
});

// Size selection
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedSize = this.textContent;
        console.log('Size selected:', selectedSize);
    });
});

// Add to cart functionality
document.querySelectorAll('[data-cart]').forEach(button => {
    button.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('Add to cart button clicked');
        
        const productItem = this.closest('.product-item');
        if (!productItem) {
            console.error('Product item not found');
            return;
        }

        const productId = productItem.dataset.id;
        const name = productItem.dataset.name;
        const price = productItem.dataset.price;
        const image = productItem.querySelector('.image-contain')?.src;

        if (!productId || !name || !price) {
            console.error('Missing product data:', { productId, name, price });
            return;
        }

        selectedProduct = {
            id: productId,
            name: name,
            price: parseFloat(price),
            image: image
        };
        console.log('Selected product:', selectedProduct);

        // Show size selection modal
        if (modalImg && modalName) {
            modalImg.src = selectedProduct.image;
            modalName.textContent = selectedProduct.name;
            sizeModal.classList.remove('hidden');
        } else {
            console.error('Modal elements not found');
        }
    });
});

// Confirm add to cart
if (confirmAdd) {
    confirmAdd.addEventListener('click', async function() {
        console.log('Confirm add clicked');
        console.log('Selected size:', selectedSize);
        console.log('Selected product:', selectedProduct);

        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        if (!selectedProduct) {
            alert('No product selected');
            return;
        }

        try {
            const requestBody = {
                productId: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                quantity: 1,
                size: selectedSize
            };
            console.log('Sending request with body:', requestBody);

            const response = await fetch('/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                alert('Product added to cart!');
                sizeModal.classList.add('hidden');
                selectedSize = null;
                document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
            } else {
                alert(data.error || 'Failed to add product to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart. Please try again.');
        }
    });
} else {
    console.error('Confirm add button not found');
}
