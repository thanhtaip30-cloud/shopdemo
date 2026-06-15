/* ==========================================================================
   1. CORE STATE & MOCK DATABASE (DỮ LIỆU SẢN PHẨM THỰC TẾ)
   ========================================================================== */
const initialProducts = [
    { 
        id: 1, 
        name: "Nước Ion Kiềm Fujiwa 300ml (Thùng 24 chai)", 
        price: 144000, 
        cat: "chai", 
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80", 
        desc: "Dung tích 300ml nhỏ gọn tiện lợi mang theo đi học, đi làm. Giúp cân bằng lượng axit dư thừa, thanh lọc đào thải độc tố cơ thể." 
    },
    { 
        id: 2, 
        name: "Nước Ion Kiềm Fujiwa 450ml (Thùng 24 chai)", 
        price: 168000, 
        cat: "chai", 
        image: "https://images.unsplash.com/photo-1551730359-5b91793486b0?auto=format&fit=crop&w=500&q=80", 
        desc: "Sản phẩm đóng chai 450ml. Bổ sung vi khoáng tự nhiên, phù hợp mang theo hằng ngày, duy trì tính kiềm khỏe mạnh." 
    },
    { 
        id: 3, 
        name: "Nước Ion Kiềm Fujiwa 680ml (Thùng 20 chai)", 
        price: 200000, 
        cat: "chai", 
        image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80", 
        desc: "Dung tích 680ml tối ưu bù nước, bù khoáng cực nhanh. Lý tưởng cho người hoạt động thể thao cường độ cao." 
    },
    { 
        id: 4, 
        name: "Nước Ion Kiềm Fujiwa 1250ml (Thùng 12 chai)", 
        price: 192000, 
        cat: "chai", 
        image: "https://images.unsplash.com/photo-1615655404745-d1f70730db32?auto=format&fit=crop&w=500&q=80", 
        desc: "Chai lớn 1.25L tiết kiệm hơn, thích hợp cho các buổi dã ngoại gia đình hoặc lưu trữ sẵn trong tủ lạnh." 
    },
    { 
        id: 5, 
        name: "Bình Nước Ion Kiềm Fujiwa 19L (Có vòi)", 
        price: 85000, 
        cat: "binh", 
        image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=500&q=80", 
        desc: "Bình 19 lít dung tích lớn. Lựa chọn số 1 cho văn phòng và gia đình để uống trực tiếp và nấu ăn bổ dưỡng hàng ngày." 
    },
    { 
        id: 6, 
        name: "Thức Uống Bổ Sung Ion Fujiwa Speed (Thùng 24 chai)", 
        price: 360000, 
        cat: "chai", 
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80", 
        desc: "Thức uống thể thao Fujiwa Speed 390ml. Phục hồi thể lực thần tốc, xua tan mệt mỏi ngay lập tức nhờ công nghệ ion." 
    },
    { 
        id: 7, 
        name: "Nước Xịt Thơm Miệng Fujisalt (Hộp 12 chai)", 
        price: 690000, 
        cat: "chai", 
        image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80", 
        desc: "Nước xịt thơm miệng ion muối, giúp diệt khuẩn vùng vòm họng, mang lại hơi thở thơm mát tự tin suốt cả ngày." 
    }
];

let db = {
    products: JSON.parse(localStorage.getItem('fuji_products')) || initialProducts,
    users: JSON.parse(localStorage.getItem('fuji_users')) || [{ username: 'admin', password: '123', role: 'admin' }],
    orders: JSON.parse(localStorage.getItem('fuji_orders')) || [],
    cart: JSON.parse(localStorage.getItem('fuji_cart')) || [],
    currentUser: JSON.parse(localStorage.getItem('fuji_user')) || null
};

// Nếu dữ liệu cũ trong máy bạn vẫn còn lưu mảng 3 sản phẩm, ta sẽ ép cập nhật lại mảng mới nhất này
if(db.products.length < 5) {
    db.products = initialProducts;
    localStorage.setItem('fuji_products', JSON.stringify(db.products));
}

function commitData(table) {
    localStorage.setItem(`fuji_${table}`, JSON.stringify(db[table]));
}

