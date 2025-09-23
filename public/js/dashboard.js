document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const API_ROOT_URL = 'https://lgu-helpdesk-copy.onrender.com';
    const LOGIN_PAGE_URL = 'index.html';

    // --- DOM ELEMENTS ---
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const signoutButton = document.getElementById('signout-button');
    const userInfoDiv = document.getElementById('user-info');
    const itHelpdeskLink = document.getElementById('it-helpdesk-link');

    // --- UI FUNCTIONS ---
    const updateUserInfo = (user) => {
        userInfoDiv.innerHTML = `
            <div class="font-semibold text-sm text-gray-800 truncate">${user.name}</div>
            <div class="text-xs text-gray-500">${user.role}</div>
        `;
    };

    const setupAppLinks = () => {
        // The backend handles the SSO redirect, so we just point to the endpoint.
        // The 'env' query parameter can be used to switch between dev/prod GSO environments.
        itHelpdeskLink.href = `${API_ROOT_URL}/api/auth/sso/redirect/gso?env=prod`;
        // Note: You can add logic here to point to '?env=dev' based on the portal's hostname if needed.
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        // Toggle user menu visibility
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('hidden');
        });

        // Sign out functionality
        signoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_ROOT_URL}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include', // Crucial for sending the HttpOnly cookie
                });

                if (response.ok) {
                    window.location.href = LOGIN_PAGE_URL;
                } else {
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('An error occurred during logout.');
            }
        });

        // Close dropdown if clicking anywhere else on the page
        window.addEventListener('click', () => {
            if (!userMenu.classList.contains('hidden')) {
                userMenu.classList.add('hidden');
            }
        });
    };

    // --- MAIN AUTHENTICATION & INITIALIZATION FLOW ---
    const initializeDashboard = async () => {
        try {
            // Make a request to a protected endpoint to get the current user's data.
            // 'credentials: include' is essential for sending the HttpOnly cookie to the backend.
            const response = await fetch(`${API_ROOT_URL}/api/auth/me`, {
                credentials: 'include',
            });

            if (!response.ok) {
                // If the cookie is invalid, expired, or missing, the backend returns 401 Unauthorized.
                // Redirect the user to the login page.
                console.log('User not authenticated. Redirecting to login.');
                window.location.href = LOGIN_PAGE_URL;
                return;
            }

            const user = await response.json();
            
            // If authentication is successful, populate the UI
            updateUserInfo(user);
            setupAppLinks();
            setupEventListeners();
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = LOGIN_PAGE_URL;
        }
    };

    initializeDashboard();
});