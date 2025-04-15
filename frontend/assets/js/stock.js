document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar toggle
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function(e) {
            e.preventDefault();
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
        });
    }

    // Initialize live date time
    initializeLiveDateTime();

    // Load user data
    loadUserData();

    // Set up alerts for low stock and expiring products
    setupDetailedAlerts();

    // Initialize stock management page functionality
    initStockManagement();

    // Quick Actions event handlers (replacing search functionality)
    document.getElementById('quickImportCSV')?.addEventListener('click', function(e) {
        e.preventDefault();
        importCSVFile();
    });
    
    document.getElementById('quickExportCSV')?.addEventListener('click', function(e) {
        e.preventDefault();
        exportProductsToCSV();
    });
    
    document.getElementById('quickPrintInventory')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.print();
    });

    // Apply filters button
    $('#applyFilters').on('click', function() {
        filterProducts();
    });

    // Reset filters button
    $('#resetFilters').on('click', function() {
        // Reset all select elements to default
        $('#brandFilter, #categoryFilter, #stockFilter, #sortBy').val('');
        // Clear any applied filters
        filterProducts();
    });

    // Import CSV button
    $('#importCSV').on('click', function() {
        importCSVFile();
    });

    // Function to handle CSV import
    function importCSVFile() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv';
        fileInput.click();
        
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Process the CSV file
                parseAndUploadCSV(file);
            }
        });
    }

    // Sample CSV download
    $('#downloadSampleCSV').on('click', function(e) {
        e.preventDefault();
        
        // Create sample data
        const headers = ['Name', 'Brand', 'Category', 'Stock', 'Price', 'Expiry Date'];
        const sampleData = [
            ['Samsung Galaxy S21', 'Samsung', 'Mobile Phones', '15', '₹1,200', '2023-12-31'],
            ['Apple iPhone 13', 'Apple', 'Mobile Phones', '8', '₹1,500', '2023-12-31'],
            ['Sony WH-1000XM4', 'Sony', 'Headphones', '20', '₹1,500', '2024-05-15']
        ];
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        sampleData.forEach(row => {
            csvContent += row.join(',') + '\n';
        });
        
        // Download the sample CSV
        downloadCSV(csvContent, 'sample_products.csv');
        
        // Show notification
        showNotification('Sample CSV template downloaded', 'info');
    });

    // Export CSV button
    $('#exportCSV').on('click', function() {
        exportProductsToCSV();
    });

    // Print inventory button
    $('#printInventory').on('click', function() {
        window.print();
    });

    // Initialize DataTable with built-in search functionality
    function initializeDataTableWithSearch() {
        if ($.fn.DataTable && document.getElementById('productsTable')) {
            // Destroy existing DataTable if it exists
            if ($.fn.DataTable.isDataTable('#productsTable')) {
                $('#productsTable').DataTable().destroy();
            }
            
            // Initialize new DataTable with search enabled
            const dataTable = $('#productsTable').DataTable({
                dom: '<"top"<"dataTables_filter">fB>rt<"bottom"lip>',
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                buttons: [
                    {
                        text: 'Bulk Actions',
                        action: function() {
                            $('#bulkActionsModal').modal('show');
                        },
                        className: 'btn btn-sm btn-outline-primary',
                        enabled: false,
                        attr: {
                            id: 'bulkActionsBtn'
                        }
                    }
                ],
                columnDefs: [
                    { orderable: false, targets: [0, 9] }
                ],
                // Enhanced search functionality
                initComplete: function() {
                    // Add placeholder to search box
                    $('.dataTables_filter input')
                        .attr('placeholder', 'Search products...')
                        .addClass('form-control-sm')
                        .parent()
                        .addClass('has-search');
                    
                    // Add search icon
                    $('.dataTables_filter.has-search').prepend('<span class="fa fa-search form-control-feedback"></span>');
                }
            });
            
            // Add custom styling to the search box
            enhanceDataTableSearch();
        }
    }
    
    // Function to add custom styling to the DataTable search
    function enhanceDataTableSearch() {
        const searchContainer = $('.dataTables_filter');
        if (searchContainer.length) {
            // Style improvements
            searchContainer.addClass('enhanced-search');
            searchContainer.find('input[type="search"]').addClass('form-control');
            
            // Ensure the search input gets focus when clicked anywhere in the container
            searchContainer.on('click', function() {
                $(this).find('input[type="search"]').focus();
            });
        }
    }

    // Save product button in modal
    $('#saveProduct').on('click', function() {
        const form = document.getElementById('addProductForm');
        if (form.checkValidity()) {
            const formData = new FormData(form);
            const productData = Object.fromEntries(formData.entries());
            
            // Save product to backend
            saveProductToAPI(productData);
        } else {
            form.reportValidity();
        }
    });

    // Bulk actions handlers
    $('#bulkDelete').on('click', function() {
        // Get selected product IDs
        const selectedIds = [];
        $('.product-select:checked').each(function() {
            selectedIds.push($(this).val());
        });
        
        if (selectedIds.length > 0) {
            if (confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
                // Delete products from API
                deleteProductsFromAPI(selectedIds);
            }
        }
        
        $('#bulkActionsModal').modal('hide');
    });

    // Handle select all checkbox
    $('#selectAll').on('change', function() {
        const isChecked = this.checked;
        // Select all checkboxes in the table
        $('.product-select').prop('checked', isChecked);
        // Update bulk actions button state
        updateBulkActionsState();
    });

    // Handle individual checkbox changes
    $('#productsTable tbody').on('change', '.product-select', function() {
        updateBulkActionsState();
        // If not all checkboxes are checked, uncheck "Select All"
        if (!this.checked) {
            $('#selectAll').prop('checked', false);
        } else if ($('.product-select:checked').length === $('.product-select').length) {
            $('#selectAll').prop('checked', true);
        }
    });
});

