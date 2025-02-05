export default class Modals {
    static init() {
        // Get modal elements
        const howToPlayModal = document.getElementById('howToPlayModal');
        const aboutModal = document.getElementById('aboutModal');

        // Get buttons
        const howToPlayBtn = document.getElementById('howToPlayBtn');
        const aboutBtn = document.getElementById('aboutBtn');

        // Get close buttons
        const closeButtons = document.querySelectorAll('.close-modal');

        // Show modals
        howToPlayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal(howToPlayModal);
        });

        aboutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal(aboutModal);
        });

        // Close modals
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.hideModal(button.closest('.modal'));
            });
        });

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });

        // Close on escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const visibleModal = document.querySelector('.modal.show');
                if (visibleModal) {
                    this.hideModal(visibleModal);
                }
            }
        });
    }

    static showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    static hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
}
