;(function (root,factory) {
        var abc = factory(root);
        if (typeof define === "function" && define.amd) {
            // AMD模式
            define('abc', factory);
        } else {
            // 全局模式
            root.abc = abc;
            
        }
    }(this, function(root) {
        'use strict';
        function abc(name) {

            this.name = name;

            console.log(this + "is this");
            this.init();
        }
<<<<<<< HEAD

        window.yp = "yp"


=======
        window.layer = "this is layer";
>>>>>>> 9bc491ac4f1d14d607a8699824faccff74f90ad5
        abc.prototype = {
            say: function () {
                console.log("my name is" + this.name)
            },
            init:function () {
                console.log("init");
            }
        }
        return abc;
    })
)

