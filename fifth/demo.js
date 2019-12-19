"use strict";
const m4 = twgl.m4;
const v3 = twgl.v3;
const textures = twgl.texture;//???????
const primitives = twgl.primitives;
const gl = document.querySelector("#c").getContext("webgl");
const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
let prevTitle = this.document.title;
window.onblur = function () {
    prevTitle = this.document.title;
    this.document.title = "???你在做什么";
};
window.onfocus = function () {
    this.document.title = prevTitle;
};

//光照
var lightPosition = [1, 8, 10];

document.getElementById("lightLeft").onclick = function () {
    lightPosition[0] -= 0.5;
    var temp = m4.translation([lightPosition[0] / 5, [lightPosition[1] / 5], lightPosition[2] / 5]);
    var lb = objects.find(v => v === lightBulb);
    lb.localMatrix = temp;
};

document.getElementById("lightRight").onclick = function () {
    lightPosition[0] += 0.5;
    var temp = m4.translation([lightPosition[0] / 5, [lightPosition[1] / 5], lightPosition[2] / 5]);
    var lb = objects.find(v => v === lightBulb);
    lb.localMatrix = temp;
};

let worldRotationState = true;
document.getElementById("worldRotation").onclick = function () {
    worldRotationState = !worldRotationState;
};


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

    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    //视图投影矩阵
    const viewProjection = m4.multiply(projection, view);
    //世界矩阵
    const world = worldRotationState ? m4.rotationY(time/10) : m4.rotationY(time/Infinity);

    //设置uniform矩阵
    uniforms.u_projection = viewProjection;
    uniforms.u_world = world;
    uniforms.u_viewInverse = camera;

    //光源位置更新
    uniforms.u_lightWorldPos = m4.transformPoint(world, lightPosition);

    gl.useProgram(programInfo.program);


    objects.forEach(function (obj) {
        twgl.setBuffersAndAttributes(gl, programInfo, obj.bufferInfo);
        //每个物体的矩阵
        uniforms.u_localMatrix = obj.localMatrix;
        uniforms.u_color = obj.color;
        //逆转置矩阵，光照用
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(m4.multiply(world, obj.localMatrix)));
        //纹理
        uniforms.u_texture = obj.diffuse;
        //检查高光
        uniforms.u_specularFactor = obj.specularFactor ? obj.specularFactor : 0.1;
        uniforms.u_shininess = obj.shininess ? obj.shininess : 100;
        //提交uniforms变量
        twgl.setUniforms(programInfo, uniforms);
        twgl.drawBufferInfo(gl, obj.bufferInfo);
    });

    requestAnimationFrame(render);
}
requestAnimationFrame(render);


/**# 纹理对象
 * 纹理和颜色相乘，如果只想设置纹理，则颜色给纯白色;
 * 如果只想设置颜色，则使用纯白色纹理**white**，颜色正常给
 */
let textureList = twgl.createTextures(gl, {
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

    microsoft: { src: images.microsoft_logo, },

    surface_image: { src: images.surface_image, },

    chair_texture: { src: images.chair_texture },

    keyboad_texture: { src: images.keyboard },

    lightBulbTexture:{
        mag: gl.NEAREST,
        min: gl.LINEAR,
        format:gl.LUMINANCE,
        src:images.lightBulbImage,
    },

    sun:{src:images.sun},
    deskleg_texture: {
        mag: gl.NEAREST,
        min: gl.LINEAR,
        format: gl.LUMINANCE,
        src: new Uint8Array([
            200,
            200,
            200,
            128,
        ]),
        width: 1,
    },
    red:
    {
        src: new Uint8Array([255, 0, 0, 255])
    },
    green: {
        src: new Uint8Array([0, 255, 0, 255])
    },
    blue: {
        src: new Uint8Array([0, 0, 255, 255])
    },

    yin: {
        src: new Uint8Array([192, 192, 192, 255])
    },
    white: {
        src: new Uint8Array([255, 255, 255, 255])
    }

});



