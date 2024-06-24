import EventBus from "/script/module/event-bus.js";
import {appState} from "/script/module/data/app-state.js";

export class MovableResizableWindow {
    constructor(elementId, config = {}) {

        this.pid = 0;

        const externalTriggerId = (config.externalTriggerId ? config.externalTriggerId : null);
        this.minWidth = (config.minWidth ? config.minWidth : 0);
        this.minHeight = (config.minHeight ? config.minHeight : 0);

        this.element = document.getElementById(elementId);
        if(this.element === null) { throw new Error(`Specified element with the id '${elementId}' was not found.`); }

        this.titleBar = this.element.querySelector('.title-bar');
        this.closeButton = this.titleBar.querySelector('.close-button');
        this.externalTrigger = (externalTriggerId != null ? document.getElementById(externalTriggerId) : null);

        this.#initWindow();
        this.#initTrigger();
        this.#initDrag();
        this.#initResize();
        this.#initClose();
    }

    #initWindow() {
        if(this.element.classList.contains('hidden')) {
            this.element.classList.remove('hidden');
            this.element.style.display = 'none';
        }

        this.element.addEventListener('click', (e) => {
            appState.zIndex++;
            this.element.style.zIndex = appState.zIndex;
        })
    }

    #initTrigger() {
        if(this.externalTrigger) {
            this.externalTrigger.addEventListener('click', (e) => {
                e.stopPropagation();

                if(this.toggle?.()) {
                    this.externalTrigger.classList.add('selected');
                    this.externalTrigger.classList.add(this.id + '-btn-selected');
                } else {
                    this.externalTrigger.classList.remove('selected');
                    this.externalTrigger.classList.remove(this.id + '-btn-selected');
                }
            })
        }
    }

    #initDrag() {
        this.onMouseDownHandler = this.onMouseDown.bind(this);
        this.titleBar.addEventListener('mousedown', this.onMouseDownHandler);
    }

    #initClose() {
        this.onCloseClickHandler = this.onCloseClick.bind(this);
        this.closeButton.addEventListener('click', this.onCloseClickHandler);
    }

    #initResize() {
        const resizer = this.element.querySelector('.resizer');
        if(resizer === null) { return; }

        this.onResizeMouseDownHandler = this.onResizeMouseDown.bind(this);
        resizer.addEventListener('mousedown', this.onResizeMouseDownHandler);
    }

    onMouseDown(e) {
        e.preventDefault();
        appState.zIndex++;
        this.element.style.zIndex = appState.zIndex;

        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startLeft = parseInt(document.defaultView.getComputedStyle(this.element).left, 10);
        this.startTop = parseInt(document.defaultView.getComputedStyle(this.element).top, 10);
        this.mouseMoveHandler = this.onMouseMove.bind(this);
        this.mouseUpHandler = this.onMouseUp.bind(this);
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
    }

    onMouseMove(e) {
        e.preventDefault();
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        this.element.style.left = `${this.startLeft + dx}px`;
        this.element.style.top = `${this.startTop + dy}px`;
    }

    onMouseUp(e) {
        e.preventDefault();
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('mouseup', this.mouseUpHandler);
    }

    onResizeMouseDown(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent the drag handler from being triggered
        this.startWidth = this.element.offsetWidth;
        this.startHeight = this.element.offsetHeight;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.resizeMouseMoveHandler = this.onResizeMouseMove.bind(this);
        this.resizeMouseUpHandler = this.onResizeMouseUp.bind(this);
        document.addEventListener('mousemove', this.resizeMouseMoveHandler);
        document.addEventListener('mouseup', this.resizeMouseUpHandler);
    }

    onResizeMouseMove(e) {
        e.preventDefault();
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;

        let newWidth = this.startWidth + dx;
        let newHeight = this.startHeight + dy;

        if(this.minWidth > 0) {
            if(newWidth >= this.minWidth) {
                this.element.style.width = `${this.startWidth + dx}px`;
            }
        } else {
            this.element.style.width = `${this.startWidth + dx}px`;
        }

        if(this.minHeight > 0) {
            if(newHeight >= this.minHeight) {
                this.element.style.height = `${this.startHeight + dy}px`;
            }
        } else {
            this.element.style.height = `${this.startHeight + dy}px`;
        }
    }

    onResizeMouseUp(e) {
        e.preventDefault();
        document.removeEventListener('mousemove', this.resizeMouseMoveHandler);
        document.removeEventListener('mouseup', this.resizeMouseUpHandler);
    }

    onCloseClick(e) {
        e.preventDefault();
        this.element.style.display = 'none';

        if(this.externalTrigger) {
            this.externalTrigger.classList.remove('selected');
        }

        appState.processes = appState.processes.filter((el) => el.pid !== this.pid);
        // EventBus.emit('window-closed', { id: this.element.id });
        this.hide?.();
    }

    toggle() {
        if(this.element.style.display === 'none') {
            this.element.style.display = 'block';
        } else {
            this.element.style.display = 'none';
        }
    }
}