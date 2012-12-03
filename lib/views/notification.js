module.exports = require("./base").extend({

	/**
	 */

	"override __construct": function(options) {
		this.view = new options.viewClass(options);
		this._super.apply(this, arguments);
	},

	/**
	 */

	"render": function() {

		this.view.render();
		this.transitionIn();

		var self = this;

		//find all the close buttons - there maybe multiple
		this.$el.find(".close").one("click", function() {

			//this chunk allows for the detection of a particular button
			var ev = {},
			name = $(this).attr("data-name");
			if(name) ev[name] = true;

			self.transitionOut(function() {
				self.options.onClose(ev);
			});
		});


		//timeout active? probably a growl-like notification
		if(this.options.closeAfterTime) {
			setTimeout(function() {
				self.transitionOut();
			}, this.options.closeAfterTime);
		}
	},


	/**
	 */

	"transitionIn": function(cb) {
		if(!this.options.transitionIn) return;

		var tin = this.options.transitionIn;
		
		this.$el.
		css(tin.from).
		transition(tin.to, tin.easing.duration, tin.easing.type, cb);
	},


	/**
	 */

	"transitionOut": function(cb) {
		if(!this.options.transitionOut) return;
		var tout = this.options.transitionOut,
		$el = this.$el,
		self = this;

		$el.
		css(tout.from).
		transition(tout.to, tout.easing.duration || 200, tout.easing.type, function() {
			if(cb) cb();
			self.close();
		});
	}

});