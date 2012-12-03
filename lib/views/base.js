var structr = require("structr"),
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