define(function() {
  var source = [
    "attribute vec3 aVertexPosition;",
    "attribute vec3 aVertexColor;",
    "attribute vec3 aVertexNormal;",

    "uniform mat4 uMVMatrix;",
    "uniform mat3 uNormalMatrix;",
    "uniform mat4 uPMatrix;",

    "varying highp vec4 vColor;",
    "varying highp vec3 vLight;",
    "void main(void)",
    "{",
      "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
      "vColor = vec4(aVertexColor, 1.0);",
      "",
      "vec3 ambientLight = vec3(0.1, 0.1, 0.1);",
      "vLight = ambientLight;",
    "}"
  ].join('\n');
  return source;
});