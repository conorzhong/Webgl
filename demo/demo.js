"use strict";
const m4 = twgl.m4;
const primitives = twgl.primitives;
const gl = document.querySelector("#c").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

function render(time) {
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //照相机
    const fov = 30 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.5;
    const zFar = 10;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    const eye = [2, 4, -6];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    //视图投影矩阵
    const viewProjection = m4.multiply(projection, view);
    //世界矩阵
    const world = m4.rotationY(time);

    //设置uniform变量
    uniforms.u_projection = viewProjection;
    uniforms.u_world = world;

    gl.useProgram(programInfo.program);

    objects.forEach(function (obj) {
        twgl.setBuffersAndAttributes(gl,programInfo,obj.bufferInfo);
        //每个物体的矩阵
        uniforms.u_localMatrix = obj.localMatrix;

        //提交uniforms变量
        twgl.setUniforms(programInfo,obj.bufferInfo);
        twgl.drawBufferInfo(gl,obj.bufferInfo);
    });

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

//初始化uniforms
const uniforms = {
    u_projection:m4.identity(),
    u_world:m4.identity(),
    u_localMatrix:m4.identity()
};

//物体
let cube = {
    bufferInfo : twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(1)),
    localMatrix: m4.identity()
};

let ground = {
    bufferInfo:primitives.createXYQuadBufferInfo(gl,2),
    localMatrix:m4.identity()
};

//物体列表
let objects = [cube,ground];