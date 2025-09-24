document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const submitButton = document.getElementById('submit-button');
    const API_BASE_URL = 'https://lgu-helpdesk-copy.onrender.com';

    // --- Modal Elements & Helpers ---
    const messageModal = document.getElementById('message-modal');
    const modalTitle = document.getElementById('message-modal-title');
    const modalText = document.getElementById('message-modal-text');
    const modalIconContainer = document.getElementById('modal-icon-container');

    const successIcon = `<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;
    const errorIcon = `<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>`;

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

    // --- Email Validation ---
    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // --- Enhanced Validation ---
        const email = emailInput.value;
        if (!validateEmail(email)) {
            showModal('Invalid Input', 'Please enter a valid email address.', true);
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading loading-spinner"></span> Sending...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred.');
            }

            // Show success message in the modal
            showModal('Request Sent', data.message, false, 3000); // Auto-closes after 3 seconds
            form.reset();

        } catch (error) {
            // Show error message in the modal
            showModal('Request Failed', error.message, true);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send Reset Link';
        }
    });
});