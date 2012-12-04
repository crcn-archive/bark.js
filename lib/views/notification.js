module.exports = require("./base").extend({

	/**
	 */

	"override __construct": function(options) {
		options.notification = this;
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
			self.event = ev;

			self.transitionOut();

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

	"transitionIn": function() {
		if(!this.options.transitionIn) return;

		var tin = this.options.transitionIn;
		
		this.$el.
		css(tin.from).
		transition(tin.to, tin.easing.duration, tin.easing.type);
	},

	/**
	 */

	"transitionOut": function(force) {

		var self = this;

		//bypass security restrictions
		self.options.onClose(this.event || {});

		function onClose() {
			self.close();
		}

		if(!self.options.closable && !force) return;

		if(!this.options.transitionOut) return onClose();

		var tout = this.options.transitionOut,
		$el = this.$el;

		$el.
		css(tout.from).
		transition(tout.to, tout.easing.duration || 200, tout.easing.type, onClose);
	}

});