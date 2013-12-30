/*
 * ER (Enterprise RIA)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    er.js
 * desc:    er(ecom ria)是一个用于支撑富ajax应用的框架
 * author:  erik
 */


var er = {};
/*
 * ER (Enterprise RIA)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    er/config.js
 * desc:    er框架的默认配置
 * author:  erik
 */

///import er;

er.config = {
    CONTROL_IFRAME_ID   : 'ERHistroyRecordIframe',
    DEFAULT_INDEX       : '/',
    MAIN_ELEMENT_ID     : 'Main',
    ACTION_ROOT         : '/asset/js',
    ACTION_PATH         : {},
    ACTION_AUTOLOAD     : 0
};
/*
 * ER (Enterprise RIA)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    er/_util.js
 * desc:    er框架内部的使用的功能函数集
 * author:  erik
 */

///import er.config;

er._util = function () { 
    /**
     * 获取配置信息
     * 
     * @inner
     * @param {string} name 配置项名称
     * @return {string}
     */
    function getConfig( name ) {
        var cfg = er.config,
            // 配置默认值
            defaultCfg = {         
                CONTROL_IFRAME_ID   : 'ERHistroyRecordIframe',
                DEFAULT_INDEX       : '/',
                MAIN_ELEMENT_ID     : 'Main',
                ACTION_ROOT         : '/asset/js',
                ACTION_PATH         : {},
                ACTION_AUTOLOAD     : 0
            },
            value = cfg[ name ];
        
        if ( !hasValue( value ) ) {
            value = defaultCfg[ name ] || null;
        }    
        
        return value;
    }

    /**
     * 判断变量是否有值。null或undefined时返回false
     * 
     * @param {Any} variable
     * @return {boolean}
     */
    function hasValue( variable ) {
        return !(variable === null || typeof variable == 'undefined');
    }
    
    var uIdMap_ = {};
    
    /**
     * 获取不重复的随机串
     * 
     * @param {number} opt_len 随机串长度，默认为10
     * @return {string}
     */
    function getUID( opt_len ) {
        opt_len = opt_len || 10;
        
        var chars    = "qwertyuiopasdfghjklzxcvbnm1234567890",
            charsLen = chars.length,
            len2     = opt_len,
            rand     = "";
            
        while ( len2-- ) {
            rand += chars.charAt( Math.floor( Math.random() * charsLen ) );
        }
        
        if ( uIdMap_[ rand ] ) {
            return getUID( opt_len );
        }
        
        uIdMap_[ rand ] = 1;
        return rand;
    }
    
    // 暴露相应的方法
    return {
        getUID      : getUID,
        hasValue    : hasValue,
        getConfig   : getConfig
    };
}();
/*
 * ER (Enterprise RIA)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    er/router.js
 * desc:    路由器
 * author:  erik
 */

///import er;

er.router = function () {
    var routes = [];

    function router( loc ) {
        var i, len, item, rule, func, matches;

        for ( i = 0, len = routes.length; i < len; i++ ) {
            item = routes[ i ];
            rule = item.loc;
            func = item.func;

            if ( rule instanceof RegExp
                 && ( matches = rule.exec( loc ) ) !== null
            ) {
                func.apply( this, matches );
                break;

            } else if ( typeof rule == 'string' 
                        && rule == loc
            ) {
                func.call( this, loc );
                break;

            }
        }
    }

    router.add = function ( rule, func ) {
        routes.push( {
            loc  : rule,
            func : func
        } );
    };

    return router;
}();
/*
 * ER (Enterprise RIA)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    er/config.js
 * desc:    ER框架初始化方法
 * author:  erik
 */

///import er;
///import er._util;
///import baidu.ajax.request;

/**
 * 初始化ER框架
 */
