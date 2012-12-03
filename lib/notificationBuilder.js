var NotificationBuilder = module.exports = structr({

	/**
	 * existing options form an inherited notification
	 */

	"__construct": function(inheritFrom) {
		this._options = structr.copy(inheritFrom ? inheritFrom._options : {});
		this._manager = new NotificationManager(this);

		if(!this._options.max) this._options.max = 1;
	},

	/**
	 */

	"defaults": function(options) {
		this._options = structr.copy(this._options, options);
		return this;
	},

	/**
	 */

	"options": function(options) {
		this._options = structr.copy(options, this._options);
		return this;
	},

	/**
	 */

	"reset": function(options) {
		this._options = options || {};
	},

	/**
	 * close the notification after this time
	 */

	"closeAfterTime": function(value) {
		this._options.closeAfterTime = value;
		return this;
	},

	/**
	 * max number of notifications to show at one time
	 */

	"max": function(value) {
		this._options.max = value;
		return this;
	},

	/**
	 * layout information for the notification: vertical, horizontal
	 */

	"layout": function(value) {
		this._options.layout = value;
		return this;
	},

	/**
	 * the backbone view class for the notification
	 */

	"viewClass": function(viewClass) {
		this._options.viewClass = viewClass;
	},


	/**
	 * css class name for the modal
	 */

	"modalClass": function(className) {
		this._options.modalClass = className;
		return this;
	},

	/**
	 * css class name for the notification
	 */

	"notificationClass": function(className) {
		this._options.notificationClass = className;
		return this;
	},

	/**
	 */

	"template": function(element) {
		this._options.template = element;
		return this.viewClass(TemplateView);
	},

	/**
	 * transition in styles
	 */

	"transitionIn": function(from, to, easing) {
		this._options.transitionIn = { from: from || {}, to: to || {}, easing: easing || {} };
		return this;
	},

	/**
	 * transition out styles
	 */

	"transitionOut": function(from, to, easing) {
		this._options.transitionOut = { from: from || {}, to: to || {}, easing: easing || {} };
		return this;
	},

	/**
	 */

	"display": function(options, onClose) {
		this._manager.display(options, onClose);
	},

	/**
	 */

	"clone": function() {
		return new NotificationBuilder(this);
	}
});