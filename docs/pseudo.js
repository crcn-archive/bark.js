var bark = require("bark");

bark.
create("alert").
view(".alert").
position({ center: 0 }).
transitionIn({ scale: 0.75, alpha: 0}, { alpha: 1 }).
transitionOut({ scale: 0.75, alpha: 0 });


bark.
create("popdown").
view(".popdown").
position({ top: 0 }).
transitionIn({ top: -20 }, { top: 0 }).
transitionOut({ top: -1 }).
closeAfter(1000 * 5); //5 seconds


bark.alert("hello world!", function() {

})