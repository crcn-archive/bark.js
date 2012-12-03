var structr = require("structr"),
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