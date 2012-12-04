var structr = require("structr"),
TemplateView = require("./views/template"),
NotificationManager = require("./manager");

var NotificationBuilder = module.exports = structr({

	/**
	 * existing options form an inherited notification
	 */

	"__construct": function (inheritFrom) {
		this.reset(structr.copy(inheritFrom ? inheritFrom._options : {}))
		this._manager = new NotificationManager(this);
	},

	/**
	 */

	"defaults": function (options) {
		this._options = structr.copy(this._options, options);
		return this;
	},

	/**
	 */

	"closable": function(value) {
		this._options.closable = value === false;
		return this;
	},

	/**
	 */

	"options": function (options) {
		this._options = structr.copy(options, this._options);
		return this;
	},

	/**
	 */

	"reset": function (options) {
		this._options = options || {};
		if (!this._options.max) this._options.max = 1;
		if(this._options.closable !== false) this._options.closable = true;
		return this;
	},

	/**
	 * close the notification after this time
	 */

	"closeAfterTime": function (value) {
		this._options.closeAfterTime = value;
		return this;
	},

	/**
	 * max number of notifications to show at one time
	 */

	"max": function (value) {
		this._options.max = value;
		return this;
	},

	/**
	 * layout information for the notification: vertical, horizontal
	 */

	"layout": function (value) {
		this._options.layout = value;
		return this;
	},

	/**
	 * the backbone view class for the notification
	 */

	"view": function (view) {
		this._options.viewClass = view;
		return this;
	},


	/**
	 * css class name for the modal
	 */

	"modalClass": function (className) {
		return this.setClass("modal", className);
	},

	/**
	 */

	"containerClass": function (className) {
		return this.setClass("container", className);
	},

	/**
	 * css class name for the notification
	 */

	"notificationClass": function (className) {
		return this.setClass("container", className);
	},

	/**
	 */

	"classes": function (options) {
		this._options.classes = options || {};
		return this;
	},

	/**
	 */


	"setClass": function (name, className) {
		if (!this._options.classes) this._options.classes = {};
		this._options.classes[name] = className;
		return this;
	},

	/**
	 */

	"on": function(type, callback) {
		this._manager.on(type, callback);
		return this;
	},

	/**
	 */

	"template": function (element) {
		this._options.template = element;
		return this.view(TemplateView);
	},

	/**
	 * transition in styles
	 */

	"transitionIn": function (from, to, easing) {
		this._options.transitionIn = {
			from: from || {},
			to: to || {},
			easing: easing || {}
		};
		return this;
	},

	/**
	 * transition out styles
	 */

	"transitionOut": function (from, to, easing) {
		this._options.transitionOut = {
			from: from || {},
			to: to || {},
			easing: easing || {}
		};
		return this;
	},

	/**
	 */

	"wrap": function() {
		var self = this;
		return function(options, onClose) {
			return self.display(options, onClose);
		}
	},

	/**
	 */

	"display": function (options, onClose) {
		this._manager.display(options, onClose);
	},

	/**
	 */

	"clone": function () {
		return new NotificationBuilder(this);
	}
});