(function(global, define) {
  var globalDefine = global.define;
/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../vendor/almond/almond", function(){});

define('eight/core',[],function() {
  var eight = {
    VERSION: '0.0.1'
  };

  return eight;
});
define('eight/feature',[],function() {
  return function() { return 'working'; };
});
define('eight/renderers/module',[],function() {
  return {
    method: function() { return 'it does'; }
  };
});
define('coffee-script',{});
define('cs',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});

(function() {
  define('cs!eight/coffeescript',[],function() {
    return function() {
      return "working";
    };
  });

}).call(this);

define('eight/cameras/Camera',[],function() {

  var Camera = function() {

    this.projectionMatrix = mat4.create();

  };

  return Camera;

});
define('eight/cameras/PerspectiveCamera',['eight/cameras/Camera'], function(Camera) {

  var PerspectiveCamera = function(fov, aspect, near, far) {

    Camera.call(this);

    this.fov = fov !== undefined ? fov : 50;
    this.aspect = aspect !== undefined ? aspect : 1;
    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 2000;

    mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.near, this.far);

//  this.updateProjectionMatrix();

  };

  PerspectiveCamera.prototype = Object.create(Camera.prototype);

  return PerspectiveCamera;

});
define('eight/renderers/WebGLRenderer',[],function() {

  var WebGLRenderer = function()
  {
  };

  WebGLRenderer.prototype.onContextGain = function(gl)
  {
    this.gl = gl;
    gl.clearColor(32/256, 32/256, 32/256, 1.0);
    gl.enable(gl.DEPTH_TEST);
  };

  WebGLRenderer.prototype.onContextLoss = function()
  {
    delete this.gl;
  };

  WebGLRenderer.prototype.clearColor = function(r, g, b, a)
  {
    var gl = this.gl;
    gl.clearColor(r, g, b, a);
  };

  WebGLRenderer.prototype.render = function(scene, camera)
  {
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var children = scene.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].move();
      children[i].draw(gl, camera.projectionMatrix);
    }
  };

  WebGLRenderer.prototype.viewport = function(x, y, width, height)
  {
    var gl = this.gl;
    gl.viewport(x, y, width, height);
  };

  return WebGLRenderer;

});
define('eight/scenes/Scene',[],function() {

  var Scene = function() {
    this.children = [];
  };

  Scene.prototype.add = function(mesh) {
    this.children.push(mesh);
  }

  Scene.prototype.onContextGain = function(gl) {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].onContextGain(gl);
    }
  }

  Scene.prototype.onContextLoss = function() {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].onContextLoss();
    }
  }

  Scene.prototype.tearDown = function() {
    var children = this.children;
    for(var i = 0, length = children.length; i < length; i++) {
      children[i].tearDown();
    }
  }

  return Scene;

});
define('eight/shaders/shader-vs',[],function() {
  var source = [
    "attribute vec3 aVertexPosition;",
    "attribute vec3 aVertexColor;",

    "uniform mat4 uMVMatrix;",
    "uniform mat4 uPMatrix;",

    "varying highp vec4 vColor;",
    "void main(void)",
    "{",
      "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);",
      "vColor = vec4(aVertexColor, 1.0);",
    "}"
  ].join('\n');
  return source;
});
define('eight/shaders/shader-fs',[],function() {
  var source = [
    "varying highp vec4 vColor;",
    "void main(void)",
    "{",
    "  gl_FragColor = vColor;",
    "}"
  ].join('\n');
  return source;
});
define('eight/objects/Prism',['eight/shaders/shader-vs', 'eight/shaders/shader-fs'], function(vs_source, fs_source) {

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

  function makeShader(gl, src, type)
  {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost())
    {
      var infoLog = gl.getShaderInfoLog(shader);
      alert("Error compiling shader:\n" + infoLog);
    }
    return shader;
  }

  var Prism = function()
  {
    this.mvMatrix = mat4.create();
  }

  Prism.prototype.onContextGain = function(gl)
  {
    this.gl = gl;
    this.vs = makeShader(gl, vs_source, gl.VERTEX_SHADER);
    this.fs = makeShader(gl, fs_source, gl.FRAGMENT_SHADER);
    
    this.program = gl.createProgram();
    
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS) && !gl.isContextLost())
    {
      var infoLog = gl.getProgramInfoLog(this.program);
      alert("Error linking program:\n" + infoLog);
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

    this.mvMatrixUniform = gl.getUniformLocation(this.program, "uMVMatrix");
    this.pMatrixUniform  = gl.getUniformLocation(this.program, "uPMatrix");
  }

  Prism.prototype.onContextLoss = function()
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

  Prism.prototype.tearDown = function() {
    var gl = this.gl;
    gl.deleteShader(this.vs);
    delete this.vs;
    gl.deleteShader(this.fs);
    delete this.fs;
    gl.deleteProgram(this.program);
    delete this.program;
  };

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
define('eight/utils/WindowAnimationRunner',[],function()
{

  var WindowAnimationRunner = function(tick, terminate, setUp, tearDown, win)
  {
    this.tick = tick;
    this.terminate = terminate;
    this.setUp = setUp;
    this.tearDown = tearDown;
    this.window = win;
    this.escKeyPressed = false;
  };

  WindowAnimationRunner.prototype.start = function()
  {
    var MILLIS_PER_SECOND = 1000;
    var self = this;

    var onDocumentKeyDown = function(event)
    {
      if (event.keyCode == 27)
      {
        self.escKeyPressed = true;
        event.preventDefault();
      }
      else if (event.keyCode == 19)
      {
        self.pauseKeyPressed = true;
        event.preventDefault();
      }
      else if (event.keyCode == 13)
      {
        self.enterKeyPressed = true;
        event.preventDefault();
      }
    };

    var animate = function(timestamp)
    {
      if (self.startTime)
      {
        self.elapsed = timestamp - self.startTime;
      }
      else
      {
        self.startTime = timestamp;
        self.elapsed = 0;
      }
      var terminate = self.terminate;
      if (self.escKeyPressed || terminate(self.elapsed / MILLIS_PER_SECOND))
      {
        delete self.escKeyPressed;
        self.window.cancelAnimationFrame(self.requestID);
        self.window.document.removeEventListener('keydown', onDocumentKeyDown, false);
        try
        {
          self.tearDown(self.exception);
        }
        catch(e)
        {
          console.log(e);
        }
      }
      else
      {
        self.requestID = self.window.requestAnimationFrame(animate);
        try
        {
          self.tick(self.elapsed / MILLIS_PER_SECOND);
        }
        catch(e)
        {
          self.exception = e;
          self.escKeyPressed = true;
        }
      }
    };
    self.setUp();
    self.window.document.addEventListener('keydown', onDocumentKeyDown, false);
    self.requestID = self.window.requestAnimationFrame(animate);
  }

  WindowAnimationRunner.prototype.stop = function()
  {
    this.escKeyPressed = true;
  }

  return WindowAnimationRunner;

});
define('eight/utils/WebGLContextMonitor',[],function() {

  var WebGLContextMonitor = function(canvas, contextLoss, contextGain)
  {
    this.canvas = canvas;
    var self = this;

    this.webGLContextLost = function(event)
    {
      event.preventDefault();
      contextLoss();
    };

    this.webGLContextRestored = function(event)
    {
      event.preventDefault();
      self.gl = self.canvas.getContext("webgl");
      contextGain(self.gl);
    };
  };

  WebGLContextMonitor.prototype.start = function()
  {
    this.canvas.addEventListener('webglcontextlost', this.webGLContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this.webGLContextRestored, false);
  };

  WebGLContextMonitor.prototype.stop = function()
  {
    this.canvas.removeEventListener('webglcontextrestored', this.webGLContextRestored, false);
    this.canvas.removeEventListener('webglcontextlost', this.webGLContextLost, false);
  };

  return WebGLContextMonitor;

});
define('eight',['require','eight/core','eight/feature','eight/renderers/module','cs!eight/coffeescript','eight/cameras/Camera','eight/cameras/PerspectiveCamera','eight/renderers/WebGLRenderer','eight/scenes/Scene','eight/objects/Prism','eight/utils/WindowAnimationRunner','eight/utils/WebGLContextMonitor'],function(require) {
  var eight = require('eight/core');
  eight.feature = require('eight/feature');
  eight.module = require('eight/renderers/module');
  eight.coffeescript = require('cs!eight/coffeescript');
  eight.Camera = require('eight/cameras/Camera');
  eight.PerspectiveCamera = require('eight/cameras/PerspectiveCamera');
  eight.WebGLRenderer = require('eight/renderers/WebGLRenderer');
  eight.Scene = require('eight/scenes/Scene');
  eight.Prism = require('eight/objects/Prism');
  eight.WindowAnimationRunner = require('eight/utils/WindowAnimationRunner');
  eight.WebGLContextMonitor = require('eight/utils/WebGLContextMonitor');
  return eight;
});

  var library = require('eight');
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = library;
  } else if(globalDefine) {
    (function (define) {
      define(function () { return library; });
    }(globalDefine));
  } else {
    global['EIGHT'] = library;
  }
}(this));
