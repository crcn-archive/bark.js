(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/lib/bark.js",function(require,module,exports,__dirname,__filename,process,global){var NotificationBuilder = require("./notificationBuilder"),
structr = require("structr");

module.exports = structr({

	/**
	 */

	"override __construct": function () {
		this._super.apply(this, arguments);
		this._notificationBuilders = {};
	},

	/**
	 * creates a new bark notification
	 */

	"create": function (inheritFrom) {
		return new NotificationBuilder(typeof inheritFrom == "string" ? this.notification(inheritFrom) : inheritFrom);
	},

	/**
	 * returns an existing bark notification
	 */

	"notification": function (name) {
		return this._notificationBuilders[name];
	},

	/**
	 * registers a bark notification
	 */

	"register": function (name, inheritFrom) {

		if(!this._notificationBuilders[name]) {
			this._notificationBuilders[name] = this.create(inheritFrom);
			this._register(name);
		}

		return this._notificationBuilders[name];
	},

	/**
	 * attaches the notification to this object
	 */

	"_register": function (name) {

		var self = this;

		if(!!this[name]) throw new Error("Notification '" + name + "' already exists.");

		this[name] = function (options, onClose) {
			self.notification(name).display(options, onClose);
		}
	}
});
});

require.define("/lib/notificationBuilder.js",function(require,module,exports,__dirname,__filename,process,global){var structr = require("structr"),
TemplateView = require("./views/template"),
NotificationManager = require("./manager");


var NotificationBuilder = module.exports = structr({

	/**
	 * existing options form an inherited notification
	 */

	"__construct": function(inheritFrom) {
		this.options = structr.copy(inheritFrom ? inheritFrom.options : {});
		this._manager = new NotificationManager(this);

		if(!this.options.max) this.options.max = 1;
	},

	/**
	 */

	"reset": function(options) {
		this.options = options || {};
	},

	/**
	 * close the notification after this time
	 */

	"closeAfterTime": function(value) {
		this.options.closeAfterTime = value;
		return this;
	},

	/**
	 * position: left, right, top, bottom
	 */

	"position": function(options) {
		this.options.position = options;
		return this;
	},

	/**
	 * max number of notifications to show at one time
	 */

	"max": function(value) {
		this.options.maxNotifications = value;
		return this;
	},

	/**
	 * layout information for the notification: vertical, horizontal
	 */

	"layout": function(value) {
		this.options.layout = value;
		return this;
	},

	/**
	 * the backbone view class for the notification
	 */

	"viewClass": function(viewClass) {
		this.options.viewClass = viewClass;
	},

	/**
	 */

	"template": function(element) {
		this.options.template = element;
		return this.viewClass(TemplateView);
	},

	/**
	 * transition in styles
	 */

	"transitionIn": function(from, to, easing) {
		this.options.transitionIn = { from: from || {}, to: to || {}, easing: easing };
		return this;
	},

	/**
	 * transition out styles
	 */

	"transitionOut": function(from, to, easing) {
		this.options.transitionOut = { from: from || {}, to: to || {}, easing: easing };
		return this;
	},

	/**
	 */

	"display": function(options, onClose) {
		this._manager.display(options);//.once("close", onClose || function(){ });
	},

	/**
	 */

	"clone": function() {
		return new NotificationBuilder(this);
	}
});
});

require.define("/node_modules/structr/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"./lib/index.js"}
});