er.init = function () {
    /**
     * 初始化函数
     *
     * @inner
     */
    function init() {
        _continue();
    }

    var initers = [];
    var phase = 'ready';
    var currIndex = 0;

    function _continue() {
        var initer;
        
        switch ( phase ) {
        case 'ready':
        case 'run':
            if ( currIndex < initers.length ) { 
                phase = 'run';
                initer = initers[ currIndex++ ];
                (typeof initer == 'function') && initer();
                _continue();
            } else {
                phase = 'inited';
                typeof er.oninit == 'function' && er.oninit();
            }
            break;
        }
    }

    /**
     * 添加初始化函数
     *
     * @public 
     * @param {Function} initer 初始化函数
     * @param {number} opt_index 初始化次序
     */
    init.addIniter = function ( initer, opt_index ) {
        if ( typeof opt_index == 'number' ) {
            if ( initers[ opt_index ] ) {
                initers.splice( opt_index, 0, initer );
            } else {
                initers[ opt_index ] = initer;
            }
        } else {
            initers.push( initer );
        }
    };

    /**
     * 停止初始化
     *
     * @public
     */
    init.stop = function () {
        if ( phase == 'run' ) {
            phase = 'stop';
        }
    };

    /**
     * 启动初始化
     *
     * @public
     */
    init.start = function () {
        if ( phase == 'stop' ) {
            phase = 'run';
            _continue();
        }
    };

    return init;
}();
/*
 * ER (Enterprise RIA)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    er/locator.js
 * desc:    Hash定位器
 * author:  erik
 */

///import baidu.browser.ie;
///import baidu.browser.firefox;
///import er._util;
///import er.router;
///import er.init;

/**
 * Hash定位器
 * 
 * @desc
 *      Locator = [ path ] [ ~ query ]
 *      path    = "/" [ *char *( "/" *char) ]
 *      query   = *qchar
 *      char    = ALPHA | DIGIT
 *      qchar   = char | "&" | "="
 */
