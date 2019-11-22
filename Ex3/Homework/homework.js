var canvas;
var gl;
//var program;

var ms = 360; //
var lightPosition = vec4(0, 2, 0, 1.0 );
var theta = 0.0;

var modelViewMatrix = mat4();//当前变换矩阵
var modelViewMatrixLoc;//shader变量
//桌子
var points = [];//顶点容器
var colors = [];//颜色容器
var vColor, vPosition;
var cBuffer, vBuffer;
var numVertices = 36;

var normalMatrix;
var normalMatrixLoc;
var CubeTx = 0, CubeTy = 0, CubeTz = 0;//平移量
var CubeRotateAngle = 0;
var scalePercent = 0.5;
var direct = vec4(0.0, 0.0, 1.0, 1.0);

//桌腿
var points_1 = [];
var colors_1 = [];
var vPosition_1;
var cBuffer_1,vBuffer_1;
var numVertices_1 = 2*(ms*3*2+ms*6) + ms*3*2

//-------------------------------------//surface
var points3_1 = [];
var colors3_1 = [];
var v_Position3_1;
var vBuffer3_1, cBuffer3_1;

// //var surface_1_vertice = [];
// //var surface_index = [];

// var surface_2 = vec4(1.5, 0.5, 0.01, 1.0);
// var points3_2 = [];
// var colors3_2 = [];
// var v_Position3_2;
// var vBuffer3_2, cBuffer3_2;

// var surface_3 = 0.005
// var points3_3 = [];
// var colors3_3 = [];
// var v_Position3_3;
// var vBuffer3_3, cBuffer3_3;
//*****************************************//surface

//桌面阴影
var points_2 = [];
var colors_2 = [];
var vPosition_2;
var vBuffer_2, cBuffer_2;
var numVertices_2 = 6;


var zhuomian = vec3(2.5, 0.1, 1.2);//长 高 宽
var leg = vec3(0.2, 2.0, 0.2);
var computer = vec3(0.8, 0.025, 0.5)
var support = vec3(0.8, 0, 0.3);

//备选颜色
var chooseColors = [
    vec4(1.0, 0.96, 0.30, 1.0), // 黄色
    vec4(1.0, 1.0, 1.0, 1.0), // 白色
    vec4(0.51, 0.33, 0.24, 1.0), // 褐色
    vec4(0.0, 0.0, 0.0, 1.0), // 黑色
    vec4(0.96, 0.64, 0.66, 1.0), // 粉色
    vec4(0.75,0.75,0.75,1.0)//灰色
];

//光源
var points6 = [];
var normal6 = [];
var vNormal6, vPosition6;
var nBuffer6, vBuffer6;
var CubeTx6 = lightPosition[0], CubeTy6 = lightPosition[1], CubeTz6 = lightPosition[2];//光源平移量
var scalePercent6 = 1;

var viewMatrixLoc;//当前视图矩阵的存储地址
var viewMatrix;//当前视图矩阵
var lookx = 1;
var looky = 1;
var lookz = 1;
var eye = vec3(lookx, looky, lookz);
const at = vec3(0.0, 0.0, -3.0);
const up = vec3(0,0, 1.0, 0.0);

var currentAngle = [0.0, 0.0];

var projectionMatrixLoc;
var projectionMatrix;//当前投影矩阵
var fovy = 45.0;
var aspect = 1.0;
var near = 0.2;
var far = 100.0;