/* ==========================================================================
   2. SINGLE PAGE APPLICATION ROUTER (SPA CONFIG)
   ========================================================================== */
function navigate(screenId, param = null) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('d-none'));
    document.getElementById(screenId).classList.remove('d-none');
    
    document.querySelectorAll('.navbar__link').forEach(link => link.classList.remove('active'));
    if (screenId === 'screen-home') document.getElementById('nav-home').classList.add('active');
    if (screenId === 'screen-about') document.getElementById('nav-about').classList.add('active');
    if (screenId === 'screen-products') document.getElementById('nav-products').classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (screenId === 'screen-products') renderProductsGrid(db.products);
    if (screenId === 'screen-detail') renderProductDetailPage(param);
    if (screenId === 'screen-cart') renderCartDashboard();
    if (screenId === 'screen-admin') renderAdminControlPanel();
    
    updateNavbarState();
}

/* ==========================================================================
   3. DYNAMIC PRODUCTS GRID ENGINE & SEARCH / FILTER
   ========================================================================== */
function renderProductsGrid(list) {
    const container = document.getElementById('product-list');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color:#94a3b8; padding:3rem 0;">Không tìm thấy sản phẩm nào phù hợp từ khóa lọc.</p>';
        return;
    }
    
    container.innerHTML = list.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" onclick="navigate('screen-detail', ${p.id})">
            <h3 onclick="navigate('screen-detail', ${p.id})">${p.name}</h3>
            <p class="price">${p.price.toLocaleString('vi-VN')}đ</p>
            <button class="btn btn--solid w-100" onclick="addProductToCart(${p.id})">Thêm vào giỏ</button>
        </div>
    `).join('');
}

document.getElementById('shopSearchInput').addEventListener('input', (e) => {
    const searchVal = e.target.value.toLowerCase().trim();
    const matches = db.products.filter(p => p.name.toLowerCase().includes(searchVal));
    renderProductsGrid(matches);
});

document.getElementById('categoryFilter').addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    const itemsFiltered = selectedCategory === 'all' ? db.products : db.products.filter(p => p.cat === selectedCategory);
    renderProductsGrid(itemsFiltered);
});

/* ==========================================================================
   4. PRODUCT DETAIL CONTROLLER
   ========================================================================== */
function renderProductDetailPage(id) {
    const currentItem = db.products.find(p => p.id === id);
    const container = document.getElementById('detail-container');
    if (!currentItem || !container) return;

    container.innerHTML = `
        <img src="${currentItem.image}" alt="${currentItem.name}">
        <div class="detail-info">
            <h1>${currentItem.name}</h1>
            <div class="price">${currentItem.price.toLocaleString('vi-VN')} VNĐ</div>
            <p>${currentItem.desc || 'Dòng sản phẩm nước ion kiềm cao cấp công nghệ điện phân tự động Nhật Bản bảo vệ sức khỏe vững chắc.'}</p>
            <button class="btn btn--solid" onclick="addProductToCart(${currentItem.id})">
                <i class="fa-solid fa-cart-plus"></i> Đưa Vào Giỏ Hàng Ngay
            </button>
        </div>
    `;
}

/* ==========================================================================
   5. SHOPPING CART OPERATION WITH LOCAL STORAGE
   ========================================================================== */
function addProductToCart(id) {
    const productItem = db.products.find(p => p.id === id);
    const cartMatch = db.cart.find(item => item.id === id);
    
    if (cartMatch) {
        cartMatch.qty += 1;
    } else {
        db.cart.push({ ...productItem, qty: 1 });
    }
    
    commitData('cart');
    updateNavbarState();
    alert(`Đã đưa thành công "${productItem.name}" vào giỏ hàng.`);
}

function handleCartQuantityModify(id, step) {
    const targetedItem = db.cart.find(i => i.id === id);
    if (targetedItem) {
        targetedItem.qty += step;
        if (targetedItem.qty <= 0) {
            db.cart = db.cart.filter(i => i.id !== id);
        }
        commitData('cart');
        renderCartDashboard();
        updateNavbarState();
    }
}

function renderCartDashboard() {
    const itemsContainer = document.getElementById('cart-items');
    const totalBox = document.getElementById('cart-total');
    if (!itemsContainer || !totalBox) return;

    let totalSum = 0;
    let codeBlockHtml = '';

    db.cart.forEach(item => {
        const itemSubtotal = item.price * item.qty;
        totalSum += itemSubtotal;
        codeBlockHtml += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div style="flex:1; padding: 0 1.5rem;">
                    <h3 style="font-size:1.1rem; margin-bottom:5px;">${item.name}</h3>
                    <p style="color:var(--color-text-muted)">Đơn giá: ${item.price.toLocaleString()}đ</p>
                </div>
                <div class="qty-control">
                    <button class="qty-btn" onclick="handleCartQuantityModify(${item.id}, -1)">-</button>
                    <span style="font-weight:700; font-size:1.1rem; width:25px; text-align:center;">${item.qty}</span>
                    <button class="qty-btn" onclick="handleCartQuantityModify(${item.id}, 1)">+</button>
                </div>
                <div style="width:130px; text-align:right; font-weight:700; color:var(--color-primary);">
                    ${itemSubtotal.toLocaleString()}đ
                </div>
            </div>
        `;
    });

    itemsContainer.innerHTML = codeBlockHtml || '<p style="text-align:center; padding:3rem 0; color:#94a3b8;">Giỏ hàng trống. Mời bạn quay lại hệ thống chọn mua nước ion kiềm.</p>';
    totalBox.innerText = `${totalSum.toLocaleString('vi-VN')} VNĐ`;
}

