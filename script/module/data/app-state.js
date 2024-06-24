export const appState = {
    lastPID: 10,
    processes: [],
    commandHistory: [],
    zIndex: 10,

    getPID: function() {
        this.lastPID++;
        return this.lastPID;
    },

    getProcess: function(pid) {
        return appState.processes.filter((el) => el.pid === pid);
    },

    getProcessById(id) {
        return appState.processes.filter((el) => el.id === id);
    }
}