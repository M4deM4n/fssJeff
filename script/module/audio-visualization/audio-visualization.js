export const VisualizationType = {
    Oscilloscope: 1,
    Spectrum: 2,
    LowResolution: 4
}

export const ColorMode = {
    Fire: 1,
    BlueFire: 2,
    Spectrum: 3,
    Desaturated: 4
}
export class AudioVisualization {

    constructor(context, analyser, width, height, type = VisualizationType.Oscilloscope, colorMode = ColorMode.Fire) {
        this.ctx = context;
        this.analyser = analyser;
        this.width = width;
        this.height = height;
        this.type = type
        this.colorMode = colorMode;

        this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
        this.times = new Uint8Array(this.analyser.frequencyBinCount);

        this.updateFFTSize();
    }

    updateFFTSize() {
        let size = 1024;
        if(this.type & VisualizationType.LowResolution) {
            size = 64;
        }
        this.analyser.fftSize = size;
    }

    setType(type = VisualizationType.Oscilloscope) {
        this.type = type;
        this.updateFFTSize();
    }

    setColorMode(colorMode = ColorMode.Fire) {
        this.colorMode = colorMode;
    }

    clearBuffer(color = 'black') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0,0, this.width, this.height);
    }

    render() {
        this.clearBuffer();

        if(this.type & VisualizationType.Spectrum) {
            this.renderFrequencySpectrum();
        }

        if(this.type & VisualizationType.Oscilloscope) {
            this.renderOscilloscope();
        }
    }

    renderFrequencySpectrum() {
        this.analyser.getByteFrequencyData(this.freqs);

        for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
            let barHeight = this.height * (this.freqs[i] / 256);
            let barWidth = this.width / this.analyser.frequencyBinCount;

            let xOffset = i * barWidth;
            let yOffset = this.height - barHeight - 1;

            let hue = i / this.analyser.frequencyBinCount * 360;
            let fillStyle = '';

            switch(this.colorMode) {
                case ColorMode.Spectrum:
                    fillStyle = `hsl(${hue}, 100%, 50%)`;
                    break;

                case ColorMode.Desaturated:
                    fillStyle = `hsl(${hue}, 00%, 50%)`;
                    break;

                case ColorMode.BlueFire:
                    fillStyle = this.getBlueFireGradient();
                    break;

                case ColorMode.Fire:
                default:
                    fillStyle = this.getFireGradient();
            }

            this.ctx.fillStyle = fillStyle;

            this.ctx.fillRect(xOffset, yOffset, barWidth, barHeight);
        }
    }

    getFireGradient() {
        const grad = this.ctx.createLinearGradient(0,0,0,this.height);
        grad.addColorStop(1, "rgb(250,250,255)");
        grad.addColorStop(0.9, "rgb(255,247,93)");
        grad.addColorStop(0.8, "rgb(255,173,31)");
        grad.addColorStop(0.6, "rgb(254,101,13)");
        grad.addColorStop(0.4, "rgb(243,60,4)");
        grad.addColorStop(0.2, "rgb(218,31,5)");
        grad.addColorStop(0.0, "rgb(161,1,0)");
        return grad;
    }

    getBlueFireGradient() {
        const grad = this.ctx.createLinearGradient(0,0,0,this.height);
        grad.addColorStop(0, "rgb(8, 0, 238)");
        grad.addColorStop(0.2, "rgb(20, 121, 236)");
        grad.addColorStop(0.4, "rgb(124, 198, 255)");
        grad.addColorStop(0.6, "rgb(177, 219, 255)");
        grad.addColorStop(0.8, "rgb(208, 244, 255)");
        grad.addColorStop(1, "rgb(238, 244, 255)");
        return grad;
    }

    renderOscilloscope() {
        this.analyser.getByteTimeDomainData(this.times);

        for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
            let heightValue = this.height * (this.times[i] / 256);
            let offset = this.height - heightValue - 1;
            let barWidth = this.width/this.analyser.frequencyBinCount;

            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(i * barWidth, offset, barWidth, 2);
        }
    }

    renderBG() {
        this.clearBuffer();
    }

}