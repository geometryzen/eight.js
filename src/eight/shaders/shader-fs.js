define(function() {
  var source = [
    "varying highp vec4 vColor;",
    "void main(void)",
    "{",
    "  gl_FragColor = vColor;",
    "}"
  ].join('\n');
  return source;
});