

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
<<<<<<< HEAD
        console.log(a);
        console.log(str);
=======
        console.log(a,layer);
>>>>>>> 9bc491ac4f1d14d607a8699824faccff74f90ad5
    })
)

