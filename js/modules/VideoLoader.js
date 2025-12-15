/**
 * VideoLoader Module
 * Handles video data loading and rendering
 */

class VideoLoader {
    constructor(youtubeEmbed, animations) {
        this.youtubeEmbed = youtubeEmbed;
        this.animations = animations;
        this.videos = [];
        this.videosBySeason = {};
    }

    /**
     * Renders videos from data
     * @param {Array} videos - Array of video objects
     * @param {HTMLElement} container - Container element to render into
     */
    async renderVideos(videos, container) {
        if (!videos || videos.length === 0) {
            container.innerHTML = '<div class="loading">No videos found.</div>';
            return;
        }

        // Show loading state
        container.innerHTML = '<div class="loading">Loading videos...</div>';

        try {
            // Fetch titles for videos that don't have them
            const videosWithTitles = await this.youtubeEmbed.fetchTitlesForVideos(videos);

            // Clear container and change it from grid to block container
            container.innerHTML = '';
            container.classList.remove('videos-grid');
            container.classList.add('videos-container-inner');

            // Store videos for URL handling
            this.videos = videosWithTitles;

            // Group videos by season
            this.videosBySeason = {};
            videosWithTitles.forEach(video => {
                const season = video.season || '1';
                if (!this.videosBySeason[season]) {
                    this.videosBySeason[season] = [];
                }
                this.videosBySeason[season].push(video);
            });

            // Render videos grouped by season
            let globalIndex = 0;
            Object.keys(this.videosBySeason).sort().forEach(season => {
                // Create season heading
                const seasonHeading = document.createElement('h2');
                seasonHeading.className = 'season-heading';
                seasonHeading.textContent = season;
                container.appendChild(seasonHeading);

                // Create season grid container
                const seasonGrid = document.createElement('div');
                seasonGrid.className = 'videos-grid';
                
                // Render videos for this season
                this.videosBySeason[season].forEach((video, index) => {
                    const videoCard = this.createVideoCard(video, season, index + 1);
                    this.animations.setFadeInDelay(videoCard, globalIndex * 50);
                    seasonGrid.appendChild(videoCard);
                    globalIndex++;
                });

                container.appendChild(seasonGrid);
            });

            // Trigger staggered animations
            const cards = container.querySelectorAll('.video-card');
            this.animations.staggerFadeIn(Array.from(cards), 50, 300);

        } catch (error) {
            console.error('Error rendering videos:', error);
            container.innerHTML = '<div class="video-error">Failed to load videos. Please try again later.</div>';
        }
    }

