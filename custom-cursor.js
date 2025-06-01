class CustomCursor extends HTMLElement {
    constructor() {
        super();
        
        this.position = { x: 0, y: 0 };
        this.prevPositions = [];
        this.isClicking = false;
        this.isMouseMoving = false;
        this.lastMousePosition = { x: 0, y: 0 };
        this.timeoutId = null;

        this.cursorConfig = {
            main: {
                clickScale: 0.9,
                transitionDuration: 0,
            },
            trail: [
                { delay: 2, clickScale: 1.1, transitionDuration: 0.1 },
                { delay: 4, clickScale: 1.1, transitionDuration: 0.2 },
                { delay: 6, clickScale: 1.1, transitionDuration: 0.3 },
                { delay: 8, clickScale: 1.1, transitionDuration: 0.4 },
            ],
            trailLength: 15,
        };

        // Color themes
        this.themes = {
            orange: {
                main: [255, 160, 0],
                trail: [
                    [255, 190, 0],
                    [255, 215, 0],
                    [255, 235, 0],
                    [255, 255, 0]
                ]
            },
            blue: {
                main: [0, 71, 171],
                trail: [
                    [0, 105, 192],
                    [0, 144, 178],
                    [0, 178, 135],
                    [0, 196, 98]
                ]
            },
            magenta: {
                main: [255, 0, 255],
                trail: [
                    [238, 130, 238],
                    [147, 112, 219],
                    [72, 209, 204],
                    [0, 255, 127]
                ]
            }
        };
        
        this.mouseMove = this.mouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        this.createElements();
        this.addStyles();
    }

    static get observedAttributes() {
        return ['theme'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'theme' && oldValue !== newValue) {
            this.addStyles();
        }
    }
    
    createElements() {
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'cursor';
        this.appendChild(this.mainCursor);
        
        this.trailCursors = [];
        this.cursorConfig.trail.forEach((_, index) => {
            const trailCursor = document.createElement('div');
            trailCursor.className = `cursor-additional cursor-additional-${index + 1}`;
            this.appendChild(trailCursor);
            this.trailCursors.push(trailCursor);
        });
    }

    getCurrentTheme() {
        const theme = this.getAttribute('theme') || 'orange';
        return this.themes[theme] || this.themes.orange;
    }

    generateThemeCSS() {
        const currentTheme = this.getCurrentTheme();
        const [r, g, b] = currentTheme.main;

        let css = `
            .cursor {
                width: 20px;
                height: 20px;
                background-color: rgba(${r}, ${g}, ${b}, 0.8);
                border: 10px solid rgba(${r}, ${g}, ${b}, 0.3);
                box-shadow: 0 0 16px rgba(${r}, ${g}, ${b}, 0.8);
                border-radius: 50%;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 99999;
                pointer-events: none;
                transform-origin: center;
                will-change: transform, box-shadow;
                animation: cursor-pulse 3s infinite ease-in-out;
            }

            @keyframes cursor-pulse {
                0%, 100% {
                    box-shadow: 0 0 10px rgba(${r}, ${g}, ${b}, 0.6);
                    opacity: 0.7;
                }
                50% {
                    box-shadow: 0 0 22px rgba(${r}, ${g}, ${b}, 0.9);
                    opacity: 1;
                }
            }
        `;

        // Generate trail cursor styles
        currentTheme.trail.forEach((color, index) => {
            const [tr, tg, tb] = color;
            const sizes = [
                { width: 16, height: 16, border: 8 },
                { width: 12, height: 12, border: 6 },
                { width: 8, height: 8, border: 4 },
                { width: 4, height: 4, border: 2 }
            ];
            const opacities = [0.25, 0.2, 0.25, 0.2];
            const delays = ['.25s', '.5s', '.75s', '1s'];
            const shadowSizes = [12, 10, 7, 4];
            const shadowOpacities = [0.7, 0.6, 0.7, 0.6];
            const pulseOpacities = [
                { start: 0.6, end: 0.9, shadowStart: 8, shadowEnd: 18 },
                { start: 0.6, end: 0.9, shadowStart: 6, shadowEnd: 15 },
                { start: 0.6, end: 0.9, shadowStart: 4, shadowEnd: 12 },
                { start: 0.6, end: 0.9, shadowStart: 2, shadowEnd: 8 }
            ];

            const size = sizes[index];
            const opacity = opacities[index];
            const delay = delays[index];
            const shadowSize = shadowSizes[index];
            const shadowOpacity = shadowOpacities[index];
            const pulseOpacity = pulseOpacities[index];

            css += `
                .cursor-additional-${index + 1} {
                    width: ${size.width}px;
                    height: ${size.height}px;
                    background-color: rgba(${tr}, ${tg}, ${tb}, 0.8);
                    border: ${size.border}px solid rgba(${tr}, ${tg}, ${tb}, ${opacity});
                    box-shadow: 0 0 ${shadowSize}px rgba(${tr}, ${tg}, ${tb}, ${shadowOpacity});
                    animation: pulse-${index + 1} 3s infinite ease-in-out;
                    animation-delay: ${delay};
                }

                @keyframes pulse-${index + 1} {
                    0%, 100% {
                        box-shadow: 0 0 ${pulseOpacity.shadowStart}px rgba(${tr}, ${tg}, ${tb}, ${pulseOpacity.start});
                        opacity: ${pulseOpacity.start};
                    }
                    50% {
                        box-shadow: 0 0 ${pulseOpacity.shadowEnd}px rgba(${tr}, ${tg}, ${tb}, ${pulseOpacity.end});
                        opacity: 1;
                    }
                }
            `;
        });

        return css;
    }
    
    addStyles() {
        // Remove existing styles if they exist
        const existingStyle = document.head.querySelector('#custom-cursor-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = 'custom-cursor-styles';
        style.textContent = `
            custom-cursor {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 99999;
            }
            
            ${this.generateThemeCSS()}

            .cursor-additional {
                position: fixed;
                top: 0;
                left: 0;
                border-radius: 50%;
                z-index: 99998;
                pointer-events: none;
                will-change: box-shadow, opacity;
                transform-origin: center;
            }
            
            @media (pointer: coarse) {
                .cursor,
                .cursor-additional {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    mouseMove(e) {
        this.position = { x: e.clientX, y: e.clientY };
        this.lastMousePosition = { x: e.clientX, y: e.clientY };
        this.isMouseMoving = true;

        const newPositions = [...this.prevPositions];
        newPositions.unshift({ x: e.clientX, y: e.clientY });
        this.prevPositions = newPositions.slice(0, this.cursorConfig.trailLength);

        this.updateMainCursor();
        this.updateTrailCursors();

        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            this.isMouseMoving = false;
        }, 100);
    }
    
    handleMouseDown() {
        this.isClicking = true;
        this.updateMainCursor();
        this.updateTrailCursors();
    }
    
    handleMouseUp() {
        this.isClicking = false;
        this.updateMainCursor();
        this.updateTrailCursors();
    }
    
    updateMainCursor() {
        const x = this.position.x - 10;
        const y = this.position.y - 10;
        const scale = this.isClicking ? this.cursorConfig.main.clickScale : 1;
        
        this.mainCursor.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        this.mainCursor.style.transition = `transform ${this.cursorConfig.main.transitionDuration}s ease-out`;
    }
    
    updateTrailCursors() {
        this.cursorConfig.trail.forEach((circle, index) => {
            const delayedPosition = this.getDelayedPosition(circle.delay);
            const scale = this.isClicking ? circle.clickScale : 1;
            const trailCursor = this.trailCursors[index];
            
            const x = delayedPosition.x - 5;
            const y = delayedPosition.y - 5;
            
            trailCursor.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
            trailCursor.style.transition = `transform ${circle.transitionDuration}s ease-out`;
        });
    }
    
    getDelayedPosition(delay) {
        if (!this.isMouseMoving) {
            return this.lastMousePosition;
        } else {
            const index = Math.min(delay, this.prevPositions.length - 1);
            if (this.prevPositions[index]) {
                return this.prevPositions[index];
            } else {
                return this.position;
            }
        }
    }
    
    connectedCallback() {
        window.addEventListener("mousemove", this.mouseMove);
        window.addEventListener("mousedown", this.handleMouseDown);
        window.addEventListener("mouseup", this.handleMouseUp);
    }
    
    disconnectedCallback() {
        window.removeEventListener("mousemove", this.mouseMove);
        window.removeEventListener("mousedown", this.handleMouseDown);
        window.removeEventListener("mouseup", this.handleMouseUp);
        clearTimeout(this.timeoutId);
    }
}

customElements.define('custom-cursor', CustomCursor);