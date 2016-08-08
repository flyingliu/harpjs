$.fn.extend({

    check:function(){
        return this.each(function(a,b){
            console.log(a,b);
        });
    },
    uncheck:function(){
        return false;
    },
    log:function(){
        console.log($(this).text());
    }
});

;(function($) {

    var methods = {
        init: function(options) {
            // 这
            // Create some defaults, extending them with any options that were provided
            var settings = $.extend({
                'location': 'top',
                'background-color': 'blue'
            }, options);
        },
        show: function() {
            // 很
        },
        hide: function() {
        },
        update: function(content) {
            // !!! 
        }
    };


    // 为保持插件的 chainability ，必须确保插件返回 this 关键字。
    $.fn.tooltip = function(options) {

        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
        
    };
})(jQuery);

$.xy = {
    add: function(){
        console.log(this);
    }
}

$.extend({
    add:function(a,b){ console.log(this,a,b);},
    minus:function(a,b){return a-b;}
});

$(function(){

    $("h1").check();
    $("h1").tooltip();
    $.xy.add();

    $.add(3,2);
    
})

