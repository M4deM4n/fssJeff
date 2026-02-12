// import { FileSystemData } from "./file-system";
import EventBus from "./event-bus";

const motd = `
&nbsp;
&nbsp;
&nbsp;
                                                          __
 _ _ _     _                        _____             _  |  |
| | | |___| |___ ___ _____ ___     |   __|_ _ ___ ___| |_|  |
| | | | -_| |  _| . |     | -_|_   |  |  | | | -_|_ -|  _|__|
|_____|___|_|___|___|_|_|_|___| |  |_____|___|___|___|_| |__|
                             |_|
&nbsp;
&nbsp;
System information as of Thu May 16 22:37:37 PDT 2024
&nbsp;
System load:  0.0                Processes:             128
Usage of /:   0.69% of 420TB     Users logged in:       0
Memory usage: 0%                 IPv4 address for eth0: 10.0.0.1
Swap usage:   0%
&nbsp;
Welcome to my web-application. My 'documents' folder contains info about myself,
what I do, and what I've done. My name is Jeff, and i like to write software,
make music and games, and hike.
&nbsp;
For a list of commands, type 'help'.
&nbsp;

`


export class Terminal {

    // constructor
    constructor(terminalIDPrefix = 'terminal') {
        this.id = terminalIDPrefix;
        this.title = document.getElementById(this.id + '-title');       // expected div
        this.buffer = document.getElementById(this.id + '-buffer');     // expected div
        this.termInput = document.getElementById(this.id + '-input');   // expected text input

        this.updateTitle = (this.title == null ? false : true);
        if(this.buffer == null) { throw new Error("Element with id: '" + this.id + "-buffer' not found."); }
        if(this.termInput == null) { throw new Error("Element with id: '" + this.id + "-input' not found."); }
    }

    // This method initializes the event listeners.
    init() {
        this.#addEventListeners();
        EventBus.on('window-close', (event) => {
            if(event.detail.winID == this.id + '-window') {
                this.buffer.innerHTML = '';
            }
        })

        EventBus.on('window-open', (event) => {
            if(event.detail.winID == this.id + '-window') {
                if(this.title) {
                    // this.title.innerHTML = 'jTerm: ~';
                }
                this.printMotd();
                this.termInput.value = '$ ';
                this.termInput.setSelectionRange(2,2);
                this.termInput.focus();
            }
        })
    }

    printMotd() {
        var motdLines = motd.split("\n");
        let printSpeed = 5;
        let i = 0;


        const printLine = () => {
            if(i < motdLines.length) {
                this.writeLine(motdLines[i]);
                i++;
                setTimeout(printLine, printSpeed);
            }
        }
        printLine();

        // let limit = motdLines.length;
        // for(let i = 0; i < limit; i++) {
        //     console.log(motdLines[i]);
        //     this.writeLine(motdLines[i]);
        // }
    }

    #addEventListeners() {
        // focus input when buffer is clicked
        this.buffer.addEventListener('click', (e) => {
            this.termInput.focus();
        });

        this.termInput.addEventListener('keydown', (e) => {
            if(e.key === 'Backspace') {
                if(e.target.value.length <= 2) {
                    e.preventDefault();
                }
            }

            if(e.key === 'Enter') {
                this.#executeCommand(this.termInput.value);
                this.termInput.value = '$ ';
                this.buffer.scrollTop = this.buffer.scrollHeight;
            }
        })
    }

    #executeCommand(command) {
        // keep command history
        this.writeLine(command);
        command = command.split(' ');

        switch(command[1]) {

            case 'whoami':
                this.writeLine('Guest');
                break;

            case 'clear':
                this.buffer.innerHTML = '';
                break;

            default:
                this.writeLine(command[1] + ': command not found');
        }
    }

    writeLine(line) {
        let el = document.createElement('p');
        el.innerHTML = line;
        this.buffer.appendChild(el);
    }
}