document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitButton = document.getElementById('submit-button');
    const loginLinkContainer = document.getElementById('login-link-container');
    // --- Modal Elements & Helpers ---
    const messageModal = document.getElementById('message-modal');
    const modalTitle = document.getElementById('message-modal-title');
    const modalText = document.getElementById('message-modal-text');
    const modalIconContainer = document.getElementById('modal-icon-container');

    const successIcon = `<svg class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;
    const errorIcon = `<svg class="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>`;

    function showModal(title, message, isError = false, autoCloseDelay = null) {
        if (!messageModal) return;
        modalTitle.textContent = title;
        modalText.textContent = message;
        if (isError) {
            modalIconContainer.innerHTML = errorIcon;
            modalIconContainer.className = 'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100';
        } else {
            modalIconContainer.innerHTML = successIcon;
            modalIconContainer.className = 'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100';
        }
        messageModal.showModal();

        // If it's not an error and a delay is provided, close the modal automatically
        if (!isError && typeof autoCloseDelay === 'number') {
            setTimeout(() => {
                // Check if the modal is still open before trying to close it
                if (messageModal.open) messageModal.close();
            }, autoCloseDelay);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        form.innerHTML = '';
        showModal('Invalid Link', 'No reset token found. Please request a new password reset link.', true);
        loginLinkContainer.classList.remove('hidden');
        return;
    }

    // --- Password Validation & Toggle ---
    const validatePasswordStrength = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    };

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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            showModal('Validation Error', 'Passwords do not match.', true);
            return;
        }

        if (!validatePasswordStrength(password)) {
            showModal('Weak Password', 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.', true);
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading loading-spinner"></span> Resetting...';

        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred.');
            }

            showModal('Success', data.message, false, 3000); // Auto-closes after 3 seconds
            form.style.display = 'none';
            loginLinkContainer.classList.remove('hidden');
        } catch (error) {
            showModal('Error', error.message, true);
            submitButton.disabled = false;
            submitButton.innerHTML = 'Reset Password';
        }
    });

    // Initialize password visibility toggles
    setupPasswordToggle('toggle-password', 'password', 'eye-icon', 'eye-slash-icon');
    setupPasswordToggle('toggle-confirm-password', 'confirm-password', 'confirm-eye-icon', 'confirm-eye-slash-icon');
});