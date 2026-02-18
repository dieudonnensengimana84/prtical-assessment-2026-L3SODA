// ===================== AUTH =====================
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const dashboardSection = document.getElementById('dashboardSection');

const showLogin = document.getElementById('showLogin');
const showRegister = document.getElementById('showRegister');

showLogin.addEventListener('click', () => {
  loginSection.classList.remove('hidden');
  registerSection.classList.add('hidden');
});
showRegister.addEventListener('click', () => {
  registerSection.classList.remove('hidden');
  loginSection.classList.add('hidden');
});

let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;

// Register
document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirmPassword').value;

  if(!name || !email || !password){ alert('All fields required'); return; }
  if(password.length < 6){ alert('Password must be at least 6 characters'); return; }
  if(password !== confirm){ alert('Passwords do not match'); return; }
  if(users.find(u => u.email === email)){ alert('Email already registered'); return; }

  users.push({name,email,password});
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registered successfully!');
  registerSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
});

// Login
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const user = users.find(u => u.email === email && u.password === password);
  if(!user){ alert('Invalid credentials'); return; }

  currentUser = user;
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  document.getElementById('loggedUser').textContent = `Hello, ${currentUser.name}`;
  updateDashboardStats();
  refreshCharts();
  updateReportCards();
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  dashboardSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
  currentUser = null;
});

// ===================== SIDEBAR =====================
const menuDashboard = document.getElementById('menuDashboard');
const menuProducts = document.getElementById('menuProducts');
const menuReports = document.getElementById('menuReports');
const menuSettings = document.getElementById('menuSettings');

const dashboardContent = document.getElementById('dashboardContent');
const productsContent = document.getElementById('productsContent');
const reportsContent = document.getElementById('reportsContent');
const settingsContent = document.getElementById('settingsContent');

function setActiveMenu(menu){
  [menuDashboard,menuProducts,menuReports,menuSettings].forEach(m => m.classList.remove('active'));
  menu.classList.add('active');
  dashboardContent.classList.add('hidden');
  productsContent.classList.add('hidden');
  reportsContent.classList.add('hidden');
  settingsContent.classList.add('hidden');
}

menuDashboard.addEventListener('click', () => { setActiveMenu(menuDashboard); dashboardContent.classList.remove('hidden'); });
menuProducts.addEventListener('click', () => { setActiveMenu(menuProducts); productsContent.classList.remove('hidden'); });
menuReports.addEventListener('click', () => { setActiveMenu(menuReports); reportsContent.classList.remove('hidden'); updateReportCards(); });
menuSettings.addEventListener('click', () => { setActiveMenu(menuSettings); settingsContent.classList.remove('hidden'); });

// ===================== DARK MODE =====================
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
document.getElementById('toggleDark').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// ===================== PRODUCTS =====================
let products = [];
let productId = 1;

const productTable = document.getElementById('productTable');
const showAddProductBtn = document.getElementById('showAddProduct');
const addProductSection = document.getElementById('addProductSection');
const productForm = document.getElementById('productForm');
const searchInput = document.getElementById('searchProduct');

showAddProductBtn.addEventListener('click', () => {
  addProductSection.classList.toggle('hidden');
});

// Add/Edit Product
productForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value.trim();
  const quantity = parseInt(document.getElementById('productQuantity').value);
  const price = parseFloat(document.getElementById('productPrice').value);

  const editId = productForm.getAttribute('data-edit-id');
  if(editId){
    const prod = products.find(p => p.id == editId);
    prod.name = name;
    prod.category = category;
    prod.quantity = quantity;
    prod.price = price;
    productForm.removeAttribute('data-edit-id');
  } else {
    products.push({id:productId++, name, category, quantity, price});
  }

  productForm.reset();
  addProductSection.classList.add('hidden');
  renderProducts();
  updateDashboardStats();
  refreshCharts();
  updateReportCards();
});

// Render Products Table
function renderProducts(){
  productTable.innerHTML = '';
  products.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${p.quantity}</td>
      <td>$${p.price.toFixed(2)}</td>
      <td>${p.quantity>0 ? 'In Stock' : 'Out of Stock'}</td>
      <td>
        <button class="editBtn" data-id="${p.id}">Edit</button>
        <button class="deleteBtn" data-id="${p.id}">Delete</button>
      </td>
    `;
    productTable.appendChild(row);
  });

  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.getAttribute('data-id');
      const prod = products.find(p => p.id == id);
      document.getElementById('productName').value = prod.name;
      document.getElementById('productCategory').value = prod.category;
      document.getElementById('productQuantity').value = prod.quantity;
      document.getElementById('productPrice').value = prod.price;
      addProductSection.classList.remove('hidden');
      productForm.setAttribute('data-edit-id', id);
    });
  });

  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.getAttribute('data-id');
      const prod = products.find(p => p.id == id);
      if(prod){
        prod.quantity = 0; // mark as out of stock instead of removing
      }
      renderProducts();
      updateDashboardStats();
      refreshCharts();
      updateReportCards();
    });
  });
}

// Search products
searchInput.addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  productTable.querySelectorAll('tr').forEach(row => {
    const name = row.children[1].textContent.toLowerCase();
    row.style.display = name.includes(query) ? '' : 'none';
  });
});

// ===================== DASHBOARD STATS =====================
function updateDashboardStats(){
  const total = products.length;
  const inStock = products.filter(p => p.quantity>0).length;
  const outStock = total - inStock;

  document.getElementById('totalProducts').textContent = total;
  document.getElementById('inStock').textContent = inStock;
  document.getElementById('outStock').textContent = outStock;
}

// ===================== REPORTS =====================
let chart;
function updateReportChart(){
  const ctx = document.getElementById('reportChart').getContext('2d');
  const labels = products.map(p => p.name);
  const data = products.map(p => p.quantity);

  if(chart) chart.destroy();

  chart = new Chart(ctx, {
    type:'bar',
    data:{
      labels: labels,
      datasets:[{
        label:'Product Quantity',
        data:data,
        backgroundColor:'#3b82f6',
        borderRadius: 6
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true, ticks:{stepSize:1}}}
    }
  });
}

function updateStockStatusChart(){
  const ctx = document.getElementById('stockStatusChart').getContext('2d');
  const inStock = products.filter(p => p.quantity > 0)}