require.define("/node_modules/structr/lib/index.js",function(require,module,exports,__dirname,__filename,process,global){var Structr = function () {

	var that = Structr.extend.apply(null, arguments);

	if (!that.structurized) {

		that = Structr.ize(that);

	}

	for (var prop in that) {

		that.__construct.prototype[prop] = that[prop];

	}


	if (!that.__construct.extend) {

		//allow for easy extending.
		that.__construct.extend = function() {
			return Structr.apply(null, [that].concat(Array.apply([], arguments)))

		};
	}

	//return the constructor
	return that.__construct;
};

/**
 * performs a deep, or light copy
 */ 

Structr.copy = function (from, to, lite) {

	if (typeof to == 'boolean') {
		lite = to;
		to = undefined;
	}
	
	if (!to) to = from instanceof Array ? [] : {};  
	
	var i;

	for (i in from) {

		var fromValue = from[i],
		toValue = to[i],
		newValue;

		//don't copy anything fancy other than objects and arrays. this could really screw classes up, such as dates.... (yuck)
		if (!lite && typeof fromValue == 'object' && (!fromValue || fromValue.constructor.prototype == Object.prototype || fromValue instanceof Array)) {

			//if the toValue exists, and the fromValue is the same data type as the TO value, then
			//merge the FROM value with the TO value, instead of replacing it
			if (toValue && fromValue instanceof toValue.constructor) {

				newValue = toValue;

			//otherwise replace it, because FROM has priority over TO
			} else {

				newValue = fromValue instanceof Array ? [] : {};

			}

			Structr.copy(fromValue, newValue);

		} else {

			newValue = fromValue;

		}

		to[i] = newValue;
	}

	return to;
};


/**
 * returns a method owned by an object
 */

Structr.getMethod = function (that, property) {
	return function() {
		return that[property].apply(that, arguments);
	};
};

/**
 * wraps a method with a "this" object
 */     
 
Structr.wrap = function (that, prop) {

	if (that._wrapped) return that;

	that._wrapped = true;

	function wrap(target) {

		return function() {

			return target.apply(that, arguments);

		};

	}

	if (prop) {

		that[prop] = wrap(target[prop]);
		return that;

	}

	for (var property in that) {

		var target = that[property];
			
		if (typeof target == 'function') {

			that[property] = wrap(target);

		}

	}

	return that;

}  

/**
 * finds all properties with modifiers
 */

Structr.findProperties = function (target, modifier) {

	var props = [],
		property;

	for (property in target) {

		var v = target[property];

		if (v && v[modifier]) {

			props.push(property);

		}

	}

	return props;

};

/**
 * counts the number of arguments in a function
 */

Structr.nArgs = function (func) { 

	var inf = func.toString().replace(/\{[\W\S]+\}/g, '').match(/\w+(?=[,\)])/g);
	return inf ? inf.length :0;

}

/**
 * returns a function by the number of arguments
 */

Structr.getFuncsByNArgs = function (that, property) {

	return that.__private['overload::' + property] || (that.__private['overload::' + property] = {});

}

/**
 */

Structr.getOverloadedMethod = function (that, property, nArgs) {

	var funcsByNArgs = Structr.getFuncsByNArgs(that, property);
	return funcsByNArgs[nArgs];

}

/**
 */

Structr.setOverloadedMethod = function (that, property, func, nArgs) {

	var funcsByNArgs = Structr.getFuncsByNArgs(that, property);
	
	if(func.overloaded) return funcsByNArgs;
	
	funcsByNArgs[nArgs || Structr.nArgs(func)] = func;
	return funcsByNArgs;

}

/**
 * mixed in operators
 */

Structr._mixin = {
	operators: {}
};


Structr.mixin = function (options) {

	switch(options.type) {
		case "operator": 
			Structr._mixin.operators[options.name] = options.factory;
		break;
		default:
			throw new Error("Mixin type " + options.type + "does not exist");
		break;
	}
}


/** 
 * modifies how properties behave in a class. Underscore is prepended because SOME properties
 * are reserved in javascript.
 */

Structr.modifiers =  {

	/**
	* overrides given method
	*/

	_override: function (that, property, newMethod) {

		var oldMethod = (that.__private && that.__private[property]) || that[property] || function (){},
			parentMethod = oldMethod;
		
		if(oldMethod.overloaded) {

			var overloadedMethod = oldMethod,
			    nArgs            = Structr.nArgs(newMethod);

			parentMethod = Structr.getOverloadedMethod(that, property, nArgs);

		}
		
		//wrap the method so we can access the parent overloaded function
		var wrappedMethod = function () {

			this._super = parentMethod;
			var ret = newMethod.apply(this, arguments);
			delete this._super;
			return ret;

		}

		wrappedMethod.parent = newMethod;
		
		if(oldMethod.overloaded) {

			return Structr.modifiers._overload(that, property, wrappedMethod, nArgs);

		}
		
		return wrappedMethod;
	},


	/**
	* getter / setter which are physical functions: e.g: test.myName(), and test.myName('craig')
	*/

	_explicit: function (that, property, gs) {

		var pprop = '__'+property;

		//if GS is not defined, then set defaults.
		if (typeof gs != 'object') {

			gs = {};

		}

		if (!gs.get) {

			gs.get = function () {

				return this._value;

			}
		}

		if (!gs.set) {

			gs.set = function (value) {

				this._value = value;

			}

		}


		return function (value) {

			//getter
			if (!arguments.length) {

				this._value = this[pprop];
				var ret     = gs.get.apply(this);

				delete this._value;
				return ret;

			//setter
			} else {

				//don't call the gs if the value isn't the same
				if (this[pprop] == value) return;

				//set the current value to the setter value
				this._value = this[pprop];

				//set
				gs.set.apply(this, [value]);

				//set the new value. this only matters if the setter set it 
				this[pprop] = this._value;

			}

		};

	},

    /**
     * implicit getter
 	 */

	_implicit: function (that, property, egs) {

		//keep the original function available so we can override it
		that.__private[property] = egs;

		that.__defineGetter__(property, egs);
		that.__defineSetter__(property, egs);

	},
	
	/**
	 */
	
	_overload: function (that, property, value, nArgs) {  

		var funcsByNArgs = Structr.setOverloadedMethod(that, property, value, nArgs);
				
		var multiFunc = function() {   

			var func = funcsByNArgs[arguments.length];
			
			if(func) {

				return funcsByNArgs[arguments.length].apply(this, arguments);

			} else {

				var expected = [];
				
				for(var sizes in funcsByNArgs) {

					expected.push(sizes);

				}
				
				throw new Error('Expected '+expected.join(',')+' parameters, got '+arguments.length+'.');
			}

		}    
		
		multiFunc.overloaded = true;                                          
		
		return multiFunc; 
	},

	/**
	 */

	_abstract: function(that, property, value) {

		var ret = function() {
			throw new Error("\"" + property + "\" is abstract and must be overridden.")
		};

		ret.isAbstract = true;

		return ret;
	}
}       


//override [bindable(event=test,name=value)] 


Structr.parseProperty = function(property) {

	var parts = property.split(" ");

	var modifiers = [],
	name      = parts.pop(),
	metadata  = [];

	for(var i = 0, n = parts.length; i < n; i++) {
		var part = parts[i];

		if(part.substr(0, 1) == "[") {
			metadata.push(Structr.parseMetadata(part));
			continue;
		};

		modifiers.push(part);
	}

	return {
		name: name,
		modifiers: modifiers,
		metadata: metadata
	}
}

Structr.parseMetadata = function(metadata) {
	var parts = metadata.match(/\[(\w+)(\((.*?)\))?\]/),
	name = String(parts[1]).toLowerCase(),
	params = parts[2] || "()",
	paramParts = params.length > 2 ? params.substr(1, params.length - 2).split(",") : [];

	var values = {};
	for(var i = paramParts.length; i--;) {
		var paramPart = paramParts[i].split("=");
		values[paramPart[0]] = paramPart[1] || true;
	}

	return {
		name: name,
		params: values
	};
}


/**
 * extends from one class to another. note: the TO object should be the parent. a copy is returned.
 */

Structr.extend = function () {
	var from = {},
	mixins = Array.prototype.slice.call(arguments, 0),
	to = mixins.pop();

	if(mixins.length > 1) {
		for(var i = 0, n = mixins.length; i < n; i++) {
			var mixin = mixins[i];
			from = Structr.extend(from, typeof mixin == "function" ? mixin.prototype : mixin);
		}
	} else {
		from = mixins.pop() || from;
	}


	//class? fetch the prototype
	if(typeof from == 'function') {


		var fromConstructor = from;

		//copy the prototype to make sure we don't modify it.
		from = Structr.copy(from.prototype);

		//next we need to convert the class into something we can handle
		from.__construct = fromConstructor;

	}



	var that = {
		__private: {

			//contains modifiers for all properties of object
			propertyModifiers: { }
		}
	};


	Structr.copy(from, that);

	var usedProperties = {},
	property;


	for(property in to) {

		var value = to[property];

		var propModifiersAr = Structr.parseProperty(property), //property is at the end of the modifiers. e.g: override bindable testProperty
		propertyName = propModifiersAr.name,

		modifierList = that.__private.propertyModifiers[propertyName] || (that.__private.propertyModifiers[propertyName] = []);

		if (propModifiersAr.modifiers.length) {

			var propModifiers = {};

			for(var i = propModifiersAr.modifiers.length; i--;) {

				var modifier = propModifiersAr.modifiers[i];

				propModifiers["_" + propModifiersAr.modifiers[i]] = 1;

				if (modifierList.indexOf(modifier) == -1) {

					modifierList.push(modifier);

				}
			}      
			
			if(propModifiers._merge) {

				value = Structr.copy(from[propertyName], value);
			}         

			//if explicit, or implicit modifiers are set, then we need an explicit modifier first
			if (propModifiers._explicit || propModifiers._implicit) {

				value = Structr.modifiers._explicit(that, propertyName, value);

			}

			for(var name in Structr._mixin.operators) {
				if(propModifiers["_" + name]) {
					value = Structr._mixin.operators[name](that, propertyName, value);

				}
			}

			if (propModifiers._override) {

				value = Structr.modifiers._override(that, propertyName, value);

			}

			if (propModifiers._abstract) {

				value = Structr.modifiers._abstract(that, propertyName, value);

			}

			if (propModifiers._implicit) {

				//getter is set, don't continue.
				Structr.modifiers._implicit(that, propertyName, value);
				continue;

			}

		}

		for(var j = modifierList.length; j--;) {

			value[modifierList[j]] = true;

		}


		
		if(usedProperties[propertyName]) {

			var oldValue = that[propertyName];
			
			//first property will NOT be overloaded, so we need to check it here
			if(!oldValue.overloaded) Structr.modifiers._overload(that, propertyName, oldValue, undefined);
			 
			value = Structr.modifiers._overload(that, propertyName, value, undefined);
		}	
		
		usedProperties[propertyName] = 1;

		that.__private[propertyName] = that[propertyName] = value;
	}

	

	//if the parent constructor exists, and the child constructor IS the parent constructor, it means
	//the PARENT constructor was defined, and the  CHILD constructor wasn't, so the parent prop was copied over. We need to create a new function, and 
	//call the parent constructor when the child is instantiated, otherwise it'll be the same class essentially (setting proto)
	if (that.__construct && from.__construct && that.__construct == from.__construct) {
		// console.log(String(from.__construct));
		// console.log(String(that.__construct));
		that.__construct = Structr.modifiers._override(that, "__construct", function() {

			this._super.apply(this, arguments);

		});

	} else 
	if(!that.__construct) {

		that.__construct = function() {};

	}


	//copy the static methods.
	for (var property in from.__construct) {

		//make sure it's static. Don't want copying the prototype over. Also make sure NOT to override any
		//static methods on the new obj
		if(from.__construct[property]['static'] && !that[property]) {

			that.__construct[property] = from.__construct[property];

		}
	}

     
	var propertyName;
	
	//apply the static props
	for (propertyName in that) {

		var value = that[propertyName];

		//if the value is static, then tack it onto the constructor
		if (value && value['static']) {

			that.__construct[propertyName] = value;
			delete that[propertyName];

		} 

		if(usedProperties[propertyName]) continue;

		if(value.isAbstract) {
			value(); //will throw an error
		}

	}

	return that;
}


/**
 * really.. this isn't the greatest idea if a LOT of objects
 * are being allocated in a short perioud of time. use the closure
 * method instead. This is great for objects which are instantiated ONCE, or a couple of times :P.
 */

Structr.fh = function (that) {

	if(!that) {

		that = {};

	}

	that = Structr.extend({}, that);

	return Structr.ize(that);
}

/**
 */

Structr.ize = function(that) {

	that.structurized = true;

	//deprecated
	that.getMethod = function (property) {

		return Structr.getMethod(this, property);

	}

	that.extend = function () {

		return Structr.extend.apply(null, [this].concat(arguments));

	}

	//copy to target object
	that.copyTo = function (target, lite) {

		Structr.copy(this, target, lite);

	}   

	//wraps the objects methods so this always points to the right place
	that.wrap = function(property) {

		return Structr.wrap(this, property);

	}

	return that;
}
                 
/**
 */

module.exports = Structr;


});

