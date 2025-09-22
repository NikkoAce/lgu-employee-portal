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

    function showErrorModal(message, title = 'Login Failed') {
        if (errorModal && errorModalMessage && errorModalTitle) {
            errorModalTitle.textContent = title;
            errorModalMessage.textContent = message;
            errorModal.showModal();
        }
    }

    if (successModalCloseBtn) {
        // This button is only on the index.html success modal.
        // When clicked, the modal closes via the form[method="dialog"] attribute.
        // This listener just handles the extra step of switching the panel back.
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

    // --- NEW: PANEL TOGGLING LOGIC ---
    const container = document.getElementById('container');
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');

    if (container && signUpButton && signInButton) {
        signUpButton.addEventListener('click', () => {
            container.classList.add('right-panel-active');
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove('right-panel-active');
        });
    }

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

        const clearPasswordError = () => {
            if (passwordInput.classList.contains('border-red-500')) {
                passwordInput.classList.remove('border-red-500');
                confirmPasswordInput.classList.remove('border-red-500');
                registerMessage.textContent = '';
            }
        };
        
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) passwordInput.addEventListener('input', clearPasswordError);
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', clearPasswordError);

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const registerMessage = document.getElementById('register-message');
            registerMessage.textContent = ''; // Clear previous inline messages

            if (passwordInput.value !== confirmPasswordInput.value) {
                registerMessage.textContent = 'Passwords do not match.';
                registerMessage.className = 'text-sm text-red-600';
                passwordInput.classList.add('border-red-500');
                confirmPasswordInput.classList.add('border-red-500');
                return; // Stop the submission
            }

            // --- NEW: Privacy Consent Validation ---
            const privacyConsentCheckbox = document.getElementById('privacy-consent');
            if (!privacyConsentCheckbox || !privacyConsentCheckbox.checked) {
                registerMessage.textContent = 'You must agree to the privacy policy to continue.';
                registerMessage.className = 'text-sm text-red-600';
                privacyConsentCheckbox.focus();
                return; // Stop the submission
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
