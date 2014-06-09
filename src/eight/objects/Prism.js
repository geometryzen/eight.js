define(['eight/shaders/shader-vs', 'eight/shaders/shader-fs'], function(vs_source, fs_source) {

  var triangleVerticeColors = [ 
    //front face  
     0.0, 0.0, 1.0,
     1.0, 1.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     0.0, 0.0, 1.0,
     1.0, 1.0, 1.0,
  
    //rear face
     0.0, 1.0, 1.0,
     1.0, 1.0, 1.0,
     0.0, 1.0, 1.0,
     0.0, 1.0, 1.0,
     0.0, 1.0, 1.0,
     1.0, 1.0, 1.0
  ];

  //12 vertices
  var triangleVertices =
  [
    //front face
    //bottom left to right,  to top
    0.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    2.0, 0.0, 0.0,
    0.5, 1.0, 0.0,
    1.5, 1.0, 0.0,
    1.0, 2.0, 0.0,

    //rear face
    0.0, 0.0, -2.0,
    1.0, 0.0, -2.0,
    2.0, 0.0, -2.0,
    0.5, 1.0, -2.0,
    1.5, 1.0, -2.0,
    1.0, 2.0, -2.0,
  ];

  var triangleVertexIndices =
  [
    //front face
    0,1,3,
    1,3,4,
    1,2,4,
    3,4,5,
    
    //rear face
    6,7,9,
    7,9,10,
    7,8,10,
    9,10,11,
    
    //left side
    0,3,6,
    3,6,9,
    3,5,9,
    5,9,11,
    
    //right side
    2,4,8,
    4,8,10,
    4,5,10,
    5,10,11,
    //bottom faces
    0,6,8,
    8,2,0
  ];

  var angle = 0.01;

  function makeShader(gl, src, type) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  var Prism = function(gl) {

    var vs = makeShader(gl, vs_source, gl.VERTEX_SHADER);
    var fs = makeShader(gl, fs_source, gl.FRAGMENT_SHADER);
    
    this.program = gl.createProgram();
    
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      alert("Error linking program: " + gl.getProgramInfoLog(this.program));
    }

    this.vbc = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbc);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticeColors), gl.STATIC_DRAW);

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    this.vbi = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbi);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleVertexIndices), gl.STATIC_DRAW);

    this.mvMatrix = mat4.create();

    this.mvMatrixUniform = gl.getUniformLocation(this.program, "uMVMatrix");
    this.pMatrixUniform  = gl.getUniformLocation(this.program, "uPMatrix");
  }

  Prism.prototype.move = function() {

    mat4.identity(this.mvMatrix);
    mat4.translate(this.mvMatrix, this.mvMatrix, [-1.0, -1.0, -7.0]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, angle, [0.0, 1.0, 0.0]);
    angle += 0.01;

  };

  Prism.prototype.draw = function(gl, projectionMatrix) {

    gl.useProgram(this.program);

    gl.uniformMatrix4fv(this.mvMatrixUniform, false, this.mvMatrix);
    gl.uniformMatrix4fv(this.pMatrixUniform, false, projectionMatrix);

    var vertexPositionAttribute = gl.getAttribLocation(this.program, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    var vertexColorAttribute = gl.getAttribLocation(this.program, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbc);
    gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbi);
    gl.drawElements(gl.TRIANGLES, triangleVertexIndices.length, gl.UNSIGNED_SHORT, 0);

  };

  return Prism;

});