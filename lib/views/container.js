var Notification = require("./notification");

module.exports = require("./base").extend({

	/**
	 */

	"override __construct": function(options) {
		this.max = options.max || 1;
		this.viewClass = options.viewClass;
		this._children = [];
		this._queue = [];


		this._super({ $el: $("<div class='bark-container' style='z-index:999;position:fixed;right:0px'></div>") });
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
	},

	/**
	 */

	"_addNextNotification": function() {

		if(this._children.length >= this.max) return;

		var options = this._queue.shift();

		//no more notifications? end.
		if(!options) return this.close();

		//
		var id = "bark-notification" + (this._id++),
		self = this,
		$el = options.$el = $("<div id='" + id + " style='position:absolute;'> </div>");
		this.$el.append($el);


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
	}

});