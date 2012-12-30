var Notification = require("./notification");

module.exports = require("./base").extend({

    /**
     */

    "override __construct": function (options) {
        this.max = options.max || 1;
        this.viewClass = options.viewClass;
        this._children = [];
        this._queue = [];

        var tpl = "<div class=\"bark-bark\" style=\"pointer-events:none;position:fixed;z-index:99999;width:100%;height:100%;top:0px;left:0px;\">" +
            "<div class=\"bark-modal\" style=\"position:absolute;left:0px;top:0px;pointer-events:auto\"></div>" +
            "<div class=\"bark-container\" style=\"pointer-events:auto\"></div>" +
            "</div>";

        options.$el = $(tpl);

        this._super(options);
        this._id = 0;
    },

    /**
     */

    "addNotification": function (options) {
        this._queue.push(options);
        this._addNextNotification();
    },

    /**
     */

    "display": function () {
        $(document.body).prepend(this.$el);
        this.$container = this.$el.find(".bark-container");
        this.$modal = this.$el.find(".bark-modal");

        if (this.options.classes.modal) {
            this.$modal.css({
                width: "100%",
                height: "100%"
            }).
            addClass(this.options.classes.modal);
        }

        if (this.options.classes.container) {
            this.$container.addClass(this.options.classes.container);
        }

        this.layout();
        this.transitionIn();
    },

    /**
     */

    "layout": function () {

        var layout = this.options.layout || {},
        css = {
            right: layout.right,
            bottom: layout.bottom,
            top: layout.top,
            left: layout.left,
            position: "absolute"
        };


        if (layout.center) {
            // css.width = css.width || 300;
           // css["margin-left"] = css["margin-right"] = "auto";
            // css["margin"] = "0px auto";
            css.position = "relative";
            css["text-align"] = "center";
        }


        this.$container.css(css);
    },

    /**
     */

    "_addNextNotification": function () {

        if (~this.max && this._children.length >= this.max) return;

        var options = this._queue.shift();

        //no more notifications? end.
        if (!options) {
            if (!this._children.length) {
                this.transitionOut();
            }
            return;
        }

        //
        var id = "bark-notification" + (this._id++),
            self = this,

            //note - 
            $el = $("<div id=\"" + id + "\" class=\"bark-notification\" style=\"display:inline-block;min-width:"+this.options.layout.width+"px\"><div class=\"bark-inner-container\" style=\"position:relative;\"></div></div>");
        this.$container.append($el);

        options.$el = $el.find(".bark-inner-container");

        if (this.options.classes.notification) {
            options.$el.addClass(this.options.classes.notification);
        }


        //create a new notification child, and pass the view class
        var child = new Notification(options);
        this._children.push(child);

        //display it
        child.render();

        //on close, show next notification
        child.once("close", function () {
            self._children.splice(self._children.indexOf(child), 1);
            self.emit("removeChild", child);
            self._addNextNotification();
        });


        this.emit("addChild", child);
    },


    /**
     */

    "transitionIn": function () {
        this.$modal.css({
            opacity: 0
        }).transit({
            opacity: 1
        }, 200);
    },

    /**
     */

    "transitionOut": function () {
        var self = this;
        this.$modal.transit({
            opacity: 0
        }, 500, function () {
            self.close();
        })
    }

});