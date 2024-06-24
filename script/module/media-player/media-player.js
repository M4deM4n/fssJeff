import {secToMin} from "/script/module/utils.js";
import { MovableResizableWindow } from "/script/module/window/window.js";
import * as appData from "/script/module/data/app-data.js";
import {appState} from "/script/module/data/app-state.js";
import {AudioVisualization, ColorMode, VisualizationType} from "/script/module/audio-visualization/audio-visualization.js";



export class MediaPlayer extends MovableResizableWindow
{
    constructor(id = 'media-player', config = {}) {
        super(id,config);

        this.id = id;
        this.pid = 76;

        this.#init();
        return this;
    }

    #init() {

        // visibility
        if(this.element.classList.contains('hidden')) {
            this.element.classList.remove('hidden');
            this.element.style.display = 'none';
        }

        this.#initAudio();
        this.#initVisualizer();
        this.#initEventListeners();

        this.element.appendChild(this.audio);
    }

    #initAudio() {
        this.trackTitle = document.getElementById(this.id + '-track-title');
        this.trackDurationLabel = document.getElementById(this.id + '-dsp-length');

        // play button
        this.playButton = document.getElementById(this.id + '-btn-play');
        this.playIcon = this.playButton.querySelector('i');

        this.prevButton = document.getElementById(this.id + '-btn-prev');
        this.nextButton = document.getElementById(this.id + '-btn-next');

        this.audioCtx = new AudioContext();
        this.analyser = this.audioCtx.createAnalyser();

        // audio element
        this.audio = document.createElement('audio');
        this.audio.id = this.id + '-audio';
        this.audio.style.display = 'none';

        this.track = this.audioCtx.createMediaElementSource(this.audio);
        this.track.connect(this.analyser);
        this.track.connect(this.audioCtx.destination);

        // Set default track
        this.currentTrack = 0;
        this.setTrack(this.currentTrack);
        this.isPlaying = false;
    }

    #initVisualizer() {
        this.visButton = document.getElementById(this.id + '-vis-btn');
        this.colorButton = document.getElementById(this.id + '-color-btn');

        // visualizer canvas
        this.canvas = document.getElementById(this.id + '-canvas');
        this.canvas.style.width='100%';
        this.canvas.style.height='100%';

        // @todo: these should be parameters
        this.canvas.width  = 300;
        this.canvas.height = 48;

        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.clearRect(0,0, this.canvas.width, this.canvas.height);

        // visualizer
        this.currentVisualization = 0;
        this.currentColorMode = 0;

        this.visualizer = new AudioVisualization(
            this.canvasCtx,
            this.analyser,
            this.canvas.width,
            this.canvas.height,
            appData.visualizationList[this.currentVisualization],
            ColorMode.Fire
        );

        this.drawVisualizer();
    }

    #initEventListeners(){
        // audio controls
        this.playButton.addEventListener('click', () => {
            this.togglePlayback()
        })
        this.prevButton.addEventListener('click', () => {
            this.setTrack('prev');
        })
        this.nextButton.addEventListener('click', () => {
            this.setTrack('next');
        })

        // playback events
        this.audio.addEventListener('play', () => {
            this.trackDurationLabel.innerHTML = secToMin(this.audio.duration);
        })
        this.audio.addEventListener('ended', () => {
            this.setTrack('next');
            this.audio.play().then(() => {
                this.trackDurationLabel.innerHTML = secToMin(this.audio.duration);
            });
        })
        this.audio.addEventListener('timeupdate', () => {
            const t = document.getElementById(this.id + '-dsp-time');
            t.innerHTML = secToMin(this.audio.currentTime);
        })

        // visualization buttons
        this.visButton.addEventListener('click', () => {
            this.setVisualization('next');
        })
        this.colorButton.addEventListener('click',() => {
            this.setColorMode('next');
        })
    }

    show() {
        appState.zIndex++;
        this.element.style.zIndex = appState.zIndex;

        this.pid = appState.getPID();
        appState.processes.push({ id: this.id, pid: this.pid, name: 'media-player' });
        this.element.style.display = 'block';

        if(this.externalTrigger) {
            this.externalTrigger.classList.add('selected');
            this.externalTrigger.classList.add(this.id + '-btn-selected');
        }

        // this.audio.currentTime = 0;
        this.setTrack(0);
    }

    hide() {
        if(!this.audio.paused) {
            this.togglePlayback();
        }

        appState.processes = appState.processes.filter((el) => el.pid !== this.pid);
        this.element.style.display = 'none';

        if(this.externalTrigger) {
            this.externalTrigger.classList.remove('selected');
            this.externalTrigger.classList.remove(this.id + '-btn-selected');
        }
    }

    toggle() {
        if(this.element.style.display === 'none') {
            this.show();
            return true;
        } else {
            this.hide();
            return false;
        }
    }

    setTrack(trackNum) {
        switch(trackNum) {
            case 'next':
                this.currentTrack++;
                if(this.currentTrack >= appData.trackList.length) {
                    this.currentTrack = 0;
                }

                break;
            case 'prev':
                this.currentTrack--;
                if(this.currentTrack < 0) {
                    this.currentTrack = (appData.trackList.length - 1);
                }
                break;

            default:
                if(trackNum >= appData.trackList.length || trackNum < 0) {
                    throw new Error('Invalid Track Selection!');
                }
                this.currentTrack = trackNum;
        }

        let keepPlaying = false;
        if(!this.audio.paused) { keepPlaying = true;  this.audio.pause() }

        let track = appData.trackList[this.currentTrack];
        if(this.trackTitle) { this.trackTitle.innerHTML = track.name }
        this.audio.src = encodeURI(track.path);

        if(keepPlaying) {
            this.audio.play().then(() => {
                this.trackDurationLabel.innerHTML = secToMin(this.audio.duration);
            });
        }
    }

    togglePlayback() {
        if(this.audio.paused) {
            this.audioCtx.resume();
            this.audio.play();

            this.isPlaying = true;
            this.drawVisualizer();

            this.playIcon.classList.remove('fa-play');
            this.playIcon.classList.add('fa-pause');

        } else {
            this.audio.pause();

            this.isPlaying = false;
            this.drawVisualizer();

            this.playIcon.classList.remove('fa-pause');
            this.playIcon.classList.add('fa-play');
        }
    }

    setVisualization(visOptions) {
        if(visOptions === 'next') {
            this.currentVisualization++;
            if(this.currentVisualization >= appData.visualizationList.length) {
                this.currentVisualization = 0;
            }
            return this.visualizer.setType(appData.visualizationList[this.currentVisualization]);
        }

        this.visualizer.setType(visOptions);
    }

    setColorMode(colorMode) {
        if(colorMode === 'next') {
            this.currentColorMode++;
            if(this.currentColorMode >= appData.colorModeList.length) {
                this.currentColorMode = 0;
            }
            return this.visualizer.setColorMode(appData.colorModeList[this.currentColorMode]);
        }

        this.visualizer.setColorMode(colorMode);
    }

    drawVisualizer() {
        if(this.isPlaying) {
            const drawVisual = requestAnimationFrame(() => this.drawVisualizer());
            this.visualizer.render();
        } else {
            this.visualizer.renderBG();
        }
    }
}