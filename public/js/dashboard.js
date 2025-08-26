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
    // IMPORTANT: Replace with your GSO system's live URL
    const GSO_ADMIN_URL = 'https://lgudaet-gso-system.netlify.app/dashboard/dashboard.html'; 
    const GSO_EMPLOYEE_URL = 'https://lgudaet-gso-system.netlify.app/portal/view-assets.html'; 

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
        
        // --- GSO System Link Logic ---
        // This logic now mirrors the backend's definition of an admin.
        const adminOffices = ['GSO', 'General Service Office', 'IT'];
        const adminRoles = ['IT'];
        const isGsoAdmin = adminOffices.includes(currentUser.office) || adminRoles.includes(currentUser.role);

        const gsoConfig = isGsoAdmin
            ? {
                url: GSO_ADMIN_URL,
                title: "GSO Asset Management",
                description: "Full access to manage property, generate slips, and conduct physical counts.",
                iconBg: "bg-purple-100 text-purple-600",
                iconPath: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
            }
            : {
                url: GSO_EMPLOYEE_URL,
                title: "View My Office's Assets",
                description: "View accountable property assigned to your office and request supplies.",
                iconBg: "bg-gray-100 text-gray-600",
                iconPath: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
            };

        const gsoLinkHTML = `
            <a href="${gsoConfig.url}?token=${token}" class="flex items-start space-x-4 rounded-lg bg-white p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div class="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg ${gsoConfig.iconBg}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="${gsoConfig.iconPath}" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-lg sm:text-xl font-semibold text-gray-800">${gsoConfig.title}</h3>
                    <p class="mt-1 text-sm sm:text-base text-gray-600">${gsoConfig.description}</p>
                </div>
            </a>`;
        
        appsContainer.insertAdjacentHTML('beforeend', gsoLinkHTML);
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
