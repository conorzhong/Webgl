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
    const zFar = 1000;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    const eye = [2, 4, -6];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    //视图投影矩阵
    const viewProjection = m4.multiply(projection, view);
    //世界矩阵
    const world = m4.rotationY(time/10);

    //设置uniform变量
    uniforms.u_projection = viewProjection;
    uniforms.u_world = world;

    gl.useProgram(programInfo.program);

    objects.forEach(function (obj) {
        twgl.setBuffersAndAttributes(gl,programInfo,obj.bufferInfo);
        //每个物体的矩阵
        uniforms.u_localMatrix = obj.localMatrix;
        uniforms.u_color = obj.color;
        //提交uniforms变量
        twgl.setUniforms(programInfo,uniforms);
        twgl.drawBufferInfo(gl,obj.bufferInfo);
    });

    let temp = m4.multiply(m4.translation([0,0,0]),m4.rotationY(time));
    temp = m4.multiply(temp,m4.translation([1,0,0]));
    temp = m4.multiply(temp, m4.scaling([0.005,0.005,0.005]));
    objects[2].localMatrix = temp;

    requestAnimationFrame(render);
}

requestAnimationFrame(render);


const uniforms = {
    u_projection:m4.identity(),
    u_world:m4.identity(),
    u_localMatrix:m4.identity(),
    u_color:[0,0,0,1]
};

//物体
let cube = {
    bufferInfo : twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(1)),
    localMatrix: m4.translation([0,0.5,0]),
    color : [1,0,0,1],
};

//地面
let ground = {
    bufferInfo:twgl.createBufferInfoFromArrays(gl,primitives.createXYQuadVertices(7),m4.rotationX(Math.PI/2)),
    localMatrix:m4.rotationX(Math.PI/2*3),
    color:[0,1,0,1],
};

let F = {
    bufferInfo:primitives.create3DFBufferInfo(gl),
    localMatrix:m4.identity(),
    color:[0,0,1,1],
};
//坐标系

//物体列表
let objects = [cube,ground,F];