//阴影投影矩阵
var mshadow = mat4();

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas, null);
    if(!gl){alert("Webgl isn't available");}

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor( 0.91, 0.92, 0.93, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    mshadow[3][3] = -zhuomian[1]*5/12-0.335;//投影面的y值

    mshadow[3][1] = -1 / lightPosition[1];
    this.setPoints();

    //初始化着色器
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //获取viewMatrix的变量存储地址
    viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');
    
    //设置视点，视线和上方向
    viewMatrix = lookAt(vec3(this.lookx, this.looky, this.lookz), vec3(0, 0, 0), vec3(0, 1, 0));
    //将视图矩阵传递给viewMarix变
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    //创建缓冲区
    

    //凳子腿椅子腿的buffer
    cBuffer_1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer_1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_1), gl.STATIC_DRAW);
    vColor_1 = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor_1);
    vBuffer_1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points_1), gl.STATIC_DRAW);
    vPosition_1 = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition_1);

    //桌面阴影的buffer
    cBuffer_2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer_2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors_2), gl.STATIC_DRAW);
    vColor_2 = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor_2);
    vBuffer_2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points_2), gl.STATIC_DRAW);
    vPosition_2 = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition_2);

    //桌面和椅子面的buffer
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor);
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition);

    //surface的buffer
    cBuffer3_1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer3_1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors3_1), gl.STATIC_DRAW);
    vColor3_1 = gl.getAttribLocation(program, "vColor");
    gl.enableVertexAttribArray(vColor3_1);
    vBuffer3_1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer3_1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points3_1), gl.STATIC_DRAW);
    vPosition3_1 = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(vPosition3_1);


    modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    //注册事件响应函数
    initEventHandlers(canvas, currentAngle);
    //事件

    document.getElementById("lightLeft").onclick = function() {
        lightPosition[0] -= 0.1;
    };
    document.getElementById("lightRight").onclick = function() {
        lightPosition[0] += 0.1;
    };
    document.getElementById("lightFront").onclick = function() {
        lightPosition[2] += 0.1;
    };
    document.getElementById("lightBack").onclick = function() {
        lightPosition[2] -= 0.1;
    };

    render();
}

// 计算矩阵作用于向量的结果，mat4 * vec4
function multMat4Vec4(mat4, vector) {
    var newVec = [];
    for (var i = 0; i < 4; i++) {
        newVec.push(mat4[i][0] * vector[0] +
            mat4[i][1] * vector[1] +
            mat4[i][2] * vector[2] +
            mat4[i][3] * vector[3]);
    }
    return newVec;
}

function render() {
   
    //gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    projectionMatrix = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc,false,flatten(projectionMatrix));

    

    //桌子变换
    var init = translate(0, 0, 0); // 初始变换矩阵，用于设置模型的初始位置
    var S = scalem(scalePercent, scalePercent, scalePercent);
    var T = translate(CubeTx, CubeTy, CubeTz);
    var R = rotateY(CubeRotateAngle);

    modelViewMatrix = mult(mult(mult(init, T), R), S);
    var m = mult(mult(T, R), S); // 用于处理正面的方向

    // 记录正面的方向
    direct = vec4( 0.0, 0.0, 1.0, 1.0 ); // 初始化初始方向
    direct = multMat4Vec4(m, direct);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    //桌面颜色
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);

    //桌面和板凳面顶点
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices*3);

    //桌腿

    // init = translate(0, 0, 0);
    // S = scalem(scalePercent, scalePercent, scalePercent);
    // T = translate(CubeTx, CubeTy, CubeTz);
    // R = rotateY(CubeRotateAngle);
    // modelViewMatrix = mult(mult(mult(init, T), R), S);
    // gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer_1);
    gl.vertexAttribPointer(vColor_1,4,gl.FLOAT,false,0,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_1);
    gl.vertexAttribPointer(vPosition_1, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, numVertices_1);
    //桌腿和板凳腿
    gl.drawArrays(gl.LINES, 0, numVertices_1*3);

     //电脑
     gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer3_1);
     gl.vertexAttribPointer(vColor3_1, 4, gl.FLOAT, false, 0, 0);
     gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer3_1);
     gl.vertexAttribPointer(vPosition3_1, 4, gl.FLOAT, false, 0, 0);
     gl.drawArrays(gl.TRIANGLES, 0, 36 + 6 + 6);

    //阴影变换
    modelViewMatrix = mult(modelViewMatrix, translate(lightPosition[0], lightPosition[1], lightPosition[2]));
    modelViewMatrix = mult(modelViewMatrix, mshadow);
    modelViewMatrix = mult(modelViewMatrix, translate(-lightPosition[0], -lightPosition[1],
        -lightPosition[2]));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //桌面颜色
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer_2);
    gl.vertexAttribPointer(vColor_2, 4, gl.FLOAT, false, 0, 0);

    //桌面和板凳面顶点
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_2);
    gl.vertexAttribPointer(vPosition_2, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, numVertices_2);

   

    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer3_2);
    // gl.vertexAttribPointer(vColor3_2, 4, gl.FLOAT, false, 0, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer3_2);
    // gl.vertexAttribPointer(vPosition3_2, 4, gl.FLOAT, false, 0, 0);
    // gl.drawArrays(gl.TRIANGLES, 0, 36);

    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer3_3);
    // gl.vertexAttribPointer(vColor3_3, 4, gl.FLOAT, false, 0, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer3_3);
    // gl.vertexAttribPointer(vPosition3_3, 4, gl.FLOAT, false, 0, 0);
    // gl.drawArrays(gl.TRIANGLES, 0, 36);


    requestAnimationFrame(render);
}