require.define("/lib/views/template.js",function(require,module,exports,__dirname,__filename,process,global){
module.exports = require("./base").extend({

	/**
	 */

	"override __construct": function(options) {
		this._super.apply(this, arguments);
		this.options = options;
		this.template = typeof options.template == "function" ? options.template : _.template($(this.options.template));
		this.render();
	},

	/**
	 */

	"render": function() {
		this.$el.html(this.template(this.options));
	}	
});
});

require.define("/lib/views/base.js",function(require,module,exports,__dirname,__filename,process,global){var structr = require("structr"),
EventEmitter = require("events").EventEmitter;

module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(options) {
		this.$el = options.$el;
	},

	/**
	 */

	"close": function() {
		this.dispose();
		this.$el.remove();
	},

	/**
	 */

	"render": function() {
		//override me
	},

	/**
	 */

	"dispose": function() {
		this.emit("dispose");
		this.$el.find("*").unbind();
	}
});
});

require.define("events",function(require,module,exports,__dirname,__filename,process,global){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

});

require.define("/lib/manager.js",function(require,module,exports,__dirname,__filename,process,global){var structr = require("structr"),
Notification = require("./notification"),
Container    = require("./views/container");

module.exports = structr({

	/**
	 */

	"__construct": function(builder) {
		this._builder = builder;
		this._numNotifications = 0;
	},

	/**
	 */

	"display": function(options) {


		if(!this._container) {
			this._container = new Container(this._builder.options);
			this._container.display();
			var self = this;
			this._container.once("close", function() {
				self._container = null;
			});
		}


		return this._container.addNotification(options);
	},


	/**
	 */

	"_createNotification": function(options) {
		return new Notification(options);
	}
});
});

