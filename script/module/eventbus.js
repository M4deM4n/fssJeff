class EventBus extends EventTarget {
    on(type, listener) {
        this.addEventListener(type, listener)
    }
    once(type, listener) {
        this.addEventListener(type, listener, {once: true})
    }
    off(type, listener) {
        this.removeEventListener(type, listener)
    }
    emit(type, data) {
        const evt = new CustomEvent(type, {detail: data})
        this.dispatchEvent(evt)
    }
}

export default new EventBus();