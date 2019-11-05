"use strict";

function main() {
	// Get A WebGL context
	/** @type {HTMLCanvasElement} */
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");
	if (!gl) {
		return;
	}
	
	// setup GLSL program
	var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
	
	// look up where the vertex data needs to go.
	var positionLocation = gl.getAttribLocation(program, "a_position");
	var colorLocation = gl.getAttribLocation(program, "a_color");
	
	// lookup uniforms
	var matrixLocation = gl.getUniformLocation(program, "u_matrix");
	
	// Create a buffer to put positions in
	var positionBuffer = gl.createBuffer();
	// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	// Put geometry data into buffer
	setGeometry(gl);
	
	// Create a buffer to put colors in
	var colorBuffer = gl.createBuffer();
	// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	// Put geometry data into buffer
	setColors(gl);
	
	function radToDeg(r) {
		return r * 180 / Math.PI;
	}
	
	function degToRad(d) {
		return d * Math.PI / 180;
	}

	var directX = [1,0,0,1];
	var directXR = [1,0,0,1];
	var directYR = [0,1,0,1];
	var directZR = [0,0,1,1];
	var translation = [0, 0, 0];
	var rotation = [degToRad(0), degToRad(0), degToRad(0)];
	var scale = [1, 1, 1];
	
	//init draw
	webglUtils.resizeCanvasToDisplaySize(gl.canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	drawScene();
	
	// Setup a ui.
	// webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
	// webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
	// webglLessonsUI.setupSlider("#z", {value: translation[2], slide: updatePosition(2), max: 2*gl.canvas.height});
	webglLessonsUI.setupSlider("#angleX", {value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360});
	webglLessonsUI.setupSlider("#angleY", {value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360});
	webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360});
	webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: 1, max: 5, step: 0.01, precision: 2});
	webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: 1, max: 5, step: 0.01, precision: 2});
	webglLessonsUI.setupSlider("#scaleZ", {value: scale[2], slide: updateScale(2), min: 1, max: 5, step: 0.01, precision: 2});

	document.getElementById("foward").onclick = function () {
		translation[0] += 10*directX[0];
		translation[1] += 10*directX[1];
		translation[2] += 10*directX[2];
		drawScene();
	}

	function updatePosition(index) {
		return function(event, ui) {
			translation[0] += directX[0];
			translation[1] += directX[1];
			translation[2] += directX[2];
			drawScene();
		};
	}
	
	function updateRotation(index) {
		return function(event, ui) {
			var angleInDegrees = ui.value;
			var angleInRadians = angleInDegrees * Math.PI / 180;
			rotation[index] = angleInRadians;
			drawScene();
		};
	}
	
	function updateScale(index) {
		return function(event, ui) {
			scale[index] = ui.value;
			drawScene();
		};
	}
	
	window.onresize = function () {
		// // Tell WebGL how to convert from clip space to pixels
		// gl.viewport(0, 0, canvas.width, canvas.height);
		// drawScene();
		
		let min = innerHeight < innerWidth ? innerHeight:innerWidth
		if(min<canvas.width || min<canvas.height){
			gl.viewport(0,canvas.height-min,min,min);
		}
		drawScene()
	};
	
	// Draw the scene.
	function drawScene(mode) {
		webglUtils.resizeCanvasToDisplaySize(gl.canvas);
		
		
		// Clear the canvas.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// Turn on culling. By default backfacing triangles
		// will be culled.
		gl.enable(gl.CULL_FACE);
		
		// Enable the depth buffer
		gl.enable(gl.DEPTH_TEST);
		
		// Tell it to use our program (pair of shaders)
		gl.useProgram(program);
		
		// Turn on the position attribute
		gl.enableVertexAttribArray(positionLocation);
		
		// Bind the position buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		
		// Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		var size = 3;          // 3 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.vertexAttribPointer(
			positionLocation, size, type, normalize, stride, offset);
		
		// Turn on the color attribute
		gl.enableVertexAttribArray(colorLocation);
		
		// Bind the color buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		
		// Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
		var size = 3;                 // 3 components per iteration
		var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
		var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
		var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;               // start at the beginning of the buffer
		gl.vertexAttribPointer(
			colorLocation, size, type, normalize, stride, offset);
		
		// Compute the matrices
		
		
		var left = 0;
		var right = gl.canvas.clientWidth;
		var bottom = gl.canvas.clientHeight;
		var top = 0;
		var near = 400;
		var far = -400;
		
		var matrix = m4.orthographic(left, right, bottom, top, near, far);

		var T = m4.translation( translation[0], translation[1], translation[2]);
        var Rx = m4.xRotation(rotation[0]);
        var Ry = m4.yRotation(rotation[1]);
        var Rz = m4.zRotation(rotation[2]);
		var S = m4.scaling(scale[0], scale[1], scale[2]);

		var mvMatrix =  m4.multiply( m4.multiply( m4.multiply( m4.multiply(T,Rx),Ry),Rz),S);
		matrix = m4.multiply(matrix,mvMatrix);

		directX = [1,0,0,1];
		directX = m4.transformDirection(mvMatrix,directX);
		console.log(directX);

		// console.log(direct);


		// Set the matrix.
		gl.uniformMatrix4fv(matrixLocation, false, matrix);
		
		// Draw the geometry.
		var primitiveType = gl.TRIANGLES;
		var offset = 0;
		var count = 16 * 6;
		gl.drawArrays(primitiveType, offset, count);


	}
}

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
    let array = new Float32Array([
            // left column front
            0,   0,  0,
            0, 150,  0,
            30,   0,  0,
            0, 150,  0,
            30, 150,  0,
            30,   0,  0,

            // top rung front
            30,   0,  0,
            30,  30,  0,
            100,   0,  0,
            30,  30,  0,
            100,  30,  0,
            100,   0,  0,

            // middle rung front
            30,  60,  0,
            30,  90,  0,
            67,  60,  0,
            30,  90,  0,
            67,  90,  0,
            67,  60,  0,

            // left column back
            0,   0,  30,
            30,   0,  30,
            0, 150,  30,
            0, 150,  30,
            30,   0,  30,
            30, 150,  30,

            // top rung back
            30,   0,  30,
            100,   0,  30,
            30,  30,  30,
            30,  30,  30,
            100,   0,  30,
            100,  30,  30,

            // middle rung back
            30,  60,  30,
            67,  60,  30,
            30,  90,  30,
            30,  90,  30,
            67,  60,  30,
            67,  90,  30,

            // top
            0,   0,   0,
            100,   0,   0,
            100,   0,  30,
            0,   0,   0,
            100,   0,  30,
            0,   0,  30,

            // top rung right
            100,   0,   0,
            100,  30,   0,
            100,  30,  30,
            100,   0,   0,
            100,  30,  30,
            100,   0,  30,

            // under top rung
            30,   30,   0,
            30,   30,  30,
            100,  30,  30,
            30,   30,   0,
            100,  30,  30,
            100,  30,   0,

            // between top rung and middle
            30,   30,   0,
            30,   60,  30,
            30,   30,  30,
            30,   30,   0,
            30,   60,   0,
            30,   60,  30,

            // top of middle rung
            30,   60,   0,
            67,   60,  30,
            30,   60,  30,
            30,   60,   0,
            67,   60,   0,
            67,   60,  30,

            // right of middle rung
            67,   60,   0,
            67,   90,  30,
            67,   60,  30,
            67,   60,   0,
            67,   90,   0,
            67,   90,  30,

            // bottom of middle rung.
            30,   90,   0,
            30,   90,  30,
            67,   90,  30,
            30,   90,   0,
            67,   90,  30,
            67,   90,   0,

            // right of bottom
            30,   90,   0,
            30,  150,  30,
            30,   90,  30,
            30,   90,   0,
            30,  150,   0,
            30,  150,  30,

            // bottom
            0,   150,   0,
            0,   150,  30,
            30,  150,  30,
            0,   150,   0,
            30,  150,  30,
            30,  150,   0,

            // left side
            0,   0,   0,
            0,   0,  30,
            0, 150,  30,
            0,   0,   0,
            0, 150,  30,
            0, 150,   0]);

    for (let i = 1; i <array.length; i=i+3) {
        array[i]-=75;
    }
	gl.bufferData(
		gl.ARRAY_BUFFER,
		array,
		gl.STATIC_DRAW);
}
// Fill the buffer with colors for the 'F'.
function setColors(gl) {
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Uint8Array([
			// left column front
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			
			// top rung front
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			
			// middle rung front
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			200,  70, 120,
			
			// left column back
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			
			// top rung back
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			
			// middle rung back
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			80, 70, 200,
			
			// top
			70, 200, 210,
			70, 200, 210,
			70, 200, 210,
			70, 200, 210,
			70, 200, 210,
			70, 200, 210,
			
			// top rung right
			200, 200, 70,
			200, 200, 70,
			200, 200, 70,
			200, 200, 70,
			200, 200, 70,
			200, 200, 70,
			
			// under top rung
			210, 100, 70,
			210, 100, 70,
			210, 100, 70,
			210, 100, 70,
			210, 100, 70,
			210, 100, 70,
			
			// between top rung and middle
			210, 160, 70,
			210, 160, 70,
			210, 160, 70,
			210, 160, 70,
			210, 160, 70,
			210, 160, 70,
			
			// top of middle rung
			70, 180, 210,
			70, 180, 210,
			70, 180, 210,
			70, 180, 210,
			70, 180, 210,
			70, 180, 210,
			
			// right of middle rung
			100, 70, 210,
			100, 70, 210,
			100, 70, 210,
			100, 70, 210,
			100, 70, 210,
			100, 70, 210,
			
			// bottom of middle rung.
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			76, 210, 100,
			
			// right of bottom
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			140, 210, 80,
			
			// bottom
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			90, 130, 110,
			
			// left side
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220,
			160, 160, 220]),
		gl.STATIC_DRAW);
}
window.onload = function init(){
	main();
};

