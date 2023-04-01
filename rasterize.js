/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
var canvas;
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog3/triangles.json"; // triangles file loc
const INPUT_ELLIPSOIDS_URL = "https://ncsucgclass.github.io/prog3/ellipsoids.json";
//const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog3/spheres.json"; // spheres file loc
var Eye = new vec3.fromValues(0.5, 0.5, -0.5); // default eye position in world space
var center = [0.5, 0.5, 1] // default lookAt vector
var view_up = [0, 1, 0]; // up direction vector
// var window = { ul: new Vector(0, 0, 0), ur: new Vector(1, 0, 0), ll: new Vector(0, 1, 0), lr: new Vector(1, 1, 0) };
var light = { x: -0.5, y: 1.5, z: -0.5, ambient: [1, 1, 1], diffuse: [1, 1, 1], specular: [1, 1, 1] }
var move = [0.5, 0, 0] // default lookAt vector
var movingValue = 0.0002;
/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer; // this contains vertex coordinates in triples
var triangleBuffer; // this contains indices into vertexBuffer in triples
var triBufferSize = 0; // the number of indices in the triangle buffer
var altPosition; // flag indicating whether to alter vertex positions
var vertexPositionAttrib; // where to put position for vertex shader
var altPositionUniform; // where to put altPosition flag for vertex shader
var indexArray = []
var inputTriangles;
var triSetSizes = []; // the number of triangles in each set
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projMatrix = mat4.create();
const temp = mat4.create();

var matWorldUniformLocatio;
var matViewUniformLocation;;
var matProjUniformLocation;
var setScale = vec3.fromValues(1.2,1.2,1.2); 
var setScaleOffset = vec3.fromValues(-0.04,-0.1,-0.15);
var triangleBuffers = []; // this contains indices into vertexBuffers in triples, organized by tri set
var vertexBuffers = []; // this contains vertex coordinates in triples, organized by tri set
var selectIndex = -1;
var xTranslate = 0;
var yTranslate = 0;
var zTranslate = 0;
var xRotate = 0;
var yRotate = 0;
var zRotate = 0;
var abb = vec3.create();

abb[0] += 0.5;

var translateValue = 0;
var scalingValue = 0;
var cloneList = [];
// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response);
        } // end if good params
    } // end try

    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it

    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try

    catch(e) {
      console.log(e);
    } // end catch

} // end setupWebGL


// function Blinn_Phong (ambient, diffuse, specular, n) {
//     var canvas = document.getElementById("myWebGLCanvas");
//     var w = canvas.width
//     var h = canvas.height

//     for (i = 0; i < indexArray.length; i++) {
//         for (currentXPixel = 0; currentXPixel < w; currentXPixel++) {
//             var t = currentXPixel / w
//             for (currentYPixel = 0; currentYPixel < h; currentYPixel++) {
//                 var s = currentYPixel / h
//                 var pixelCoordinates = bilerp(window, s, t)
//                 var dX = pixelCoordinates.pX - Eye[0]
//                 var dY = pixelCoordinates.pY - Eye[1]
//                 var dZ = pixelCoordinates.pZ - Eye[2]
//                 var I0x = 0, I0y, I0z = 0

//                 var xIntersections = findXIntersections(indexArray[i], Eye, dX)
//                 var yIntersections = findYIntersections(indexArray[i], Eye, dY)
//                 var zIntersections = findZIntersections(indexArray[i], Eye, dZ)
//                 var rayDistanceToFirstIntersection = Math.max(xIntersections.tx0, yIntersections.ty0, zIntersections.tz0)
//                 var rayDistanceToSecondIntersection = Math.min(xIntersections.tx1, yIntersections.ty1, zIntersections.tz1)

//                 if (rayDistanceToFirstIntersection <= rayDistanceToSecondIntersection) {
//                     t0 = rayDistanceToFirstIntersection
//                     I0x = (Eye[0] + (t0 * dX))
//                     I0y = (Eye[1] + (t0 * dY))
//                     I0z = (Eye[2] + (t0 * dZ))

