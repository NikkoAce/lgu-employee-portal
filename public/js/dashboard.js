document.addEventListener('DOMContentLoaded', () => {
    const userInfo = document.getElementById('user-info');
    const signOutButton = document.getElementById('signout-button');
    const itHelpdeskLink = document.getElementById('it-helpdesk-link');
    const buildingPermitLink = document.getElementById('building-permit-link');
    const informalSettlerLink = document.getElementById('informal-settler-link');

    // URLs of your deployed applications
    const IT_HELPDESK_URL = 'https://lgu-ithelpdesk.netlify.app/app.html';
    const BUILDING_PERMIT_URL = 'https://lgu-engr-permit.netlify.app/dashboard.html'; 
    const INFORMAL_SETTLER_URL = 'https://lgu-urban-poor.netlify.app/dashboard.html'; // Example URL
    

    // --- 1. Check for Authentication ---
    const token = localStorage.getItem('portalAuthToken');
    if (!token) {
        // If no token, redirect back to the login page
        window.location.href = 'index.html';
        return;
    }

    // --- 2. Decode Token and Display User Info ---
    let currentUser;
    try {
        // A simple function to decode the payload of a JWT
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
        // If token is invalid, clear it and redirect to login
        localStorage.removeItem('portalAuthToken');
        window.location.href = 'index.html';
        return;
    }

    // --- 3. Set Up Application Links (Single Sign-On) ---
    // We pass the token as a URL parameter to the other applications
    if (itHelpdeskLink) {
        itHelpdeskLink.href = `${IT_HELPDESK_URL}?token=${token}`;
    }
    
    if (buildingPermitLink) { 
    buildingPermitLink.href = `${BUILDING_PERMIT_URL}?token=${token}`;
}

    if (informalSettlerLink) {
        informalSettlerLink.href = `${INFORMAL_SETTLER_URL}?token=${token}`;
    }

    // --- 4. Set Up Sign Out Button ---
    if (signOutButton) {
        signOutButton.addEventListener('click', () => {
            localStorage.removeItem('portalAuthToken');
            window.location.href = 'index.html';
        });
    }
});
