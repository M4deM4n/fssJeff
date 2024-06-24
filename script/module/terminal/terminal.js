import { MovableResizableWindow } from "/script/module/window/window.js";
import { isNumeric, getFormattedDate } from "/script/module/utils.js";
import {appState} from "/script/module/data/app-state.js";
import {motd, defaultTabCompleteFilters, helpOutput} from "/script/module/data/app-data.js";
import {fileSystem} from "/script/module/file-system/file-system.js";
import EventBus from "/script/module/event-bus";

export class Terminal extends MovableResizableWindow {

    constructor(id = 'terminal', config = {}) {
        super(id, config);
        
        this.id = id;
        this.pid = 10;

        this.historyIndex = -1;
        this.commandHistory = [];

        this.#init();
    }

    #init() {
        // buffer referring to the div that will contain the output
        this.buffer = document.getElementById(this.id + '-buffer');
        this.termInputContainer = document.getElementById(this.id + '-input-container');
        this.termInput = document.getElementById(this.id + '-input');

        // buffer and input are required
        if(this.buffer == null) { throw new Error("Element with id: '" + this.id + "-buffer' not found."); }
        if(this.termInput == null) { throw new Error("Element with id: '" + this.id + "-input' not found."); }

        this.#addEventListeners();
        this.#addKeyboardListener();
    }

    #addEventListeners() {
        // focus input when buffer is clicked
        this.buffer.addEventListener('click', (e) => {
            appState.zIndex++;
            this.element.style.zIndex = appState.zIndex;

            this.termInput.focus();
        });
    }

    #addKeyboardListener() {
        this.termInput.addEventListener('keydown', (e) => {
            let resetIndex = true;

            if(e.key === 'Tab') {
                e.preventDefault();

                const cmdArray = this.termInput.value.split(' ');
                this.#handleTabCompletion(cmdArray);
            }

            if(e.key === 'ArrowUp') {
                e.preventDefault();
                if(this.historyIndex === -1) {
                    this.historyIndex = this.commandHistory.length -1;
                    this.termInput.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = ((this.historyIndex - 1) < 0 ? 0 : this.historyIndex - 1);
                    this.termInput.value = this.commandHistory[this.historyIndex];
                }
                resetIndex = false;
            }

            if(e.key === 'ArrowDown') {
                e.preventDefault();
                if(this.historyIndex !== -1 && this.historyIndex < this.commandHistory.length) {
                    this.historyIndex = ((this.historyIndex + 1) === this.commandHistory.length ? this.historyIndex : this.historyIndex + 1);
                    this.termInput.value = this.commandHistory[this.historyIndex];
                }

                resetIndex = false;
            }

            if(e.key === 'Enter') {
                this.historyIndex = -1;
                this.commandHistory.push(this.termInput.value);
                this.#executeCommand(this.termInput.value);
                this.termInput.value = (this.termInput.value !== 'exiting...' ? '' : this.termInput.value);
                this.buffer.scrollTop = this.buffer.scrollHeight;

            }

            if(resetIndex) { this.historyIndex = -1; }
        })
    }

    #handleTabCompletion(cmdArray) {
        var completeList = [...defaultTabCompleteFilters];
        let onlyExecutables = false;
        let onlyFolders = false ;
        let onlyFiles = false;
        let cmd = cmdArray[cmdArray.length -1];

        if(cmdArray.length >= 3) {
            switch(cmdArray[1]) {
                case 'cd':
                    onlyFolders = true;
                    break;

                case 'ls':
                    onlyFolders = true;
                    break;

                case 'cat':
                    onlyFiles = true;
                    break;
            }
        }

        if(cmd.substring(0,2) === './') {
            cmd = cmd.replace('./','');
            onlyExecutables = true;
        }

        const filesFolders = fileSystem.ls();

        for(let i = 0; i < filesFolders.length; i++) {
            const item = filesFolders[i];

            if(onlyFolders) {
                if(item.type === 2) {
                    completeList.push(item.name);
                    continue;
                }
            }

            if(onlyExecutables) {
                if(item.type === 1) {
                    completeList.push(item.name);
                    continue;
                }
            }

            if(onlyFiles) {
                if(item.type === 0) {
                    completeList.push(item.name);
                    continue;
                }
            }

            if(onlyFiles === false && onlyFolders === false && onlyExecutables === false) {
                completeList.push(item.name);
            }
        }

        const matches = completeList.filter(match => match.startsWith(cmd));

        if(matches.length === 1) {
            this.termInput.value = this.termInput.value.replace(cmd, matches[0]);
            this.termInput.focus();
        }
    }

    #executeCommand(cmdArgs) {

        this.writeToBuffer('$ ' + cmdArgs);

        cmdArgs = cmdArgs.split(' ');
        const command = cmdArgs.shift();

        switch(command) {
            case 'help':
                this.#help(cmdArgs);
                break;
            case 'cat':
                try { this.slowWrite(fileSystem.cat(cmdArgs[0])); }
                catch (e) { this.writeToBuffer(e.message); }
                break;
            case 'pwd':
                this.writeToBuffer(fileSystem.pwd());
                break;
            case 'cd':
                try { fileSystem.cd(cmdArgs[0]); }
                catch (e) { this.writeToBuffer(e.message) }
                break;
            case 'whoami':
                this.writeToBuffer('Guest');
                break;
            case 'clear':
                this.resetBuffer(false);
                break;
            case 'exit':
                this.#exit();
                break;
            case 'ps':
                this.#ps();
                break;
            case 'ls':
                this.#ls(cmdArgs);
                break;
            case 'kill':
                this.#kill(cmdArgs);
                break;
            default:
                if(command.substring(0,2) === './') {
                    this.#exec(command);
                    break;
                }
                this.writeToBuffer(cmdArgs[0] + ': command not found');
        }
    }

    #help(args = []) {
        if(args.length > 1) { return this.writeToBuffer('help: Too many arguments')}
        if(args.length === 1) { return this.writeToBuffer(this.#helpFor(args[0]))}

        this.writeToBuffer(helpOutput);
    }

    #helpFor(command = "") {
        let output = '';
        switch(command) {

        }

        return output;
    }

    #exec(cmd) {
        // console.log(cmd.substring(2));
        const command = cmd.substring(2);

        let el = document.getElementById(command);
        if(el === null) { return this.writeToBuffer(`-terminal: ${cmd}: No such file or directory`); }

        setTimeout(() => {
            EventBus.emit('launch-app', { id: command });
        }, 250);

    }

    #ls(path = ['.']) {
        let listFormat = false;
        let lsPath = (path.length > 0 ? path[0] : '.');

        if(path.length >= 1) {
            if(path[0].startsWith('-') && path[0].includes('l')) {
                listFormat = true;
                lsPath = (path.length === 2 ? path[1] : '.');
            }
        }

        // get & sort contents
        let contents = [];
        try { contents = fileSystem.ls(lsPath); }
        catch (e) { return this.writeToBuffer(e.message); }
        contents.sort();

        // format output
        let output = '';
        if(listFormat) {
            output = this.#lsListOutput(contents);
        } else {
            output = this.#lsStdOutput(contents);
        }

        this.writeToBuffer(output);
    }

    #lsListOutput(contents) {
        const permissions = 'rwxr-x-r-';

        let output = '<table class="ls-list-table">'
        output += `<tr><td colspan="7">total ${contents.length}</td></tr>`;
        for(let i = 0; i < contents.length; i++) {
            const item = contents[i];
            if(item.type === 2) {
                output += `<tr><td>d${permissions}x</td>`
                output += `<td>2</td>`
                output += `<td>Guest</td><td>Guest</td>`
                output += `<td>4096</td>`
                output += `<td>${getFormattedDate(true)}</td>`
                output += `<td><span class="term-dir-color">${item.name}</span></td></tr>`
                continue
            }

            if(item.type === 1) {
                output += `<tr><td>-${permissions}x</td>`
                output += `<td>1</td>`
                output += `<td>Guest</td><td>Guest</td>`
                output += `<td>${item.size}</td>`
                output += `<td>${getFormattedDate(true)}</td>`
                output += `<td><span class="term-exec-color">${item.name}</span></td></tr>`
                continue
            }

            output += `<tr><td>-${permissions}-</td>`
            output += `<td>1</td>`
            output += `<td>Guest</td><td>Guest</td>`
            output += `<td>${item.size}</td>`
            output += `<td>${getFormattedDate(true)}</td>`
            output += `<td>${item.name}</td></tr>`
        }


        output += '</table>';
        return output;
    }

    #lsStdOutput(contents) {
        let rows = Math.ceil(contents.length / 6);
        let output = '<table class="ls-table">'

        for(let i = 0; i < rows; i++) {
            output += '<tr>';

            for(let j = 0; j < 6; j++) {
                if(contents[j] === undefined) { break; }

                let item = (contents[j].isDirectory ? `<span class="term-dir-color">${contents[j].name}</span>` : contents[j].name);
                if(contents[j].type === 2) {
                    item = `<span class="term-dir-color">${contents[j].name}</span>`;
                } else if(contents[j].type === 1) {
                    item = `<span class="term-exec-color">${contents[j].name}</span>`;
                } else {
                    item = contents[j].name;
                }

                output += `<td>${item}</td>`;
            }
            output += '</tr>';
        }

        output += '</table>';
        return output;
    }

    #kill(args) {
        if(args[0] === undefined) {
            return this.writeToBuffer('kill: usage: kill &lt;pid&gt;');
        }

        if(args.length > 1) {
            return this.writeToBuffer('kill: Too man arguments!');
        }

        let pid = args[0];
        if(isNumeric(pid)) {
            // string to number hack
            pid = pid * 1;

            if(pid === this.pid) {
                return this.#exit();
            }

            let targetProc = appState.processes.filter((el) => el.pid === pid);
            if(targetProc.length < 1) {
                return this.writeToBuffer(`kill: (${pid}) - No such process`);
            }

            let killTarget = document.getElementById(targetProc[0].id);
            if(killTarget === null) {
                console.log(targetProc.id);
                return;
            }

            let proc = appState.getProcess(pid);

            setTimeout(() => {
                EventBus.emit('close-app', proc[0]);
            }, 250);

            return;
        }

        return this.writeToBuffer('kill: usage: kill &lt;pid&gt;');
    }

    #ps() {
        let output = '<table class="ps-table"><tr><td>PID</td><td>TTY</td><td>TIME</td><td>CMD</td></tr>';
        appState.processes.forEach((proc) => {
            output += `<tr><td>${proc.pid}</td><td>pts/0</td><td>00:00:00</td><td>${proc.name}</td>`;
        })
        output += '</table>';

        this.writeToBuffer(output);
    }

    #exit(kill = false) {
        appState.processes = appState.processes.filter((el) => el.pid !== this.pid);
        if(this.externalTrigger) {
            this.externalTrigger.classList.remove('selected');
            this.externalTrigger.classList.remove(this.id + '-btn-selected');
        }
        if(kill) {
            this.element.style.display = 'none';
            EventBus.emit('window-closed', { id: this.element.id });
        } else {
            this.termInput.value = 'exiting...';
            setTimeout(() => {
                this.element.style.display = 'none';
                EventBus.emit('window-closed', { id: this.element.id });
            }, 200);
        }
    }

    show() {
        // add pid to running process list
        this.pid = appState.getPID();
        appState.processes.push({ id: this.id, pid: this.pid, name: 'terminal' });

        appState.zIndex++;
        this.element.style.zIndex = appState.zIndex;

        // show terminal & clear "buffer"
        this.element.style.display = 'block';
        this.resetBuffer();
    }

    hide() {
        appState.processes = appState.processes.filter((el) => el.pid !== this.pid);

        this.element.style.display = 'none';
        this.buffer.innerHTML = '';

        if(this.externalTrigger) {
            this.externalTrigger.classList.remove('selected');
            this.externalTrigger.classList.remove(this.id + '-btn-selected');
        }
    }

    toggle() {
        if(this.element.style.display === 'none') {
            this.show();
            return true;
        }

        this.hide();
        return false;
    }

    slowWrite(content = '', speed = 0) {
        const lines = content.split("\n");
        let i = 0;

        const printLine = () => {
            if(i < lines.length) {
                this.writeToBuffer(lines[i]); i++;  // There's two commands here.
                setTimeout(printLine, speed);
            }
        }
        setTimeout(printLine,speed);
    }

    writeToBuffer(line) {
        if(this.buffer.childElementCount !== 0) {
            this.buffer.removeChild(this.termInputContainer);
        }

        let el = document.createElement('p');
        el.classList.add('wordwrap');
        el.innerHTML = line;
        this.buffer.appendChild(el);

        this.buffer.appendChild(this.termInputContainer);
        this.termInput.focus();
    }

    resetBuffer(printMotd = true) {
        if(this.buffer.childElementCount !== 0) {
            this.buffer.removeChild(this.termInputContainer);
        }

        this.buffer.innerHTML = '';
        if(printMotd) { this.slowWrite(motd) }

        // scroll to the bottom of the "buffer"
        this.buffer.scrollTop = this.buffer.scrollHeight;
        this.termInput.value = '';

        this.buffer.appendChild(this.termInputContainer);
        this.termInput.focus();
    }
}

