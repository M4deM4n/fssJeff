import { CollidescopeShader } from "./glsl-shaders/collidescope";

export class GlslVisualization
{
    constructor() {
        this.canvas = document.getElementById('glCanvas');
        this.gl = this.canvas.getContext('webgl');
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);

        this.shader = new CollidescopeShader(this.gl);
        this.gl.useProgram(this.shader.program);

        this.buffer = document.getElementById('gl-visualizer-buffer');
    }


    render(binCount, freqData) {
        this.shader.render(performance.now(), this.canvas.width, this.canvas.height, { binCount: binCount, freqData:freqData } );
    }


}