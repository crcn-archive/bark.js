var Bark = require("./bark"),
bark = new Bark();


if(typeof window !== "undefined") {
  window.Bark = bark;
}

if(typeof module.exports !== "undefined") {
  module.exports = bark;
}
