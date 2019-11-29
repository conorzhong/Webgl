"use strict";
const m4 = twgl.m4;
const primitives = twgl.primitives;
const gl = document.querySelector("#c").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

const vertices = primitives.createCubeVertices(1);
const bufferInfo = twgl.createBufferInfoFromArrays(gl, vertices);
const colors = primitives.makeRandomVertexColors(vertices);
const colorsBufferInfo = twgl.createBufferInfoFromArrays(gl,colors);

const uniforms = {

};

function render(time) {
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fov = 30 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.5;
    const zFar = 10;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    const eye = [1, 4, -6];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    const viewProjection = m4.multiply(projection, view);

    const world = m4.rotationY(time);

    uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setBuffersAndAttributes(gl,programInfo,colorsBufferInfo);

    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl,bufferInfo);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);