function setPoints() {
    
    getCylinderVertex(-zhuomian[0]/4, -zhuomian[1]*5/12,0,-1.8-(-zhuomian[2]/2),0.075,
    ms,360,2,points_1,colors_1);//左腿
    getCylinderVertex(zhuomian[0]/4, -zhuomian[1]*5/12,0,-1.8-(-zhuomian[2]/2),0.075,
    ms,360,2,points_1,colors_1);//右腿

    getCircleVertex(-zhuomian[0]/4,-zhuomian[1]*5/12-1.8-(-zhuomian[2]/2),0,0.3,ms,360,0,2,points_1,colors_1);//左底座
    getCircleVertex(zhuomian[0]/4,-zhuomian[1]*5/12-1.8-(-zhuomian[2]/2),0,0.3,ms,360,0,2,points_1,colors_1);//右底座

    //画桌子 和 板凳面
    drawDeskSurface(points, colors);//桌面
    //drawLeg(points, colors);//方形桌腿


    //画板凳腿
    getCylinderVertex(-zhuomian[0]/8, -zhuomian[1]*5/12-0.4,1.5,-1.4-(-zhuomian[2]/2),0.045,
        ms,360,2,points_1,colors_1);//左腿
    getCylinderVertex(zhuomian[0]/8, -zhuomian[1]*5/12-0.4,1.5,-1.4-(-zhuomian[2]/2),0.045,
        ms,360,2,points_1,colors_1);//右腿
    getCylinderVertex(-zhuomian[0]/8, -zhuomian[1]*5/12-0.4,1,-1.4-(-zhuomian[2]/2),0.045,
        ms,360,2,points_1,colors_1);//左腿
    getCylinderVertex(zhuomian[0]/8, -zhuomian[1]*5/12-0.4,1,-1.4-(-zhuomian[2]/2),0.045,
        ms,360,2,points_1,colors_1);//右腿

    //画电脑
    // get_surface_1_vertice(30);
    // get_surface_2_vertice(30);
    // get_surface_3_vertice(30);
    drawComputer(points3_1, colors3_1);

    drawDeskSurfaceShadow(points_2, colors_2);
}

