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
        }

        abc.prototype = {
            say: function () {
                console.log("my name is" + this.name)
            }
        }
        return abc;
    })
)

