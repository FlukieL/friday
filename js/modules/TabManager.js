/**
 * TabManager Module
 * Manages tab navigation and switching
 */

class TabManager {
    constructor(animations) {
        this.animations = animations;
        this.tabs = [];
        this.tabContents = [];
        this.activeTab = null;
    }

    /**
     * Initialises the tab manager
     */
    init() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        this.tabs = Array.from(tabButtons);
        this.tabContents = Array.from(tabContents);

        // Set initial active tab
        const activeButton = document.querySelector('.tab-button.active');
        if (activeButton) {
            this.activeTab = activeButton.dataset.tab;
            // Scroll initial active tab into view on mobile
            setTimeout(() => this.scrollTabIntoView(activeButton), 100);
        }

        // Add event listeners
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabClick(e));
            tab.addEventListener('touchstart', (e) => this.handleTabClick(e), { passive: true });
        });
    }

    /**
     * Handles tab button click
     * @param {Event} event - Click event
     */
    async handleTabClick(event) {
        const tabButton = event.currentTarget;
        const tabName = tabButton.dataset.tab;

        if (tabName === this.activeTab) {
            return; // Already active
        }

        await this.switchTab(tabName);
    }

    /**
     * Switches to a specific tab
     * @param {string} tabName - Name of the tab to switch to
     */
    async switchTab(tabName) {
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(`${tabName}-tab`);

        if (!tabButton || !tabContent) {
            console.warn(`Tab "${tabName}" not found`);
            return;
        }

        // Get current active elements
        const currentActiveButton = document.querySelector('.tab-button.active');
        const currentActiveContent = document.querySelector('.tab-content.active');

        // Update active states
        if (currentActiveButton) {
            currentActiveButton.classList.remove('active');
            currentActiveButton.setAttribute('aria-selected', 'false');
        }

        if (currentActiveContent) {
            currentActiveContent.classList.remove('active');
        }

        // Set new active states
        tabButton.classList.add('active');
        tabButton.setAttribute('aria-selected', 'true');
        tabContent.classList.add('active');

        // Scroll the active tab into view (for mobile horizontal scrolling)
        this.scrollTabIntoView(tabButton);

        // Animate transition
        if (currentActiveContent && tabContent) {
            await this.animations.fadeBetween(currentActiveContent, tabContent);
        } else if (tabContent) {
            await this.animations.fadeIn(tabContent);
        }

        this.activeTab = tabName;

        // Dispatch custom event for tab change
        window.dispatchEvent(new CustomEvent('tabChanged', { 
            detail: { tabName } 
        }));
    }

    /**
     * Scrolls a tab button into view within the tabs container
     * @param {HTMLElement} tabButton - The tab button to scroll into view
     */
    scrollTabIntoView(tabButton) {
        const tabsContainer = tabButton.closest('.tabs');
        if (!tabsContainer) {
            return;
        }

        const containerRect = tabsContainer.getBoundingClientRect();
        const buttonRect = tabButton.getBoundingClientRect();

        // Check if the button is outside the visible area
        const isLeftOfView = buttonRect.left < containerRect.left;
        const isRightOfView = buttonRect.right > containerRect.right;

        if (isLeftOfView || isRightOfView) {
            // Calculate scroll position to centre the button
            const scrollLeft = tabButton.offsetLeft - (tabsContainer.offsetWidth / 2) + (tabButton.offsetWidth / 2);
            
            tabsContainer.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Gets the currently active tab name
     * @returns {string|null}
     */
    getActiveTab() {
        return this.activeTab;
    }
}

export default TabManager;

