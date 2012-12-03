module.exports = require("./base").extend({

	/**
	 */

	"override __construct": function(options) {
		this.max = options.max || 1;
		this.viewClass = options.viewClass;
		this._children = [];


		this._super({ $el: $("<div class='bark-container' style='z-index:999;position:fixed;'>ff</div>") });
	},

	/**
	 */

	"addNotification": function(options) {

		console.log(this.viewClass)
		// var child = new this.viewClass({ el:  })
		// this._children.push(child);
		// child.render();
	},

	/**
	 */


	"display": function() {
		$(document.body).append(this.$el);
	}

});