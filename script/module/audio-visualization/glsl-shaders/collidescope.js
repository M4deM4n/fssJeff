import { Shader } from "./shader.js";

export class CollidescopeShader extends Shader {

    constructor(ctx) {
        super(ctx);
        this.vertexShaderSource     = this.getVertexShader();
        this.fragmentShaderSource   = this.getFragmentShader();

        this._init();
        this.#setUniformLocations();

        this.currentSpeed           = 0.5;
        this.currentFracMag         = 1.5;
        this.currentFracPasses      = 2;
        this.currentPaletteSpeed    = 0.1;
        this.currentRotationSpeed   = 0.1;
        this.currentColorSlot0      = this.normalizedRGBToHex(0.5,0.5,0.0);
        this.currentColorSlot1      = this.normalizedRGBToHex(0.5,0.5,0.0);
        this.currentColorSlot2      = this.normalizedRGBToHex(0.1,0.5,0.0);
        this.currentColorSlot3      = this.normalizedRGBToHex(0.0,0.0,0.0);
    }


    /**
     * Set uniform locations for the shader program
     */
    #setUniformLocations() {
        this.timeLocation               = this.ctx.getUniformLocation(this.program, 'uTime');
        this.resolutionLocation         = this.ctx.getUniformLocation(this.program, 'uResolution');
        this.speedLocation              = this.ctx.getUniformLocation(this.program, 'uSpeed');
        this.fractalMagnitudeLocation   = this.ctx.getUniformLocation(this.program, 'uFractalMagnitude');
        this.fractalPassesLocation      = this.ctx.getUniformLocation(this.program, 'uFractalPasses');
        this.paletteSpeedLocation       = this.ctx.getUniformLocation(this.program, 'uPaletteSpeed');
        this.colorSlot0Location         = this.ctx.getUniformLocation(this.program, 'uColorSlot0');
        this.colorSlot1Location         = this.ctx.getUniformLocation(this.program, 'uColorSlot1');
        this.colorSlot2Location         = this.ctx.getUniformLocation(this.program, 'uColorSlot2');
        this.colorSlot3Location         = this.ctx.getUniformLocation(this.program, 'uColorSlot3');
        this.rotationSpeedLocation      = this.ctx.getUniformLocation(this.program, 'uRotationSpeed');
    }


    /**
     * Render the shader with the given parameters
     *
     * @param {*} time
     * @param {*} width
     * @param {*} height
     * @param {*} params
     */
    render(time, width, height, params) {
        // this.ctx.canvas.width = this.buffer.width;
        // this.ctx.canvas.height = this.buffer.height;

        // Resize the canvas to match the window size
        this.ctx.viewport(0, 0, width, height);

        // Clear the canvas
        this.ctx.clearColor(0, 0, 0, 1);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);

        // Set the scripts uniform variables
        this.ctx.uniform1f(this.timeLocation, time * 0.001);
        this.ctx.uniform2f(this.resolutionLocation, width, height);
        this.ctx.uniform1f(this.speedLocation, this.currentSpeed);

        // Use lower frequencies (bass) for fractal magnitude - average of bins 1-8
        let lowFreqMagnitude = this.currentFracMag;
        if (params.freqData) {
            const lowFreqSum = params.freqData[1] + params.freqData[2] + params.freqData[3] + params.freqData[4] +
                              params.freqData[5] + params.freqData[6] + params.freqData[7] + params.freqData[8];
            lowFreqMagnitude = (lowFreqSum / 8) / 256 * 1.5 + 0.1; // Normalize and scale
        }
        this.ctx.uniform1f(this.fractalMagnitudeLocation, lowFreqMagnitude);
        this.ctx.uniform1f(this.fractalPassesLocation, this.currentFracPasses);

        // Use higher frequencies (treble) for palette speed - average of upper bins
        let highFreqPaletteSpeed = this.currentPaletteSpeed;
        if (params.freqData) {
            const highFreqSum = params.freqData[80] + params.freqData[90] + params.freqData[100] + params.freqData[110] +
                               params.freqData[120] + params.freqData[130] + params.freqData[140] + params.freqData[150];
            highFreqPaletteSpeed = (highFreqSum / 8) / 256 * 0.05 + 0.001;
        }
        this.ctx.uniform1f(this.paletteSpeedLocation, highFreqPaletteSpeed);

        // colors
        let col0 = this.hexToNormalizedRGB(this.currentColorSlot0);
        let col1 = this.hexToNormalizedRGB(this.currentColorSlot1);
        let col2 = this.hexToNormalizedRGB(this.currentColorSlot2);
        let col3 = this.hexToNormalizedRGB(this.currentColorSlot3);

        this.ctx.uniform3f(this.colorSlot0Location, col0.r, col0.g, col0.b);
        this.ctx.uniform3f(this.colorSlot1Location, col1.r, col1.g, col1.b);
        this.ctx.uniform3f(this.colorSlot2Location, col2.r, col2.g, col2.b);
        this.ctx.uniform3f(this.colorSlot3Location, col3.r, col3.g, col3.b);

        // Rotation speed
        this.ctx.uniform1f(this.rotationSpeedLocation, this.currentRotationSpeed);

        // Draw the quad
        this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4);
    }

    getVertexShader() {
        return `
            attribute vec4 aPosition;
            void main() {
                gl_Position = aPosition;
            }
        `;
    }

    getFragmentShader() {
        return `
            precision mediump float;

            uniform vec2 uResolution;
            uniform float uTime;
            uniform float uSpeed;
            uniform float uFractalMagnitude;
            uniform float uFractalPasses;
            uniform float uPaletteSpeed;

            uniform vec3 uColorSlot0;
            uniform vec3 uColorSlot1;
            uniform vec3 uColorSlot2;
            uniform vec3 uColorSlot3;
            uniform float uRotationSpeed;

            vec2 rotate(vec2 uv, float angle) {
                float s = sin(angle);
                float c = cos(angle);
                return vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
            }

            vec3 palette(float t) {
                vec3 a = uColorSlot0;
                vec3 b = uColorSlot1;
                vec3 c = uColorSlot2;
                vec3 d = uColorSlot3;

                return a + b*cos( 6.28318*(c*t+d) );
            }


            void main() {
                // Normalize pixel coordinates to [-1, 1]
                vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / uResolution.y;
                uv = rotate(uv, uTime * uRotationSpeed);

                vec2 uv0 = uv;

                // Effect parameters
                vec3 finalColor = vec3(0.0);
                const float fractalPasses = 10.0;
                float time = uTime;
                float speed = uSpeed;
                float paletteSpeed = uPaletteSpeed;
                float scale = 8.57;
                float fractalMagnitude = uFractalMagnitude;

                for(float i = 0.0; i < fractalPasses; i++) {
                    if(i >= uFractalPasses) { continue; }

                    uv = fract(uv * fractalMagnitude) - 0.5;

                    float d = length(uv);
                    vec3 color = palette(length(uv0) + (uTime * paletteSpeed));

                    d = sin(d * scale + (time*speed)) / scale;
                    d = abs(d);

                    // d = step(0.01, d);
                    // d = smoothstep(0.0, 0.1, d);

                    d = 0.02 / d;
                    // color *= d;
                    finalColor += color * d;
                }

                gl_FragColor = vec4(finalColor, 1.0);

            }
        `;
    }
}