//                     var ambColor = []
//                     var difColor = []
//                     var specColor = []
//                     var totalLightColor = []

//                     var worldLoc = new Vector(I0x, I0y, I0z)
//                     var normalVec
//                     if (t0 == xIntersections.tx0) {
//                         normalVec = new Vector(xIntersections.xSign, 0, 0)
//                     }
//                     else if (t0 == yIntersections.ty0) {
//                         normalVec = new Vector(0, yIntersections.ySign, 0)
//                     }
//                     else {
//                         normalVec = new Vector(0, 0, zIntersections.zSign)
//                     }
//                     var lVect = new Vector(light.x, light.y, light.z)
//                     lVect = Vector.subtract(lVect, worldLoc)
//                     lVect = Vector.normalize(lVect)
//                     normalVec = Vector.normalize(normalVec)
//                     var hVector = Vector.add(Eye, lVect)
//                     hVector = Vector.normalize(hVector)
//                     var NdotL = Vector.dot(normalVec, lVect)
//                     var NdotH = Vector.dot(normalVec, hVector)

//                     // calc ambient color
//                     ambColor[0] = ambient[0] * light.ambient[0]
//                     ambColor[1] = ambient[1] * light.ambient[1]
//                     ambColor[2] = ambient[2] * light.ambient[2]

//                     // calc diffuse color
//                     difColor[0] = diffuse[0] * light.diffuse[0] * NdotL
//                     difColor[1] = diffuse[1] * light.diffuse[1] * NdotL
//                     difColor[2] = diffuse[2] * light.diffuse[2] * NdotL

//                     // calc specular color
//                     var nSpec = n
//                     specColor[0] = specular[0] * light.specular[0] * (NdotH ** nSpec)
//                     specColor[1] = specular[1] * light.specular[1] * (NdotH ** nSpec)
//                     specColor[2] = specular[2] * light.specular[2] * (NdotH ** nSpec)

//                     totalLightColor[0] = ambColor[0] + difColor[0] + specColor[0]
//                     totalLightColor[1] = ambColor[1] + difColor[1] + specColor[1]
//                     totalLightColor[2] = ambColor[2] + difColor[2] + specColor[2]
//                 }
//                 return totalLightColor
//             }
//         }
//     }
// }

// function bilerp (window, s, t) {
//     var pLX = window.ul.x + s * (window.ll.x - window.ul.x)
//     var pRX = window.ur.x + s * (window.lr.x - window.ur.x)
//     var pX = pLX + t * (pRX - pLX)
//     var pLY = window.ul.y + s * (window.ll.y - window.ul.y)
//     var pRY = window.ur.y + s * (window.lr.y - window.ur.y)
//     var pY = pLY + t * (pRY - pLY)
//     var pLZ = window.ul.z + s * (window.ll.z - window.ul.z)
//     var pRZ = window.ur.z + s * (window.lr.z - window.ur.z)
//     var pZ = pLZ + t * (pRZ - pLZ)
//     var coordinates = { pX: pX, pY: pY, pZ: pZ }
//     return coordinates
// }

// function findXIntersections (box, eye, d) {
//     var rayDistToLeftX = ((box.lx - eye.x) / d)
//     var rayDistToRightX = ((box.rx - eye.x) / d)
//     var tx0 = Math.min(rayDistToLeftX, rayDistToRightX)
//     var tx1 = Math.max(rayDistToLeftX, rayDistToRightX)
//     var xSign = -1
//     if (tx0 == rayDistToRightX) xSign = 1
//     var intersections = { tx0: tx0, tx1: tx1, xSign: xSign }
//     return intersections
// }

// function findYIntersections (box, eye, d) {
//     var rayDistToBottomY = ((box.by - eye.y) / d)
//     var rayDistToTopY = ((box.ty - eye.y) / d)
//     var ty0 = Math.min(rayDistToBottomY, rayDistToTopY)
//     var ty1 = Math.max(rayDistToBottomY, rayDistToTopY)
//     var ySign = 1
//     if (ty0 == rayDistToBottomY) ySign = -1
//     var intersections = { ty0: ty0, ty1: ty1, ySign: ySign }
//     return intersections
// }

