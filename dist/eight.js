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
define('eight/math/c3ga/Conformal3',[],function() {

  var Conformal3 = function(w, x, y, z)
  {
    this.w = w || 0;
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  };

  return Conformal3;

});
define('eight/core/object3D',['eight/math/c3ga/Conformal3'], function(Conformal3)
{
  var constructor = function(spec, my)
  {
    var that;

    // Other private instance variables.

    my = my || {};

    // Add shared variables and functions to my.

    that =
    {
      transform: new Conformal3(),
      onContextGain: function(gl)
      {
        console.error("Missing onContextGain function");
      },
      onContextLoss: function()
      {
        console.error("Missing onContextLoss function");
      },
      tearDown: function()
      {
        console.error("Missing tearDown function");
      },
      move: function()
      {
        console.error("Missing tearDown function");
      },
      draw: function(projectionMatrix)
      {
        console.error("Missing tearDown function");
      }
    };

    // Add privileged methods to that.

    return that;
  };

  return constructor;
});
define('eight/core/geometry',['eight/math/c3ga/Conformal3'], function(Conformal3)
{
  var constructor = function(spec, my)
  {
    var that;

    // Other private instance variables.

    my = my || {};

    // Add shared variables and functions to my.

    that =
    {
      vertices: [],
      vertexIndices: [],
      colors: [],
      primitiveMode: function(gl)
      {
        return gl.TRIANGLES;
      }
    };

    // Add privileged methods to that.

    return that;
  };

  return constructor;
});
define('eight/core/material',[],function()
{
  var constructor = function(spec, my)
  {
    var api;

    my = my || {};

    api =
    {
    };

    return api;
  };

  return constructor;
});
define('eight/cameras/camera',['eight/core/object3D'], function(object3D)
{
  var constructor = function(spec, my)
  {
    var that;

    // Other private instance variables.

    my = my || {};

    // Add shared variables and functions to my.

    that = object3D(spec, my);

    that.projectionMatrix = mat4.create();

    // Add privileged methods to that.

    return that;
  };

  return constructor;
});
define('eight/cameras/perspectiveCamera',['eight/cameras/camera'], function(camera)
{
  var constructor = function(fov, aspect, near, far)
  {
    var api = camera({});

    api.fov = fov !== undefined ? fov : 50;
    api.aspect = aspect !== undefined ? aspect : 1;
    api.near = near !== undefined ? near : 0.1;
    api.far = far !== undefined ? far : 2000;

    mat4.perspective(api.projectionMatrix, api.fov, api.aspect, api.near, api.far);

    return api;
  };

  return constructor;
});
define('eight/renderers/webGLRenderer',[],function()
{
  var constructor = function()
  {
    var gl;

    var that =
    {
      onContextGain: function(context)
      {
        gl = context;
        gl.clearColor(32/256, 32/256, 32/256, 1.0);
        gl.enable(gl.DEPTH_TEST);
      },
      onContextLoss: function()
      {
      },
      clearColor: function(r, g, b, a)
      {
        gl.clearColor(r, g, b, a);
      },
      render: function(scene, camera)
      {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var children = scene.children;
        for(var i = 0, length = children.length; i < length; i++)
        {
          children[i].move();
          children[i].draw(camera.projectionMatrix);
        }
      },
      viewport: function(x, y, width, height)
      {
        gl.viewport(x, y, width, height);
      }
    };

    return that;
  };

  return constructor;
});
define('eight/scenes/scene',['eight/core/object3D'], function(object3D)
{
  var constructor = function(spec, my)
  {
    var that;

    // Other private instance variables.
    var children = [];

    my = my || {};

    // Add shared variables and functions to my.

    that = object3D(spec, my);

    that.children = children;
    that.onContextGain = function(gl)
    {
      for(var i = 0, length = children.length; i < length; i++)
      {
        children[i].onContextGain(gl);
      }
    };
    that.onContextLoss = function()
    {
      for(var i = 0, length = children.length; i < length; i++)
      {
        children[i].onContextLoss();
      }
    };
    that.tearDown = function()
    {
      for(var i = 0, length = children.length; i < length; i++)
      {
        children[i].tearDown();
      }
    };
    that.add = function(child)
    {
      children.push(child);
    };

    // Add privileged methods to that.

    return that;
  };

  return constructor;
});
define('eight/materials/meshBasicMaterial',['eight/core/material'], function(material)
{
  var constructor = function(spec, my)
  {
    var api = material(spec, my);

    my = my || {};

    return api;
  };

  return constructor;
});
define('eight/shaders/shader-vs',[],function() {
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
define('eight/shaders/shader-fs',[],function() {
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
define(
'eight/objects/mesh',[
'eight/core/object3D',
'eight/core/geometry',
'eight/materials/meshBasicMaterial',
'eight/shaders/shader-vs',
'eight/shaders/shader-fs'
],
function(object3D, geometryConstructor, meshBasicMaterial, vs_source, fs_source)
{
  var constructor = function(geometry, material)
  {
    var that;

    var gl = null;
    var vs = null;
    var fs = null;
    var program = null;
    var vbo = null;
    var vbi = null;
    var vbc = null;
    var mvMatrixUniform = null;
    var normalMatrixUniform = null;
    var pMatrixUniform = null;
    var mvMatrix = mat4.create();
    var normalMatrix = mat3.create();
    var angle = 0;
    geometry = geometry || geometryConstructor();
    material = material || meshBasicMaterial({'color': Math.random() * 0xffffff});

    // Add shared variables and functions to my.

    that = object3D({});

    that.projectionMatrix = mat4.create();

    that.onContextGain = function(context)
    {
      gl = context;

      vs = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vs, vs_source);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS) && !gl.isContextLost())
      {
        var infoLog = gl.getShaderInfoLog(vs);
        alert("Error compiling vertex shader:\n" + infoLog);
      }

      fs = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fs, fs_source);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS) && !gl.isContextLost())
      {
        var infoLog = gl.getShaderInfoLog(fs);
        alert("Error compiling fragment shader:\n" + infoLog);
      }

      program = gl.createProgram();
      
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost())
      {
        var infoLog = gl.getProgramInfoLog(program);
        alert("Error linking program:\n" + infoLog);
      }

      vbc = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbc);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.colors), gl.STATIC_DRAW);

      vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), gl.STATIC_DRAW);

      vbi = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbi);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.vertexIndices), gl.STATIC_DRAW);

      mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
      normalMatrixUniform = gl.getUniformLocation(program, "uNormalMatrix");
      pMatrixUniform  = gl.getUniformLocation(program, "uPMatrix");
    };

    that.onContextLoss = function()
    {
      vs = null;
      fs = null;
      program = null;
      vbc = null;
      vbo = null;
      vbi = null;
      mvMatrixUniform = null;
      pMatrixUniform = null;
    };

    that.tearDown = function()
    {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(program);
    };

    that.move = function()
    {
      mat4.identity(mvMatrix);
      mat4.translate(mvMatrix, mvMatrix, [-1.0, -1.0, -7.0]);
      mat4.rotate(mvMatrix, mvMatrix, angle, [0.0, 1.0, 0.0]);
      angle += 0.01;

      mat3.normalFromMat4(normalMatrix, mvMatrix);
    };

    that.draw = function(projectionMatrix)
    {
      gl.useProgram(program);

      gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
      gl.uniformMatrix3fv(normalMatrixUniform, false, normalMatrix);
      gl.uniformMatrix4fv(pMatrixUniform, false, projectionMatrix);

      var vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
      gl.enableVertexAttribArray(vertexPositionAttribute);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

      var vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
      gl.enableVertexAttribArray(vertexColorAttribute);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbc);
      gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbi);
      var mode = geometry.primitiveMode(gl);
      gl.drawElements(mode, geometry.vertexIndices.length, gl.UNSIGNED_SHORT, 0);
    };

    return that;
  };

  return constructor;
});
define('eight/utils/windowAnimationRunner',[],function()
{
  var constructor = function(tick, terminate, setUp, tearDown, win)
  {
    win = win || window;
    var escKeyPressed = false;
    var pauseKeyPressed = false;
    var enterKeyPressed = false;
    var startTime = null;
    var elapsed = null;
    var MILLIS_PER_SECOND = 1000;
    var requestID = null;
    var exception = null;

    var animate = function(timestamp)
    {
      if (startTime)
      {
        elapsed = timestamp - startTime;
      }
      else
      {
        startTime = timestamp;
        elapsed = 0;
      }

      if (escKeyPressed || terminate(elapsed / MILLIS_PER_SECOND))
      {
        escKeyPressed = false;

        win.cancelAnimationFrame(requestID);
        win.document.removeEventListener('keydown', onDocumentKeyDown, false);
        try
        {
          tearDown(exception);
        }
        catch(e)
        {
          console.log(e);
        }
      }
      else
      {
        requestID = win.requestAnimationFrame(animate);
        try
        {
          tick(elapsed / MILLIS_PER_SECOND);
        }
        catch(e)
        {
          exception = e;
          escKeyPressed = true;
        }
      }
    };

    var onDocumentKeyDown = function(event)
    {
      if (event.keyCode == 27)
      {
        escKeyPressed = true;
        event.preventDefault();
      }
      else if (event.keyCode == 19)
      {
        pauseKeyPressed = true;
        event.preventDefault();
      }
      else if (event.keyCode == 13)
      {
        enterKeyPressed = true;
        event.preventDefault();
      }
    };

    var api =
    {
      start: function()
      {
        setUp();
        win.document.addEventListener('keydown', onDocumentKeyDown, false);
        requestID = win.requestAnimationFrame(animate);
      },
      stop: function()
      {
        escKeyPressed = true;
      }
    };

    return api;
  };

  return constructor;
});
define('eight/utils/webGLContextMonitor',[],function()
{
  var constructor = function(canvas, contextLoss, contextGain)
  {
    var webGLContextLost = function(event)
    {
      event.preventDefault();
      contextLoss();
    };

    var webGLContextRestored = function(event)
    {
      event.preventDefault();
      var gl = canvas.getContext("webgl");
      contextGain(gl);
    };

    var api =
    {
      start: function()
      {
        canvas.addEventListener('webglcontextlost', webGLContextLost, false);
        canvas.addEventListener('webglcontextrestored', webGLContextRestored, false);
      },
      stop: function()
      {
        canvas.removeEventListener('webglcontextrestored', webGLContextRestored, false);
        canvas.removeEventListener('webglcontextlost', webGLContextLost, false);
      }
    };

    return api;
  };

  return constructor;
});
define('eight/math/e3ga/Euclidean3',[],function() {

  var Euclidean3 = function(w, x, y, z, xy, yz, zx, xyz)
  {
    this.w   = w;
    this.x   = x;
    this.y   = y;
    this.z   = z;
    this.xy  = xy;
    this.yz  = yz;
    this.zx  = zx;
    this.xyz = xyz;
  };

  return Euclidean3;

});
define('eight/math/e3ga/scalarE3',['eight/math/e3ga/Euclidean3'], function(Euclidean3)
{
  return function(w)
  {
    return new Euclidean3(w, 0, 0, 0, 0, 0, 0, 0);
  };
});
define('eight/math/e3ga/vectorE3',['eight/math/e3ga/Euclidean3'], function(Euclidean3)
{
  return function(x, y, z)
  {
    return new Euclidean3(0, x, y, z, 0, 0, 0, 0);
  };
});
define('eight/math/c3ga/scalarC3',['eight/math/c3ga/Conformal3'], function(Conformal3)
{
  return function(w)
  {
    return new Conformal3(w);
  };
});
define('eight/math/c3ga/vectorC3',['eight/math/c3ga/Conformal3'], function(Conformal3)
{
  return function(x, y, z, o, i)
  {
    return new Conformal3(0, x, y, z, o, i);
  };
});
define('eight/geometries/prismGeometry',['eight/core/geometry'], function(geometry)
{
  // The numbering of the front face, seen from the front is
  //   5
  //  3 4
  // 0 1 2 
  // The numbering of the back face, seen from the front is
  //   B
  //  9 A
  // 6 7 8 
  // There are 12 vertices in total.
  var vertices =
  [
    // front face
    0.0, 0.0, 0.0,  // 0
    1.0, 0.0, 0.0,  // 1
    2.0, 0.0, 0.0,  // 2
    0.5, 1.0, 0.0,  // 3
    1.5, 1.0, 0.0,  // 4
    1.0, 2.0, 0.0,  // 5

    // rear face
    0.0, 0.0, -2.0, // 6
    1.0, 0.0, -2.0, // 7
    2.0, 0.0, -2.0, // 8
    0.5, 1.0, -2.0, // 9
    1.5, 1.0, -2.0, // A=10
    1.0, 2.0, -2.0, // B=11
  ];

  // I'm not sure why the left and right side have 4 faces, but the botton only 2.
  // Symmetry would suggest making them the same.
  // There are 18 faces in total.
  var triangles =
  [
    //front face
    0,1,3,
    1,3,4,  // clockwise
    1,2,4,
    3,4,5,
    
    //rear face
    6,7,9,  // clockwise
    7,9,10,
    7,8,10, // clockwise
    9,10,11, // clockwise
    
    //left side
    0,3,6,
    3,6,9,  // clockwise
    3,5,9,
    5,9,11, // clockwise
    
    //right side
    2,4,8, // clockwise
    4,8,10,
    4,5,10, // clockwise
    5,10,11,
    //bottom faces
    0,6,8,
    8,2,0
  ];

  var colors =
  [
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

  var constructor = function(spec, my)
  {
    my = my || {};

    var api = geometry(spec, my);

    api.vertices = vertices;
    api.vertexIndices = triangles;
    api.colors = colors;

    return api;
  };

  return constructor;
});
define('eight/materials/meshNormalMaterial',['eight/core/material'], function(material)
{
  var constructor = function(spec, my)
  {
    var api = material(spec, my);

    my = my || {};

    return api;
  };

  return constructor;
});
define('eight',['require','eight/core','eight/core/object3D','eight/core/geometry','eight/core/material','eight/cameras/camera','eight/cameras/perspectiveCamera','eight/renderers/webGLRenderer','eight/scenes/scene','eight/objects/mesh','eight/utils/windowAnimationRunner','eight/utils/webGLContextMonitor','eight/math/e3ga/Euclidean3','eight/math/e3ga/scalarE3','eight/math/e3ga/vectorE3','eight/math/c3ga/Conformal3','eight/math/c3ga/scalarC3','eight/math/c3ga/vectorC3','eight/geometries/prismGeometry','eight/materials/meshBasicMaterial','eight/materials/meshNormalMaterial'],function(require) {
  var eight = require('eight/core');
  eight.object3D = require('eight/core/object3D');
  eight.geometry = require('eight/core/geometry');
  eight.material = require('eight/core/material');
  eight.camera = require('eight/cameras/camera');
  eight.perspectiveCamera = require('eight/cameras/perspectiveCamera');
  eight.webGLRenderer = require('eight/renderers/webGLRenderer');
  eight.scene = require('eight/scenes/scene');
  eight.mesh  = require('eight/objects/mesh');
  eight.windowAnimationRunner = require('eight/utils/windowAnimationRunner');
  eight.webGLContextMonitor = require('eight/utils/webGLContextMonitor');
  eight.Euclidean3 = require('eight/math/e3ga/Euclidean3');
  eight.scalarE3   = require('eight/math/e3ga/scalarE3');
  eight.vectorE3   = require('eight/math/e3ga/vectorE3');
  eight.Conformal3 = require('eight/math/c3ga/Conformal3');
  eight.scalarC3   = require('eight/math/c3ga/scalarC3');
  eight.vectorC3   = require('eight/math/c3ga/vectorC3');
  eight.prismGeometry = require('eight/geometries/prismGeometry');
  eight.meshBasicMaterial = require('eight/materials/meshBasicMaterial');
  eight.meshNormalMaterial = require('eight/materials/meshNormalMaterial');
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