function drawDeskSurface(pointArray, ColorArray) {
    //八个顶点
    var surfaceVertices = [
        vec4(-zhuomian[0]/2, zhuomian[1]/2, zhuomian[2]/2, 1.0),//0
        vec4(-zhuomian[0]*5/12, -zhuomian[1]/2, zhuomian[2]/2, 1.0),//1
        vec4(zhuomian[0]*5/12, -zhuomian[1]/2, zhuomian[2]/2, 1.0),//2
        vec4(zhuomian[0]/2, zhuomian[1]/2, zhuomian[2]/2, 1.0),//3
        vec4(-zhuomian[0]/2, zhuomian[1]/2, -zhuomian[2]/2, 1.0),//4
        vec4(-zhuomian[0]*5/12, -zhuomian[1]/2, -zhuomian[2]/2, 1.0),//5
        vec4(zhuomian[0]*5/12, -zhuomian[1]/2, -zhuomian[2]/2, 1.0),//6
        vec4(zhuomian[0]/2, zhuomian[1]/2, -zhuomian[2]/2, 1.0),//7
    ];
    quad(surfaceVertices, 0,1,2,3, 2, pointArray, ColorArray); //前
    quad(surfaceVertices, 2,6,7,3, 2, pointArray, ColorArray);//右
    quad(surfaceVertices, 1,5,6,2, 1, pointArray, ColorArray);//下
    quad(surfaceVertices, 0,3,7,4, 0, pointArray, ColorArray);//上
    quad(surfaceVertices, 4,7,6,5, 2, pointArray, ColorArray);//后
    quad(surfaceVertices, 0,4,5,1, 2, pointArray, ColorArray);//左

    //凳子面
    var chairSurfaceVertices = [
        vec4(-zhuomian[0]/5, zhuomian[1]/2-0.4, zhuomian[2]/3+1.25, 1.0),//0
        vec4(-zhuomian[0]/5, -zhuomian[1]/2-0.4, zhuomian[2]/3+1.25, 1.0),//1
        vec4(zhuomian[0]/5, -zhuomian[1]/2-0.4, zhuomian[2]/3+1.25, 1.0),//2
        vec4(zhuomian[0]/5, zhuomian[1]/2-0.4, zhuomian[2]/3+1.25, 1.0),//3
        vec4(-zhuomian[0]/5, zhuomian[1]/2-0.4, -zhuomian[2]/3+1.25, 1.0),//4
        vec4(-zhuomian[0]/5, -zhuomian[1]/2-0.4, -zhuomian[2]/3+1.25, 1.0),//5
        vec4(zhuomian[0]/5, -zhuomian[1]/2-0.4, -zhuomian[2]/3+1.25, 1.0),//6
        vec4(zhuomian[0]/5, zhuomian[1]/2-0.4, -zhuomian[2]/3+1.25, 1.0),//7
    ];
    quad(chairSurfaceVertices, 0,1,2,3, 4, pointArray, ColorArray); //前
    quad(chairSurfaceVertices, 2,6,7,3, 4, pointArray, ColorArray);//右
    quad(chairSurfaceVertices, 1,5,6,2, 3, pointArray, ColorArray);//下
    quad(chairSurfaceVertices, 0,3,7,4, 3, pointArray, ColorArray);//上
    quad(chairSurfaceVertices, 4,7,6,5, 4, pointArray, ColorArray);//后
    quad(chairSurfaceVertices, 0,4,5,1, 4, pointArray, ColorArray);//左

    //凳子靠背
    var chairBackSurfaceVertices = [
        vec4(-zhuomian[0]/5, zhuomian[1]/2+0.2, zhuomian[2]/3+1.25, 1.0),//0
        vec4(-zhuomian[0]/5, -zhuomian[1]/2-0.4, zhuomian[2]/3+1.25, 1.0),//1
        vec4(zhuomian[0]/5, -zhuomian[1]/2-0.4, zhuomian[2]/3+1.25, 1.0),//2
        vec4(zhuomian[0]/5, zhuomian[1]/2+0.2, zhuomian[2]/3+1.25, 1.0),//3
        vec4(-zhuomian[0]/5, zhuomian[1]/2+0.2, zhuomian[2]/3+1.16, 1.0),//4
        vec4(-zhuomian[0]/5, -zhuomian[1]/2-0.4, zhuomian[2]/3+1.16, 1.0),//5
        vec4(zhuomian[0]/5, -zhuomian[1]/2-0.4, zhuomian[2]/3+1.16, 1.0),//6
        vec4(zhuomian[0]/5, zhuomian[1]/2+0.2, zhuomian[2]/3+1.16, 1.0),//7
    ];
    quad(chairBackSurfaceVertices, 0,1,2,3, 4, pointArray, ColorArray); //前
    quad(chairBackSurfaceVertices, 2,6,7,3, 4, pointArray, ColorArray);//右
    quad(chairBackSurfaceVertices, 1,5,6,2, 3, pointArray, ColorArray);//下
    quad(chairBackSurfaceVertices, 0,3,7,4, 3, pointArray, ColorArray);//上
    quad(chairBackSurfaceVertices, 4,7,6,5, 3, pointArray, ColorArray);//后
    quad(chairBackSurfaceVertices, 0,4,5,1, 4, pointArray, ColorArray);//左
}

