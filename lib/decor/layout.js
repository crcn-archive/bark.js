module.exports = structr(require("./base"), {

	/**
	 */

	"override __construct": function() {
		this._super.apply(this, arguments);
	},

	/**
	 */

	"dispose": function() {
		//cleanup listeners
	}
});