er.locator = function () {
    var currentLocation,
        IFRAME_CONTENT  = "<html><head></head><body><input type=\"text\" id=\"save\">"
            + "<script type=\"text/javascript\">"
            + "var loc = \"#{0}\";"
            + "document.getElementById('save').value = loc;"
            + "parent.er.locator._updateHash(loc);"
            + "parent.er.router(loc);"
            + "</script></body></html>";
    
    /**
     * 获取location信息
     * 
     * @public
     * @return {string}
     */
    function getLocation() {
        var hash;

        // firefox下location.hash会自动decode
        // 体现在：
        //   视觉上相当于decodeURI，
        //   但是读取location.hash的值相当于decodeURIComponent
        // 所以需要从location.href里取出hash值
        if ( baidu.browser.firefox ) {
            hash = location.href.match(/#(.*)$/);
            hash && (hash = hash[ 1 ]);
        } else {
            hash = location.hash;
        }

        if ( hash ) {
            return hash.replace( /^#/, '' );
        }
        
        return '';
    }
    
    /**
     * 更新hash信息
     *
     * @private
     * @param {string} loc
     */
    function updateLocation( loc ) {
        var isChange = currentLocation != loc;

        // 存储当前信息
        // opera下，相同的hash重复写入会在历史堆栈中重复记录
        // 所以需要getLocation来判断
        if ( currentLocation != loc && getLocation() != loc ) {
            location.hash = loc;
        }

        currentLocation = loc;

        isChange && er.locator.onredirect();
        return isChange;
    }

    /**
     * 控制定位器转向
     * 
     * @public
     * @param {string} loc location位置
     * @param {Object} opt_option 转向参数
     */
    function redirect( loc, opt_option ) {
        var opt = opt_option || {};

        // 非string不做处理
        if ( typeof loc != 'string' ) {
            return;
        }
       
        // 增加location带起始#号的容错性
        // 可能有人直接读取location.hash，经过string处理后直接传入
        loc = loc.replace( /^#/, '' );

        // 空string当成DEFAULT_INDEX处理
        if ( loc.length == 0 ) {
            loc = er._util.getConfig( 'DEFAULT_INDEX' ); 
        }

        // 与当前location相同时不进行route
        var isLocChanged = updateLocation( loc );
        if ( isLocChanged || opt.enforce ) {
            loc = currentLocation;

            // 当location未变化，强制刷新时，直接route
            if ( !isLocChanged ) {
                er.router( loc );
            } else {
                doRoute( loc );
            }
        }
    }
    
    /**
     * hash变化的事件监听器
     *
     * @private
     */
    function changeListener() {
        var loc = getLocation();

        if ( !loc ) {
            redirect( '' );
        } else if ( loc !== currentLocation ) {
            updateLocation( loc );
            doRoute( loc );
        }
    }

    function doRoute( loc ) {
        // 权限判断以及转向
        var loc302 = authorize( loc );
        if ( loc302 ) {
            redirect( loc302 );
            return;
        }

        // ie下使用中间iframe作为中转控制
        // 其他浏览器直接调用控制器方法
        if ( baidu.ie && baidu.ie < 8 ) {
            ieRoute( loc );
        } else {
            er.router( loc );
        }
    }

    /**
     * 刷新当前地址
     * 
     * @public
     */
    function reload() {
        if ( currentLocation ) {
            redirect( currentLocation, { enforce: true } );
        }
    }
    
    /**
     * IE下调用router
     * 
     * @private
     * @param {string} loc 地址
     */
    function ieRoute( loc ) {
        var iframe = baidu.g( er._util.getConfig( 'CONTROL_IFRAME_ID' ) ),
            iframeDoc = iframe.contentWindow.document;

        iframeDoc.open( 'text/html' );
        iframeDoc.write(
            baidu.format(
                IFRAME_CONTENT, 
                escapeIframeContent( loc )
            ));
        iframeDoc.close();
    }

    /**
     * iframe内容字符串的转义
     *
     * @private
     * @param {string} 源字符串
     * @return {string}
     */
    function escapeIframeContent( source ) {
        return source.replace( /\\/g, "\\\\" ).replace( /\"/g, "\\\"" );
    }

    /**
     * 初始化locator
     *
     * @private
     */
    function init() {
        if ( baidu.ie && baidu.ie < 8 ) {
            ieCreateIframeRecorder();
            setInterval( changeListener, 100 );
        } 
        else if ( 'onhashchange' in window ) {
            window.onhashchange = changeListener;
            changeListener();
        } else {
            setInterval( changeListener, 100 );
        }
    }
    
    /**
     * ie下创建记录与控制跳转的iframe
     *
     * @private
     */
    function ieCreateIframeRecorder() {
        var iframe = document.createElement('iframe'),
            size   = 200,
            pos    = '-1000px';

        iframe.id       = er._util.getConfig( 'CONTROL_IFRAME_ID' );
        iframe.width    = size;
        iframe.height   = size;
        iframe.src      = "about:blank";

        iframe.style.position   = "absolute";
        iframe.style.top        = pos;
        iframe.style.left       = pos;

        document.body.appendChild(iframe);
    }
    
    var authorizers = [];

    /**
     * 增加权限验证器
     *
     * @public
     * @param {Function} authorizer 验证器，验证失败时验证器返回转向地址
     */
    function addAuthorizer( authorizer ) {
        if ( 'function' == typeof authorizer ) {
            authorizers.push( authorizer );
        }
    }
    
    /**
     * 权限验证
     *
     * @inner
     * @return {string} 验证失败时验证器返回转向地址
     */
    function authorize( currLoc ) {
        var i = 0;
        var len = authorizers.length;
        var loc;

        for ( ; i < len; i++ ) {
            loc = authorizers[ i ]( currLoc );
            if ( loc ) {
                return loc;
            }
        }
    }
    
    // 注册初始化函数
    er.init.addIniter( init, 2 );

    // 返回暴露的方法
    return {
        'redirect'          : redirect,
        'reload'            : reload,
        'getLocation'       : getLocation,
        '_updateHash'       : updateLocation,
        'onredirect'        : new Function(),
        'addAuthorizer'     : addAuthorizer
    };
}();

