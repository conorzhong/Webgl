"use strict";
const m4 = twgl.m4;
const v3 = twgl.v3;
const textures = twgl.texture;
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
    const eye = [2, 4, 6];
    //const eye = [0, 1.05, 10];

    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    //视图投影矩阵
    const viewProjection = m4.multiply(projection, view);
    //世界矩阵
    const world = m4.rotationY(time/5);

    //设置uniform矩阵
    uniforms.u_projection = viewProjection;
    uniforms.u_world = world;
    //光照方向
    uniforms.u_reverseLightDirection = v3.normalize([-0.3, 1, 0]);

    //纹理
    uniforms.u_texcoord = textureList.checker;

    gl.useProgram(programInfo.program);

    objects.forEach(function (obj) {
        twgl.setBuffersAndAttributes(gl,programInfo,obj.bufferInfo);
        //每个物体的矩阵
        uniforms.u_localMatrix = obj.localMatrix;
        uniforms.u_color = obj.color;
        //逆转置矩阵，光照用
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(m4.multiply(world,obj.localMatrix)));
        //纹理
        uniforms.u_diffuse = obj.diffuse;
        //提交uniforms变量
        twgl.setUniforms(programInfo,uniforms);
        twgl.drawBufferInfo(gl,obj.bufferInfo);
    });

    // //试着更新一下下 F 的矩阵
    // let temp = m4.multiply(m4.translation([0,0,0]),m4.rotationY(time));
    // temp = m4.multiply(temp,m4.translation([1,0,0]));
    // let localMatrix = m4.multiply(temp, m4.scaling([0.005,0.005,0.005]));
    // objects[2].localMatrix = localMatrix;
    //
    // //试着更新一下下 FLittle 的矩阵
    // //这个F会指向另一个正在旋转的F
    // let temp1 = m4.lookAt([2,0,0],temp,[0,1,0]);
    // // let temp1 = m4.lookAt(m4.multiply(temp,m4.translation([0.5,0,0])),[0,0,0],[0,1,0])
    // temp1 = m4.multiply(temp1,m4.rotationY(Math.PI/2));
    // objects[3].localMatrix = m4.multiply(temp1,m4.scaling([0.005,0.005,0.005]));
    //
    requestAnimationFrame(render);
}

requestAnimationFrame(render);


//纹理
let textureList = twgl.createTextures(gl,{
    checker: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        src: [
            255, 255, 255, 255,
            192, 192, 192, 255,
            192, 192, 192, 255,
            255, 255, 255, 255,
        ],
    },
    // a 1x8 pixel texture from a typed array.
    stripe: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        format: gl.LUMINANCE,
        src: new Uint8Array([
            255,
            128,
            255,
            128,
            255,
            128,
            255,
            128,
        ]),
        width: 1,
    },
});



//全局变量
const uniforms = {
    u_projection:m4.identity(),
    u_world:m4.identity(),
    u_localMatrix:m4.identity(),
    u_color:[0,0,0,1],
    u_reverseLightDirection:m4.identity(),
    u_worldInverseTranspose:m4.identity(),

    //纹理
    u_lightWorldPos: [1, 8, -10],
    u_lightColor: [1, 0.8, 0.8, 1],
    u_ambient: [0, 0, 0, 1],
    u_specular: [1, 1, 1, 1],
    u_shininess: 50,
    u_specularFactor: 1,
    u_diffuse: textureList.checker,
};




//地面
let ground = {
    bufferInfo:twgl.createBufferInfoFromArrays(gl,primitives.createXYQuadVertices(7),m4.rotationX(Math.PI/2)),
    localMatrix:m4.rotationX(Math.PI/2*3),
    color:[...v3.normalize([1,1,1]),1],
    diffuse:textureList.checker,
};

//F
let F = {
    bufferInfo:primitives.create3DFBufferInfo(gl),
    localMatrix:m4.identity(),
    color:[0,0,1,1],
    diffuse:textureList.checker,
};

//F
let FFollow = {
    bufferInfo:primitives.create3DFBufferInfo(gl),
    localMatrix:m4.identity(),
    color:[0,1,1,1],
    diffuse:textureList.checker,
};