//全局变量
const uniforms = {
    u_projection: m4.identity(),
    u_world: m4.identity(),
    u_localMatrix: m4.identity(),
    u_color: [0, 0, 0, 1],
    u_reverseLightDirection: m4.identity(),     //光的反方向，和法向量相乘用
    u_worldInverseTranspose: m4.identity(),     //世界逆转置矩阵，法向量变换用

    //纹理
    u_lightWorldPos: lightPosition,             //光源位置
    u_lightColor: [1, 1, 1, 1],                 //自然光的言责
    u_ambient: [0.4, 0.4, 0.4, 1],              //环境光
    u_specular: [1, 1, 1, 1],                   //反射光颜色
    u_shininess: 100,                           //指数
    u_specularFactor: 0,                        //反射因子
    u_texture: textureList.check,
};




//地面
let ground = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createXYQuadVertices(7), m4.rotationX(Math.PI / 2)),
    localMatrix: m4.rotationX(Math.PI / 2 * 3),
    color: [...v3.normalize([1, 1, 1]), 1],
    diffuse: textureList.checker,
    specularFactor: 0,
};
let coordinate_x = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.002, 0.3, 100, 100),
    localMatrix: m4.multiply(m4.translation([0.15, 0, 0]), m4.rotationZ(Math.PI / 2)),
    color: [1, 0, 0, 1],
    diffuse: textureList.red,
};

let coordinate_y = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.002, 0.3, 100, 100),
    localMatrix: m4.translation([0, 0.15, 0]),
    color: [0, 1, 0, 1],
    diffuse: textureList.green,
};

let coordinate_z = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.002, 0.3, 100, 100),
    localMatrix: m4.multiply(m4.translation([0, 0, 0.15]), m4.rotationX(Math.PI / 2)),
    color: [0, 0, 1, 1],
    diffuse: textureList.blue
};


//光源
let lightBulb = {
    bufferInfo: primitives.createSphereBufferInfo(gl, 0.1, 100, 100),
    localMatrix: m4.translation([lightPosition[0] / 5, [lightPosition[1] / 5], lightPosition[2] / 5]),
    color: [1.0, 1, 1.0, 1],
    diffuse: textureList.sun,
};

//F
let F = {
    bufferInfo: primitives.create3DFBufferInfo(gl),
    localMatrix: m4.identity(),
    color: [0, 0, 1, 1],
    diffuse: textureList.white,
};

