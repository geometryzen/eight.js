define(function(require) {
  var eight = require('eight/core');
  eight.Camera = require('eight/cameras/Camera');
  eight.PerspectiveCamera = require('eight/cameras/PerspectiveCamera');
  eight.WebGLRenderer = require('eight/renderers/WebGLRenderer');
  eight.Scene = require('eight/scenes/Scene');
  eight.Prism = require('eight/objects/Prism');
  eight.WindowAnimationRunner = require('eight/utils/WindowAnimationRunner');
  eight.WebGLContextMonitor = require('eight/utils/WebGLContextMonitor');
  eight.Euclidean3 = require('eight/math/e3ga/Euclidean3');
  eight.scalarE3   = require('eight/math/e3ga/scalarE3');
  eight.vectorE3   = require('eight/math/e3ga/vectorE3');
  eight.Conformal3 = require('eight/math/c3ga/Conformal3');
  eight.scalarC3   = require('eight/math/c3ga/scalarC3');
  eight.vectorC3   = require('eight/math/c3ga/vectorC3');
  return eight;
});
