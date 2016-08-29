

(function (factory) {
        if (typeof define === "function" && define.amd) {
            // AMD模式
            define([
                'jquery',
                'layer',
                'abc',
                'str'
            ], factory);
        } else {
            // 全局模式
            factory ($, layer, abc);
        }
    }(function ($, layer, abc) {

        var a = new abc("flying");
        console.log(a);
        console.log(str);
    })
)

