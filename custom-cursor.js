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
        
        this.mouseMove = this.mouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        this.createElements();
        this.addStyles();
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
    
    addStyles() {
        if (document.head.querySelector('#custom-cursor-styles')) {
            return;
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
            
            .cursor {
                width: 20px;
                height: 20px;
                background-color: rgba(255, 160, 0, 0.8);
                border: 10px solid rgba(255, 160, 0, 0.3);
                box-shadow: 0 0 16px rgba(255, 160, 0, 0.8);
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

            .cursor-additional-1 {
                width: 16px;
                height: 16px;
                background-color: rgba(255, 190, 0, 0.8);
                border: 8px solid rgba(255, 190, 0, 0.25);
                box-shadow: 0 0 12px rgba(255, 190, 0, 0.7);
                animation: pulse-1 3s infinite ease-in-out;
                animation-delay: .25s;
            }

            .cursor-additional-2 {
                width: 12px;
                height: 12px;
                background-color: rgba(255, 215, 0, 0.8);
                border: 6px solid rgba(255, 215, 0, 0.2);
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
                animation: pulse-2 3s infinite ease-in-out;
                animation-delay: .5s;
            }

            .cursor-additional-3 {
                width: 8px;
                height: 8px;
                background-color: rgba(255, 235, 0, 0.8);
                border: 4px solid rgba(255, 235, 0, 0.25);
                box-shadow: 0 0 7px rgba(255, 235, 0, 0.7);
                animation: pulse-3 3s infinite ease-in-out;
                animation-delay: .75s;
            }

            .cursor-additional-4 {
                width: 4px;
                height: 4px;
                background-color: rgba(255, 255, 0, 0.8);
                border: 2px solid rgba(255, 255, 0, 0.2);
                box-shadow: 0 0 4px rgba(255, 255, 0, 0.6);
                animation: pulse-4 3s infinite ease-in-out;
                animation-delay: 1s;
            }

            @keyframes cursor-pulse {
                0%, 100% {
                    box-shadow: 0 0 10px rgba(255, 160, 0, 0.6);
                    opacity: 0.7;
                }
                50% {
                    box-shadow: 0 0 22px rgba(255, 160, 0, 0.9);
                    opacity: 1;
                }
            }

            @keyframes pulse-1 {
                0%, 100% {
                    box-shadow: 0 0 8px rgba(255, 190, 0, 0.6);
                    opacity: 0.6;
                }
                50% {
                    box-shadow: 0 0 18px rgba(255, 190, 0, 0.9);
                    opacity: 1;
                }
            }

            @keyframes pulse-2 {
                0%, 100% {
                    box-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
                    opacity: 0.6;
                }
                50% {
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.9);
                    opacity: 1;
                }
            }

            @keyframes pulse-3 {
                0%, 100% {
                    box-shadow: 0 0 4px rgba(255, 235, 0, 0.6);
                    opacity: 0.6;
                }
                50% {
                    box-shadow: 0 0 12px rgba(255, 235, 0, 0.9);
                    opacity: 1;
                }
            }

            @keyframes pulse-4 {
                0%, 100% {
                    box-shadow: 0 0 2px rgba(255, 255, 0, 0.6);
                    opacity: 0.6;
                }
                50% {
                    box-shadow: 0 0 8px rgba(255, 255, 0, 0.9);
                    opacity: 1;
                }
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