// function findZIntersections (box, eye, d) {
//     var rayDistToFrontZ = ((box.fz - eye.z) / d)
//     var rayDistToRearZ = ((box.rz - eye.z) / d)
//     var tz0 = Math.min(rayDistToFrontZ, rayDistToRearZ)
//     var tz1 = Math.max(rayDistToFrontZ, rayDistToRearZ)
//     var zSign = 1
//     if (tz0 == rayDistToFrontZ) zSign = -1
//     var intersections = { tz0: tz0, tz1: tz1, zSign: zSign }
//     return intersections
// }

// read triangles in, load them into webgl buffers
function loadTriangles() {
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");

    if (inputTriangles != String.null) {
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var coordArray = []; // 1D array of vertex coords for WebGL
        var indexArray = []; // 1D array of vertex indices for WebGL
        var vtxBufferSize = 0; // the number of vertices in the vertex buffer
        var vtxToAdd = []; // vtx coords to add to the coord array
        var colorToAdd = [];
        var indexOffset = vec3.create(); // the index offset for the current set
        var triToAdd = vec3.create(); // tri indices to add to the index array

        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
            vec3.set(indexOffset, vtxBufferSize, vtxBufferSize, vtxBufferSize); // update vertex offset
            triSetSizes.push(inputTriangles[whichSet].triangles.length);
            inputTriangles[whichSet].coordArray = []; // create a list of coords for this tri set
            inputTriangles[whichSet].indexArray = []; // create a list of tri indices for this tri set
            inputTriangles[whichSet].triCenter = [];
            var triangleAmbient = inputTriangles[whichSet].material.ambient;
            var triangleDiffuse = inputTriangles[whichSet].material.diffuse;
            var triangleSpecular = inputTriangles[whichSet].material.specular;
            var triangleN = inputTriangles[whichSet].material.n;

            var blinnPhongAmbient = vec3.create();
            var blinnPhongDiffuse = vec3.create();
            var blinnPhongSpecular = vec3.create();

            blinnPhongAmbient[0] = triangleAmbient[0] * light.ambient[0];
            blinnPhongAmbient[1] = triangleAmbient[1] * light.ambient[1];
            blinnPhongAmbient[2] = triangleAmbient[2] * light.ambient[2];

            // console.log(blinnPhongAmbient)

            // set up the vertex coord array
            var tri_center = vec3.create();
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {

                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                vec3.add(tri_center, tri_center, vtxToAdd);

                var triangleNormal = new vec3.fromValues(
                    inputTriangles[whichSet].normals[whichSetVert][0],
                    inputTriangles[whichSet].normals[whichSetVert][1],
                    inputTriangles[whichSet].normals[whichSetVert][2]
                );
                vec3.normalize(triangleNormal, triangleNormal)
                var lVect = new vec3.fromValues(light.x, light.y, light.z)
                var worldLoc = new vec3.fromValues(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]);
                vec3.sub(lVect, lVect, worldLoc);
                vec3.normalize(lVect, lVect);
                var hVector = vec3.create();
                vec3.add(hVector, Eye, lVect);
                vec3.normalize(hVector, hVector);
                var NdotL = vec3.dot(triangleNormal, lVect);
                var NdotH = vec3.dot(triangleNormal, hVector);

                blinnPhongDiffuse[0] = triangleDiffuse[0] * light.diffuse[0] * NdotL;
                blinnPhongDiffuse[1] = triangleDiffuse[1] * light.diffuse[1] * NdotL;
                blinnPhongDiffuse[2] = triangleDiffuse[2] * light.diffuse[2] * NdotL;

                // console.log(blinnPhongDiffuse);

                blinnPhongSpecular[0] = triangleSpecular[0] * light.specular[0] * (NdotH ** triangleN);
                blinnPhongSpecular[1] = triangleSpecular[1] * light.specular[1] * (NdotH ** triangleN);
                blinnPhongSpecular[2] = triangleSpecular[2] * light.specular[2] * (NdotH ** triangleN);

                // console.log(blinnPhongSpecular);

                colorToAdd = [
                    blinnPhongAmbient[0] + blinnPhongDiffuse[0] + blinnPhongSpecular[0],  // Red
                    blinnPhongAmbient[1] + blinnPhongDiffuse[1] + blinnPhongSpecular[1],  // Green
                    blinnPhongAmbient[2] + blinnPhongDiffuse[2] + blinnPhongSpecular[2]   // Blue
                ]

                // console.log(colorToAdd)
                inputTriangles[whichSet].coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2], colorToAdd[0],colorToAdd[1],colorToAdd[2]);
                // coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2], colorToAdd[0],colorToAdd[1],colorToAdd[2]);
            } // end for vertices in set
            vec3.scale(tri_center, tri_center, 1 / inputTriangles[whichSet].vertices.length);
            inputTriangles[whichSet].triCenter.push(tri_center);

            for (whichSetTri=0; whichSetTri<inputTriangles[whichSet].triangles.length; whichSetTri++) {
                vec3.add(triToAdd,indexOffset,inputTriangles[whichSet].triangles[whichSetTri]);
                inputTriangles[whichSet].indexArray.push(triToAdd[0], triToAdd[1], triToAdd[2]);
                // indexArray.push(triToAdd[0], triToAdd[1], triToAdd[2]);
            } // end for triangles in set

            vtxBufferSize += inputTriangles[whichSet].vertices.length; // total number of vertices
            // triBufferSize += inputTriangles[whichSet].triangles.length; // total number of tris
            vtxBufferSize = 0;


            // send the vertex coords to webGL
            vertexBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer
            gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].coordArray), gl.STATIC_DRAW); // coords to that buffer
            // send the triangle indices to webGL
            triangleBuffers[whichSet] = gl.createBuffer(); // init empty triangle index buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].indexArray),gl.STATIC_DRAW); // indices to that buffer
        } // end for each triangle set
            // console.log(triSetSizes[0])

        // triBufferSize *= 3; // now total number of indices

        // // send the vertex coords to webGL
        // vertexBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer
        // gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordArray), gl.STATIC_DRAW); // coords to that buffer

        // // send the triangle indices to webGL
        // triangleBuffers[whichSet] = gl.createBuffer(); // init empty triangle index buffer
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer

    } // end if triangles found
} // end load triangles

