var layoutClasses = [
	// require("./align"), //aligns the children
	// require("./hbox"), //horizontal box
	// require("./vbox"), //vertical box layout for children
	require("./position") //position of the container 

];


module.exports = require("./base").extend({

	/**
	 */

	"__construct": function(view, options) {
		this.view = view;
		this.options = options;

		this.layouts = [];

		for(var i = layoutClasses.length; i--;) {
			if(layoutClasses[i].test(options)) {
				this.layouts.push(new layoutClasses[i](view, options));
			}
		}

		// this._bindWindowResize();
	},

	/**
	 * resets the layout if any children change
	 */

	"invalidate": function() {
		for(var i = this.layouts.length; i--;) {
			this.layouts[i].invalidate();
		}
	}

	/**
	 */

	/*"_bindWindowResize": function() {

		var self = this;

		function onWindowResize() {
			self.invalidate();
		}

		view.once("close", function() {
			$(document).unbind("resize", onWindowResize);
		});

		$(document).bind("resize", onWindowResize);
	}*/
})