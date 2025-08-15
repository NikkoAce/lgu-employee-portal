document.addEventListener('DOMContentLoaded', () => {
    const userInfo = document.getElementById('user-info');
    const signOutButton = document.getElementById('signout-button');
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');

    // URLs of your deployed applications
    const IT_HELPDESK_URL = 'https://lgu-ithelpdesk.netlify.app/app.html';
    const BUILDING_PERMIT_URL = 'https://lgu-engr-permit.netlify.app/dashboard.html'; 
    const INFORMAL_SETTLER_URL = 'https://lgu-urban-poor.netlify.app/dashboard.html';
    const GSO_SYSTEM_URL = 'https://lgudaet-gso-system.netlify.app/dashboard.html'; 

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
                <p class="text-xs text-gray-500">${currentUser.role}</p>
            `;
        }
    } catch (e) {
        console.error("Failed to decode token:", e);
        localStorage.removeItem('portalAuthToken');
        window.location.href = 'index.html';
        return;
    }

    // --- 3. Set Up Application Links (Single Sign-On) ---
    const apps = [
        { id: 'it-helpdesk-link', url: IT_HELPDESK_URL },
        { id: 'building-permit-link', url: BUILDING_PERMIT_URL },
        { id: 'informal-settler-link', url: INFORMAL_SETTLER_URL },
        { id: 'gso-system-link', url: GSO_SYSTEM_URL } // NEW
    ];
 
    apps.forEach(app => {
        const linkElement = document.getElementById(app.id);
        if (linkElement && app.url) {
            // Pass the token as a URL parameter for single sign-on
            linkElement.href = `${app.url}?token=${token}`;
        }
    });

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
