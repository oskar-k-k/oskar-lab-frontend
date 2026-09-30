type ScreenPoint = Readonly<{x: number; y: number}>;

/** GPU line layer for the complete animated cable geometry, with a Canvas fallback in Scene. */
export class GpuLines {
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly buffer: WebGLBuffer;
    private readonly positions: number;
    private readonly colors: number;
    private readonly palette = new Map<string, readonly number[]>();
    private vertices = new Float32Array(1048576);
    private length = 0;
    private allocated = 0;

    constructor(private readonly canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl", {alpha: false, antialias: true, depth: false, stencil: false, powerPreference: "high-performance"});
        if (!gl) throw new Error("WebGL unavailable");
        this.gl = gl;
        const compile = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) throw new Error("Shader allocation failed");
            gl.shaderSource(shader, source); gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error("Shader compilation failed"); }
            return shader;
        };
        const vertex = compile(gl.VERTEX_SHADER, "attribute vec2 position; attribute vec4 color; varying vec4 tint; void main(){ gl_Position=vec4(position.x/800.0-1.0,1.0-position.y/450.0,0.0,1.0); tint=color; }");
        const fragment = compile(gl.FRAGMENT_SHADER, "precision mediump float; varying vec4 tint; void main(){gl_FragColor=tint;}");
        const program = gl.createProgram(), buffer = gl.createBuffer();
        if (!program || !buffer) throw new Error("GPU allocation failed");
        gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
        gl.deleteShader(vertex); gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteBuffer(buffer); throw new Error("GPU linking failed"); }
        this.program = program; this.buffer = buffer;
        this.positions = gl.getAttribLocation(program, "position"); this.colors = gl.getAttribLocation(program, "color");
    }

    /** Resets geometry without reallocating the reusable vertex storage. */
    begin(): void { this.length = 0; }

    private vertex(x: number, y: number, color: readonly number[]): void {
        if (this.length + 6 > this.vertices.length) {
            const next = new Float32Array(this.vertices.length * 2); next.set(this.vertices); this.vertices = next;
        }
        this.vertices[this.length++] = x; this.vertices[this.length++] = y;
        this.vertices[this.length++] = color[0]; this.vertices[this.length++] = color[1];
        this.vertices[this.length++] = color[2]; this.vertices[this.length++] = color[3];
    }

    private color(hex: string): readonly number[] {
        let color = this.palette.get(hex);
        if (!color) {
            color = [parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255, hex.length === 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1];
            this.palette.set(hex, color);
        }
        return color;
    }

    /** Appends one segment; every source cable is retained. */
    line(a: ScreenPoint, b: ScreenPoint, hex: string): void {
        const color = this.color(hex);
        this.vertex(a.x, a.y, color); this.vertex(b.x, b.y, color);
    }

    /** Tessellates a smooth screen-space cubic, preserving both attached endpoints. */
    cubic(a: ScreenPoint, b: ScreenPoint, c: ScreenPoint, d: ScreenPoint, color: string): void {
        const tint = this.color(color);
        const cx = 3 * (b.x - a.x), cy = 3 * (b.y - a.y);
        const bx = 3 * (c.x - b.x) - cx, by = 3 * (c.y - b.y) - cy;
        const ax = d.x - a.x - cx - bx, ay = d.y - a.y - cy - by;
        let previousX = a.x, previousY = a.y;
        for (let step = 1; step <= 16; step++) {
            const t = step / 16;
            const x = ((ax * t + bx) * t + cx) * t + a.x;
            const y = ((ay * t + by) * t + cy) * t + a.y;
            this.vertex(previousX, previousY, tint); this.vertex(x, y, tint);
            previousX = x; previousY = y;
        }
    }

    /** Uploads one batched geometry buffer and draws at the full backing resolution. */
    present(width: number, height: number): void {
        const gl = this.gl;
        if (this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width = width; this.canvas.height = height; }
        gl.viewport(0, 0, width, height); gl.clearColor(9 / 255, 13 / 255, 16 / 255, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program); gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        if (this.allocated < this.vertices.byteLength) { gl.bufferData(gl.ARRAY_BUFFER, this.vertices.byteLength, gl.DYNAMIC_DRAW); this.allocated = this.vertices.byteLength; }
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices.subarray(0, this.length));
        gl.enableVertexAttribArray(this.positions); gl.vertexAttribPointer(this.positions, 2, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(this.colors); gl.vertexAttribPointer(this.colors, 4, gl.FLOAT, false, 24, 8);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.LINES, 0, this.length / 6);
    }

    /** Releases GPU resources when the scene is removed. */
    dispose(): void { this.gl.deleteBuffer(this.buffer); this.gl.deleteProgram(this.program); }
}