function initStockManagement() {
    // Show loading indicators
    document.querySelectorAll('.loading-spinner').forEach(spinner => {
        spinner.classList.remove('d-none');
    });
    
    // Fetch data for stock management page
    fetchStockStats();
    fetchProducts();
}

// Fetch stock statistics from API
function fetchStockStats() {
    // In a real app, this would be an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        const stats = {
            totalProducts: 158,
            totalValue: '₹186,500',
            lowStockItems: 5,
            expiringItems: 3
        };
        
        // Update UI with stats
        updateElement('totalProducts', stats.totalProducts);
        updateElement('totalValue', stats.totalValue);
        updateElement('lowStockItems', stats.lowStockItems);
        updateElement('expiringItems', stats.expiringItems);
        
        // Hide related loading spinners
        document.querySelectorAll('.stats-container .loading-spinner').forEach(spinner => {
            spinner.classList.add('d-none');
        });
    }, 700);
}

// Fetch products from API
function fetchProducts() {
    // Show loading indicator for table
    const tableSpinner = document.querySelector('#productsTable-wrapper .loading-spinner');
    if (tableSpinner) tableSpinner.classList.remove('d-none');
    
    // In a real app, this would be an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        const products = [
            { id: 1, name: 'Samsung Galaxy S21', brand: 'Samsung', category: 'Mobile Phones', stock: 15, price: '₹1,200', value: '₹18,000', expiry: '2023-12-31', updated: '2023-08-15' },
            { id: 2, name: 'Apple iPhone 13', brand: 'Apple', category: 'Mobile Phones', stock: 8, price: '₹1,500', value: '₹12,000', expiry: '2023-12-31', updated: '2023-08-14' },
            { id: 3, name: 'Sony WH-1000XM4', brand: 'Sony', category: 'Headphones', stock: 20, price: '₹1,500', value: '₹30,000', expiry: '2024-05-15', updated: '2023-08-10' },
            { id: 4, name: 'OnePlus 9 Pro', brand: 'OnePlus', category: 'Mobile Phones', stock: 12, price: '₹1,200', value: '₹14,400', expiry: '2023-12-31', updated: '2023-08-05' },
            { id: 5, name: 'Bose QuietComfort 45', brand: 'Bose', category: 'Headphones', stock: 5, price: '₹1,400', value: '₹7,000', expiry: '2023-11-30', updated: '2023-08-02' },
            { id: 6, name: 'Dell XPS 15', brand: 'Dell', category: 'Laptops', stock: 7, price: '₹5,500', value: '₹38,500', expiry: '2025-01-15', updated: '2023-07-25' },
            { id: 7, name: 'Logitech MX Master 3', brand: 'Logitech', category: 'Computer Accessories', stock: 18, price: '₹600', value: '₹10,800', expiry: '2023-12-10', updated: '2023-07-20' },
            { id: 8, name: 'Samsung Galaxy Tab S7', brand: 'Samsung', category: 'Tablets', stock: 3, price: '₹3,500', value: '₹10,500', expiry: '2024-03-22', updated: '2023-07-18' },
            { id: 9, name: 'LG 4K UHD TV', brand: 'LG', category: 'Televisions', stock: 6, price: '₹7,500', value: '₹45,000', expiry: 'N/A', updated: '2023-07-15' },
            { id: 10, name: 'JBL Flip 5', brand: 'JBL', category: 'Speakers', stock: 6, price: '₹800', value: '₹4,800', expiry: '2024-06-30', updated: '2023-07-10' }
        ];
        
        // Populate table with fetched products
        const tableBody = document.querySelector('#productsTable tbody');
        if (tableBody) {
            tableBody.innerHTML = '';
            products.forEach(product => {
                addProductToFullTable(product);
            });
        }
        
        // Initialize DataTable after data is loaded
        initializeDataTableWithSearch();
        
        // Populate filter dropdowns with fetched data
        populateFilters(products);
        
        // Hide loading indicator
        if (tableSpinner) tableSpinner.classList.add('d-none');
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
        addProductToFullTable({
            id: Math.floor(Math.random() * 1000),
            name: productData.productName,
            brand: productData.brand,
            category: productData.category,
            stock: productData.stock,
            price: productData.price,
            expiry: productData.expiryDate,
            updated: new Date().toISOString().split('T')[0]
        });
        
        // Reinitialize DataTable
        initializeDataTableWithSearch();
        
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
        
        // Refresh stock stats
        fetchStockStats();
    }, 1000);
}

