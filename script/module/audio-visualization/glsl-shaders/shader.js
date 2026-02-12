export class Shader {

    constructor(ctx) {
        this.ctx = ctx;
        this.program = null;
        this.vertexShaderSource = null;
        this.fragmentShaderSource = null;
        this.vertices = null;
    }

    _init() {
        // Initialization code for the shader
        const vertexShader = this.#compileShader(this.vertexShaderSource, this.ctx.VERTEX_SHADER);
        const fragmentShader = this.#compileShader(this.fragmentShaderSource, this.ctx.FRAGMENT_SHADER);

        this.program = this.ctx.createProgram();
        this.ctx.attachShader(this.program, vertexShader);
        this.ctx.attachShader(this.program, fragmentShader);
        this.ctx.linkProgram(this.program);
        if (!this.ctx.getProgramParameter(this.program, this.ctx.LINK_STATUS)) {
            console.error('Program link error: ', this.ctx.getProgramInfoLog(this.program));
        }

        this.ctx.useProgram(this.program);

        // Set up vertex buffer
        this.vertices = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.vertices);
        const verticesArray = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0,
        ]);

        const positionBuffer = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, positionBuffer);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, verticesArray, this.ctx.STATIC_DRAW);

        const aPosition = this.ctx.getAttribLocation(this.program, 'aPosition');
        this.ctx.enableVertexAttribArray(aPosition);
        this.ctx.vertexAttribPointer(aPosition, 2, this.ctx.FLOAT, false, 0, 0);
    }


    #compileShader(source, type) {
        const shader = this.ctx.createShader(type);
        this.ctx.shaderSource(shader, source);
        this.ctx.compileShader(shader);
        if (!this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS)) {
            console.error('Shader compilation error: ', this.ctx.getShaderInfoLog(shader));
            this.ctx.deleteShader(shader);
            return null;
        }
        return shader;
    }


    // This function converts an HTML hex color value to a normalized (0.0 to 1.0) RGB value for the shader
    hexToNormalizedRGB(hex) {
        // Ensure the hex string starts with a "#" or is exactly 6 characters
        if (hex.startsWith("#")) {
            hex = hex.slice(1);
        }
        if (hex.length !== 6) {
            throw new Error("Invalid hexadecimal color format");
        }

        // Parse the hex string into its RGB components
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        // Normalize the RGB components to the range [0, 1]
        return {
            r: r / 255,
            g: g / 255,
            b: b / 255
        };
    }


    // This function converts a normalized (0.0 to 1.0) RGB value to a hex value for HTML
    normalizedRGBToHex(r, g, b) {
        // Convert each normalized RGB value to a 0-255 integer
        const red = Math.round(r * 255);
        const green = Math.round(g * 255);
        const blue = Math.round(b * 255);

        // Convert each integer to a two-digit hexadecimal string
        const hexR = red.toString(16).padStart(2, '0');
        const hexG = green.toString(16).padStart(2, '0');
        const hexB = blue.toString(16).padStart(2, '0');

        // Concatenate the hex values to form the full hex color string
        return hexR + hexG + hexB;
    }
}