//桌子
//桌面
let cube = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(1)),
    localMatrix: m4.multiply(m4.translation([0, 1, 0]), m4.scaling([2, 0.1, 1])),
    color: [1.0, 0.96, 0.30, 1.0],
    diffuse: textureList.stripe,
    specularFactor: 0.5,
    shininess: 30,
};
//桌腿
let deskleg1 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.075, 0.95, 100, 100),
    localMatrix: m4.translation([0.5, 0.95 / 2, 0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let deskleg2 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.075, 0.95, 100, 100),
    localMatrix: m4.translation([-0.5, 0.95 / 2, 0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let deskleg3 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.075, 0.95, 100, 100),
    localMatrix: m4.translation([0.5, 0.95 / 2, -0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let deskleg4 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.075, 0.95, 100, 100),
    localMatrix: m4.translation([-0.5, 0.95 / 2, -0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
//桌脚
let disc1 = {
    bufferInfo: primitives.createDiscBufferInfo(gl, 0.2, 100),
    localMatrix: m4.translation([0.5, 0.001, 0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let disc2 = {
    bufferInfo: primitives.createDiscBufferInfo(gl, 0.2, 100),
    localMatrix: m4.translation([0.5, 0.001, -0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};
let disc3 = {
    bufferInfo: primitives.createDiscBufferInfo(gl, 0.2, 100),
    localMatrix: m4.translation([-0.5, 0.001, 0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,

};
let disc4 = {
    bufferInfo: primitives.createDiscBufferInfo(gl, 0.2, 100),
    localMatrix: m4.translation([-0.5, 0.001, -0.25]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.deskleg_texture,
};

//椅子
//椅子坐
let chairdown = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.75)),
    localMatrix: m4.multiply(m4.translation([0, 0.5, 1]), m4.scaling([1, 0.1, 1])),
    color: [0.96, 0.64, 0.66, 1.0],
    diffuse: textureList.chair_texture,
};
//椅子背
let chairback = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.75)),
    localMatrix: m4.multiply(m4.multiply(m4.translation([0, 0.835, 1.375]), m4.rotationX(Math.PI / 2)), m4.scaling([1, 0.1, 1])),
    color: [0.96, 0.64, 0.66, 1.0],
    diffuse: textureList.chair_texture,
};
//椅子腿
let chairleg1 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.05, 0.4625, 100, 100),
    localMatrix: m4.translation([0.75 / 4, 0.4625 / 2, 1 + 0.75 / 4]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.chair_texture,
};
let chairleg2 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.05, 0.4625, 100, 100),
    localMatrix: m4.translation([-0.75 / 4, 0.4625 / 2, 1 + 0.75 / 4]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.chair_texture,
};

let chairleg3 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.05, 0.4625, 100, 100),
    localMatrix: m4.translation([0.75 / 4, 0.4625 / 2, 1 - 0.75 / 4]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.chair_texture,
};

let chairleg4 = {
    bufferInfo: primitives.createCylinderBufferInfo(gl, 0.05, 0.4625, 100, 100),
    localMatrix: m4.translation([-0.75 / 4, 0.4625 / 2, 1 - 0.75 / 4]),
    color: [0.51, 0.33, 0.24, 1.0],
    diffuse: textureList.chair_texture,
};
//电脑
//电脑体
let surfaceBody = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.5)),
    localMatrix: m4.multiply(m4.multiply(m4.translation([0, 1.05 + 0.5 * 0.75 * 0.5 * Math.sin(Math.PI / 3), 0]), m4.rotationX(Math.PI / 3)), m4.scaling([1, 0.05, 0.75])),
    color: [0.9, 0.9, 0.9, 1.0],
    diffuse: textureList.surface_image,
    specularFactor: 1,
};
//电脑屏幕，暂时用不到
let surfacebody_screen = {
    bufferInfo: primitives.createXYQuadBufferInfo(gl, 0.5),
    localMatrix: m4.multiply(m4.multiply(m4.translation([0.015, 1.05 + 0.5 * 0.75 * 0.5 * Math.sin(Math.PI / 3), 0.015]), m4.rotationX(-Math.PI / 6)), m4.scaling([1, 0.75, 1])),
    color: [0.75, 0.75, 0.75, 1.0],
    diffuse: textureList.surface_image,
    specularFactor: 1,
};
//电脑支架
let surfaceSupport = {
    bufferInfo: twgl.createBufferInfoFromArrays(gl, primitives.createCubeVertices(0.5)),
    localMatrix: m4.multiply(m4.multiply(m4.translation([0, 1.05 + 0.5 * 0.375 * 0.5 * Math.sin(Math.PI / 3), -0.0625]), m4.rotationX(Math.PI * 2 / 3)), m4.scaling([1, 0.05, 0.375])),
    color: [0.75, 0.75, 0.75, 1.0],
    diffuse: textureList.microsoft,
};
let surfaceKeyboard = {
    bufferInfo: primitives.createCubeBufferInfo(gl, 0.5),
    localMatrix: m4.multiply(m4.translation([0, 1.06, 0.3]), m4.scaling([1, 0.01, 0.8])),
    color: [1, 1, 1, 1],
    diffuse: textureList.keyboad_texture,
};


//物体列表
let objects = [cube, ground, coordinate_x, coordinate_y, coordinate_z,
    deskleg1, deskleg2, deskleg3, deskleg4, disc1, disc2, disc3, disc4
    , chairdown, chairback, chairleg1, chairleg2, chairleg3, chairleg4,
    surfaceBody, surfaceSupport, lightBulb, surfaceKeyboard];