// Delete products from API
function deleteProductsFromAPI(productIds) {
    // Show loading notification
    showNotification('Deleting products...', 'info');
    
    // In a real app, this would be an API call
    // For now, we'll simulate with setTimeout
    setTimeout(() => {
        console.log('Products deleted:', productIds);
        
        // Update UI - remove deleted rows
        productIds.forEach(id => {
            $(`.product-select[value="${id}"]`).closest('tr').remove();
        });
        
        // Show success message
        showNotification(`${productIds.length} products deleted successfully`, 'success');
        
        // Reset bulk action state
        $('#selectAll').prop('checked', false);
        updateBulkActionsState();
        
        // Refresh stock stats
        fetchStockStats();
    }, 800);
}

// Parse and upload CSV file
function parseAndUploadCSV(file) {
    // Show loading notification
    showNotification('Processing CSV file...', 'info');
    
    // Create a FileReader to read the CSV
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            const products = parseCSVtoJSON(csvData);
            
            if (products.length === 0) {
                showNotification('No valid data found in the CSV file.', 'warning');
                return;
            }
            
            // In a real app, this would be an API call to save the products
            // For now, we'll simulate with setTimeout
            setTimeout(() => {
                console.log('CSV file processed:', file.name);
                console.log('Products to import:', products);
                
                // Clear table first
                const tableBody = document.querySelector('#productsTable tbody');
                if (tableBody) {
                    tableBody.innerHTML = '';
                }
                
                // Add each product to the table
                products.forEach(product => {
                    addProductToFullTable(product);
                });
                
                // Reinitialize DataTable
                initializeDataTableWithSearch();
                
                // Show success message
                showNotification(`CSV file processed successfully. ${products.length} products imported.`, 'success');
                
                // Refresh products and stats
                fetchStockStats();
            }, 1000);
        } catch (error) {
            console.error('Error parsing CSV:', error);
            showNotification('Error parsing CSV file. Please check the format.', 'danger');
        }
    };
    
    reader.onerror = function() {
        console.error('Error reading file');
        showNotification('Error reading file. Please try again.', 'danger');
    };
    
    // Read the file as text
    reader.readAsText(file);
}

