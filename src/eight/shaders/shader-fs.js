define(function() {
  var source = [
    "varying highp vec4 vColor;",
    "varying highp vec3 vLight;",
    "void main(void)",
    "{",
      "gl_FragColor = vec4(vColor.xyz * vLight, vColor.a);",
      "gl_FragColor = vColor;",
    "}"
  ].join('\n');
  return source;
});