// setup the webGL shaders
function setupShaders() {

    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float;
        varying vec3 vColor;
        void main(void) {
            gl_FragColor = vec4(vColor, 1.0); // all fragments are white
        }
    `;

    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        uniform bool altPosition;
        attribute vec3 color;
        varying vec3 vColor;
        uniform mat4 mWorld;
        uniform mat4 mView;
        uniform mat4 mProj;

        void main(void) {
            vColor = color;
            // gl_Position = vec4(vertexPosition, 1.0);
            gl_Position = mProj * mView * mWorld* vec4(vertexPosition, 1.0);
            // if(altPosition)
            //     gl_Position = vec4(vertexPosition + vec3(-1.0, -1.0, 0.0), 1.0); // use the altered position
            // else
            //     gl_Position = vec4(vertexPosition, 1.0); // use the untransformed position
        }
    `;

    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                vertexPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPosition");
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                altPositionUniform = // get pointer to altPosition flag
                    gl.getUniformLocation(shaderProgram, "altPosition");
                colorPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "color");
                gl.enableVertexAttribArray(colorPositionAttrib); // input to shader from array

                matWorldUniformLocation = gl.getUniformLocation(shaderProgram, "mWorld");
                matViewUniformLocation = gl.getUniformLocation(shaderProgram, "mView");
                matProjUniformLocation = gl.getUniformLocation(shaderProgram, "mProj");

                
                // mat4.lookAt(viewMatrix, Eye, center, view_up);
                // mat4.perspective(projMatrix, Math.PI / 2, canvas.width / canvas.height, 0.1, 1000.0);

                // gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
                // gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

                // var worldMatrix = new Float32Array(16);
                // var viewMatrix = new Float32Array(16);
                // var projMatrix = new Float32Array(16);
                // mat4.identity(worldMatrix);

                // window.addEventListener("keydown", function(event){
                //     if(event.key == "a") {
                //         center[0] -= .1
                //         Eye[0] -= 0.1
                //     }
                // });
                // mat4.rotateZ(modelMatrix, modelMatrix, 1);


            } // end if no shader program link errors
        } // end if no compile errors
    } // end try

    catch(e) {
        console.log(e);
    } // end catch
    altPosition = false;
    // setTimeout(function alterPosition() {
    //     altPosition = !altPosition;
    //     setTimeout(alterPosition, 2000);
    // }, 2000); // switch flag value every 2 seconds
} // end setup shaders
var testValue = 0;
var angle = 0



