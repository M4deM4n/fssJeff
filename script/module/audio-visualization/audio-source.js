import * as appData from "../data/app-data";
import {secToMin} from "../utils";

export class AudioSource
{
    #audioCtx;

    /**
     *
     */
    constructor(audioElementID = null) {
        this.#audioCtx = new AudioContext();
        this.analyser = this.#audioCtx.createAnalyser();

        if(audioElementID === null) {
            this.audio = document.createElement('audio');
        } else {
            this.audio = document.getElementById(audioElementID);
        }

        this.trackList = [];
        this.track = this.#audioCtx.createMediaElementSource(this.audio);
        this.track.connect(this.analyser);
        this.track.connect(this.#audioCtx.destination);

        // Set default track
        this.currentTrack = 0;
        this.setTrack(this.currentTrack);
    }


    /**
     *
     * @param size
     */
    setFFTSize(size) {
        this.analyser.fftSize = size;
    }


    /**
     *
     * @returns {*}
     */
    getTrackName() {
        let track = this.trackList[this.currentTrack];
        if(track) {
            return track.name;
        }
    }


    /**
     *
     * @param trackList
     */
    setTrackList(trackList) {
        this.trackList = trackList;
        this.setTrack(0);
    }


    /**
     *
     * @param trackValue
     */
    setTrack(trackValue) {
        switch(trackValue) {
            case 'next':
                this.currentTrack++;
                if(this.currentTrack >= this.trackList.length) {
                    this.currentTrack = 0;
                }

                break;
            case 'prev':
                this.currentTrack--;
                if(this.currentTrack < 0) {
                    this.currentTrack = (this.trackList.length - 1);
                }
                break;

            default:
                if(trackValue >= this.trackList.length || trackValue < 0) {
                    throw new Error('Invalid Track Selection!');
                }
                this.currentTrack = trackValue;
        }

        let keepPlaying = false;
        if(!this.audio.paused) { keepPlaying = true;  this.audio.pause() }

        let track = this.trackList[this.currentTrack];
        // if(this.trackTitle) { this.trackTitle.innerHTML = track.name }
        this.audio.src = encodeURI(track.path);

        if(keepPlaying) {
            this.audio.play().then(() => {
                // this.trackDurationLabel.innerHTML = secToMin(this.audio.duration);
                return true;
            });
        } else {
            return true;
        }
    }
}