function drawDeskSurfaceShadow(pointArray, colorArray) {
    var shadowvertices = [
        vec4(-zhuomian[0]/2, zhuomian[1]/2, zhuomian[2]/2, 1.0),//0
        vec4(zhuomian[0]/2, zhuomian[1]/2, zhuomian[2]/2, 1.0),//3
        vec4(-zhuomian[0]/2, zhuomian[1]/2, -zhuomian[2]/2, 1.0),//4
        vec4(zhuomian[0]/2, zhuomian[1]/2, -zhuomian[2]/2, 1.0),//7
        // vec4(-zhuomian[0]/5, zhuomian[1]/2-0.4, zhuomian[2]/3+1.25, 1.0),//0
        // vec4(zhuomian[0]/5, zhuomian[1]/2-0.4, zhuomian[2]/3+1.25, 1.0),//3
        // vec4(-zhuomian[0]/5, zhuomian[1]/2-0.4, -zhuomian[2]/3+1.25, 1.0),//4
        // vec4(zhuomian[0]/5, zhuomian[1]/2-0.4, -zhuomian[2]/3+1.25, 1.0),//7
    ];
    quad(shadowvertices, 0,  1, 3, 2 ,3, pointArray, colorArray );
    //quad(shadowvertices, 4,  5, 7, 6 ,3, pointArray, colorArray );
}
function drawLeg(pointArray, ColorArray) {
    var legVertices = [
        vec4(-leg[0]/2 - zhuomian[0]*5/24, -zhuomian[1]/2, zhuomian[2]*5/24+leg[2], 1.0),//0
        vec4(-leg[0]/2 - zhuomian[0]*5/24, -zhuomian[1]/2-leg[1]/2, zhuomian[2]*5/24+leg[2], 1.0),//1
        vec4(- zhuomian[0]*5/24,-zhuomian[1]/2-leg[1]/2, zhuomian[2]*5/24+leg[2], 1.0),//2
        vec4(- zhuomian[0]*5/24, -zhuomian[1]/2, zhuomian[2]*5/24+leg[2], 1.0),//3
        vec4(-leg[0]/2 - zhuomian[0]*5/24, -zhuomian[1]/2,  zhuomian[2]*5/24, 1.0),//4
        vec4(-leg[0]/2 - zhuomian[0]*5/24, -zhuomian[1]/2-leg[1]/2,  zhuomian[2]*5/24, 1.0),//5
        vec4(- zhuomian[0]*5/24, -zhuomian[1]/2-leg[1]/2,  zhuomian[2]*5/24, 1.0),//6
        vec4(- zhuomian[0]*5/24, -zhuomian[1]/2,  zhuomian[2]*5/24, 1.0),//7
    ];
    quad(legVertices, 0,1,2,3, 2, pointArray, ColorArray); //前
    quad(legVertices, 2,6,7,3, 2, pointArray, ColorArray);//右
    quad(legVertices, 1,5,6,2, 2, pointArray, ColorArray);//下
    //quad(legVertices, 0,3,7,4, 0, pointArray, ColorArray);//上
    quad(legVertices, 4,7,6,5, 2, pointArray, ColorArray);//后
    quad(legVertices, 0,4,5,1, 2, pointArray, ColorArray);//左
}

function drawComputer(pointArray, colorArray){
    //画屏幕
    var surfaceVertices = [
        vec4(computer[0]/2, 0, computer[2]/2, 1.0),//0
        vec4(computer[0]/2, computer[1]/2, computer[2]/2 +computer[1]/Math.cos(Math.PI/6), 1.0),//1
        vec4(computer[0]/2, (computer[2]+computer[1]/2)*Math.cos(Math.PI/6), computer[1]*Math.cos(Math.PI/6), 1.0),//2
        vec4(computer[0]/2, computer[2]*Math.cos(Math.PI/6), 0, 1.0),//3
        vec4(-computer[0]/2, 0, computer[2]/2, 1.0),//4
        vec4(-computer[0]/2, computer[1]/2, computer[2]/2 +computer[1]/Math.cos(Math.PI/6), 1.0),//5
        vec4(-computer[0]/2, (computer[2]+computer[1]/2)*Math.cos(Math.PI/6), computer[1]*Math.cos(Math.PI/6), 1.0),//6
        vec4(-computer[0]/2, computer[2]*Math.cos(Math.PI/6), 0, 1.0),//7
    ];
    quad(surfaceVertices, 0,3,2,1, 5, pointArray, colorArray); //右
    quad(surfaceVertices, 2,3,7,6, 5, pointArray, colorArray);//上
    quad(surfaceVertices, 1,2,6,5, 3, pointArray, colorArray);//前
    quad(surfaceVertices, 0,1,5,4, 5, pointArray, colorArray);//下
    quad(surfaceVertices, 4,5,6,7, 5, pointArray, colorArray);//左
    quad(surfaceVertices, 0,4,7,3, 5, pointArray, colorArray);//后

    //画支架

    var supportVertices = [
        vec4(computer[0]/2, 0, computer[2]/2-support[2]*Math.cos(Math.PI/6)+0.04, 1,0),
        vec4(computer[0]/2, support[2]*Math.sin(Math.PI/6),computer[2]/4+0.04, 1,0),
        vec4(-computer[0]/2, 0, computer[2]/2-support[2]*Math.cos(Math.PI/6)+0.04, 1,0),
        vec4(-computer[0]/2, support[2]*Math.sin(Math.PI/6),computer[2]/4+0.04, 1,0)
    ]
    quad(supportVertices, 0, 2, 3, 1, 5, pointArray, colorArray)//

    //画屏幕黑框
    var offset = 0.1;
    var surfaceVertices = [
        vec4(computer[0]/2-offset, computer[1]/2+offset*Math.cos(Math.PI/6), computer[2]/2 +computer[1]/Math.cos(Math.PI/6)-offset*Math.sin(Math.PI/6), 1.0),//1
        vec4(computer[0]/2-offset, (computer[2]+computer[1]/2)*Math.cos(Math.PI/6)-offset*0.2*Math.cos(Math.PI/6), computer[1]*Math.cos(Math.PI/6)+offset*0.2*Math.sin(Math.PI/6), 1.0),//2
        vec4(-computer[0]/2+offset, computer[1]/2+offset*Math.cos(Math.PI/6), computer[2]/2 +computer[1]/Math.cos(Math.PI/6)-offset*Math.sin(Math.PI/6), 1.0),//5
        vec4(-computer[0]/2+offset, (computer[2]+computer[1]/2)*Math.cos(Math.PI/6)-offset*0.2*Math.cos(Math.PI/6), computer[1]*Math.cos(Math.PI/6)+offset*0.2*Math.sin(Math.PI/6), 1.0),//6
    ];
    quad(surfaceVertices, 0,1,3,2, 1, pointArray, colorArray); //右
}