// render the loaded model
function renderTriangles() {
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    // bgColor = (bgColor < 1) ? (bgColor + 0.001) : 0;
    // gl.clearColor(bgColor, 0, 0, 1.0);
    // requestAnimationFrame(renderTriangles);
    // // vertex buffer: activate and feed into vertex shader
    // gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
    // gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed
    // gl.uniform1i(altPositionUniform, altPosition); // feed

    // gl.drawArrays(gl.TRIANGLES,0,3); // render




    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    // bgColor = (bgColor < 1) ? (bgColor + 0.001) : 0;
    // gl.clearColor(bgColor, 0, 0, 1.0);
    requestAnimationFrame(renderTriangles);
    testValue += 0.01;
    // window.addEventListener("keydown", function(event){
    //     if(event.key == "a") {
    //         mat4.multiply(modelMatrix,
    //             mat4.fromTranslation(mat4.create(),[movingValue, 0, 0]),
    //           modelMatrix); // left
    //     }else if(event.key == "d"){
    //         mat4.multiply(modelMatrix,
    //             mat4.fromTranslation(mat4.create(),[-movingValue, 0, 0]),
    //           modelMatrix); // right
    //     }else if(event.key == "w"){
    //         mat4.multiply(modelMatrix,
    //             mat4.fromTranslation(mat4.create(),[0, 0, -movingValue]),
    //           modelMatrix); // forward
    //     }else if(event.key == "s"){
    //         mat4.multiply(modelMatrix,
    //             mat4.fromTranslation(mat4.create(),[0, 0, movingValue]),
    //           modelMatrix); // away
    //     }else if(event.key == "q"){
    //         mat4.multiply(modelMatrix,
    //             mat4.fromTranslation(mat4.create(),[0, movingValue, 0]),
    //           modelMatrix); // up
    //     }else if(event.key == "e"){
    //         mat4.multiply(modelMatrix,
    //             mat4.fromTranslation(mat4.create(),[0, -movingValue, 0]),
    //           modelMatrix); // down
    //     }else if(event.key == "A"){
    //             mat4.rotateY(modelMatrix, modelMatrix, movingValue);// yaw left
    //     }else if(event.key == "D"){
    //         mat4.rotateY(modelMatrix, modelMatrix, -movingValue);// yaw right

    //     }else if(event.key == "W"){
    //         mat4.rotateX(modelMatrix, modelMatrix, movingValue);// pitch forward

    //     }else if(event.key == "S"){
    //         mat4.rotateX(modelMatrix, modelMatrix, -movingValue);// pitch backward

    //     }
        
    //   });
    // mat4.rotateX(modelMatrix, modelMatrix, 0.1);

    // mat4.rotateZ(modelMatrix, modelMatrix, 1);
    // inputTriangles[0].mMatrix = mat4.create(); // modeling mat for tri set
    // mat4.fromTranslation(inputTriangles[0].mMatrix,vec3.negate(vec3.create(),center)); // translate to origin
    // mat4.multiply(inputTriangles[0].mMatrix,
    //               mat4.fromRotation(mat4.create(),Math.PI*0.75,vec3.fromValues(0,0,1)),
    //               inputTriangles[0].mMatrix); // rotate 90 degs
    // mat4.multiply(inputTriangles[0].mMatrix,
    //               mat4.fromTranslation(mat4.create(),setCenter),
    //               inputTriangles[0].mMatrix); // move back to center
    // var setCenter = vec3.fromValues(0.01,0.08,0);  // center coords of tri set 
    // // mat4.rotateX(inputTriangles[0].mMatrix, inputTriangles[0].mMatrix, 0.4);
    // for (var whichTriSet=0; whichTriSet<inputTriangles.length; whichTriSet++) {
    //     mat4.scale(inputTriangles[whichTriSet].mMatrix, cloneList[whichTriSet], vec3.fromValues(1,1,1));
    // } 

    var temp =  mat4.create();


    for (var whichTriSet=0; whichTriSet<inputTriangles.length; whichTriSet++) {
        // if(whichTriSet != selectIndex){
        //     inputTriangles[whichTriSet].mMatrix[0] = 1;
        //     inputTriangles[whichTriSet].mMatrix[5] = 1;
        //     inputTriangles[whichTriSet].mMatrix[10] = 1;
        //     inputTriangles[whichTriSet].mMatrix[12] = 0;
        //     inputTriangles[whichTriSet].mMatrix[13] = 0;
        //     inputTriangles[whichTriSet].mMatrix[14] = 0;

        // }
        // mat4.translate(inputTriangles[whichTriSet].mMatrix, inputTriangles[whichTriSet].mMatrix, inputTriangles[whichTriSet].triCenter);
        mat4.scale(inputTriangles[whichTriSet].mMatrix, temp, vec3.fromValues(1,1,1));
        
    } 


    // mat4.translate(inputTriangles[0].mMatrix, inputTriangles[0].mMatrix, vec3.fromValues(1,1,1));
    
    // if (stop != 0){
    //     for (var whichTriSet=0; whichTriSet<inputTriangles.length; whichTriSet++) {

    //         mat4.multiply(inputTriangles[whichTriSet].mMatrix,
    //             mat4.fromScaling(mat4.create(),vec3.fromValues(1,1,1)),
    //             temp); // move back to center
    //              } 

    // }




    // for (var whichTriSet=0; whichTriSet<inputTriangles.length; whichTriSet++) {
    //     mat4.scale(inputTriangles[whichTriSet].mMatrix, temp, vec3.fromValues(1,1,1));
    // } 
    window.addEventListener("keyup", function(event){
        if(event.key == "a") {  // left
            center[0] -= movingValue;
            Eye[0] -= movingValue;
        }else if(event.key == "d"){ // right
            center[0] += movingValue;
            Eye[0] += movingValue;
        }else if(event.key == "w"){ // forward
            center[2] += movingValue;
            Eye[2] += movingValue;
        }else if(event.key == "s"){ // away
            center[2] -= movingValue;
            Eye[2] -= movingValue;
        }else if(event.key == "q"){ // up
            center[1] += movingValue;
            Eye[1] += movingValue;
        }else if(event.key == "e"){ // down
            center[1] -= movingValue;
            Eye[1] -= movingValue;
        }else if(event.key == "A"){ // yaw left
            center[0] -= movingValue;
        }else if(event.key == "D"){ // yaw right
            center[0] += movingValue;
        }else if(event.key == "W"){ // pitch forward
            center[1] -= movingValue;

        }else if(event.key == "S"){ // pitch backward
            center[1] += movingValue;

        }else if(event.keyCode == 37){ // left arrow
                selectIndex -= 1;
                if(selectIndex < 0){
                    selectIndex = inputTriangles.length - 1;
                }  

        }else if(event.keyCode == 39){ // right arrow

                selectIndex += 1;
                if(selectIndex >= inputTriangles.length){
                    selectIndex = 0;
                }
        }else if(event.keyCode == 32){ // space
            selectIndex = -1;
        }else if(event.key == "k"){ // left
            if(selectIndex != -1){
                xTranslate += 0.0001;
            }

        }else if(event.key == ";"){ // right
            if(selectIndex != -1){
                xTranslate -= 0.0001;
                }
        }else if(event.key == "o"){ // forward
            if(selectIndex != -1){
                zTranslate -= 0.0001;
                }
        }else if(event.key == "l"){ // backward
            if(selectIndex != -1){
                zTranslate += 0.0001;
                }
        }else if(event.key == "i"){ // up
            if(selectIndex != -1){
                yTranslate += 0.0001;
                }
        }else if(event.key == "p"){ // down
            if(selectIndex != -1){
                yTranslate -= 0.0001;
                }
        }else if(event.key == "K"){ // yaw left
            if(selectIndex != -1){
                yRotate -= 0.05;
                }
        }else if(event.key == ":"){ // yaw right
            if(selectIndex != -1){

                yRotate += 0.05;
                }
        }else if(event.key == "O"){ // pitch forward
            if(selectIndex != -1){
                xRotate -= 0.02;

            }
        }else if(event.key == "L"){ // pitch back
            if(selectIndex != -1){
                xRotate += 0.04;

            }
        }  else if(event.key == "I"){ // rotate right
            if(selectIndex != -1){
                zRotate += 0.04;

            }
        }    else if(event.key == "P"){ // rotate left
            if(selectIndex != -1){
                zRotate -= 0.05;

            }
        }      

        });




    // translate and rotating when selected 
    if (selectIndex != -1){

        // translateValue = mat4.translate(inputTriangles[selectIndex].mMatrix, inputTriangles[selectIndex].mMatrix, setScaleOffset);
        // scalingValue = mat4.scale(inputTriangles[selectIndex].mMatrix, inputTriangles[selectIndex].mMatrix, setScale);

        var setCenter = vec3.fromValues(inputTriangles[selectIndex].triCenter[0][0], inputTriangles[selectIndex].triCenter[0][1], inputTriangles[selectIndex].triCenter[0][2]);  // center coords of tri set 
        mat4.fromTranslation(inputTriangles[selectIndex].mMatrix,vec3.negate(vec3.create(),setCenter)); // translate to origin
        
        mat4.translate(inputTriangles[selectIndex].mMatrix, inputTriangles[selectIndex].mMatrix, vec3.fromValues(xTranslate,yTranslate,zTranslate));

        // if( xRotate != 0 || yRotate != 0 || zRotate != 0){
        //     mat4.fromTranslation(inputTriangles[selectIndex].mMatrix,vec3.negate(vec3.create(),inputTriangles[selectIndex].triCenter)); // translate to origin
        //     mat4.multiply(inputTriangles[selectIndex].mMatrix,
        //                     mat4.fromRotation(mat4.create(),Math.PI/2,vec3.fromValues(xRotate,yRotate,zRotate)),
        //                     inputTriangles[selectIndex].mMatrix); // rotate 90 degs
        //     mat4.multiply(inputTriangles[selectIndex].mMatrix,
        //                     mat4.fromTranslation(mat4.create(),inputTriangles[selectIndex].triCenter),
        //                     inputTriangles[selectIndex].mMatrix);
        
        // }



            mat4.multiply(inputTriangles[selectIndex].mMatrix,
                          mat4.fromRotation(mat4.create(),glMatrix.toRadian(xRotate),vec3.fromValues(1,0,0)),
                          inputTriangles[selectIndex].mMatrix); // rotate 90 degs


            // mat4.rotateX(inputTriangles[selectIndex].mMatrix, inputTriangles[selectIndex].mMatrix, xRotate);




            mat4.multiply(inputTriangles[selectIndex].mMatrix,
                          mat4.fromRotation(mat4.create(),glMatrix.toRadian(yRotate),vec3.fromValues(0,1,0)),
                          inputTriangles[selectIndex].mMatrix); // rotate 90 degs

            // mat4.multiply(inputTriangles[selectIndex].mMatrix,
            // mat4.fromScaling(mat4.create(),vec3.fromValues(1.2,1.2,1.2)),
            // inputTriangles[selectIndex].mMatrix); // move back to center


            // mat4.multiply(inputTriangles[selectIndex].mMatrix,
            //               mat4.fromTranslation(mat4.create(),setCenter),
            //               inputTriangles[selectIndex].mMatrix); // move back to center


            // mat4.fromTranslation(inputTriangles[selectIndex].mMatrix,vec3.negate(vec3.create(),inputTriangles[selectIndex].triCenter)); // translate to origin
            // mat4.rotateY(inputTriangles[selectIndex].mMatrix, inputTriangles[selectIndex].mMatrix, yRotate);// yaw right
        //     mat4.multiply(inputTriangles[selectIndex].mMatrix,
        //         mat4.fromTranslation(mat4.create(),inputTriangles[selectIndex].triCenter),
        //         inputTriangles[selectIndex].mMatrix);



            mat4.multiply(inputTriangles[selectIndex].mMatrix,
                          mat4.fromRotation(mat4.create(),glMatrix.toRadian(zRotate),vec3.fromValues(0,0,1)),
                          inputTriangles[selectIndex].mMatrix); // rotate 90 degs




        

        mat4.multiply(inputTriangles[selectIndex].mMatrix,
            mat4.fromScaling(mat4.create(),vec3.fromValues(1.2,1.2,1.2)),
            inputTriangles[selectIndex].mMatrix); // move back to center


            mat4.multiply(inputTriangles[selectIndex].mMatrix,
                          mat4.fromTranslation(mat4.create(),setCenter),
                          inputTriangles[selectIndex].mMatrix); // move back to center

    }else{
        xTranslate = 0;
        yTranslate = 0;
        zTranslate = 0;

        xRotate = 0;
        yRotate = 0;
        zRotate = 0;
        }

    // mat4.fromTranslation(inputTriangles[0].mMatrix,vec3.negate(vec3.create(),inputTriangles[0].triCenter));


    // var setCenter = vec3.fromValues(inputTriangles[0].triCenter[0][0], inputTriangles[0].triCenter[0][1], inputTriangles[0].triCenter[0][2]);  // center coords of tri set 
    // mat4.fromTranslation(inputTriangles[0].mMatrix,vec3.negate(vec3.create(),setCenter)); // translate to origin
    // mat4.multiply(inputTriangles[0].mMatrix,
    //               mat4.fromRotation(mat4.create(),glMatrix.toRadian(60),vec3.fromValues(0,1,0)),
    //               inputTriangles[0].mMatrix); // rotate 90 degs
    // mat4.multiply(inputTriangles[0].mMatrix,
    //               mat4.fromTranslation(mat4.create(),setCenter),
    //               inputTriangles[0].mMatrix); // move back to center


    mat4.lookAt(viewMatrix, Eye, center, view_up);
    mat4.perspective(projMatrix, Math.PI / 2, canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    


    for (var whichTriSet=0; whichTriSet<inputTriangles.length; whichTriSet++) { 
        


    
        
        // pass modeling matrix for set to shadeer
        gl.uniformMatrix4fv(matWorldUniformLocation, false, inputTriangles[whichTriSet].mMatrix);


    
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib,3, gl.FLOAT,false,6 * Float32Array.BYTES_PER_ELEMENT,0); // feed
        gl.uniform1i(altPositionUniform, altPosition); // feed
        gl.vertexAttribPointer(colorPositionAttrib, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
        // console.log(vertest);
        // console.log(triSetSizes[whichTriSet]);
        // console.log(vertexBuffers[whichTriSet]);

    } // end for each tri set

} // end render triangles


/* MAIN -- HERE is where execution begins after window load */

function main() {

  setupWebGL(); // set up the webGL environment
  loadTriangles(); // load in the triangles from tri file
  setupShaders(); // setup the webGL shaders



  for (var whichTriSet=0; whichTriSet<inputTriangles.length; whichTriSet++) {
    inputTriangles[whichTriSet].mMatrix = mat4.create();
    console.log(inputTriangles[whichTriSet].triCenter);
}   

  renderTriangles(); // draw the triangles using webGL

//   window.addEventListener("keydown", function(event){
//     if(event.key == "a") {
//         this.alert("yes");
//         center[0] -= .1
//         Eye[0] -= 0.1
//     }
// });


} // end main