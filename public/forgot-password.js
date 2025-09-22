document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const messageArea = document.getElementById('message-area');
    const submitButton = document.getElementById('submit-button');
    const API_BASE_URL = 'https://lgu-helpdesk-copy.onrender.com';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        messageArea.innerHTML = '';

        const email = emailInput.value;

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

            messageArea.innerHTML = `<p class="text-green-600">${data.message}</p>`;
            form.reset();
        } catch (error) {
            messageArea.innerHTML = `<p class="text-red-600">Error: ${error.message}</p>`;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Reset Link';
        }
    });
});