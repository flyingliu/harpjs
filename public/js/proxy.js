;(function(window,undefined){
    var url = {
        geta: "/js/geta.json",
        getb: "/js/geta.json"
    }

    function Proxy() {
        this.url = $.extend(true, {}, url, window.PROXY_URL);
        for (var i in this.url) {
            if (!this[i]) {
                this.addUrl(i, this.url[i]);
            }
        }
    }

    Proxy.prototype = {
        addUrl: function(name, url) {
            if (!this[name]) {
                this[name] = function(op, fn, errorFn, async) {
                    var options = {};
                    options.url = url;
                    options.data = op;
                    this.post(options, fn, errorFn, async);
                }
            }
        },
        updateDate: function(options) {
            //设置token信息
            // var userId = getQueryString("UI");
            // var timestamp = getQueryString("TS");
            // var accessToken = getQueryString("access_token");
            if (!options) {
                options = {};
            }

            // if (userId && timestamp && accessToken) {
            //     if (!options.data) {
            //         options.data = {};
            //     }

            //     options.data.UI = userId;
            //     options.data.TS = timestamp;
            //     options.data.access_token = accessToken;
            // }

            return options;
        },
        ajax: function(op) {
            var default_options = {
                type: "post",
                url: undefined,
                dataType: "json",
                data: undefined,
                async: true,
                success: undefined,
                traditional: true,
                xhrFields: {
                    origin: true,
                    withCredentials: true
                },
                crossDomain: true,
                error: function(XMLHttpRequest, textStatus, errorThrown) {}
            }

            var options = this.updateDate($.extend(true, {}, default_options, op));

            $.ajax(options);
        },
        get: function(op, success, error, async) {
            op.type = "get";

            if (typeof success === "function") {
                op.success = success;
            }

            if (typeof error === "function") {
                op.error = error;
            }

            if (async == false) {
                op.async = false;
            } else if (op.data.async == false) {
                op.data.async = null;
                op.async = false;
            }

            this.ajax(op);
        },
        post: function(op, success, error, async) {
            op.type = op.data.type || "post";

            if (typeof success === "function") {
                op.success = success;
            }

            if (typeof error === "function") {
                op.error = error;
            }

            if (async == false) {
                op.async = false;
            } else if (op.data.async == false) {
                op.data.async = null;
                op.async = false;
            }

            this.ajax(op);
        }
    }

    window.proxy = new Proxy();

})(window);