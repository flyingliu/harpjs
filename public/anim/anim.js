$(function() {
    $("[data-anim]").each(function() {
        var anim = $(this).data("anim");
        var positionTop = $(this).position().top;
        var positionHeihtTop = positionTop + $(this).height();

        if ((positionTop >= $(window).scrollTop() && positionTop < ($(window).scrollTop() + $(window).height())) || (positionHeihtTop >= $(window).scrollTop() && positionHeihtTop < ($(window).scrollTop() + $(window).height()))) {
            console.log(this, anim, positionTop);
            alert("在可视范围");
        }

    })

})