// Parse CSV to JSON
function parseCSVtoJSON(csvData) {
    // Split the CSV into rows
    const rows = csvData.split('\n').filter(row => row.trim() !== '');
    
    if (rows.length < 2) {
        throw new Error('CSV must have a header row and at least one data row');
    }
    
    // Parse header row to get column names
    const header = rows[0].split(',').map(col => col.trim());
    
    // Map expected header fields to our internal field names
    const fieldMapping = {
        'name': ['name', 'product name', 'product_name', 'productname', 'title'],
        'brand': ['brand', 'manufacturer', 'company'],
        'category': ['category', 'type', 'product_type', 'producttype'],
        'stock': ['stock', 'quantity', 'count', 'inventory'],
        'price': ['price', 'cost', 'unit_price', 'unitprice'],
        'expiry': ['expiry', 'expiry_date', 'expirydate', 'expiration', 'expiration_date']
    };
    
    // Map header fields to our internal field names
    const columnMapping = {};
    header.forEach((col, index) => {
        const lowerCol = col.toLowerCase();
        for (const [internalField, possibleMatches] of Object.entries(fieldMapping)) {
            if (possibleMatches.includes(lowerCol)) {
                columnMapping[index] = internalField;
                break;
            }
        }
    });
    
    // Check if we have the minimum required fields
    const requiredFields = ['name', 'stock'];
    const missingFields = requiredFields.filter(field => 
        !Object.values(columnMapping).includes(field)
    );
    
    if (missingFields.length > 0) {
        throw new Error(`CSV is missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Parse data rows
    const products = [];
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue;
        
        // Split the row into columns
        // This is a simple split - a more robust solution would handle quoted fields
        const columns = rows[i].split(',').map(col => col.trim());
        
        // Create a product object
        const product = {
            id: Math.floor(Math.random() * 1000),
            updated: new Date().toISOString().split('T')[0]
        };
        
        // Map data from columns to product fields
        Object.entries(columnMapping).forEach(([index, field]) => {
            let value = columns[index] || '';
            
            // Convert data types
            if (field === 'stock') {
                value = parseInt(value) || 0;
            }
            
            product[field] = value;
        });
        
        // Set default values for missing fields
        if (!product.brand) product.brand = 'Unknown';
        if (!product.category) product.category = 'Other';
        if (!product.price) product.price = '₹0';
        if (!product.expiry) product.expiry = 'N/A';
        
        // Calculate value
        if (!product.value && product.stock && product.price) {
            product.value = calculateValue(product.stock, product.price);
        }
        
        products.push(product);
    }
    
    return products;
}

// Export products to CSV
function exportProductsToCSV() {
    // Show loading notification
    showNotification('Preparing CSV export...', 'info');
    
    try {
        // Get all products from the table
        const products = [];
        const rows = document.querySelectorAll('#productsTable tbody tr');
        
        rows.forEach(row => {
            // Skip hidden rows (filtered out)
            if (row.style.display === 'none') return;
            
            const product = {
                id: row.querySelector('.product-select').value,
                name: row.cells[1].textContent.trim(),
                brand: row.cells[2].textContent.trim(),
                category: row.cells[3].textContent.trim(),
                stock: parseInt(row.cells[4].textContent.trim()) || 0,
                price: row.cells[5].textContent.trim(),
                value: row.cells[6].textContent.trim(),
                expiry: row.cells[7].textContent.trim(),
                updated: row.cells[8].textContent.trim()
            };
            
            products.push(product);
        });
        
        if (products.length === 0) {
            showNotification('No products to export.', 'warning');
            return;
        }
        
        // Convert products to CSV
        const headers = ['ID', 'Name', 'Brand', 'Category', 'Stock', 'Price', 'Value', 'Expiry Date', 'Last Updated'];
        const csvContent = convertToCSV(products, headers);
        
        // Create and download the CSV file
        downloadCSV(csvContent, 'stock_inventory.csv');
        
        // Show success notification
        showNotification('Inventory exported to CSV successfully!', 'success');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showNotification('Error exporting to CSV. Please try again.', 'danger');
    }
}

// Convert array of objects to CSV format
function convertToCSV(objArray, headers) {
    // Add header row
    const csvRows = [headers.join(',')];
    
    // Add data rows
    objArray.forEach(item => {
        const values = [
            item.id,
            `"${item.name.replace(/"/g, '""')}"`, // Escape quotes in strings
            `"${item.brand.replace(/"/g, '""')}"`,
            `"${item.category.replace(/"/g, '""')}"`,
            item.stock,
            item.price,
            item.value,
            `"${item.expiry.replace(/"/g, '""')}"`,
            `"${item.updated.replace(/"/g, '""')}"`
        ];
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(csvContent, fileName) {
    // Create a blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    // Add to document, trigger click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function addProductToFullTable(product) {
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="checkbox" class="product-select" value="${product.id || Math.floor(Math.random() * 1000)}"></td>
        <td>${product.name || product.productName}</td>
        <td>${product.brand}</td>
        <td>${product.category}</td>
        <td class="stock-level">${product.stock}</td>
        <td>${product.price}</td>
        <td>${product.value || calculateValue(product.stock, product.price)}</td>
        <td>${product.expiry || product.expiryDate || 'N/A'}</td>
        <td>${product.updated || new Date().toISOString().split('T')[0]}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary edit-product" data-bs-toggle="tooltip" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-product" data-bs-toggle="tooltip" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(row);
    
    // Apply stock level styling
    const stockCell = row.querySelector('.stock-level');
    const stock = parseInt(stockCell.textContent);
    
    if (stock < 5) {
        stockCell.classList.add('text-danger');
        stockCell.innerHTML += ' <i class="fas fa-exclamation-circle" data-bs-toggle="tooltip" title="Critical low stock!"></i>';
    } else if (stock < 10) {
        stockCell.classList.add('text-warning');
        stockCell.innerHTML += ' <i class="fas fa-exclamation-triangle" data-bs-toggle="tooltip" title="Low stock alert!"></i>';
    }
    
    // Add event listeners for edit and delete buttons
    const editButton = row.querySelector('.edit-product');
    if (editButton) {
        editButton.addEventListener('click', function() {
            // In a real app, this would open the edit modal with pre-filled data
            console.log('Edit product:', product);
            showNotification('Edit functionality would open here', 'info');
        });
    }
    
    const deleteButton = row.querySelector('.delete-product');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            if (confirm(`Are you sure you want to delete ${product.name || product.productName}?`)) {
                // Delete from API
                deleteProductsFromAPI([product.id]);
            }
        });
    }
    
    // Initialize tooltips
    if (typeof bootstrap !== 'undefined') {
        const tooltips = row.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(el => new bootstrap.Tooltip(el));
    }
}

