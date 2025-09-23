document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // The URL of your deployed IT Helpdesk backend API
    const API_BASE_URL = 'https://lgu-helpdesk-copy.onrender.com';
    // NEW: The URL for your GSO backend, which manages shared data like offices.
    const GSO_API_BASE_URL = 'https://gso-backend-mns8.onrender.com';

    // --- NEW: MODAL HELPER FUNCTIONS ---
    const errorModal = document.getElementById('error-modal');
    const errorModalMessage = document.getElementById('error-modal-message');
    const errorModalTitle = document.getElementById('error-modal-title');
    const successModal = document.getElementById('success-modal');
    const successModalCloseBtn = document.getElementById('success-modal-close-btn');
    const container = document.getElementById('container');

    function showErrorModal(message, title = 'Login Failed') {
        if (errorModal && errorModalMessage && errorModalTitle) {
            errorModalTitle.textContent = title;
            errorModalMessage.textContent = message;
            errorModal.showModal();
        }
    }

    // --- NEW: BUTTON LOADING STATE HELPERS ---
    function showButtonLoading(button) {
        button.disabled = true;
        // Store original text in a data attribute to retrieve it later
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="loading loading-spinner"></span>';
    }

    function resetButton(button) {
        if (button && button.dataset.originalText) {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText;
        }
    }

    if (successModalCloseBtn) {
        // When the success modal is closed, switch the panel back to the sign-in view.
        successModalCloseBtn.addEventListener('click', () => {
            if (container) {
                container.classList.remove('right-panel-active');
            }
            // Also reset the registration form to clear the fields for the next user.
            if (registerForm) {
                registerForm.reset();
            }
        });
    }

    // Helper to show the success modal
    function showSuccessModal() {
        if (successModal) {
            successModal.showModal();
        }
    }

    // --- PANEL TOGGLING LOGIC ---
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const signUpButtonMobile = document.getElementById('signUpMobile');
    const signInButtonMobile = document.getElementById('signInMobile');

    if (container && signUpButton) {
        signUpButton.addEventListener('click', () => {
            container.classList.add('right-panel-active');
        });
    }
    
    if (container && signInButton) {
        signInButton.addEventListener('click', () => {
            container.classList.remove('right-panel-active');
        });
    }

    // --- NEW: Mobile Toggle Logic ---
    // This makes the "Sign Up" and "Sign In" links work on mobile screens.
    if (container && signUpButtonMobile) {
        signUpButtonMobile.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default button behavior
            container.classList.add('right-panel-active');
        });
    }

    if (container && signInButtonMobile) {
        signInButtonMobile.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default button behavior
            container.classList.remove('right-panel-active');
        });
    }

    // --- NEW: HELPER FOR PASSWORD TOGGLE VISIBILITY ---
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

    // --- NEW: FUNCTION TO POPULATE OFFICE DROPDOWN ---
    const populateOfficesDropdown = async () => {
        const officeContainer = document.getElementById('office-select-container');
        if (!officeContainer) return;

        try {
            // Fetch the list of offices from the GSO backend's new public endpoint
            const response = await fetch(`${GSO_API_BASE_URL}/api/offices/public`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const offices = await response.json();

            // Create the new select element
            const officeSelect = document.createElement('select');
            officeSelect.id = 'register-office';
            officeSelect.name = 'office';
            officeSelect.required = true;
            officeSelect.className = 'select select-bordered w-full text-sm';

            // Add a default placeholder option
            officeSelect.innerHTML = '<option value="">Select an Office...</option>';

            // Populate the dropdown with fetched offices
            offices.forEach(office => {
                const option = document.createElement('option');
                option.value = office.name;
                option.textContent = office.name;
                officeSelect.appendChild(option);
            });

            // Replace the skeleton loader with the populated select element
            officeContainer.innerHTML = '';
            officeContainer.appendChild(officeSelect);

        } catch (error) {
            console.error('Error fetching offices:', error);
            // In case of an error, replace the skeleton with a disabled select showing the error
            officeContainer.innerHTML = `
                <select class="select select-bordered select-error w-full text-sm" disabled>
                    <option>Could not load offices</option>
                </select>
            `;
        }
    };

    // --- LOGIN FORM LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const submitButton = loginForm.querySelector('button[type="submit"]');
            showButtonLoading(submitButton);

            const formData = new FormData(loginForm);
            const loginData = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    credentials: 'include', // IMPORTANT: This tells the browser to send cookies
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });

                if (!response.ok) {
                    const result = await response.json(); // Read the error body
                    throw new Error(result.message || 'Login failed.'); // Use the parsed result for the error
                }
                
                // On success, the cookie is set by the server. No need to handle a token here.
                window.location.href = 'dashboard.html';
            } catch (error) {
                showErrorModal(error.message, 'Login Failed');
            } finally {
                // This ensures the button is reset if login fails
                resetButton(submitButton);
            }
        });
    }

    // --- REGISTRATION FORM LOGIC ---
    if (registerForm) {
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        const registerMessage = document.getElementById('register-message');

        // --- NEW: Validation Helper Functions ---
        const validateEmail = (email) => {
            // Basic email regex
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        };

        const validatePasswordStrength = (password) => {
            // Requires 8+ chars, 1 uppercase, 1 lowercase, 1 number
            const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
            return re.test(password);
        };

        const clearAllErrors = () => {
            if (registerMessage) registerMessage.textContent = '';
            if (emailInput) emailInput.classList.remove('input-error');
            if (passwordInput) passwordInput.classList.remove('input-error');
            if (confirmPasswordInput) confirmPasswordInput.classList.remove('input-error');
        };
        
        // Clear errors when user starts typing in any of the validated fields
        if (emailInput) emailInput.addEventListener('input', clearAllErrors);
        if (passwordInput) passwordInput.addEventListener('input', clearAllErrors);
        if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', clearAllErrors);

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearAllErrors(); // Clear previous errors on new submission

            // --- NEW: Email Format Validation ---
            if (!validateEmail(emailInput.value)) {
                registerMessage.textContent = 'Please enter a valid email address.';
                registerMessage.className = 'text-sm text-error';
                emailInput.classList.add('input-error');
                return;
            }

            // --- NEW: Password Strength Validation ---
            if (!validatePasswordStrength(passwordInput.value)) {
                registerMessage.textContent = 'Password must be 8+ characters with uppercase, lowercase, and a number.';
                registerMessage.className = 'text-sm text-error';
                passwordInput.classList.add('input-error');
                return;
            }

            if (passwordInput.value !== confirmPasswordInput.value) {
                registerMessage.textContent = 'Passwords do not match.';
                registerMessage.className = 'text-sm text-error';
                passwordInput.classList.add('input-error');
                confirmPasswordInput.classList.add('input-error');
                return;
            }

            // --- NEW: Privacy Consent Validation ---
            const privacyConsentCheckbox = document.getElementById('privacy-consent');
            if (!privacyConsentCheckbox || !privacyConsentCheckbox.checked) {
                registerMessage.textContent = 'You must agree to the privacy policy to continue.';
                registerMessage.className = 'text-sm text-error';
                privacyConsentCheckbox.focus();
                return;
            }

            const formData = new FormData(registerForm);
            const registerData = Object.fromEntries(formData.entries());
            // We don't need to send the confirmation password to the backend
            delete registerData.confirmPassword;
            delete registerData['privacy-consent'];

            const submitButton = registerForm.querySelector('button[type="submit"]');
            showButtonLoading(submitButton);

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
                
                // On success, show the dedicated success modal
                showSuccessModal();

            } catch (error) {
                // On API error, use the consistent error modal
                showErrorModal(error.message, 'Registration Failed');
            } finally {
                // This ensures the button is reset on success or failure
                resetButton(submitButton);
            }
        });
    }

    // --- INITIALIZE PASSWORD TOGGLES & DYNAMIC DATA ---
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

    // If we are on the registration page, populate the offices dropdown
    if (registerForm) {
        populateOfficesDropdown();
    }
});
