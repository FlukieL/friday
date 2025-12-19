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
        // Director's commentary mapping for Season 1
        this.commentaryUrl = 'https://www.youtube.com/watch?v=UYfQUiVz7Yg';
        this.commentaryTimestamps = {
            'hDaA-bs1wN4': '01:39', // Origin Still
            'IRC0Jt1yazQ': '02:04', // Home First Video
            'mT_3-rIx8DE': '02:22', // Turkey Walk (duplicate ID, different URL)
            'nF7Bq0HzxDI': '02:38', // Turkey260625
            'ZnKdQZrHD8U': '03:43', // Mario Pipe
            'tFWvI3kelzI': '04:22', // Batman&Joker
            '1EO_KqPksDw': '06:17', // LUKETVWeather
            'Pgv0bjxUjKY': '07:20', // 241025
            '3UBtcJOgBTs': '07:57', // cigar
            'HTza944UJpY': '09:02', // Friday I'm In Love
            'OCGycnEOndA': '10:17', // HarryPotter
            'GSrBB1hNR4g': '12:15', // Shining
            'qazMXc1nU8Y': '15:43'  // GhostsOfFridaysPast
        };
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

                // Add director's commentary section for Season 1
                if (season === '1') {
                    const commentarySection = this.createCommentarySection();
                    container.appendChild(commentarySection);
                }
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

            // Add commentary button for Season 1 videos
            if (season === '1') {
                // First try to match by URL ID (handles duplicate ID case)
                const urlId = this.youtubeEmbed.extractVideoId(video.url);
                let timestamp = this.commentaryTimestamps[urlId];
                
                // If not found by URL ID, try by video.id
                if (!timestamp) {
                    const videoIdForCommentary = video.id || urlId;
                    timestamp = this.commentaryTimestamps[videoIdForCommentary];
                }
                
                if (timestamp) {
                    const commentaryButton = this.createCommentaryButton(video, timestamp);
                    card.appendChild(commentaryButton);
                }
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

        // Find current video index in flat array
        const currentIndex = this.videos.findIndex(v => v.id === video.id);
        const hasPrevious = currentIndex > 0;
        const hasNext = currentIndex < this.videos.length - 1;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', video.title || 'Video Player');
        overlay.dataset.currentVideoIndex = currentIndex.toString();

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

        // Create navigation arrows (only on desktop when there's room)
        const navContainer = document.createElement('div');
        navContainer.className = 'video-nav-container';

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'video-nav-button video-nav-prev';
        prevButton.setAttribute('aria-label', 'Previous video');
        prevButton.innerHTML = '‹';
        prevButton.disabled = !hasPrevious;
        
        const handlePrevClick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (hasPrevious && currentIndex > 0) {
                this.navigateToVideo(overlay, currentIndex - 1);
            }
        };
        
        prevButton.addEventListener('click', handlePrevClick);
        prevButton.addEventListener('touchend', handlePrevClick);

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'video-nav-button video-nav-next';
        nextButton.setAttribute('aria-label', 'Next video');
        nextButton.innerHTML = '›';
        nextButton.disabled = !hasNext;
        
        const handleNextClick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (hasNext && currentIndex < this.videos.length - 1) {
                this.navigateToVideo(overlay, currentIndex + 1);
            }
        };
        
        nextButton.addEventListener('click', handleNextClick);
        nextButton.addEventListener('touchend', handleNextClick);

        navContainer.appendChild(prevButton);
        navContainer.appendChild(nextButton);

        expandedContainer.appendChild(closeButton);
        expandedContainer.appendChild(embedContainer);
        expandedContainer.appendChild(navContainer);
        overlay.appendChild(expandedContainer);

        // Add to body
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Setup auto-hide for controls
        this.setupAutoHideControls(overlay, closeButton, navContainer);

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
     * Sets up auto-hide functionality for video controls
     * @param {HTMLElement} overlay - The overlay element
     * @param {HTMLElement} closeButton - The close button
     * @param {HTMLElement} navContainer - The navigation container
     */
    setupAutoHideControls(overlay, closeButton, navContainer) {
        let hideTimeout;
        const hideDelay = 3000; // 3 seconds of inactivity

        const showControls = () => {
            closeButton.classList.remove('hidden');
            navContainer.classList.remove('hidden');
            
            // Clear existing timeout
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
            
            // Set new timeout to hide controls
            hideTimeout = setTimeout(() => {
                closeButton.classList.add('hidden');
                navContainer.classList.add('hidden');
            }, hideDelay);
        };

        const hideControls = () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
            closeButton.classList.add('hidden');
            navContainer.classList.add('hidden');
        };

        // Show controls on mouse movement
        overlay.addEventListener('mousemove', showControls);
        overlay.addEventListener('mouseenter', showControls);
        
        // Hide controls when mouse leaves overlay
        overlay.addEventListener('mouseleave', hideControls);

        // Show controls on touch (mobile)
        overlay.addEventListener('touchstart', showControls);

        // Show controls when interacting with buttons
        closeButton.addEventListener('mouseenter', showControls);
        navContainer.addEventListener('mouseenter', showControls);

        // Initial timeout to hide controls
        hideTimeout = setTimeout(() => {
            closeButton.classList.add('hidden');
            navContainer.classList.add('hidden');
        }, hideDelay);

        // Store cleanup function on overlay
        overlay.dataset.autoHideCleanup = 'true';
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
     * Navigates to a different video in the expanded view
     * @param {HTMLElement} overlay - The current overlay element
     * @param {number} videoIndex - Index of the video to navigate to
     */
    navigateToVideo(overlay, videoIndex) {
        if (videoIndex < 0 || videoIndex >= this.videos.length) {
            return;
        }

        const newVideo = this.videos[videoIndex];
        if (!newVideo) {
            return;
        }

        const newSeason = newVideo.season || '1';
        
        // Find the video number within the season
        const seasonVideos = this.videosBySeason[newSeason] || [];
        const seasonIndex = seasonVideos.findIndex(v => v.id === newVideo.id);
        
        if (seasonIndex === -1) {
            console.error('Video not found in season:', newVideo.id, newSeason);
            return;
        }
        
        const videoNumber = seasonIndex + 1;

        // Get the expanded container and embed container
        const expandedContainer = overlay.querySelector('.video-expanded-container');
        if (!expandedContainer) {
            return;
        }

        const oldEmbedContainer = expandedContainer.querySelector('.video-embed-container');
        if (!oldEmbedContainer) {
            return;
        }

        // Create new embed
        let newEmbedContainer;
        try {
            newEmbedContainer = this.youtubeEmbed.createEmbed(newVideo);
            newEmbedContainer.classList.add('expanded-embed');
        } catch (error) {
            console.error('Error creating embed:', error);
            newEmbedContainer = document.createElement('div');
            newEmbedContainer.className = 'video-error';
            newEmbedContainer.innerHTML = '<p>Failed to load video embed</p>';
        }

        // Replace the old embed with the new one
        oldEmbedContainer.parentNode.replaceChild(newEmbedContainer, oldEmbedContainer);

        // Update navigation buttons - store current index on overlay for easy access
        overlay.dataset.currentVideoIndex = videoIndex;
        const navContainer = expandedContainer.querySelector('.video-nav-container');
        if (navContainer) {
            const prevButton = navContainer.querySelector('.video-nav-prev');
            const nextButton = navContainer.querySelector('.video-nav-next');
            
            const hasPrevious = videoIndex > 0;
            const hasNext = videoIndex < this.videos.length - 1;
            
            if (prevButton) {
                prevButton.disabled = !hasPrevious;
                // Remove all existing listeners by cloning (simplest way)
                const newPrevButton = prevButton.cloneNode(true);
                prevButton.parentNode.replaceChild(newPrevButton, prevButton);
                
                if (hasPrevious) {
                    newPrevButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const currentIdx = parseInt(overlay.dataset.currentVideoIndex || '0', 10);
                        this.navigateToVideo(overlay, currentIdx - 1);
                    });
                    newPrevButton.addEventListener('touchend', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const currentIdx = parseInt(overlay.dataset.currentVideoIndex || '0', 10);
                        this.navigateToVideo(overlay, currentIdx - 1);
                    });
                }
            }
            
            if (nextButton) {
                nextButton.disabled = !hasNext;
                // Remove all existing listeners by cloning (simplest way)
                const newNextButton = nextButton.cloneNode(true);
                nextButton.parentNode.replaceChild(newNextButton, nextButton);
                
                if (hasNext) {
                    newNextButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const currentIdx = parseInt(overlay.dataset.currentVideoIndex || '0', 10);
                        this.navigateToVideo(overlay, currentIdx + 1);
                    });
                    newNextButton.addEventListener('touchend', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const currentIdx = parseInt(overlay.dataset.currentVideoIndex || '0', 10);
                        this.navigateToVideo(overlay, currentIdx + 1);
                    });
                }
            }
        }

        // Update URL
        this.updateURL(newSeason, videoNumber);

        // Update aria-label
        overlay.setAttribute('aria-label', newVideo.title || 'Video Player');

        // Reset auto-hide controls (show them again after navigation)
        const closeButton = expandedContainer.querySelector('.video-close-button');
        if (closeButton && navContainer && overlay.dataset.autoHideCleanup === 'true') {
            closeButton.classList.remove('hidden');
            navContainer.classList.remove('hidden');
            // Trigger mouse move to restart auto-hide timer
            const mouseEvent = new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            overlay.dispatchEvent(mouseEvent);
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

    /**
     * Creates a commentary button for a video
     * @param {Object} video - Video data object
     * @param {string} timestamp - Timestamp in MM:SS format
     * @returns {HTMLElement}
     */
    createCommentaryButton(video, timestamp) {
        const button = document.createElement('button');
        button.className = 'video-commentary-button';
        button.setAttribute('aria-label', `Load commentary at ${timestamp}`);
        button.innerHTML = `<span class="commentary-icon">🎬</span> <span class="commentary-text">Commentary</span>`;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openCommentary(timestamp);
        });

        return button;
    }

    /**
     * Opens the director's commentary video at a specific timestamp
     * @param {string} timestamp - Timestamp in MM:SS format
     */
    openCommentary(timestamp) {
        // Convert MM:SS to seconds
        const [minutes, seconds] = timestamp.split(':').map(Number);
        const totalSeconds = minutes * 60 + seconds;

        // Create commentary video data
        const commentaryVideo = {
            id: 'UYfQUiVz7Yg',
            url: this.commentaryUrl,
            aspectRatio: '16:9',
            title: "Commentary - Season 1",
            startTime: totalSeconds
        };

        // Create overlay similar to expandVideo but for commentary
        const existingOverlay = document.querySelector('.video-overlay');
        if (existingOverlay) {
            this.closeVideo(existingOverlay);
        }

        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', "Commentary");

        const expandedContainer = document.createElement('div');
        expandedContainer.className = 'video-expanded-container';

        const closeButton = document.createElement('button');
        closeButton.className = 'video-close-button';
        closeButton.setAttribute('aria-label', 'Close commentary');
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.closeVideo(overlay));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.classList.contains('video-overlay')) {
                e.stopPropagation();
                this.closeVideo(overlay);
            }
        });

        expandedContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeVideo(overlay);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Create embed with timestamp
        let embedContainer;
        try {
            embedContainer = this.youtubeEmbed.createEmbed(commentaryVideo);
            embedContainer.classList.add('expanded-embed');
        } catch (error) {
            console.error('Error creating commentary embed:', error);
            embedContainer = document.createElement('div');
            embedContainer.className = 'video-error';
            embedContainer.innerHTML = '<p>Failed to load commentary video</p>';
        }

        // Create URL display element
        const urlContainer = document.createElement('div');
        urlContainer.className = 'commentary-url-container';
        
        const urlLabel = document.createElement('span');
        urlLabel.className = 'commentary-url-label';
        urlLabel.textContent = 'URL: ';
        
        const urlLink = document.createElement('a');
        urlLink.className = 'commentary-url-link';
        urlLink.href = this.commentaryUrl;
        urlLink.target = '_blank';
        urlLink.rel = 'noopener noreferrer';
        urlLink.textContent = this.commentaryUrl;
        urlLink.setAttribute('aria-label', 'Open commentary URL in new tab');
        
        urlContainer.appendChild(urlLabel);
        urlContainer.appendChild(urlLink);

        expandedContainer.appendChild(closeButton);
        expandedContainer.appendChild(embedContainer);
        expandedContainer.appendChild(urlContainer);
        overlay.appendChild(expandedContainer);

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        this.setupAutoHideControls(overlay, closeButton, document.createElement('div'));

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });
        });
    }

    /**
     * Creates the director's commentary section for Season 1
     * @returns {HTMLElement}
     */
    createCommentarySection() {
        const section = document.createElement('div');
        section.className = 'commentary-section';

        const heading = document.createElement('h2');
        heading.className = 'commentary-heading';
        heading.textContent = "Commentary";
        section.appendChild(heading);

        const description = document.createElement('p');
        description.className = 'commentary-description';
        description.textContent = "Watch the commentary for Season 1. Each video has a button above to jump directly to its commentary section.";
        section.appendChild(description);

        const commentaryButton = document.createElement('button');
        commentaryButton.className = 'commentary-section-button';
        commentaryButton.setAttribute('aria-label', "Load commentary");
        commentaryButton.innerHTML = '<span class="commentary-icon">🎬</span> <span>Watch Commentary</span>';
        
        commentaryButton.addEventListener('click', () => {
            this.openCommentary('00:00');
        });

        section.appendChild(commentaryButton);

        return section;
    }
}

export default VideoLoader;


