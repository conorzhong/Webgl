let canvas;
let gl;

window.onload = function init() {
	canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl");
	if(!gl){
		alert("你的浏览器不支持webgl")
	}
	
	//render ready
	webglUtils.resizeCanvasToDisplaySize(canvas);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	
	//创建着色器
	let program = webglUtils.createProgramFromScripts(gl,["vertex-shader","fragment-shader"]);
	
	// 告诉它用我们之前写好的着色程序（一个着色器对）
	gl.useProgram(program);
	
	//获取属性位置
	let locationAPosition = gl.getAttribLocation(program, "aPosition");
	// 根据位置启动属性
	gl.enableVertexAttribArray(locationAPosition);
	//属性值从缓冲中获取数据，所以我们创建一个缓冲
	let positionBuffer = gl.createBuffer();
	//绑定位置信息缓冲（下面的绑定点就是ARRAY_BUFFER）
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	//然后指定从缓冲中读取数据的方式
	// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
	gl.vertexAttribPointer(locationAPosition, 2, gl.FLOAT, false, 0, 0);
	
	//获取画布大小
	let locationUResolution = gl.getUniformLocation(program, "uResolution");
	gl.uniform2f(locationUResolution,gl.canvas.width,gl.canvas.height);
	
	render(program);
};


function render(program) {
	// 清空画布
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	let point = [300,300];
	let blackR = 250;
	
	let locationUColor = gl.getUniformLocation(program,"uColor");
	let rgba = [0,0,0,1];
	setCircle(point,blackR,locationUColor,rgba);
	
	setLeaf(point,blackR,blackR/4,locationUColor)

	rgba = [1,0,0,1];
	setCircle(point,18,locationUColor,rgba);
}

//三角形切割法
function setCircle(point,r,locationUColor,rgba) {
	
	let blackCircle = [...point,];
	let N = 100;
	
	for (let i = 0; i <= N; i++) {
		let theta = i * 2 * Math.PI / (N - 2);
		let x = point[0]+r * Math.sin(theta);
		let y = point[1]+r * Math.cos(theta);
		blackCircle.push(x, y);
	}
	gl.uniform4f(locationUColor,...rgba);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blackCircle), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, N);
}

//二次函数
/**
 *
 * @param point 中心坐标
 * @param r 半径
 * @param width 顶点到原点的距离
 */
function setLeaf(point,r,width,locationUColor) {
	// x = ay^2 + c
	let a = width/r/r;
	let c = -width;

	// 右开口二次函数
	function calculateX(y){
		return a*y*y + c;
	}
	
	//从上到下填入点
	//注意还没有旋转
	let redLeaf = [];
	//旋转的
	let rRedLeaf = [];
	let rrRedLeaf = [];
	//平移之后的
	let redLeaf1 = [...redLeaf];
	let redLeaf2 = [...redLeaf];
	let redLeaf3 = [...redLeaf];
	//线
	let line = [];
	let rLine = [...line];
	let rrLine = [...line];
	let N = 100;    //精度
	let radians = Math.PI / 3;      //旋转角度
	//三角形
	let tri = [0,0,
			   -width/2*Math.sin(3.1415/3),width/2*Math.cos(3.1415/3),
				0,0.85*r,
				width/2*Math.sin(3.1415/3),width/2*Math.cos(3.1415/3)];
	let rTri = [];
	let rrTri = [];

	//注意是小于等于
	for (let i = 0; i <= N; i++) {
		let y = r - i * 2*r / N;
		let x = calculateX(y);

		redLeaf.push(x,y,-x,y);
	}

	//线
	let tempLeft = [];
	let tempRight = [];
	for (let i = 0; i < redLeaf.length; i = i + 2) {
		//检查x,x < 0 放第一个数组，反之第二个。
		if(redLeaf[i] < 0){
			tempLeft.push(redLeaf[i],redLeaf[i+1]);
		}
		else{
			tempRight.push(redLeaf[i],redLeaf[i+1]);
		}
	}
	line = [...tempLeft]
	//填充第二段线
	for (let i = tempRight.length - 2; i >= 0; i = i - 2) {
		line.push(tempRight[i],tempRight[i+1])
	}

	//旋转
	for (let i = 0; i < redLeaf.length; i = i + 2) {
		//图形
		let x = redLeaf[i];
		let y = redLeaf[i+1];
		rRedLeaf.push(x*Math.cos(radians) - y*Math.sin(radians));
		rRedLeaf.push(x*Math.sin(radians) + y*Math.cos(radians));
		rrRedLeaf.push(x*Math.cos(2 * radians) - y*Math.sin(2 * radians));
		rrRedLeaf.push(x*Math.sin(2 * radians) + y*Math.cos(2 * radians));

		//线条
		x = line[i];
		y = line [i + 1];
		rLine.push(x*Math.cos(radians) - y*Math.sin(radians));
		rLine.push(x*Math.sin(radians) + y*Math.cos(radians));
		rrLine.push(x*Math.cos(2 * radians) - y*Math.sin(2 * radians));
		rrLine.push(x*Math.sin(2 * radians) + y*Math.cos(2 * radians));
	}
	//三角形旋转和平移
	for (let i = 0; i < tri.length; i = i + 2) {
		let x = tri[i];
		let y = tri[i+1];
		rTri.push(x*Math.cos(2*radians) - y*Math.sin(2*radians));
		rTri.push(x*Math.sin(2*radians) + y*Math.cos(2*radians));
		rrTri.push(x*Math.cos(4 * radians) - y*Math.sin(4 * radians));
		rrTri.push(x*Math.sin(4 * radians) + y*Math.cos(4 * radians));

		tri[i]+=point[i%2];
		rTri[i]+=point[i%2];
		rrTri[i]+=point[i%2];
		tri[i+1]+=point[(i+1)%2];
		rTri[i+1]+=point[(i+1)%2];
		rrTri[i+1]+=point[(i+1)%2];
	}

	//抛物图和线 平移
	for (let i = 0; i < redLeaf.length; i++) {
		redLeaf1.push(redLeaf[i]+point[i%2]);
		redLeaf2.push(rRedLeaf[i]+point[i%2]);
		redLeaf3.push(rrRedLeaf[i]+point[i%2])

		line[i]+=point[i%2];
		rLine[i]+=point[i%2];
		rrLine[i]+=point[i%2];


	}
	//图形
	gl.uniform4f(locationUColor,1,0,0,1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(redLeaf1), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2*(N+1));
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(redLeaf2), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2*(N+1));
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(redLeaf3), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 2*(N+1));
	//线
	gl.uniform4f(locationUColor,0,0,0,1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(line), gl.STATIC_DRAW);
	gl.drawArrays(gl.LINE_STRIP, 0, 2*(N+1));
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rLine), gl.STATIC_DRAW);
	gl.drawArrays(gl.LINE_STRIP, 0, 2*(N+1));
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rrLine), gl.STATIC_DRAW);
	gl.drawArrays(gl.LINE_STRIP, 0, 2*(N+1));
	//三角形
	gl.uniform4f(locationUColor,0,0,0,1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tri), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rTri), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rrTri), gl.STATIC_DRAW);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}