function quad(vertices, a, b, c ,d,colorIndex, pointArray, ColorArray) {
    pointArray.push(vertices[a]);
    ColorArray.push(chooseColors[colorIndex]);
    pointArray.push(vertices[b]);
    ColorArray.push(chooseColors[colorIndex]);
    pointArray.push(vertices[c]);
    ColorArray.push(chooseColors[colorIndex]);
    pointArray.push(vertices[a]);
    ColorArray.push(chooseColors[colorIndex]);
    pointArray.push(vertices[c]);
    ColorArray.push(chooseColors[colorIndex]);
    pointArray.push(vertices[d]);
    ColorArray.push(chooseColors[colorIndex]);


}

function get_surface_1_vertice(alpha) { 
    var surfaceVertices = [
        vec4(-surface_1[0] / 2, -surface_1[1] / 2, -surface_1[2] / 2, 1.0),
        vec4(-surface_1[0] / 2, -surface_1[1] / 2, surface_1[2] / 2, 1.0),
        vec4(-surface_1[0] / 2, surface_1[1] / 2, -surface_1[2] / 2, 1.0),
        vec4(-surface_1[0] / 2, surface_1[1] / 2, surface_1[2] / 2, 1.0),
        vec4(surface_1[0] / 2, -surface_1[1] / 2, -surface_1[2] / 2, 1.0),
        vec4(surface_1[0] / 2, -surface_1[1] / 2, surface_1[2] / 2, 1.0),
        vec4(surface_1[0] / 2, surface_1[1] / 2, -surface_1[2] / 2, 1.0),
        vec4(surface_1[0] / 2, surface_1[1] / 2, surface_1[2] / 2, 1.0)
    ]
	quad(surfaceVertices, 0,1,2,3, 5, points3_1, colors3_1); //前
    quad(surfaceVertices, 2,6,7,3, 5, points3_1, colors3_1);//右
    quad(surfaceVertices, 1,5,6,2, 5, points3_1, colors3_1);//下
    quad(surfaceVertices, 0,3,7,4, 5, points3_1, colors3_1);//上
    quad(surfaceVertices, 4,7,6,5, 5, points3_1, colors3_1);//后
    quad(surfaceVertices, 0,4,5,1, 5, points3_1, colors3_1);//左

    var a = alpha * Math.PI / 180.0;
    var c = Math.cos( a );
    var s = Math.sin( a );
    var y,z;
    for(var i=0;i<points3_1.length;i++){
        y=points3_1[i][1];
        z=points3_1[i][2];
        points3_1[i][1]=c*y+s*z;
        points3_1[i][2]=-s*y+c*z;
    }

}