function calculateValue(stock, price) {
    // Remove currency symbol and commas
    const numericPrice = parseFloat(price.replace(/[^\d.]/g, ''));
    // Calculate value
    const value = stock * numericPrice;
    // Format as currency
    return '₹' + value.toLocaleString();
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
    
    // Add categories to product form modal
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
    const sortBy = document.getElementById('sortBy').value;
    
    const tableRows = document.querySelectorAll('#productsTable tbody tr');
    
    tableRows.forEach(row => {
        const brand = row.cells[2].textContent;
        const category = row.cells[3].textContent;
        const stock = parseInt(row.cells[4].textContent);
        
        let showRow = true;
        
        if (brandFilter && brand !== brandFilter) {
            showRow = false;
        }
        
        if (categoryFilter && category !== categoryFilter) {
            showRow = false;
        }
        
        if (stockFilter === 'low' && stock >= 10) {
            showRow = false;
        } else if (stockFilter === 'outOfStock' && stock > 0) {
            showRow = false;
        } else if (stockFilter === 'expiring') {
            // Check if the product is expiring soon
            const expiryDate = row.cells[7].textContent;
            if (expiryDate === 'N/A') {
                showRow = false;
            } else {
                const expiry = new Date(expiryDate);
                const today = new Date();
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(today.getDate() + 30);
                
                if (expiry > thirtyDaysFromNow) {
                    showRow = false;
                }
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
    
    // Apply sorting if needed
    if (sortBy) {
        sortTable(sortBy);
    }
}

function sortTable(column) {
    // Get column index
    let columnIndex;
    switch (column) {
        case 'name':
            columnIndex = 1;
            break;
        case 'stock':
            columnIndex = 4;
            break;
        case 'price':
            columnIndex = 5;
            break;
        case 'expiry':
            columnIndex = 7;
            break;
        default:
            return;
    }
    
    // For a more complex sorting, you would use the DataTable API if available
    if ($.fn.DataTable && $.fn.DataTable.isDataTable('#productsTable')) {
        $('#productsTable').DataTable().order([columnIndex, 'asc']).draw();
        return;
    }
    
    // Otherwise, do manual sorting
    const tableBody = document.querySelector('#productsTable tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        let aValue = a.cells[columnIndex].textContent;
        let bValue = b.cells[columnIndex].textContent;
        
        // Convert to numbers for numeric columns
        if (column === 'stock' || column === 'price') {
            aValue = parseFloat(aValue.replace(/[^\d.-]/g, ''));
            bValue = parseFloat(bValue.replace(/[^\d.-]/g, ''));
        } else if (column === 'expiry') {
            // Handle 'N/A' values
            if (aValue === 'N/A') return 1;
            if (bValue === 'N/A') return -1;
            
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
    });
    
    // Clear and re-append rows
    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
}

function updateBulkActionsState() {
    const selectedCount = $('.product-select:checked').length;
    $('#selectedCount').text(selectedCount);
    
    // Enable or disable the bulk actions button
    const bulkActionsBtn = document.getElementById('bulkActionsBtn');
    if (bulkActionsBtn) {
        if (selectedCount > 0) {
            bulkActionsBtn.classList.remove('disabled');
        } else {
            bulkActionsBtn.classList.add('disabled');
        }
    }
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
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.maxWidth = '400px';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 3000);
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Function to initialize and update live date time
function initializeLiveDateTime() {
    const dateTimeElement = document.getElementById('currentDateTime');
    if (!dateTimeElement) return;

    // Function to update date & time
    function updateDateTime() {
        const now = new Date();
        
        // Format options for date and time
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        
        const formattedDateTime = now.toLocaleString('en-US', options);
        dateTimeElement.textContent = formattedDateTime;
    }
    
    // Update immediately
    updateDateTime();
    
    // Update every second
    setInterval(updateDateTime, 1000);
}
