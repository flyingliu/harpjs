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

;(function ($) {
    $.fn.tooltip = function () {
        return this.each(function (a,b) {
            console.log(a,b);
        });
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