function get_surface_2_vertice(alpha) {

    var surfaceVertices = [
        vec4(-surface_2[0] / 2, -surface_2[1], -surface_2[2] - surface_1[2] / 2, 1.0),
        vec4(-surface_2[0] / 2, -surface_2[1], -surface_1[2] / 2, 1.0),
        vec4(-surface_2[0] / 2, 0, -surface_2[2] - surface_1[2] / 2),
        vec4(-surface_2[0] / 2, 0, -surface_1[2] / 2, 1.0),
        vec4(surface_2[0] / 2, -surface_2[1], -surface_2[2] - surface_1[2] / 2, 1.0),
        vec4(surface_2[0] / 2, -surface_2[1], -surface_1[2] / 2, 1.0),
        vec4(surface_2[0] / 2, 0, -surface_2[2] - surface_1[2] / 2, 1.0),
        vec4(surface_2[0] / 2, 0, -surface_1[2] / 2, 1.0)
    ]
	quad(surfaceVertices, 0,1,2,3, 5, points3_2, colors3_2); //前
    quad(surfaceVertices, 2,6,7,3, 5, points3_2, colors3_2);//右
    quad(surfaceVertices, 1,5,6,2, 5, points3_2, colors3_2);//下
    quad(surfaceVertices, 0,3,7,4, 5, points3_2, colors3_2);//上
    quad(surfaceVertices, 4,7,6,5, 5, points3_2, colors3_2);//后
    quad(surfaceVertices, 0,4,5,1, 5, points3_2, colors3_2);//左

    alpha=-alpha;
    var a = alpha * Math.PI / 180.0;
    var c = Math.cos( a );
    var s = Math.sin( a );
    var y,z;
    for(var i=0;i<points3_2.length;i++){
        y=points3_2[i][1];
        z=points3_2[i][2];
        points3_2[i][1]=c*y+s*z;
        points3_2[i][2]=-s*y+c*z;
    }

	
}

function get_surface_3_vertice(alpha) {

    var a=surface_1[1]/8;
    var l=Math.sqrt(a*a*Math.sin(alpha)*Math.sin(alpha)+48*a*a)-a*Math.sin(alpha);
    points3_3.push(vec4(points3_1[1][0]*7/8+points3_1[3][0]/8,points3_1[1][1]*7/8+points3_1[3][1]/8,points3_1[1][2]*7/8+points3_1[3][2]/8, 1.0));
    points3_3.push(vec4(points3_3[0][0],points3_3[0][1]-surface_3,points3_3[0][2], 1.0));
    points3_3.push(vec4(points3_3[0][0], points3_1[0][1]+surface_3, points3_1[0][2]+l, 1.0));
    points3_3.push(vec4(points3_3[0][0], points3_1[0][1], points3_1[0][2]+l, 1.0));
    points3_3.push(vec4(points3_1[5][0]*7/8+points3_1[7][0]/8,points3_1[5][1]*7/8+points3_1[7][1]/8,points3_1[5][2]*7/8+points3_1[7][2]/8, 1.0));
    points3_3.push(vec4(points3_3[4][0],points3_3[4][1]-surface_3,points3_3[4][2], 1.0));
    points3_3.push(vec4(points3_3[4][0], points3_1[0][1]+surface_3, points3_1[0][2]+l, 1.0));
    points3_3.push(vec4(points3_3[4][0], points3_1[0][1], points3_1[0][2]+l, 1.0));

    colors3_3.push(chooseColors[5]);
    colors3_3.push(chooseColors[5]);
    colors3_3.push(chooseColors[5]);
    colors3_3.push(chooseColors[5]);
    colors3_3.push(chooseColors[5]);
    colors3_3.push(chooseColors[5]);
    colors3_3.push(chooseColors[5]);
    colors3_3.push(chooseColors[5]);
    
	// quad(surfaceVertices, 0,1,2,3, 5, points3_3, colors3_3); //前
    // quad(surfaceVertices, 2,6,7,3, 5, points3_3, colors3_3);//右
    // quad(surfaceVertices, 1,5,6,2, 5, points3_3, colors3_3);//下
    // quad(surfaceVertices, 0,3,7,4, 5, points3_3, colors3_3);//上
    // quad(surfaceVertices, 4,7,6,5, 5, points3_3, colors3_3);//后
    // quad(surfaceVertices, 0,4,5,1, 5, points3_3, colors3_3);//左

    
}


