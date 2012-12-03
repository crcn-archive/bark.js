var Notification = require("./notification");

module.exports = require("./base").extend({

	/**
	 */

	"override __construct": function(options) {
		this.max = options.max || 1;
		this.viewClass = options.viewClass;
		this._children = [];
		this._queue = [];


		var tpl = "<div class=\"bark-bark\" style=\"position:fixed;z-index:99999;width:100%;height:100%;top:0px;left:0px;\">" +
					"<div class=\"bark-modal\" style=\"position:absolute;left:0px;top:0px;width:100%;height:100%\"></div>" + 
					"<div class=\"bark-container\"></div>" + 
				  "</div>";

		options.$el = $(tpl);

		this._super(options);
		this._id = 0;
	},

	/**
	 */

	"addNotification": function(options) {
		this._queue.push(options);
		this._addNextNotification();
	},

	/**
	 */

	"display": function() {
		$(document.body).append(this.$el);
		this.$container = this.$el.find(".bark-container");
		this.$modal     = this.$el.find(".bark-modal");

		if(this.options.modalClass) {
			this.$modal.addClass(this.options.modalClass);
		}
		this.layout();
		this.transitionIn();
	},

	/**
	 */

	"layout": function() {

		var layout = this.options.layout || {},
		css = {
			width: layout.width,
			right: layout.right,
			bottom: layout.bottom,
			top: layout.top,
			left: layout.left,
			position: "absolute"
		};

		if(layout.center) {
			css.width = css.width || 300;
			css["margin-left"] = css["margin-right"] = "auto";
			css.position = "relative";
		}


		this.$container.css(css);
	},

	/**
	 */

	"_addNextNotification": function() {

		if(this._children.length >= this.max) return;

		var options = this._queue.shift();

		//no more notifications? end.
		if(!options) {
			if(!this._children.length) {
				this.transitionOut();
			}
			return;
		}

		//
		var id = "bark-notification" + (this._id++),
		self = this,
		$el = options.$el = $("<div id=\"" + id + "\" style=\"position:relative;\"> </div>");
		this.$container.append($el);


		//create a new notification child, and pass the view class
		var child = new Notification(options);
		this._children.push(child);

		//display it
		child.render();

		//on close, show next notification
		child.once("close", function() {
			self._children.splice(self._children.indexOf(child), 1);
			self.emit("removeChild", child);
			self._addNextNotification();
		});


		this.emit("addChild", child);
	},


	/**
	 */

	"transitionIn": function() {
		this.$modal.css({ opacity: 0 }).transit({ opacity: 1 }, 200);
	},

	/**
	 */

	"transitionOut": function(cb) {
		var self = this;
		this.$modal.transit({ opacity: 0 }, 500, function() {
			if(cb) cb();
			self.close();
		})
	}

});