(function($, app) {
    // regular expression to parse "eventName selector"
    // => ["eventName selector", "eventName", "selector"]
    var splitter = /^(\S+)\s*(.*)$/;

    var BaseView = {

        init: function() {
            this.events && this.delegateEvents();
        },

        // parse this.events and set dom events using Jquery.on
        // this.events = { "eventName selector": callback }
        delegateEvents: function() {
            var that = this;
            $.each(this.events, function(selector, callback) {
                // split event from selector
                var match = selector.match(splitter);
                // split selector for parent and child
                var selector_match = match[2].match(splitter);

                var event = match[1],
                    parent = selector_match[1],
                    child = selector_match[2];

                // if callback is not a function,
                // try to search the function in object methods
                if(!$.isFunction(callback)) callback = that[callback];
                // make sure this is not lost in callback
                callback = $.proxy(callback, that)
                // delegate events and make sure not to bind multiple events
                if(child) {
                    $(parent).off(event, child).on(event, child, callback);
                } else {
                    $(parent).off(event, child).on(event, callback);
                }
            });
        }, // delegateEvents
    }; // BaseView

    // push BaseView in global namespace
    app.BaseView = BaseView;

})(jQuery_171, AllearterApp);
