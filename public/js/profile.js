// This script manages the My Profile page.

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    // --- DOM ELEMENTS ---
    const profileForm = document.getElementById('profile-form');
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    const officeContainer = document.getElementById('office-select-container');
    const messageEl = document.getElementById('profile-message');
    const saveButton = document.getElementById('save-profile-button');

    // --- SHARED HEADER/MENU LOGIC (similar to dashboard.js) ---
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const signoutButton = document.getElementById('signout-button');
    const userInfoDiv = document.getElementById('user-info');

    const populateOfficeDropdown = async (currentUserOffice) => {
        try {
            // This logic is similar to the registration page.
            const response = await fetch(`${AppConfig.API_BASE_URL}/api/users/offices`);
            if (!response.ok) throw new Error('Failed to fetch offices');
            const offices = await response.json();

            const selectEl = document.createElement('select');
            selectEl.id = 'profile-office';
            selectEl.name = 'office';
            selectEl.className = 'select select-bordered w-full';

            offices.forEach(office => {
                const option = document.createElement('option');
                option.value = office.name;
                option.textContent = office.name;
                if (office.name === currentUserOffice) {
                    option.selected = true;
                }
                selectEl.appendChild(option);
            });

            officeContainer.innerHTML = '';
            officeContainer.appendChild(selectEl);
        } catch (error) {
            console.error('Error populating offices:', error);
            officeContainer.innerHTML = '<p class="text-red-500 text-xs">Could not load office list.</p>';
        }
    };

    const initializeProfilePage = async () => {
        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/api/auth/me`, { credentials: 'include' });
            if (!response.ok) {
                window.location.href = 'index.html'; // Redirect if not authenticated
                return;
            }
            const user = await response.json();

            // Populate header
            userInfoDiv.innerHTML = `
                <div class="font-semibold text-sm text-gray-800 truncate">${user.name}</div>
                <div class="text-xs text-gray-500">${user.role}</div>
            `;

            // Populate form fields
            nameInput.value = user.name;
            emailInput.value = user.email;
            await populateOfficeDropdown(user.office);

        } catch (error) {
            console.error('Initialization failed:', error);
            window.location.href = 'index.html';
        }
    };

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        saveButton.classList.add('btn-disabled');
        saveButton.textContent = 'Saving...';
        messageEl.textContent = '';

        const formData = new FormData(profileForm);
        const updatedData = {
            name: formData.get('name'),
            email: formData.get('email'),
            office: formData.get('office'),
        };

        try {
            const response = await fetch(`${AppConfig.API_BASE_URL}/api/users/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile.');
            }

            messageEl.className = 'text-green-600';
            messageEl.textContent = 'Profile updated successfully!';
            // Optionally, update the header with the new name
            userInfoDiv.querySelector('.font-semibold').textContent = result.name;

        } catch (error) {
            messageEl.className = 'text-red-600';
            messageEl.textContent = error.message;
        } finally {
            saveButton.classList.remove('btn-disabled');
            saveButton.textContent = 'Save Changes';
        }
    });

    // --- Generic Menu/Logout Listeners ---
    userMenuButton?.addEventListener('click', (e) => { e.stopPropagation(); userMenu.classList.toggle('hidden'); });
    window.addEventListener('click', () => userMenu?.classList.add('hidden'));
    signoutButton?.addEventListener('click', async () => {
        await fetch(`${AppConfig.API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        window.location.href = 'index.html';
    });

    // --- Initialize ---
    initializeProfilePage();
});