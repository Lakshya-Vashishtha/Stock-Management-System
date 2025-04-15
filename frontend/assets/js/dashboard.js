document.addEventListener('DOMContentLoaded', function() {
    // Load user data and update UI
    loadUserData();

    // Initialize sidebar toggle - fixed ID selector
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function(e) {
            e.preventDefault();
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
            console.log('Sidebar toggle clicked'); // Debug log
        });
    }

    // Set up logout functionality
    setupLogout();

    // For mobile devices - close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        const isMobile = window.innerWidth < 768;
        const clickedOutsideSidebar = !sidebar.contains(event.target);
        const clickedOutsideToggle = sidebarCollapse && !sidebarCollapse.contains(event.target);
        
        if (isMobile && sidebar.classList.contains('active') && clickedOutsideSidebar && clickedOutsideToggle) {
            sidebar.classList.remove('active');
            content.classList.add('active');
        }
    });

    // Initialize Chart.js for sales data
    initializeSalesChart();

    // Initialize search functionality
    const smartSearch = document.getElementById('smartSearch');
    if (smartSearch) {
        smartSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('#productsTable tbody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // Populate dashboard with data from API
    fetchDashboardData();

    // Set up detailed alerts for low stock and expiring products
    setupDetailedAlerts();

    // Initialize product form submission
    const saveProduct = document.getElementById('saveProduct');
    if (saveProduct) {
        saveProduct.addEventListener('click', function() {
            const productForm = document.getElementById('addProductForm');
            if (productForm.checkValidity()) {
                const formData = new FormData(productForm);
                const productData = Object.fromEntries(formData.entries());
                
                // Save product to backend
                saveProductToAPI(productData);
            } else {
                productForm.reportValidity();
            }
        });
    }

    // Import CSV functionality
    const importCSV = document.getElementById('importCSV');
    if (importCSV) {
        importCSV.addEventListener('click', function() {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.csv';
            fileInput.click();
            
            fileInput.addEventListener('change', function(e) {
                // Process CSV file
                const file = e.target.files[0];
                if (file) {
                    parseAndUploadCSV(file);
                }
            });
        });
    }

    // Initialize filter functionality
    const filters = document.querySelectorAll('#brandFilter, #categoryFilter, #stockFilter');
    filters.forEach(filter => {
        if (filter) {
            filter.addEventListener('change', function() {
                filterProducts();
            });
        }
    });

    // Initialize tooltips
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

// Initialize sales chart with dynamic data
function initializeSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    const ctx2d = ctx.getContext('2d');
    const gradient = ctx2d.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(106, 38, 205, 0.3)');
    gradient.addColorStop(1, 'rgba(106, 38, 205, 0.0)');

    // Create initial chart with empty data
    const salesChart = new Chart(ctx2d, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Sales',
                data: [],
                backgroundColor: gradient,
                borderColor: '#6a26cd',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6a26cd',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    bodySpacing: 5,
                    borderColor: '#6a26cd',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return '₹' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });

    // Fetch sales data for the default period (month)
    fetchSalesData('month', salesChart);

    // Handle chart time period changes
    const periodButtons = document.querySelectorAll('[data-period]');
    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            periodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const period = this.getAttribute('data-period');
            
            // Fetch data for the selected period
            fetchSalesData(period, salesChart);
        });
    });
}

// Fetch sales data from API based on time period
function fetchSalesData(period, chart) {
    // Show loading state
    if (chart) {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.update();
    }
    
    // In a real application, this would be an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        let labels = [];
        let data = [];
        
        // Simulate different data based on period
        switch(period) {
            case 'day':
                labels = ['9am', '11am', '1pm', '3pm', '5pm', '7pm'];
                data = [3000, 5000, 7000, 4000, 6000, 8000];
                break;
            case 'week':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                data = [5000, 7000, 6000, 8000, 9000, 12000, 10000];
                break;
            default: // month
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                data = [12000, 19000, 15000, 25000, 22000, 30000];
        }
        
        if (chart) {
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update();
        }
    }, 500);
}

