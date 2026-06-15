/* =========================================================
   1. MOCK DATABASE (Khởi tạo CSDL qua LocalStorage)
   ========================================================= */
const initialProducts = [
    { id: 1, name: "Nước Ion Kiềm Fujiwa 450ml", price: 12000, cat: "chai", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80", desc: "Giúp cân bằng lượng axit dư thừa, thanh lọc đào thải độc tố cơ thể nhanh chóng hiệu quả." },
    { id: 2, name: "Nước Ion Kiềm Fujiwa 680ml", price: 15000, cat: "chai", image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80", desc: "Hỗ trợ đắc lực cấu trúc bù khoáng thể thao, bù nước tối ưu." },
    { id: 3, name: "Bình Nước Ion Kiềm 19L", price: 90000, cat: "binh", image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=500&q=80", desc: "Bảo vệ hệ tiêu hóa trọn vẹn cả nhà, sử dụng trực tiếp hàng ngày tiện ích." }
];

let db = {
    products: JSON.parse(localStorage.getItem('fuji_products')) || initialProducts,
    users: JSON.parse(localStorage.getItem('fuji_users')) || [{ username: 'admin', password: '123', role: 'admin' }], // Mặc định tài khoản quản trị
    orders: JSON.parse(localStorage.getItem('fuji_orders')) || [], // Lưu hóa đơn
    cart: JSON.parse(localStorage.getItem('fuji_cart')) || [], // Lưu giỏ hàng
    currentUser: JSON.parse(localStorage.getItem('fuji_user')) || null // Phiên đăng nhập
};

function saveDB(table) {
    localStorage.setItem(`fuji_${table}`, JSON.stringify(db[table]));
}


/* =========================================================
   2. HỆ THỐNG ĐIỀU HƯỚNG SPA (ROUTER)
   ========================================================= */
function navigate(screenId, param = null) {
    // Ẩn tất cả màn hình
    document.querySelectorAll('.screen').forEach(s => s.classList.add('d-none'));
    // Hiện màn hình mục tiêu
    document.getElementById(screenId).classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Gọi hàm tương ứng để render dữ liệu
    if (screenId === 'screen-home') renderProducts(db.products);
    if (screenId === 'screen-detail') renderDetail(param);
    if (screenId === 'screen-cart') renderCart();
    if (screenId === 'screen-admin') renderAdmin();
    
    updateNavbar();
}


/* =========================================================
   3. TRANG CHỦ & DANH SÁCH SẢN PHẨM (ĐỌC & LỌC)
   ========================================================= */
function renderProducts(dataList) {
    const container = document.getElementById('product-list');
    if (dataList.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Không tìm thấy sản phẩm nào.</p>';
        return;
    }
    
    container.innerHTML = dataList.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" onclick="navigate('screen-detail', ${p.id})">
            <h3 onclick="navigate('screen-detail', ${p.id})">${p.name}</h3>
            <p class="price">${p.price.toLocaleString('vi-VN')} VNĐ</p>
            <button class="btn btn--solid w-100" onclick="addToCart(${p.id})">Thêm vào giỏ</button>
        </div>
    `).join('');
}

// Xử lý Lọc theo danh mục
document.getElementById('categoryFilter').addEventListener('change', (e) => {
    const cat = e.target.value;
    const filtered = cat === 'all' ? db.products : db.products.filter(p => p.cat === cat);
    renderProducts(filtered);
});

// Xử lý Tìm kiếm Text
document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = db.products.filter(p => p.name.toLowerCase().includes(keyword));
    navigate('screen-home'); // Đẩy về trang chủ nếu đang ở trang khác
    renderProducts(filtered);
});


/* =========================================================
   4. TRANG CHI TIẾT SẢN PHẨM
   ========================================================= */
function renderDetail(id) {
    const product = db.products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('detail-container').innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="detail-info">
            <h1>${product.name}</h1>
            <p style="font-weight: bold; color: var(--color-primary); margin-bottom: 10px;">Danh mục: ${product.cat === 'chai' ? 'Chai nhỏ' : 'Bình lớn'}</p>
            <p class="price">${product.price.toLocaleString('vi-VN')} VNĐ</p>
            <p>${product.desc || 'Sản phẩm cao cấp từ Fujiwa Việt Nam.'}</p>
            <br>
            <button class="btn btn--solid" onclick="addToCart(${product.id})" style="width: 100%; font-size: 1.1rem; padding: 1.2rem;">
                <i class="fa-solid fa-cart-plus"></i> Thêm Vào Giỏ Hàng
            </button>
        </div>
    `;
}


/* =========================================================
   5. HỆ THỐNG GIỎ HÀNG VÀ THANH TOÁN
   ========================================================= */
function addToCart(id) {
    const product = db.products.find(p => p.id === id);
    const existing = db.cart.find(item => item.id === id);
    
    if (existing) existing.qty += 1;
    else db.cart.push({ ...product, qty: 1 });
    
    saveDB('cart');
    updateNavbar();
    alert(`Đã thêm thành công: ${product.name}`);
}

function updateCartQty(id, change) {
    const item = db.cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) db.cart = db.cart.filter(i => i.id !== id);
        saveDB('cart');
        renderCart();
        updateNavbar();
    }
}

function renderCart() {
    let html = '';
    let total = 0;

    db.cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div style="flex:1; padding: 0 20px;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 5px;">${item.name}</h3>
                    <p style="color: var(--color-text-muted)">Đơn giá: ${item.price.toLocaleString()}đ</p>
                </div>
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                    <span style="font-size: 1.2rem; font-weight: bold; width: 30px; text-align: center;">${item.qty}</span>
                    <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                </div>
                <div style="width: 150px; text-align: right; font-weight: bold; color: var(--color-primary); font-size: 1.1rem;">
                    ${subtotal.toLocaleString()}đ
                </div>
            </div>
        `;
    });

    document.getElementById('cart-items').innerHTML = html || '<p style="text-align:center; padding: 20px;">Giỏ hàng trống. Hãy tiếp tục mua sắm!</p>';
    document.getElementById('cart-total').innerText = `${total.toLocaleString('vi-VN')} VNĐ`;
}

function checkout() {
    if (db.cart.length === 0) return alert('Giỏ hàng của bạn đang trống!');
    if (!db.currentUser) {
        alert('Vui lòng đăng nhập hệ thống để tiếp tục thanh toán!');
        return navigate('screen-login');
    }

    // Tính tổng đơn và ghi nhận doanh thu vào bảng Orders
    const orderTotal = db.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    db.orders.push({ user: db.currentUser.username, total: orderTotal, date: new Date().toISOString() });
    saveDB('orders');

    // Xóa rỗng giỏ hàng sau khi mua thành công
    db.cart = [];
    saveDB('cart');
    updateNavbar();
    
    alert('🎉 Đặt hàng thành công! Đơn hàng sẽ được giao sớm nhất.');
    navigate('screen-home');
}


/* =========================================================
   6. HỆ THỐNG AUTHENTICATION (Đăng nhập / Đăng ký)
   ========================================================= */
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới';
    document.getElementById('btn-auth').innerText = isLoginMode ? 'Đăng nhập' : 'Đăng ký';
    document.querySelector('.auth-switch').innerText = isLoginMode ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Quay lại đăng nhập';
}

function handleAuth() {
    const user = document.getElementById('auth-user').value.trim();
    const pass = document.getElementById('auth-pass').value.trim();

    if (!user || !pass) return alert('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');

    if (!isLoginMode) {
        if (db.users.find(u => u.username === user)) return alert('Tên đăng nhập này đã được sử dụng!');
        db.users.push({ username: user, password: pass, role: 'customer' });
        saveDB('users');
        alert('Đăng ký thành công! Hệ thống tự động đăng nhập...');
    }

    // Logic Đăng nhập
    const validUser = db.users.find(u => u.username === user && u.password === pass);
    if (validUser) {
        db.currentUser = { username: validUser.username, role: validUser.role };
        saveDB('currentUser');
        document.getElementById('auth-user').value = '';
        document.getElementById('auth-pass').value = '';
        alert(`Xin chào ${validUser.username}!`);
        navigate('screen-home');
    } else {
        alert('Sai tài khoản hoặc mật khẩu. Vui lòng thử lại!');
    }
}

function logout() {
    db.currentUser = null;
    saveDB('currentUser');
    navigate('screen-home');
}

function updateNavbar() {
    // Đếm số lượng sản phẩm trên Icon giỏ hàng
    document.getElementById('cartCount').innerText = db.cart.reduce((sum, item) => sum + item.qty, 0);

    const navLogin = document.getElementById('nav-login');
    const navUser = document.getElementById('nav-user');
    const navAdmin = document.getElementById('nav-admin');

    if (db.currentUser) {
        navLogin.classList.add('d-none');
        navUser.classList.remove('d-none');
        document.getElementById('current-username').innerText = db.currentUser.username;
        // Phân quyền Admin
        if (db.currentUser.role === 'admin') navAdmin.classList.remove('d-none');
        else navAdmin.classList.add('d-none');
    } else {
        navLogin.classList.remove('d-none');
        navUser.classList.add('d-none');
        navAdmin.classList.add('d-none');
    }
}


/* =========================================================
   7. TRANG QUẢN TRỊ ADMIN (CRUD Sản phẩm & Thống kê)
   ========================================================= */
function renderAdmin() {
    if (!db.currentUser || db.currentUser.role !== 'admin') {
        alert('Khu vực hạn chế. Bạn không có quyền truy cập!');
        return navigate('screen-home');
    }

    // Tính Doanh Thu & Số lượng đơn (Aggregate)
    const totalRev = db.orders.reduce((sum, order) => sum + order.total, 0);
    document.getElementById('stat-revenue').innerText = totalRev.toLocaleString('vi-VN') + ' VNĐ';
    document.getElementById('stat-orders').innerText = db.orders.length;

    // Hiển thị danh sách Quản lý Sản phẩm
    const adminList = document.getElementById('admin-products');
    adminList.innerHTML = db.products.map(p => `
        <div class="admin-item">
            <div style="display:flex; gap: 15px; align-items: center;">
                <img src="${p.image}" style="width:50px; height:50px; object-fit:contain; border:1px solid #eee; border-radius:4px;">
                <div>
                    <strong>${p.name}</strong><br>
                    <span style="color:var(--color-primary)">${p.price.toLocaleString()}đ</span>
                </div>
            </div>
            <button class="btn-danger" onclick="deleteProduct(${p.id})">Xóa SP</button>
        </div>
    `).join('');
}

function addProduct() {
    const name = document.getElementById('add-name').value;
    const price = parseInt(document.getElementById('add-price').value);
    const cat = document.getElementById('add-cat').value;
    const imgInput = document.getElementById('add-img').value;
    const desc = document.getElementById('add-desc').value;

    if (!name || isNaN(price)) return alert('Vui lòng nhập tên và giá tiền hợp lệ!');

    const newId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
    const defaultImg = cat === 'chai' 
        ? 'https://via.placeholder.com/500/e0f2fe/0369a1?text=Chai+Mới' 
        : 'https://via.placeholder.com/500/bae6fd/0369a1?text=Bình+Mới';

    db.products.push({
        id: newId,
        name: name,
        price: price,
        cat: cat,
        image: imgInput || defaultImg,
        desc: desc || 'Sản phẩm mới cập nhật.'
    });
    
    saveDB('products');
    
    // Reset Form
    document.getElementById('add-name').value = '';
    document.getElementById('add-price').value = '';
    document.getElementById('add-img').value = '';
    document.getElementById('add-desc').value = '';

    alert('Đã thêm sản phẩm thành công vào hệ thống!');
    renderAdmin();
}

function deleteProduct(id) {
    if (confirm('Lưu ý: Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này khỏi cơ sở dữ liệu?')) {
        db.products = db.products.filter(p => p.id !== id);
        saveDB('products');
        renderAdmin();
    }
}


/* =========================================================
   8. HIỆU ỨNG GIAO DIỆN & KHỞI CHẠY (UI / INIT)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    // Tắt Preloader
    const preloader = document.getElementById("preloader");
    setTimeout(() => { if (preloader) preloader.classList.add("fade-out"); }, 500);

    // Khởi chạy App
    updateNavbar();
    navigate('screen-home');
});