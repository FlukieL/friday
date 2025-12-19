/**
 * Main Application Entry Point
 * Coordinates all modules and initialises the application
 */

import DataLoader from './modules/DataLoader.js';
import YouTubeEmbed from './modules/YouTubeEmbed.js';
import VideoLoader from './modules/VideoLoader.js';
import TabManager from './modules/TabManager.js';
import ContentRenderer from './modules/ContentRenderer.js';
import Animations from './modules/Animations.js';

class FridaySagaApp {
    constructor() {
        this.dataLoader = new DataLoader();
        this.youtubeEmbed = new YouTubeEmbed();
        this.animations = new Animations();
        this.videoLoader = new VideoLoader(this.youtubeEmbed, this.animations);
        this.tabManager = new TabManager(this.animations);
        this.contentRenderer = new ContentRenderer(this.animations);
    }

    /**
     * Initialises the application
     */
    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    /**
     * Starts the application
     */
    async start() {
        try {
            // Initialise tab manager
            this.tabManager.init();

            // Load initial tab content (videos)
            await this.loadVideos();

            // Read URL parameters and restore state
            await this.restoreStateFromURL();

            // Listen for tab changes to load content on demand
            window.addEventListener('tabChanged', (event) => {
                this.handleTabChange(event.detail.tabName);
            });

            // Handle browser back/forward navigation
            window.addEventListener('popstate', (event) => {
                this.restoreStateFromURL();
            });

        } catch (error) {
            console.error('Error initialising application:', error);
            this.showError('Failed to initialise application. Please refresh the page.');
        }
    }

    /**
     * Restores application state from URL parameters
     */
    async restoreStateFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        const season = urlParams.get('season');
        const video = urlParams.get('video');

        // Restore tab if specified in URL
        if (tab) {
            await this.tabManager.switchTabFromURL(tab);
            await this.handleTabChange(tab);
        }

        // Restore video if season and video are specified
        if (tab === 'videos' && season && video) {
            const videoNumber = parseInt(video, 10);
            if (!isNaN(videoNumber)) {
                // Wait a bit for videos to be rendered
                setTimeout(() => {
                    this.videoLoader.expandVideoFromURL(season, videoNumber);
                }, 100);
            }
        }
    }

    /**
     * Loads and renders videos
     */
    async loadVideos() {
        const videosGrid = document.getElementById('videos-grid');
        if (!videosGrid) return;

        try {
            const data = await this.dataLoader.loadData('data/videos.json');
            await this.videoLoader.renderVideos(data.videos, videosGrid);
        } catch (error) {
            console.error('Error loading videos:', error);
            videosGrid.innerHTML = '<div class="video-error">Failed to load videos. Please check your connection and try again.</div>';
        }
    }

    /**
     * Handles tab change events
     * @param {string} tabName - Name of the active tab
     */
    async handleTabChange(tabName) {
        try {
            switch (tabName) {
                case 'videos':
                    // Videos are already loaded on init
                    break;
                case 'characters':
                    await this.loadCharacters();
                    break;
                case 'themes':
                    await this.loadThemes();
                    break;
                case 'jokes':
                    await this.loadJokes();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${tabName}:`, error);
        }
    }

    /**
     * Loads and renders characters
     */
    async loadCharacters() {
        const container = document.getElementById('characters-content');
        if (!container) return;

        // Check if already loaded
        if (container.children.length > 0 && !container.querySelector('.loading')) {
            return;
        }

        try {
            const data = await this.dataLoader.loadData('data/characters.json');
            this.contentRenderer.renderCharacters(data.characters, container);
        } catch (error) {
            console.error('Error loading characters:', error);
            container.innerHTML = '<div class="loading">Failed to load characters.</div>';
        }
    }

    /**
     * Loads and renders themes
     */
    async loadThemes() {
        const container = document.getElementById('themes-content');
        if (!container) return;

        // Check if already loaded
        if (container.children.length > 0 && !container.querySelector('.loading')) {
            return;
        }

        try {
            const data = await this.dataLoader.loadData('data/themes.json');
            this.contentRenderer.renderThemes(data.themes, container);
        } catch (error) {
            console.error('Error loading themes:', error);
            container.innerHTML = '<div class="loading">Failed to load themes.</div>';
        }
    }

    /**
     * Loads and renders recurring jokes
     */
    async loadJokes() {
        const container = document.getElementById('jokes-content');
        if (!container) return;

        // Check if already loaded
        if (container.children.length > 0 && !container.querySelector('.loading')) {
            return;
        }

        try {
            const data = await this.dataLoader.loadData('data/jokes.json');
            this.contentRenderer.renderJokes(data.jokes, container);
        } catch (error) {
            console.error('Error loading jokes:', error);
            container.innerHTML = '<div class="loading">Failed to load recurring jokes.</div>';
        }
    }

    /**
     * Shows an error message
     * @param {string} message - Error message
     */
    showError(message) {
        const main = document.querySelector('main');
        if (main) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'video-error';
            errorDiv.textContent = message;
            main.insertBefore(errorDiv, main.firstChild);
        }
    }
}

// Initialise the application
const app = new FridaySagaApp();
app.init();

// Register service worker for PWA (without install prompts)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}