// Main function to fetch all dashboard data
function fetchDashboardData() {
    // Show loading indicators
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.classList.remove('d-none');
    });
    
    // Fetch summary statistics
    fetchSummaryStats();
    
    // Fetch top products
    fetchTopProducts();
    
    // Fetch recent products
    fetchProducts();
}

// Fetch summary statistics for dashboard
function fetchSummaryStats() {
    // In a real app, this would be an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        const stats = {
            totalProducts: 158,
            monthlySales: '₹285,400',
            totalBrands: 12,
            lowStockItems: 5
        };
        
        // Update UI with stats
        updateElement('totalProducts', stats.totalProducts);
        updateElement('monthlySales', stats.monthlySales);
        updateElement('totalBrands', stats.totalBrands);
        updateElement('lowStockItems', stats.lowStockItems);
        
        // Hide related loading spinners
        document.querySelectorAll('.stats-container .loading-spinner').forEach(spinner => {
            spinner.classList.add('d-none');
        });
    }, 700);
}

// Fetch top selling products
function fetchTopProducts() {
    // In a real app, this would be an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        const topProducts = [
            { name: 'Samsung Galaxy S21', sales: 24, revenue: '₹28,800' },
            { name: 'Apple iPhone 13', sales: 21, revenue: '₹31,500' },
            { name: 'Sony WH-1000XM4', sales: 18, revenue: '₹27,000' },
            { name: 'OnePlus 9 Pro', sales: 15, revenue: '₹22,500' }
        ];
        
        const topProductsList = document.getElementById('topProductsList');
        if (topProductsList) {
            topProductsList.innerHTML = '';
            topProducts.forEach(product => {
                const item = document.createElement('div');
                item.className = 'top-product-item d-flex justify-content-between align-items-center p-2';
                item.innerHTML = `
                    <div>
                        <h6 class="mb-0">${product.name}</h6>
                        <small class="text-muted">Units sold: ${product.sales}</small>
                    </div>
                    <span class="badge bg-primary">${product.revenue}</span>
                `;
                topProductsList.appendChild(item);
            });
            
            // Hide related loading spinner
            const spinner = topProductsList.closest('.card').querySelector('.loading-spinner');
            if (spinner) spinner.classList.add('d-none');
        }
    }, 800);
}

// Fetch all products from API
function fetchProducts() {
    // In a real app, this would be an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        const products = [
            { name: 'Samsung Galaxy S21', brand: 'Samsung', category: 'Mobile Phones', stock: 15, price: '₹1,200', expiry: '2023-12-31' },
            { name: 'Apple iPhone 13', brand: 'Apple', category: 'Mobile Phones', stock: 8, price: '₹1,500', expiry: '2023-12-31' },
            { name: 'Sony WH-1000XM4', brand: 'Sony', category: 'Headphones', stock: 20, price: '₹1,500', expiry: '2024-05-15' },
            { name: 'OnePlus 9 Pro', brand: 'OnePlus', category: 'Mobile Phones', stock: 12, price: '₹1,200', expiry: '2023-12-31' },
            { name: 'Bose QuietComfort 45', brand: 'Bose', category: 'Headphones', stock: 5, price: '₹1,400', expiry: '2023-11-30' }
        ];
        
        const tableBody = document.querySelector('#productsTable tbody');
        if (tableBody) {
            tableBody.innerHTML = '';
            products.forEach(product => {
                addProductToTable(product);
            });
            
            // Hide related loading spinner
            const spinner = tableBody.closest('.card').querySelector('.loading-spinner');
            if (spinner) spinner.classList.add('d-none');
        }
        
        // Populate filter dropdowns with fetched data
        populateFilters(products);
    }, 1000);
}

// Save a new product to API
function saveProductToAPI(productData) {
    // Show loading indicator
    const saveButton = document.getElementById('saveProduct');
    if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    }
    
    // In a real app, this would be an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        console.log('Product saved:', productData);
        
        // Add product to table
        addProductToTable(productData);
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        document.getElementById('addProductForm').reset();
        
        // Show success message
        showNotification('Product added successfully!', 'success');
        
        // Reset button state
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = 'Save Product';
        }
        
        // Refresh products count
        fetchSummaryStats();
    }, 1000);
}

