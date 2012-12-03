## Build Requirements

- node.js
- browserify

## Dependencies

- jQuery 1.7
- [transit](http://ricostacruz.com/jquery.transit/)
- [underscore](http://underscorejs.org/)

## Notes

- For any animation documentation, see [transit](http://ricostacruz.com/jquery.transit/)

## Use Case

- Alerts
- Confirmations - customized anyway you want
- Growl-like notifications
- View states


## API


### NotificationBuilder bark.register(name)

Registers a new notification 

```javascript

//this will add a sort of "puff" alert
Bark.
register("alert"). 
defaults({ ok: "OK" }). //set the default OK message
modalClass("alert-modal"). //the background color for the alerts. Makes content unclickable.
transitionIn({ scale: 0.75, opacity: 1}, { scale: 1, opacity: 1}). //scale from -> to on transition in
transitionOut({ scale: 1, opacity: 1 }, { scale: 1.25, opacity: 0}). //puff out
template($("[data-templateName='alert']").html());

```

Somewhere in your html `<head />`:

```html
<script type="text/ejs" data-templateName="alert">
	<div class="alert">
		<div><%-message %></div>
		<a href="#" class="alert-ok close" data-name="ok"><%-ok %></a>
	</div>
</script>

```

Now run your new alert:

```javascript
Bark.alert("hello world!", function(event) {
	if(event.ok) {
		//do stuff
	}
});
```


## NotificationBuilder API


### transitionIn(from, to, easing)

Sets the transition-in animation properties

- `from` - css properties
- `to` - css properties
- `easing` - css [transit](http://ricostacruz.com/jquery.transit/) docs

### transitionOut(from, to, easing)

Sets the transition-out animation properties. 

### layout(options)

Page layout options

- `options`
	- `center` - if set to true, the all notifications will be placed in the center of the screen
	- `right` - make the notifications right-bound
	- `top` - top bound in pixels
	- `bottom` - --
	- `left` -  --
	- `width` - width of the notifications container

### modalClass(className)

Sets the class name of the background for the notifications. Set this property if you want to disable everything except notifications.

### max(n)

Sets the maximum number of notifications that are allowed to be displayed simultaneously. 

For growl-like notifications, this number should be set the **greater than 1**. 
For alert-like notifications, this number should be **set to 1**.

### closeAfterTime(ms) 

Closes the notifications after the given duration (in milliseconds). Use this for growl-like notifications.

