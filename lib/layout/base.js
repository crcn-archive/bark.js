var structr = require("structr");

module.exports = structr({

	/**
	 */

	"__construct": function(view, options) {
		this.view = view;
		this.options = options;

		var self = this;

		this.view.on("dispose", function() {
			self.dispose();
		});
	},

	/**
	 */

	"update": function() {
		// var notification =
		//TODO
	},

	/**
	 */

	"dispose": function() {
		//cleanup listeners
	}
});