// Parse and upload CSV file
function parseAndUploadCSV(file) {
    // Show loading notification
    showNotification('Processing CSV file...', 'info');
    
    // In a real app, this would use FileReader and make an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        console.log('CSV file processed:', file.name);
        showNotification('CSV file processed successfully. 10 products imported.', 'success');
        
        // Refresh products list and counts
        fetchDashboardData();
    }, 1500);
}

// Helper function to update element text
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Helper functions for product management
function addProductToTable(product) {
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.brand}</td>
        <td>${product.category}</td>
        <td class="stock-level">${product.stock}</td>
        <td>${product.price}</td>
        <td>${product.expiry}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary" data-bs-toggle="tooltip" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" data-bs-toggle="tooltip" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(row);
    
    // Apply stock level styling
    const stockCell = row.querySelector('.stock-level');
    const stock = parseInt(stockCell.textContent);
    if (stock < 10) {
        stockCell.classList.add('text-danger');
        stockCell.innerHTML += ' <i class="fas fa-exclamation-circle" data-bs-toggle="tooltip" title="Low stock alert!"></i>';
    } else if (stock < 20) {
        stockCell.classList.add('text-warning');
    }
    
    // Initialize tooltips on new buttons
    if (typeof bootstrap !== 'undefined') {
        const tooltips = row.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(el => new bootstrap.Tooltip(el));
    }
}

function populateFilters(products) {
    // Get unique brands and categories
    const brands = [...new Set(products.map(p => p.brand))];
    const categories = [...new Set(products.map(p => p.category))];
    
    // Populate brand filter
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }
    
    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
    
    // Populate product form category selector
    const formCategorySelect = document.querySelector('select[name="category"]');
    if (formCategorySelect) {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            formCategorySelect.appendChild(option);
        });
    }
}

