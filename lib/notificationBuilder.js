var structr = require("structr"),
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