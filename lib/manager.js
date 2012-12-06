var structr = require("structr"),
Container    = require("./views/container"),
EventEmitter = require("events").EventEmitter;



/**
 * manages the main notification container
 */


module.exports = structr(EventEmitter, {

	/**
	 */

	"__construct": function(builder) {
		this._builder = builder;
	},

	/**
	 */

	"display": function(options, onClose) {

		if(typeof options == "string") {
			options = { message: options };
		}

		options.onClose = onClose || function(){};

		if(!this._container) {
			this._container = new Container(this._builder._options);
			this._container.display();
			var self = this;
			this._container.once("close", function() {
				self._container = null;
			});

			this._container.on("addChild", function(child) {
				self.emit("openNotification", child);
			});

			this._container.on("removeChild", function(child) {
				self.emit("closeNotification", child);
			});
		}

		var ops = structr.copy(this._builder._options);
		ops = structr.copy(options, ops);


		return this._container.addNotification(ops);
	},


	/**
	 */

	"_createNotification": function(options) {
		return new Notification(options);
	}
});