define(
[
'eight/core/Object3D',
'eight/core/Geometry',
'eight/shaders/shader-vs',
'eight/shaders/shader-fs'
],
function(Object3D, Geometry, vs_source, fs_source)
{
  var angle = 0;

  var Mesh = function(geometry, material)
  {
    Object3D.call(this);
    this.mvMatrix = mat4.create();
    this.geometry = geometry !== undefined ? geometry : new Geometry();
  };

  Mesh.prototype = new Object3D();

  Mesh.prototype.onContextGain = function(gl)
  {
    this.gl = gl;

    this.vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(this.vs, vs_source);
    gl.compileShader(this.vs);
    if (!gl.getShaderParameter(this.vs, gl.COMPILE_STATUS) && !gl.isContextLost())
    {
      var infoLog = gl.getShaderInfoLog(this.vs);
      alert("Error compiling vertex shader:\n" + infoLog);
    }

    this.fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.fs, fs_source);
    gl.compileShader(this.fs);
    if (!gl.getShaderParameter(this.fs, gl.COMPILE_STATUS) && !gl.isContextLost())
    {
      var infoLog = gl.getShaderInfoLog(this.fs);
      alert("Error compiling fragment shader:\n" + infoLog);
    }

    this.program = gl.createProgram();
    
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS) && !gl.isContextLost())
    {
      var infoLog = gl.getProgramInfoLog(this.program);
      alert("Error linking program:\n" + infoLog);
    }

    var geometry = this.geometry;
    this.vbc = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbc);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.colors), gl.STATIC_DRAW);

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);

    this.vbi = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbi);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.vertexIndices), gl.STATIC_DRAW);

    this.mvMatrixUniform = gl.getUniformLocation(this.program, "uMVMatrix");
    this.pMatrixUniform  = gl.getUniformLocation(this.program, "uPMatrix");
  }

  Mesh.prototype.onContextLoss = function()
  {
    delete this.vs;
    delete this.fs;
    delete this.program;
    delete this.vbc;
    delete this.vbo;
    delete this.vbi;
    delete this.mvMatrixUniform;
    delete this.pMatrixUniform;
  }

  Mesh.prototype.tearDown = function()
  {
    var gl = this.gl;
    gl.deleteShader(this.vs);
    delete this.vs;
    gl.deleteShader(this.fs);
    delete this.fs;
    gl.deleteProgram(this.program);
    delete this.program;
  };

  Mesh.prototype.move = function()
  {
    mat4.identity(this.mvMatrix);
    mat4.translate(this.mvMatrix, this.mvMatrix, [-1.0, -1.0, -7.0]);
    mat4.rotate(this.mvMatrix, this.mvMatrix, angle, [0.0, 1.0, 0.0]);
    angle += 0.01;
  };

  Mesh.prototype.draw = function(gl, projectionMatrix)
  {
//    var program = this.program;
//    var geometry = this.geometry;

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
    var mode = this.geometry.primitives(gl);
    gl.drawElements(mode, this.geometry.vertexIndices.length, gl.UNSIGNED_SHORT, 0);
  };

  return Mesh;
});