// FILE: /_LGU EMPLOYEE PORTAL/public/js/dashboard.js (UPDATED)

/**
 * Fetches the current user's data from the backend, updates the UI,
 * and sets up application links. Redirects to login if not authenticated.
 */
async function initializeDashboard() {
    // The URL of your deployed IT Helpdesk backend API
    const API_BASE_URL = 'https://lgu-helpdesk-copy.onrender.com';
    const IT_HELPDESK_URL = 'https://lgu-ithelpdesk.netlify.app/app.html';
    const BUILDING_PERMIT_URL = 'https://lgu-engr-permit.netlify.app/index.html'; 
    const INFORMAL_SETTLER_URL = 'https://lgu-urban-poor.netlify.app/dashboard.html';
    const GSO_PROD_URL = 'https://lgudaet-gso-system.netlify.app/';
    const GSO_DEV_URL = 'https://dev-gso-system.netlify.app/'; // Your development link

    try {
        // Fetch user data from the new /me endpoint. The browser will automatically send the secure cookie.
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            credentials: 'include', // This is crucial for sending HttpOnly cookies
        });

        if (!response.ok) {
            // If the cookie is invalid or expired, the server will return an error (e.g., 401).
            // Redirect to the login page.
            window.location.href = 'index.html';
            return;
        }

        const currentUser = await response.json();

        // --- Display User Info ---
        const userInfo = document.getElementById('user-info');
        if (userInfo && currentUser) {
            userInfo.innerHTML = `
                <p class="text-sm font-semibold text-gray-800">${currentUser.name}</p>
                <p class="text-xs text-gray-500">${currentUser.office}</p>
            `;
        }

        // --- Set Up Application Links (Single Sign-On) ---
        // IMPORTANT: The old SSO method of passing a token in the URL is no longer possible
        // because the token is in a secure HttpOnly cookie. The links below will now navigate
        // without authentication. A server-side SSO proxy is needed for a complete solution.
        const appsContainer = document.getElementById('apps-container');
        
        if (appsContainer) {
            // --- Link existing applications ---
            const existingApps = [
                { id: 'it-helpdesk-link', url: IT_HELPDESK_URL },
                { id: 'building-permit-link', url: BUILDING_PERMIT_URL },
                { id: 'informal-settler-link', url: INFORMAL_SETTLER_URL }
            ];
            existingApps.forEach(app => {
                const linkElement = document.getElementById(app.id);
                if (linkElement && app.url) {
                    linkElement.href = app.url; // No token attached
                }
            });
            
            // Clear any dynamically added links before re-adding them to prevent duplicates on bfcache restore.
            const dynamicLinks = appsContainer.querySelectorAll('.dynamic-link');
            dynamicLinks.forEach(link => link.remove());

            // --- GSO System Link (Production) ---
            // NEW: Point to the backend SSO redirect endpoint instead of the GSO app directly.
            const gsoProdSsoUrl = `${API_BASE_URL}/api/auth/sso/redirect/gso?env=prod`;
            const gsoLinkHTML = `
                <a href="${gsoProdSsoUrl}" class="dynamic-link flex items-start space-x-4 rounded-lg bg-white p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <div class="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg sm:text-xl font-semibold text-gray-800">GSO Asset & Supply System</h3>
                        <p class="mt-1 text-sm sm:text-base text-gray-600">Manage property, view assets, and request supplies.</p>
                    </div>
                </a>`;
            
            appsContainer.insertAdjacentHTML('beforeend', gsoLinkHTML);

            // --- GSO System Link (Development) ---
            // NEW: Point to the backend SSO redirect endpoint instead of the GSO app directly.
            const gsoDevSsoUrl = `${API_BASE_URL}/api/auth/sso/redirect/gso?env=dev`;
            const gsoDevLinkHTML = `
                <a href="${gsoDevSsoUrl}" class="dynamic-link flex items-start space-x-4 rounded-lg bg-white p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <div class="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-red-100 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg sm:text-xl font-semibold text-gray-800">GSO System (Dev)</h3>
                        <p class="mt-1 text-sm sm:text-base text-gray-600">Access the development version of the GSO Asset Management system.</p>
                    </div>
                </a>`;
            
            appsContainer.insertAdjacentHTML('beforeend', gsoDevLinkHTML);
        }

    } catch (error) {
        console.error("Failed to initialize dashboard:", error);
        // On any failure, assume the user is not logged in and redirect.
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const signOutButton = document.getElementById('signout-button');
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');

    // --- Set Up Event Listeners (runs only once) ---
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', (event) => {
            event.stopPropagation(); 
            userMenu.classList.toggle('hidden');
        });
    }

    window.addEventListener('click', () => {
        if (userMenu && !userMenu.classList.contains('hidden')) {
            userMenu.classList.add('hidden');
        }
    });

    if (signOutButton) {
        signOutButton.addEventListener('click', async () => {
            // The URL of your deployed IT Helpdesk backend API
            const API_BASE_URL = 'https://lgu-helpdesk-copy.onrender.com';
            try {
                await fetch(`${API_BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                });
            } catch (error) {
                console.error('Logout request failed:', error);
            } finally {
                // Always redirect to the login page after attempting to log out.
                window.location.href = 'index.html';
            }
        });
    }

    // --- Initial UI Update ---
    initializeDashboard();
});

/**
 * Listen for the pageshow event to handle cases where the page is loaded from the back-forward cache (bfcache).
 */
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Re-run initialization if the page is loaded from bfcache to ensure data is fresh.
        initializeDashboard();
    }
});
