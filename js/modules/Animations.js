/**
 * Animations Module
 * Provides animation utilities and helpers
 */

class Animations {
    /**
     * Checks if user prefers reduced motion
     * @returns {boolean}
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Fades in an element
     * @param {HTMLElement} element - Element to fade in
     * @param {number} duration - Animation duration in ms
     * @returns {Promise<void>}
     */
    fadeIn(element, duration = 300) {
        if (this.prefersReducedMotion()) {
            element.style.opacity = '1';
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-in`;
            
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                setTimeout(resolve, duration);
            });
        });
    }

    /**
     * Fades out an element
     * @param {HTMLElement} element - Element to fade out
     * @param {number} duration - Animation duration in ms
     * @returns {Promise<void>}
     */
    fadeOut(element, duration = 300) {
        if (this.prefersReducedMotion()) {
            element.style.opacity = '0';
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '0';
            setTimeout(resolve, duration);
        });
    }

    /**
     * Fades between two elements (out then in)
     * @param {HTMLElement} outElement - Element to fade out
     * @param {HTMLElement} inElement - Element to fade in
     * @param {number} duration - Animation duration in ms
     * @returns {Promise<void>}
     */
    async fadeBetween(outElement, inElement, duration = 300) {
        if (this.prefersReducedMotion()) {
            if (outElement) outElement.style.display = 'none';
            if (inElement) inElement.style.display = 'block';
            return;
        }

        if (outElement) {
            await this.fadeOut(outElement, duration);
            outElement.style.display = 'none';
        }

        if (inElement) {
            inElement.style.display = 'block';
            await this.fadeIn(inElement, duration);
        }
    }

    /**
     * Animates elements with a stagger effect
     * @param {HTMLElement[]} elements - Array of elements to animate
     * @param {number} staggerDelay - Delay between each element in ms
     * @param {number} duration - Animation duration in ms
     */
    staggerFadeIn(elements, staggerDelay = 100, duration = 300) {
        if (this.prefersReducedMotion()) {
            elements.forEach(el => {
                if (el) el.style.opacity = '1';
            });
            return;
        }

        elements.forEach((element, index) => {
            if (!element) return;

            setTimeout(() => {
                this.fadeIn(element, duration);
            }, index * staggerDelay);
        });
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement} element - Element to scroll to
     * @param {Object} options - Scroll options
     */
    smoothScrollTo(element, options = {}) {
        if (this.prefersReducedMotion()) {
            element.scrollIntoView({ behavior: 'auto', ...options });
            return;
        }

        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            ...options 
        });
    }

    /**
     * Adds fade-in animation delay to element
     * @param {HTMLElement} element - Element to animate
     * @param {number} delay - Delay in ms
     */
    setFadeInDelay(element, delay) {
        if (this.prefersReducedMotion()) {
            element.style.opacity = '1';
            return;
        }

        element.style.opacity = '0';
        element.style.animationDelay = `${delay}ms`;
    }
}

export default Animations;


