/**
 * Centralized configuration for the LGU Employee Portal.
 * This file should be loaded before any other script in the HTML.
 */

const AppConfig = {
    // The base URL of your deployed IT Helpdesk backend API
    API_BASE_URL: 'https://lgu-helpdesk-copy.onrender.com',

    // URLs for other applications accessed from the dashboard
    IT_HELPDESK_URL: 'https://lgu-ithelpdesk.netlify.app/app.html',
    BUILDING_PERMIT_URL: 'https://lgu-engr-permit.netlify.app/index.html',
    INFORMAL_SETTLER_URL: 'https://lgu-urban-poor.netlify.app/dashboard.html',
    GSO_PROD_URL: 'https://lgudaet-gso-system.netlify.app/',
    GSO_DEV_URL: 'https://dev-gso-system.netlify.app/',
};

// Make the configuration globally accessible
window.AppConfig = AppConfig;