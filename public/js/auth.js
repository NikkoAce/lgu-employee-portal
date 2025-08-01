document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const employeeIdInput = document.getElementById('login-employeeId');
    const employmentTypeSelect = document.getElementById('login-employmentType');

    // The URL of your deployed IT Helpdesk backend API
    const API_BASE_URL = 'https://lgu-helpdesk-copy.onrender.com';

    // Function to update Employee ID input attributes based on employment type
    const updateEmployeeIdInput = (type) => {
        if (type === 'Permanent') {
            employeeIdInput.placeholder = '0-00-000-000';
            employeeIdInput.pattern = '\\d{1}-\\d{2}-\\d{3}-\\d{3}';
            employeeIdInput.maxLength = 12;
            employeeIdInput.title = 'Format: 0-00-000-000';
        } else { // Job Order
            employeeIdInput.placeholder = 'JO-00-000-00000';
            employeeIdInput.pattern = 'JO-\\d{2}-\\d{3}-\\d{5}';
            employeeIdInput.maxLength = 15;
            employeeIdInput.title = 'Format: JO-00-000-00000';
        }
        employeeIdInput.value = ''; // Clear input on change
    };
    
    // Initialize on page load
    updateEmployeeIdInput(employmentTypeSelect.value);

    // Add event listener for changes
    employmentTypeSelect.addEventListener('change', () => updateEmployeeIdInput(employmentTypeSelect.value));

    // Handle form submission
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed.');
            }

            const { token } = await response.json();
            // Store the token to be used by the dashboard
            localStorage.setItem('portalAuthToken', token);
            
            // Redirect to the dashboard on successful login
            window.location.href = 'dashboard.html';

        } catch (error) {
            loginMessage.textContent = `Error: ${error.message}`;
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});
