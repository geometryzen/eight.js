define(function(require) {
  var eight = require('eight/core');
  eight.feature = require('eight/feature');
  eight.module = require('eight/renderers/module');
  eight.coffeescript = require('cs!eight/coffeescript');
  eight.Camera = require('eight/cameras/Camera');
  eight.PerspectiveCamera = require('eight/cameras/PerspectiveCamera');
  eight.WebGLRenderer = require('eight/renderers/WebGLRenderer');
  eight.Scene = require('eight/scenes/Scene');
  eight.Prism = require('eight/objects/Prism');
//eight.vs_source = require('eight/shaders/shader-vs');
  return eight;
});
