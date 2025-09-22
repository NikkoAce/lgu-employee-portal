document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageArea = document.getElementById('message-area');
    const submitButton = document.getElementById('submit-button');
    const loginLinkContainer = document.getElementById('login-link-container');
    const API_BASE_URL = 'https://lgu-helpdesk-copy.onrender.com';

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        form.innerHTML = '';
        messageArea.innerHTML = `<p class="text-red-600">No reset token found. Please request a new password reset link.</p>`;
        loginLinkContainer.classList.remove('hidden');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        messageArea.innerHTML = '';
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            messageArea.innerHTML = `<p class="text-red-600">Passwords do not match.</p>`;
            return;
        }

        if (password.length < 6) {
            messageArea.innerHTML = `<p class="text-red-600">Password must be at least 6 characters long.</p>`;
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Resetting...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An unknown error occurred.');
            }

            messageArea.innerHTML = `<p class="text-green-600">${data.message}</p>`;
            form.style.display = 'none';
            loginLinkContainer.classList.remove('hidden');
        } catch (error) {
            messageArea.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
        }
    });
});