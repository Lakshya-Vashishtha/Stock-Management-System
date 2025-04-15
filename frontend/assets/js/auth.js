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
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Basic validation
            if (!email || !password) {
                showAlert('Please fill in all fields', 'error');
                resetButton();
                return;
            }

            // Simulate API call with timeout
            setTimeout(() => {
                // In a real app, this would be an API call
                console.log('Login attempt:', { email, password, rememberMe });
                
                // Mock user data
                const userData = {
                    id: 1,
                    email: email,
                    name: 'John Doe',
                    role: 'admin',
                    businessType: 'Electronics'
                };
                
                // Store in localStorage for persistence
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('authToken', 'mock-jwt-token-' + Math.random().toString(36).substr(2));
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'frontend/pages/dashboard/dashboard.html';
                }, 1000);
            }, 1500);
            
            function resetButton() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
            
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const businessType = document.getElementById('businessType').value;
            
            // Basic validation
            if (!email || !password || !confirmPassword || !businessType) {
                showAlert('Please fill in all fields', 'error');
                resetButton();
                return;
            }

            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'error');
                resetButton();
                return;
            }

            if (password.length < 6) {
                showAlert('Password must be at least 6 characters long', 'error');
                resetButton();
                return;
            }

            // Simulate API call with timeout
            setTimeout(() => {
                // In a real app, this would be an API call
                console.log('Registration attempt:', { email, password, businessType });
                
                showAlert('Registration successful!', 'success');
                resetButton();
                
                // Switch to login form after successful registration
                setTimeout(() => {
                    document.querySelector('[data-tab="login"]').click();
                }, 1000);
            }, 1500);
            
            function resetButton() {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Check if user is already logged in
    const userData = localStorage.getItem('user');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (userData && rememberMe) {
        // Auto redirect to dashboard
        window.location.href = 'frontend/pages/dashboard/dashboard.html';
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
        const form = document.querySelector('.auth-form.active') || document.body;
        form.insertBefore(alertDiv, form.firstChild);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => {
                alertDiv.remove();
            }, 300);
        }, 3000);
    }

    // Password visibility toggle
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