function filterProducts() {
    const brandFilter = document.getElementById('brandFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;
    
    const tableRows = document.querySelectorAll('#productsTable tbody tr');
    
    tableRows.forEach(row => {
        const brand = row.cells[1].textContent;
        const category = row.cells[2].textContent;
        const stock = parseInt(row.cells[3].textContent);
        
        let showRow = true;
        
        if (brandFilter && brand !== brandFilter) {
            showRow = false;
        }
        
        if (categoryFilter && category !== categoryFilter) {
            showRow = false;
        }
        
        if (stockFilter === 'low' && stock > 10) {
            showRow = false;
        }
        
        if (stockFilter === 'expiring') {
            // Implementation for expiring products would go here
            // For now, we'll skip this
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function showNotification(message, type) {
    const alertClasses = {
        success: 'alert-success',
        warning: 'alert-warning',
        danger: 'alert-danger',
        info: 'alert-info'
    };
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClasses[type] || 'alert-info'} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container-fluid');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 3000);
    }
}

function setupDetailedAlerts() {
    // Low stock products data
    const lowStockProducts = [
        { name: 'Apple iPhone 13', brand: 'Apple', stock: 8, threshold: 10 },
        { name: 'Bose QuietComfort 45', brand: 'Bose', stock: 5, threshold: 10 },
        { name: 'Samsung Galaxy Tab S7', brand: 'Samsung', stock: 3, threshold: 10 },
        { name: 'JBL Flip 5', brand: 'JBL', stock: 6, threshold: 10 },
        { name: 'Xiaomi Mi Band 6', brand: 'Xiaomi', stock: 7, threshold: 10 }
    ];

    // Expiring products data
    const expiringProducts = [
        { name: 'Bose QuietComfort 45', brand: 'Bose', expiry: '2023-11-30' },
        { name: 'Dell XPS 15 Cover', brand: 'Dell', expiry: '2023-12-05' },
        { name: 'Logitech MX Master 3', brand: 'Logitech', expiry: '2023-12-10' }
    ];

    // Create detailed alert for low stock
    const lowStockAlert = document.querySelector('.alert-warning');
    if (lowStockAlert) {
        // Create new alert content with badge
        const alertContent = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Low Stock Alert</strong>
                    <span class="badge bg-warning text-dark ms-2">${lowStockProducts.length}</span>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-warning show-details-btn">Show Details</button>
                </div>
            </div>
            <div class="mt-3 detailed-alert" style="display: none;">
                <hr>
                <div class="table-responsive">
                    <table class="table table-sm mb-0">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Brand</th>
                                <th>Current Stock</th>
                                <th>Threshold</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        let tableContent = '';
        lowStockProducts.forEach(product => {
            tableContent += `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.brand}</td>
                    <td class="text-danger fw-bold">${product.stock}</td>
                    <td>${product.threshold}</td>
                </tr>
            `;
        });

        const fullContent = alertContent + tableContent + `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        lowStockAlert.innerHTML = fullContent;
        // Remove alert-dismissible class
        lowStockAlert.classList.remove('alert-dismissible', 'fade');

        // Add event listener for toggling details
        const showDetailsBtn = lowStockAlert.querySelector('.show-details-btn');
        const detailedAlertDiv = lowStockAlert.querySelector('.detailed-alert');
        
        if (showDetailsBtn && detailedAlertDiv) {
            showDetailsBtn.addEventListener('click', function() {
                const isVisible = detailedAlertDiv.style.display !== 'none';
                detailedAlertDiv.style.display = isVisible ? 'none' : 'block';
                this.textContent = isVisible ? 'Show Details' : 'Hide Details';
            });
        }
    }

    // Create detailed alert for expiring products
    const expiryAlert = document.querySelector('.alert-danger');
    if (expiryAlert) {
        // Create new alert content with badge
        const alertContent = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas fa-clock"></i>
                    <strong>Expiry Alert</strong>
                    <span class="badge bg-danger text-white ms-2">${expiringProducts.length}</span>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-danger show-details-btn">Show Details</button>
                </div>
            </div>
            <div class="mt-3 detailed-alert" style="display: none;">
                <hr>
                <div class="table-responsive">
                    <table class="table table-sm mb-0">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Brand</th>
                                <th>Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        let tableContent = '';
        expiringProducts.forEach(product => {
            tableContent += `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.brand}</td>
                    <td class="text-danger fw-bold">${product.expiry}</td>
                </tr>
            `;
        });

        const fullContent = alertContent + tableContent + `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        expiryAlert.innerHTML = fullContent;
        // Remove alert-dismissible class
        expiryAlert.classList.remove('alert-dismissible', 'fade');

        // Add event listener for toggling details
        const showDetailsBtn = expiryAlert.querySelector('.show-details-btn');
        const detailedAlertDiv = expiryAlert.querySelector('.detailed-alert');
        
        if (showDetailsBtn && detailedAlertDiv) {
            showDetailsBtn.addEventListener('click', function() {
                const isVisible = detailedAlertDiv.style.display !== 'none';
                detailedAlertDiv.style.display = isVisible ? 'none' : 'block';
                this.textContent = isVisible ? 'Show Details' : 'Hide Details';
            });
        }
    }
}

function loadUserData() {
    // In a real application, this would be an API call
    // For now, we'll simulate fetching user data
    const userData = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        businessType: 'Electronics Retail',
        role: 'Admin',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6a26cd&color=fff'
    };

    // Update user name in the navbar
    updateElement('userName', userData.name);
    
    // Update business type in the sidebar
    updateElement('userBusinessType', userData.businessType);
    
    // Update avatar if needed - in a real app, you might want to update the src attribute
    const avatarImg = document.querySelector('.user-avatar img');
    if (avatarImg && userData.avatar) {
        avatarImg.src = userData.avatar;
        avatarImg.alt = userData.name;
    }
    
    console.log('User data loaded:', userData);
    
    // You might also want to adjust UI based on user role
    if (userData.role === 'Admin') {
        // Show admin-specific elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.classList.remove('d-none'));
    }
}

function setupLogout() {
    // Find all logout links
    const logoutLinks = document.querySelectorAll('a[href="#logout"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show confirmation dialog
            if (confirm('Are you sure you want to logout?')) {
                // In a real application, this would make an API call to invalidate the session
                // For now, we'll simulate logout with localStorage
                
                // Clear user data from localStorage
                localStorage.removeItem('user');
                localStorage.removeItem('authToken');
                
                // Show logout notification
                showNotification('Logged out successfully', 'info');
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = '../../../index.html'; // Corrected path to root index.html
                }, 1500);
            }
        });
    });
} 