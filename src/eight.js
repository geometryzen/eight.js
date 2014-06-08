define(function(require) {
  var eight = require('eight/core');
  eight.feature = require('eight/feature');
  eight.module = require('eight/renderers/module');
  eight.coffeescript = require('cs!eight/coffeescript');
  eight.Camera = require('eight/cameras/Camera');
  eight.WebGLRenderer = require('eight/renderers/WebGLRenderer');
  eight.Scene = require('eight/scenes/Scene');
  eight.Mesh = require('eight/objects/Mesh');
  return eight;
});
