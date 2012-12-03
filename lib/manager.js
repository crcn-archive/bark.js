var structr = require("structr"),
Container    = require("./views/container");



/**
 * manages the main notification container
 */


module.exports = structr({

	/**
	 */

	"__construct": function(builder) {
		this._builder = builder;
	},

	/**
	 */

	"display": function(options) {

		if(typeof options == "string") {
			options = { message: options };
		}

		if(!this._container) {
			this._container = new Container(this._builder.options);
			this._container.display();
			var self = this;
			this._container.once("close", function() {
				self._container = null;
			});
		}

		return this._container.addNotification(structr.copy(this._builder.options, options, {}));
	},


	/**
	 */

	"_createNotification": function(options) {
		return new Notification(options);
	}
});