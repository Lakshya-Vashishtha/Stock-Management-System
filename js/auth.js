document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update forms
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${target}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Form validation and submission
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Basic validation
            if (!email || !password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }

            // Mock login - replace with actual API call later
            console.log('Login attempt:', { email, password });
            showAlert('Login successful!', 'success');
            // Redirect to dashboard (will be implemented later)
            // window.location.href = 'dashboard.html';
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const businessType = document.getElementById('businessType').value;
            
            // Basic validation
            if (!email || !password || !confirmPassword || !businessType) {
                showAlert('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'error');
                return;
            }

            if (password.length < 6) {
                showAlert('Password must be at least 6 characters long', 'error');
                return;
            }

            // Mock registration - replace with actual API call later
            console.log('Registration attempt:', { email, password, businessType });
            showAlert('Registration successful!', 'success');
            
            // Switch to login form after successful registration
            document.querySelector('[data-tab="login"]').click();
        });
    }

    // Alert function
    function showAlert(message, type) {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
        alertDiv.setAttribute('role', 'alert');
        
        // Add message and close button
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to form
        const form = type === 'error' ? 
            (document.querySelector('.auth-form.active') || document.body) : 
            document.body;
        
        form.insertBefore(alertDiv, form.firstChild);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    // Password visibility toggle (optional enhancement)
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const parent = input.parentElement;
        const toggleBtn = document.createElement('span');
        toggleBtn.className = 'input-group-text';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.style.cursor = 'pointer';
        
        toggleBtn.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            toggleBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
        
        parent.appendChild(toggleBtn);
    });
}); 