    /**
     * Creates a video card element (title only, expands on click)
     * @param {Object} video - Video data object
     * @param {string} season - Season number
     * @param {number} videoNumber - Video number within the season
     * @returns {HTMLElement}
     */
    createVideoCard(video, season, videoNumber) {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.dataset.videoId = video.id || this.youtubeEmbed.extractVideoId(video.url);

        try {
            // Extract video ID if not present
            if (!video.id && video.url) {
                video.id = this.youtubeEmbed.extractVideoId(video.url);
            }

            // Store video data for expansion
            card.dataset.videoData = JSON.stringify(video);
            card.dataset.season = season;
            card.dataset.videoNumber = videoNumber;

            // Add thumbnail
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'video-thumbnail-container';
            
            const thumbnail = document.createElement('img');
            thumbnail.className = 'video-thumbnail';
            thumbnail.src = this.youtubeEmbed.getThumbnailUrl(video.id);
            thumbnail.alt = video.title || 'Video thumbnail';
            thumbnail.loading = 'lazy';
            
            // Fallback to sddefault if maxresdefault fails
            thumbnail.onerror = () => {
                thumbnail.src = this.youtubeEmbed.getThumbnailUrl(video.id, 'sddefault');
                thumbnail.onerror = () => {
                    // Final fallback to hqdefault
                    thumbnail.src = this.youtubeEmbed.getThumbnailUrl(video.id, 'hqdefault');
                };
            };
            
            // Add play icon overlay
            const playIcon = document.createElement('div');
            playIcon.className = 'video-play-icon';
            playIcon.innerHTML = '▶';
            playIcon.setAttribute('aria-hidden', 'true');
            
            thumbnailContainer.appendChild(thumbnail);
            thumbnailContainer.appendChild(playIcon);
            card.appendChild(thumbnailContainer);

            // Add title as clickable element
            if (video.title) {
                const title = document.createElement('div');
                title.className = 'video-title';
                title.textContent = video.title;
                title.setAttribute('role', 'button');
                title.setAttribute('tabindex', '0');
                title.setAttribute('aria-label', `Play ${video.title}`);
                card.appendChild(title);
            } else {
                const title = document.createElement('div');
                title.className = 'video-title';
                title.textContent = 'Untitled Video';
                title.setAttribute('role', 'button');
                title.setAttribute('tabindex', '0');
                card.appendChild(title);
            }

            // Add click handler to both card and title
            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.expandVideo(card, video, season, videoNumber);
            };
            
            card.addEventListener('click', handleClick);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.expandVideo(card, video, season, videoNumber);
                }
            });

        } catch (error) {
            console.error('Error creating video card:', error);
            card.innerHTML = `
                <div class="video-error">
                    <p>Failed to load video</p>
                    <p class="meta">${video.url || 'Unknown video'}</p>
                </div>
            `;
        }

        return card;
    }

    /**
     * Expands a video to full screen
     * @param {HTMLElement} card - The video card element
     * @param {Object} video - Video data object
     * @param {string} season - Season number
     * @param {number} videoNumber - Video number within the season
     */
    expandVideo(card, video, season, videoNumber) {
        // Prevent multiple overlays
        const existingOverlay = document.querySelector('.video-overlay');
        if (existingOverlay) {
            this.closeVideo(existingOverlay);
            return;
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', video.title || 'Video Player');

        // Create expanded container
        const expandedContainer = document.createElement('div');
        expandedContainer.className = 'video-expanded-container';

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'video-close-button';
        closeButton.setAttribute('aria-label', 'Close video');
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.closeVideo(overlay));
        
        // Close on overlay click (outside video)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.classList.contains('video-overlay')) {
                e.stopPropagation();
                this.closeVideo(overlay);
            }
        });
        
        // Prevent clicks inside the container from closing
        expandedContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeVideo(overlay);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Create embed
        let embedContainer;
        try {
            embedContainer = this.youtubeEmbed.createEmbed(video);
            embedContainer.classList.add('expanded-embed');
        } catch (error) {
            console.error('Error creating embed:', error);
            embedContainer = document.createElement('div');
            embedContainer.className = 'video-error';
            embedContainer.innerHTML = '<p>Failed to load video embed</p>';
        }

        // Add title to expanded view
        const titleElement = document.createElement('div');
        titleElement.className = 'video-expanded-title';
        titleElement.textContent = video.title || 'Untitled Video';

        expandedContainer.appendChild(closeButton);
        expandedContainer.appendChild(titleElement);
        expandedContainer.appendChild(embedContainer);
        overlay.appendChild(expandedContainer);

        // Add to body
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Update URL with video information
        this.updateURL(season, videoNumber);

        // Trigger animation - use double requestAnimationFrame for better browser compatibility
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        });
    }

    /**
     * Updates the URL with the current video selection
     * @param {string} season - Season number
     * @param {number} videoNumber - Video number within the season
     */
    updateURL(season, videoNumber) {
        const url = new URL(window.location);
        url.searchParams.set('tab', 'videos');
        url.searchParams.set('season', season);
        url.searchParams.set('video', videoNumber.toString());
        window.history.pushState({ tab: 'videos', season, video: videoNumber }, '', url);
    }

    /**
     * Expands a video based on URL parameters
     * @param {string} season - Season number
     * @param {number} videoNumber - Video number within the season
     */
    expandVideoFromURL(season, videoNumber) {
        if (!this.videosBySeason[season] || !this.videosBySeason[season][videoNumber - 1]) {
            return;
        }

        const video = this.videosBySeason[season][videoNumber - 1];
        const card = document.querySelector(`[data-season="${season}"][data-video-number="${videoNumber}"]`);
        
        if (card) {
            this.expandVideo(card, video, season, videoNumber);
        }
    }

    /**
     * Closes the expanded video
     * @param {HTMLElement} overlay - The overlay element
     */
    closeVideo(overlay) {
        overlay.classList.remove('active');
        overlay.classList.add('closing');
        
        // Update URL to remove video parameters but keep tab
        const url = new URL(window.location);
        const currentTab = url.searchParams.get('tab') || 'videos';
        url.searchParams.delete('season');
        url.searchParams.delete('video');
        window.history.pushState({ tab: currentTab }, '', url);
        
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.body.style.overflow = ''; // Restore scrolling
        }, 400); // Match animation duration
    }

    /**
     * Updates video titles from oEmbed API
     * @param {Array} videos - Array of video objects
     * @returns {Promise<Array>} Videos with updated titles
     */
    async updateVideoTitles(videos) {
        return await this.youtubeEmbed.fetchTitlesForVideos(videos);
    }
}

export default VideoLoader;


