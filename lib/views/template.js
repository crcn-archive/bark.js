
module.exports = require("./base").extend({

	/**
	 */

	"override __construct": function(options) {
		this._super.apply(this, arguments);
		this.options = options;
		this.template = typeof options.template == "function" ? options.template : _.template(this.options.template);
		this.render();
	},

	/**
	 */

	"render": function() {
		this.$el.html(this.template(this.options));
	}	
});