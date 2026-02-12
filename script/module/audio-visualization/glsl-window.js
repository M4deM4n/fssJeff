import { MovableResizableWindow } from "/script/module/window/window.js";

export class GlslWindow extends MovableResizableWindow
{
    constructor(id = 'gl-visualizer', config = {}) {
        super(id, config);
        this.id = id;

        this.canvas = this.element.querySelector('canvas');
        this.bufferContainer = this.element.querySelector('.buffer, .gl-visualizer-buffer, [id$="-buffer"]')
            || this.canvas?.parentElement;

        if (this.canvas && this.bufferContainer) {
            this.#initCanvasResize();
        }
    }

    #initCanvasResize() {
        this.resizeObserver = new ResizeObserver(() => this.resizeCanvasToParent());
        this.resizeObserver.observe(this.bufferContainer);
        this.resizeCanvasToParent(); // Initial sizing
    }

    resizeCanvasToParent() {
        if (!this.canvas || !this.bufferContainer) return;

        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.bufferContainer.clientWidth;
        const displayHeight = this.bufferContainer.clientHeight;

        // Set drawing buffer size
        this.canvas.width = Math.floor(displayWidth * dpr);
        this.canvas.height = Math.floor(displayHeight * dpr);

        // Set CSS display size to match parent
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';

        // Update WebGL viewport if context exists
        const gl = this.canvas.getContext('webgl');
        if (gl) {
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}