// 画圆柱
// 半径r 面数m 度数c 偏移量offset (x,y,z)底面圆心坐标 h圆柱高度
function getCylinderVertex(x, y, z, h, r, m, c,colorIndex,points, colors){//共ms*3*2+ms*6
    var addAng = c / m;
    var angle = 0;
    for (var i = 0; i < m; i++) {//下底面,法向量都朝下
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y,z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
        
        points.push(vec4(x, y, z, 1.0));
        
        angle = angle + addAng;
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y,z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
        
    }
    for (var i = 0; i < m; i++) {//上底面,法向量都朝上
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y + h,z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
        
        points.push(vec4(x, y + h, z, 1.0));
        
        angle = angle + addAng;
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y + h,z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
    }
    for (var i = 0; i < m; i++) {//侧面由多个矩形构成，一个矩形由两个三角形构成
        //第一个三角形
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y , z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
        
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y + h,z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
        
        var temp = vec4(x + Math.cos(Math.PI / 180 * angle) * r, y + h, z + Math.sin(Math.PI / 180 * angle) * r, 1.0);
        angle = angle + addAng;
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y ,z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
        
        //第二个三角形
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y + h,z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
       
        points.push(vec4(x + Math.cos(Math.PI / 180 * angle) * r, y ,z + Math.sin(Math.PI / 180 * angle) * r, 1.0));
       
        points.push(temp);
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
        colors.push(chooseColors[colorIndex])
        
    }
}
// 画圆
// 半径r 面数m 度数c 偏移量offset
function getCircleVertex(x, y, z, r, m, c, offset,colorIndex, points,colors) {
    var addAng = c / m;
    var angle = 0;
    for (var i = 0; i < m; i++) {
        points.push(vec4(x + Math.sin(Math.PI / 180 * (angle+offset)) * r, y , z+ Math.cos(Math.PI / 180 * (angle+offset)) * r, 1.0));
        points.push(vec4(x, y, z, 1.0));
        angle = angle + addAng;
        points.push(vec4(x + Math.sin(Math.PI / 180 * (angle+offset)) * r, y , z+ Math.cos(Math.PI / 180 * (angle+offset)) * r, 1.0));
        colors.push(chooseColors[colorIndex]);
        colors.push(chooseColors[colorIndex]);
        colors.push(chooseColors[colorIndex]);
    }
}

function initEventHandlers(canvas, currentAngle) {
    var dragging = false; // 是否在拖动
    var lastX = -1, lastY = -1; // 鼠标的最后位置

    // 按下鼠标
    canvas.onmousedown = function (ev) {
        if (ev.button == 0) { // 按下的是鼠标左键
            var x = ev.clientX, y = ev.clientY;
            // 如果鼠标在<canvas>内就开始拖动
            var rect = ev.target.getBoundingClientRect();
            if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
                lastX = x;
                lastY = y;
                dragging = true;
            }
        }
    };

    // 松开鼠标
    canvas.onmouseup = function (ev) {
        if (ev.button == 0) { // 松开的是鼠标左键
            dragging = false;
        }
    };

    // 移动鼠标
    canvas.onmousemove = function (ev) {
        var x = ev.clientX, y = ev.clientY;
        if (dragging) {
            currentAngle = [0.0, 0.0];
            var factor = 50/canvas.height; //旋转因子
            var dx = factor * (x - lastX);
            var dy = factor * (y - lastY);
            // 将沿Y轴旋转的角度控制在-90到90度之间
            currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
            currentAngle[1] = currentAngle[1] + dx;

            var temp = vec4(lookx,looky,lookz,1);
            temp = multMat4Vec4(rotateX(currentAngle[0]), temp);
            temp = multMat4Vec4(rotateY(currentAngle[1]), temp);
            lookx = temp[0];
            looky = temp[1];
            lookz = temp[2];
            viewMatrix = lookAt(vec3(lookx,looky,lookz), vec3(0, 0, 0), vec3(0, 1, 0));
            gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        }
        lastX = x;
        lastY = y;
    };
    
    // 鼠标滚轮事件
    canvas.onmousewheel = function (ev) {
        var delta = ev.wheelDelta / 120;
        lookz = lookz + delta / 5;
        viewMatrix = lookAt(vec3(lookx,looky,lookz), vec3(0, 0, 0), vec3(0, 1, 0));
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        return false; // 禁用窗口的滚轮事件
    }
    
}