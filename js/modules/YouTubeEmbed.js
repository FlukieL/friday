/**
 * YouTubeEmbed Module
 * Handles YouTube video embedding, URL parsing, and oEmbed API integration
 */

class YouTubeEmbed {
    /**
     * Extracts video ID from various YouTube URL formats
     * @param {string} url - YouTube URL
     * @returns {string|null} Video ID or null if invalid
     */
    extractVideoId(url) {
        if (!url) return null;

        // Handle regular watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (watchMatch) {
            return watchMatch[1];
        }

        // Handle shorts URLs: https://youtube.com/shorts/VIDEO_ID
        const shortsMatch = url.match(/youtube\.com\/shorts\/([^&\n?#]+)/);
        if (shortsMatch) {
            return shortsMatch[1];
        }

        return null;
    }

    /**
     * Generates YouTube embed URL
     * @param {string} videoId - YouTube video ID
     * @returns {string} Embed URL
     */
    getEmbedUrl(videoId) {
        if (!videoId) return '';
        return `https://www.youtube.com/embed/${videoId}`;
    }

    /**
     * Generates YouTube thumbnail URL
     * @param {string} videoId - YouTube video ID
     * @param {string} quality - Thumbnail quality: 'maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'default'
     * @returns {string} Thumbnail URL
     */
    getThumbnailUrl(videoId, quality = 'maxresdefault') {
        if (!videoId) return '';
        // Try maxresdefault first, fallback to sddefault if not available
        return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
    }

    /**
     * Fetches video title from YouTube oEmbed API
     * @param {string} url - YouTube video URL
     * @returns {Promise<string>} Video title
     */
    async fetchVideoTitle(url) {
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const response = await fetch(oembedUrl);
            
            if (!response.ok) {
                throw new Error(`oEmbed API error: ${response.status}`);
            }

            const data = await response.json();
            return data.title || 'Untitled Video';
        } catch (error) {
            console.warn(`Failed to fetch title for ${url}:`, error);
            return null;
        }
    }

    /**
     * Calculates padding-bottom percentage for aspect ratio
     * @param {string} aspectRatio - Aspect ratio string (e.g., "16:9" or "4:3")
     * @returns {number} Padding-bottom percentage
     */
    getAspectRatioPadding(aspectRatio) {
        const ratios = {
            '16:9': 56.25,
            '4:3': 75,
            '1:1': 100
        };

        return ratios[aspectRatio] || ratios['16:9'];
    }

    /**
     * Creates a responsive YouTube embed iframe
     * @param {Object} videoData - Video data object
     * @param {string} videoData.id - Video ID
     * @param {string} videoData.url - Video URL
     * @param {string} videoData.aspectRatio - Aspect ratio (default: "16:9")
     * @returns {HTMLElement} Container div with embedded iframe
     */
    createEmbed(videoData) {
        const videoId = videoData.id || this.extractVideoId(videoData.url);
        
        if (!videoId) {
            throw new Error('Invalid video data: missing video ID or URL');
        }

        const embedUrl = this.getEmbedUrl(videoId);
        const aspectRatio = videoData.aspectRatio || '16:9';
        const paddingBottom = this.getAspectRatioPadding(aspectRatio);

        // Create container
        const container = document.createElement('div');
        container.className = 'video-embed-container';
        if (aspectRatio === '4:3') {
            container.classList.add('aspect-4-3');
        }

        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        iframe.title = videoData.title || 'YouTube video player';

        container.appendChild(iframe);

        return container;
    }

    /**
     * Batch fetches titles for multiple videos
     * @param {Array<Object>} videos - Array of video objects with url property
     * @returns {Promise<Array<Object>>} Videos with fetched titles
     */
    async fetchTitlesForVideos(videos) {
        const titlePromises = videos.map(async (video) => {
            if (video.title) {
                return video; // Already has title
            }

            const title = await this.fetchVideoTitle(video.url);
            return {
                ...video,
                title: title || 'Untitled Video'
            };
        });

        return Promise.all(titlePromises);
    }
}

export default YouTubeEmbed;

