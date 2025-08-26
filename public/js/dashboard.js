// FILE: /_LGU EMPLOYEE PORTAL/public/js/dashboard.js (UPDATED)
document.addEventListener('DOMContentLoaded', () => {
    const userInfo = document.getElementById('user-info');
    const signOutButton = document.getElementById('signout-button');
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');

    // URLs of your deployed applications
    const IT_HELPDESK_URL = 'https://lgu-ithelpdesk.netlify.app/app.html';
    const BUILDING_PERMIT_URL = 'https://lgu-engr-permit.netlify.app/index.html'; 
    const INFORMAL_SETTLER_URL = 'https://lgu-urban-poor.netlify.app/dashboard.html';
    // --- GSO System Root URLs ---
    const GSO_PROD_URL = 'https://lgudaet-gso-system.netlify.app/';
    const GSO_DEV_URL = 'https://dev-gso-system.netlify.app/'; // Your development link

    // --- 1. Check for Authentication ---
    const token = localStorage.getItem('portalAuthToken');  
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // --- 2. Decode Token and Display User Info ---
    let currentUser;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUser = payload.user;
        if (userInfo && currentUser) {
            userInfo.innerHTML = `
                <p class="text-sm font-semibold text-gray-800">${currentUser.name}</p>
                <p class="text-xs text-gray-500">${currentUser.office}</p>
            `;
        }
    } catch (e) {
        console.error("Failed to decode token:", e);
        localStorage.removeItem('portalAuthToken');
        window.location.href = 'index.html';
        return;
    }

    // --- 3. Set Up Application Links (Single Sign-On) ---
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
                linkElement.href = `${app.url}?token=${token}`;
            }
        });
        
        // --- GSO System Link (Production) ---
        const gsoLinkHTML = `
            <a href="${GSO_PROD_URL}?token=${token}" class="flex items-start space-x-4 rounded-lg bg-white p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
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
        const gsoDevLinkHTML = `
            <a href="${GSO_DEV_URL}?token=${token}" class="flex items-start space-x-4 rounded-lg bg-white p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
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


    // --- 4. Set Up User Menu and Sign Out ---
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
        signOutButton.addEventListener('click', () => {
            localStorage.removeItem('portalAuthToken');
            window.location.href = 'index.html';
        });
    }
});
