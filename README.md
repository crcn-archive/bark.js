### Dependencies

- jQuery
- [transit](http://ricostacruz.com/jquery.transit/)


## Growl notification Example:

```javascript

var bark = require("bark-notification");

var growlNotification = bark.
create().

//template for the notification
template("growl-notification").

//the layout for any additional notifications that might be added
layout("vertical").

//the position of the notifications left, right, top, bottom, center
position({ right: 500 }).

//transition-in animation
transitionIn({ alpha: 0 }, { alpha: 1 }).

//transition-out animation
transitionOut({ right: 500 });


growlNotification.signal("hello world!");
growlNotification.signal("what a wonderful day!!");

```