//桌子
//桌面
let cube = {
    bufferInfo : twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(1)),
    localMatrix:m4.multiply(m4.translation([0,1,0]),m4.scaling([2,0.1,1])),
    color : [1.0, 0.96, 0.30, 1.0],
    diffuse:textureList.stripe,
};
//桌腿
let deskleg1 = {
    bufferInfo:primitives.createCylinderBufferInfo(gl,0.075,0.95,100,100),
    localMatrix:m4.translation([0.5,0.95/2,0.25]),
    color:[0.51, 0.33, 0.24, 1.0],
};
let deskleg2 = {
    bufferInfo:primitives.createCylinderBufferInfo(gl,0.075,0.95,100,100),
    localMatrix:m4.translation([-0.5,0.95/2,0.25]),
    color:[0.51, 0.33, 0.24, 1.0],
};
let deskleg3 = {
    bufferInfo:primitives.createCylinderBufferInfo(gl,0.075,0.95,100,100),
    localMatrix:m4.translation([0.5,0.95/2,-0.25]),
    color:[0.51, 0.33, 0.24, 1.0],
};
let deskleg4 = {
    bufferInfo:primitives.createCylinderBufferInfo(gl,0.075,0.95,100,100),
    localMatrix:m4.translation([-0.5,0.95/2,-0.25]),
    color:[0.51, 0.33, 0.24, 1.0],
};
//桌脚
let disc1 = {
    bufferInfo:primitives.createDiscBufferInfo(gl,0.2,100),
    localMatrix:m4.translation([0.5,0.001,0.25]),
    color:[0.51, 0.33, 0.24, 1.0],
};
let disc2 = {
    bufferInfo:primitives.createDiscBufferInfo(gl,0.2,100),
    localMatrix:m4.translation([0.5,0.001,-0.25]),
    color:[0.51, 0.33, 0.24, 1.0],
};
let disc3 = {
    bufferInfo:primitives.createDiscBufferInfo(gl,0.2,100),
    localMatrix:m4.translation([-0.5,0.001,0.25]),
    color:[0.51, 0.33, 0.24, 1.0],
};
let disc4 = {
    bufferInfo:primitives.createDiscBufferInfo(gl,0.2,100),
    localMatrix:m4.translation([-0.5,0.001,-0.25]),
    color:[0.51, 0.33, 0.24, 1.0],
};


// var chairarrays = {
//     position: { numComponents: 3, data: [0, 0, 0, 1, 0, 0, 0, 1, 0], },
//     texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
//     normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
//     indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
// };
//椅子
//椅子坐
let chairdown = {
    bufferInfo : twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.75)),
    localMatrix:m4.multiply(m4.translation([0,0.5,1]),m4.scaling([1,0.1,1])),
    color : [0.96, 0.64, 0.66, 1.0],

};
//椅子背
let chairback = {
    bufferInfo : twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.75)),
    localMatrix:m4.multiply(m4.multiply(m4.translation([0,0.835,1.375]),m4.rotationX(Math.PI/2)),m4.scaling([1,0.1,1])),
    color : [0.96, 0.64, 0.66, 1.0],
};
//椅子腿
let chairleg1 = {
    bufferInfo:primitives.createCylinderBufferInfo(gl,0.05,0.4625,100,100),
    localMatrix:m4.translation([0.75/4,0.4625/2,1+0.75/4]),
    color:[0.51, 0.33, 0.24, 1.0],
};
let chairleg2 = {
    bufferInfo:primitives.createCylinderBufferInfo(gl,0.05,0.4625,100,100),
    localMatrix:m4.translation([-0.75/4,0.4625/2,1+0.75/4]),
    color:[0.51, 0.33, 0.24, 1.0],
};

let chairleg3 = {
    bufferInfo:primitives.createCylinderBufferInfo(gl,0.05,0.4625,100,100),
    localMatrix:m4.translation([0.75/4,0.4625/2,1-0.75/4]),
    color:[0.51, 0.33, 0.24, 1.0],
};

let chairleg4 = {
    bufferInfo:primitives.createCylinderBufferInfo(gl,0.05,0.4625,100,100),
    localMatrix:m4.translation([-0.75/4,0.4625/2,1-0.75/4]),
    color:[0.51, 0.33, 0.24, 1.0],
};
//电脑
//电脑体
let surfaceBody = {
    bufferInfo : twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.5)),
    localMatrix:m4.multiply(m4.multiply(m4.translation([0,1.05+0.5*0.75*0.5*Math.sin(Math.PI/3),0]),m4.rotationX(Math.PI/3)),m4.scaling([1,0.05,0.75])),
    color : [0.75,0.75,0.75,1.0],
};
//电脑支架
let surfaceSupport = {
    bufferInfo : twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.5)),
    localMatrix:m4.multiply(m4.multiply(m4.translation([0,1.05+0.5*0.375*0.5*Math.sin(Math.PI/3),-0.0625]),m4.rotationX(Math.PI*2/3)),m4.scaling([1,0.05,0.375])),
    color : [0.75,0.75,0.75,1.0],
};


//物体列表
let objects = [cube,ground,deskleg1,deskleg2,deskleg3,deskleg4,disc1,disc2,disc3,disc4,
    chairdown,chairback,chairleg1,chairleg2,chairleg3,chairleg4,
    surfaceBody,surfaceSupport];

