var NotificationBuilder = require("./notificationBuilder"),
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
			return self; //ability to chain.
		}
	}
});