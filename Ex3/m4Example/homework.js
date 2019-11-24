"use strict";

function main() {
    // Get A WebGL context
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    //cube bufferInfo
    let cubeBufferInfo = webglUtils.createBufferInfoFromArrays(gl,primitives.createCubeVertices(150));
    let colorArray = primitives.makeRandomVertexColors(primitives.createCubeVertices(150));
    let colorBufferInfo = webglUtils.createBufferInfoFromArrays(gl,colorArray);

    // setup GLSL program
    var programInfo = webglUtils.createProgramInfo(gl, ["3d-vertex-shader", "3d-fragment-shader"]);;

    //some useful tool functions
    function radToDeg(r) {
        return r * 180 / Math.PI;
    }
    function degToRad(d) {
        return d * Math.PI / 180;
    }
    function randInt(range) {
        return Math.floor(Math.random() * range);
    }
    function rand(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + Math.random() * (max - min);
    }

    //radians of view
    var cameraAngleRadians = degToRad(0);
    var fieldOfViewRadians = degToRad(75);

    //uniforms that are the same for all objects
    var uniformsGlobal = {
        u_matrix:           m4.identity(),
    };

    //uniforms that are computed for each object
    //...

    drawScene();

    // // Setup a ui.
    // webglLessonsUI.setupSlider("#cameraAngle", {value: radToDeg(cameraAngleRadians), slide: updateCameraAngle, min: -360, max: 360});
    // function updateCameraAngle(event, ui) {
    //     cameraAngleRadians = degToRad(ui.value);
    //     drawScene();
    // }

    // Draw the scene.
    function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(programInfo.program);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        var numFs = 5;
        var radius = 200;

        // Compute the projection matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        // Compute a matrix for the camera
        var cameraMatrix = m4.yRotation(cameraAngleRadians);
        cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 2.5);

        // Make a view matrix from the camera matrix
        var viewMatrix = m4.inverse(cameraMatrix);

        // Compute a view projection matrix
        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        for (var ii = 0; ii < 3; ++ii) {
            var angle = ii * Math.PI * 2 / numFs;
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;

            // starting with the view projection matrix
            // compute a matrix for the F
            var matrix = m4.translate(viewProjectionMatrix, x, 0, y);
            uniformsGlobal.u_matrix = matrix;

            //commit uniform
            webglUtils.setUniforms(programInfo,uniformsGlobal);
            //commit buffer
            webglUtils.setBuffersAndAttributes(gl,programInfo,cubeBufferInfo);
            // Draw the geometry.
            // gl.drawArrays(gl.TRIANGLES, 0, cubeBufferInfo.numElements);

            webglUtils.setBuffersAndAttributes(gl,programInfo,colorBufferInfo);
            gl.drawElements(gl.TRIANGLES, cubeBufferInfo.numElements, gl.UNSIGNED_SHORT, 0);

        }

        requestAnimationFrame(()=>{
            cameraAngleRadians = degToRad(radToDeg(cameraAngleRadians)+1);
            drawScene();
        })
    }
}

window.onload=function () {
    main();
};