function checkout() {
    if (db.cart.length === 0) return alert('Giỏ hàng trống rỗng, không thể tạo đơn hàng.');
    if (!db.currentUser) {
        alert('Yêu cầu bắt buộc: Vui lòng đăng nhập tài khoản trước khi lên đơn mua hàng.');
        return navigate('screen-login');
    }

    const currentOrderTotal = db.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    db.orders.push({
        user: db.currentUser.username,
        total: currentOrderTotal,
        date: new Date().toISOString()
    });
    
    commitData('orders');
    db.cart = [];
    commitData('cart');
    updateNavbarState();
    
    alert('🎉 Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận vào hệ thống.');
    navigate('screen-home');
}

/* ==========================================================================
   6. IDENTITY & USER AUTHENTICATION HUB (LOGIN / REGISTER)
   ========================================================================== */
let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới';
    document.getElementById('btn-auth').innerText = isLoginMode ? 'Xác nhận đăng nhập' : 'Hoàn tất đăng ký';
    document.querySelector('.auth-switch').innerText = isLoginMode ? 'Chưa có tài khoản đăng ký? Tạo ngay' : 'Đã có tài khoản hệ thống? Đăng nhập';
}

function handleAuth() {
    const userField = document.getElementById('auth-user').value.trim();
    const passField = document.getElementById('auth-pass').value.trim();

    if (!userField || !passField) return alert('Yêu cầu điền đầy đủ cả tên đăng nhập lẫn mật khẩu bảo mật.');

    if (!isLoginMode) {
        if (db.users.find(u => u.username === userField)) return alert('Tên đăng nhập này đã tồn tại, hãy chọn tên khác!');
        db.users.push({ username: userField, password: passField, role: 'customer' });
        commitData('users');
        alert('Tạo tài khoản thành công! Tiến trình tự động đăng nhập bắt đầu...');
    }

    const identityCheck = db.users.find(u => u.username === userField && u.password === passField);
    if (identityCheck) {
        db.currentUser = { username: identityCheck.username, role: identityCheck.role };
        commitData('currentUser');
        document.getElementById('auth-user').value = '';
        document.getElementById('auth-pass').value = '';
        alert(`Chào mừng quay trở lại hệ thống, ${identityCheck.username}!`);
        navigate('screen-home');
    } else {
        alert('Thông tin xác thực chưa đúng chính xác. Vui lòng kiểm tra lại!');
    }
}

function logout() {
    db.currentUser = null;
    commitData('currentUser');
    navigate('screen-home');
}

