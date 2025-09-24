/**
 * Shared utility functions for the LGU Employee Portal.
 */

const Utils = {
    /**
     * Displays a modal with a title and message.
     * @param {string} modalId - The ID of the dialog element.
     * @param {string} title - The title to display in the modal.
     * @param {string} message - The message to display.
     * @param {boolean} isError - If true, displays an error icon and style.
     * @param {number|null} autoCloseDelay - If provided, auto-closes the modal after the delay (in ms).
     */
    showModal: (modalId, title, message, isError = false, autoCloseDelay = null) => {
        const messageModal = document.getElementById(modalId);
        if (!messageModal) return;

        const modalTitle = messageModal.querySelector('.modal-title');
        const modalText = messageModal.querySelector('.modal-text');
        const modalIconContainer = messageModal.querySelector('.modal-icon-container');
        const successIcon = `<svg class="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`;
        const errorIcon = `<svg class="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>`;

        if (modalTitle) modalTitle.textContent = title;
        if (modalText) modalText.textContent = message;

        if (modalIconContainer) {
            modalIconContainer.innerHTML = isError ? errorIcon : successIcon;
            modalIconContainer.className = `modal-icon-container mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isError ? 'bg-red-100' : 'bg-green-100'}`;
        }

        messageModal.showModal();

        if (!isError && typeof autoCloseDelay === 'number') {
            setTimeout(() => { if (messageModal.open) messageModal.close(); }, autoCloseDelay);
        }
    },

    showButtonLoading: (button) => {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="loading loading-spinner"></span>';
    },

    resetButton: (button) => {
        if (button && button.dataset.originalText) {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText;
        }
    }
};

window.Utils = Utils;