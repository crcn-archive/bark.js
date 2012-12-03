var structr = require("structr"),
EventEmitter = require("events").EventEmitter;

module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(options) {
		this.$el = options.$el;
		this.parent = options.parent;
		this.options = options;
	},

	/**
	 */

	"close": function() {
		this.emit("close");
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

	"display": function() {

	},

	/**
	 */

	"dispose": function() {
		this.emit("dispose");
		this.$el.find("*").unbind();
	}
});