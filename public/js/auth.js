document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // The URL of your deployed IT Helpdesk backend API
    const API_BASE_URL = 'https://lgu-helpdesk-copy.onrender.com';

    // --- HELPER: PASSWORD TOGGLE VISIBILITY ---
    const setupPasswordToggle = (toggleBtnId, passwordInputId, eyeIconId, eyeSlashIconId) => {
        const toggleButton = document.getElementById(toggleBtnId);
        const passwordInput = document.getElementById(passwordInputId);
        const eyeIcon = document.getElementById(eyeIconId);
        const eyeSlashIcon = document.getElementById(eyeSlashIconId);

        if (toggleButton && passwordInput && eyeIcon && eyeSlashIcon) {
            toggleButton.addEventListener('click', () => {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    eyeIcon.classList.add('hidden');
                    eyeSlashIcon.classList.remove('hidden');
                } else {
                    passwordInput.type = 'password';
                    eyeIcon.classList.remove('hidden');
                    eyeSlashIcon.classList.add('hidden');
                }
            });
        }
    };

    // --- LOGIN FORM LOGIC ---
    if (loginForm) {
        const loginMessage = document.getElementById('login-message');

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
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    // --- REGISTRATION FORM LOGIC ---
    if (registerForm) {
        const registerMessage = document.getElementById('register-message');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // --- Password Match Validation ---
            if (passwordInput.value !== confirmPasswordInput.value) {
                registerMessage.textContent = 'Error: Passwords do not match.';
                registerMessage.className = 'text-sm text-red-600';
                return; // Stop the submission
            }

            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = 'Registering...';
            registerMessage.textContent = '';

            const formData = new FormData(registerForm);
            const registerData = Object.fromEntries(formData.entries());
            // We don't need to send the confirmation password to the backend
            delete registerData.confirmPassword;

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

    // --- INITIALIZE PASSWORD TOGGLES ---
    // For Login Form
    setupPasswordToggle(
        'login-toggle-password', 
        'login-password', 
        'login-eye-icon', 
        'login-eye-slash-icon'
    );
    // For Register Form
    setupPasswordToggle(
        'register-toggle-password', 
        'register-password', 
        'register-eye-icon', 
        'register-eye-slash-icon'
    );
    // For Register Form's Confirm Password
    setupPasswordToggle(
        'register-toggle-confirm-password',
        'register-confirm-password',
        'register-confirm-eye-icon',
        'register-confirm-eye-slash-icon'
    );
});
