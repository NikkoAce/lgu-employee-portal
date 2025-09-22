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

    if (successModalCloseBtn) {
        // When the success modal is closed, switch the panel back to the sign-in view.
        successModalCloseBtn.addEventListener('click', () => {
            if (container) container.classList.remove('right-panel-active');
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

    // --- NEW: FUNCTION TO POPULATE OFFICE DROPDOWN ---
    const populateOfficesDropdown = async () => {
        const officeSelect = document.getElementById('register-office');
        if (!officeSelect) return;

        try {
            // Fetch the list of offices from the GSO backend's new public endpoint
            const response = await fetch(`${GSO_API_BASE_URL}/api/offices/public`);
            if (!response.ok) {
                throw new Error('Could not load office list.');
            }
            const offices = await response.json();

            // Clear current options and add a default
            officeSelect.innerHTML = '<option value="">Select an Office...</option>';

            // Populate the dropdown with fetched offices
            offices.forEach(office => {
                const option = document.createElement('option');
                option.value = office.name;
                option.textContent = office.name;
                officeSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error fetching offices:', error);
            officeSelect.innerHTML = '<option value="">Could not load offices</option>';
        }
    };

    // --- LOGIN FORM LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const loginData = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loginData)
                });
                const result = await response.json(); // Read the body ONCE
                if (!response.ok) {
                    throw new Error(result.message || 'Login failed.'); // Use the parsed result for the error
                }
                const { token } = result; // Destructure from the result on success
                localStorage.setItem('portalAuthToken', token);
                window.location.href = 'dashboard.html';
            } catch (error) {
                showErrorModal(error.message, 'Login Failed');
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
            }
        });
    }

    // If we are on the registration page, populate the offices dropdown
    if (registerForm) {
        populateOfficesDropdown();
    }
});
