parentMsg (function (window, undefined) {
    var codePath;
    codePath = (location.port === "81") ? 'http://code.panocooker.com:81' : 'http://code.panocooker.com/v1.1'
    window.codePath = codePath;

    var yp = function (option) {
        this.init();
        this.createPano(option);
    };

    var skinConfig = {
        store:{
            // js: "./skin/store/store.all.js",
            // css: "./skin/store/css/toolbar.css"
        }
    }

    yp._methods = {};
    yp._plugins = {};
    yp._skins = {};
    yp._loadXml = [];

    yp.extend = yp.prototype;

    function _initMethod(funs) {
        if (typeof funs.xml === "string") {
            yp._loadXml.push(funs.xml);
        } else if (typeof funs.xml === "array") {
            yp._loadXml.concat(funs.xml);
        }
    }

    function loadJS(id, url) {
        var xmlHttp = null;
        if (window.ActiveXObject) {
            try {
                xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        }
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        if (xmlHttp.readyState == 4) {
            if ((xmlHttp.status >= 200 && xmlHttp.status < 300) || xmlHttp.status == 0 || xmlHttp.status == 304) {
                var myHead = document.getElementsByTagName("HEAD").item(0);
                var myScript = document.createElement("script");
                myScript.type = "text/javascript";
                myScript.id = id;
                try {
                    myScript.appendChild(document.createTextNode(xmlHttp.responseText));
                } catch (ex) {
                    myScript.text = xmlHttp.responseText;
                }
                myHead.appendChild(myScript);
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    yp.addMethod = function (name, funs) {
        _initMethod(funs);
        yp._methods[name] = funs;
    };

    yp.addPlugin = function (name, funs) {
        //_initMethod(funs);
        yp._plugins[name] = funs;
    };

    yp.addSkin = function (name, obj, fn) {
        yp._skins[name] = obj;
        fn && fn();
    };

    yp.callback = function (funs) {
        if (typeof funs.xml === "string") {
            yp._loadXml.push(funs.xml);
        } else if (typeof funs.xml === "array") {
            yp._loadXml.concat(funs.xml);
        }

        return function () {
            funs.krpano = this.krpano;
            funs.option = this.option;
            funs.yp = this;
            funs.settings = this.krpano.get("skin_settings");
            var name = arguments[0];
            var slice = [].slice;
            var args = slice.call(arguments, 1);

            if (name && funs[name]) {
                return funs[name].apply(funs, args);
            } else if (name) {
                logger.error("未找到方法:" + name);
            }

            return funs;
        }
    };

    yp.extend.callback = function (name, data) {
        typeof this.option.callback[name] === "function" && this.option.callback[name].call(this, data);
    };

    yp.extend.init = function () {

        loadJS("embedpano", codePath + "/krpano/embedpano.js");
        loadJS("template", codePath + "/common/template.js");
        loadJS("logger", codePath + "/common/logger.js");
        loadJS("common", codePath + "/common/duc.common.js");
        
    };

    //创建全景
    yp.extend.createPano = function (option) {
        this.option = $.extend(true, {}, yp.DEFAULT_OPTION, option);
        var skin = this.option.skin;
        if (typeof skin === "string") {
            if(skinConfig[skin] !== undefined) {
                for(var k in skinConfig[skin]) {
                    var id = skin + k;
                    var type = (k == "css") ? true : false;
                    loadSkin(id, skinConfig[skin][k],type);
                }
            }

            this.skin = yp._skins[skin];
            this.option = $.extend(true, {}, yp.DEFAULT_OPTION, this.skin, option);
        }

        this._setData(this.option.data);
        var kOption = {}, self = this;
       
        if (this.option.xml) {

        } else if (this.option.panoId) {
            this.option.xml = this.option.path + "/getXml2?id=" + this.option.panoId + "&" + Date.parse(new Date());
        } else {
            logger.error("创建失败,无可用xml");
            return;
        }


        

        kOption.passQueryParameters = this.option.passQueryParameters;
        kOption.id = this.option.id;
        kOption.target = this.option.target;
        kOption.vars = this.option.vars;
        kOption.swf = this.option.swf;
        kOption.xml = this.option.xml;
        kOption.initvars = this.option.initvars;
        kOption.onerror = this.option.callback.onError;
        kOption.html5 = "prefer";
        kOption.mobilescale = 1;
        kOption.mwheel = this.option.mwheel;
        // kOption.basepath = "http://pano.panocooker.com/krpano/"

        kOption.onready = function (krpano) {
            krpano.set("yt_pano", self);

            self.krpano = krpano;

            yp._loadXml.push(codePath + "/krpano/krpano.xml");

            for (var i in yp._loadXml) {
                self.krpano.call("loadxml('<krpano><include url=\"" + yp._loadXml[i] + "\" /></krpano>')");
            }

            for (var i in self.data.loadName) {
                var loadName = self.data.loadName[i];
                if (yp._plugins[loadName] && yp._plugins[loadName].xml) {
                    self.krpano.call("loadxml('<krpano><include url=\"" + yp._plugins[loadName].xml + "\" /></krpano>')");
                }
            }
        };

        $(function () {
            self.element = $("#" + kOption.target);
            //防止无改div
            if (!self.element[0]) {
                self.element = $("<div/>").appendTo("body").attr("id", kOption.target);
            }
            self.element.css({width: self.option.width, height: self.option.height});
            $("body, html").css({width: self.option.width, height: self.option.height});
            logger.info(kOption);
            embedpano(kOption);
            //安卓手机微信加载不完成的bug
            if (typeof self.option.callback['timerWxAndroidFn'] === "function") {
                self.option.callback.timerWxAndroidFn();
            }
        })
    };

    yp.extend._setData = function (data) {
        this.data = {
            loadName: [],
            relevance: {}
        };

        var pushLoadName = function (name) {
            for (var i in this.data.loadName) {
                if (this.data.loadName == name) {
                    return;
                }
            }

            this.data.loadName.push(name);
        }.bind(this);

        for (var i in data) {
            var obj = {
                option: {}
            };

            if (this.skin && this.skin.plugin && this.skin.plugin[i]) {
                obj.option = $.extend(true, {}, this.skin.plugin[i]);
            }

            if (typeof data[i] === "boolean") {
                if (data[i] == true) {
                    pushLoadName(i);
                    obj.loadName = i;
                }
            } else if (typeof data[i] === "object") {
                if (typeof data[i].isDefaultData === 'undefined' || data[i].isDefaultData != false) {
                    pushLoadName(i);

                    obj.loadName = data[i].loadName || i;
                } else {
                    obj.customData = true;
                }

                obj.option = $.extend(true, {}, obj.option, data[i].option);

                obj.data = data[i].data;
            } else if (typeof data[i] === "string") {
                pushLoadName(data[i]);
                obj.loadName = data[i];
            }

            this.data.relevance[i] = obj;
        }
    };

    yp.extend.initEvent = function (name) {
        var event = [
            "onenterfullscreen",
            "onexitfullscreen",
            "onxmlcomplete",
            "onpreviewcomplete",
            "onloadcomplete",
            "onnewpano",
            "onremovepano",
            "onnewscene",
            "onloaderror",
            "onkeydown",
            "onkeyup",
            "onclick",
            "onmousedown",
            "onmouseup",
            "onmousewheel",
            "onidle",
            "onviewchange",
            "onviewchanged",
            "onresize",
            "onautorotatestart",
            "onautorotatestop",
            "onautorotateoneround",
            "onautorotatechange",
            "onaddscene",
            "onremovescene"
        ];

        this.events = this.method.util.createItem("events", "skin_chuanti_events");

        var callbackFn = function(eventName){
            var slice = [].slice;
            var args = slice.call(arguments, 1);

            for (var j in this.plugin) {
                var fn = this.plugin[j][eventName];

                if (fn && typeof fn === "function") {
                    fn.call(this.plugin[j]);
                }
            }

            for (var j in this.method) {
                var fn = this.method[j][eventName];

                if (fn && typeof fn === "function") {
                    fn.call(this.method[j]);
                }
            }

            var fn = this.option.callback[eventName];

            if(typeof fn === "function"){
                fn.apply(this, args);
            }
        }.bind(this);

        if(name){
            callbackFn(name);
        }

        for (var i in event) {
            this.events[event[i]] = callbackFn.bind(this, event[i]);
        }

        //横竖屏切换
        var ua = navigator.userAgent; 
        var supportsOrientationChange = ua.indexOf("Android") < 0 && "onorientationchange" in window,  
            orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";  
        var onorientationchange = function() {  
            var mql = window.matchMedia("(orientation: portrait)");

            var flag = true;
            if(typeof window.orientation !== "undefined"){
                if (Math.abs(window.orientation) == 90) {  
                   flag = false;  
                } 
            } else {
                   flag = mql.matches; 
            }

            callbackFn("onorientationchange", flag);
        }.bind(this)
        // 监听事件  
        $(window).on(orientationEvent, onorientationchange);

        onorientationchange();
    };

    yp.extend.callwith = function (type) {
        var name = arguments[0];
        var slice = [].slice;
        var args = slice.call(arguments, 1);

        if (this.option.callback && typeof this.option.callback[type] === "function") {
            this.option.callback[type].apply(this, args);
        }
    };

    yp.DEFAULT_OPTION = {
        panoId: undefined,
        passQueryParameters: false,
        id: "krpanoSWFObject",
        target: "pano" + new Date().getTime(),
        vars: {},
        skin: "default",
        swf: codePath + "/krpano/krpano.swf",
        xml: undefined,
        mwheel: true,
        initvars: {
            STATIC: codePath + "/static/",
            CODEURL: codePath,
            PANOCOOKERURL: "http://pano.panocooker.com"
        },
        path: "http://pano.panocooker.com",
        width: "100%",
        height: "100%",
        callback: {
            onReady: undefined,
            onError: undefined,
            onResize: function (width, height) {
                return false;
            },
            unLoadPlugin: function () {
                return;
            },
            onLoadData: function (something, fn) {
                this.proxy.getSomething({
                    id: this.method.scene.getCurrScene().id,
                    mainId: this.option.panoId,
                    something: something
                }, function (data) {
                    if(data.success){
                        fn(data.data);
                    } else {
                        YP.error(data.errMsg);
                    }
                })
            },
            onorientationchange: function(flag){
                var clientWidth = document.documentElement.clientWidth;

                if(flag){
                   document.documentElement.style.fontSize = 100 * (clientWidth / 375) + 'px';
                } else {
                    document.documentElement.style.fontSize = 100 * (clientWidth / 667) + 'px';
                }
            },
            timerWxAndroidFn: function() {
                var timerWxAndroid = setTimeout(function(){
                    location.href = "#";
                    clearTimeout(timerWxAndroid);
                },5000)
            }
        },
        data: undefined
    };

    yp.error = function (msg) {
        logger.error(msg);
    };

    window.YP = yp;
})(window);
(function (window, undefined) {
    var funs = {};

    funs.switch = function (flag) {
        this.krpano.get("plugin[skin_gyro]").enabled = typeof flag === "undefined" ? true : flag;
    };

    funs.init = function () {
        this.switch(this.settings.switch_gyro);
    };


    YP.addMethod("gyro", funs);
    // YP.extend.gyro = YP.callback(funs);
})(window);
(function (window, undefined) {
    var funs = {},
        yp,
        defaultOptions = {
            align: "center",
            isMove: true,
            x: 0,
            y: 0,
            style: "spotgif1",
            data:[],
            callback: {
                //onLoaded:function(a,b){ht = hotspotTypes;},
                //onDown:function(){alert("onDown")},
                //onUp:function() {alert("onUp")},
                //onClick:function() {alert("onClick")},
                //onOver:function(){alert("onOver")},
                //onOut:function(){alert("onOut")},
                //onHover:function(){alert("onHover")},
                //onMoveUpdate:function(){alert("onMoveUpdate")},
                //onUpdatestyle:function(){alert("onUpdatestyle")},
                //onRemove:function(){alert("onRemove")},
                //添加热点事件
                //onAddHotspot:function(){alert("onAddHotspot")},
                //上传热点事件
                //onSaveHotspot:function(){alert("onSaveHotspot")}
            },
            element: undefined
        };

    //注册热点，必须传入名称(hotspotType)
    funs.register  = function (hotspotType, opt) {
        opt = opt || {};
        opt.krpano = this.krpano;
        opt.yp = this.yp;
        return new RegisterHotspot (hotspotType, opt);
    };

    funs.switch = function (flag) {
        var hotspotArr = this.krpano.get("hotspot").getArray(),
            i;
        for(i in hotspotArr) {
            if(hotspotArr[i].hotspot_type) {
                hotspotArr[i].visible = flag;
            }
        }
    };

    /**
     * 热点注册对象
     * @param hotspotType   将要注册的热点类型
     * @param opt           热点的属性，如果含有opt.data，则根据data的属性直接生成热点，
     * @constructor
     */
    function RegisterHotspot (hotspotType, opt) {
        if (!hotspotType) return YP.error("必须输入hotspotType");
        opt = opt || {};
        this.hotspotList = [];
        this.hotspotType = hotspotType;
        //如果注册的数据存在data，则先根据data内的数据初始化相应热点
        this.option = opt;
        opt.data && this.init(opt);
    }

    var foo = RegisterHotspot.prototype;

    /**
     * 根据data数组生成热点
     * @param opt  初始化的热点数据
     */
    foo.init = function (opt) {
        var dataArr = opt.data;
        opt.data = undefined;
        for(var i in dataArr) {
            //初始化的热点不调用onAddHotspot事件,将onAddHotspot置为空方法
            this.addHotspot( $.extend(true, {data:{}}, opt, dataArr[i], {callback:{onAddHotspot:function(){}}}));
        }
    };
    /**
     * 添加热点
     * @param opt   热点的属性
     * @returns {Hotspot}   热点对象
     */
    foo.addHotspot = function (opt) {
        var hotspot;
        opt = opt || {};
        opt.hotspotType = this.hotspotType;
        opt = $.extend(true, {}, defaultOptions , this.option, opt );
        //生成一个热点
        hotspot = new Hotspot(opt);

        this.hotspotList.push(hotspot);

        return hotspot;
    };

    /**
     * 获取热点
     * @param name  当name为null时,返回当前热点类型的所有热点，
     *              当name有值时,返回当前热点类型下名字为name的hotspot对象
     * @returns {Array|hotspot}
     */
    foo.getHotspot = function (name) {
        var hsArr = this.hotspotList, i;
        if(name){
            for(i in hsArr){
                if(name == hsArr[i].name){
                    return hsArr[i];
                }
            }
            return YP.error("未找到热点，name=",name);
        }
        return hsArr;

    };



    /**
     * 设置热点样式
     * @param _this Hotspot对象
     * @param name  style的名字，如果为object必须带有name属性
     */
    function setSytle (_this,name) {
        if (typeof name === "object" ) {
            name = name.name;
        }
        if (typeof name === "string" && funs.yp.method.icon.getIcon(name)) {
            _this.hotspot.loadstyle(name);
        }else if(typeof name === "number"){
            name = funs.yp.method.icon.getStyle(name);
            _this.hotspot.loadstyle(name.name);
        }
        else  {
            YP.error("未找到style=",name);
        }
    }

    //绑定事件
    function bindHotspotEvent (type,_this) {
        var fn = _this.option.callback[type];
        if(fn && typeof fn === "function"){
            return fn.bind(_this,_this.getData())
        }
    }

    //调用事件
    function onHotspotEvent (type,_this) {
        var fn = _this.option.callback[type];
        if(fn && typeof fn === "function"){
            fn.call(_this,_this.getData())
        }
    }

    //热点对象
    function Hotspot(opt) {
        var _this = this,
            krpano = opt.krpano,
            ath = opt.ath,
            atv = opt.atv,
            h;
        this.yp = opt.yp;
        this.option = opt;
        if(!opt.name) {
            do{
                //创建随机名字
                this.name = YP.random(10);
            }while(krpano.get("hotspot["+this.name+"]"))
        }

        //根据偏移量计算最终位置
        if ( (!ath && ath !== 0) && (!ath && ath !== 0) ) {
            //此时ath与atv同时未设置
            krpano.call("adjusthlookat(view.hlookat)");
            ath = krpano.view.hlookat;
            atv = krpano.view.vlookat;
            var view_now = krpano.spheretoscreen(krpano.view.hlookat, krpano.view.vlookat),
                common_x = opt.x || 0,
                common_y = opt.y || 0;

            if (common_x || common_y) {
                var view_new = krpano.screentosphere(common_x, common_y);

                ath = view_new.x;
                atv = view_new.y;
            }
        } else {
            //此时ath与atv其中某一个设置了值另一个为undifend,将undifend设置为0
            ath = ath || 0;
            atv = atv || 0;
        }

        if(typeof opt.element === "function"){
            this.element = $(opt.element(opt.data));
        } else {
            this.element = $(opt.element).clone(true);
        }
        this.data = opt.data || {};
        h = this.hotspot = krpano.addhotspot(this.name);
        h.align = opt.align;
        h.ath = ath;
        h.atv = atv;
        h.hotspot_type = opt.hotspotType;
        if (opt.style) {
            setSytle(this,opt.style);
        }else {
            h.url = opt.url;
        }

        if (this.element) {
            $(h.sprite).append(this.element);
        }

        if(!this.option.isMove){
            h.capture = false;
        }

        //调用loaded事件
        onHotspotEvent("onLoaded",_this);
        //调用热点添加事件
        onHotspotEvent("onAddHotspot",_this);
        h.onclick = bindHotspotEvent("onClick",this);
        h.onover = bindHotspotEvent("onOver",this);
        h.onout = bindHotspotEvent("onOut",this);
        h.onhover = bindHotspotEvent("onHover",this);
        h.ondown = function () {
            h.zorder++;
            onHotspotEvent("onDown",_this);
            if (_this.option.isMove) {
                if (!_this.pressed) {
                    //记录第一次按下时鼠标坐标位置
                    _this.dragx = krpano.mouse.stagex;
                    _this.dragy = krpano.mouse.stagey;
                    _this.pressed = true;
                }
                krpano.call("callwith(hotspot[" + _this.hotspot.name + "], skin_hotspot_drag());");
            }

        };
        h.onup = function () {
            h.zorder--;
            onHotspotEvent("onUp",_this);
            //判定当前鼠标位置与第一次按下时的位置
            if (_this.pressed) {
                if(_this.dragx != krpano.mouse.stagex || _this.dragy != krpano.mouse.stagey){
                    onHotspotEvent("onMoveUpdate",_this);
                }
                //清零
                _this.pressed = false;
                _this.dragx = _this.dragy = 0;
            }
        };

    }


    var fn = Hotspot.prototype;
    /**
     * 设置热点是否移动
     * @param flag  boolean，当有值时设置值,没有时切换状态
     */
    fn.setMove = function (flag) {
        this.option.isMove = !!flag || !this.option.isMove;
    };

    /**
     * 更新热点
     * @param opt object
     */
    fn.update = function (opt) {
        opt = opt || {};
        if (opt.style !== undefined) {
            setSytle(this,opt.style);
        }
        if (opt.url) {
            //先清除热点原有样式
            this.hotspot.onloaded = undefined;
            this.hotspot.crop = undefined;
            this.hotspot.style = "";
            this.hotspot.url = opt.url;
        }
        if (opt.data) {
            this.data = opt.data;
        }

        onHotspotEvent("onUpdatestyle",this);
    };

    /**
     * 删除当前热点
     */
    fn.remove = function () {
        this.option.krpano.removehotspot(this.name);
        onHotspotEvent("onRemove",this);
    };

    /**
     * 设置层级
     */
    fn.zorder = function (flag) {
        if (flag) {
            this.hotspot.zorder = 101 + 100;
        } else {
            this.hotspot.zorder = 101;
        }
    };

    //上传热点，调用onSaveHotspot事件
    fn.save = function(data){
        onHotspotEvent("onSaveHotspot",this);
    };

    fn.getData = function(){
        var iconid;

        if(this.hotspot.style) {
            iconid = parseInt(this.yp.method.icon.getIcon(this.hotspot.style).iconid);
        }

        var data = {
            data:this.data,
            atv:this.hotspot.atv,
            ath:this.hotspot.ath,
            style:iconid,
            url:this.hotspot.url
        };
        return data;
    };



    //YP.extend.hotspot = YP.callback(funs);
    YP.addMethod("hotspot", funs);
})(window);
(function (window, undefined) {
    var funs = {};

    //获得全部style
    funs.get = function(url){
        var styles , i , s,temp = [];
        styles = this.krpano.get("style");
        if(!styles) return;

        for (i in styles.getArray()) {
            s = styles.getItem(i);
            if(url && s.url == url){
                return s;
            }
            s.packagename && temp.push(s);
        }
        if(url){
            return YP.error("未找到style，url=",url);
        }
        return temp;
    };

    funs.getIcon = function(name){
        var style = this.krpano.get("style["+name+"]");
        if(style && style.packagename) return style;
    };

    funs.getStyle = function(iconid){
        var styleName,s;
        var styles = this.krpano.get("style");
        if(!styles) return;
        for (i in styles.getArray()) {
            s = styles.getItem(i);
            if(iconid && s.iconid == iconid){
                return s;
            }
        }
    };

    funs.getIconPackage = function() {
        var self = this;
        function getHotspoturl(spot, style) {
            spot.name = style.name;
            spot.url = self.method.util.replaceUrl(style.url);
            spot.iconid = style.iconid;
            spot.hotspotstyle = style.hotspotstyle;
            spot.packagename = style.packagename;
            spot.status = style.status;

            if (style.thumb) {
                spot.thumb = self.method.util.replaceUrl(style.thumb);
            } else {
                spot.thumb = spot.url;
            }
            return spot;
        }

        var style = this.krpano.get("style").getArray();
        var iconpackageList = this.krpano.get("package").getArray();
        var newiconpackageList = [];
        var spotIconList = [];
        var spotGifList = [];

        for (var i = 0; i < this.krpano.get("style").count; i++) {
            var spot = {};
            if (style[i].name.indexOf("spoticon") > -1) {
                spot = getHotspoturl.call(this.krpano, spot, style[i]);
                if (spot && spot.status == 1) {
                    spotIconList.push(spot);
                }
            }

            if (style[i].name.indexOf("spotgif") > -1) {
                spot = getHotspoturl.call(this.krpano, spot, style[i]);
                if (spot && spot.status == 1) {
                    spotGifList.push(spot);
                }
            }
        }

        for (var n = 0; n < this.krpano.get("package").count; n++) {
            var newiconpackage = {};
            newiconpackage.name = iconpackageList[n].name;
            newiconpackage.title = iconpackageList[n].title;
            newiconpackage.id = iconpackageList[n].id;
            newiconpackage.thumb = iconpackageList[n].thumb;

            var styleList = [];
            for (var j = 0; j < spotIconList.length; j++) {
                if (iconpackageList[n].name == spotIconList[j].packagename) {
                    styleList.push(spotIconList[j]);
                }
            }
            for (var x = 0; x < spotGifList.length; x++) {
                if (iconpackageList[n].name == spotGifList[x].packagename) {
                    styleList.push(spotGifList[x]);
                }
            }

            newiconpackage.styleList = styleList;

            newiconpackageList.push(newiconpackage);
        }
        return newiconpackageList;
    }


    YP.addMethod("icon", funs);

})(window);
(function (window, undefined) {
    function Login() {

    }

    var funs = Login.prototype;

    funs.isLogin = function () {
        return this.info ? true : false;
    };


    funs.init = function () {
        var _this = this;

        this.yp.proxy.getLoginInfo({
            async: false
        }, function (data) {
            if (data.success) {
                _this.info = data.data;
            }
            //else if (dialog) {
            //    this.loginDialog();
            //}
        });
    };

    YP.addMethod("login", Login);
})(window);
(function (window, undefined) {
    var list = {},
        initXml = false,
        currRadar = 0;

    var DEFAULT_OPTIONS = {
        move: false,
        element: undefined,
        style: {
            width: 1000,
            height: 500,
            bgAlpha: 0.8,
            bgColor: 0x000000
        },
        radar: {
            move: false,
            editHeading: false
        },
        callback: {
            onMapAdd: undefined,
        },
        data: []
    };

    var DEFAULT_OPTIONS_RADAR = {
        scene: undefined,
        x: 0,
        y: 0,
        heading: 0
    };

    function Maps(options, funs) {
        this.krpano = funs.krpano;
        this.method = funs.yp.method;
        this.setting = funs.setting;
        this.yp = funs.yp;

        this.init(options, funs);
    }

    var fn = Maps.prototype;

    fn.init = function (options, funs) {
        if (!options.element) {
            YP.error("参数错误");
            return;
        }

        this.options = $.extend(true, {}, DEFAULT_OPTIONS, options);

        //jquery的extend会将list转化为object,为了在后面代码中可以使用push方法.
        if (!(this.options.data instanceof Array)) {
            var data = this.options.data;
            this.options.data = [];
            for (var i in data) {
                this.options.data.push(data[i]);
            }
        }

        this.element = this.options.element;
        this.mapsType = this.options.mapsType;
        this.createdMap(this.options);
        this.element.width(this.options.style.width);
        this.element.height(this.options.style.height);
        this.element.css("overflow", "hidden")
        this.element.append(this.pluginBg.sprite);

        if (this.options.data) {
            for (var i in this.options.data) {
                var map = this.options.data;
                this.plugin.url = this.options.data.url;
            }
        }
    };

    fn.getPlugin = function (name) {
        return this.krpano.get("plugin[" + name + "]");
    };

    /**
     * 创建地图
     */
    fn.createdMap = function () {
        //背景
        this.pluginBg = this.krpano.addplugin(random(10));
        this.pluginBg.width = this.options.style.width;
        this.pluginBg.height = this.options.style.height;
        //this.pluginBg.align = "center";
        //this.pluginBg.edge = "center";
        this.pluginBg.bgalpha = this.options.style.bgAlpha;
        this.pluginBg.bgColor = this.options.style.bgColor;
        this.pluginBg.loadstyle("default_maps_bg");

        //图片
        var name = random(10);
        var plugin = this.plugin = this.krpano.addplugin(name);
        this.plugin.parent = this.pluginBg.name;
        this.plugin.is_move = this.options.move;
        this.plugin.loadstyle("default_maps");
        this.currRadar;
        this.plugin.maps = this.maps = [];

        for (var j in this.options.data) {
            var data = this.options.data[j];
            var map = $.extend({}, data);

            map.radars = [];

            this.maps.push(map);
        }

        this.initData(0);
    };

    fn.initData = function (i) {
        if (!this.options.data[i]) {
            return;
        }

        this.loading = this.loading || $("<div/>").append(this.method.util.loading()).css({
                "position": "absolute",
                "width": "100%",
                "background-color": "rgba(0, 0, 0, 0.42)",
                "height": "100%",
                "z-index": 9999
            });

        this.element.append(this.loading).css({position: "relative"});
        if (this.options.data.length <= i) {
            return;
        }

        var mapDate = this.options.data[i];

        if (this.options.data[i].init == true || !mapDate) {
            return;
        }

        //垃圾数据
        if (!mapDate.url) {
            logger.warn("图片未找到");
        }
        console.log(this.maps[i]);

        this.currMap = this.maps[i];
        this.options.data[i].init = true;

        this.plugin.loadmaps = function () {
            if (this.loading) {
                this.loading.remove();
                this.loading = undefined;
            }

            for (var j in mapDate.radars) {
                var radarDate = mapDate.radars[j];

                if (!(radarDate.scene && this.method.scene.getScene(radarDate.scene))) {
                    logger.warn("热点初始化失败,未找到scene=" + radarDate.scene);
                    return;
                }

                //添加热点, 并设置当前的热点数据
                var radar = new Radar(this, $.extend(true, {}, radarDate));

                //选择当前场景
                if (radar.scene == this.method.scene.getCurrScene().name) {
                    radar.active();
                }
            }

            this.activeMap(this.maps[i]);
        }.bind(this);

        this.krpano.call("callwith(plugin[" + this.plugin.name + "], loadmaps);");
        this.plugin.onloaded = "skin_maps_onloaded()";
        this.plugin.url = this.currMap.url;
    };

    fn.addMap = function (data) {
        if (!data.url || !data.name) {
            throw new Error("创建平面地图失败,参数错误 url=" + data.url + ", data.name" + data.name);
        }

        this.options.data.push(data);
        var map = $.extend({}, data);
        map.radars = [];

        this.maps.push(map);

        this.activeMap(map);
        this.callwith("onMapsAdd", map);
    };

    fn.removeMap = function (map) {
        var index = this.maps.indexOf(map);

        if (map == this.currMap) {
            if (this.maps.length > 1) {
                if (index != 0) {
                    this.activeMap(this.maps[0]);
                } else {
                    this.activeMap(this.maps[1]);
                }
            }
        }

        this.maps.splice(index, 1);
    };

    fn.removeRadar = function () {
        if (this.currMap && this.currRadar) {
            this.currRadar.remove();
        } else {
            YP.error("未选择热点");
            //throw new Error("未选择热点");
        }

    };

    fn.callwith = function (type, data) {
        if (this.options.callback && typeof this.options.callback[type] === "function") {
            this.options.callback[type].call(this, data);
        }
    };

    /**
     * 选中当前地图
     * @param map
     */
    fn.activeMap = function (map) {
        var index = this.maps.indexOf(map);

        this.unActiveMap();

        if (!this.options.data[index].init) {
            this.initData(index);
            return;
        }

        this.plugin.url = map.url;
        this.currMap = map;

        for (var i in this.currMap.radars) {
            var radar = this.currMap.radars[i];
            radar.plugin.visible = true;
        }

        this.activeByScene();
    };

    fn.unActiveMap = function () {
        for (var i in this.maps) {
            for (var j in this.maps[i].radars) {
                var radar = this.maps[i].radars[j];
                radar.plugin.visible = false;
                radar.unActive();
            }
        }
    };

    fn.activeByScene = function () {
        for (var i in this.currMap.radars) {
            var radar = this.currMap.radars[i];

            if (this.method.scene.getCurrScene().name == radar.scene) {
                radar.active();
            }
        }
    };

    fn.getMaps = function () {
        return this.maps;
    };

    /**
     * 重新设置地图的高宽
     * @param width 高
     * @param height 宽
     */
    fn.resize = function (width, height) {
        this.pluginBg.width = this.options.style.width = width;
        this.pluginBg.height = this.options.style.height = height;
        this.plugin.onloaded = "skin_maps_onloaded()";
        this.krpano.call("callwith(plugin[" + this.plugin.name + "], onloaded)");
    };

    /**
     * 添加热点
     * @param flag 是否选中, 默认选中
     * @returns {Radar} 热点对象
     */
    fn.addRadar = function (flag, data) {
        var option = {
            scene: this._getNotUseScene()
        };

        if (!option.scene) {
            return;
        }

        var radar = new Radar(this, $.extend(true, {}, option, data));

        if (typeof flag === "undefined" ? true : flag)radar.active();

        radar.callwith("onRadarAdd");

        return radar;
    };

    fn._getNotUseScene = function (name) {
        var isScene = function (name) {
            if (this.currMap.radars.length == 0) {
                return name;
            }

            for (var j in this.currMap.radars) {
                if (this.currMap.radars[j].scene == name) {
                    return;
                }
            }

            return name;
        }.bind(this);

        if (name) {
            return isScene(name);
        }

        var currScene = isScene(this.method.scene.getCurrScene().name);

        if (currScene) {
            return currScene;
        }

        for (var i in this.method.scene.getScene()) {
            var scene = this.method.scene.getScene()[i];
            currScene = isScene(scene.name);

            if (currScene) {
                return currScene;
            }
        }

        YP.error("一个平面地址只能有一个场景热点");
        return;
        //throw new Error("一个平面地址只能有一个场景热点");
    };

    function random(length) {
        return YP.random(length);
    }

    /**
     * 热点
     * @param map 当前地图
     * @constructor
     */
    function Radar(map, data) {
        var self = this;
        this.map = map;
        this.method = map.method;
        this.options = map.options.radar;
        this.krpano = map.krpano;
        this.plugin = this.krpano.addplugin(random(10));
        this.plugin.keep = true;
        this.plugin.scalechildren = true;
        map.currMap.radars.push(this);
        this.heading = 0;
        this.plugin.scale = map.plugin.radar_scale;

        if (this.plugin.scale && this.plugin.scale != 1) {
            this.plugin.x = map.plugin.width / 2;
            this.plugin.y = map.plugin.height / 2;
        } else {
            //设置热点在当前框的中间
            this.plugin.x = map.pluginBg.width / 2 - (map.plugin.x ? map.plugin.x : 0);
            this.plugin.y = map.pluginBg.width / 2 - (map.plugin.y ? map.plugin.y : 0);

            //防止超出
            if (this.plugin.x > map.plugin.width) {
                this.plugin.x = map.plugin.width;
            } else if (this.plugin.x < 0) {
                this.plugin.x = 0;
            }

            if (this.plugin.y > map.plugin.height) {
                this.plugin.y = map.plugin.height;
            } else if (this.plugin.y < 0) {
                this.plugin.y = 0;
            }
        }

        this.plugin.loadstyle("mapspot");
        this.plugin.parent = map.plugin.name;
        this.activespot = this.krpano.get("layer[activespot]");
        this.radar = this.options.editHeading ? this.krpano.get("layer[editradar]") : this.krpano.get("layer[radar]");
        //this.radar = this.krpano.get("layer[editradar]");
        this.round = this.krpano.get("layer[maps_round]");
        this.point = this.krpano.get("layer[maps_point]");
        this.mapsBg = this.krpano.get("layer[maps_bg]");
        this.plugin.ondown = "skin_maps_draglayer()";
        this.plugin.is_move = this.options.move;
        this.setDate(data);

        this.plugin.onclick = function () {
            self.active();
        };
    }

    var fnR = Radar.prototype;

    fnR.changeScene = function (name) {
        var scene = this.map._getNotUseScene(name);

        if (scene) {
            this.setDate({scene: name});

            if (this == this.map.currRadar) {
                this.method.scene.getCurrScene().name != this.scene && this.method.scene.loadScene(this.scene);
            }

            this.callwith("onRadarChange");
            //this.active();
        } else {
            YP.error("该热点已有,请重新选择");
            //throw new Error("改热点已有,请重新选择");
        }
    };

    fnR.callwith = function (type, data) {
        if (this.map.options.callback && typeof this.map.options.callback[type] === "function") {
            this.map.options.callback[type].call(this, data || this.getData());
        }
    };

    fnR.remove = function () {
        var index = this.map.currMap.radars.indexOf(this.currRadar);
        this.map.currMap.radars.splice(index, 1);
        this.unActive();

        this.krpano.removeplugin(this.plugin.name);
        this.callwith("onRadarRemove");
    };

    /**
     * 选择热点
     */
    fnR.active = function () {
        var self = this;

        //取消之前选择状态.
        if (this.map.currRadar) {
            this.map.currRadar.unActive();
        }

        this.method.scene.getCurrScene().name != this.scene && this.method.scene.loadScene(this.scene);

        this.activespot.parent = this.plugin.name;
        this.setEvent(this.activespot);
        this.activespot.visible = true;

        this.radar.parent = this.plugin.name;
        this.radar.heading = this.heading;
        this.radar.visible = true;
        this.map.currRadar = this;
        this.plugin.zorder = 2;
        this.setEvent(this.round);

        if (this.options.editHeading) {
            this.round.visible = true;
            this.point.visible = true;
            this.mapsBg.visible = true;

            this.round.parent = this.radar.name;
            this.mapsBg.parent = this.plugin.name;

            //传递事件
            $(this.point.sprite).mousedown(function (event) {
                self.triggerRadar("mousedown", event);
                self.editRadar(true);
            }).mouseup(function (event) {
                self.triggerRadar("mouseup", event);
                self.editRadar(false);
            }).mousemove(function (event) {
                self.triggerRadar("mousemove", event);
            });

            window.radar["mousemove"] = function (heading) {
                this.map.currRadar._setRoundHeading.call(this, heading);
            }.bind(this);

            window.radar["mouseup"] = function (heading) {
                this.map.currRadar.setDate({heading: heading})
            }.bind(this);
        } else {
            this.round.visible = false;
            this.point.visible = false;
            this.mapsBg.visible = false;
        }
    };

    fnR.unActive = function () {
        this.activespot.visible = false;
        this.radar.visible = false;
        this.round.visible = false;
        this.point.visible = false;
        this.mapsBg.visible = false;
        this.plugin.zorder = 1;

        this.map.currRadar = undefined;
    };

    /**
     * 设置角度
     * @param heading
     * @private
     */
    fnR._setRoundHeading = function (heading) {
        this.round.rotate = heading + this.radar.headingoffset;
        this.heading = heading - this.krpano.get("view.hlookat");
    };

    /**
     * 设置是否编辑
     * @param flag true:是  false:否
     */
    fnR.editRadar = function (flag) {
        this.radar.editmode = flag && this.options.editHeading ? true : false;
    };

    /**
     * 触发事件
     * @param type 事件类型
     * @param event 事件对象
     */
    fnR.triggerRadar = function (type, event) {
        //触发js事件
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent(type, true, true, window, document.defaultView, event.screenX, event.screenY, event.clientX, event.clientY, false, false, false, false, 0, null);
        this.krpano.get("layer[editradar]").child.path.dispatchEvent(e);
    };

    /**
     * 传递时间给点, 可以移动
     * @param dom 传递的对象
     * @param name 传递给谁 默认:this.plugin.name
     */
    fnR.setEvent = function (dom, name) {
        name = name ? name : this.plugin.name;
        dom.ondown = "set(plugin[" + name + "].pressed, true); callwith(plugin[" + name + "], ondown);"
        dom.onup = "delete(plugin[" + name + "].pressed)";
    };

    /**
     * 获取当前热点的数据
     */
    fnR.getData = function () {
        var data = this.data;

        data.scene = this.scene;
        data.x = this.plugin.x;
        data.y = this.plugin.y;
        data.heading = this.heading;

        return data;
    };

    fnR.setDate = function (data) {
        if (!data)return;
        this.scene = data.scene ? data.scene : this.scene;
        this.plugin.x = typeof data.x === "number" ? data.x : this.plugin.x;
        this.plugin.y = typeof data.y === "number" ? data.y : this.plugin.y;
        this.radar.currheading = this.heading = typeof data.heading === "number" ? data.heading : this.heading;
        this.data = $.extend(true, {}, this.data, data);
    };

    function Map() {
    }

    Map.xml = codePath + "/plugins/xml/maps.xml";

    var funs = Map.prototype;

    funs.get = function (mapsType) {
        return list[mapsType];
    };

    funs.register = function (mapsType, options) {
        if (!list[mapsType]) {
            options.mapsType = mapsType;
            list[mapsType] = new Maps(options, this);
        }

        return this.get(mapsType);
    };

    funs.init = function () {
    };

    YP.addMethod("maps", Map);
})(window);
(function (window, undefined) {
    var funs = {},
    isStop = false;

    funs.play = function (data) {
        if (data == null) {
            //判定播放列表，存在则暂停当前播放
            if (this.krpano.musicData == null || isStop == true) return;
            this.pause();
        } else if (data && data.length > 0) {
            //更新播放列表
            this.stopMusic();
            this.krpano.musicData = data;
            this.krpano.musicIndex = 0;
            this.krpano.call("playsound(bgsnd0,'" + data[0].url + "', 1 , replay() )");
        }

        isStop = true;
    };

    funs.pause = function () {
        isStop = false;
        this.krpano.call("pausesoundtoggle(bgsnd" + this.krpano.musicIndex + ")");
    };

    funs.stopMusic = function () {
        this.krpano.call("stopallsounds(true)");
    };

    funs.xml = codePath + "/plugins/xml/music.xml";

    funs.init = function () {
        if (this.settings && this.settings.switch_music == "false") {
            this.pause();
        }
    };

    YP.addMethod("music", funs);

})(window);
(function (window, undefined) {
    var funs = {};

    /**
     * 设置补天/地图片
     * @param pic   显示的图片地址
     * @param url   单击后跳转地址
     * @param skyFlag   true表示设置补天，false表示设置补地
     */
    funs.set = function (pic, url, skyFlag) {
        this.krpano.call("skin_set_nadir(" + pic + "," + url + "," + skyFlag + ")");
    };

    funs.get = function () {
        var v = {};

        //查询补地
        v.urlLand = this.settings.nadirlogo_land_url;
        v.linkLand = this.settings.nadirlogo_land_open_url;
        v.isOpneLand = this.settings.nadirlogo_land === "true" ? true : false;

        //查询补天
        v.urlSky = this.settings.nadirlogo_sky_url;
        v.linkSky = this.settings.nadirlogo_sky_open_url;
        v.isOpneSky = this.settings.nadirlogo_sky === "true" ? true : false;

        return v;
    };

    /**
     * 显示/隐藏 补天/地 图片
     * @param flag  true显示，false隐藏
     * @param skyFlag
     */
    funs.swith = function (flag, skyFlag) {
        this.krpano.call("skin_nadirlogo_swith_visible(" + flag + "," + skyFlag + ")");
    };

    funs.resize = function (skyFlag) {//重置补地图片
        this.krpano.call("skin_nadirlogo_resize(" + skyFlag + ")");
    };

    funs.getDefault = function () {//获取默认logo和link
        return {url: this.settings.nadirlogo_default_url, link: this.settings.nadirlogo_default_open_url};
    };

    funs.xml = codePath + "/krpano/skin/plugin/nadirlogo.xml";

    YP.addMethod("nadir", funs);
})(window);

(function (window, undefined) {
    var funs = {};

    funs.getScene = function (name) {
        return name ? this.krpano.get("scene[" + name + "]") : this.krpano.get("scene").getArray()
    };

    funs.getCurrScene = function () {
        return this.krpano.get("scene[get(xml.scene)]");
    };

    funs.loadScene = function (name) {
        this.krpano.call("skin_load_scene(" + name + ");");
    };

    YP.addMethod("scene", funs);

})(window);
(function (window, undefined) {
    var DEFAULT_OPTION = {
        callback: {
            onSceneAdd: undefined,
            onSceneRemove: undefined
        },
        data: undefined
    };

    function Scene(option) {
        this.option = $.extend(true, {}, DEFAULT_OPTION, option);
        this.data = {};
    }

    var funs = Scene.prototype;

    funs.setData = function (data) {
        this.data = data || this.data;
    };

    funs.getScene = function (name) {
        if (name) {
            for (var i in this.data) {
                if (this.data[i].name == name) {
                    return this.data[i];
                }
            }
        } else {
            return this.data;
        }
    };

    funs.getCurrScene = function () {
        return this.krpano.get("scene[0]");
    };

    funs.loadScene = function (name) {
        var scene = this.getScene(name);

        scene && this.krpano.call("skin_load_pano(" + scene.xml + ");");
    };

    funs.addScene = function (scene) {
        this.data.push(scene);

        this.callwith("onSceneAdd", scene);
        this.yp.events.onaddscene();
    };

    funs.removeScene = function (scene) {
        var index = this.data.indexOf(scene);

        if (index > -1) {
            this.data.splice(index, 1);

            this.yp.events.onremovescene();

            this.callwith("onSceneRemove", scene);
        } else {
            YP.error("删除全景失败,未找到改全景");
        }
    };

    funs.callwith = function (type, data) {
        if (this.option.callback && typeof this.option.callback[type] === "function") {
            this.option.callback[type].call(this, data);
        }
    };

    YP.addMethod("scene", Scene);
})(window);
(function (window, undefined) {
    var funs = {},
        pluginName = "snow",
        DEFALUE = {
            mode: "rain",
            imageurl: "",
            imagescale: "1",
            flakes: "1500",
            color: "0xFFFFFF",
            floor: "0.7",
            speed: "1.0",
            spreading: "1",
            shake: "4.0",
            speedvariance: "2.0",
            wind: "3",
            winddir: "0",
            rainwidth: "1",
            rainalpha: "1",
            visible: true
        };

    funs.switch = function (flag) {
        this.plugin.visible = flag;
    };

    /**
     * 设置特效
     *
     * @param effectObj 基本参数
     * @param size 速率,计算大中小   1:小,2:中,3大
     */
    funs.set = function (effectObj, size) {
        this.initPlugin();
        if (typeof effectObj === "object" && effectObj.mode) {
            this.options = $.extend(true, {}, DEFALUE, effectObj);
        } else if (typeof effectObj === "string") {
            this.options = $.extend(true, {}, DEFALUE, {mode: "image", imageurl: effectObj});
        } else {
            logger.warn("特效,参数错误");
            this.switch(false);
            return;
        }

        if (this.options.mode == "image" && !this.options.imageurl) {
            logger.warn("特效,参数错误");
            this.switch(false);
            return;
        }

        if (!this.options.isuse) {
            this.switch(false);
            return;
        }      

        if (3 >= size && size > 0) {
            this.options.flakes = (this.options.mode == "image" ? 1000 : 1500) * size;
            this.options.speed = size * size + 1;
            this.options.wind = 1 * size;
        } else if (size = 0) {
            this.switch(false);
        } else if (size) {
            logger.warn("特效,参数错误");
            this.switch(false);
            return;
        }

        $.extend(this.plugin, this.options);
    };
    funs.get = function () {
        var resObj = {};

        for (var i in DEFALUE) {
            resObj[i] = this.plugin[i];
        }

        return resObj;
    };

    funs.initPlugin = function () {
        yp.krpano.removeplugin(pluginName);
        this.plugin = this.krpano.addplugin(pluginName);

        this.plugin.url = "%SWFPATH%/plugins/snow.js";
        this.plugin.keep = true;
        this.plugin.visible = false;
    };

    YP.addMethod("effect", funs);

})(window);

(function (window, undefined) {
    var funs = function () {
    }.prototype;

    funs.include = function (url) {
        this.files = this.files || [];

        if (typeof url === "string" && this.files.indexOf(url) < 0) {
            this.files.push(url);
            this.krpano.call("loadxml('<krpano><include url=\"" + url + "\" /></krpano>')");
        }
    };

    funs.createItem = function (addName, name) {
        if (typeof this.krpano[addName].createItem != "function" || typeof this.krpano[addName].getArray != "function") {
            return;
        }

        var obj = this.krpano[addName].createItem(name);
        obj.keep = true;
        //this.krpano[addName].getArray().push(obj);

        return obj;
    };

    funs.switchAutorotate = function(flag) {
        this.krpano.call("set(skin_settings.switch_autorotate,"+flag+")");
        this.krpano.get("autorotate[spin]").enabled = flag;
    };


    funs.replaceUrl = function(url) {
        //return url.replace("pano/%SWFPATH%" ,"http://ypano.duc.cn/krpano");
        if (url && url.indexOf("%SWFPATH%") > -1) {
            var reg = new RegExp("^.*%SWFPATH%");
            var basePath = "/krpano";
            return basePath + url.replace(reg, "");
        } else if (url && url.indexOf("%BASEDIR%") > -1) {
            var reg = new RegExp("^.*%BASEDIR%");
            var basePath = "/";
            return basePath + url.replace(reg, "");
        } else {
            return url;
        }
    }

    funs.loading = function(){
        return $('<div class="loading"><div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div>');
    };

    funs.browser = function() {
        var u = navigator.userAgent,
            app = navigator.appVersion;
        return { //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/) && !(u.indexOf('iPad') > -1), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        }
    };

    funs.hasTouch = function() {
        var touchObj = {};
        touchObj.isSupportTouch = "ontouchend" in document ? true : false;
        touchObj.isEvent = touchObj.isSupportTouch ? "touchstart" : "click";
        return touchObj.isEvent;
    };

    funs.isTouch = function() {
        var touchObj = {};
        touchObj.isSupportTouch = "ontouchend" in document ? true : false;
        return touchObj.isSupportTouch;
    };

    funs.strLength = function(str) {
        if(!str)　return 0;　
        var strlen = 0;　　　　
        for (var i = 0; i < str.length; i++) {　　　　　　
            if (str.charCodeAt(i) > 255) {
                strlen += 2;　　
            } else {　
                strlen++;　　　　　　　
            }　　　　
        }　　　　
        return strlen;
    };

    YP.random = function (length) {
        var result = [];
        for (var i = 0; i < length; i++) {
            var ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
            //大写字母'A'的ASCII是65,A~Z的ASCII码就是65 + 0~25;然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里
            result.push(String.fromCharCode(97 + ranNum));
        }

        return result.join("");
    };

    //YP.extend.util = YP.callback(funs);
    YP.addMethod("util", funs);

})(window);


(function(window, undefined) {

    var funs = {};
    var onexitvrs = [];
    var onentervrs = [];

    funs.init = function () {
        var webVR = this.krpano.get("plugin[WebVR]"),
            _this = this;
        webVR.onentervr = function () {
            var hotspots = _this.yp.krpano.get("hotspot");
            _this.krpano.call("webvr_onentervr(); vr_menu_setvisibility(true);");

            for(var i in hotspots.getArray()) {
                var hotspot = hotspots.getItem(i);
                if(hotspot.hotspot_type == "links" || hotspot.name.indexOf("skin_nadirlogo") !== -1){
                    hotspot.distorted = true;
                    hotspot.depth = 5000;
                    hotspot.vr_timeout = 1000;
                    hotspot.oy = 0;
                    hotspot.scale = 5;
                }
            }

            for(var i in onentervrs){
                if(typeof onentervrs[i] === "function"){
                    onentervrs[i]();
                }
            }
        };
        webVR.onexitvr = function () {
            var hotspotArr = _this.yp.krpano.get("hotspot").getArray(),
                tempHotspot = [],
                hotspot,i;
            _this.krpano.call("webvr_onexitvr(); end_vr(vr_menu_setvisibility(false););");

            for(i in hotspotArr) {
                hotspot = hotspotArr[i];
                if(hotspot.hotspot_type == "links" || hotspot.name.indexOf("skin_nadirlogo") !== -1){
                    tempHotspot.push(hotspot);
                }
            }
            for(i in tempHotspot) {
                hotspot = tempHotspot[i];
                hotspot.distorted = hotspot.hotspot_type == "links"? false : true;
                hotspot.depth = 1000;
                hotspot.vr_timeout = undefined;
                hotspot.oy = 0;
                hotspot.scale = 1;
            }

            for(var i in onexitvrs){
                if(typeof onexitvrs[i] === "function"){
                    onexitvrs[i]();
                }
            }
        }
    };

    funs.on = function(type, fun){
        if(type == "exitvr"){
            onexitvrs.push(fun);
        } else if(type == "entervr"){
            onentervrs.push(fun);
        }
    }

    funs.remove = function(type, fun){
        if(type == "exitvr"){
            var index = onexitvrs.indexOf(fun);

            if(index > -1){
                onexitvrs.splice(index, 1);
            }
        } else if(type == "entervr"){
            var index = onentervrs.indexOf(fun);

            if(index > -1){
                onentervrs.splice(index, 1);
            }
        }
    }

    funs.enterVr = function () {
        return this.krpano.call("plugin[WebVR].enterVR()");
    };

    funs.xml = codePath + "/krpano/skin/plugin/webvr.xml";

    funs.exitVr = function (name) {
        return this.krpano.call("plugin[WebVR].exitVR()");
    };

    funs.onnewpano = function(){
        setTimeout(function(){
            var webVR = this.krpano.get("plugin[WebVR]");
            if(webVR.isenabled){
                webVR.onentervr();
            }
        }.bind(this), 1000);
    }

    YP.addMethod("webvr", funs);

})(window);

(function(window, undefined){
    var activityHtml = '<div id="xcrollc" class="xcrollc">\
                            <ul>\
                            <%for(var i in data) {%>\
                                <li>\
                                <%for(var j in data[i]["content"]) {%>\
                                    <%if (data[i]["content"][j]["image"]) {%><img src="<%=data[i]["content"][j]["image"]%>" class="picture" /><% } %>\
                                <%}%>\
                                    <p class="name"><%=data[i].name%></p>\
                                    <p class="time">日期:<%=data[i].startTime%>-<%=data[i].endTime%></p>\
                                <%for(var j = 0; j < data[i]["content"].length; j++) {%>\
                                    <%if (data[i]["content"][j]["content"]) {%><p class="neirong"><%=data[i]["content"][j]["content"]%></p>\<% } %>\
                                <%}%>\
                                </li>\
                            <%}%>\
                            </ul>\
                        </div>';
    
    var DEFAULT = {
    };

    function activity(option){
        this.option = $.extend(true, {}, DEFAULT, option);
    }
    
    var funs = activity.prototype;
    
    funs.init = function (data) {
        var yp = this.yp;
        if(!$.isEmptyObject(this.option.data) ) {
            var activity = $(template(activityHtml, {data:this.option.data}) );
            yp.element.append(activity);        
        }
    }
    
    YP.addPlugin("activity", activity);
})(window);
(function (window, undefined) {
    var hotspotArr = [];
    var hotComment;
    var hotspot;
    var flag = false;
    var currentHotspot;
    var porxy;
    var panoId;
    var i;
    var TEMPLATE = '<div class="comment">\
                        <div class="comment_bg">\
                            <div class="comment_pic">\
                                <img src="<%=avatar%>">\
                            </div>\
                            <div class="comment_content"><%=content%></div>\
                        </div>\
                        <i class="comment_line"></i>\
                    </div>';
    
    var temp = '<div class="comment_form">\
                    <div class="comment_form_centent">\
                        <textarea class="comment_form_content" placeholder="随便说点什么吧"></textarea>\
                    </div>\
                    <div class="comment_form_bottom">\
                        <button class="comment_form_btn comment_form_submit" type="submit">贴上</button>\
                        <button class="comment_form_btn comment_form_cancel" type="button">取消</button>\
                    </div>\
                </div>';
    
    var DEFAULT_OPTION = {
            align: "center",
            isMove: true,
            x: 0,
            y: 0,
            style: null,
            element: function(data){
                if(data.content) {
                    var html = $(template(TEMPLATE, data));
                    var strLen = this.yp.method.util.strLength(data.content);
                    var strWidth = strLen * 8 + 60;
                    if(data.isnew) {
                        html.find(".comment_bg").css({width:40}).animate({width:strWidth});
                    } else {
                        html.find(".comment_bg").css({"background-color":"rgba(0,0,0,.5)",width:40}).animate({width:strWidth});
                        html.find(".comment_bg").siblings(".comment_line").css("background-image","url(http://pano.panocooker.com/images/dingziCurr.png)")
                    }

                    return html;
                }

            },
            url:"http://pano.panocooker.com/krpano/skin/img/background.png",
            callback: {
                onLoaded:function(){
                    hotspotArr.push(this);
                },
                onAddHotspot:function(){
                    // hotspotArr.push(this);  
                    currentHotspot = this;
                }
                //onDown:function(){alert("onDown")},
                //onUp:function() {alert("onUp")},
                //onClick:function() {currentHotspot = this;alert("onClick");},
                //onOver:function(){alert("onOver")},
                //onOut:function(){alert("onOut")},
                //onHover:function(){alert("onHover")},
                //onMoveUpdate:function(){alert("onMoveUpdate")},
                //onUpdate:function(){alert("onUpdate")},
                //onUpdatestyle:function(){alert("onUpdatestyle")},
                //onRemove:function(){alert("onRemove")},
            },
            fromTemp: $(temp),
            formElement:$('body')
    };

    function Comments(option) {
        this.option = $.extend(true, {}, DEFAULT_OPTION, option);
        this.data = {};
    }

    var funs = Comments.prototype;
    
    // function element(data) {
    //  var html = $(template(TEMPLATE, data));
    //     var strLen = this.yp.method.util.strLength(data.content);
    //     var strWidth = strLen * 8 + 60;
    //     if(data.isnew) {
    //      html.find(".comment_bg").css({width:40}).animate({width:strWidth});
    //     } else {
    //      html.find(".comment_bg").css({"background-color":"rgba(0,0,0,.5)",width:40}).animate({width:strWidth});
    //      html.find(".comment_bg").siblings(".comment_line").css("background-image","url(http://pano.panocooker.com/images/dingziCurr.png)")
    //     }

    //  return html;
    // }
    
    funs.init = function (data) {
        //this.option.data = data;
        proxy = this.yp.proxy;
        panoId = this.yp.option.panoId;
        hotComment = this.comments = this.method.hotspot.register("comments", this.option);
        // this.onNewSceneData(this.option.data);
    };
    
     funs.addComment = function (opt) {
        if(!flag) {
            flag = true;
            var _this = this;
            var form = $("body");
            var Temp = this.option.fromTemp;
            hotspot = this.comments.addHotspot({
                data: {
                    "avatar": this.yp.method.login.info.avatar,
                    "content": "拖动到想要打标签的地方",
                    "isnew": true
                }
            });

            if(!!Temp.attr("style")){
                Temp.show();
            } else {
                form.append(Temp);
                Temp.find(".comment_form_content").focus(function(){
                    setTimeout(function(){
                        $(window).scrollTop($(window).height());
                    },500);
                });
                form.on('click',".comment_form_submit",function(){
                    flag = false;
                    var content = $(this).parents().find(".comment_form_content").val();
                    var str = $(this).parents().find(".comment_form_content").val().replace(/[^\x00-\xff]/g, 'xx');
                    if(str.length > 28){
                        alert("不能超过14中文字或28个字符");
                        return false;
                    } else if(content.length == 0){
                        alert("请输入评论");
                        return false;
                    }
                    hotspot.data.content = content;
                    $(hotspot.hotspot.sprite).html('').append(_this.option.element(hotspot.data));
                    $(".comment_form_content").val("");
                    $(".comment_bg").css("background-color","rgba(0,0,0,.5)");
                    $(".comment_line").css("background-image","url(http://pano.panocooker.com/images/dingziCurr.png)");
                    Temp.hide();
                    console.log(hotspot);
                    proxy.commentAdd({
                        sceneId: _this.yp.plugin.group.getCurrScene().id,
                        comment: content,
                        avatar: _this.yp.method.login.info.avatar,
                        ath: hotspot.hotspot.ath,
                        atv: hotspot.hotspot.atv,
                        mainPanoId: panoId,
                        async: false
                    }, function(data){
                        console.log(data);
                        if(!data.success) {
                            alert(data.errMsg);
                            _this.hotspotFn.removeHotspot();
                            return;
                        }
                        
                        id = data.id;
                    });

                })
                
                form.on('click',".comment_form_cancel",function(){
                    flag = false;
                    _this.removeComment();
                    $(".comment_form_content").val("");
                    Temp.hide();
                })
            }
            
            return hotspot;             
        }

    }
   
    funs.removeComment = function (hotspot) {
        var hotspot = hotspot || currentHotspot;
        for(var i in hotspotArr){
            if(hotspotArr[i] === hotspot){
                hotspotArr.splice(i,1);
            }
        }
        hotspot.remove();
    };


    // funs.onnewscene = function(sceneId) {
    //     var _this = this;
    //     var result;
    //     proxy.commentGet({
    //         mainPanoId: panoId,
    //         sceneId: yp.plugin.group.getCurrScene().id,
    //         async: false
    //     }, function(data) {
    //         if (!data.success) {
    //             alert(data.errMsg);
    //         } else {
    //             result = data;  
                
    //             for(var i=0,len = result.data.length;i<len;i++) {
    //                 var opt = {};
    //                 opt.ath = result.data[i].ath;
    //                 opt.atv = result.data[i].atv;
    //                 opt.id = result.data[i].id;
    //                 opt.data = {}
    //                 opt.data.avatar = result.data[i].avatar;
    //                 opt.data.comment = result.data[i].comment;
    //                 _this.comments.addHotspot(opt);
    //             }
    //         }
    //     })
    //     return result.data;
    // }

    funs.onNewSceneData = function(data){
        var _this = this;
        for(var i in data) {
            this.comments.addHotspot(data[i]);
        }

        // proxy.commentGet({
        //     mainPanoId: panoId,
        //     sceneId: this.yp.plugin.group.getCurrScene().id,
        //     pageIndex: 2,
        //     pageSize: 20,
        //     async: false
        // }, function(data) {
        //     if (!data.success) {
        //         alert(data.errMsg);
        //     } else {
        //         result = data;  
                
        //         for(var i=0,len = result.data.length;i<len;i++) {
        //             var opt = {};
        //             opt.ath = result.data[i].ath;
        //             opt.atv = result.data[i].atv;
        //             opt.id = result.data[i].id;
        //             opt.data = {}
        //             opt.data.avatar = result.data[i].avatar;
        //             opt.data.comment = result.data[i].comment;
        //             _this.comments.addHotspot(opt);
        //         }
        //     }
        // })
    }
    
    funs.onmoveupdate = function(data,hotspot){
        console.log(hotspot.id);
        if(hotspot.id){
            proxy.commentUpdate({
                atv:hotspot.atv,
                ath:hotspot.ath,
                id:hotspot.id
            },function(data){
                if(!data.success){
                    console.log(data.errMsg);
                    return;
                } else{
                    //msg("修改成功");
                }
            })
        }
    }
    

    funs.getComment = function (name) {
        return this.comments.getHotspot(name);
    };


    funs.switch = function (flag) {
        for(var i in hotspotArr){
            hotspotArr[i].hotspot.visible = flag;
        }
    };


    // funs.onNewSceneData = function (data) {
 //        var hotspotData = [];
 //        for(var i in data){
 //            opt = {
 //                atv :data[i].atv,
 //                ath :data[i].ath,
 //                style:data[i].style,
 //                data:data[i].data,
 //                //如果热点使用的是自定义的图片，需要下面两个参数
 //                url:data[i].url,
 //                crop:data[i].crop,
 //            };
 //            hotspotData.push(opt);
 //        }
 //        this.option.data = hotspotData;
 //        this.comments = this.method.hotspot.register("comments", this.option);
 //    };

    funs.onNewSceneCacheData = function () {
        this.cacheData = [];
        for(var i in hotspotArr) {
            var spotObj = hotspotArr[i].getData();
            this.cacheData.push(spotObj);
        }
        hotspotArr = [];
        return this.cacheData;
    };

    
    YP.addPlugin("comments", Comments);
})(window);
(function(window, undefined){
    var commodityHtml = '<div id="xcrollb" class="xcrollb">\
                            <ul>\
                            <%for(var i in data) {%>\
                                <li>\
                                    <%if (data[i].image) {%><img src="<%=data[i].image%>" class="picture" /><% } %>\
                                    <p class="name"><%=data[i].name%></p>\
                                    <p class="money">￥<%=data[i].minPrice %></p>\
                                </li>\
                            <%}%>\
                            </ul>\
                        </div>';
    
    var DEFAULT = {
    };

    function commodity(option){
        this.option = $.extend(true, {}, DEFAULT, option);
    }
    
    var funs = commodity.prototype;
    
    funs.init = function (data) {
        var yp = this.yp;
        if(!$.isEmptyObject(this.option.data) ) {
            var commodity = $(template(commodityHtml, {data:this.option.data}) );
            yp.element.append(commodity);    
      }
    }
    
    YP.addPlugin("commodity", commodity);
})(window);
(function(window, undefined){
    var contentHtml = '<div id="xcrolld" class="xcrolld">\
                            <div>\
                                <ul class="content">\
                                    <li><p class="p1">商家电话：</p><p class="p2"><%=data.tel%></p><a onclick=\"location.href=\'tel:<%=data.tel%>\'\">呼叫</a></li>\
                                    <li><p class="p1">商家地址：</p><p class="p2"><%=data.address%></p><a class="daohang">导航</a></li>\
                                </ul>\
                                <ul class="story">\
                                    <p class="p1">品牌故事:</P>\
                                    <%for(var i in data["content"]) {%>\
                                        <li>\
                                        <%if (data["content"][i]["story"]) {%><p class="p2"><%=data["content"][i]["story"]%></p><% } %>\
                                        <%if (data["content"][i]["img"]) {%><img src="<%=data["content"][i]["img"]%>"><% } %>\
                                        </li>\
                                    <%}%>\
                                </ul>\
                            </div>\
                        </div>';
    
    var DEFAULT = {
    };

    function content(option){
        this.option = $.extend(true, {}, DEFAULT, option);
    }
    
    var funs = content.prototype;
    
    funs.init = function (data) {
        var yp = this.yp;
        if(!$.isEmptyObject(this.option.data) ) {
            var content = $(template(contentHtml, {data:this.option.data}) );
            yp.element.append(content);         
        }
    }
    
    YP.addPlugin("content", content);
})(window);
(function (window, undefined) {
    var DEFAULT_OPTION = {
        count: true,
        url: "http://pano.panocooker.com/count/addCount"
    };

    function Count(option) {
        this.option = $.extend(true, {}, DEFAULT_OPTION, option);
        this.data = this.option.data;
    }

    var funs = Count.prototype;

    funs.getData = function () {
        return this.data;
    };

    funs.init = function () {
        this.yp.proxy.addUrl("count", this.option.url);

        if (this.option.count && this.yp.option.panoId) {
            this.yp.proxy.count({
                panoId: this.yp.option.panoId
            });
        }
    };

    YP.addPlugin("count", Count);
})(window);
(function (window, undefined) {
    var TEMPLATE = '<div class="sceneWrap">\
                        <div class="scene-all" id="xcrolla">\
                            <div>\
                            <%for(var i in data) {%>\
                                <ul class="scene-list">\
                                    <%for(var j in data[i].list) {%>\
                                        <li class="scen-list" data-name="<%=data[i].list[j].name%>">\
                                            <img src="<%=data[i].list[j].thumb%>" class="scenhot">\
                                            <p class="secname"><%=data[i].list[j].title%></p>\
                                        </li>\
                                    <%}%>\
                                </ul>\
                            <%}%>\
                            </div>\
                        </div>\
                        <div class="tabshow" id="xcroll">\
                            <div class="tabTagBox">\
                                <ul class="group tabTagList">\
                                    <%for(var i in data) {%>\
                                        <li class="group-list"><%=data[i].name%></li>\
                                    <%}%>\
                                </ul>\
                            </div>\
                        </div>\
                        <i class="btnPush"></i>\
                    </div>';

    var myScroll;
    var myScrolla;
    var html;
    var DEFAULT_OPTION = {
        template: TEMPLATE
    };

    function Scene(option) {
        this.option = $.extend(true, {},DEFAULT_OPTION, option);
    }

    var funs = Scene.prototype;

    funs.getScene = function (name) {
        return this.method.scene.getScene();
    };

    funs.getCurrScene = function () {
        return this.method.scene.getCurrScene();
    };

    funs.loadScene = function (name) {
        this.method.scene.loadScene(name)
    };

    funs.getGroup = function () {
        return this.option.data;
    };

    funs.addScene = function (scene) {
        return this.method.scene.addScene(scene);
    };

    funs.removeScene = function (scene) {
        return this.method.scene.removeScene(scene);
    };




    funs.init = function () {
        var _this = this;
        this.sceneList = [];

        for (var i in this.option.data) {
            this.sceneList = this.sceneList.concat(this.option.data[i].list);
        }

        this.method.scene.setData(this.sceneList);

        var data = this.yp.plugin.group.getGroup()
        html = $(template(this.option.template, {data:data}) );
        var element = this.option.element || this.yp.element ;
        element.append(html);
        
        $(".group-list:first").addClass("curr");
        var length = document.getElementsByClassName("group-list").length;
        if(length<2){
            $(".tabshow").hide();
        }

        this.onnewscene();


    };

    funs.onnewscene = function() {
        html.find("li").removeClass("active");
        html.find("li[data-name="+this.getCurrScene().name+"]").addClass("active");

        this.krpano.load_scene = this.loadScene.bind(this);

        var scenes = this.yp.method.scene.getScene();
        var sceneArray = [];
        for(var i=0;i<scenes.length;i++) {
            sceneArray[i] = this.yp.method.util.createItem("scene",scenes[i].name);
            sceneArray[i].name = scenes[i].name;
            sceneArray[i].thumburl = scenes[i].thumb;
        }
        this.krpano.call("loadscene_vr();");
    }

    YP.addPlugin("group", Scene);
})(window);
(function (window, undefined) {
    var HOTSPOT_TYPE = "hotspot",
        iconPackage,
        hotspotArr = [],
        currentHotspot,
        isMb,
        isTouch,
        TEMPLATE = "<div class='hotspot-element' >\
                        <div class='edit' >\
                            标题:<input class='title' type='text'><br>\
                            内容:<input class='content' type='text'><br>\
                            URL:<input class='url' type='text'><br>\
                            <button class='btn-save'>保存</button>\
                        </div>\
                        <button class='btn-delete'>删除</button>\
                        <button class='btn-edit'>编辑</button>\
                        <button class='btn-style' >选择样式</button><br>\
                        <div class='icon-style clearfix' >\
                            <ul class='package-list' >\
                            <%for(var i in package){%>\
                                <%if(i==0){%>\
                                    <li class='current'><a href='javascript:void(0);'><%=package[i].name%></a></li>\
                                <%} else {%>\
                                    <li><a href='javascript:void(0);'><%=package[i].name%></a></li>\
                                <%}%>\
                            <%}%>\
                            </ul>\
                            <%for(var i in package){%>\
                                <%if(i==0){%>\
                                    <ul class='icon-list current '>\
                                <%} else {%>\
                                    <ul class='icon-list'>\
                                <%}%>\
                                <%for(var j in package[i].styleList){%>\
                                    <li><a href='javascript:void(0);'><%=package[i].styleList[j].name%></a></li>\
                                <%}%>\
                                </ul>\
                            <%}%>\
                        </div>\
                    </div>",
        DEFAULT_OPTION = {
            style: 102,
            isEdit: false,
            callback: {
                onLoaded:function(){
                    hotspotArr.push(this);
                    if(this.element.find(".title")[0].tagName.toLowerCase() === "input") {
                        this.element.find(".title").val(this.data.title || "")
                            .end().find(".content").val(this.data.content || "");
                    } else {
                        var pic = this.data.pic;
                        var url = this.data.linkUrl; 
                        this.element.find(".title").html(this.data.title || "")
                            .end().find(".content").html(this.data.content || "");
                        if(!!pic) {
                            for(var i=0;i<pic.length;i++){
                                if(!(pic[i].indexOf("http://image2.panocooker.com")>-1)){
                                    pic[i] = "http://image2.panocooker.com" + pic[i];
                                }
                                
                                this.element.find(".photos").append("<img src="+pic[i]+">");
                            }
                        } else {
                            this.element.find(".photos").hide();
                        }
                        if(!!url) {
                            this.element.find(".more > a").attr("href",url);
                        } else {
                            this.element.find(".more").hide();
                        }
                    }

                },
                onClick:function() {
                    var element = this.element;
                    //移动端不支持mouse事件
                    if(isTouch) {
                        currentHotspot == this;
                        var targetDom = event.target || event.srcElement;
                        if(targetDom.tagName.toLowerCase() == "img") {
                            $('body').mbPhotos({    
                                className: 'commentPhotos',
                                title:this.data.title,    
                                disc: this.data.content,
                                photos:this.data.pic   
                            });
                            return false;   
                        } else if(targetDom.tagName.toLowerCase() == "a") {
                            window.open(targetDom.href);
                            return false;                        
                        }

                        for(var i = 0; i< hotspotArr.length; i++){
                            if(hotspotArr[i] != this) {
                                hotspotArr[i].element.hide().find(".edit").removeClass("curr");
                                hotspotArr[i].zorder();                                
                            }
                        }
                        this.zorder(true);
                        element.show().find(".edit").show().toggleClass("curr");
                    } else {
                        if(currentHotspot == this)return;
                        currentHotspot = this;
                        for(var i = 0; i< hotspotArr.length; i++){
                            hotspotArr[i].element.hide();
                            hotspotArr[i].zorder();
                        }
                        if (!this.photoIndex) {
                            this.photoIndex = layer.ready(function() {
                                layer.photos({
                                    photos:element.find(".photos")
                                });
                            });
                        }
                        this.element.show();
                        currentHotspot.zorder(true);
                    }
                },
                //onDown:function(){},
                //onUp:function() {},
                //onOver:function(){alert("onOver")},
                //onOut:function(){alert("onOut")},
                //onHover:function(){alert("onHover")},
                //onMoveUpdate:function(){alert("onMoveUpdate")},
                //onUpdatestyle:function(){alert("onUpdatestyle")},
                //onRemove:function(){},
                //onAddHotspot:function(){alert("onAddHotspot")},
                //onsavaHotspot:function(){}
            },
            template:TEMPLATE,
            element: undefined
    };

    function Hotspot (opt){
        var optLoadFn,optClickFn;
        optLoadFn = opt.callback.onLoaded;
        optClickFn = opt.callback.onClick;

        this.option = $.extend(true, {}, DEFAULT_OPTION, opt);
        if(typeof optLoadFn === "function"){
            this.option.callback.onLoaded = function(data){
                optLoadFn.call(this,data);
                DEFAULT_OPTION.callback.onLoaded.call(this,data)
            }
        }
        if(typeof optClickFn === "function"){
            this.option.callback.onClick = function(data){
                optClickFn.call(this,data);
                DEFAULT_OPTION.callback.onClick.call(this,data)
            }
        }
    }
    var funs = Hotspot.prototype;

    funs.init = function(data){
        var _this = this;
        isMb = this.yp.method.util.browser().mobile;
        isTouch = this.yp.method.util.isTouch();
        iconPackage = _this.yp.method.icon.getIconPackage();
        var $ele;
        if(!this.option.element){
            $ele = this.option.element = $(template(this.option.template,{package:iconPackage}));
        } else {
            $ele = $(this.option.element);
        }

        $ele.delegate(".btn-delete", "click", function () {
            _this.removeHotspot();
        });
        $ele.delegate(".btn-edit", "click", function () {
            $(this).parents(".hotspot-element").find('.edit').toggle().end().find('.icon-style').hide();
        });
        $ele.delegate(":text", "click mousedown mousedown focus", function (e) {
            e.stopPropagation();
        });
        $ele.delegate(".btn-style", "click", function () {
            $(this).parents(".hotspot-element").find('.icon-style').toggle().end().find('.edit').hide();
        });
        $ele.delegate(".btn-save", "click", function () {
            var $hotspotElement = $(this).parents(".hotspot-element"),
                title = $hotspotElement.find(".title").val(),
                content = $hotspotElement.find(".content").val();
            _this.saveHotspot({title:title,content:content});
        });
        $ele.delegate(".package-list > li", "click", function () {
            var $li = $(this),
                $ul = $li.parent();
            $ul.children().removeClass("current");
            $li.addClass("current");
            $(this).parents(".hotspot-element").find(".icon-list").hide().eq($li.index()).show();
        });
        $ele.delegate(".icon-list > li", "click", function () {
            var iconIndex = $(this).index(),
                packageIndex = $(this).parents(".hotspot-element").find('.package-list > .current').index();
            _this.updataHotspot(iconIndex,packageIndex);
        });
        this.reghot = this.method.hotspot.register(HOTSPOT_TYPE,this.option);
    };

    funs.onNewSceneData = function (data) {
        for(var i in data) {
            this.reghot.addHotspot(data[i]);

            // this.yp.initEvent("onloadhotspot");
        }
    };

    funs.onNewSceneCacheData = function () {
        this.cacheData = [];
        for(var i in hotspotArr) {
            var spotObj = hotspotArr[i].getData();
            this.cacheData.push(spotObj);
        }
        hotspotArr = [];
        return this.cacheData;
    };

    funs.addHotspot = function (opt) {
        opt = opt || {
            style: 102,
            data: {}  
        }
        this.reghot.addHotspot(opt);
    };

    funs.removeHotspot = function (hotspot) {
        hotspot = hotspot || currentHotspot;
        for(var i in hotspotArr){
            if(hotspotArr[i] === hotspot){
                hotspotArr.splice(i,1);
            }
        }
        hotspot.remove();
    };

    funs.getHotspot = function (hotspotName) {
        return this.reghot.getHotspot(hotspotName);
    };

    //修改style
    funs.updataHotspot = function (iconId,packageId,hotspot) {
        hotspot = hotspot||currentHotspot;
        if(typeof iconId === "object"){
            hotspot.update(iconId);
            return;
        }
        packageId = packageId || 0;
        var name = iconPackage[packageId].styleList[iconId].name;
        hotspot.update({style:name});
    };

    //修改url
    funs.setUrl = function (urlStr,hotspot){
        hotspot = hotspot||currentHotspot;
        hotspot.update({url:urlStr});
    };

    funs.saveHotspot = function (data,hotspot) {
        hotspot = hotspot||currentHotspot;
        hotspot.data = data;
        hotspot.save(data);
    };

    funs.switch = function (flag) {
        for(var i in hotspotArr){
            hotspotArr[i].hotspot.visible = flag;
        }
    };

    //funs.getStyleList = function (packageId) {
    //    return iconPackage[packageId].styleList;
    //};
    //
    //funs.setCurrentHotspot = function (hotspot) {
    //    currentHotspot = hotspot;
    //};
    //
    //funs.setZorder = function (flag,hotspot) {
    //    hotspot = hotspot||currentHotspot;
    //    currentHotspot.zorder(flag);
    //};

    YP.addPlugin("hotspots", Hotspot);
})(window);
(function (window, undefined) {
    var krpano;
    var yp;
    var currentHotspot;
    var option;
    var hotspotArr = [];
    var temp = "<div class='linkWrap'><h3 class='linkTitle'>链接场景</h3>\
        <dl class='linker'><dd class='select'>选择连接场景</dd>\
        <dd class='change'>更换样式</dd>\
        <dd class='remove'>删除连接器</dd></dl></div>";

    var tempScene = '<div class="scene"><h5>选择连接场景</h5><ul>\
            <%for (var i = 0; i < data.length; i++) {%>\
                <li id="<%=data[i].name%>"><%=data[i].title%></li>\
            <%}%>\
        </ul></div>';

    var tempStyle = '<div class="style"><h5>更换样式</h5>\
            <div class="iconStyle clearfix" >\
                <ul class="packageList" >\
                <%for(var i in package){%>\
                    <li class="<%=package[i].name%>"><a href="javascript:void(0);"><%=package[i].name%></a></li>\
                <%}%>\
                </ul>\
                <div class="iconList">\
                <%for(var i in package){%>\
                        <ul class="ul <%=package[i].name%>">\
                    <%for(var j in package[i].styleList){%>\
                        <li id="<%=package[i].styleList[j].name%>"><a href="javascript:void(0);"><%=package[i].styleList[j].name%></a></li>\
                    <%}%>\
                    </ul>\
                <%}%>\
                </div>\
            </div>\
        </div>';

    var DEFAULT_OPTION = {
        element: $(temp),
        isMove: true,
        isEdit: true
    };



    function Links(option) {
        var _this = this;
        this.option = option;
        this.options = $.extend(true, {}, DEFAULT_OPTION, option, {
            callback: {
                onClick: function(data) {
                    if(currentHotspot == this) return;
                    currentHotspot = this;
                    for(var i = 0; i< hotspotArr.length; i++){
                        hotspotArr[i].element.find(".linker").hide();
                        hotspotArr[i].zorder();
                    }

                    if(_this.options.isEdit) {
                        _this.element.find(".linker").show(); 
                    } else {
                        data && data.data && data.data.sceneName && yp.method.scene.loadScene(data.data.sceneName);
                    }

                    currentHotspot.zorder(true);
                    _this.callwith("onClick", this, arguments);
                },
                onLoaded: function() {
                    hotspotArr.push(this);
                    var aspot = new spot(this.data, this);
                    _this.callwith("onLoaded", this, arguments);
                }
            }
        });
    }

    var funs = Links.prototype;

    funs.callwith = function (type, _this, data) {
        if (this.option.callback && typeof this.option.callback[type] === "function") {
            this.option.callback[type].call(_this, data);
        }
    };

    funs.init = function (data) {
        krpano = this.krpano;
        yp = this.yp;
        option = this.options;
        this.links = this.method.hotspot.register("links",this.options);
    };

    funs.addLink = function (data) {
        var hotspot = this.links.addHotspot({
            style: 101,
            data: {}
        });
        hotspot.option.callback.onClick.apply(hotspot);
        return hotspot;
    }

    funs.removeLink = function (hotspot) {
        hotspot = hotspot || currentHotspot;
        for(var i in hotspotArr){
            if(hotspotArr[i] === hotspot){
                hotspotArr.splice(i,1);
            }
        }
        hotspot.remove();
    };


    funs.getLink = function (name) {
        return this.links.getHotspot(name);
    };

    funs.toggleLink = function(flag) {
        var links = this.getLink();
        for(var i = 0;i<links.length;i++){
            links[i].hotspot.visible = flag
        }
    }


    funs.saveHotspot = function (){
        var h = currentHotspot.hotspot;
        var data = {
            data : currentHotspot.data,
            atv: h.atv,
            ath: h.ath,
            id : h.id,
            scenename : h.scenename,
            style : h.style,
            hotspot_type : currentHotspot.option.hotspotType
        };
        console.log("保存数据",data);
    };


    funs.onNewSceneData = function (data) {
        for(var i in data) {
            this.links.addHotspot(data[i]);
        }
    };

    funs.onNewSceneCacheData = function () {
        this.cacheData = [];
        for(var i in hotspotArr) {
            var spotObj = hotspotArr[i].getData();
            this.cacheData.push(spotObj);
        }
        hotspotArr = [];
        return this.cacheData;
    };


    var spot = function (data,hotspot) {
        var dom = $(hotspot.sprite); 
        this.initLink(data,hotspot);
        this.initLabel(data,hotspot);
        this.bindEvent(data,hotspot);
    }

    var fn = spot.prototype;

    fn.initLabel = function(data,hotspot) {
        var dom = $(hotspot.sprite);
        var icon = yp.method.icon.getIconPackage();
        var html = $(template(tempStyle, {package:icon}));
        dom.find(".change").append(html);
        lableDom = dom.find(".change");
        lableDom.on("click","li",function(){
            var name = this.id;
            var curPackage = this.className;
            if(!!curPackage) { 
                $(this).addClass("action").siblings().removeClass('action');
                $('.iconList').find("."+curPackage).addClass("action").siblings().removeClass('action');
            }
            !!name && currentHotspot.update({style:name});
        });
    }

    fn.initLink = function (data, hotspot) {
        var dom = $(hotspot.hotspot.sprite);
        var scenes = yp.method.scene.getScene();
        var html = $(template(tempScene, {data:scenes}));
        var selectDom = dom.find(".select");
        data.sceneName = data && data.sceneName && data.sceneName.toLowerCase();
        var currScenes = yp.method.scene.getScene(data.sceneName);
        var linkDom = dom.find(".linkTitle");
        var isEdit = option.isEdit;

        if(currScenes) {
            selectDom.append(html);
            selectDom.on("click","li",function(){
                linkDom.text($(this).text());
                $(this).addClass("action").siblings().removeClass('action');
                data.sceneName = this.id;
                yp.plugin.links.saveHotspot();
            });

            //点击标题跳转场景
            linkDom.text(currScenes.title);
            // linkDom.on("click",function(){
            //     sceneName && yp.method.scene.loadScene(sceneName);
            // }) 

        } else {
            hotspot.remove();
        }




    }

    fn.bindEvent = function (data,hotspot) {
        var dom = $(hotspot.sprite);

        dom.delegate(".remove","click",function(){
            var qa = confirm("确定要删除这个链接器吗");
            if(qa) yp.plugin.links.removeLink();
        })
        dom.delegate(".change","click",function(){
            $(this).addClass("action").siblings().removeClass("action");
        })
        dom.delegate(".select","click",function(){
            $(this).addClass("action").siblings().removeClass("action");
        })

    }



    YP.addPlugin("links", Links);
})(window);
(function(window, undefined) {
    var proxy;
    var loginHtml = '<div class="login">\
                        <p>登录</p>\
                        <div class="shuru">\
                            <input type="text" class="username" placeholder="用户名或手机号"/>\
                            <p class="nameerror"></p>\
                            <input type="password" class="password" placeholder="密码"/>\
                            <p class="worderror"></p>\
                            <input type="submit" value="登录" class="submit" disabled="true"/>\
                        </div>\
                        <div>\
                            <a>微信登录</a>\
                            <a>忘记密码</a>\
                            <a>注册账号</a>\
                        </div>\
                        <i class="close" />\
                    </div>';

    function login(option) {

    }
    var funs = login.prototype;

    funs.init = function() {
        var _this = this;
        proxy = this.yp.proxy;
        this.yp.element.append(loginHtml);
        this.yp.element.find(".submit").on("click", function() {
            var user = $(".username").val().length;
            var pass = $(".password").val().length;
            if(!user>0){
                $(".nameerror").html("尚未填写用户名或手机号");
                $(".worderror").html("");
            } else if(!pass>0){
                $(".nameerror").html("");
                $(".worderror").html("尚未填写密码");
            } else {
                $(".worderror,.nameerror").html("");
            }
            
            
            
        })

        this.yp.element.find(".username,.password").on("blur",function(){
            var name = _this.yp.element.find(".username").val().length;
            var word = _this.yp.element.find(".password").val().length;
            if(!name>0){
                if(!word>0){
                    _this.yp.element.find(".submit").removeClass("curr").attr("disabled",true);
                    $(".worderror,.nameerror").html("");
                }
            }
        })
        this.yp.element.find(".username,.password").on("focus",function(){
            _this.yp.element.find(".submit").addClass("curr").attr("disabled",false);
        })
        
    }

    YP.addPlugin("login", login);
})(window);
(function (window, undefined) {
    var TEMPLATE = "<div class='maps-bg'>\
                        <div class='maps-addRadar'>添加热点</div>\
                        <div class='maps-removeRadar'>删除热点</div>\
                        <ul class='maps-names'>\
                            <%for(var i in maps){%>\
                                <li class='maps-name'><%=maps[i].name%></li>\
                            <%}%>\
                        </ul>\
                        <ul class='maps-scenes'>\
                            <%for(var i in scenes){%>\
                                <li class='maps-scene' data-scene='<%=scenes[i].name%>'><%=scenes[i].title%></li>\
                            <%}%>\
                        </ul>\
                        <div class='maps'/>\
                    </div>";

    var DEFAULT_OPTION = {
        template: TEMPLATE,
        element: undefined,
        //radar: {
        //    editHeading: true
        //},
        data: []
    };

    function Maps(options) {
        this.option = options;
        this.options = $.extend(true, {}, DEFAULT_OPTION, options);
        this.data = {};
    }

    var funs = Maps.prototype;

    //funs.onNewSceneData = function (data) {
    //    for (var i in data) {
    //        this.addMap(data[i]);
    //    }
    //};
    //
    //funs.onNewSceneCacheData = function () {
    //    return this.maps.maps;
    //};

    funs.getMaps = function () {
        return this.maps.maps;
    };

    funs.addMap = function () {
        return this.maps.addMap.apply(this.maps, arguments);
    };

    funs.removeMap = function (obj) {
        var map = obj;

        if (obj instanceof $) {
            map = obj.data("map");
        }

        return this.maps.removeMap(map);
    };

    funs.getCurrMap = function () {
        return this.maps.currMap;
    };

    funs.init = function (data) {
        var _this = this;
        this.options.element = this.options.element || $("body");

        this.element = $(template(this.options.template, {
            scenes: this.method.scene.getScene(),
            maps: this.options.data
        }));
        
        // console.log(_this.options.data);
        this.mapsNames = this.element.find(".maps-names");
        this.options.element.append(this.element);
        this.mapsElement = this.element.find(".maps");
        this.mapsScene = this.element.find(".maps-scenes");

        var options = $.extend(true, {}, this.options, {
            element: this.mapsElement,
            callback: {
                onMapsAdd: function (data) {
                    var e = $(_this.options.template).find(".maps-name").clone();
                    _this.mapsNames.append(e.html(data.name).data("map", data));
                    _this.callwith("onMapsAdd", data);
                },
                onRadarAdd: function (data) {
                    _this.onnewscene();
                    _this.callwith("onRadarAdd", data);
                },
                onRadarRemove: function (data) {
                    _this.onnewscene();
                    _this.callwith("onRadarRemove", data);
                },
                onRadarChange: function (data) {
                    _this.onnewscene();
                    _this.callwith("onRadarChange", data);
                }
            }
        });

        this.maps = this.method.maps.register("maps", options);

        this.mapsNames.find(".maps-name").each(function (i) {
            $(this).data("map", _this.getMaps()[i]);
        });

        this.mapsNames.delegate(".maps-name", "click", function () {
            _this.maps.activeMap($(this).data("map"));
        });

        this.element.delegate(".maps-addRadar", "click", function () {
            _this.maps.addRadar();
        });

        this.element.delegate(".maps-removeRadar", "click", function () {
            _this.maps.removeRadar();
        });

        _this.mapsScene.delegate(".maps-scene", "click", function () {
            if (_this.maps.currRadar) {
                _this.maps.currRadar.changeScene($(this).data("scene"));
            } else {
                YP.error("请选择热点");
            }
        });
    };

    funs.onnewscene = function () {
        var _this = this;

        if (_this.maps.currMap) {
            _this.mapsScene.find(".maps-scene").each(function () {
                $(this).removeAttr("disabled");

                for (var i in _this.maps.currMap.radars) {
                    var radar = _this.maps.currMap.radars[i];

                    if (radar.scene == $(this).data("scene")) {
                        $(this).attr("disabled", true);
                    }
                }
            })
        }
    };

    funs.callwith = function (type, data) {
        if (this.option.callback && typeof this.option.callback[type] === "function") {
            this.option.callback[type].call(this.maps, data);
        }
    };

    funs.onaddscene = function () {
        this.options.template.find(".maps-scenes").html(template(this.options.template.find(".maps-scenes").html(), this.method.scene.getScene()));
        _this.onnewscene();
    };

    funs.onremovescene = function () {
        this.options.template.find(".maps-scenes").html(template(this.options.template.find(".maps-scenes").html(), this.method.scene.getScene()));
        _this.onnewscene();
    };

    YP.addPlugin("maps", Maps);
})(window);
(function (window, undefined) {
    var DEFAULT_OPTION = {
        template: "",
        element: $("#element")
    };

    function Music(option) {
        this.option = $.extend(true, {}, DEFAULT_OPTION, option);
        this.data = this.option.data;
    }

    var funs = Music.prototype;


    funs.play = function () {
        var _this = this;
        var tempMusic = [];
        if(typeof this.data === "object") {
            for(var i in this.data){
                var android = this.yp.method.util.browser().android;
                if (android) {
                   this.data[i].url = this.data[i].url.split("|")[0]; 
                }
                tempMusic.push(this.data[i])
            } 
        }
        _this.method.music.play(tempMusic); 
         
    }

    YP.addPlugin("music", Music);
})(window);
(function (window, undefined) {

    function Nadir(options) {
        this.option = $.extend(true, {}, options);
    }

    var fn = Nadir.prototype;

    fn.init = fn.onnewpano = function () {
        var _this = this;
        var scene = this.yp.method.scene.getCurrScene();
        var landswitch = scene.nadirlogo_land;
        var landpic = scene.nadirlogo_land_url || "http://pano.panocooker.com/krpano/skin/img/background.png";
        var landlink = scene.nadirlogo_land_link || "#";
        var skyswitch = scene.nadirlogo_sky;
        var skypic = scene.nadirlogo_sky_url || "http://pano.panocooker.com/krpano/skin/img/background.png";
        var skylink = scene.nadirlogo_sky_link || "#";

        this.method.nadir.set(landpic, landlink, false);
        this.method.nadir.set(skypic, skylink, true);
        this.method.nadir.swith(landswitch == "true", false);
        this.method.nadir.swith(skyswitch == "true", true);
    };

    YP.addPlugin("nadir", Nadir);
})(window);

(function (window, undefined) {
    function Share(){

    }
    var funs = Share.prototype;

    var DEFAULE_OPTION = {
        url: "http://weixin.duc.cn/getWeixinJsToken",
        title: "数联中国",
        link: location.href,
        imgUrl: "http://static.duc.cn/icon1.png",
        desc: "Hi，孤夜观天象，发现一个不错的西西，分享一下下 ;-)",
        token: "weixin3",
        debug: false,
        success: undefined,
        cancel: undefined,
        error: undefined
    };

    funs.init = function (options) {
        var _this = this;
        DEFAULE_OPTION.title = this.yp.defaultData.name;
        DEFAULE_OPTION.desc = this.yp.defaultData.content;
        DEFAULE_OPTION.imgUrl = this.yp.defaultData.thumb;

        this.options = $.extend(DEFAULE_OPTION, options);


        $.getScript("http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function () {
            
            $.ajax({
                url: _this.options.url + "?token=" + _this.options.token + "&url=" + encodeURIComponent(_this.options.link),
                dataType: "jsonp",
                success: function (data) {
                    wx.config({
                        debug: _this.options.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: data.appId, // 必填，公众号的唯一标识
                        timestamp: data.timestamp, // 必填，生成签名的时间戳
                        nonceStr: data.noncestr, // 必填，生成签名的随机串
                        signature: data.signature,// 必填，签名，见附录1
                        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });
                }
            });

            wx.error(function (res) {
                logger.warn(JSON.stringify(res));
                
                if (typeof _this.options.error === "function") {
                    _this.options.error();
                }
            });

            wx.ready(function () {
                wx.onMenuShareTimeline({
                    title: _this.options.title,
                    link: _this.options.link,
                    imgUrl: _this.options.imgUrl,
                    success: _this.options.success,
                    cancel: _this.options.cancel
                });

                wx.onMenuShareAppMessage({
                    title: _this.options.title,
                    link: _this.options.link,
                    imgUrl: _this.options.imgUrl,
                    desc: _this.options.desc,
                    success: _this.options.success,
                    cancel: _this.options.cancel
                });

                wx.onMenuShareQQ({
                    title: _this.options.title,
                    link: _this.options.link,
                    imgUrl: _this.options.imgUrl,
                    desc: _this.options.desc,
                    success: _this.options.success,
                    cancel: _this.options.cancel
                });

                wx.onMenuShareWeibo({
                    title: _this.options.title,
                    link: _this.options.link,
                    imgUrl: _this.options.imgUrl,
                    desc: _this.options.desc,
                    success: _this.options.success,
                    cancel: _this.options.cancel
                });
            });
        })
    };
    
    YP.addPlugin("share", Share);

})(window);
(function (window, undefined) {

    var krpano;

    var DEFAULT_OPTION = {};

    function snow(option) {
        this.option = $.extend(true, {}, DEFAULT_OPTION, option);
        this.data = this.option.data;
    }

    var funs = snow.prototype;


    funs.init = function (data) {
        var _this = this;
        var isuse = this.yp.data.relevance.effect.data.isuse;
        if (isuse) this.onNewSceneData(this.data);
    };

    funs.onNewSceneData = function (data) {
        if(!$.isEmptyObject(data))
            this.method.effect.set(data);
    };

    YP.addPlugin("effect", snow);
})(window);

(function (window, undefined) {

    var DEFAULT_OPTION = {
        // data: undefined
        template:'<ul class="switcher">\
            <%for (var i in data) {%>\
                <%=data%>\
                <li data-id="<%=i%>" class="switch_<%=i%>"><%=i%><input type="checkbox" value="<%=data[i]%>" <%if (data[i] == 1) {%>checked<%}%> ></li>\
            <%}%>\
        </ul>'
    };

    function Switcher(option) {
        this.option = $.extend(true, {}, DEFAULT_OPTION, option);
    }

    var funs = Switcher.prototype;

    funs.onNewSceneData = function (data) {
        this.data = data;
    };

    funs.init = function () {
        var _this = this;
        var data = this.option.data;
        data.webvr = 0;
        var html = $(template(this.option.template, {data:data}) );
        var element = this.option.element || this.yp.element;
        element.append(html);

        setTimeout(function(){
            for(var i in data){
                _this.switchOff(i,!!data[i]);
            }
        })
    }

    //name:开关的名字,type:1表示开，0表示关

    funs.switchOff = function(name,type){
        var _this = this;
        switch (name) {
        case 'hotspot':
            this.yp.plugin.hotspots.switch(type);
            this.krpano.skin_settings.switch_hotspot = type;
            break;
        case 'gyro':
            if(type) {
                this.krpano.skin_settings.switch_gyro = true;
                this.yp.method.gyro.switch(true);
            } else {
                this.krpano.skin_settings.switch_gyro = false;
                this.yp.method.gyro.switch(false);
            }
            break;
        case 'music':
            if(type) {
                this.krpano.skin_settings.switch_music = true;
                this.yp.plugin.music.play();
            } else {
                this.krpano.skin_settings.switch_music = false;
                this.yp.method.music.pause();
            }
            break;
        case 'starview':
            
            this.krpano.skin_settings.switch_starview = false;

            break;
        case 'autorotate':
            if(type){
                this.yp.method.util.switchAutorotate(true);
            } else {
                this.yp.method.util.switchAutorotate(false);
            }
            break;
        case 'comment':
            _this.yp.plugin.comments.switch(type);
            _this.yp.settings.switch_comment = type;
            break;
        default:
            return "未知组件类型";
        }
    }

    funs.getSwitch = function(){
        var result = {};
        var gyro = this.krpano.skin_settings.switch_gyro;
        var music = this.krpano.skin_settings.switch_music;
        var comment = this.krpano.skin_settings.switch_comment;
        var hotspot = this.krpano.skin_settings.switch_hotspot;
        var starview = this.krpano.skin_settings.switch_starview;
        var autorotate = this.krpano.skin_settings.switch_autorotate;
        result.gyro = gyro;
        result.music = music;
        result.comment = comment;
        result.hotspot = hotspot;
        result.starview = starview;
        result.autorotate = autorotate;
        return result;
    }



    YP.addPlugin("switcher", Switcher);

})(window);
(function(window, undefined) {
    YP.url = {
        getSomething: "http://pano.panocooker.com/getSomething",
        getLoginInfo: 'http://pano.panocooker.com/user/getJsonUserById',
        getCountInfo: 'http://pano.panocooker.com/count/getInfo',
        addSupport: 'http://pano.panocooker.com/count/addSupport',
        commentAdd: 'http://pano.panocooker.com/comment/add',
        commentGet: 'http://pano.panocooker.com/comment/getCommentList',
        commentUpdate: 'http://pano.panocooker.com/comment/move',
        content: 'http://pano.panocooker.com/contact/detail',
        activity: 'http://shop2.panocooker.com/store/getActivityList',
        commodity: 'http://shop2.panocooker.com/store/getGoodsList',
        brand: 'http://shop2.panocooker.com/app/getBrandStory',
        login: 'http://login.panocooker.com',
        getShopSwitchNew: 'http://shop2.panocooker.com/app/getShopSwitchNew',
        getAppSomething: 'http://shop2.panocooker.com/app/getSomething'

    };

    function proxy() {
        this.url = $.extend(true, {}, YP.url, window.PROXY_URL);

        for (var i in this.url) {
            if (!this[i]) {
                this.addUrl(i, this.url[i]);
            }
        }
    }

    proxy.prototype = {
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
            var userId = getQueryString("UI");
            var timestamp = getQueryString("TS");
            var accessToken = getQueryString("access_token");
            if (!options) {
                options = {};
            }

            if (userId && timestamp && accessToken) {
                if (!options.data) {
                    options.data = {};
                }

                options.data.UI = userId;
                options.data.TS = timestamp;
                options.data.access_token = accessToken;
            }

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
            op.type = "post";

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
        login: function(op, fn, errorFn, async) {
            var options = {};
            options.url = this.url.login;
            options.data = op;
            options.dataType = "jsonp";
            this.post(options, fn, errorFn, async);
        },
        activity: function(op, fn, errorFn, async) {
            var options = {};
            options.url = this.url.activity;
            options.data = op;
            options.dataType = "jsonp";
            this.get(options, fn, errorFn, async);
        },
        commodity: function(op, fn, errorFn, async) {
            var options = {};
            options.url = this.url.commodity;
            options.data = op;
            options.dataType = "jsonp";
            this.get(options, fn, errorFn, async);
        },
        brand: function(op, fn, errorFn, async) {
            var options = {};
            options.url = this.url.brand;
            options.data = op;
            options.dataType = "jsonp";
            this.get(options, fn, errorFn, async);
        },
        getShopSwitchNew: function(op, fn, errorFn, async) {
            var options = {};
            options.url = this.url.getShopSwitchNew;
            options.data = op;
            options.dataType = "jsonp";
            this.get(options, fn, errorFn, async);
        },
        getAppSomething: function(op, fn, errorFn, async) {
            var options = {};
            options.url = this.url.getAppSomething;
            options.data = op;
            options.dataType = "jsonp";
            this.get(options, fn, errorFn, async);
        }

        
    };

    YP.proxy = YP.extend.proxy = new proxy();
})(window);
(function (window, undefined) {
    YP.addSkin("default", {
        // path: "http://sc.duc.cn",
        plugin: {
            maps: {
                move: false,
                radar: {
                    editHeading: false
                },
                style: {
                    width: 262,
                    height: 200,
                    bgAlpha: 0,
                    bgColor: 0xffffff
                },
                template:"<div class='maps-bg'>\
                        <h5 class='maps-title'>平面地图</h5>\
                        <div class='maps-tab'>\
                            <ul class='maps-names'>\
                                <%for(var i in maps){%>\
                                    <li class='maps-name'><%=maps[i].name%></li>\
                                <%}%>\
                            </ul>\
                        </div>\
                        <div class='maps'/>\
                        <i class='maps-close'/>\
                    </div>"
            },
            switcher: {
                template:'<div class="switcher"><h5 class="switch-title">开关设置</h5>\
                <ul class="switch-list">\
                    <%for (var i in data) {%>\
                        <li data-id="<%=i%>" class="switch_<%=i%>"><i></i><span><%=i%></span><input type="checkbox" value="<%=data[i]%>" <%if (data[i] == 1) {%>checked<%}%> ></li>\
                    <%}%>\
                </ul><i class="switch-close"/></div>'
            },
            links: {
                element:$("<div class='linkWrap'><h3 class='linkTitle'>链接场景</h3></div>"),
                isEdit: false,
                isMove: false
            },
            hotspots :{
                isMove: false,
                template:"<div class='hotspot' >\
                        <div class='edit' >\
                            <h5 class='title' />\
                            <div class='photos'></div>\
                            <div class='content' />\
                            <div class='more'><a href='#'>查看详情</a></div>\
                        </div>\
                    </div>",
                callback: {
                    onOver:function(){
                        this.element.find(".edit").addClass("curr");
                        this.zorder(true);
                    },
                    onOut:function(){
                        this.element.find(".edit").removeClass("curr");
                        this.zorder(false);
                    },
                    onClick:function() {

                    }
                }
            }
        }
    });



})(window);

(function(window, undefined){
    var currLayer;
    var proxy;
    var panoId;
    var isMb;
    var getCountInfoHtml = '<div class="vote">\
                                <img class="dianzan" src='+codePath+'/skin/default/images/dianzan.png />\
                                <img class="gif" src='+codePath+'/skin/default/images/dianzan.gif />\
                                <div class="guanzhu">\
                                    <div class="liulan">\
                                        <img src='+codePath+'/skin/default/images/liulan.png />\
                                        <p class="uvNum">0</p>\
                                    </div>\
                                    <div class="shouyexiaozan">\
                                        <img src='+codePath+'/skin/default/images/shouyexiaozan.png />\
                                        <p class="zanNum">0</p>\
                                    </div>\
                                </div>\
                            </div>';
    
    var DEFAULT_OPTION = {
        TEMPLATE : '<div class="toolbar"><ul class="showClass store-toolbar">\
            <%for (var i = 0;i<data.length;i++) {%>\
                <li class="toolitem btn<%=data[i]%>" id="item<%=data[i]%>"></li>\
            <%}%>\
        </ul><a class="btnMore"></a></div>',
    };
    
    
    function Toolbar(option){
        this.option = $.extend(true, {} , DEFAULT_OPTION , option);
    }
    
    var funs = Toolbar.prototype;
        
    funs.init = function() {
        proxy = this.yp.proxy;
        panoId = this.yp.option.panoId;
        isMb = this.yp.method.util.browser().mobile;
        var krpano = this.krpano;
        var yp = this.yp;
        var data = yp.option.data;
        var newData = [];
        var cover = yp.defaultData.thumb;
        var mingcheng = yp.defaultData.name;
        var handHtml = '<div class="touxiang"><i style="background-image:url('+ cover +');" /><p>' + mingcheng + '</p></div>';
            
        for(var key in data){
            var reg = /toolbar|nadir|effect|hotspot|links|music|count|share/i;
            if(!reg.test(key)) {
                newData.push(key);
            }
        }
        this.yp.element.append(handHtml);
        this.yp.element.append(getCountInfoHtml);        
        var html = $(template(this.option.TEMPLATE, {data:newData}) );
        yp.element.append(html);

        //创建vr按钮
        // var pluginfull = this.krpano.addlayer("pluginfull");
        // pluginfull.url = codePath + "/skin/default/images/webvr.png";
        // pluginfull.width="0";
        // pluginfull.height="0"
        // pluginfull.align = "center"
        // pluginfull.x = "16"
        // pluginfull.y = "16"
        // pluginfull.keep = true
        // pluginfull.capture = false
        // pluginfull.onclick = function(){
        //     var isfull = this.yp.krpano.fullscreen;
        // }

        // var recalc = function() {
        //     isMb = yp.method.util.browser().mobile;
        //     var mql = window.matchMedia("(orientation: portrait)");
        //     console.log(mql.matches);

        //     if(isMb){
        //         if (mql.matches) {
        //             html.show();
        //             $(".vote,.touxiang").show();
        //             yp.method.webvr.exitVr();
        //         } else {
        //             html.hide();
        //             $(".vote,.touxiang").hide();
        //             layer.closeAll('page');
        //             yp.method.webvr.enterVr();
        //         }                
        //     }

        // };
        // $(window).resize(recalc);
        // $(document).ready(recalc);

        yp.method.webvr.on("exitvr", function(){
            html.show();
            $(".vote,.touxiang").show();
        });

        yp.method.webvr.on("entervr", function(){
            html.hide();
            $(".vote,.touxiang").hide();
            layer.closeAll('page');
        });

        var myScroll = new IScroll('#xcroll', { mouseWheel: true,click:true}); 
        var myScrolla = new IScroll('#xcrolla', { mouseWheel: true,click:true}); 


        html.on("click",".btngroup",function(){
            var _this = this;
            var area = isMb ? ['auto', '100%'] : ['auto', '520px'];
            var shift = isMb ? null : 0;
            if(!this.layerIndex){
                layer.close(currLayer);
                currLayer = this.layerIndex = layerMsg({
                    area: area,
                    skin:['layer_group anima-pull'],
                    content: $(".sceneWrap"),
                    shift:shift,
                    end: function(){
                        _this.layerIndex = null;
                    },
                    success: function(elem,index){
                        console.log(elem == _this);
                        if(isMb) {
                            $(elem).find(".btnPush").off("click").on("click",function(){
                                $(elem).addClass("anima-push");
                                var timer = setTimeout(function(){
                                    layer.close(index);
                                    _this.layerIndex = null;
                                    clearTimeout(timer);
                                },300);
                                $(".btnMore").trigger("click");
                            })
                        }

                        $("#xcroll").css("overflow", "hidden");
                        $("#xcroll .tabTagBox").css("height", $("#xcroll .tabTagBox ul").height() + "px");
                        myScroll.refresh();
                        myScrolla.refresh();
                    }
                });
            }
            
        });

        html.on("click",".btnmaps",function(){
            var _this = this;
            var area = isMb ? ['94%',''] : ['262px', '200px'];
            var shift = isMb ? null : 0;
            if(yp.plugin.maps.maps.options.data.length == 0) {
                msg("抱歉，平面地图还没有上传。"); 
                return false;
            }  

            if(!this.layerIndex){
                layer.close(currLayer);
                currLayer = this.layerIndex = layerMsg({
                    area: area,
                    skin:['layer_maps anima-up'],
                    content: $(".maps-bg"),
                    shift: shift,
                    end: function(){
                        _this.layerIndex = null;
                    },
                    success: function(elem,index){
                        var mapstabScrolla;
                        var tab = $(elem).find(".maps-tab");
                        var tabLen = tab.find("li").length;
                        tab.find("li").on("click",function(){
                            $(this).addClass("curr").siblings().removeClass("curr");
                        });
                        tab.find("li").eq(0).trigger("click");
                        if(isMb) {
                            //适配地图
                            var mapWidth = $(elem).find(".maps-title").outerWidth();
                            var mapHeight = mapWidth * 0.7;
                            console.log(mapWidth,mapHeight);
                            $(elem).find(".maps").css({width:mapWidth,height:mapHeight});
                            yp.plugin.maps.maps.resize(mapWidth,mapHeight);

                            var tab = $(elem).find(".maps-tab");
                            var tabWidth = tab.find("li").eq(0).addClass("curr").width();
                            tab.find(".maps-names").width(tabWidth * tabLen);

                            mapstabScrolla = new IScroll('.maps-tab', {scrollX: true, scrollY: false, mouseWheel: true,click: true }); 
                            //关闭窗口
                            $(elem).find(".maps-close").off("click").on("click",function(){
                                $(elem).addClass("anima-down");
                                var timer = setTimeout(function(){
                                    _this.layerIndex = null;
                                    layer.close(index);
                                    clearTimeout(timer);
                                },300);
                                $(".btnMore").trigger("click");
                            })
                        } else {
                            if(!(tabLen > 1)) {
                                tab.hide();
                            }
                            mapstabScrolla = new IScroll('.maps-tab', { mouseWheel: true,click: true }); 
                        }
                    }   
                });
            }
        }); 

        html.on("click",".btnswitcher",function(){
            var _this = this;
            var area = isMb ? ['94%',''] : ['350px', '305px'];
            var shift = isMb ? null : 0;
            if(!this.layerIndex){
                layer.close(currLayer);
                currLayer = this.layerIndex = layerMsg({
                    area:area,
                    skin:['layer_switcher anima-up'],
                    content: $(".switcher"),
                    shift: shift,
                    end: function(){
                        _this.layerIndex = null;
                    },
                    success: function(elem,index){
                        if(typeof yp.plugin.music.data === "object" && $.isEmptyObject(yp.plugin.music.data) ){
                            $(elem).find(".switch_music .lcs_switch").addClass("lcs_disabled");
                        }

                        if(isMb) {
                            $(elem).find(".switch-close").off("click").on("click",function(){
                                $(elem).addClass("anima-down");
                                var timer = setTimeout(function(){
                                    _this.layerIndex = null;
                                    layer.close(index);
                                    clearTimeout(timer);
                                },300);
                                $(".btnMore").trigger("click");
                            })
                        }
                    }
                });
            }
        });

        html.on("click",".btnwebvr",function(){
            yp.method.webvr.enterVr();
        });

        //-------------导航----------
        
        html.on("click",".btnMore",function(){
            var length = $(".showClass li").length-1;
            setTimeout(function(){
                var showClassPC = length*58;
                var showClassMB = length*0.58;
                if($(".showClass").hasClass("store-toolbar")){
                    if(isMb){
                        $(".showClass").removeClass("store-toolbar").css({"height":"0px"}).animate({"height":(showClassMB + "rem")},'swing');
                        $(".btnMore").addClass("curr");
                    }else{
                        $(".showClass").removeClass("store-toolbar").css({"height":"0px"}).animate({"height":showClassPC},'swing');
                        $(".btnMore").addClass("curr");
                    }
                } else{
                    if(isMb){
                        $(".showClass").addClass("store-toolbar").css({"height":(showClassMB + "rem")}).animate({"height":"0px"},'swing');
                        $(".btnMore").removeClass("curr");
                    }else{
                        $(".showClass").addClass("store-toolbar").css({"height":showClassPC}).animate({"height":"0px"},'swing');
                        $(".btnMore").removeClass("curr");
                    }
                }                       
            },50);
        });
        
        if(isMb) {
            $('.toolbar').on('click','li',function(){
                if($(this).hasClass("btnComment") || !$(".showClass").height()>0) return false;
                $(".btnMore").trigger("click");
            });                 
        }
        
        var switcher = $(".switcher")
        $('input').lc_switch('','');
        switcher.delegate( 'li','lcs-on', function() {
            var name = $(this).data("id");
            yp.plugin.switcher.switchOff(name,true);
        });
        switcher.delegate('li', 'lcs-off', function() {
            var name = $(this).data("id");
            yp.plugin.switcher.switchOff(name,false);
        });




        
        $(".btncomments").click(function(){
            var login = yp.method.login.isLogin();
            if(login){
                layer.close(currLayer);
                yp.plugin.comments.addComment();
            }else{
                window.location.href = "http://login.panocooker.com/?client_out_forword=true&redirectURL=" + encodeURIComponent(window.location.href)
            }
        });
        
        $(".dianzan").click(function() {
            dianzan();
            $(".gif").show();
            $(".dianzan").hide();
            window.setTimeout(hiddenMsg, 1250);
        });
        
        getZan();
        
//---------group---------
//
        var sceneWrap = $(".sceneWrap");
    
        sceneWrap.on("click",".group-list",function(){
            var index=$(this).index();
            $(".group-list").removeClass("curr");
            $(this).addClass("curr");
            $(".scene-list").hide();
            $(".scene-list").eq(index).show();
            myScroll.refresh();
            myScrolla.refresh();
        });
        
        sceneWrap.on("click",".scene-list li",function(){
            var name = $(this).data("name");
            $(this).addClass('active').siblings().removeClass("active");
            yp.method.scene.loadScene(name);
            myScrolla.refresh();
        }); 
        
    }


    funs.onmousedown = function(){
        if(!isMb){
            layer.closeAll('page');
            currLayer = null;       
        }
    } 


    function isLoad (value) {
        if(value === true || typeof value === "object") {
            return true;
        } else {
            return false;
        }
    }

    function layerMsg(options) {
        return layer.open(
            $.extend({
                type: 1,
                title:false,
                shade: 0,
                closeBtn: 0,
                btn: false,
                shadeClose: false,
                move: false,
                moveType: true,
                offset:['auto','auto'],
                end: function() {}
            }, options)
        );
    }

    function msg(msg, fn){
        layer.msg(msg, {
            time: 1000 //1秒关闭（如果不配置，默认是3秒）
        }, fn);
    }
            
    function hiddenMsg() {
        $(".gif").hide();
        $(".dianzan").show();
    }
        
    function dianzan(panoid) {
        proxy.addSupport({
            panoId: panoId
        }, function(data) {
            if(data.success) getZan();      
        })
    }
        
    function getZan() {
        proxy.getCountInfo({
            panoId: panoId
        }, function(data) {
            var data = data.data;
            $('.uvNum').text(data.uv)
            $('.zanNum').text(data.support)
        })
    }

    
    YP.addPlugin("toolbar", Toolbar);
})(window);

// plugin definition    
$.fn.mbPhotos = function(options) { 
    if(!$.isFunction(IScroll)) {console.error("插件依赖IScroll");return false;}   
    var defaults = {
        className: 'div',
        title: 'title',    
        disc: 'disc',
        photos:[]
    };    

    var op = $.extend(defaults, options);   

    $('.'+className).remove();
    var myScroll;
    var imgLen = op.photos.length;
    var title = op.title;
    var disc = op.disc;
    var pics = op.photos;
    var className = op.className;
    var liWidth = $(window).width();

    var photos = function(){
        var  photosHtml = '<div id="photowrapper"><ul id="scroller">';
        var tabHtml = '<dl id="indicator"><div id="dotty"></div>';
        for(var i=0;i<imgLen;i++){
            photosHtml += '<li><img src="'+pics[i]+'"></li>';
        }       
        return photosHtml + "</ul></div>" + tabHtml + "</dl>";
    }()




    var html = '<div id="'+className+'" class="'+className+'"><i class="close"></i><header>'+title+'<p class="dot">3/6</p></header><footer>'+disc+'</footer>'+photos+'</div>';
    $('body').append(html);
    $('.'+className).find("ul").width(liWidth * imgLen);
    $('.'+className).find("li").width(liWidth);
    $(".dot").text( "1/" + imgLen);

    $('.'+className).on('click','.close',function(){
        $('.'+className).remove();
        myScroll.destroy();
        myScroll = null;
    })

    myScroll = new IScroll('#photowrapper', {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: true,
        snapSpeed: 400,
        keyBindings: true,
        indicators: {
            el: document.getElementById('indicator'),
            resize: false
        }
    }); 

    myScroll.on('scrollEnd', function () {
        var page = myScroll.currentPage.pageX + 1;
        $(".dot").text(page + "/" + imgLen);
    });
}; 