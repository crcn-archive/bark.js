var structr = require("structr"),
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