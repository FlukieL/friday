/**
 * ContentRenderer Module
 * Renders Wikipedia-style content from JSON data
 */

class ContentRenderer {
    constructor(animations, youtubeEmbed) {
        this.animations = animations;
        this.youtubeEmbed = youtubeEmbed;
    }

    /**
     * Renders character content
     * @param {Array} characters - Array of character objects
     * @param {HTMLElement} container - Container element
     */
    renderCharacters(characters, container) {
        if (!characters || characters.length === 0) {
            container.innerHTML = '<div class="loading">No characters found.</div>';
            return;
        }

        container.innerHTML = '';

        characters.forEach((character, index) => {
            const item = this.createCharacterItem(character);
            this.animations.setFadeInDelay(item, index * 100);
            container.appendChild(item);
        });

        // Trigger animations
        const items = container.querySelectorAll('.content-item');
        this.animations.staggerFadeIn(Array.from(items), 100, 400);
    }

    /**
     * Creates a character content item
     * @param {Object} character - Character data
     * @returns {HTMLElement}
     */
    createCharacterItem(character) {
        const item = document.createElement('div');
        item.className = 'content-item';

        const title = document.createElement('h2');
        title.textContent = character.name;
        item.appendChild(title);

        if (character.source) {
            const source = document.createElement('span');
            source.className = 'source';
            source.textContent = character.source;
            title.appendChild(source);
        }

        if (character.description) {
            const description = document.createElement('p');
            description.textContent = character.description;
            item.appendChild(description);
        }

        if (character.firstAppearance) {
            const meta = document.createElement('p');
            meta.className = 'meta';
            meta.textContent = `First Appearance: ${character.firstAppearance}`;
            item.appendChild(meta);
        }

        if (character.details && Array.isArray(character.details)) {
            character.details.forEach(detail => {
                const detailP = document.createElement('p');
                detailP.textContent = detail;
                item.appendChild(detailP);
            });
        }

        return item;
    }

    /**
     * Renders theme content
     * @param {Array} themes - Array of theme objects
     * @param {HTMLElement} container - Container element
     */
    renderThemes(themes, container) {
        if (!themes || themes.length === 0) {
            container.innerHTML = '<div class="loading">No themes found.</div>';
            return;
        }

        container.innerHTML = '';

        themes.forEach((theme, index) => {
            const item = this.createThemeItem(theme);
            this.animations.setFadeInDelay(item, index * 100);
            container.appendChild(item);
        });

        const items = container.querySelectorAll('.content-item');
        this.animations.staggerFadeIn(Array.from(items), 100, 400);
    }

    /**
     * Creates a theme content item
     * @param {Object} theme - Theme data
     * @returns {HTMLElement}
     */
    createThemeItem(theme) {
        const item = document.createElement('div');
        item.className = 'content-item';

        const title = document.createElement('h2');
        title.textContent = theme.name || theme.title;
        item.appendChild(title);

        if (theme.description) {
            const description = document.createElement('p');
            description.textContent = theme.description;
            item.appendChild(description);
        }

        if (theme.examples && Array.isArray(theme.examples)) {
            const examplesTitle = document.createElement('h3');
            examplesTitle.textContent = 'Examples:';
            item.appendChild(examplesTitle);

            const examplesList = document.createElement('ul');
            theme.examples.forEach(example => {
                const li = document.createElement('li');
                li.textContent = example;
                examplesList.appendChild(li);
            });
            item.appendChild(examplesList);
        }

        // Add expandable video embed if videoUrl is provided
        if (theme.videoUrl && this.youtubeEmbed) {
            const videoContainer = this.createExpandableVideoEmbed(theme.videoUrl);
            item.appendChild(videoContainer);
        }

        return item;
    }

    /**
     * Creates an expandable video embed for themes
     * @param {string} videoUrl - YouTube video URL
     * @returns {HTMLElement}
     */
    createExpandableVideoEmbed(videoUrl) {
        const container = document.createElement('div');
        container.className = 'theme-video-container';

        const videoId = this.youtubeEmbed.extractVideoId(videoUrl);
        if (!videoId) {
            console.warn('Invalid video URL:', videoUrl);
            return container;
        }

        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'theme-video-toggle';
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-label', 'Toggle video');
        toggleButton.innerHTML = '<span class="theme-video-toggle-text">Show Video</span> <span class="theme-video-toggle-icon">▼</span>';
        
        // Create embed container (initially hidden)
        const embedWrapper = document.createElement('div');
        embedWrapper.className = 'theme-video-embed-wrapper';
        embedWrapper.style.display = 'none';

        const videoData = {
            id: videoId,
            url: videoUrl,
            aspectRatio: '16:9'
        };

        try {
            const embedContainer = this.youtubeEmbed.createEmbed(videoData);
            embedWrapper.appendChild(embedContainer);
        } catch (error) {
            console.error('Error creating video embed:', error);
            embedWrapper.innerHTML = '<p class="video-error">Failed to load video embed</p>';
        }

        // Toggle functionality
        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                // Collapse
                embedWrapper.style.display = 'none';
                toggleButton.setAttribute('aria-expanded', 'false');
                toggleButton.querySelector('.theme-video-toggle-text').textContent = 'Show Video';
                toggleButton.querySelector('.theme-video-toggle-icon').textContent = '▼';
            } else {
                // Expand
                embedWrapper.style.display = 'block';
                toggleButton.setAttribute('aria-expanded', 'true');
                toggleButton.querySelector('.theme-video-toggle-text').textContent = 'Hide Video';
                toggleButton.querySelector('.theme-video-toggle-icon').textContent = '▲';
            }
        });

        container.appendChild(toggleButton);
        container.appendChild(embedWrapper);

        return container;
    }

    /**
     * Renders recurring jokes content
     * @param {Array} jokes - Array of joke objects
     * @param {HTMLElement} container - Container element
     */
    renderJokes(jokes, container) {
        if (!jokes || jokes.length === 0) {
            container.innerHTML = '<div class="loading">No recurring jokes found.</div>';
            return;
        }

        container.innerHTML = '';

        jokes.forEach((joke, index) => {
            const item = this.createJokeItem(joke);
            this.animations.setFadeInDelay(item, index * 100);
            container.appendChild(item);
        });

        const items = container.querySelectorAll('.content-item');
        this.animations.staggerFadeIn(Array.from(items), 100, 400);
    }

    /**
     * Creates a joke content item
     * @param {Object} joke - Joke data
     * @returns {HTMLElement}
     */
    createJokeItem(joke) {
        const item = document.createElement('div');
        item.className = 'content-item';

        const title = document.createElement('h2');
        title.textContent = joke.name || joke.title;
        item.appendChild(title);

        if (joke.description) {
            const description = document.createElement('p');
            description.textContent = joke.description;
            item.appendChild(description);
        }

        if (joke.occurrences && Array.isArray(joke.occurrences)) {
            const occurrencesTitle = document.createElement('h3');
            occurrencesTitle.textContent = 'Occurrences:';
            item.appendChild(occurrencesTitle);

            const occurrencesList = document.createElement('ul');
            joke.occurrences.forEach(occurrence => {
                const li = document.createElement('li');
                li.textContent = occurrence;
                occurrencesList.appendChild(li);
            });
            item.appendChild(occurrencesList);
        }

        if (joke.context) {
            const context = document.createElement('p');
            context.className = 'meta';
            context.textContent = `Context: ${joke.context}`;
            item.appendChild(context);
        }

        return item;
    }
}

export default ContentRenderer;




