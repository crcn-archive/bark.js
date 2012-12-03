var Bark = require("./bark"),
bark = new Bark();

function init() {
	return new Bark();
}


if(typeof window !== "undefined") {
  window.Bark = init;
}

if(typeof module.exports !== "undefined") {
  module.exports = init;
}