require.define("/lib/notification.js",function(require,module,exports,__dirname,__filename,process,global){var structr = require("structr"),
EventEmitter = require("events").EventEmitter;


module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(options) {
		this.options = structr.copy(options);
	},

	/**
	 */

	"display": function(data) {
		var self = this;
		setTimeout(function() {
			self.emit("close");
		})
	}
});
});

require.define("/lib/views/container.js",function(require,module,exports,__dirname,__filename,process,global){module.exports = require("./base").extend({

	/**
	 */

	"override __construct": function(options) {
		this.max = options.max || 1;
		this.viewClass = options.viewClass;
		this._children = [];


		this._super({ $el: $("<div class='bark-container' style='z-index:999;position:fixed;'>ff</div>") });
	},

	/**
	 */

	"addNotification": function(options) {

		console.log(this.viewClass)
		// var child = new this.viewClass({ el:  })
		// this._children.push(child);
		// child.render();
	},

	/**
	 */


	"display": function() {
		$(document.body).append(this.$el);
	}

});
});

require.define("/lib/index.js",function(require,module,exports,__dirname,__filename,process,global){var Bark = require("./bark"),
bark = new Bark();


if(typeof window !== "undefined") {
  window.Bark = bark;
}

if(typeof module.exports !== "undefined") {
  module.exports = bark;
}
});
require("/lib/index.js");
})();
