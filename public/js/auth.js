document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // The URL of your deployed IT Helpdesk backend API
    const API_BASE_URL = 'https://lgu-helpdesk-api.onrender.com';

    // --- LOGIN FORM LOGIC ---
    if (loginForm) {
        const loginMessage = document.getElementById('login-message');
        const employeeIdInput = document.getElementById('login-employeeId');
        const employmentTypeSelect = document.getElementById('login-employmentType');

        const updateLoginInput = (type) => {
            if (type === 'Permanent') {
                employeeIdInput.placeholder = '0-00-000-000';
            } else { // Job Order
                employeeIdInput.placeholder = 'JO-00-000-00000';
            }
            employeeIdInput.value = '';
        };
        
        updateLoginInput(employmentTypeSelect.value);
        employmentTypeSelect.addEventListener('change', () => updateLoginInput(employmentTypeSelect.value));

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

        // Set loading state
        submitButton.disabled = true;
        submitButton.innerHTML = 'Signing In...';
        loginMessage.textContent = '';
            const formData = new FormData(loginForm);
            const loginData = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });
                if (!response.ok) throw new Error((await response.json()).message);
                const { token } = await response.json();
                localStorage.setItem('portalAuthToken', token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                loginMessage.textContent = `Error: ${error.message}`;
            }
        });
    }

    // --- REGISTRATION FORM LOGIC ---
    if (registerForm) {
        const registerMessage = document.getElementById('register-message');
        const employeeIdInput = document.getElementById('register-employeeId');
        const employmentTypeSelect = document.getElementById('register-employmentType');

        const updateRegisterInput = (type) => {
             if (type === 'Permanent') {
                employeeIdInput.placeholder = '0-00-000-000';
            } else { // Job Order
                employeeIdInput.placeholder = 'JO-00-000-00000';
            }
            employeeIdInput.value = '';
        };

        updateRegisterInput(employmentTypeSelect.value);
        employmentTypeSelect.addEventListener('change', () => updateRegisterInput(employmentTypeSelect.value));

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = 'Registering...';
            registerMessage.textContent = '';

            const formData = new FormData(registerForm);
            const registerData = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerData)
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Registration failed.');
                }
                
                registerMessage.textContent = 'Registration successful! Please sign in.';
                registerMessage.className = 'text-sm text-green-600';
                registerForm.reset();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);

            } catch (error) {
                registerMessage.textContent = `Error: ${error.message}`;
                registerMessage.className = 'text-sm text-red-600';
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Register Account';
            }
        });
    }
});