function updateNavbarState() {
    const quantityCountBadge = db.cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').innerText = quantityCountBadge;

    const navLoginLink = document.getElementById('nav-login');
    const navUserLink = document.getElementById('nav-user');
    const navAdminLink = document.getElementById('nav-admin');

    if (db.currentUser) {
        navLoginLink.classList.add('d-none');
        navUserLink.classList.remove('d-none');
        document.getElementById('current-username').innerText = db.currentUser.username;
        
        if (db.currentUser.role === 'admin') {
            navAdminLink.classList.remove('d-none');
        } else {
            navAdminLink.classList.add('d-none');
        }
    } else {
        navLoginLink.classList.remove('d-none');
        navUserLink.classList.add('d-none');
        navAdminLink.classList.add('d-none');
    }
}

/* ==========================================================================
   7. ADMINISTRATIVE PORTAL OPERATIONS (CRUD & LIVE METRICS)
   ========================================================================== */
function renderAdminControlPanel() {
    if (!db.currentUser || db.currentUser.role !== 'admin') {
        alert('Khu vực giới hạn bảo mật cấp cao! Tự động chuyển hướng về trang chủ.');
        return navigate('screen-home');
    }

    const aggregatedRevenue = db.orders.reduce((sum, o) => sum + o.total, 0);
    document.getElementById('stat-revenue').innerText = aggregatedRevenue.toLocaleString('vi-VN') + ' VNĐ';
    document.getElementById('stat-orders').innerText = db.orders.length;

    const managementContainer = document.getElementById('admin-products');
    managementContainer.innerHTML = db.products.map(p => `
        <div class="admin-item">
            <div style="display:flex; align-items:center; gap:12px;">
                <img src="${p.image}" style="width:40px; height:40px; object-fit:contain; border:1px solid #e2e8f0; border-radius:4px;">
                <div>
                    <strong>${p.name}</strong><br>
                    <span style="color:var(--color-primary); font-weight:700;">${p.price.toLocaleString()}đ</span>
                </div>
            </div>
            <button class="btn-danger" onclick="executeProductDeletion(${p.id})">Gỡ sản phẩm</button>
        </div>
    `).join('');
}

function addProduct() {
    const inputName = document.getElementById('add-name').value.trim();
    const inputPrice = parseInt(document.getElementById('add-price').value);
    const inputCat = document.getElementById('add-cat').value;
    const inputImg = document.getElementById('add-img').value.trim();
    const inputDesc = document.getElementById('add-desc').value.trim();

    if (!inputName || isNaN(inputPrice)) return alert('Vui lòng điền đúng thông tin tên mặt hàng và giá niêm yết.');

    const calculatedId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
    const fallBackImage = inputCat === 'chai' 
        ? 'https://via.placeholder.com/500/e0f2fe/0369a1?text=Chai+Mới' 
        : 'https://via.placeholder.com/500/bae6fd/0369a1?text=Bình+Mới';

    db.products.push({
        id: calculatedId,
        name: inputName,
        price: inputPrice,
        cat: inputCat,
        image: inputImg || fallBackImage,
        desc: inputDesc || 'Sản phẩm mới cập nhật vào hệ thống phân phối nước.'
    });
    
    commitData('products');

    document.getElementById('add-name').value = '';
    document.getElementById('add-price').value = '';
    document.getElementById('add-img').value = '';
    document.getElementById('add-desc').value = '';

    alert('Đã cập nhật cơ sở dữ liệu hàng hóa thành công.');
    renderAdminControlPanel();
}

function executeProductDeletion(id) {
    if (confirm('Xác nhận thao tác: Bạn có thực sự muốn xóa sản phẩm này ra khỏi danh mục bán hàng?')) {
        db.products = db.products.filter(p => p.id !== id);
        commitData('products');
        renderAdminControlPanel();
    }
}

/* ==========================================================================
   8. LIFE-CYCLE INITIATION ENGINE
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const loaderElement = document.getElementById("preloader");
    setTimeout(() => {
        if (loaderElement) loaderElement.classList.add("fade-out");
    }, 400);

    updateNavbarState();
    navigate('screen-home');
});
