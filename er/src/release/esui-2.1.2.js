/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui.js
 * desc:    esui是一套简单的WEB UI库
 * author:  erik
 */

var esui = {};
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator.js
 * desc:    声明validator
 * author:  erik
 */

///import esui;


esui.validator = {};
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator/ValidityState.js
 * desc:    规则验证状态类
 * author:  erik
 */

///import esui.validator;

/**
 * 规则验证状态类
 * 
 * @class
 * @param {Object} options 参数
 */
esui.validator.ValidityState = function( options ) {
    this.message = options.message;
    this.state   = options.state;
};

esui.validator.ValidityState.prototype = {
    /**
     * 获取验证消息
     * 
     * @public
     * @return {string}
     */
    getMessage: function () {
        return this.message || '';
    },
    
    /**
     * 设置验证消息
     * 
     * @public
     * @param {string} message 验证消息
     */
    setMessage: function ( message ) {
        this.message = message;
        this.state = !!message;
    },
    
    /**
     * 获取验证状态
     * 
     * @public
     * @return {boolean}
     */
    getState: function () {
        return !!this.state;
    },
    
    /**
     * 设置验证状态
     * 
     * @public
     * @param {boolean} state 验证消息，true为值合法，false为值非法。
     */
    setState: function ( state ) {
        this.state = !!state;
    }
};
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator/Rule.js
 * desc:    验证规则类
 * author:  erik
 */

///import esui.validator.ValidityState;

/**
 * 验证规则类
 * 
 * @class
 * @param {Object} options 参数
 */
esui.validator.Rule = function () {
    var RuleClassMap = {};
    function Rule( options ) {
        this.name           = options.name;
        this.check          = options.check;
        this.errorMessage   = options.errorMessage;
    };

    Rule.prototype = {
        /**
         * 获取规则名称
         * 
         * @public
         * @return {string}
         */
        getName: function () {
            return this.name;
        },
        
        /**
         * 验证控件的状态
         * 
         * @public
         * @param {InputControl} control 要验证的控件
         * @return {validator.ValidityState}
         */
        checkValidity: function ( control ) {
            var value = control.getValue();
            var isValid = this.check( value, control );
            var message = '';

            if ( !isValid ) {
                message = this.errorMessage.replace( /\x24\{([a-z0-9_-]+)\}/g, function ( matcher, word ) {
                    return control[ word ] || '';
                } );
            }
            
            return new esui.validator.ValidityState( {
                state   : isValid,
                message : message
            } );
        }
    };
    
    /**
     * 注册规则类型
     *
     * @static
     * @public
     * @param {string} name 规则名
     * @param {Function} RuleClass 规则类
     */
    Rule.register = function ( name, RuleClass ) {
        RuleClassMap[ name ] = RuleClass;
    };
    
    /**
     * 获取规则
     *
     * @static
     * @public
     * @param {string} name 规则名
     * @param {Object} opt_options 规则参数
     * @return {validator.Rule}
     */
    Rule.get = function ( name, opt_options ) {
        var clazz = RuleClassMap[ name ];
        if ( clazz ) {
            return new clazz( opt_options );
        }

        return null;
    };

    return Rule;
}();
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator/Validity.js
 * desc:    验证信息类
 * author:  erik
 */

///import esui.validator.ValidityState;

/**
 * 验证信息类
 * 
 * @class
 * @param {Object} options 参数
 */
esui.validator.Validity = function () {
    this._states = [];
    this._customState = new esui.validator.ValidityState( {
        state : true
    } );

    this._stateMap = {};
};

esui.validator.Validity.prototype = {
    /**
     * 添加验证状态
     * 
     * @public
     * @param {string} name 验证名
     * @param {validator.ValidityState} state 验证状态
     */
    addState: function ( name, state ) {
        if ( state instanceof esui.validator.ValidityState ) {
            this._states.push( state );
            this._stateMap[ name ] = state;
        }
    },
    
    /**
     * 获取自定义验证信息
     * 
     * @public
     * @return {string}
     */
    getCustomMessage: function () {
        return this._customState.getMessage();
    },
    
    /**
     * 设置自定义验证信息
     * 
     * @public
     * @param {string} message 自定义验证信息
     */
    setCustomMessage: function ( message ) {
        this._customState.setMessage( message );
    },
    
    /**
     * 获取验证状态集合
     * 
     * @public
     * @return {Array}
     */
    getStateList: function () {
        var list = this._states.slice( 0 );
        list.push( this._customState );
        return list;
    },
    
    /**
     * 是否验证通过
     * 
     * @public
     * @return {boolean}
     */
    isValid: function () {
        var stateList = this.getStateList();
        var len = stateList.length;

        while ( len-- ) {
            if ( !stateList[ len ].getState() ) {
                return false;
            }
        }

        return true;
    },
    
    /**
     * 获取验证状态
     * 
     * @public
     * @param {string} name 验证名
     * @return {validator.ValidityState}
     */
    getState: function ( name ) {
        return this._stateMap[ name ] || null;
    }
};
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator/MaxLengthRule.js
 * desc:    最大长度验证规则类
 * author:  erik
 */

///import esui.validator.ValidityState;
///import esui.validator.Rule;
///import baidu.lang.inherits;

/**
 * 最大长度验证规则类
 * 
 * @class
 * @param {Object} options 参数
 */
esui.validator.MaxLengthRule = function( options ) {
    options = options || {};
    options.errorMessage && (this.errorMessage = options.errorMessage);
};

esui.validator.MaxLengthRule.prototype = {
    /**
     * 错误提示信息
     * 
     * @public
     */
    errorMessage : "${title}长度不能超过${maxlength}个字符",

    /**
     * 获取规则名称
     * 
     * @public
     * @return {string}
     */
    getName: function () {
        return 'maxlength';
    },
    
    /**
     * 验证值是否合法
     * 
     * @public
     * @return {string}
     */
    check: function ( value, control ) {
        var maxLength = control.maxlength;
        return value.length <= maxLength;
    }
};

baidu.inherits( esui.validator.MaxLengthRule, esui.validator.Rule );
esui.validator.Rule.register( 'maxlength', esui.validator.MaxLengthRule );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator/RequiredRule.js
 * desc:    不能为空验证规则类
 * author:  erik
 */

///import esui.validator.ValidityState;
///import esui.validator.Rule;
///import baidu.lang.inherits;

/**
 * 不能为空验证规则类
 * 
 * @class
 * @param {Object} options 参数
 */
esui.validator.RequiredRule = function( options ) {
    options = options || {};
    options.errorMessage && (this.errorMessage = options.errorMessage);
};

esui.validator.RequiredRule.prototype = {
    /**
     * 错误提示信息
     * 
     * @public
     */
    errorMessage : "${title}不能为空",

    /**
     * 获取规则名称
     * 
     * @public
     * @return {string}
     */
    getName: function () {
        return 'required';
    },
    
    /**
     * 验证值是否合法
     * 
     * @public
     * @return {string}
     */
    check: function ( value ) {
        return value.length > 0;
    }
};

baidu.inherits( esui.validator.RequiredRule, esui.validator.Rule );
esui.validator.Rule.register( 'required', esui.validator.RequiredRule );/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator/MaxValueRule.js
 * desc:    最大值验证规则类
 * author:  erik
 */

///import esui.validator.ValidityState;
///import esui.validator.Rule;
///import baidu.lang.inherits;

/**
 * 最大值验证规则类
 * 
 * @class
 * @param {Object} options 参数
 */
esui.validator.MaxValueRule = function( options ) {
    options = options || {};
    options.errorMessage && (this.errorMessage = options.errorMessage);
};

esui.validator.MaxValueRule.prototype = {
    /**
     * 错误提示信息
     * 
     * @public
     */
    errorMessage : "${title}不能大于${max}",

    /**
     * 获取规则名称
     * 
     * @public
     * @return {string}
     */
    getName: function () {
        return 'max';
    },
    
    /**
     * 验证值是否合法
     * 
     * @public
     * @return {string}
     */
    check: function ( value, control ) {
        var valueAsNumber;
        if ( control.getValueAsNumber ) {
            valueAsNumber = control.getValueAsNumber();
            return valueAsNumber <= control.max;
        }

        return true;
    }
};

baidu.inherits( esui.validator.MaxValueRule, esui.validator.Rule );
esui.validator.Rule.register( 'max', esui.validator.MaxValueRule );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator/MinValueRule.js
 * desc:    最小值验证规则类
 * author:  erik
 */

///import esui.validator.ValidityState;
///import esui.validator.Rule;
///import baidu.lang.inherits;

/**
 * 最小值验证规则类
 * 
 * @class
 * @param {Object} options 参数
 */
esui.validator.MinValueRule = function( options ) {
    options = options || {};
    options.errorMessage && (this.errorMessage = options.errorMessage);
};

esui.validator.MinValueRule.prototype = {
    /**
     * 错误提示信息
     * 
     * @public
     */
    errorMessage : "${title}不能小于${max}",

    /**
     * 获取规则名称
     * 
     * @public
     * @return {string}
     */
    getName: function () {
        return 'min';
    },
    
    /**
     * 验证值是否合法
     * 
     * @public
     * @return {string}
     */
    check: function ( value, control ) {
        var valueAsNumber;
        if ( control.getValueAsNumber ) {
            valueAsNumber = control.getValueAsNumber();
            return valueAsNumber >= control.max;
        }

        return true;
    }
};

baidu.inherits( esui.validator.MinValueRule, esui.validator.Rule );
esui.validator.Rule.register( 'min', esui.validator.MinValueRule );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/validator/PatternRule.js
 * desc:    正则表达式验证规则类
 * author:  erik
 */

///import esui.validator.ValidityState;
///import esui.validator.Rule;
///import baidu.lang.inherits;

/**
 * 正则表达式验证规则类
 * 
 * @class
 * @param {Object} options 参数
 */
esui.validator.PatternRule = function( options ) {
    options = options || {};
    options.errorMessage && (this.errorMessage = options.errorMessage);
};

esui.validator.PatternRule.prototype = {
    /**
     * 错误提示信息
     * 
     * @public
     */
    errorMessage : "${title}不符合规则",

    /**
     * 获取规则名称
     * 
     * @public
     * @return {string}
     */
    getName: function () {
        return 'pattern';
    },
    
    /**
     * 验证值是否合法
     * 
     * @public
     * @return {string}
     */
    check: function ( value, control ) {
        var pattern = control.pattern;
        if ( pattern && typeof pattern == 'string' ) {
            pattern = new RegExp( pattern );
        }

        if ( pattern instanceof RegExp ) {
            return pattern.test( value );
        }

        return true;
    }
};

baidu.inherits( esui.validator.PatternRule, esui.validator.Rule );
esui.validator.Rule.register( 'pattern', esui.validator.PatternRule );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/config.js
 * desc:    ui控件配置项
 * author:  erik
 */


esui.config = {
    UI_ATTRIBUTE: 'ui'
};

/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/util.js
 * desc:    控件实用方法
 * author:  erik
 */

///import esui.config;
///import baidu.event.on;
    
/**
 * UI组件功能库
 *
 * @static
 * @private
 */
esui.util = function () {
    var ctrlContainer = {};
    var componentMap  = {};
    var guid          = 0;

    return {
        /**
         * 初始化控件渲染
         * 
         * @public
         * @param {HTMLElement} opt_wrap 渲染的区域容器元素
         * @param {Object}      opt_propMap 控件附加属性值
         * @param {Function}    opt_attrReplacer 属性替换函数
         * @return {Object} 控件集合
         */
        init: function ( opt_wrap, opt_propMap, opt_attrReplacer ) {
            opt_propMap = opt_propMap || {};
            
            // 容器为空的判断
            opt_wrap = opt_wrap || document.body;
            
            var elements = opt_wrap.getElementsByTagName( '*' );
            var uiAttr = esui.config.UI_ATTRIBUTE || 'ui';
            var realEls = [];
            var attrs, attrStr, attrArr, attrArrLen;
            var attr, attrValue, attrItem, attrSegment, extraAttrMap;
            var i, len, key, el, uis = {};
            
            // 把dom元素存储到临时数组中
            // 控件渲染的过程会导致elements的改变
            for ( i = 0, len = elements.length; i < len; i++ ) {
                realEls.push( elements[ i ] );
            }
            
            // 循环解析自定义的ui属性并渲染控件
            // <div ui="type:UIType;id:uiId;..."></div>
            for ( i = 0, len = realEls.length; i < len; i++ ) {
                el = realEls[ i ];
                attrStr = el.getAttribute( uiAttr );
                
                if ( attrStr ) {
                    // 解析ui属性
                    attrs       = {};
                    attrArr     = attrStr.split( /;\s*/ );
                    attrArrLen  = attrArr.length;

                    while ( attrArrLen-- ) {
                        // 判断属性是否为空
                        attrItem = attrArr[ attrArrLen ];
                        if ( !attrItem ) {
                            continue;
                        } 
                        
                        // 获取属性
                        attrSegment = attrItem.split( /\s*:/ );
                        attr        = attrSegment[ 0 ];
                        attrValue   = attrSegment[ 1 ];
                        attrs[attr] = attrValue;
                    }
                    
                    // 主元素参数初始化
                    attrs.main = el;

                    // 创建并渲染控件
                    var objId = attrs[ 'id' ];
                    if ( !objId ) {
                        objId = esui.util.getGUID();
                        attrs[ 'id' ] = objId;
                    }
                    
                    extraAttrMap = opt_propMap[ objId ];
                    
                    // 将附加属性注入
                    for ( key in extraAttrMap ) {
                        attrs[ key ] = attrs[ key ] || extraAttrMap[ key ];
                    }
                    
                    // 解析属性替换
                    if ( 'function' == typeof opt_attrReplacer ) {
                        opt_attrReplacer( attrs );
                    }
                    
                    // 渲染控件
                    uis[ objId ] = esui.util.create( attrs[ 'type' ], attrs );
                    el.setAttribute( uiAttr, '' );
                }
            }
            
            return uis;
        },
        
        /**
         * 获取控件对象
         * 
         * @public
         * @param {string} id 控件id
         * @return {esui.Control}
         */
        get: function ( id ) {
            return ctrlContainer[ id ] || null;
        },

        /**
         * 创建控件对象
         * 
         * @public
         * @param {string} type 控件类型
         * @param {Object} options 控件初始化参数
         * @return {esui.Control} 创建的控件对象
         */
        create: function ( type, options ) {
            options = options || {};

            var uiClazz = componentMap[ type ] || esui[ type ],
                id      = options.id,
                uiObj   = null;

            if ( id && uiClazz ) {
                uiObj = new uiClazz( options ); 
                if ( options.main ) {
                    uiObj.render();
                }
            }
            
            return uiObj;
        },

        /**
         * 销毁控件
         * 
         * @public
         * @param {esui.Control|string} ctrl 控件或控件id
         */
        dispose: function ( ctrl ) {
            if ( ctrl ) {
                var control = ctrl;
                var id;

                if ( typeof ctrl == 'string' ) {
                    control = ctrlContainer[ ctrl ];
                    
                }
                
                if ( control && control instanceof esui.Control ) {
                    id = control.id;
                    
                    control.__dispose();
                    delete ctrlContainer[ id ];
                }
            } else {
                for ( var key in ctrlContainer ) {
                    esui.util.dispose( key );
                }
            }
        },
        
        /**
         * 注册控件
         * 
         * @public
         * @param {string} name 控件名
         * @param {Function} component 控件类
         */
        register: function ( name, component ) {
            componentMap[ name ] = component;
        },

        validate : new Function(),
        
        /**
         * 寻找dom元素所对应的控件
         * 
         * @public
         * @param {HTMLElement} dom dom元素
         * @return {esui.Control}
         */
        getControlByDom: function ( dom ) {
            if ( !dom ) {
                return;
            }
            
            var controlId;
            if ( ( controlId = dom.getAttribute( 'data-control' ) ) ) {
                return esui.util.get( controlId );
            }

            return null;
        },

        /**
         * 寻找dom元素下的控件集合
         * 
         * @public
         * @param {HTMLElement} container 要查找的容器元素
         * @return {Array}
         */
        getControlsByContainer: function ( container ) {
            var els = container.getElementsByTagName( '*' );
            var len = els.length;
            var i = 0;
            var controlName;
            var result = [];
                
            for ( ; i < len; i++ ) {
                controlName = els[ i ].getAttribute( 'data-control' );
                if ( controlName ) {
                    result.push( esui.util.get( controlName ) );
                }
            }
            
            return result;
        },
        
        /**
         * 改变Input控件的disable状态
         * 
         * @public
         * @param {HTMLElement} container 容器元素
         * @param {boolean} disabled disable状态
         */
        setDisabledByContainer: function ( container, disabled ) {
            var controls = esui.util.getControlsByContainer( container );
            var len = controls.length;
            var control;
                
            while ( len-- ) {
                control = controls[ len ];
                if ( control instanceof esui.Control ) {
                    control.setDisabled( disabled );
                }
            }
        },
        
        /**
         * 构造控件
         *
         * @public
         * @param {ecui.Control} control 控件实例
         */
        construct: function ( control ) {
            ctrlContainer[ control.id ] = control;
            control.__construct();
        },

        /**
         * 判断值不为空(null|undefined)
         * 
         * @public
         * @param {Any} value
         * @param {boolean}
         */
        hasValue: function ( value ) {
            return typeof value != 'undefined' && value !== null;
        },
        
        /**
         * 字符串格式化
         * 
         * @public
         * @param {string} source 原字符串
         * @param {Object|Array} opts 参数
         * @param {string}
         */
        format: function (source, opts) {
            source = String(source);
            
            if ( 'undefined' != typeof opts ) {
                if ( '[object Object]' == Object.prototype.toString.call( opts ) ) {
                    return source.replace( /\$\{(.+?)\}/g,
                        function ( match, key ) {
                            var replacer = opts[ key ];
                            if ( 'function' == typeof replacer ) {
                                replacer = replacer( key );
                            }

                            return ( 'undefined' == typeof replacer ? '' : replacer );
                        });

                } else {
                    var data = Array.prototype.slice.call(arguments, 1);
                    var len = data.length;

                    return source.replace( /\{(\d+)\}/g,
                        function ( match, index ) {
                            index = parseInt( index, 10 );
                            return ( index >= len ? match : data[index] );
                        });
                }
            }
            
            return source;
        },
        
        /**
         * 获取唯一id
         *
         * @public
         * @return {string}
         */
        getGUID: function () {
            return '_innerui_' + ( guid++ );
        }
    };
}();

// 窗口关闭时，释放所有控件
baidu.on( window, 'unload', function () {
    esui.util.dispose();
} );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/get.js
 * desc:    获取控件
 * author:  erik
 */

///import esui.util;

/**
 * 获取控件实例
 * 
 * @public
 * @param {string} id 控件id
 * @return {esui.Control}
 */
esui.get = esui.util.get;
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/init.js
 * desc:    初始化控件
 * author:  erik
 */

///import esui.util;

/**
 * 初始化控件
 * 
 * @public
 * @param {HTMLElement} opt_wrap 渲染的区域容器元素
 * @param {Object}      opt_propMap 控件附加属性值
 * @param {Function}    opt_attrReplacer 属性替换函数
 * @return {Object} 控件集合
 */
esui.init = esui.util.init;
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/create.js
 * desc:    创建控件
 * author:  erik
 */

///import esui.util;

/**
 * 创建控件
 * 
 * @public
 * @param {string} type 控件类型
 * @param {Object} options 控件初始化参数
 * @return {esui.Control} 创建的控件对象
 */
esui.create = esui.util.create;
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/dispose.js
 * desc:    销毁控件
 * author:  erik
 */

///import esui.util;

/**
 * 销毁控件
 * 
 * @public
 * @param {esui.Control|string} ctrl 控件或控件id
 */
esui.dispose = esui.util.dispose;
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Control.js
 * desc:    ui控件基类
 * author:  erik, zhaolei 
 */

///import esui.util;
///import esui.get;
///import esui.init;
///import esui.create;
///import esui.dispose;
///import baidu.dom.addClass;
///import baidu.dom.removeClass;

/**
 * 控件基类
 *
 * @class
 * @param {Object} options 初始化参数
 */
esui.Control = function ( options ) {
    this._state = {};

    // 初始化参数
    this.__initOptions( options );

    // 生成控件id
    if ( !this.id ) {
        this.id = esui.util.getGUID();
    }

    esui.util.construct( this );
};

esui.Control.prototype = {

    /**
     * 渲染控件
     * 
     * @public
     */
    render: function () {
        var main = this.main;

        if ( !this._isRendered ) {
            !main.id && ( main.id = this.__getId() );
            main.setAttribute( 'data-control', this.id );
            baidu.addClass( main, this.__getClass() );
            
            if ( this._autoState ) {
                this.__initStateChanger();
            }

            this._isRendered = true;
        }    
    },
    
    /**
     * 将控件添加到页面的某个元素中
     *
     * @public
     * @param {HTMLElement} wrap
     */
    appendTo: function ( wrap ) {
        wrap = wrap || document.body;
        wrap.appendChild( this.main );
        this.render();
    },

    /**
     * 设置控件为不可用
     *
     * @public
     */
    disable: function () {
        this.addState( 'disabled' );
        this.disabled = true;
    },
    
    /**
     * 设置控件为可用
     *
     * @public
     */
    enable: function () {
        this.removeState( 'disabled' );
        this.disabled = false;
    },

    /**
     * 判断控件不可用状态
     * 
     * @public
     * @return {boolean}
     */
    isDisabled: function () {
        return this.getState( 'disabled' );
    },
    
    /**
     * 设置控件不可用状态
     *
     * @public
     * @param {boolean} disabled
     */
    setDisabled: function ( disabled ) {
        this[ disabled ? 'disable': 'enable' ]();
    },

    /**
     * 添加控件的当前状态
     * 
     * @public
     * @param {string} state 要设置的状态
     */
    addState: function ( state ) {
        this._state[ state ] = 1;
        baidu.addClass( this.main, this.__getClass( state ) );
    },
    
    /**
     * 移除控件的当前状态
     * 
     * @public
     * @param {string} state 要移除的状态
     */
    removeState: function ( state ) {
        delete this._state[ state ];
        baidu.removeClass( this.main, this.__getClass( state ) );
    },
    
    /**
     * 获取控件状态
     * 
     * @public
     * @param {string} state 要获取的状态
     * @return {boolean}
     */
    getState: function ( state ) {
        return !!this._state[ state ];
    },
    
    /**
     * 释放控件
     * 
     * @public
     */
    dispose: function () {
        esui.util.dispose( this );
    },
    
    /**
     * 构造控件
     *
     * @protected
     */
    __construct: function () {
        // 生成控件主元素
        if ( !this.main ) {
            this.main = this.__createMain();
        }
        
        // 子控件容器
        this._controlMap = {};
    },

    /**
     * 释放控件
     * 
     * @protected
     */
    __dispose: function () {
        var controlMap  = this._controlMap,
            main        = this.main;
        
        // dispose子控件
        if ( controlMap ) {
            for ( var k in controlMap ) {
                esui.util.dispose( controlMap[k].id );
                delete controlMap[ k ];
            }
        }
        this._controlMap = null;
        
        // 释放控件主区域的事件以及引用
        if ( main ) {
            main.onclick     = null;
            main.onmouseover = null;
            main.onmouseout  = null;
            main.onmousedown = null;
            main.onmouseup   = null;
        }

        this.main = null;
    },
        
    /**
     * 初始化参数
     * 
     * @protected
     * @param {Object} options 参数集合
     */
    __initOptions: function ( options ) {
        for ( var k in options ) {
            this[ k ] = options[ k ];
        }
    },
    
    /**
     * 初始化单一参数
     * 
     * @protected
     * @param {string} name 参数名称
     * @param {Any}    opt_defaultValue 默认值
     * @param {string} opt_configName 对应的控件配置名
     */
    __initOption: function ( name, opt_defaultValue, opt_configName ) {
        var hasValue = esui.util.hasValue;

        if ( !hasValue( this[ name ] ) ) {
            if ( 'string' == typeof opt_configName ) {
                this[ name ] = this.constructor[ opt_configName ];
            } 
            
            if ( !hasValue( this[ name ] )
                && hasValue( opt_defaultValue )
            ) {
                this[ name ] = opt_defaultValue;
            } 
        }
    },
    
    /**
     * 创建控件主元素
     *
     * @protected
     * @return {HTMLElement}
     */
    __createMain: function () {
        return document.createElement( 'div' );
    },

    /**
     * 获取dom子部件的css class
     * 
     * @protected
     * @return {string}
     */
    __getClass: function ( name ) {
        var me          = this,
            type        = me._type.toLowerCase(),
            suffix      = (name ? '-' + name : ''),
            className   = [ ('ui-' + type + suffix) ],
            skinName    = me.skin,
            i, len;
        
        // 将skin转换成数组
        if ( skinName && typeof skinName == 'string' ) {
            skinName = me.skin = skinName.split( /\s+/ );
        }


        if ( skinName instanceof Array ) {
            for ( i = 0, len = skinName.length; i < len; i++ ) {
                className.push( 'skin-' + type + '-' + skinName[ i ] + suffix );
            }
        }  
        
        return className.join( ' ' );
    },
    
    /**
     * 获取dom子部件的id
     * 
     * @protected
     * @return {string}
     */
    __getId: function ( name ) {
        var idPrefix = 'ctrl' + this._type + this.id;
        if ( name ) {
            return idPrefix + name;
        }

        return idPrefix;
    },

    /**
     * 获取控件对象的全局引用字符串
     * 
     * @protected
     * @return {string}
     */
    __getStrRef: function () {
        return "esui.util.get('" + this.id + "')";
    },
    
    /**
     * 获取控件对象方法的全局引用字符串
     * 
     * @protected
     * @param {string} fn 调用的方法名
     * @param {Any...} anonymous 调用的参数
     * @return {string}
     */
    __getStrCall: function ( fn ) {
        var argLen = arguments.length,
            params = [],
            i, arg;

        if ( argLen > 1 ) {
            for ( i = 1; i < argLen; i++ ) {
                arg = arguments[i];
                if ( typeof arg == 'string' ) {
                    arg = "'" + arg +"'";
                }
                params.push( arg );
            }
        }
        
        return esui.util.format(
                "{0}.{1}({2});",
                this.__getStrRef(),
                fn,
                params.join(',') );
    },
    
    /**
     * 初始化状态事件
     * 
     * @protected
     * @desc
     *      默认为控件的主dom元素挂载4个mouse事件
     *      实现hover/press状态切换的样式设置
     */
    __initStateChanger: function () {
        var me = this,
            main = me.main;
        
        me._state = {};
        if ( main ) {
            main.onmouseover = me.__getMainOverHandler();
            main.onmouseout  = me.__getMainOutHandler();
            main.onmousedown = me.__getMainDownHandler();
            main.onmouseup   = me.__getMainUpHandler();
        }
    },
    
    /**
     * 获取主元素over的鼠标事件handler
     * 
     * @protected
     * @return {Function}
     */
    __getMainOverHandler: function () {
        var me = this;
        return function () {
            if ( !me._state[ 'disabled' ]) {
                me.addState( 'hover' );
            }
        };
    },
    
    /**
     * 获取主元素out的鼠标事件handler
     * 
     * @protected
     * @return {Function}
     */
    __getMainOutHandler: function () {
        var me = this;
        return function () {
            if ( !me._state[ 'disabled' ] ) {
                me.removeState( 'hover' );
                me.removeState( 'press' );
            }
        };
    },
    
    /**
     * 获取主元素down的鼠标事件handler
     * 
     * @protected
     * @return {Function}
     */
    __getMainDownHandler: function () {
        var me = this;
        return function () {
            if ( !me._state[ 'disabled' ] ) {
                me.addState( 'press' );
            }
        };
    },
    
    /**
     * 获取主元素up的鼠标事件handler
     * 
     * @protected
     * @return {Function}
     */
    __getMainUpHandler: function () {
        var me = this;
        return function () {
            if ( !me._state[ 'disabled' ] ) {
                me.removeState( 'press' );
            }
        };
    },
    
    /**
     * 预置状态表
     * 
     * @protected
     */
    _STATES: [ 
        'hover', 
        'press', 
        'active', 
        'disabled', 
        'readonly', 
        'focus'
    ],
    
    /**
     * 验证控件的值是否合法
     *
     * @public
     * @return {boolean}
     */
    validate: function () {
        if ( !this.rule ) {
            return !!1;
        }
        
        return esui.util.validate( this, this.rule );
    }
};  
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Button.js
 * desc:    按钮控件
 * author:  erik, zhaolei
 */

///import esui.Control;
///import baidu.lang.inherits;

/**
 * 按钮控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.Button = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'button';
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 1;

    esui.Control.call( this, options );
};

esui.Button.prototype = {
    /**
     * button的html模板
     *
     * @private
     */
    _tplButton: '<div id="{2}" class="{1}">{0}</div>',
    
    /**
     * 默认的onclick事件执行函数
     * 不做任何事，容错
     * @public
     */
    onclick: new Function(),
    
    /**
     * 获取button主区域的html
     *
     * @private
     * @return {string}
     */
    _getMainHtml: function() {
        var me = this;
        
        return esui.util.format(
            me._tplButton,
            me.content || '&nbsp;',
            me.__getClass( 'label' ),
            me.__getId( 'label' )
        );
    },

    /**
     * 设置是否为Active状态
     * 
     * @public
     * @param {boolean} active active状态
     */
    setActive: function ( active ) {
        var state = 'active';

        if ( active ) {
            this.setState( state );
        } else {
            this.removeState( state );
        }
    },
    
    /**
     * 渲染控件
     * 
     * @public
     */
    render: function () {
        var me   = this;
        var main = me.main;
        var father;
        var temp;
        
        if ( !me._isRendered ) {
            if ( !me.content ) {
                me.content = main.innerHTML;
            }
            
            // 如果是button的话，替换成一个DIV
            if ( main.tagName == 'BUTTON' ) {
                father = main.parentNode;
                temp = document.createElement( 'div' );
                father.insertBefore( temp, main );
                father.removeChild( main );
                main = me.main = temp;
            }

            esui.Control.prototype.render.call( me );
            main.innerHTML = me._getMainHtml();

            // 初始化状态事件
            main.onclick = me._getHandlerClick();

            me._isRendered = true;
        }

        // 设定宽度
        me.width && (main.style.width = me.width + 'px');
        
        // 设置disabled
        me.setDisabled( me.disabled );
    },
    
    /**
     * 获取按钮点击的事件处理程序
     * 
     * @private
     * @return {function}
     */
    _getHandlerClick: function() {
        var me = this;
        return function ( e ) {
            if ( !me.isDisabled() ) {
                if (false === me.onclick()) {
                    baidu.event.stop(e || window.event);
                }
            }
        };
    },
    
    /**
     * 设置按钮的显示文字
     * 
     * @public
     * @param {string} content 按钮的显示文字
     */
    setContent: function ( content ) {
        baidu.g( this.__getId( 'label' ) ).innerHTML = content;
    },
    
    /**
     * 释放控件
     * 
     * @private
     */
    __dispose: function () {
        this.onclick = null;
        esui.Control.prototype.__dispose.call( this );
    }
};

baidu.inherits( esui.Button, esui.Control );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/InputControl.js
 * desc:    输入控件基类
 * author:  erik
 */

///import esui.Control;
///import baidu.lang.inherits;
///import esui.validator.Rule;
///import esui.validator.Validity;
///import esui.validator.ValidityState;

/**
 * 输入控件基类
 *
 * @class
 * @param {Object} options 初始化参数
 */
esui.InputControl = function ( options ) {
    esui.Control.call( this, options );

    this._validatorMessageClass = 'ui-validator-message';

    /**
     * @inner
     */
    function addRule( ruleObj ) {
        if ( !ruleObj ) {
            return;
        }

        if ( typeof ruleObj == 'string' ) {
            rules.push( esui.validator.Rule.get( ruleObj ) );
        } else if ( ruleObj instanceof esui.validator.Rule ) {
            rules.push( ruleObj );
        } else if ( typeof ruleObj == 'object' ) {
            rules.push( new esui.validator.Rule( {
                name            : ruleObj.name,
                errorMessage    : ruleObj.errorMessage,
                check           : ruleObj.check
            } ) );
        }
    }

    // 验证规则初始化
    var rule = this.rule;
    var rules = [];
    this._rules = rules;
    if ( typeof rule == 'string' ) {
        rule = rule.split( ',' );
    }

    if ( rule instanceof Array ) {
        var ruleLen = rule.length;
        var i;

        for ( i = 0; i < ruleLen; i++ ) {
            addRule( rule[ i ] );
        }
    } else {
        addRule( rule );
    }
};

esui.InputControl.prototype = {
    /**
     * 渲染控件
     *
     * @public
     */
    render: function () {
        this.name = this.main.getAttribute( 'name' );
        esui.Control.prototype.render.call( this );
    },
    
    /**
     * 获取控件的name
     *
     * @public
     * @return {string}
     */
    getName: function () {
        return this.name;
    },

    /**
     * 获取控件的值
     *
     * @public
     * @return {string}
     */
    getValue: function () {
        return this.value;
    },
    
    /**
     * 设置控件的值
     *
     * @public
     * @param {string} value 控件的值
     */
    setValue: function ( value ) {
        this.value = value;
    },
    
    /**
     * 创建Input元素
     *
     * @protected
     * @return {HTMLInputElement}
     */
    __createInput: function ( options ) {
        var tagName = options.tagName;
        var name    = options.name;
        var type    = options.type;
        var creater = tagName;
        var input;

        name && ( creater = '<' + tagName + ' name="' + this.name + '">' );
        input = document.createElement( creater ); 

        // 非IE浏览器不认createElement( '<input name=...' )
        if ( !input ) {
            input = document.createElement( tagName );
            name && ( input.name = name );
        }

        type && ( input.type = type );
        return input;
    },

    onbeforevalidate    : new Function(),
    onaftervalidate     : new Function(),
    oninvalid           : new Function(),
    
    /**
     * 验证控件
     * 
     * @protected
     * @param {boolean} 是否仅验证
     * @return {boolean} 是否验证通过
     */
    __validate: function ( justCheck ) {
        var i, len, rule;
        var rules = this._rules;
        var isValid;
        var validity = new esui.validator.Validity();
        
        // 开始验证前事件触发
        !justCheck && this.onbeforevalidate( validity );

        // 开始验证
        for ( i = 0, len = rules.length; i < len; i++ ) {
            rule = rules[ i ];
            validity.addState( rule.getName(), rule.checkValidity( this ) );
        }

        // 验证完成后事件触发
        !justCheck && this.onaftervalidate( validity );
        
        // 验证失败事件触发
        isValid = validity.isValid();
        if ( !isValid ) {
            this.oninvalid( validity );
        }
        
        // 验证信息显示
        !justCheck && this.showValidity( validity );

        return isValid;
    },
    
    /**
     * 验证控件，仅返回是否验证通过
     * 
     * @public
     * @return {boolean} 是否验证通过
     */
    checkValidity: function () {
        return this.__validate( true );
    },
    
    /**
     * 验证控件，当值不合法时显示错误信息
     * 
     * @public
     * @return {boolean} 是否验证通过
     */
    validate: function () {
        return this.__validate();
    },
    
    /**
     * 显示验证信息
     * 
     * @public
     * @param {validator.Validity} 验证信息
     */
    showValidity: function ( validity ) {
        var isValid         = validity.isValid();
        var dom             = this.__getValidMsgDom();
        var states          = validity.getStateList();
        var customMessage   = validity.getCustomMessage();
        var msg             = [];
        var i, len, state;


        if ( isValid ) {
            dom.innerHTML = '';
            baidu.hide( dom );
        } else {
            if ( customMessage ) {
                dom.innerHTML = customMessage;
            } else {
                for ( i = 0, len = states.length; i < len - 1; i++ ) {
                    state = states[ i ];
                    !state.getState() && msg.push( state.getMessage() );
                }

                dom.innerHTML = msg.join( ',' );
            }

            baidu.show( dom );
        }
    },

    /**
     * 获取显示验证信息的容器
     * 
     * @public
     * @return {HTMLElement}
     */
    __getValidMsgDom: function () {
        var id = this.__getId( 'validatemessage' );
        var dom = baidu.g( id );
        var father;

        if ( !dom ) {
            dom = document.createElement( 'span' );
            dom.id = id;
            dom.className = this._validatorMessageClass;
            father = this.main.parentNode;
            father && father.insertBefore( dom, this.main.nextSibling );
        }
        
        return dom;
    }
};  

baidu.inherits( esui.InputControl, esui.Control );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Layer.js
 * desc:    浮动面板层
 * author:  erik
 */

///import esui.Control;
///import baidu.lang.inherits;
///import baidu.event.on;
///import baidu.event.un;
///import baidu.event.getTarget;

/**
 * 浮动面板层控件
 * 
 * @param {Object} options 参数
 */
esui.Layer = function ( options ) {
    esui.Control.call( this, options );

    // 类型声明，用于生成控件子dom的id和class
    this._type = this.retype || 'layer';
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    this.top = 0;
    this.left = 0;
    this.autoHide = this.autoHide || '';
};

esui.Layer.prototype = {
    /**
     * 绘制控件
     *
     * @public
     * @param {HTMLElement} main 控件挂载的DOM
     */
    render: function () {
        var main = this.main;
        esui.Control.prototype.render.call( this );

        main.style.position = 'absolute';
        main.style.left     = this._HIDE_POS;
        main.style.top      = this._HIDE_POS;
        this.zIndex && ( main.style.zIndex = this.zIndex );
        this.width  && ( main.style.width  = this.width + 'px' );
        this.height && ( main.style.height = this.height + 'px' );
        
        // 初始化autohide行为
        if ( this._autoHideInited ) {
            return;
        }

        switch ( this.autoHide.toLowerCase() ) {
        case 'click':
            this._clickHandler = this._getClickHider();
            baidu.on( document, 'click', this._clickHandler );
            break;
        case 'out':
            main.onmouseout = this._getOutHandler();
            main.onmouseover = this._getOverHandler();
            break;
        }

        this._autoHideInited = 1;
    },
    
    /**
     * 获取部件的css class
     * 
     * @override
     * @return {string}
     */
    __getClass: function ( name ) {
        name = name || this.partName;

        return esui.Control.prototype.__getClass.call( this, name );
    },
    
    /**
     * 获取鼠标移入的事件handler
     *
     * @private
     * @return {Function}
     */
    _getOverHandler: function () {
        var me = this;
        return function () {
            me.show();
        };
    },
    
    /**
     * 获取鼠标移出的事件handler
     *
     * @private
     * @return {Function}
     */
    _getOutHandler: function () {
        var me = this;
        return function () {
            me.onhide();
            me.hide();
        };
    },
    
    onhide: new Function(),

    /**
     * 获取点击自动隐藏的处理handler
     *
     * @private
     * @return {Function}
     */
    _getClickHider: function () {
        var me = this;
        return function ( e ) {
            if ( me._isHidePrevent ) {
                me._isHidePrevent = 0;
                return;
            }

            var tar = baidu.event.getTarget( e );
            while ( tar && tar != document.body ) {
                if ( tar == me.main ) {
                    return;
                }
                tar = tar.parentNode;
            }
            
            me.onhide();
            me.hide();
        };
    },

    /**
     * 在一次点击中阻止隐藏层
     * 
     * @private
     */
    _preventHide: function () {
        this._isHidePrevent = 1;
    },

    _HIDE_POS: '-10000px',
    
    /**
     * 设置浮动层的宽度
     *
     * @public
     * @param {number} width 宽度
     */
    setWidth: function ( width ) {
        this.main.style.width = width + 'px';
        this.width = width;
    },
    
    /**
     * 获取浮动层的宽度
     *
     * @public
     * @return {number}
     */
    getWidth: function () {
        return this.width || this.main.offsetWidth;
    },
    
    /**
     * 设置浮动层的高度
     *
     * @public
     * @param {number} height 高度
     */
    setHeight: function ( height ) {
        this.main.style.height = height + 'px';
        this.height = height;
    },
    
    /**
     * 获取浮动层的高度
     *
     * @public
     * @return {number}
     */
    getHeight: function () {
        return this.height || this.main.offsetHeight;
    },

    /**
     * 显示层
     * 
     * @public
     */
    show: function ( left, top ) {
        this._isShow = 1;
        this.left = left || this.left;
        this.top = top || this.top;
        
        this.main.style.left = this.left + 'px';
        this.main.style.top = this.top + 'px';
    },

    /**
     * 隐藏层
     * 
     * @public
     */
    hide: function () {
        this._isShow = 0;
        this.main.style.left = this._HIDE_POS;
        this.main.style.top = this._HIDE_POS;
    },
    
    /**
     * 获取层是否显示
     * 
     * @public
     * @return {boolean}
     */
    isShow: function () {
        return !!this._isShow;
    },
    
    /**
     * 释放控件
     * 
     * @private
     */
    __dispose: function () {
        var main = this.main;

        if ( this._clickHandler ) {
            baidu.un( document, 'click', this._clickHandler );
            this._clickHandler = null;
        }
        
        this.onhide = null;
        esui.Control.prototype.__dispose.call( this );
        
        main.innerHTML = '';
        main.parentNode && main.parentNode.removeChild( main );
    }
};

baidu.inherits( esui.Layer, esui.Control );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/MonthView.js
 * desc:    日历月份显示单元
 * author:  erik, zhaolei
 */

///import esui.Control;
///import baidu.lang.inherits;
///import baidu.dom.g;
///import baidu.dom.addClass;
///import baidu.dom.removeClass;


/**
 * 日历月份显示单元
 * 
 * @param {Object} options 控件初始化参数
 */
esui.MonthView = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = "month";
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.Control.call( this, options );

    this.now = this.now || esui.config.NOW || new Date();
    var viewBase = this.valueAsDate || this.now;
    this.year = parseInt( this.year, 10 ) || viewBase.getFullYear();
    this.month = parseInt( this.month, 10 ) || viewBase.getMonth();
};

esui.MonthView.prototype = {
    /**
     * 设置当前显示的月份日期
     * 
     * @public
     * @param {Date} view 当前显示的月份日期
     */
    setView: function ( view ) {
        this.month = view.getMonth();
        this.year = view.getFullYear();
        this.render();   
    },
    
    /**
     * 获取当前选择的日期
     * 
     * @public
     * @return {Date}
     */
    getValueAsDate: function () {
        return this.valueAsDate || null;
    },
    
    /**
     * 选择日期
     * 
     * @public
     * @param {Date} date 要选择的日期
     */
    setValueAsDate: function ( date ) {
        if ( date instanceof Date ) {
            var me = this;
            
            me._resetSelected();
            me.valueAsDate = date;
            me._paintSelected();
        }
    },
    
    /**
     * 绘制控件
     *
     * @public
     */
    render: function () {
        esui.Control.prototype.render.call( this );
        this.main.innerHTML = this._getHtml();
        this.setValueAsDate( this.valueAsDate );
    },

    /**
     * 日期的模板
     * @private
     */
    _tplItem: '<td year="{1}" month="{2}" date="{0}" class="{4}" style="{5}" id="{3}" onmouseover="{6}" onmouseout="{7}" onclick="{8}">{0}</td>',
    
    /**
     * 日期表格头的模板
     * @private
     */
    _tplHead: '<table border="0" cellpadding="0" cellspacing="0" class="{0}"><thead><tr>',

    /**
     * 标题显示配置
     */
    TITLE_WORDS: ['一', '二', '三', '四', '五', '六', '日'],
    
    /**
     * 获取控件的html
     * 
     * @private
     * @return {string}
     */
    _getHtml: function () {
        var me = this,
            html        = [ esui.util.format( me._tplHead, me.__getClass( 'main' ) ) ],
            index       = 0,
            year        = me.year,
            month       = me.month,
            repeater    = new Date( year, month, 1 ),
            nextMonth   = new Date( year, month + 1, 1 ),
            begin       = 1 - ( repeater.getDay() + 6 ) % 7,
            titles      = me.TITLE_WORDS,
            tLen        = titles.length,
            tIndex,
            virtual,
            overClass   = me.__getClass( 'over' ),
            virClass    = me.__getClass( 'item-virtual' ),
            itemClass   = me.__getClass( 'item' ),
            currentClass,
            customClass,
            overHandler = "baidu.addClass(this, '" + overClass + "')",
            outHandler  = "baidu.removeClass(this, '" + overClass + "')";
        
        // 绘制表头
        for ( tIndex = 0; tIndex < tLen; tIndex++ ) {
            html.push( '<td class="' + me.__getClass('title') + '">' + titles[ tIndex ] + '</td>' );
        }
        html.push( '</tr></thead><tbody><tr>' )        
        repeater.setDate( begin );
        
        // 绘制表体
        while ( nextMonth - repeater > 0 || index % 7 !== 0 ) {
            if ( begin > 0 && index % 7 === 0 ) {
                html.push( '</tr><tr>' );
            }
            
            virtual = (repeater.getMonth() != month);

            // 构建date的css class
            currentClass = itemClass;
            customClass = me._getCustomDateValue( 'customClass', repeater );

            virtual && (currentClass += ' ' + virClass);
            customClass && (currentClass += ' ' + customClass);

            html.push( esui.util.format(
                    me._tplItem, 
                    repeater.getDate(),
                    repeater.getFullYear(),
                    repeater.getMonth(),
                    me._getItemId( repeater ),
                    currentClass,
                    me._getCustomDateValue( 'customStyle', repeater ),
                    ( virtual ? '' : overHandler ),
                    ( virtual ? '' : outHandler ),
                    ( virtual ? '' : me.__getStrRef() + "._selectByItem(this)" )
                ) );
                          
            repeater = new Date( year, month, ++begin );
            index ++;
        }
               
        html.push( '</tr></tbody></table>' );
        return html.join( '' );
    },
    
    /**
     * 获取日期的用户自定义属性值
     * 
     * @private
     * @param {string} name 属性名
     * @param {Date} date 日期
     * @return {string}
     */
    _getCustomDateValue: function ( name, date ) {
        var value = this[ name ];
        var valueType = typeof value;
        
        switch ( valueType ) {
        case 'string':
            return value;
            break
        case 'function':
            return value.call( this, date ) || '';
            break
        }
        
        return '';
    },

    /**
     * 通过item的dom元素选择日期
     * 
     * @private
     * @param {HTMLElement} item dom元素td
     */
    _selectByItem: function ( item ) {
        var date  = item.getAttribute( 'date' ),
            month = item.getAttribute( 'month' ),
            year  = item.getAttribute( 'year' );
            
        this._change( new Date( year, month, date ) );
    },
    
    onchange: new Function(),
    
    /**
     * 选择当前日期
     * 
     * @private
     * @param {Date} date 当前日期
     */
    _change: function ( date ) {
        if ( !date ) {
            return;
        }
        
        if ( this.onchange( date ) !== false ) {
            this.setValueAsDate( date );
        }
    },

    /**
     * 清空选中的日期
     * 
     * @private
     */
    _resetSelected: function () {
        var me = this;

        if ( me.valueAsDate ) {
            var item = baidu.g( me._getItemId( me.valueAsDate ) );
            item && baidu.removeClass( item, me.__getClass( 'selected' ) );

            me.valueAsDate = null;
        }
    },

    /**
     * 绘制选中的日期
     * 
     * @private
     */
    _paintSelected: function () {
        var me = this;

        if ( me.valueAsDate ) {
            var date = me.valueAsDate;
            var item = baidu.g( me._getItemId( date ) );

            item && baidu.addClass( item, me.__getClass( 'selected' ) );
        }
    },
    
    /**
     * 获取日期对应的dom元素item的id
     * 
     * @private
     * @param {Date} date 日期
     * @return {string}
     */
    _getItemId: function ( date ) {
        return this.__getId(
            date.getFullYear() 
            + '-' + date.getMonth() 
            + '-' + date.getDate()
        );
    }
};

baidu.inherits( esui.MonthView, esui.Control );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Select.js
 * desc:    下拉选择框
 * author:  erik, zhaolei, linzhifeng
 */

///import esui.InputControl;
///import esui.Layer;
///import baidu.lang.inherits;

/**
 * 下拉选择框控件
 * 
 * @param {Object} options 参数
 */
esui.Select = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'select';
   
    // 标识鼠标事件触发自动状态转换
    this._autoState = 1;
    
    esui.InputControl.call( this, options );

    // 参数初始化
    this.__initOption( 'maxItem', null, 'MAX_ITEM' );
    this.__initOption( 'emptyText', null, 'EMPTY_TEXT' );
    this.emptyLabel = esui.util.format(
        this._tplLabel,  
        this.__getClass('text-def'), 
        this.emptyText );
    
    this.datasource = this.datasource || [];
};

esui.Select.EMPTY_TEXT = '请选择'; // 选项为空时主区域显示文字
esui.Select.MAX_ITEM   = 8;        // 浮动层最大选项设置，超出则浮动层出现滚动条

esui.Select.prototype = {
    /**
     * 设置控件为禁用
     * 
     * @public
     */
    disable: function () {
        this.hideLayer();
        esui.InputControl.prototype.disable.call( this );
    },
    
    /**
     * 设置控件为可用
     * 
     * @public
     */
    enable: function () {
        this.hideLayer();
        esui.InputControl.prototype.enable.call( this );
    },
    
    /**
     * 绘制控件
     * 
     * @public
     * @param {HTMLElement} main 外部容器
     */
    render: function() {
        var me = this,
            main = me.main,
            value = me.value;

        if ( !me._isRendered ) {
            esui.InputControl.prototype.render.call( me );

            main.innerHTML  = me._getMainHtml();
            main.onclick    = me._getMainClickHandler();

            me._isRendered = 1;
        }
        
        // 绘制浮动层
        me._renderLayer();
        
        me.width && ( main.style.width = me.width + 'px' );
        if ( !me.value && esui.util.hasValue( me.selectedIndex ) ) {
            me.setSelectedIndex( me.selectedIndex );
        } else {
            me.setValue( value );
        }
        
        me.setReadOnly ( !!me.readOnly );
        me.setDisabled( !!me.disabled );
    },
    
    // 主体部分模板
    _tplMain: '<div id="{0}" class="{1}" value="" style="width:{3}px"><nobr>{2}</nobr></div><div class="{4}" arrow="1"></div>',
    
    // 无选择时主区域显示的内容
    _tplLabel: '<span class="{0}">{1}</span>',

    /**
     * 获取主体部分HTML
     * 
     * @return {string}
     */
    _getMainHtml: function() {
        var me = this;
        
        return esui.util.format(
            me._tplMain,
            me.__getId( 'text' ),
            me.__getClass( 'text' ),
            me.staticText || me.emptyLabel,
            me.width - 20,
            me.__getClass( 'arrow' )
        );
    },

    /**
     * 绘制下拉列表
     *
     * @private
     */
    _renderLayer: function() {
        var me      = this,
            layerId = me.__getId( 'layer' ),
            layer   = me.getLayer(),
            len     = me.datasource.length,
            maxItem = me.maxItem,
            layerMain,
            layerMainWidth,
            itemHeight;
        
        if ( !layer ) {
            layer = esui.util.create( 'Layer', {
                    id      : layerId,
                    autoHide: 'click',
                    retype  : me._type,
                    partName: 'layer',
                    skin    : me.skin
                } );
            layer.appendTo();
            me._controlMap[ 'layer' ] = layer;
            layer.onhide = me._getLayerHideHandler();
        }
        
        
        layerMain = layer.main;
        layerMain.style.width   = 'auto';
        layerMain.style.height  = 'auto';
        layerMain.innerHTML     = me._getLayerHtml();
        layerMainWidth          = layerMain.offsetWidth;

        if ( len > maxItem ) {
            itemHeight = layerMain.firstChild.offsetHeight;
            layerMain.style.height = maxItem * ( itemHeight + 1 ) + 'px';
            layerMainWidth += 17;
        }

        if ( layerMainWidth < me.width ) {
            layer.setWidth( me.width );
        } else {
            layer.setWidth( layerMainWidth );
        }
        
        // TODO:页面resize的时候需要调整浮动层的位置
    },
    
    /**
     * 获取浮动层关闭的handler
     * 
     * @private
     * @return {Function}
     */
    _getLayerHideHandler: function () {
        var me = this;
        return function () {
            me.removeState( 'active' );
        };
    },

    // Layer中每个选项的模板
    _tplItem: '<div id="{0}" {10} class="{1}" index="{2}" value="{3}" dis="{4}" onmouseover="{6}" onmouseout="{7}" onclick="{8}">{9}<nobr>{5}</nobr></div>',
    
    // Item中图标层的模板
    _tplIcon: '<span class="{0}"></span>',
    
    /**
     * 获取下拉列表层的HTML
     * 
     * @return {string}
     */
    _getLayerHtml: function () {
        var me          = this,
            datasource  = me.datasource,
            i           = 0,
            len         = datasource.length,
            html        = [],
            strRef      = me.__getStrRef(),
            basicClass  = me.__getClass( 'item' ),
            itemClass,
            dis,
            item,
            iconClass,
            iconHtml,
            titleTip;

        for ( ; i < len; i++ ) {
            itemClass   = basicClass;
            dis         = 0;
            item        = datasource[ i ];
            iconHtml    = '';
            titleTip    = '';
            
            // 初始化icon的HTML
            if ( item.icon ) {
                iconClass = me.__getClass( 'icon-' + item.icon );
                iconHtml = esui.util.format( me._tplIcon, iconClass );
            }
            
            // 初始化基础样式
            if ( item.style ) {
                itemClass += ' ' + basicClass + '-' + item.style;
            }
            
            // 初始化不可选中的项
            if ( item.disabled ) {
                dis = 1;
                itemClass += ' ' + basicClass + '-disabled'; 
            }
            
            // 初始化选中样式
            if ( item.value == me.value ) {
                itemClass += ' ' + me.__getClass( 'item-selected' )
            }
            if ( me.titleTip ) {
                titleTip = 'title="' + item.name + iconHtml + '"';
            }
            
            html.push(
                esui.util.format(me._tplItem,
                    me.__getId( 'item' ) + i,
                    itemClass,
                    i,
                    item.value,
                    dis,
                    item.name,
                    strRef + '._itemOverHandler(this)',
                    strRef + '._itemOutHandler(this)',
                    strRef + '._itemClickHandler(this)',
                    iconHtml,
                    titleTip
                ) );
        }
        
        return html.join( '' );
    },
    
    /**
     * 设置控件为readOnly
     * 
     * @public
     * @param {boolean} readOnly
     */
    setReadOnly: function ( readOnly ) {
        this.readOnly = readOnly = !!readOnly;
        readOnly ? this.addState( 'readonly' ) : this.removeState( 'readonly' );
    },
    
    /**
     * 获取主区域点击的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getMainClickHandler: function () {
        var me = this;

        return function ( e ) {
            e = e || window.event;
            var tar = e.srcElement || e.target;

            if ( !me.readOnly && !me.isDisabled() ) {
                if ( tar.getAttribute( 'arrow' ) || me.onmainclick() !== false ) {
                    me.getLayer()._preventHide();
                    me.toggleLayer();
                }
            }
        };
    },

    onmainclick: new Function(),

    /**
     * 显示层
     * 
     * @public
     */
    showLayer: function() {
        var me = this,
            main                = me.main,
            mainPos             = baidu.dom.getPosition( main ),
            layer               = me.getLayer(),
            layerMain           = layer.main,
            layerOffsetHeight   = layerMain.offsetHeight,
            mainOffsetHeight    = main.offsetHeight,
            pageVHeight         = baidu.page.getViewHeight(),
            layerVHeight        = mainPos.top
                                    + mainOffsetHeight 
                                    + layerOffsetHeight 
                                    - baidu.page.getScrollTop(),
            layerTop;

        if ( pageVHeight > layerVHeight ) {
            layerTop = mainPos.top + mainOffsetHeight - 1;
        } else {
            layerTop = mainPos.top - layerOffsetHeight + 1;
        }
        
        layer.show( mainPos.left, layerTop );
        me.addState( 'active' );
    },
    
    /**
     * 隐藏层
     * 
     * @public
     */
    hideLayer: function() {
        this.getLayer().hide();
        this.removeState( 'active' );
    },
    
    /**
     * 显示|隐藏 层
     * 
     * @public
     */
    toggleLayer: function() {
        var me = this;
        if ( me.getLayer().isShow() ) {
            me.hideLayer();
        } else {
            me.showLayer();
        }
    },
    
    /**
     * 获取layer的控件对象
     * 
     * @return {Object}
     */
    getLayer: function() {
        return this._controlMap[ 'layer' ];
    },
    
    /**
     * 获取ComboBox当前选项部分的DOM元素
     * 
     * @return {HTMLElement}
     */
    _getCur: function() {
        return baidu.g( this.__getId( 'text' ) );
    },
    
    /**
     * 获取当前选中的值
     * 
     * @public
     * @return {string}
     */
    getValue: function() {
        if ( esui.util.hasValue( this.value ) ) {
            return String( this.value );
        }

        return '';
    },
    
    /**
     * 根据值选择选项
     *
     * @public
     * @param {string} value 值
     */
    setValue: function( value ) {
        var me = this,
            layer = me.getLayer().main,
            items = layer.getElementsByTagName( 'div' ),
            len,
            i,
            item;

        if ( esui.util.hasValue( value ) ) {
            for ( i = 0, len = items.length; i < len; i++ ) {
                item = items[ i ].getAttribute( 'value' );
                if ( item == value ) {
                    me.setSelectedIndex( i );
                    return;
                }
            }
        }
        
        me.value = null;
        me.setSelectedIndex( -1 );
    },
    
    /**
     * 根据索引选择选项
     * 
     * @public
     * @param {number} index 选项的索引序号
     * @param {boolean} opt_isDispatch 是否发送事件
     */
    setSelectedIndex: function ( index, opt_isDispatch ) {
        var selected = this.datasource[ index ],
            value;
            
        if ( !selected ) {
            value = null;
        } else {
            value = selected.value;
        }
        
        if (
            opt_isDispatch === true 
            && this.onchange( value, selected ) === false
        ) {
            return;
        }

        this.selectedIndex = index;
        this.value = value;
                
        this._repaint();
    },
    
    onchange: new Function(),

    /**
     * 重绘控件
     * 
     * @private
     */
    _repaint: function () {
        var selected = this.datasource[ this.selectedIndex ],
            word = this.staticText || ( selected ? selected.name : this.emptyLabel ),
            titleTip = this.staticText || ( selected ? selected.name : this.emptyText ),
            el = this._getCur();
            
        if ( this.titleTip ) {
            el.title = titleTip;    
        }
        el.innerHTML = '<nobr>' + word + '</nobr>';
        
        this._repaintLayer();
    },
    
    /**
     * 重绘选项列表层
     * 
     * @private
     */
    _repaintLayer: function () {
        var me              = this,
            index           = me.selectedIndex,
            walker          = me.getLayer().main.firstChild,
            selectedClass   = me.__getClass( 'item-selected' );
            
        while ( walker ) {
            if ( walker.getAttribute( 'index' ) == index ) {
                baidu.addClass( walker, selectedClass );
            } else {
                baidu.removeClass( walker, selectedClass );
            }

            walker = walker.nextSibling;
        }
    },
    
    /**
     * 选项点击事件
     * 
     * @private
     * @param {HTMLElement} item 选项
     */
    _itemClickHandler: function ( item ) {
        var index = parseInt( item.getAttribute( 'index' ), 10 );
        var disabled = item.getAttribute( 'dis' );

        if ( disabled == 1 ) {
            return;
        }

        this.hideLayer();
        this.setSelectedIndex( index, index != this.selectedIndex );
    },

    /**
     * 选项移上事件
     * 
     * @private
     * @param {HTMLElement} item 选项
     */
    _itemOverHandler: function ( item ) {
        if ( item.getAttribute( 'dis' ) == 1 ) {
            return;
        }
        
        var index = item.getAttribute( 'index' );
        baidu.addClass( 
            this.__getId( 'item' ) + index, 
            this.__getClass( 'item-hover' ) );
    },
    
    /**
     * 选项移开事件
     * 
     * @private
     * @param {HTMLElement} item 选项
     */
    _itemOutHandler: function ( item ) {
        var index = item.getAttribute( 'index' );
        baidu.removeClass(
            this.__getId( 'item' ) + index, 
            this.__getClass( 'item-hover' ) );
    },
    
    /**
     * 释放控件
     * 
     * @private
     */
    __dispose: function () {
        this.onchange = null;
        esui.InputControl.prototype.__dispose.call( this );
    }
};

baidu.inherits( esui.Select, esui.InputControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Calendar.js
 * desc:    单日期选择器
 * author:  zhaolei, erik
 */

///import esui.InputControl;
///import esui.Layer;
///import esui.MonthView;
///import esui.Select;
///import esui.Button;
///import baidu.lang.inherits;
///import baidu.date.format;
///import baidu.date.parse;
///import baidu.dom.getPosition;
///import baidu.page.getWidth;

/**
 * 单日期选择器
 * 
 * @param {Object} options 控件初始化参数
 */
esui.Calendar = function (options) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'cal';

    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 1;

    esui.InputControl.call( this, options );

    // 初始化显示日期的年月
    this.now = this.now || esui.config.NOW || new Date();
    var now = this.now;
    now = this.now = new Date(
        now.getFullYear(), 
        now.getMonth(), 
        now.getDate()
    );

    // 日期格式化方式初始化
    this.__initOption( 'dateFormat', null, 'DATE_FORMAT' );
    this.__initOption( 'valueFormat', null, 'VALUE_FORMAT' );
    this.__initOption( 'range', null, 'RANGE' );

    // 初始化value与valueAsDate
    var valueAsDate;
    if ( this.value ) {
        valueAsDate = baidu.date.parse( this.value );
    }

    if ( valueAsDate ) {
        this.valueAsDate = valueAsDate;
    } else {
        this.valueAsDate = this.valueAsDate || new Date( now.getTime() );
    }
   
    
    valueAsDate = this.valueAsDate;
    this.month = parseInt( this.month, 10 );
    if ( isNaN( this.month ) ) {
        this.month = valueAsDate.getMonth();
    }
    this.year  = parseInt( this.year, 10 ) || valueAsDate.getFullYear();
};

esui.Calendar.DATE_FORMAT = 'yyyy-MM-dd';
esui.Calendar.VALUE_FORMAT = 'yyyy-MM-dd';
esui.Calendar.RANGE = {
    begin: new Date(2001, 8, 3),
    end: new Date(2046, 10, 4)
};


esui.Calendar.prototype = {
    /**
     * 绘制控件
     * 
     * @public
     * @param {HTMLElement} main 控件的容器元素
     */
    render: function () {
        var me = this;
        var main = me.main;
        
        if ( !me._isRendered ) {
            esui.InputControl.prototype.render.call( me );

            // 初始化主区域
            main.innerHTML = me._getMainHtml();
            main.onclick = me._getMainClickHandler();

            // 创建日历部件的控件对象
            me._renderLayer();

            me._isRendered = 1;
        }
        
        me.setValueAsDate( me.valueAsDate );
    },
   
    /**
     * 获取当前选取的日期(字符串表示)
     * 
     * @public
     * @return {string}
     */
    getValue: function () {
        if ( this.valueAsDate ) {
            return baidu.date.format( this.valueAsDate, this.valueFormat );
        }

        return '';
    },
    
    /**
     * 设置当前选取的日期
     * 
     * @public
     * @param {string} value 选取的日期(字符串表示)
     */
    setValue: function ( value ) {
        var valueAsDate = baidu.date.parse( value );
        valueAsDate && ( this.setValueAsDate( valueAsDate ) );
    },
    
    /**
     * 获取当前选取的日期对象
     * 
     * @public
     * @return {Date}
     */
    getValueAsDate: function () {
        return this.valueAsDate || null;
    },

    /**
     * 设置当前选取的日期
     * 
     * @public
     * @param {Date} valueAsDate 选取的日期
     */
    setValueAsDate: function ( valueAsDate ) {
        if ( !valueAsDate ) {
            return;
        }

        var me = this;
        me.valueAsDate = valueAsDate;
        
        me.getLayer()._controlMap.monthview.setValueAsDate( valueAsDate );
        me.month = valueAsDate.getMonth();
        me.year  = valueAsDate.getFullYear();
        me._repaintMonthView();
        baidu.g( me.__getId('text') ).innerHTML = baidu.date.format( valueAsDate, me.dateFormat );
    },
    
    /**
     * 获取主区域点击的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getMainClickHandler: function () {
        var me = this;

        return function ( e ) {
            if ( !me.isDisabled() ) {
                me.getLayer()._preventHide();
                me.toggleLayer();
            }
        };
    },

     
    /**
     * 显示|隐藏 浮动层
     * 
     * @public
     */
    toggleLayer: function () {
        var me = this;

        if ( this.getLayer().isShow() ) {
            me.hideLayer();
        } else {
            me.showLayer();
        }
    },
    
    /**
     * 隐藏浮动层
     * 
     * @public
     */
    hideLayer: function () {
        this.getLayer().hide();
        this.removeState( 'active' );
    },
    
    /**
     * 显示浮动层
     * 
     * @public
     */
    showLayer: function () {
        var me = this,
            main        = me.main,
            pos         = baidu.dom.getPosition(main),
            pageWidth   = baidu.page.getWidth(),
            layer       = me.getLayer(),
            layerWidth  = layer.main.offsetWidth,
            layerTop    = pos.top + main.offsetHeight,
            layerLeft;

        if ( pageWidth < ( pos.left + layerWidth ) ) {
            layerLeft = pos.left + main.offsetWidth - layerWidth;
        } else {
            layerLeft = pos.left;
        }

        layer.show( layerLeft, layerTop );
        this.addState( 'active' );
    },

    /**
     * 获取控件的html
     * 
     * @private
     * @return {string}
     */
    _getMainHtml: function () {
        var me    = this,
            input = 'text',
            date  = me.getValueAsDate();

        return esui.util.format( 
            me._tplMain,
            me.__getId( input ),
            me.__getClass( input ),
            me.__getClass( 'arrow' ),
            baidu.date.format( date, me.dateFormat ) 
        );
    },
    
    /**
     * 主显示区域的html
     * @private
     */
    _tplMain: '<div class="{1}" id="{0}">{3}</div><div class="{2}"></div>',
    
    /**
     * 浮动层html模板
     * @private
     */
    _tplLayer: '<div class="{0}"><table><tr>'
                    + '<td width="40" align="left"><div ui="type:Button;id:{1};skin:back"></div></td>'
                    + '<td><div ui="type:Select;id:{3};width:55"</td>'
                    + '<td><div ui="type:Select;id:{4};width:40"</td>'
                    + '<td width="40" align="right"><div ui="type:Button;id:{2};skin:forward"></div></td>'
                + '</tr></table></div><div ui="id:{5};type:MonthView"></div>',

    
    /**
     * 绘制浮动层
     * 
     * @private
     */
    _renderLayer: function () {
        var me = this,
            layerId = me.__getId( 'layer' ),
            layer   = esui.util.create( 'Layer', {
                    id      : layerId,
                    autoHide: 'click',
                    retype  : me._type,
                    partName: 'layer',
                    skin    : me.skin
                } );
        
        me._controlMap.layer = layer;
        layer.appendTo();
        layer.onhide = me._getLayerHideHandler();
        
        layer.main.innerHTML = esui.util.format(
            me._tplLayer,
            me.__getClass( 'layer-head' ),
            me.__getId( 'prevmonth' ),
            me.__getId( 'nextmonth' ),
            me.__getId( 'year' ),
            me.__getId( 'month' ),
            me.__getId( 'monthview' )
        );
        
        me._initLayerUI();
    },
    
    /**
     * 初始化浮动层上的子ui组件
     *
     * @private
     */
    _initLayerUI: function () {
        var prevMonth = this.__getId( 'prevmonth' );
        var nextMonth = this.__getId( 'nextmonth' );
        var year      = this.__getId( 'year' );
        var month     = this.__getId( 'month' );
        var monthView = this.__getId( 'monthview' );
        
        var layer        = this.getLayer();
        var uiProp       = {};
        var layerCtrlMap = layer._controlMap;
        var controlMap;
        

        uiProp[ monthView ] = {
            valueAsDate: this.valueAsDate, 
            customClass: this._getMVCustomClass()
        };
        uiProp[ month ] = {
            datasource: this._getMonthOptions( this.year ), 
            value: this.month
        };
        uiProp[ year ] = {
            datasource: this._getYearOptions(), 
            value: this.year
        };
        
        controlMap  = esui.util.init( layer.main, uiProp );
        prevMonth   = controlMap[ prevMonth ];
        nextMonth   = controlMap[ nextMonth ];
        year        = controlMap[ year ];
        month       = controlMap[ month ];
        monthView   = controlMap[ monthView ];

        layerCtrlMap.prevMonth  = prevMonth;
        layerCtrlMap.nextMonth  = nextMonth;
        layerCtrlMap.year       = year;
        layerCtrlMap.month      = month;
        layerCtrlMap.monthview  = monthView;

        year.onchange       = this._getYearChangeHandler();
        month.onchange      = this._getMonthChangeHandler();
        nextMonth.onclick   = this._getMonthNexter();
        prevMonth.onclick   = this._getMonthPrever();
        monthView.onchange  = this._getMVChangeHandler();
    },
    
    /**
     * 判断日期是否属于允许的区间中
     * 
     * @private
     * @param {Date} date
     * @return {boolean}
     */
    _isInRange: function ( date ) {
        var begin = this.range.begin;
        var end = this.range.end;

        if ( ( begin && date - begin < 0 ) 
             || ( end && end - date < 0 )
        ) {
            return false;
        }

        return true;
    },
    
    /**
     * 获取日历区域点击选择的handler
     *
     * @private
     * @return {Function}
     */
    _getMVChangeHandler: function () {
        var me = this;

        return function ( date ) {
            if ( !me._isInRange( date ) ) {
                return false;
            }

            if ( me.onchange( date ) !== false ) {
                me.value = date;
                me.hideLayer();

                var textEl = baidu.g( me.__getId( 'text' ) );
                textEl.innerHTML = baidu.date.format( date, me.dateFormat );
            } else {
                return false;
            }
        };
    },

    onchange: new Function(),
 
    /**
     * 获取日历选择的自定义样式生成器
     * 
     * @private
     * @return {Function}
     */
    _getMVCustomClass: function () {
        var me = this;
        return function ( date ) {
            if ( !me._isInRange( date ) ) {
                return this.__getClass( 'item-out' );
            }

            return '';
        };
    },

    /**
     * 获取“下一个月”按钮点击的handler
     *
     * @private
     * @return {Function}
     */
    _getMonthNexter: function () {
        var me = this;
        return function () {
            me._repaintMonthView( me.year, me.month + 1 );
        };
    },
    
    /**
     * 获取“上一个月”按钮点击的handler
     *
     * @private
     * @return {Function}
     */
    _getMonthPrever: function () {
        var me = this;
        return function () {
            me._repaintMonthView( me.year, me.month - 1 );
        };
    },

    /**
     * 获取年份切换的handler
     * 
     * @private
     * @return {Function}
     */
    _getYearChangeHandler: function () {
        var me = this;

        return function ( year ) {
            me.year = year;

            me._repaintMonthView( year, me.month );
            me.getLayer()._preventHide();
        };
    },
     
    /**
     * 获取月份切换的handler
     * 
     * @private
     * @return {Function}
     */
    _getMonthChangeHandler: function () {
        var me = this;

        return function ( month ) {
            me._repaintMonthView( me.year, month );
            me.getLayer()._preventHide();
        };
    },
    
    /**
     * 获取浮动层元素
     * 
     * @public
     * @return {HTMLElement}
     */
    getLayer: function () {
        return this._controlMap.layer;
    },

    /**
     * 获取浮动层关闭的handler
     * 
     * @private
     * @return {Function}
     */
    _getLayerHideHandler: function () {
        var me = this;
        return function () {
            me.removeState( 'active' );
        };
    },
    
    /**
     * 获取可选择的年列表
     * 
     * @private
     * @return {Array}
     */
    _getYearOptions: function () {
        var range  = this.range,
            result = [],
            end    = range.end.getFullYear(),
            i      = range.begin.getFullYear();

        for ( ; i <= end; i++ ) {
            result.push( {
                name  : i, 
                value : i
            } );
        }

        return result;
    },

    /**
     * 获取可选择的月列表
     * 
     * @private
     * @param {number} year 选中的年
     * @return {Array}
     */
    _getMonthOptions: function ( year ) {
        var range   = this.range,
            result  = [],
            i       = 0,
            len     = 11;
        
        if ( year == range.begin.getFullYear() ) {
            i = range.begin.getMonth();
        } 
        
        if ( year == range.end.getFullYear() ) {
            len = range.end.getMonth();
        }

        for ( ; i <= len; i++) {
            result.push( {
                name: (i + 1), 
                value: i
            });
        }

        return result;
    },
    
    /**
     * 绘制浮动层内的日历部件
     * 
     * @private
     */
    _repaintMonthView: function ( year, month ) {
        if ( !esui.util.hasValue( year ) ) {
            year = this.year;
        }
        if ( !esui.util.hasValue( month ) ) {
            month = this.month;
        }

        var me = this,
            range       = me.range,
            view        = new Date(year, month, 1),
            layer       = me.getLayer(),
            layerCM     = layer._controlMap,
            cal         = layerCM.monthview,
            rangeBegin  = range.begin.getFullYear() * 12 + range.begin.getMonth(),
            rangeEnd    = range.end.getFullYear() * 12 + range.end.getMonth(),
            viewMonth   = year * 12 + month,
            monthSelect = layerCM.month;
        
        month = view.getMonth();
        if ( rangeBegin - viewMonth > 0 ) {
            month += ( rangeBegin - viewMonth );
        } else if ( viewMonth - rangeEnd > 0 ) {
            month -= ( viewMonth - rangeEnd );
        }
        view.setMonth( month );
        me.month = view.getMonth();
        me.year  = view.getFullYear();
        
        monthSelect.datasource = me._getMonthOptions( me.year );
        monthSelect.render();
        monthSelect.setValue( me.month );
        
        layerCM.year.setValue( me.year );
        layerCM.prevMonth.setDisabled( ( rangeBegin >= viewMonth ) );
        layerCM.nextMonth.setDisabled( ( rangeEnd <= viewMonth ) );
        
        // 绘制日历部件
        cal.setView( view );
    },
    
    /**
     * 释放控件
     * 
     * @protected
     */
    __dispose: function () {
        this.onchange = null;
        esui.InputControl.prototype.__dispose.call( this );
    }
};

baidu.inherits( esui.Calendar, esui.InputControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/BoxGroup.js
 * desc:    选项组类
 * author:  zhaolei, erik
 */

///import esui.util;

/**
 * 选项组
 * 
 * @class
 * @description 
 *      该对象不往DOM上画东西，只做一些全选、反选、取值的事情
 * 
 * @param {Object} options 参数
 */
esui.BoxGroup = function( options ) {
    this.name     = options.name;
    this.type     = options.type;
    this.control  = options.control;
};

esui.BoxGroup.prototype = {
    /**
     * 获取选项组选中的值
     * 
     * @public
     * @return {string}
     */
    getValue: function() {
        var me      = this,
            boxs    = me.getBoxList(),
            len     = boxs.length,
            re      = [],
            i       = 0,
            box;
        
        for ( ; i < len; i++ ) {
            box = boxs[ i ];
            if ( box.isChecked() ) {
                re.push( box.getValue() );
            }
        }
        
        return re.join( ',' );
    },
    
    /**
     * 对选项组下所有选项进行全选
     * 
     * @public
     * @description 
     *      仅多选控件可用
     */
    selectAll: function() {
        if ( this.type != 'checkbox' ) {
            return;
        }

        var boxs    = this.getBoxList(),
            len     = boxs.length,
            i       = 0;
        
        for ( ; i < len; i++ ) {
            boxs[i].setChecked( true );
        }
    },
    
    /**
     * 对选项组下所有选项进行按值选中
     * 
     * @public
     * @param {Array} values
     */
    selectByValues: function(values) {
        var boxes   = this.getBoxList(),
            len     = boxes.length,
            i       = 0,
            box,
            v       = 0,
            vLen    = values.length;
        
        for ( i = 0 ; i < len; i++ ) {
            box = boxes[i];
            box.setChecked(false);
            value = box.getValue();
            for ( v = 0 ; v < vLen; v++) {
                if (value == values[v]) {
                    box.setChecked(true);
                    break;
                }
            }
        }
    },
    
    /**
     * 对选项组下所有选项进行反选
     * 
     * @public
     * @description 
     *      仅多选控件可用
     */
    selectInverse: function() {
        if ( this.type != 'checkbox' ) {
            return;
        }

        var boxs    = this.getBoxList(),
            len     = boxs.length,
            i       = 0,
            box;

        for ( ; i < len; i++ ) {
            box = boxs[ i ];
            box.setChecked( !box.isChecked() );
        }
    },
    
    /**
     * 获取选项组下的DOM元素列表
     * 
     * @public
     * @return {Array}
     */
    getBoxList: function() {
        var me      = this,
            name    = me.name,
            type    = me.type,
            result  = [],
            parent  = me.control.main,
            els,
            i,
            el,
            len,
            control;
        
        while ( parent 
                && parent.tagName != 'FORM' 
                && parent != document.body 
        ) {
            parent = parent.parentNode;
        }

        els = parent.getElementsByTagName( 'input' );
        len = els.length;
        for ( i = 0; i < len; i++ ) {
            el = els[ i ];
            control = esui.util.getControlByDom( el );
           
            if (control 
                && control instanceof esui.BoxControl
                && control.getType() == type 
                && control.name == name
            ) {
                result.push( control );
            }
        }
        
        return result;
    }
};
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/BoxControl.js
 * desc:    选择框控件基类
 * author:  zhaolei, erik
 */

///import esui.InputControl;
///import esui.BoxGroup;
///import baidu.lang.inherits;
///import baidu.string.encodeHTML;
///import baidu.dom.insertAfter;
///import baidu.array.contains;

/**
 * 选择框控件基类
 * 
 * @description 不直接使用，供CheckBox和Radio继承
 * @param {Object} options 控件初始化参数
 */
esui.BoxControl = function ( options ) {
    // 标识鼠标事件触发自动状态转换
    this._autoState = 1;

    esui.InputControl.call( this, options );
};

esui.BoxControl.prototype = {
    onclick: new Function(),
    
    /**
     * 获取控件类型，checkbox|radio
     * 
     * @public
     * @return {string}
     */
    getType: function () {
        return this._type;
    },

    /**
     * 设置选中状态
     * 
     * @public
     * @param {boolean} checked 状态
     */
    setChecked: function ( checked ) {
        this.main.checked = !!checked;
    },
    
    /**
     * 获取选中状态
     * 
     * @public
     * @return {boolean}
     */
    isChecked: function() {
        return this.main.checked;
    },
    
    /**
     * 设置box为不可用状
     * 
     * @public
     */
    disable: function () {
        this.main.disabled = true;
        this.disabled = true;

        esui.InputControl.prototype.disable.call( this );
    },

    /**
     * 设置box为不可用状
     * 
     * @public
     */
    enable: function () {
        this.main.disabled = false;
        this.disabled = false;

        esui.InputControl.prototype.enable.call( this );
    },
    
    /**
     * 设置box的只读状态
     * 
     * @public
     */
    setReadOnly: function ( readOnly ) {
        this.main.disabled = readOnly;
        readOnly ? this.addState( 'readonly' ) : this.removeState( 'readonly' );
    },
    
    /**
     * 获取分组
     * 
     * @public
     * @return {esui.BoxGroup}
     */
    getGroup: function() {
        return new esui.BoxGroup( {
            name    : this.name, 
            type    : this._type,
            control : this
        } );
    },
    
    /**
     * 设置值
     * 
     * @public
     * @param {string} value
     */
    setValue: function( value ) {
        this.main.setAttribute( 'value', value );
    },
    
    /**
     * 获取值
     * 
     * @public
     * @return {string}
     */
    getValue: function() {
        return this.main.getAttribute( 'value' ) || 'on';
    },
    
    /**
     * 渲染控件
     *
     * @public
     */
    render: function () {
        var me   = this,
            main = me.main,
            data = me.datasource,
            title,
            label,
            value;
        
        esui.InputControl.prototype.render.call( me );
        
        // 初始化click事件
        if ( !me._mainClick ) {
            me._mainClick = me.__getClickHandler();
            main.onclick  = me._mainClick;
        }

        // 插入点击相关的label元素
        if ( !me._label ) {
            label = document.createElement( 'label' );
            label.className = me.__getClass( 'label' );
            baidu.setAttr( label, 'for', main.id );

            baidu.dom.insertAfter( label, main );
            me._label = label;
        } else {
            label = me._label;
        }

        // 初始化label的内容
        title = me.title || main.title || me.getValue();
        label.innerHTML = baidu.encodeHTML( title );
        
        // 初始化disabled
        me.setDisabled ( !!me.disabled );

        // 初始化value
        me.value && me.setValue( me.value );
        value = me.getValue();
        
        // 初始化checked
        switch ( typeof data ) {
        case 'string':
        case 'number':
            me.setChecked( data == value );
            break;

        default:
            if ( data instanceof Array ) {
                me.setChecked( baidu.array.contains( data, value ) );
            }
            break;
        }
    },
    
    /**
     * 获取click事件handler
     *
     * @protected
     */
    __getClickHandler: function() {
        var me = this;
        return function ( e ) {
            if ( !me.isDisabled() ) {
                me.onclick( e );
            }
        };
    },

    /**
     * 释放控件
     * 
     * @protected
     */
    __dispose: function () {
        this.onclick    = null;
        this._mainClick = null;
        this._label     = null;

        esui.InputControl.prototype.__dispose.call( this );
    },

    /**
     * 创建控件主元素
     *
     * @protected
     * @return {HTMLInputElement}
     */
    __createMain: function () {
        return esui.InputControl.prototype.__createInput.call( this, {
            tagName : 'input',
            name    : this.name,
            type    : this.type
        } );
    }
};

baidu.inherits( esui.BoxControl, esui.InputControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/CheckBox.js
 * desc:    多选框控件
 * author:  zhaolei, erik
 */

///import esui.BoxControl;
///import baidu.lang.inherits;

/**
 * 多选框控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.CheckBox = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'checkbox';

    esui.BoxControl.call( this, options );
};

baidu.inherits( esui.CheckBox, esui.BoxControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Radio.js
 * desc:    单选框控件
 * author:  zhaolei, erik
 */

///import esui.BoxControl;
///import baidu.lang.inherits;

/**
 * 单选框控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.Radio = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type      = 'radiobox';

    esui.BoxControl.call( this, options );
};

baidu.inherits( esui.Radio, esui.BoxControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path:    esui/Mask.js
 * desc:    页面遮盖控件
 * author:  zhaolei, erik, linzhifeng
 */

///import esui;
///import baidu.dom.g;
///import baidu.event.on;
///import baidu.event.un;

/**
 * 页面遮盖控件
 */
esui.Mask = (function() {
    var maskClass = 'ui-mask';
    var idPrefix  = 'ctrlMask';

    /**
     * 遮盖层初始化
     *
     * @private
     */
    function init( level ) {
        var id = idPrefix + level,
            el = document.createElement( 'div' );
        
        el.id = id;
        document.body.appendChild( el );
    }

    /**
     * 重新绘制遮盖层的位置
     *
     * @private
     * @param {HTMLElement} mask 遮盖层元素.
     */
    function repaintMask( mask ) {
        var width = Math.max(
                        document.documentElement.clientWidth,
                        Math.max(
                            document.body.scrollWidth,
                            document.documentElement.scrollWidth)),
            height = Math.max(
                        document.documentElement.clientHeight,
                        Math.max(
                            document.body.scrollHeight,
                            document.documentElement.scrollHeight));

        mask.style.width  = width + 'px';
        mask.style.height = height + 'px';
    }

    /**
     * 页面大小发生变化的事件处理器
     *
     * @private
     */
    function getResizeHandler( level ) {
        return function () {
            repaintMask( getMask( level ) );
        };
    }

    /**
     * 获取遮盖层dom元素
     *
     * @private
     * @return {HTMLElement} 获取到的Mask元素节点.
     */
    function getMask( level ) {
        var id = idPrefix + level;
        var mask = baidu.g( id );

        if ( !mask ) {
            init( level );
        }

        return baidu.g( id );
    }
    
    var resizeHandlerMap = {};
    return {
        /**
         * 显示遮盖层
         */
        'show': function( level, type ) {
            level = level || '0';
            var mask = getMask( level ),
                clazz = [];
            
            clazz.push( maskClass );
            clazz.push( maskClass + '-level-' + level );
            if ( type ) {
                clazz.push( maskClass + '-' + type );
            }
            
            repaintMask( mask );

            mask.className = clazz.join( ' ' );
            mask.style.display = 'block';

            var resizeHandler = getResizeHandler( level );
            resizeHandlerMap[ level ] = resizeHandler;
            baidu.on( window, 'resize', resizeHandler );
        },

        /**
         * 隐藏遮盖层
         */
        'hide': function ( level ) {
            level = level || '0';
            var mask = getMask( level );
            if ( 'undefined' != typeof mask ) {
                mask.style.display = 'none';

                var resizeHandler = resizeHandlerMap[ level ];
                baidu.un( window, 'resize', resizeHandler );
            }
        }
    };
})();

/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Dialog.js
 * desc:    对话框控件
 * author:  zhaolei, erik, linzhifeng
 */

///import esui.Control;
///import esui.Layer;
///import esui.Button;
///import esui.Mask;
///import baidu.lang.inherits;
///import baidu.dom.draggable;
///import baidu.event.on;
///import baidu.event.un;

/**
 * 对话框控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.Dialog = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'dialog';
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;
    
    esui.Control.call( this, options );

    // 初始化自动定位参数
    this.__initOption('autoPosition', null, 'AUTO_POSITION');
    
    // 初始化可拖拽参数
    this.__initOption('draggable', null, 'DRAGGABLE');

    // 初始化关闭按钮参数
    this.__initOption('closeButton', null, 'CLOSE_BUTTON');
    
    // 初始化宽度
    this.__initOption('width', null, 'WIDTH');

    // 初始化距离顶端的高度
    this.__initOption('top', null, 'TOP');
    this.top = parseInt( this.top, 10 );

    this._resizeHandler = this._getResizeHandler();
};

esui.Dialog.prototype = {
    /**
     * 对话框头部的html模板
     * @private
     */
    _tplHead: '<div id="{0}" class="{1}" onmouseover="{4}" onmouseout="{5}">{2}</div>{3}',
    
    /**
     * 关闭按钮的html模板
     * @private
     */
    _tplClose: '<div ui="type:Button;id:{0};skin:layerclose"></div>',
    
    /**
     * 显示对话框
     * 
     * @public
     */
    show: function () {
        var mask = this.mask;
        var main;
        if ( !this.getLayer() ) {
            this.render();            
        }

        main = this.getLayer().main;

        // 浮动层自动定位功能初始化
        if ( this.autoPosition ) {
            baidu.on( window, 'resize', this._resizeHandler );
        }
        
        this._resizeHandler();     
        
        // 如果mask不是object，则会隐式装箱
        // 装箱后的Object不具有level和type属性
        // 相当于未传参数
        mask && esui.Mask.show( mask.level, mask.type );
        
        this._isShow = true;
    },
    
    /**
     * 隐藏对话框
     * 
     * @public
     */
    hide: function () {
        if ( this._isShow ) {
            if ( this.autoPosition ) {
                baidu.un( window, 'resize', this._resizeHandler );
            }
            
            this.getLayer().hide();
            this.mask && esui.Mask.hide( this.mask.level );
        }

        this._isShow = 0;
    },
    
    /**
     * 获取浮出层控件对象
     * 
     * @public
     * @return {esui.Layer}
     */
    getLayer: function () {
        return this._controlMap.layer;
    },

    /**
     * 设置标题文字
     * 
     * @public
     * @param {string} html 要设置的文字，支持html
     */
    setTitle: function ( html ) {
        var el = baidu.g( this.__getId( 'title' ) );
        if ( el ) {
            el.innerHTML = html;
        }
        this.title = html;
    },

    /**
     * 设置内容
     *
     * @public
     * @param {string} content 要设置的内容，支持html.
     */
    setContent: function ( content ) {
        this.content = content;
        var body = this.getBody();
        body && ( body.innerHTML = content );
    },

    
    /**
     * 获取页面resize的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getResizeHandler: function () {
        var me = this;
            
        return function () {
            var layer   = me.getLayer(),
                main    = layer.main,
                left    = me.left,
                top     = me.top; 
            
            if ( !left ) {
                left = (baidu.page.getViewWidth() - main.offsetWidth) / 2;
            }
            top += baidu.page.getScrollTop();
            
            if ( left < 0 ) {
                left = 0;
            }

            if ( top < 0 ) {
                top = 0;
            }
            
            layer.show( left, top );
        };
    },
    
    /**
     * 获取关闭按钮的点击handler
     *
     * @private
     * @return {Function}
     */
    _getCloseHandler: function () {
        var me = this;
        return function () {
            me.onhide();
            me.hide();
        };
    },
    
    onhide: new Function(),
        
    /**
     * 绘制对话框
     * 
     * @public
     */
    render: function () {
        var me      = this;
        var layer   = me.getLayer();
        var main    = me.main;
        
        // 避免重复创建    
        if ( layer ) {
            return;
        }
        
        layer = esui.util.create( 'Layer', {
                id      : me.__getId( 'layer' ),
                retype  : me._type,
                skin    : me.skin + ( me.draggable ? ' draggable' : '' ),
                width   : me.width,
                main    : main
            } );
        layer.appendTo();
        me._controlMap.layer = layer;
        
        
        // 初始化dialog结构
        me._initStruct();
        
        // 拖拽功能初始化
        if ( this.draggable ) {
            baidu.dom.draggable( layer.main, {handler:this.getHead()} );
        }
    },
    
    /** 
     * dialog只允许在body下。重置appendTo方法
     *
     * @public
     */ 
    appendTo: function () {
        this.render();
    },
    
    /** 
     * 初始化dialog的结构
     *
     * @private
     */
    _initStruct: function () {
        var layer = this.getLayer();
        var main = layer.main;
        var childs = [], childCount;
        var el;

        el = main.firstChild;
        while ( el ) {
            if ( el.nodeType == 1 ) {
                childs.push( el );
            }

            el = el.nextSibling;
        }
        childCount = childs.length;

        this._initHead( childCount < 2, childs[ 0 ] );
        this._initBody( childCount < 1, childs[ 1 ] || childs[ 0 ] );
        this._initFoot( childCount < 3, childs[ 2 ] );
    },

    /** 
     * dialog不需要创建main，方法置空
     *
     * @private
     */
    __createMain: function () {},
    
    /**
     * 初始化dialog的head
     *
     * @private
     * @param {boolean} needCreate 是否需要创建head元素
     * @param {HTMLElement} head 现有的head元素
     */
    _initHead: function ( needCreate, head ) {
        var me      = this;
        var layer   = me.getLayer();
        var main    = layer.main;
        var closeId = me.__getId( 'close' );
        var layerControl, closeBtn;

        if ( needCreate ) {
            head = document.createElement( 'div' );
            main.insertBefore( head, main.firstChild );
        } else {
            this.title = this.title || head.innerHTML;
        }
        
        baidu.addClass( head, this.__getClass( 'head' ) );
        head.id = this.__getId( 'head' );
        head.innerHTML = esui.util.format(
            me._tplHead,
            me.__getId( 'title' ),
            me.__getClass( 'title' ),
            me.title,
            (!me.closeButton  ? '' :
                esui.util.format(
                    me._tplClose,
                    closeId
            ) ),
            me.__getStrCall( '_headOver' ),
            me.__getStrCall( '_headOut' )
        );

        // 初始化关闭按钮
        layerControl = esui.util.init( head );
        closeBtn     = layerControl[ closeId ];
        if ( closeBtn ) {
            layer._controlMap._close = closeBtn;
            closeBtn.onclick = me._getCloseHandler();
        }
    },

    /**
     * 初始化dialog的body
     *
     * @private
     * @param {boolean} needCreate 是否需要创建body元素
     * @param {HTMLElement} body 现有的body元素
     */
    _initBody: function ( needCreate, body ) {
        if ( needCreate ) {
            body = document.createElement( 'div' );
            this.getLayer().main.appendChild( body );
        }
        
        baidu.addClass( body, this.__getClass( 'body' ) );
        body.id = this.__getId( 'body' );

        if ( this.content ) {
            body.innerHTML = this.content;
        } else {
            this.content = body.innerHTML;
        }
    },

    /**
     * 初始化dialog的foot
     *
     * @private
     * @param {boolean} needCreate 是否需要创建foot元素
     * @param {HTMLElement} foot 现有的foot元素
     */
    _initFoot: function ( needCreate, foot ) {
        var layer = this.getLayer();
        var controls;
        var control;
        var i = 0, len;
        var index = 0;

        if ( needCreate ) {
            foot = document.createElement( 'div' );
            layer.main.appendChild( foot );
        }
        
        baidu.addClass( foot, this.__getClass( 'foot' ) );
        foot.id = this.__getId( 'foot' );

        if ( this.footContent ) {
            foot.innerHTML = this.footContent;
        }

        // 初始化foot的按钮
        esui.util.init( foot );
        controls = esui.util.getControlsByContainer( foot );
        this._commandHandler = this._getCommandHandler();
        for ( len = controls.length; i < len; i++ ) {
            control = controls[ i ];
            if ( control instanceof esui.Button ) {
                control.onclick = this._commandHandler;
                control._dialogCmdIndex = index;
                index++;
            }

            layer._controlMap[ control.id ] = control;
        }
    },
    
    /**
     * 获取command handler
     *
     * @private
     * @return {Function} 
     */
    _getCommandHandler: function () {
        var me = this;
        return function () {
            if ( me.oncommand( { index: this._dialogCmdIndex } ) !== false ) {
                me.hide();
            }
        };
    },

    oncommand: new Function(),

    /**
     * 获取对话框主体的dom元素
     * 
     * @public
     * @return {HTMLElement}
     */
    getBody: function () {
        return baidu.g( this.__getId( 'body' ) );
    },
    
    /**
     * 获取对话框头部dom元素
     *
     * @public
     * @return {HTMLElement}
     */
    getHead: function () {
        return baidu.g( this.__getId( 'head' ) );
    },

    /**
     * 获取对话框腿部的dom元素
     * 
     * @public
     * @return {HTMLElement}
     */
    getFoot: function () {
        return baidu.g( this.__getId( 'foot' ) );
    },
    
    /**
     * 鼠标移上表头的handler
     * 
     * @private
     */
    _headOver: function () {
        baidu.addClass(
            this.getHead(), 
            this.__getClass( 'head-hover' ) );
    },
    
    /**
     * 鼠标移出表头的handler
     * 
     * @private
     */
    _headOut: function () {
        baidu.removeClass(
            this.getHead(), 
            this.__getClass( 'head-hover' ) );
    },

    /**
     * 释放控件
     * 
     * @private
     */
    __dispose: function () {
        if ( this.autoPosition ) {
            baidu.un( window, 'resize', this._resizeHandler );
        }
        
        this.oncommand = null;
        this._resizeHandler = null;
        esui.Control.prototype.__dispose.call( this );
    }
};

baidu.inherits( esui.Dialog, esui.Control );

esui.Dialog.TOP             = 100;
esui.Dialog.WIDTH           = 400;
esui.Dialog.CLOSE_BUTTON    = 1;
esui.Dialog.OK_TEXT         = '确定';
esui.Dialog.CANCEL_TEXT     = '取消';

esui.Dialog._increment = function () {
    var i = 0;
    return function () {
        return i++;
    };
}();

/**
 * alert dialog
 */
esui.Dialog.alert = (function () {
    var dialogPrefix = '__DialogAlert';
    var buttonPrefix = '__DialogAlertOk';

    var tpl     = '<div class="ui-dialog-icon ui-dialog-icon-{0}"></div><div class="ui-dialog-text">{1}</div>';
    var footTpl = '<button ui="type:Button;id:{0};skin:em">{1}</button>';

    /**
     * 获取按钮点击的处理函数
     * 
     * @private
     * @param {Function} onok 用户定义的确定按钮点击函数
     * @return {Function}
     */
    function getDialogCommander( onok, id ) {
        return function() {
            var dialog = esui.util.get( dialogPrefix + id );
            var isFunc = ( typeof onok == 'function' );

            if ( ( isFunc && onok( dialog ) !== false ) 
                 || !isFunc
            ) {
                dialog.hide();

                esui.util.dispose( buttonPrefix + id );
                esui.util.dispose( dialog.id );
            }

            return false;
        };
    }
    
    /**
     * 显示alert
     * 
     * @public
     * @param {Object} args alert对话框的参数
     * @config {string} title 显示标题
     * @config {string} content 显示的文字内容
     * @config {Function} onok 点击确定按钮的行为，默认为关闭提示框
     */
    function show ( args ) {
        if ( !args ) {
            return;
        }
        
        var index   = esui.Dialog._increment();
        var title   = args.title || '';
        var content = args.content || '';
        var type    = args.type || 'warning';
        
        var dialog  = esui.util.create('Dialog', 
                          {
                              id            : dialogPrefix + index,
                              closeButton   : 0,
                              title         : '', 
                              width         : 440,
                              mask          : {level: 3 || args.level},
                              footContent   : esui.util.format( footTpl, buttonPrefix + index, esui.Dialog.OK_TEXT )
                          });
        
        dialog.show();
        dialog.oncommand = getDialogCommander( args.onok, index );
        dialog.setTitle( title );
        dialog.getBody().innerHTML = esui.util.format( tpl, type, content );
    }

    return show;
})();

/**
 * confirm dialog
 */
esui.Dialog.confirm = (function () {
    var dialogPrefix    = '__DialogConfirm';
    var okPrefix        = '__DialogConfirmOk';
    var cancelPrefix    = '__DialogConfirmCancel';

    var tpl = '<div class="ui-dialog-icon ui-dialog-icon-{0}"></div><div class="ui-dialog-text">{1}</div>';
    var footTpl = '<button ui="type:Button;id:{0};skin:em">{1}</button><button ui="type:Button;id:{2};">{3}</button>';

    /**
     * 获取按钮点击的处理函数
     * 
     * @private
     * @param {Function} onok 用户定义的确定按钮点击函数
     * @param {Function} oncancel 用户定义的取消按钮点击函数
     * @return {Function}
     */
    function getDialogCommander( onok, oncancel, id ) {
        return function ( args ) {
            var dialog = esui.util.get( dialogPrefix + id );
            var eventHandler = ( args.index === 0 ? onok : oncancel );
            var isFunc = (typeof eventHandler == 'function');

            if ( (isFunc && eventHandler( dialog ) !== false ) 
                 || !isFunc 
            ) {
                dialog.hide();
                esui.util.dispose( dialog.id );
            }

            return false;
        };
    }
    
    /**
     * 显示confirm
     * 
     * @public
     * @param {Object} args alert对话框的参数
     * @config {string} title 显示标题
     * @config {string} content 显示的文字内容
     * @config {Function} onok 点击确定按钮的行为，默认为关闭提示框
     * @config {Function} oncancel 点击取消按钮的行为，默认为关闭提示框
     */
    function show ( args ) {
        if ( !args ) {
            return;
        }
        
        var index       = esui.Dialog._increment();
        var title       = args.title || '';
        var content     = args.content || '';
        var type        = args.type || 'warning';

        var dialog = esui.util.create('Dialog', 
                          {
                              id            : dialogPrefix + index,
                              closeButton   : 0,
                              title         : '', 
                              width         : 440,
                              mask          : {level: 3 || args.level},
                              footContent   : esui.util.format( footTpl, 
                                                                okPrefix + index, 
                                                                esui.Dialog.OK_TEXT,
                                                                cancelPrefix + index,
                                                                esui.Dialog.CANCEL_TEXT)
                          });

        dialog.show();
        dialog.setTitle( title );
        dialog.getBody().innerHTML = esui.util.format( tpl, type, content );
        dialog.oncommand = getDialogCommander( args.onok, args.oncancel, index );
    }
    
    return show;
})();
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/FormTab.js
 * desc:    表单Tab控件
 * author:  zhaolei, erik
 */


///import esui.Control;
///import baidu.lang.inherits;

/**
 * 表单Tab控件
 *
 * @constructor
 * @param {object} options 构造的选项.
 */
esui.FormTab = function ( options ) {
    this.disableHidden = 1;

    esui.Control.call( this, options );
    
    this.__initOption( 'autoDisabled', null, 'AUTO_DISABLED' );
    this.tabs = this.datasource || this.tabs || [];
};

esui.FormTab.AUTO_DISABLED = 1;

esui.FormTab.prototype = {
    /**
     * 初始化FormTab
     *
     * @public
     */
    init: function () {
        var me = this;
        this.activeIndex = this.activeIndex || 0;
        if ( !me.isInited ) {
            me._initEvent();
            me.isInited = 1;
        }
        
        setTimeout( function () {
                me.setActiveIndex( me.activeIndex );
            }, 0 );
    },

    render: function () {
        this.init();
    },

    __createMain: function () {
        return null;
    },
    
    /**
     * 初始化FormTab的行为
     *
     * @private
     */
    _initEvent: function () {
        var tabs = this.tabs;
        var len  = tabs.length;
        var i;
        var tab;
        var radio;
        
        for ( i = 0; i < len; i++ ) {
            tab   = tabs[ i ];
            radio = tab.radio;
            if ( radio ) {
                radio = esui.util.get( radio );
                radio && ( radio.onclick = this._getRadioClickHandler( i ) );
            }
        }
    },
    
    _getRadioClickHandler: function ( index ) {
        var me = this;
        return function () {
            return me._select( index );
        };
    },
    
    /**
     * 选择标签
     * 
     * @private
     * @param {number} index 标签序号
     */
    _select: function ( index ) {
        if ( this.onchange( index, this.tabs[ index ] ) !== false ) {
            this.setActiveIndex( index );
            return;
        }

        return false;
    },
    
    /**
     * 选择活动标签
     * 
     * @public
     * @param {number} index 标签序号
     */
    setActiveIndex: function( index ) {
        var tabs = this.tabs;
        var len = tabs.length;

        if ( index >= 0 && index < len ) {
            esui.util.get( tabs[ index ].radio ).setChecked( true );
            this.activeIndex = index;
        }

        this._resetPanel();
    },
    
    onchange: new Function(),
    
    /**
     * 重置tab对应的panel的显示隐藏状态
     * 
     * @private
     */
    _resetPanel: function () {
        var tabs = this.tabs;
        var len  = tabs.length;
        var i;
        var tab;
        var panel;
        var radio;
        var checked;

        for ( i = 0; i < len; i++ ) {
            tab     = tabs[ i ];
            radio   = tab.radio;
            panel   = tab.panel;
            panel   = panel && baidu.g( panel );

            if ( radio && panel ) {
                radio = esui.util.get( radio );
                if ( radio ) {
                    checked = radio.isChecked();

                    this.autoDisabled 
                        && esui.util.setDisabledByContainer( panel, !checked );
                    panel.style.display = checked ? '' : 'none';
                }
            }
        }
    }
};

baidu.inherits( esui.FormTab, esui.Control );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Label.js
 * desc:    标签显示控件
 * author:  erik, tongyao, yanjunyi
 */

///import esui.Control;
///import baidu.lang.inherits;

/**
 * 标签显示控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.Label = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'label';

    // 标识鼠标事件触发自动状态转换
    this._autoState = 1;

    esui.Control.call( this, options );
};

esui.Label.prototype = {
    /**
     * 渲染控件
     *
     * @public
     */
    render: function () {
        var me = this;
        
        esui.Control.prototype.render.call( me );
        
        if ( this.text ) {
            this.content = baidu.encodeHTML( this.text );
        }

        this.setContent( this.content );
        this.setTitle( this.title );
    },

    /**
     * 设置显示内容（不经过html编码）
     *
     * @public
     * @param {string} content
     */
    setContent: function ( content ) {
        this.content = content || '';
        this.main.innerHTML = this.content;
    },
    
    /**
     * 设置显示文字（经过html编码）
     *
     * @public
     * @param {string} text
     */
    setText: function ( text ) {
        text = text || '';
        this.setContent( baidu.encodeHTML( text ) );
    },
    
    /**
     * 设置自动提示的title
     *
     * @public
     * @param {string} title
     */
    setTitle: function ( title ) {
        this.title = title || '';
        this.main.setAttribute( 'title', this.title );
    },

    /**
     * 创建控件主元素
     *
     * @protected
     * @return {HTMLElement}
     */
    __createMain: function () {
        return document.createElement( 'span' );
    }
};

baidu.inherits( esui.Label, esui.Control );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Link.js
 * desc:    链接控件
 * author:  zhaolei, erik
 */


///import esui.Control;
///import baidu.string.encodeHTML;
///import baidu.lang.inherits

/**
 * 链接控件
 * 
 * @class
 * @param {Object} options 控件初始化参数
 */
esui.Link = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'link';

    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.Control.call( this, options );
};

esui.Link.prototype = {
    /**
     * 渲染控件
     * 
     * @public
     * @param {Object} main 控件挂载的DOM
     */
    render: function () {
        var me = this;
        esui.Control.prototype.render.call( me );
        
        // 设置各种属性
        me.href    && me.setHref( me.href );
        me.text    && me.setText( me.text );
        me.content && me.setContent( me.content );
        me.target  && me.setTarget( me.target );
        
        // 绑定点击事件处理
        if ( !me._clickHandler ) {
            me._clickHandler = me._getClickHandler();
            me.main.onclick = me._clickHandler;
        }
    },

    /**
     * 设置链接地址
     *
     * @public
     * @param {string} href 链接地址
     */
    setHref: function ( href ) {
        !href && ( href = '' );
        this.main.href = href;
    },

    /**
     * 设置链接显示文字。经过html encode
     *
     * @public
     * @param {string} text 显示文字
     */
    setText: function ( text ) {
        !text && ( text = '' );
        this.setContent( baidu.encodeHTML( text ) );
    },
    
    /**
     * 设置链接显示内容。不经过html encode
     *
     * @public
     * @param {string} content 链接显示内容
     */
    setContent: function ( content ) {
        !content && ( content = '' );
        this.main.innerHTML = content;
    },

    /**
     * 设置链接target
     *
     * @public
     * @param {string} target 链接target
     */
    setTarget: function ( target ) {
        !target && ( target = '' );
        this.main.target = target;
    },
    
    onclick: new Function(),
    
    /**
     * 生成控件主元素
     *
     * @protected
     * @return {HTMLElement}
     */
    __createMain: function () {
        return document.createElement( 'a' );
    },

    /**
     * 获取点击的handler
     * 
     * @private
     * @return {Function}
     */
    _getClickHandler: function() {
        var me = this;
        return function ( e ) {
            return me.onclick( e );
        };
    },
    
    /**
     * 销毁控件
     * 
     * @private
     */
    __dispose: function () {
        this._clickHandler = null;
        esui.Control.prototype.__dispose.call( this );
    }
};

baidu.inherits( esui.Link, esui.Control );

/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/MiniMultiCalendar.js
 * desc:    小型多日期选择器
 * author:  zhaolei, erik
 */

///import esui.InputControl;
///import baidu.lang.inherits;
///import baidu.date.format;
///import baidu.date.parse;

/**
 * 多日期选择器
 * 
 * @param {Object} options 控件初始化参数
 */
esui.MiniMultiCalendar = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'mmcal';

    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;
    
    esui.InputControl.call( this, options );
    
    // 声明当前格式
    this.now = this.now || esui.config.NOW || new Date();

    // 声明shortcut选项组
    this.__initOption( 'options', null, 'OPTIONS' );

    // 声明日期格式
    this.__initOption( 'valueFormat', null, 'VALUE_FORMAT' );

    // 初始化value与valueAsObject
    var valueAsObject, valueSplits;
    if ( this.value ) {
        valueSplits = this.value.split( ',' ); 
        if ( valueSplits.length == 2 ) {
            valueAsObject = {
                begin   : baidu.date.parse( valueSplits[ 0 ] ),
                end     : baidu.date.parse( valueSplits[ 1 ] )
            };
        }
    }

    if ( valueAsObject ) {
        this.valueAsObject = valueAsObject;
    } else {
        this.valueAsObject = this.valueAsObject || {
            begin   : new Date( this.now ),
            end     : new Date( this.now )
        };
    }
};

esui.MiniMultiCalendar.VALUE_FORMAT = 'yyyy-MM-dd';

esui.MiniMultiCalendar.prototype = {
    /**
     * 获取当前选取的日期（字符串类型）
     * 
     * @public
     * @return {string}
     */
    getValue: function () {
        var valueAsObj  = this.valueAsObject;
        var format      = this.valueFormat;
        var begin, end;

        if ( valueAsObj
             && ( begin = valueAsObj.begin )
             && ( end = valueAsObj.end )
        ) {
            return baidu.date.format( begin, format )
                    + ','
                    + baidu.date.format( end, format );
        }

        return '';
    },
    
    /**
     * 设置当前选取的日期（字符串类型）
     * 
     * @public
     * @param {string} value
     */
    setValue: function ( value ) {
        value = value.split( ',' );
        if ( value.length == 2 ) {
            var begin = baidu.date.parse( value[ 0 ] );
            var end = baidu.date.parse( value[ 1 ] );

            if ( begin && end ) {
                this.setValueAsObject( {
                    begin   : begin,
                    end     : end
                } );
            }
        }
    },
    
    /**
     * 获取当前选取的日期（{begin:Date,end:Date}类型）
     * 
     * @public
     * @return {Object}
     */
    getValueAsObject: function () {
        return this.valueAsObject || null;
    },

    /**
     * 选取日期区间
     * 
     * @public
     * @param {Object} value 日期区间对象
     */
    setValueAsObject: function ( valueAsObject ) {
        this.selectedIndex = null;
        this.valueAsObject = valueAsObject;
        this.render();
    },

    /**
     * 绘制控件
     * 
     * @public
     */
    render: function () {
        esui.InputControl.prototype.render.call( this );
        this.main.innerHTML = this._getHtml();
    },
    
    /**
     * 快捷项的模板
     * @private
     */
     _tplItem: '<span index="{0}" class="{1}" id="{2}"{4}>{3}</span>',

    /**
     * 比较两个日期是否同一天
     * 
     * @private
     * @param {Date} date1 日期
     * @param {Date} date2 日期
     * @return {boolean}
     */
    _isSameDate: function ( date1, date2 ) {
        if ( date2 != "" && date1 != "" ) {
            if ( date1.getFullYear() == date2.getFullYear()
                 && date1.getMonth() == date2.getMonth()
                 && date1.getDate() == date2.getDate()
            ) {
                return true;
            }
        }

        return false;
    },

    /**
     * 获取控件的html
     * 
     * @private
     * @return {string}
     */
    _getHtml: function () {
        var me          = this,
            value       = me.valueAsObject,
            opList      = me.options,
            len         = opList.length, 
            idPrefix    = me.__getId( 'option' ),
            i, 
            opValue, 
            option,
            clazz, callStr,
            html = [];

           me._currentName = '';
        if ( esui.util.hasValue( me.selectedIndex ) ) {
            me._currentName = opList[ me.selectedIndex ].name;
        } else {
            for ( i = 0; i < len; i++ ) {
                option = opList[ i ];
                opValue = option.getValue.call( me );

                if ( me._isSameDate( value.begin, opValue.begin )
                     && me._isSameDate( value.end, opValue.end )
                ) {
                    me.selectedIndex = i;
                    me._currentName = option.name;
                    break;
                }
            }
        }
        
        for ( i = 0; i < len; i++ ) {
            option  = opList[i];
            opValue = option.getValue.call( me );
            clazz   = me.__getClass( 'option' );
            callStr = ' onclick="' + me.__getStrCall( "_selectByIndex", i ) + '"';
            
            if ( i == me.selectedIndex ) {
                clazz = clazz + ' ' + me.__getClass( 'option-selected' );
                callStr = '';
            }
            
            html.push(
                esui.util.format(
                    me._tplItem,
                    i,
                    clazz,
                    idPrefix + i,
                    option.name,
                    callStr
                )
            );
        }

        return html.join( '&nbsp;|&nbsp;' );
    },

    onchange: new Function(),
    
    /**
     * 根据索引选取日期
     * 
     * @private
     * @param {number} index 
     */
    _selectByIndex: function ( index ) {
        var opList = this.options,
            item,
            value;

        if ( index < 0 || index >= opList.length ) {
            return;
        }
        
        item = opList[ index ];
        value = item.getValue.call( this );
        
        if ( this.onchange( value, item.name, index ) !== false ) {
            this.setSelectedIndex( index );
        }
    },
    
    /**
     * 按快捷项index选取日期区间
     * 
     * @public
     * @param {number} index 快捷项index
     */
    setSelectedIndex: function ( index ) {
        var opList = this.options, 
            item = opList[ index ];

        if ( index < 0 || index >= opList.length ) {
            return;
        }

        this.selectedIndex = index;
        this.value = item.getValue.call( this );
        this.render();
    },
    
    /**
     * 获取快捷方式的名称
     * 
     * @public
     * @param {Object} opt_value 日期区间值
     * @return {string}
     */
    getName: function ( opt_value ) {
        if ( opt_value ) {
            var items = this.options;
            var i, item, value;
            var len = items.length;

            for ( i = 0; i < len; i++ ) {
                item = items[ i ];
                value = item.getValue.call( this );

                if ( this._isSameDate( value.begin, opt_value.begin )
                     && this._isSameDate( value.end, opt_value.end )
                ) {
                    return item.name;
                }
            }

            return '';
        }

        return this._currentName;
    }
};

/**
 * 日期区间选项列表配置
 */
esui.MiniMultiCalendar.OPTIONS = [
    {
        name: '昨天',
        value: 0,
        getValue: function () {
            var yesterday = new Date( this.now.getTime() );
            yesterday.setDate( yesterday.getDate() - 1 );
            
            return {
                begin   : yesterday,
                end     : yesterday
            };
        }
    },
    {
        name: '最近7天',
        value: 1,
        getValue: function () {
            var begin   = new Date( this.now.getTime() ),
                end     = new Date( this.now.getTime() );
            
            end.setDate( end.getDate() - 1 );
            begin.setDate( begin.getDate() - 7 );
            
            return {
                begin   : begin,
                end     : end
            };
        }
    },
    {
        name: '上周',
        value: 2,
        getValue: function () {
            var now     = this.now,
                begin   = new Date( this.now.getTime() ),
                end     = new Date( this.now.getTime() ),
                _wd     = 1; //周一为第一天;
            
            if ( begin.getDay() < _wd % 7 ) {
                begin.setDate( begin.getDate() - 14 + _wd - begin.getDay() );
            } else {
                begin.setDate( begin.getDate() - 7 - begin.getDay() + _wd % 7 );
            }
            begin.setHours( 0, 0, 0, 0 );
            end.setFullYear( begin.getFullYear(), begin.getMonth(), begin.getDate() + 6 );
            end.setHours( 0, 0, 0, 0 );
            
            return {
                begin   : begin,
                end     : end
            };
        }
    },
    {
        name: '本月',
        value: 3,
        getValue: function () {
            var now     = this.now,
                begin   = new Date(this.now.getTime()),
                end     = new Date(this.now.getTime());
            begin.setDate( 1 );
            
            return {
                begin   : begin,
                end     : end
            };
        }
    },
    {
        name: '上个月',
        value: 4,
        getValue: function () {
            var now     = this.now,
                begin   = new Date( now.getFullYear(), now.getMonth() - 1, 1 ),
                end     = new Date( now.getFullYear(), now.getMonth(), 1 );

            end.setDate( end.getDate() - 1 );
            
            return {
                begin   : begin,
                end     : end
            };
        }
    },
    {
        name: '上个季度',
        value: 5,
        getValue: function () {
            var now     = this.now,
                begin   = new Date( now.getFullYear(), now.getMonth() - now.getMonth()%3 - 3, 1 ),
                end     = new Date( now.getFullYear(), now.getMonth() - now.getMonth()%3, 1 );

            end.setDate( end.getDate() - 1 );
            
            return {
                begin   :   begin,
                end     :   end
            };
        }
    }
];

baidu.inherits( esui.MiniMultiCalendar, esui.InputControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/MultiCalendar.js
 * desc:    多日期选择器
 * author:  erik, zhaolei
 */

///import esui.InputControl;
///import esui.Layer;
///import esui.MonthView;
///import esui.Select;
///import esui.Button;
///import esui.MiniMultiCalendar;
///import baidu.lang.inherits;
///import baidu.date.format;
///import baidu.date.parse;

/**
 * 多日期选择器
 * 
 * @param {Object} options 控件初始化参数
 */
esui.MultiCalendar = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'mcal';

    // 标识鼠标事件触发自动状态转换
    this._autoState = 1;
    
    esui.InputControl.call( this, options );

    // 声明日期格式
    this.__initOption( 'dateFormat', null, 'DATE_FORMAT' );
    this.__initOption( 'valueFormat', null, 'VALUE_FORMAT' );
    
    // 声明按钮文字
    this.__initOption( 'okText', null, 'OK_TEXT' );
    this.__initOption( 'cancelText', null, 'CANCEL_TEXT' );

    // 声明浮动层侧边的说明
    this.__initOption( 'beginSideTitle', null, 'BEGIN_SIDE_TITLE' );
    this.__initOption( 'endSideTitle', null, 'END_SIDE_TITLE' );

    // 初始化当前日期
    this.now = this.now || esui.config.NOW || new Date();
    var now = this.now;
    
    // 初始化value与valueAsObject
    var valueAsObject, valueSplits;
    if ( this.value ) {
        valueSplits = this.value.split( ',' ); 
        if ( valueSplits.length == 2 ) {
            valueAsObject = {
                begin   : baidu.date.parse( valueSplits[ 0 ] ),
                end     : baidu.date.parse( valueSplits[ 1 ] )
            };
        }
    }

    if ( valueAsObject ) {
        this.valueAsObject = valueAsObject;
    } else {
        this.valueAsObject = this.valueAsObject || {
            begin   : new Date( now ),
            end     : new Date( now )
        };
    }
    
    // 初始化可选择的日期
    this.__initOption( 'range', null, 'RANGE' );

    // 初始化显示的日期
    this.view = {
        begin   : new Date( this.valueAsObject.begin ),
        end     : new Date( this.valueAsObject.end )
    };
};

esui.MultiCalendar.OK_TEXT          = '确定';
esui.MultiCalendar.CANCEL_TEXT      = '取消';
esui.MultiCalendar.BEGIN_SIDE_TITLE = '开始日期'
esui.MultiCalendar.END_SIDE_TITLE   = '结束日期';
esui.MultiCalendar.DATE_FORMAT      = 'yyyy-MM-dd';
esui.MultiCalendar.VALUE_FORMAT     = 'yyyy-MM-dd';
esui.MultiCalendar.RANGE = {
    begin: new Date(2001, 8, 3),
    end: new Date(2046, 10, 4)
};

esui.MultiCalendar.prototype = {
    /**
     * 绘制控件
     * 
     * @public
     */
    render: function () {
        var me = this;
        var main = this.main;
        
        if ( !me._isRendered ) {
            esui.InputControl.prototype.render.call( me );

            main.innerHTML = me._getMainHtml();
            main.onclick = me._getMainClickHandler();
            me._renderLayer();
            me._isRendered = 1;
        }

        me.setValueAsObject( me.valueAsObject );
    },
    
    
    /**
     * 获取当前选取的日期（{begin:Date,end:Date}类型）
     * 
     * @public
     * @return {Object}
     */
    getValueAsObject: function () {
        return this.valueAsObject || null;
    },

    /**
     * 获取当前选取的日期（字符串类型）
     * 
     * @public
     * @return {string}
     */
    getValue: function () {
        var valueAsObj  = this.valueAsObject;
        var format      = this.valueFormat;
        var begin, end;

        if ( valueAsObj
             && ( begin = valueAsObj.begin )
             && ( end = valueAsObj.end )
        ) {
            return baidu.date.format( begin, format )
                    + ','
                    + baidu.date.format( end, format );
        }

        return '';
    },
    
    /**
     * 设置当前选取的日期
     * 
     * @public
     * @param {Object} obj 日期区间（{begin:Date,end:Date}类型）
     */
    setValueAsObject: function ( obj ) {
        if ( obj && obj.begin && obj.end ) {
            this.valueAsObject = obj;
            this._controlMap.shortcut.setValueAsObject( obj );
            this._repaintMain( obj );
        }
    },
    
    /**
     * 设置当前选取的日期（字符串类型）
     * 
     * @public
     * @param {string} value
     */
    setValue: function ( value ) {
        value = value.split( ',' );
        if ( value.length == 2 ) {
            var begin = baidu.date.parse( value[ 0 ] );
            var end = baidu.date.parse( value[ 1 ] );

            if ( begin && end ) {
                this.setValueAsObject( {
                    begin   : begin,
                    end     : end
                } );
            }
        }
    },

    /**
     * 主显示区域的模板
     * @private
     */
    _tplMain: '<span id="{3}" class="{4}" style="display:none"></span><span id="{0}" class="{1}"></span><div class="{2}" arrow="1"></div>',

    /**
     * 浮动层html模板
     * @private
     */
    _tplLayer: '<div ui="id:{0};type:MiniMultiCalendar"></div>'
                + '<div class="{1}">{5}{6}</div>'
                + '<div class="{2}"><div ui="type:Button;id:{3};skin:em">{7}</div><div ui="type:Button;id:{4}">{8}</div></div>'
                + '<div ui="type:Button;id:{9};skin:layerclose"></div>',
    
    /**
     * 浮动层单侧html模板
     * @private
     */
    _tplSide: '<div class="{0}">'
                + '<div class="{1}"><b>{9}</b><span id="{2}"></span></div>'
                + '<div class="{4}"><table><tr>'
                    + '<td width="40" align="left"><div ui="type:Button;id:{5};skin:back"></div></td>'
                    + '<td><div ui="type:Select;id:{7};width:55"</td>'
                    + '<td><div ui="type:Select;id:{8};width:40"</td>'
                    + '<td width="40" align="right"><div ui="type:Button;id:{6};skin:forward"></div></td>'
                + '</tr></table></div><div ui="id:{3};type:MonthView"></div></div>',
    
    

    /**
     * 获取主区域点击的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getMainClickHandler: function () {
        var me = this;

        return function ( e ) {
            if ( !me.isDisabled() ) {
                me.getLayer()._preventHide();
                me.toggleLayer();
            }
        };
    },

    /**
     * 获取取消按钮的点击handler
     * 
     * @private
     * @return {Function}
     */
    _getCancelHandler: function () {
        var me = this;
        return function () {
            me.hideLayer();
        };
    },
    
    /**
     * 获取确定按钮的点击handler
     * 
     * @private
     * @return {Function}
     */
    _getOkHandler: function () {
        var me = this,
            parse = baidu.date.parse;
            
        function getValue( type ) {
            return me._controlMap[ type + 'monthview' ].getValueAsDate();
        }
        
        return function () {
            var begin  = getValue( 'begin' ),
                end    = getValue( 'end' ),
                dvalue = end - begin, 
                valueAsObject;

            if ( dvalue > 0 ) {
                valueAsObject = {
                    'begin': begin,
                    'end': end
                };
            } else {
                valueAsObject = {
                    'begin': end,
                    'end': begin
                };
            }
            
            if ( me.onchange( valueAsObject, me.getShortcutText( valueAsObject ) ) !== false ) {
                me.valueAsObject = valueAsObject;

                me._controlMap.shortcut.setValueAsObject( valueAsObject );
                me._repaintMain( valueAsObject );
                me.hideLayer();
            }
        };
    },
    
    onchange: new Function(),
    
    /**
     * 获取日历选择的自定义样式生成器
     * 
     * @private
     * @return {Function}
     */
    _getMVCustomClass: function () {
        var me = this;
        return function ( date ) {
            if ( !me._isInRange( date ) ) {
                return this.__getClass( 'item-out' );
            }

            return '';
        };
    },

    /**
     * 获取日历选择的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getCalChangeHandler: function ( type ) {
        var me = this;

        return function ( date ) {
            if ( !me._isInRange( date ) ) {
                return false;
            }

            me.tempValue[ type ] = date;
            var title = baidu.g( me.__getId( type + 'title' ) );
            title.innerHTML = baidu.date.format( date, me.dateFormat );
        };
    },
    
    /**
     * 判断日期是否属于允许的区间中
     * 
     * @private
     * @param {Date} date
     * @return {boolean}
     */
    _isInRange: function ( date ) {
        var begin = this.range.begin;
        var end   = this.range.end;

        if ( ( begin && date - begin < 0 ) 
             || ( end && end - date < 0 )
        ) {
            return false;
        }

        return true;
    },

    /**
     * 重新绘制main区域
     * 
     * @private
     */
    _repaintMain: function ( valueAsObject, shortcutText ) {
        var scText = shortcutText || this.getShortcutText( valueAsObject );
        var scEl   = baidu.g( this.__getId( 'shortcuttext' ) );

        baidu.g( this.__getId( 'text' ) ).innerHTML = this.getValueText( valueAsObject );
        scText && ( scEl.innerHTML = scText );
        scEl.style.display = scText ? '' : 'none';
    },
    
    /**
     * 重新绘制浮动层侧边栏的显示内容
     * 
     * @private
     * @param {string} type 侧边栏类型，begin|end
     */
    _repaintSide: function ( type ) {
        var me          = this,
            range       = me.range,
            view        = me.view[ type ],
            year        = view.getFullYear(),
            month       = view.getMonth(),
            valueAsDate = me.tempValue[ type ],
            cal         = me._controlMap[ type + 'monthview' ],
            monthSelect = me._controlMap[ type + 'month' ],
            rangeBegin  = range.begin.getFullYear() * 12 + range.begin.getMonth(),
            rangeEnd    = range.end.getFullYear() * 12 + range.end.getMonth(),
            viewMonth   = view.getFullYear() * 12 + view.getMonth(),
            titleEl     = baidu.g( me.__getId( type + 'title' ) );
        
        monthSelect.datasource = me._getMonthOptions( year );
        monthSelect.render();
        if ( rangeBegin - viewMonth > 0 ) {
            month += ( rangeBegin - viewMonth );
        } else if ( viewMonth - rangeEnd > 0 ) {
            month -= ( viewMonth - rangeEnd );
        }
        monthSelect.setValue( month );
        view.setMonth( month );

        me._controlMap[ type + 'year' ].setValue( year );
        me._controlMap[ type + 'prevmonth' ].setDisabled( ( rangeBegin >= viewMonth ) );
        me._controlMap[ type + 'nextmonth' ].setDisabled( ( rangeEnd <= viewMonth ) );
        
        titleEl.innerHTML = baidu.date.format( valueAsDate, me.dateFormat );

        // 绘制日历部件
        cal.setValueAsDate( valueAsDate );
        cal.setView( view );
    },

    /**
     * 获取控件的html
     * 
     * @private
     * @return {string}
     */
    _getMainHtml: function () {
        var me      = this,
            show    = 'text',
            showsc  = 'shortcuttext';

        return esui.util.format(
            me._tplMain,
            me.__getId( show ),
            me.__getClass( show ),
            me.__getClass( 'arrow' ),
            me.__getId( showsc ),
            me.__getClass( showsc )
        );
    },

    /**
     * 获取浮动层侧边栏的html
     * 
     * @private
     * @param {string} type 侧边栏类型,begin|end
     * @return {string}
     */
    _getLayerSideHtml: function ( type ) {
        var me = this;

        return esui.util.format(
            me._tplSide, 
            me.__getClass( type ),
            me.__getClass( 'side-title' ),
            me.__getId( type + 'title' ),
            me.__getId( type + 'monthview' ),
            me.__getClass( 'side-func' ),
            me.__getId( type + 'prevmonth' ),
            me.__getId( type + 'nextmonth' ),
            me.__getId( type + 'year' ),
            me.__getId( type + 'month' ),
            me[ type + 'SideTitle' ]
        );
    },

    /**
     * 绘制浮动层
     * 
     * @private
     */
    _renderLayer: function () {
        var me = this,
            layerId = me.__getId( 'layer' ),
            layer = esui.util.create( 'Layer' , 
                {
                    id       : layerId,
                    autoHide : 'click',
                    retype   : me._type,
                    partName : 'layer',
                    skin     : me.skin
                } );
        
        me._controlMap.layer = layer;
        layer.appendTo();
        layer.onhide = me._getLayerHideHandler();
        layer.main.innerHTML = esui.util.format(
            me._tplLayer,
            me.__getId( 'shortcut' ),
            me.__getClass( 'body' ),
            me.__getClass( 'foot' ),
            me.__getId( 'ok' ),
            me.__getId( 'cancel' ),
            me._getLayerSideHtml( 'begin' ),
            me._getLayerSideHtml( 'end' ),
            me.okText,
            me.cancelText,
            me.__getId( 'close' ) 
        );

        me._initLayerUI();
    },
    
    /**
     * 获取浮动层关闭的handler
     * 
     * @private
     * @return {Function}
     */
    _getLayerHideHandler: function () {
        var me = this;
        return function () {
            me.removeState( 'active' );
        };
    },
    
    /**
     * 初始化浮动层的ui子控件
     * 
     * @private
     */
    _initLayerUI: function () {
        // 绘制子控件
        var layer       = this.getLayer(),
            ok          = this.__getId('ok'),
            cancel      = this.__getId('cancel'),
            close       = this.__getId('close'),
            beginM      = this.__getId('beginmonth'),
            endM        = this.__getId('endmonth'),
            beginY      = this.__getId('beginyear'),
            endY        = this.__getId('endyear'),
            beginPM     = this.__getId('beginprevmonth'),
            endPM       = this.__getId('endprevmonth'), 
            beginNM     = this.__getId('beginnextmonth'), 
            endNM       = this.__getId('endnextmonth'),
            beginMV     = this.__getId('beginmonthview'),
            endMV       = this.__getId('endmonthview'),
            shortcut    = this.__getId('shortcut'),
            uiProp      = {},
            view        = this.view,
            beginView   = view.begin,
            endView     = view.end,
            beginYear   = beginView.getFullYear(),
            endYear     = endView.getFullYear(),
            beginMonth  = beginView.getMonth(),
            endMonth    = endView.getMonth(),
            yearDs      = this._getYearOptions(),
            mvCustomClz = this._getMVCustomClass(),
            valueAsObj  = this.valueAsObject,
            controlMap;
        
        // 构造附加属性
        uiProp[beginMV] = {valueAsDate:valueAsObj.begin, customClass:mvCustomClz};
        uiProp[endMV]   = {valueAsDate:valueAsObj.end, customClass:mvCustomClz};
        uiProp[beginM]  = {datasource:this._getMonthOptions(beginYear),value:beginMonth};
        uiProp[endM]    = {datasource:this._getMonthOptions(endYear),value:endMonth};
        uiProp[beginY]  = {datasource:yearDs,value:beginYear};
        uiProp[endY]    = {datasource:yearDs,value:endYear};
        uiProp[shortcut]= {options: this.shortcutOptions, valueAsObject: valueAsObj};

        // 初始化控件
        controlMap  = esui.util.init( layer.main, uiProp );
        ok      = controlMap[ok];
        cancel  = controlMap[cancel];
        close   = controlMap[close];
        beginM  = controlMap[beginM];
        endM    = controlMap[endM];
        beginY  = controlMap[beginY];
        endY    = controlMap[endY];
        beginPM = controlMap[beginPM];
        endPM   = controlMap[endPM];
        beginNM = controlMap[beginNM];
        endNM   = controlMap[endNM];
        beginMV = controlMap[beginMV];
        endMV   = controlMap[endMV];
        shortcut = controlMap[shortcut];

        this._controlMap['ok']              = ok;
        this._controlMap['cancel']          = cancel;
        this._controlMap['close']           = close;
        this._controlMap['beginmonthview']  = beginMV;
        this._controlMap['endmonthview']    = endMV;
        this._controlMap['beginmonth']      = beginM;
        this._controlMap['endmonth']        = endM;
        this._controlMap['beginyear']       = beginY;
        this._controlMap['endyear']         = endY;
        this._controlMap['beginprevmonth']  = beginPM;
        this._controlMap['endprevmonth']    = endPM;
        this._controlMap['beginnextmonth']  = beginNM;
        this._controlMap['endnextmonth']    = endNM;
        this._controlMap['shortcut']        = shortcut;

        ok.onclick = this._getOkHandler();
        close.onclick = cancel.onclick = this._getCancelHandler();
        beginY.onchange = this._getYearChangeHandler('begin');
        endY.onchange   = this._getYearChangeHandler('end');
        beginM.onchange = this._getMonthChangeHandler('begin');
        endM.onchange   = this._getMonthChangeHandler('end');
        beginPM.onclick = this._getPrevMonthHandler('begin');
        endPM.onclick   = this._getPrevMonthHandler('end');
        beginNM.onclick = this._getNextMonthHandler('begin');
        endNM.onclick   = this._getNextMonthHandler('end');
        beginMV.onchange = this._getCalChangeHandler('begin');
        endMV.onchange = this._getCalChangeHandler('end');
        shortcut.onchange = this._getShortcutChangeHandler();
    },
    
    /**
     * 获取选择快捷选项的handler
     * 
     * @private
     * @return {Function}
     */
    _getShortcutChangeHandler: function () {
        var me = this;

        return function ( valueAsObject, shortcutText ) {
            if ( me.onchange( valueAsObject, shortcutText ) !== false ) {
                me.valueAsObject = valueAsObject;
                me._repaintMain( valueAsObject, shortcutText );
                me.hideLayer();
            }
        };
    },
    
    /**
     * 获取年份切换的handler
     * 
     * @private
     * @return {Function}
     */
    _getYearChangeHandler: function ( type ) {
        var me = this;

        return function ( year ) {
            var view = me.view[ type ],
                month = view.getMonth();

            me._repaintMonthView( type, year, month );
            me.getLayer()._preventHide();
        };
    },
    
    /**
     * 获取月份切换的handler
     * 
     * @private
     * @return {Function}
     */
    _getMonthChangeHandler: function ( type ) {
        var me = this;

        return function ( month ) {
            var view = me.view[ type ],
                year = view.getFullYear();

            me._repaintMonthView( type, year, month );
            me.getLayer()._preventHide();
        };
    },
    
    /**
     * 获取月份前进按钮的handler
     * 
     * @private
     * @return {Function}
     */
    _getPrevMonthHandler: function ( type ) {
        var me = this;

        return function () {
            var view = me.view[ type ];
            
            view.setMonth( view.getMonth() - 1 )
            me._repaintMonthView( type, view.getFullYear(), view.getMonth() );
        };
    },
    
    /**
     * 获取月份后退按钮的handler
     * 
     * @private
     * @return {Function}
     */
    _getNextMonthHandler: function ( type ) {
        var me = this;

        return function () {
            var view = me.view[ type ];
            
            view.setMonth(view.getMonth() + 1)
            me._repaintMonthView( type, view.getFullYear(), view.getMonth() );
        };
    },

    /**
     * 获取可选择的年列表
     * 
     * @private
     * @return {Array}
     */
    _getYearOptions: function () {
        var range   = this.range,
            ds      = [],
            i       = range.begin.getFullYear(),
            end     = range.end.getFullYear();

        for ( ; i <= end; i++) {
            ds.push( {name: i, value:i} );
        }

        return ds;
    },

    /**
     * 获取可选择的月列表
     * 
     * @private
     * @param {number} year 选中的年
     * @return {Array}
     */
    _getMonthOptions: function ( year ) {
        var range   = this.range,
            ds      = [],
            i       = 0,
            len     = 11;
        
        if ( year == range.begin.getFullYear() ) {
            i = range.begin.getMonth();
        } 
        
        if ( year == range.end.getFullYear() ) {
            len = range.end.getMonth();
        }

        for ( ; i <= len; i++ ) {
            ds.push( {
                name: (i + 1), 
                value:i
            } );
        }

        return ds;
    },
    
    /**
     * 重新绘制日期显示
     * 
     * @private
     * @param {string} type 侧边栏类型,begin|end
     * @param {number} year 年份
     * @param {number} month 月份
     */
    _repaintMonthView: function ( type, year, month ) {
        this.view[ type ] = new Date( year, month, 1 );
        this._repaintSide( type );
    },
    
    /**
     * 显示|隐藏 浮动层
     * 
     * @public
     */
    toggleLayer: function () {
        var me = this;
        if ( this.getLayer().isShow() ) {
            me.hideLayer();
        } else {
            me.showLayer();
        }
    },
    
    /**
     * 隐藏浮动层
     * 
     * @public
     */
    hideLayer: function () {
        this.getLayer().hide();
        this.removeState( 'active' );
    },
    
    /**
     * 显示浮动层
     * 
     * @public
     */
    showLayer: function () {
        var me = this,
            main        = me.main,
            pos         = baidu.dom.getPosition( main ),
            pageWidth   = baidu.page.getWidth(),
            layer       = me.getLayer(),
            layerWidth  = layer.main.offsetWidth,
            value       = me.valueAsObject,
            layerTop    = pos.top + main.offsetHeight - 1,
            layerLeft;

        // 创建临时日期存储变量
        me.tempValue = {
            'begin' : new Date( value.begin ),
            'end'   : new Date( value.end )
        };
        
        // 更新浮动层显示的日期
        me.view = {
            'begin' : new Date( value.begin ),
            'end'   : new Date( value.end )
        };
        
        me._repaintLayer();

        if ( pageWidth < ( pos.left + layerWidth ) ) {
            layerLeft = pos.left + main.offsetWidth - layerWidth;
        } else {
            layerLeft = pos.left;
        }
        layer.show( layerLeft, layerTop );
        this.addState( 'active' );
    },
    
    /**
     * 获取浮动层元素
     * 
     * @public
     * @return {HTMLElement}
     */
    getLayer: function () {
        return this._controlMap.layer;
    },

    /**
     * 重新绘制layer
     * 
     * @private
     */
    _repaintLayer: function () {  
        //this._controlMap['shortcut'].select(this.value);
        this._repaintSide( 'begin' );
        this._repaintSide( 'end' );
    },

    /**
     * 获取当前日期区间的显示字符
     * 
     * @public
     * @param {Object} opt_valueAsObject 日期区间
     * @return {string}
     */
    getValueText: function ( opt_valueAsObject ) {
        var valueAsObj  = opt_valueAsObject || this.getValueAsObject();
        var begin       = valueAsObj.begin;
        var end         = valueAsObj.end;
        var format      = this.dateFormat;
        var formatter   = baidu.date.format;
        var shortcut    = this._controlMap[ 'shortcut' ];
            
        if ( begin && end ) {
            return formatter( begin, format ) 
                    + " 至 " 
                    + formatter( end, format );
        }
        
        return '';
    },
    
    /**
     * 获取当前日期区间的快捷显示字符
     * 
     * @public
     * @param {Object} opt_valueAsObject 日期区间
     * @return {string}
     */
    getShortcutText: function ( opt_valueAsObject ) {
        var valueAsObject   = opt_valueAsObject || this.getValue();
        var shortcut        = this._controlMap.shortcut;

        if ( valueAsObject.begin && valueAsObject.end ) {
            return shortcut.getName( opt_valueAsObject ? valueAsObject : null );
        }
        
        return '';
    },
    
    /**
     * 释放控件
     * 
     * @protected
     */
    __dispose: function () {
        this.onchange = null;
        esui.InputControl.prototype.__dispose.call( this );
    }
};


baidu.inherits( esui.MultiCalendar, esui.InputControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Pager.js
 * desc:    分页控件
 * author:  zhaolei, erik, yanjunyi
 */


///import esui.Control;
///import baidu.lang.inherits;

/**
 * @class ui.Pager
 * 页码组件
 */

/**
 * 构造函数
 * 
 * @param {Object} options 控件初始化参数
 */
esui.Pager = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'pager';
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.Control.call( this, options );
    
    // Add by junyi @2011-01-24
    // 起始页码数字，即传给后端计算当前页码的偏移量，大多数系统第一页数据的页码索引为0，少数系统为1，即可在此配置，默认：0。
    this.startNumber = parseInt(this.startNumber, 10) || 0;
    
    this.__initOption('prevText', null, 'PREV_TEXT');
    this.__initOption('nextText', null, 'NEXT_TEXT');
    this.__initOption('omitText', null, 'OMIT_TEXT');
    
    this.showCount = parseInt(this.showCount, 10) || esui.Pager.SHOW_COUNT;
};

esui.Pager.SHOW_COUNT = 5;
esui.Pager.OMIT_TEXT  = '…';
esui.Pager.NEXT_TEXT  = '<span class="ui-pager-pntext">下一页</span><span class="ui-pager-icon"></span>';
esui.Pager.PREV_TEXT  =  '<span class="ui-pager-icon"></span><span class="ui-pager-pntext">上一页</span>';

esui.Pager.prototype = {
    /**
     * 获取当前页码
     * 
     * @public
     * @return {string}
     */
    getPage: function () {
        return this.page;
    },
    
    /**
     * 渲染控件
     * 
     * @public
     */
    render: function () {
        var me = this;
        esui.Control.prototype.render.call( me );
        
        me.total = parseInt(me.total, 10) || 0;
        me.page  = parseInt(me.page, 10) || 0;

        // 绘制内容部分
        this._renderPages();
    },
    
    /**
     * @ignore
     */
    _tplMain: '<ul>{0}</ul>',
    /**
     * @ignore
     */
    _tplItem: '<li onclick="{2}" onmouseover="{3}" onmouseout="{4}" class="{1}">{0}</li>',
    
    /**
     * 绘制页码区
     * 
     * @private
     */
    _renderPages: function () {
        var me        = this,
            html      = [],
            total     = me.total,
            startNumber = this.startNumber,
            last      = total + startNumber - 1,
            page      = me.page + startNumber, // 恶心
            itemClass = me.__getClass( 'item' ),
            disClass  = me.__getClass( 'disabled' ),
            prevClass = me.__getClass( 'prev' ),
            nextClass = me.__getClass( 'next' ),
            omitWord  = me._getInfoHtml( me.omitText, me.__getClass( 'omit' ) ),
            i, begin;
        
        if ( total <= 0 ) {
            this.main.innerHTML = '';
            return;
        }
                
        // 计算起始页
        if ( page < me.showCount - 1 ) {
            begin = 0;
        } else if ( page > total - me.showCount ) {
            begin = total - me.showCount;
        } else {
            begin = page - Math.floor( me.showCount / 2 );
        }

        if ( begin < 0 ) {
            begin = 0
        }
        
        // 绘制前一页的link
        if (page > 0) {
            html.push( 
                me._getItemHtml(
                    me.prevText,
                    prevClass,
                    me.__getStrCall( '_setPage', page - 1 )
                ) );
        } else {
            html.push( me._getInfoHtml( me.prevText, prevClass + ' ' + disClass ) );
        }
        
        // 绘制前缀
        if ( begin > 0 ) {
            html.push(
                me._getItemHtml(
                    1,
                    itemClass,
                    this.__getStrCall( '_setPage', 0 )
                ),
                omitWord );
        }

        // 绘制中间的序号
        for ( i = 0; i < me.showCount && begin + i < total; i++ ) {
            if ( begin + i != page ) {
            html.push(
                me._getItemHtml(
                    1 + begin + i,
                    itemClass,
                    me.__getStrCall( '_setPage', begin + i )
                ) );
            } else {
                html.push(
                    me._getInfoHtml(
                        1 + begin + i, 
                        itemClass + ' ' + me.__getClass( 'selected' )
                    ) );
            }
        }
        
        // 绘制后缀
        if ( begin < total - me.showCount ) {
            html.push(
                omitWord,
                me._getItemHtml(
                    total,
                    itemClass,
                    me.__getStrCall( '_setPage', last )
                ) );
        }
        
        
        // 绘制后一页的link
        if ( page < last ) {
            html.push(
                me._getItemHtml(
                    me.nextText,
                    nextClass,
                    me.__getStrCall( '_setPage', page + 1) 
                ) );
        } else {
            html.push( me._getInfoHtml( me.nextText, nextClass + ' ' + disClass ) );
        }
        
        this.main.innerHTML = esui.util.format( me._tplMain, html.join('') );
    },
    
    /**
     * 生成单个页码元素的html内容
     * @private
     * 
     * @param {String} sText
     * @param {Strint} sClass
     * @param {String} sClick
     * 
     * @return {String}
     */
    _getItemHtml: function( sText, sClass, sClick ) {
        var me          = this,
            strRef      = me.__getStrRef(),
            itemOver    = strRef + '._itemOverHandler(this)',
            itemOut     = strRef + '._itemOutHandler(this)';
            
        return esui.util.format(
            me._tplItem,
            sText,
            sClass,
            sClick,
            itemOver,
            itemOut
        );
    },
    
    /**
     * 生成单个不可点击的页码元素的html内容
     * @private
     * 
     * @param {String} sText
     * @param {Strint} sClass
     * 
     * @return {String}
     */
    _getInfoHtml: function ( sText, sClass ) {
        return esui.util.format( this._tplItem, sText, sClass, '', '' ,'' );
    },
    
    /**
     * 点击页码的事件处理接口
     * 
     * @param {Number} page
     * 
     * @return {Boolean}
     */
    onchange: new Function(),
    
    /**
     * 选择页码
     * 
     * @public
     * @param {number} page 选中页数
     */
    _setPage: function ( page ) {
        if ( this.onchange( page ) !== false ) {
            this.setPage( page );
        }
    },

    /**
     * 选择页码
     * 
     * @public
     * @param {number} page 选中页数
     */
    setPage: function ( page ) {
        this.page = page;
        this._renderPages();
    },
    
    /**
     * @ignore
     * @param {Object} item
     */
    _itemOverHandler: function( item ) {
        baidu.addClass( item, this.__getClass( 'hover' ) );
    },

    /**
     * @ignore
     * @param {Object} item
     */
    _itemOutHandler: function( item ) {
        baidu.removeClass( item, this.__getClass( 'hover' ) );
    }
};

baidu.inherits( esui.Pager, esui.Control );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Region.js
 * desc:    地域选择控件
 * author:  zhouyu, erik
 */

///import esui.InputControl;
///import esui.Select;
///import baidu.lang.inherits;
///import baidu.object.clone;

/**
 * 地域选择控件
 *
 * @param {Object} options 控件初始化参数
 */
esui.Region = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'region';
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.InputControl.call( this, options );


    this._initDatasource( this.datasource );
    
    // 初始化mode
    if ( this.mode != 'single' ) {
        this.mode = 'multi';
    }

    // 初始化value
    var valueAsRaw = this.valueAsRaw || this.value;
    if ( this.mode == 'multi' ) {
        if ( typeof valueAsRaw == 'string' ) {
            valueAsRaw = valueAsRaw.split( ',' );
        } else if ( !( valueAsRaw instanceof Array ) ) {
            valueAsRaw = [];
        }
    }
    this.valueAsRaw =  valueAsRaw;
};

 
esui.Region.prototype = {
    /**
     * 渲染控件
     *
     * @public
     */
    render: function () {
        if ( !this._isRendered ) {
            esui.InputControl.prototype.render.call( this );

            switch ( this.mode ) {
            case 'multi':
                this._initMulti();
                break;
            case 'single':
                this._initSingle();
                break;
            }
            
            this._isRendered = 1;
        }
    },
    
    /**
     * 获取当前选中的值
     * 
     * @public
     * @return {string}
     */
    getValue: function () {
        if ( this.mode == 'multi' ) {
            return this.valueAsRaw.join( ',' );
        }

        return this.valueAsRaw;
    },
    
    /**
     * 设置当前选中的值
     * 
     * @public
     * @param {string} value
     */
    setValue: function ( value ) {
        this.valueAsRaw = value;
        
        if ( this.mode == 'multi' ) {
            this._selectMulti( value.split( ',' ) );
        } else {
            this._controlMap.select.setValue( value );
        }
    },

    /**
     * 设置控件的禁用状态
     * 
     * @public
     * @param {boolean} disabled 是否禁用
     */
    setDisabled: function ( disabled ) {
        disabled = !!disabled;
        if ( this.mode == 'multi' ) {
            var cbs = this.main.getElementsByTagName( 'input' );
            var cbsLen = cbs.length;
            var cb;

            while ( cbsLen-- ) {
                cb = cbs[ cbsLen ];
                if ( cb.type == 'checkbox' ) {
                    cb.disabled = disabled;
                }
            }

            this._updateMulti();
        } else {
            this._controlMap.select.setDisabled( disabled );
        }

        this[ disabled ? 'addState' : 'removeState' ]( 'disabled' );
        this.disabled = disabled;
    },
    
    /**
     * 设置控件为禁用
     * 
     * @public
     */
    disable: function () {
        this.setDisabled( true );
    },
    
    /**
     * 设置控件为可用
     * 
     * @public
     */
    enable: function () {
        this.setDisabled( false );
    },
    
    /**
     * 多选地域初始化
     * 
     * @private
     */
    _initMulti: function () {
        var data    = this.datasource;
        var len     = data.length;
        var html    = [];
        var i;
        
        for ( i = 0; i < len; i++ ) {
            html.push( this._getOptionHtml( data[ i ], 0 ) );
        }

        this.main.innerHTML = html.join( '' );
        this._selectMulti( this.valueAsRaw );
    },
    
    /**
     * 选中地域（多选）
     * 
     * @private
     * @param {Array} valueAsRaw
     */
    _selectMulti: function ( valueAsRaw ) {
        this.valueAsRaw = valueAsRaw;

        var len = valueAsRaw.length;
        var map = {};
        var key;
        while ( len -- ) {
            map[ valueAsRaw[ len ] ] = 1;
        }

        for ( key in this._dataMap ) {
            this._getOption( key ).checked = ( key in map );
        }

        this._updateMulti();
    },
    
    /**
     * 更新多选地域的视图和选中值
     * 
     * @private
     */
    _updateMulti: function ( data, dontResetValue ) {
        data = data || {children: this.datasource};
        if ( !dontResetValue ) {
            this.valueAsRaw = [];
        }

        var children = data.children;
        var len      = children instanceof Array && children.length;
        var i;
        var item;
        var isChecked = true;
        var isItemChecked;
        var checkbox = data.id && this._getOption( data.id );

        if ( len ) {
            for ( i = 0; i < len; i++ ) {
                isItemChecked = this._updateMulti( children[ i ], 1 );
                isChecked = isChecked && isItemChecked;
            }

            checkbox && ( checkbox.checked = isChecked );
            return isChecked;
        } else {
            isChecked = checkbox.checked;
            isChecked && this.valueAsRaw.push( data.id );
            return isChecked;
        }
    },
    
    /**
     * 多选选项的html模板
     *
     * @private
     */
    _tplOption: '<dt class="{3}"><input type="checkbox" value="{0}" optionId="{0}" id="{2}" onclick="{4}" level="{5}"><label for="{2}">{1}</label></dt>',
    
    /**
     * 获取选项的html
     *
     * @private
     * @param {Object} data 选项数据
     * @param {number} level 选项层级
     * @return {string}
     */
    _getOptionHtml: function ( data, level ) {
        var id              = data.id;
        var optionClass     = [];
        var bodyClass       = this.__getClass( 'option-body' );
        var childrenClass   = this.__getClass( 'option-children' );
        var html            = [];
        var children        = data.children;
        var len             = children instanceof Array && children.length;
        var i;
        
        optionClass.push(
            this.__getClass( 'option' ),
            this.__getClass( 'option-' + id ),
            this.__getClass( 'option-level' + level )
        );

        html.push(
            '<dl class="' + optionClass.join(' ') + '">',
            esui.util.format(
                this._tplOption,
                id,
                data.text,
                this.__getId( 'option_' + id ),
                bodyClass,
                this.__getStrRef() + '._optionClick(this)',
                level
            ) );
        
        if ( len ) {
            html.push( '<dd class="' + childrenClass + '">' );
            for ( i = 0; i < len; i++ ) {
                html.push( this._getOptionHtml( children[ i ], level + 1 ) );
            }
            html.push( '</dd>' );
        }
        html.push( '</dl>' );
        
        return html.join( '' );
    },
    
    /**
     * 多选选项点击的handler
     *
     * @private
     * @param {HTMLInputElement} dom 选项checkbox的dom
     */
    _optionClick: function ( dom, dontRefreshView ) {
        var id          = dom.getAttribute( 'optionId' );
        var data        = this._dataMap[ id ];
        var isChecked   = dom.checked;
        var children    = data.children;
        var len         = children instanceof Array && children.length;
        var item;
        var checkbox;
        
        if ( len ) {
            while ( len-- ) {
                item = children[ len ];
                checkbox = this._getOption( item.id );
                checkbox.checked = isChecked;
                this._optionClick( checkbox, 1 );
            }
        }

        if ( !dontRefreshView ) {
            this._updateMulti();
        }
    },
    
    /**
     * 获取多选选项的checkbox
     *
     * @private
     * @param {string} id 选项标识
     * @return {HTMLInputElement}
     */
    _getOption: function ( id ) {
        return baidu.g( this.__getId( 'option_' + id ) );
    },
    
    /**
     * 初始化数据源
     *
     * @private
     */
    _initDatasource: function ( data ) {
        this.datasource = data || esui.Region.REGION_LIST;
        this._dataMap   = {};
        data = this.datasource;
        walker.call( this, data, {children: data} );

        function walker( data, parent ) {
            var len = data instanceof Array && data.length;
            var i;
            var item;
            
            if ( !len ) {
                return;
            }

            for ( i = 0; i < len; i++ ) {
                item = baidu.object.clone( data[ i ] );
                item.parent = parent;
                this._dataMap[ item.id ] = item;
                walker.call( this, item.children, item );
            }
        }
    },

    /**
     * 单选地域初始化
     *
     * @private
     */
    _initSingle: function () {
        var me = this;
        var options = {
            id          : me.__getId( "region" ),
            datasource  : me._singleDataAdapter(),
            value       : me.valueAsRaw,
            width       : 100
        };
        var sinSelect = esui.util.create( "Select", options );
        sinSelect.appendTo( me.main );
        sinSelect.onchange = me._getSelectChangeHandler();

        me._controlMap.select = sinSelect;
    },
    
    /**
     * 单选模式Select的change handler
     *
     * @private
     * @return {Function}
     */
    _getSelectChangeHandler: function () {
        var me = this;
        return function ( value ) {
            me.valueAsRaw = me.value = value;
        };
    },

    /**
     * 单选模式的数据格式适配器
     *
     * @private
     * @return {Array}
     */
    _singleDataAdapter: function () {
        var result = [];
        walker( {children: this.datasource} );

        function walker( data ) {
            var children = data.children;
            var hasChild = !!children;
            var len, i;
            if ( data.id ) {
                result.push( {
                    name        : data.text, 
                    value       : data.id, 
                    disabled    : hasChild
                } );
            }

            if ( hasChild ) {
                for ( i = 0, len = children.length; i < len; i++ ) {
                    walker( children[ i ] );
                }
            }
        }

        return result;
    }
} 

baidu.inherits( esui.Region, esui.InputControl );


/**
 * 默认地域配置
 *
 * @static
 */
esui.Region.REGION_LIST = [
    {
        id: 'China',
        text: '中国地区',
        children: [
            {
                id: "North",
                text: "华北地区",
                children: [
                    {id: "1", text: "北京"},
                    {id: "3", text: "天津"},
                    {id: "13", text: "河北"},
                    {id: "26", text: "山西"},
                    {id: "22", text: "内蒙古"}
                ]
            },
            {
                id: "NorthEast",
                text: "东北地区",
                children: [
                    {id: "21", text: "辽宁"},
                    {id: "18", text: "吉林"},
                    {id: "15", text: "黑龙江"}
                ]
            },
            {
                id: "East",
                text: "华东地区",
                children: [
                    {id: "2", text: "上海"},
                    {id: "19", text: "江苏"},
                    {id: "32", text: "浙江"},
                    {id: "9", text: "安徽"},
                    {id: "5", text: "福建"},
                    {id: "20", text: "江西"},
                    {id: "25", text: "山东"}
                ]
            },
            {
                id: "Middle",
                text: "华中地区",
                children: [
                    {id: "14", text: "河南"},
                    {id: "16", text: "湖北"},
                    {id: "17", text: "湖南"}
                ]
            },
            {
                id: "South",
                text: "华南地区",
                children: [
                    {id: "4", text: "广东"},
                    {id: "8", text: "海南"},
                    {id: "12", text: "广西"}
                ]
            },
            {
                id: "SouthWest",
                text: "西南地区",
                children: [
                    {id: "33", text: "重庆"},
                    {id: "28", text: "四川"},
                    {id: "10", text: "贵州"},
                    {id: "31", text: "云南"},
                    {id: "29", text: "西藏"}
                ]
            },
            {
                id: "NorthWest",
                text: "西北地区",
                children: [
                    {id: "27", text: "陕西"},
                    {id: "11", text: "甘肃"},
                    {id: "24", text: "青海"},
                    {id: "23", text: "宁夏"},
                    {id: "30", text: "新疆"}
                ]
            },
            {
                id: "Other",
                text: "其他地区",
                children: [
                    {id: "34", text: "香港"},
                    {id: "36", text: "澳门"},
                    {id: "35", text: "台湾"}
                ]
            }
        ]
    },
    {
        id: 'Abroad',
        text: '国外',
        children: [
            {id: '7', text: '日本'},
            {id: '37', text: '其他国家'}
        ]
    }
];
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Schedule.js
 * desc:    日程控件
 * author:  chenjincai, erik
 */
 
///import esui.InputControl;
///import baidu.lang.inherits;
///import baidu.dom.hasClass;
///import baidu.dom.addClass;
///import baidu.dom.removeClass;

/**
 * 日程控件
 *
 * @param {Object} options 控件初始化参数
 */
esui.Schedule = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'schedule';
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.InputControl.call( this, options );
    
    // 初始化视图的值
    this._initValue();

    this.__initOption('helpSelected', null, 'HELP_SELECTED');
    this.__initOption('help', null, 'HELP');
    this.__initOption('dayWords', null, 'DAY_WORDS');
    this.__initOption('shortcut', null, 'SHORTCUT');
}

esui.Schedule.HELP_SELECTED = '投放时间段';
esui.Schedule.HELP = '暂停时间段';
esui.Schedule.DAY_WORDS = [
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六',
    '星期日'
];

esui.Schedule.SHORTCUT = function () {
    /**
     * @inner
     */
    function selectByDayStates( dayStates ) {
        var begin = 0;
        var end   = Math.min( dayStates.length, 7 );
        var checkbox;

        for ( ; begin < end; begin++ ) {
            checkbox = baidu.g( this.__getId( 'lineState' + begin ) );
            checkbox.checked = !!dayStates[ begin ];
            this._dayClick( checkbox, true );
        }
    }

    return [
        {
            text: '全部时间',
            func: function () {
                selectByDayStates.call( this, [1,1,1,1,1,1,1] );
                this._refreshView(this);
            }
        },
        {
            text: '工作日',
            func: function () {
                selectByDayStates.call( this, [1,1,1,1,1,0,0] );
                this._refreshView(this);
            }
        },
        {
            text: '周末',
            func: function () {
                selectByDayStates.call( this, [0,0,0,0,0,1,1] );
                this._refreshView(this);
            }
        }
    ];
}();

esui.Schedule.prototype = {
    /**
     * 设置控件的禁用状态
     * 
     * @public
     * @param {boolean} disabled 是否禁用
     */
    setDisabled: function ( disabled ) {
        disabled = !!disabled;
        var stateName = 'disabled';
        var shortcut;
        var bodyHead;
        var i;
        
        this.disabled = disabled;
        if ( disabled ) {
            this.addState( stateName );
        } else {
            this.removeState( stateName );
        }

        disabled = this.getState( stateName );
        shortcut = baidu.g( this.__getId('shortcut') );
        bodyHead = baidu.g( this.__getId('BodyHead') );
        bodyHead.style.display = shortcut.style.display = disabled ? 'none' : '';
        
        for ( i = 0; i < 7; i++ ) {
            baidu.g( this.__getId('lineState' + i) ).disabled = disabled;
        }
    },
    
    /**
     * 设置控件为禁用
     * 
     * @public
     */
    disable: function () {
        this.setDisabled( true );
    },

    /**
     * 设置控件为可用
     * 
     * @public
     */
    enable: function () {
        this.setDisabled( false );
    },
    
    /**
     * 获取选中的时间(数组格式)
     * 
     * @public
     * @return {Array}
     */
    getValueAsArray: function () {
        return this.valueAsArray;
    },
    
    /**
     * 获取选中的时间(字符串格式)
     * 
     * @public
     * @return {string}
     */
    getValue: function () {
        var value = [];
        var valueAsArray = this.valueAsArray;
        var i, j;

        for ( i = 0; i < 7; i++ ) {
            for ( j = 0; j < 24; j++ ) {
                value.push( valueAsArray[ i ][ j ] );
            }
        }

        return value.join( ',' );
    },

    /**
     * 设置选中的时间(数组格式)
     * 
     * @public
     * @param {Array} valueAsArray
     */
    setValueAsArray: function ( valueAsArray ) {
        // 做了不靠谱的简单判断
        if ( valueAsArray instanceof Array 
             && valueAsArray.length == 7
        ) {
            this.valueAsArray = valueAsArray;
            this._refreshView();
        }
    },

    /**
     * 设置选中的时间(字符串格式)
     * 
     * @public
     * @param {string} value
     */
    setValue: function ( value ) {
        var valueAsArray = this._parseValue( value );
        valueAsArray && this.setValueAsArray( valueAsArray );
    },

    /**
     * 渲染控件
     * 
     * @public
     * @param {Object} main 控件挂载的DOM
     */
    render: function () {
        if ( !this.isRendered ) {
            esui.InputControl.prototype.render.call( this );

            this.main.innerHTML = 
                esui.util.format(
                    this._tpl,
                    this.__getClass( 'head' ),
                    this.__getClass( 'body' ),
                    this.__getClass( 'help' ),
                    this.__getClass( 'help-selected' ),
                    this.__getClass( 'help-unselected' ),
                    this.__getClass( 'help-text' ),
                    this.__getClass( 'shortcut' ),
                    this.__getId( 'body' ),
                    this.helpSelected,
                    this.help,
                    this.__getId( 'shortcut' ),
                    this._getShortcutHtml()
                );
            this._initBody();
        }

        this.isRendered = 1;
        this.setDisabled( this.disabled );
        this._refreshView();
    },

    /**
     * 控件主体html模板
     *
     * @private
     */
    _tpl: '<div class="{0}">'
                + '<div class="{2}">'
                    + '<div class="{3}"></div>'
                    + '<div class="{5}">{8}</div>'
                    + '<div class="{4}"></div>'
                    + '<div class="{5}">{9}</div>'
                + '</div>'
                + '<div class="{6}" id="{10}">{11}</div>'
            + '</div>'
        + '<div class="{1}" id="{7}"></div>',
    
    /**
     * 初始化视图的值
     * 
     * @private
     */
    _initValue: function () {
        var value        = this._parseValue( this.value );
        var valueAsArray = this.valueAsArray;
        var i;
        var j;
        var lineValue;

        if ( value ) {
            valueAsArray = value;
        } else if ( !this.valueAsArray ) {
            valueAsArray = [];
            for ( i = 0; i < 7; i++ ) {
                lineValue = [];
                valueAsArray.push( lineValue );
                
                for ( j = 0; j < 24; j++ ) {
                    lineValue.push( 0 );
                }
            }
        }

        this.valueAsArray = valueAsArray;
    },

    /**
     * 将字符串类型的值解析成数组形式
     * 
     * @private
     * @param {string} value
     * @return {Array}
     */
    _parseValue: function ( value ) {
        value = (value || '').split( ',' );

        var valueAsArray = null;
        var i;

        if ( value.length == 24 * 7 ) {
            valueAsArray = [];
            for ( i = 0; i < 7; i++ ) {
                valueAsArray.push( value.slice( i * 24, (i + 1) * 24 ) );
            }
        }

        return valueAsArray;
    },
    
    /**
     * 获取快捷选择区域的html
     *
     * @private
     * @return {string}
     */
    _getShortcutHtml: function () {
        var html        = [];
        var shortcuts   = this.shortcut;
        var len         = shortcuts.length;
        var separation  = '&nbsp;|&nbsp;';
        var clazz       = this.__getClass( 'shortcut-item' );
        var tpl         = '<span class="{0}" onclick="{2}">{1}</span>';
        var i, shortcut;

        for (i = 0; i < len; i++) {
            shortcut = shortcuts[i];
            html.push(
                esui.util.format(
                    tpl,
                    clazz,
                    shortcut.text,
                    this.__getStrCall( '_doShortcut', i )
                ) );
        }
        return html.join( separation );
    },
    
    /**
     * 执行快捷选择的功能
     *
     * @private
     * @param {number} index 快捷选项索引
     */
    _doShortcut: function ( index ) {
        var func = this.shortcut[ index ].func;
        typeof func == 'function' && func.call( this );
    },
    
    /**
     * 初始化控件主体
     *
     * @private
     */
    _initBody: function () {
        var ref          = this.__getStrRef();
        var dayWords     = this.dayWords;
        var html         = [];
        var lineClass    = this.__getClass( 'line' );
        var dayClass     = this.__getClass( 'day' );
        var segClass     = this.__getClass( 'seg' );
        var timeClass    = this.__getClass( 'time' );
        var timeHClass   = this.__getClass( 'timehead' )
        var lineMidHtml  = '</div><div class="' + segClass + '">';
        var headItemTpl  = '<div class="' + timeHClass + '" onmouseover="{2}" onmouseout="{3}" onclick="{4}" time="{1}" id="{0}">&nbsp;</div>';
        var lineEndHtml  = '</div></div>';
        var lineBeginTpl = '<div class="' + lineClass + '" id="{0}">'
                                + '<div class="' + dayClass + '">'
                                + '<input type="checkbox" id="{1}" value="{2}" onclick="{3}">'
                                + '<label for="{1}">{4}</label>';
        var timeTpl = '<div class="' + timeClass + '" onmouseover="{3}" onmouseout="{4}" onclick="{5}" time="{2}" day="{1}" timeitem="1" id="{0}">{2}</div>';

        // 拼装html：头部time列表 
        html.push( '<div class="' + lineClass + '" id="' 
                   , this.__getId( 'BodyHead' ) + '">'
                   , '<div class="' + dayClass + '">&nbsp;'
                   , lineMidHtml );

        for ( j = 0; j < 24; j++ ) {
            if ( j > 0 && j % 6 == 0 ) {
                html.push( lineMidHtml );
            }

            html.push(
                esui.util.format(
                    headItemTpl,
                    this.__getId( 'TimeHead' + j ),
                    j,
                    ref + '._timeHeadOverOut(this,1)',
                    ref + '._timeHeadOverOut(this)',
                    ref + "._timeHeadClick(this)"
                ));
        }
        html.push( lineEndHtml );

        // 拼装html：时间体列表 
        for ( i = 0; i < 7; i++ ) {
            html.push(
                esui.util.format(
                    lineBeginTpl,
                    this.__getId( 'line' + i ),
                    this.__getId( 'lineState' + i ),
                    i,
                    ref + '._dayClick(this)',
                    dayWords[ i ]
                ),
                lineMidHtml
            );
                      
            for ( j = 0; j < 24; j++ ) {
                if ( j > 0 && j % 6 == 0 ) {
                    html.push( lineMidHtml );
                }

                html.push(
                    esui.util.format(
                        timeTpl,
                        this.__getId( 'time_' + i + '_' + j ),
                        i,
                        j,
                        ref + '._timeOverOut(this,1)',
                        ref + '._timeOverOut(this)',
                        ref + "._timeClick(this)"
                    )
                );
            }

            html.push( lineEndHtml );
        }
        
        // html写入
        baidu.g( this.__getId( 'body' ) ).innerHTML = html.join('');
    },
    
    /**
     * “时间”移入移出的处理函数
     *
     * @private
     * @param {HTMLElement} dom 时间的dom元素
     * @param {booleam}     isOver 是否鼠标移入
     */
    _timeOverOut: function ( dom, isOver ) {
        var clazz = this.__getClass( 'time-hover' );
        if ( isOver ) {
            baidu.addClass( dom, clazz );
        } else {
            baidu.removeClass( dom, clazz );
        }
    },
    
    /**
     * “时间头部”移入移出的处理函数
     *
     * @private
     * @param {HTMLElement} dom 头部的dom元素
     * @param {booleam}     isOver 是否鼠标移入
     */
    _timeHeadOverOut: function ( dom, isOver ) {
        var clazz = this.__getClass( 'timehead-hover' );
        if ( isOver ) {
            baidu.addClass( dom, clazz );
        } else {
            baidu.removeClass( dom, clazz );
        }
    },
    
    /**
     * 点击“时间”的处理函数
     *
     * @private
     * @param {HTMLElement} dom 时间的dom元素
     */
    _timeClick: function ( dom ) {
        if ( this.isDisabled() ) {
            return;
        }
        
        var day  = parseInt( dom.getAttribute( 'day' ), 10 ),
            time = parseInt( dom.getAttribute( 'time' ), 10 ),
            isSelected = !baidu.dom.hasClass(
                            dom, 
                            this.__getClass( 'time-selected' ));
        
        this._selectTime( day, time, isSelected );
    },
    
    /**
     * 点击“时间头部”的处理函数
     *
     * @private
     * @param {HTMLElement} dom 头部的dom元素
     */
    _timeHeadClick: function ( dom ) {
        var isSelected = !baidu.dom.hasClass(
                            dom, 
                            this.__getClass( 'timehead-active' ) ),
            time = parseInt( dom.getAttribute( 'time' ), 10 ),
            div;
        
        for ( i = 0; i < 7; i++ ) {
            div = baidu.g( this.__getId('time_' + i + '_' + time) );
            this._selectTime(
                parseInt( div.getAttribute('day'), 10 ), 
                time, 
                isSelected, 
                true
            );
        }           
        
        this._refreshView();
    },
    
    /**
     * 点击“星期”的处理函数
     *
     * @private
     * @param {HTMLElement} dom 星期的checkbox元素
     * @param {boolean}     dontRefresh 是否禁止视图刷新
     */
    _dayClick: function ( dom, dontRefresh ) {
        var me          = this,
            isSelected  = dom.checked,
            divs        = dom.parentNode.parentNode.getElementsByTagName( 'div' ),
            len         = divs.length, div;

        while ( len-- ) {
            div = divs[ len ];
            if ( this._isTimeDom( div ) ) {
                this._selectTime(
                    parseInt( div.getAttribute( 'day' ), 10),
                    parseInt( div.getAttribute( 'time' ), 10),
                    isSelected,
                    true
                );
            }
        }
        
        if ( !dontRefresh ) {
            me._refreshView();
        }
    },

    /**
     * 刷新weektime选择器的视图
     * 
     * @private
     */
    _refreshView: function () {
        var me          = this;
        var disabled    = me.isDisabled();
        var valueAsArr  = me.valueAsArray;
        var headStates  = [];
        var activeHeadClass = me.__getClass( 'timehead-active' );
        var selectedClass   = me.__getClass( 'time-selected' );
        var head    = baidu.g( me.__getId( 'BodyHead' ) ).getElementsByTagName( 'div' );
        var divs    = baidu.g( me.__getId( 'body' ) ).getElementsByTagName( 'div' );
        var divLen  = divs.length;
        var div;
        var divMatch;
        var headDiv;
        var i, j;
        var count = 0;
        var lineValue, lineActive, lineCb;
        var lineEl, lineDivs, time, temp;

        // 初始化头部状态表
        for ( i = 0; i < 24; i++ ) {
            headStates.push( 1 );
        }
        
        // 遍历头部状态
        for ( i = 0; i < 7; i++ ) {
            lineEl      = baidu.g( me.__getId( 'line' + i ) );
            lineDivs    = lineEl.getElementsByTagName( 'div' );
            j           = lineDivs.length;

            while ( j-- ) {
                time = lineDivs[ j ];
                if ( me._isTimeDom( time ) ) {
                    time = parseInt( time.getAttribute( 'time' ), 10 );
                    temp = valueAsArr[ i ][ time ];
                    if ( !temp || temp == '0' ) {
                        headStates[ time ] = 0;
                    }
                }
            }
        }
        
        // 刷新time头部状态
        j = head.length;
        while ( j-- ) {
            div = head[ j ];
            divMatch = /TimeHead([0-9]+)$/.exec( div.id );
            if ( divMatch && divMatch.length == 2 ) {
                if ( headStates[ parseInt( divMatch[ 1 ], 10 ) ] ) {
                    baidu.addClass( div, activeHeadClass );
                } else {
                    baidu.removeClass( div, activeHeadClass );
                }
            }
        }

        // 刷新时间项状态
        while ( divLen-- ) {
            div = divs[ divLen ];
            divMatch = /time_([0-9]+)_([0-9]+)$/.exec( div.id );
            if ( divMatch && divMatch.length == 3 ) {
                time = valueAsArr[ parseInt( divMatch[ 1 ], 10 ) ][ parseInt( divMatch[ 2 ], 10 ) ];
                if ( time && time != '0' ) {
                    baidu.addClass( div, selectedClass );
                } else {
                    baidu.removeClass( div, selectedClass );
                }
            }
        }

        // 刷新checkbox状态
        for ( i = 0; i < 7; i++ ) {
            lineValue = valueAsArr[ i ];
            lineActive = true;
            
            for ( j = 0; j < 24; j++ ) {
                if ( !lineValue[ j ] || lineValue[ j ] == '0' ) {
                    lineActive = false;
                } else {
                    count++;
                }
            }
            
            baidu.g( me.__getId( 'lineState' + i ) ).checked = lineActive;
        }
    },
    

    /**
     * 选中时间
     * 
     * @private
     * @param {Object} day 星期
     * @param {Object} time 时间
     * @param {Object} isSelected 是否选中
     * @param {Object} noRrefresh 是否不刷新视图
     */
    _selectTime: function ( day, time, isSelected, noRrefresh ) {
        var value = this.valueAsArray;
        value[ day ][ time ] = ( isSelected ? 1 : 0 );
        
        if ( !noRrefresh ) {
            this._refreshView();
        }
    },
    
    /**
     * 判断dom元素是否时间元素
     * 
     * @private
     * @param {HTMLElement} dom
     */
    _isTimeDom: function ( dom ) {
        return !!dom.getAttribute( 'timeitem' );
    }
}

baidu.inherits( esui.Schedule, esui.InputControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/SideBar.js
 * desc:    左侧导航控件
 * author:  zhaolei, erik, linzhifeng
 */

///import esui.Control;
///import esui.Button;
///import baidu.lang.inherits;

/**
 * 左侧导航控件
 *
 * @param {Object} options 控件初始化参数
 */
esui.SideBar = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = "sidebar";
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.Control.call( this, options );

    this.headHeight     = this.headHeight || 37;
    this.marginTop      = this.marginTop || 10;
    this.marginLeft     = this.marginLeft || 10;
    this.marginBottom   = this.marginBottom || 10;

    this.__initOption( 'autoDelay', null, 'AUTO_DELAY' );
    this.__initOption( 'mode', null, 'MODE' );

    this._autoTimer = 0;
    
    // TODO: 永久取消js实现的sidebar动画效果
    // this._motioning = false;
};

esui.SideBar.AUTO_DELAY = 200;      //自动隐藏和自动显示的延迟
esui.SideBar.MODE       = 'fixed';  //初始化状态

esui.SideBar.prototype = {
    // TODO: 永久取消js实现的sidebar动画效果
    // motionStep      : 20,        //动态步伐
    // motionInterval  : 20,        //动态间隔
    
    /**
     * 初始化控制按钮
     *
     * @private
     */
    _initCtrlBtn: function () {
        var me          = this;
        var main        = me.main;
        var controlMap  = me._controlMap;
        var btnAutoHide = esui.util.create( 'Button', {
            id      : me.__getId( 'AutoHide' ),
            skin    : 'autohide'
        } );
        var btnFixed    = esui.util.create( 'Button', {
            id      : me.__getId( 'Fixed' ),
            skin    : 'fixed'
        } );
        
        // 将按钮append到sidebarbar
        btnAutoHide.appendTo( main );
        btnFixed.appendTo( main );
        
        // 持有控件引用
        controlMap.btnAutoHide  = btnAutoHide;
        controlMap.btnFixed     = btnFixed;
        
        // 挂载行为
        btnAutoHide.onclick = this._getAutoHideClickHandler();
        btnFixed.onclick    = this._getFixedClickHandler();
        
        // 初始化按钮的显示
        this._setMode( this.mode );
    },
    
    onmodechange: new Function(),

    /**
     * 获取“固定”按钮的clickhandler
     *
     * @private
     * @return {Function}
     */
    _getFixedClickHandler: function () {
        var me = this;
        return function () {
            me._setMode( 'fixed' );
            me.onmodechange( me.mode );
        };
    },
    
    /**
     * 获取“自动隐藏”按钮的clickhandler
     *
     * @private
     * @return {Function}
     */
    _getAutoHideClickHandler: function () {
        var me = this;
        return function () {
            me._setMode( 'autohide' );
            me.onmodechange( me.mode );
            me._hide();
        };
    },
    
    /**
     * 设置sidebar的显示模式，autohide|fixed
     *
     * @private
     * @param {string} mode
     */
    _setMode: function ( mode ) {
        mode = mode.toLowerCase();

        var autoHideMain    = this._getAutoHideMain();
        var fixedMain       = this._getFixedMain();
        var neighbor        = this._getNeighbor();
        var neighborHideClass = this.__getClass( 'neighbor-hide' );

        if ( mode == 'fixed' ) {
            baidu.hide( fixedMain );
            baidu.show( autoHideMain );
        } else {
            baidu.show( fixedMain );
            baidu.hide( autoHideMain );
        }

        this.mode = mode;
        
        // 更新neighbor视图
        if ( this._isAutoHide() ) {
            baidu.addClass( neighbor, neighborHideClass );
        } else {
            baidu.removeClass( neighbor, neighborHideClass );
            this._hideMat();
        }

        this._repaintNeighbor();
    },
    
    /**
     * 判断当前是否自动隐藏模式
     *
     * @private
     * @return {boolean}
     */
    _isAutoHide: function () {
        return this.mode == 'autohide';
    },

    /**
     * 获取“固定”按钮的控件主元素
     *
     * @private
     * @return {HTMLElement}
     */
    _getFixedMain: function () {
        return this._controlMap.btnFixed.main;
    },
    
    /**
     * 获取“自动隐藏”按钮的控件主元素
     *
     * @private
     * @return {HTMLElement}
     */
    _getAutoHideMain: function () {
        return this._controlMap.btnAutoHide.main;
    },
    
    /**
     * 初始化内容区域
     *
     * @private
     * @return {HTMLElement}
     */
    _initContent: function () {
        var main = this.main;
        var head = baidu.dom.first( main );
        var body;
        
        if ( head ) {
            baidu.addClass( head, this.__getClass( 'head' ) );
            this._headEl = head;
            body = baidu.dom.next( head );
            
            if ( body ) {
                this._bodyEl = body;
                baidu.addClass( body, this.__getClass( 'body' ) );
            }
        }
    },
    
    /**
     * 缓存控件的核心数据
     *
     * @private
     */
    _caching: function () {
        var main        = this.main;
        var parent      = main.parentNode;
        var parentPos   = baidu.dom.getPosition( parent );
        var pos         = baidu.dom.getPosition( main )

        if ( !esui.util.hasValue( this._mOffsetTop ) ) {
            this._mOffsetTop = pos.top - parentPos.top;
            this.top  = pos.top;
            this.left = pos.left; 
        } else {
            this.top = parentPos.top + this._mOffsetTop;
        }
    },

    /**
     * 绘制控件
     * 
     * @public
     * @param {HTMLElement} main 控件主元素
     */
    render: function () {
        var me = this,
            pos;

        
        if ( !me._isRendered ) {
            esui.Control.prototype.render.call( me );
            me._caching();
            
            // 给邻居元素添加控制样式的class
            baidu.addClass( me._getNeighbor(), me.__getClass( 'neighbor' ) );
            
            // 初始化控制按钮，内容区域，mat和minibar
            me._initContent();
            me._renderMat();
            me._renderMiniBar();
            me._initCtrlBtn();
            
            // 挂载resize和scorll的listener
            me.heightReseter = me._getHeightReseter();
            me.topReseter    = me._getTopReseter();
            baidu.on( window, 'resize', me.heightReseter );
            baidu.on( window, 'scroll', me.topReseter );
            
            // 给主元素添加over和out的事件handler
            me.main.onmouseover = me._getMainOverHandler();
            me.main.onmouseout  = me._getMainOutHandler();

            // 初始化高度和位置
            me._resetTop();
            me._resetHeight(); 
            
            // 初始化显示状态
            if ( me._isAutoHide() ) {
                me._hide();
            }

            me._isRendered = 1;
        }
    },
    
    /**
     * 绘制mat区域
     * 
     * @private
     */
    _renderMat: function () {
        var mat = document.createElement( 'div' );

        mat.id          = this.__getId( 'mat' );
        mat.className   = this.__getClass( 'mat' );
        document.body.appendChild( mat );
    },

    /**
     * 刷新控件的显示
     *
     * @public
     */
    refreshView: function () {
        this._caching();
        this.heightReseter();
        this.topReseter();
    },

    /**
     * 获取主元素鼠标移入的handler
     *
     * @private
     * @return {Function}
     */
    _getMainOverHandler: function () {
        var me = this;

        return function () {        
            clearTimeout( me._autoTimer );
        };
    },

    /**
     * 获取主元素鼠标移出的handler
     *
     * @private
     * @return {Function}
     */
    _getMainOutHandler: function () {
        var me = this;

        return function ( event ) {
            if ( me._isAutoHide() ) {
                event = event || window.event;
                var tar = event.relatedTarget || event.toElement;
                if ( !baidu.dom.contains( me.main, tar ) ) {
                    me._autoHideBar();                        
                }                                        
            }
        };
    },

    /**
     * 绘制minibar
     * 
     * @private
     */
    _renderMiniBar:function () {
        var me = this,
            div = document.createElement( 'div' ),
            html = [];
        
        // 构建minibar的html
        // 以主sidebar的标题为标题
        me._headEl && html.push(
            '<div class="' 
            + me.__getClass( 'minibar-text' ) 
            + '">' + me._headEl.innerHTML 
            + '</div>');
        html.push('<div class="' + me.__getClass('minibar-arrow') + '"></div>');
        
        // 初始化minibar
        div.innerHTML   = html.join( '' );
        div.id          = me.__getId( 'MiniBar' );
        div.className   = me.__getClass( 'minibar' );
        div.style.left  = '-10000px';
        div.style.top   = me.top + 'px';

        // 持有引用
        me._miniBar = div;
        
        // 挂载行为
        div.onmouseover = me._getMiniOverHandler();
        div.onmouseout  = me._getMiniOutHandler();
        document.body.appendChild( div );
    },
    
    /**
     * 获取minibar鼠标移入的handler
     *
     * @private
     * @return {Function}
     */
    _getMiniOverHandler: function () {
        var me = this;
        var hoverClass = me.__getClass('minibar-hover');

        return function () {            
            if ( !baidu.dom.hasClass(this, hoverClass ) ){
                baidu.addClass( this, hoverClass );
                me._autoTimer = setTimeout(
                    function () {
                        me._hideMiniBar();
                    }, me.autoDelay );
            }
        };
    },
    
    /**
     * 获取minibar鼠标移出的handler
     *
     * @private
     * @return {Function}
     */
    _getMiniOutHandler: function () {
        var me = this;
        return function () {
            baidu.removeClass( this, me.__getClass( 'minibar-hover' ) );
            clearTimeout( me._autoTimer );
        };
    },

    /**
     * 重设控件高度
     * 
     * @private
     */
    _resetHeight: function () {
        var me          = this,
            page        = baidu.page,
            pos         = baidu.dom.getPosition( me.main ),
            scrollTop   = page.getScrollTop(),
            height      = page.getViewHeight(),
            bodyHeight;

        if ( height ) {
            height = height - pos.top + scrollTop - me.marginTop;
        } else {
            height = 300;
        }   
        if ( height < 0 ){
            height = 300;
        }
        
        bodyHeight      = height - me.headHeight;
        this.bodyHeight = bodyHeight;
        this.height     = height;

        me._getMat().style.height = height + me.marginTop * 2 + 'px';
        me.main.style.height = 
        me._miniBar.style.height = 
            height + 'px';

        me._bodyEl && (me._bodyEl.style.height = bodyHeight + 'px');

        this.onresize();
    },
    
    onresize: new Function(),

    /**
     * 获取重设控件高度的函数
     * 
     * @private
     * @return {Function}
     */
    _getHeightReseter: function () {
        var me = this;
        return function () {
            me._resetHeight();
        };
    },
    
    /**
     * 重设控件位置
     * 
     * @private
     * @return {Function}
     */
    _resetTop: function () {
        var me          = this,
            marginTop   = me.marginTop,
            scrollTop   = baidu.page.getScrollTop(),
            main        = me.main,
            mat         = me._getMat(),
            mini        = me._miniBar,
            top         = me.top, 
            mainPos     = 'absolute',
            miniPos     = 'absolute',
            mainTop, miniTop;
        
        // 2x2的判断，真恶心
        if ( baidu.ie && baidu.ie < 7 ) {
            if ( scrollTop > top - marginTop ) {
                mainTop = miniTop = scrollTop - top + me.top;
            } else {
                mainTop = miniTop = top;
                me._resetHeight();
            }
        } else {
            if ( scrollTop > top - marginTop ) {
                miniPos = mainPos = 'fixed';
                mainTop = miniTop = marginTop;    
            } else {
                mainTop = miniTop = top;
                me._resetHeight();
            }
        }
        
        mat.style.top       = mainTop - me.marginTop + 'px';
        main.style.top      = mainTop + 'px';
        mat.style.position  = main.style.position = mainPos;
        mini.style.top      = miniTop + 'px';
        mini.style.position = miniPos;
        setTimeout(function(){
            //移动过快时修补最后一次调整
            me._resetHeight();
        },200);            
    },
    
    /**
     * 获取重设控件位置的函数
     * 
     * @private
     * @return {Function}
     */
    _getTopReseter: function () {
        var me = this;
        return function () {
            me._resetTop();
        };
    },
    
    /**
     * 隐藏mat区域
     * 
     * @private
     */
    _hideMat: function () {
        this._getMat().style.left = '-10000px';
    },

    /**
     * 显示侧边导航
     * 
     * @private
     */
    _show: function () {
        var me          = this,
            step        = 0,
            endLeft     = 10,
            startLeft   = -220,
            minus       = endLeft - startLeft,
            interval;
                
        /**
         * 完成显示侧边导航的动作
         * @inner
         */
        function finished() {
            me._getMat().style.left = 0;
            me.main.style.left = endLeft + 'px'; 
            // TODO: 永久取消js实现的sidebar动画效果
            // me._motioning = false;
            
            if ( me._isAutoHide() ){
                me._autoHideBar();                
            }
        }
        
        finished();
        return;
        
        // TODO: 永久取消js实现的sidebar动画效果
        /*
        me._motioning = true;        
        interval = setInterval(
            function () {
                step ++;
                
                if (step >= me.motionStep) {
                    clearInterval(interval);
                    finished();
                    return;
                }
                
                var pos = Math.floor(minus * me._tween(step));
                me.main.style.left = startLeft + pos + 'px';
            }, 
            me.motionInterval);  
        */
    },
        
    /**
     * 隐藏侧边导航
     *
     * @private
     */
    _hide: function () {
        var me          = this,
            step        = 0,
            endLeft     = -220,
            startLeft   = 10,
            minus   = endLeft - startLeft,
            interval;
        
        finished();
        return;

        function finished( noMotion ) {
            me._getMat().style.left = '-10000px';
            me.main.style.left     = endLeft + 'px';
            //baidu.addClass(me._getNeighbor(), me.__getClass('neighbor-hide'));
            //me._repaintNeighbor();
            
            // TODO: 永久取消js实现的sidebar动画效果
            // me._motioning = false;
            me._showMiniBar( noMotion );
        };
        
        // TODO: 永久取消js实现的sidebar动画效果
        /*
        me._motioning = true;
        interval = setInterval(
            function () {
                step ++;
                
                if (step >= me.motionStep) {                    
                    clearInterval(interval);
                    finished();
                    return;
                }
                
                var pos = Math.floor(minus * me._tween(step));
                me.main.style.left = startLeft + pos + 'px';
            }, 
            me.motionInterval);        
        */
    },    
    
    /**
     * 自动隐藏
     * 
     * @private
     */
    _autoHideBar : function () {
        var me = this;
        clearTimeout( me._autoTimer );
        me._autoTimer = setTimeout( function () {
            var mPos   = baidu.page.getMousePosition(),
                navPos = baidu.dom.getPosition( me.main ),
                main   = me.main;

            if ( mPos.x > navPos.left + main.offsetWidth 
                 || mPos.y < navPos.top 
                 || mPos.y > navPos.top + main.offsetHight
            ) {
                me._hide();
            }            
        }, me.autoDelay);
    },
    
    /**
     * 显示缩小的bar
     * 
     * @private
     */
    _showMiniBar: function (noMotion) {
        var me          = this,
            step        = 0,
            endLeft     = 0,
            startLeft   = -30,
            minus       = endLeft - startLeft,
            interval;
        
        if ( noMotion ) {
            finish();
            return;
        }

        /**
         * 完成显示minibar的动作
         * 
         * @inner
         */
        function finish() {
            me._miniBar.style.left = endLeft + 'px';

            // TODO: 永久取消js实现的sidebar动画效果
            // me._motioning = false;
        }
        
        finish();
        return;
        
        // TODO: 永久取消js实现的sidebar动画效果
        /*
        me._motioning = true;
        interval = setInterval(
            function () {
                step ++;
                
                if (step >= me.motionStep) {
                    clearInterval(interval);
                    finish();
                    return;
                }
                
                var pos = Math.floor(minus * me._tween(step));
                me._miniBar.style.left = startLeft + pos + 'px';
            }, 
            me.motionInterval);
        */
    },
    
    /**
     * 隐藏缩小的bar
     * 
     * @private
     * @param {Function} onComplete 完成的回调函数
     */
    _hideMiniBar: function () {
        var me          = this,
            step        = 0,
            endLeft     = -30,
            startLeft   = 0,
            minus       = endLeft - startLeft,
            interval;  

        /**
         * 完成隐藏minibar的动作
         * @inner
         */
        function finished() {
            me._miniBar.style.left = endLeft + 'px';
            //baidu.removeClass(me._getNeighbor(), me.__getClass('neighbor-hide'));         
            //me._repaintNeighbor();
            
            // TODO: 永久取消js实现的sidebar动画效果
            // me._motioning = false;
            me._show();
        }

        finished();
        return;
        
        // TODO: 永久取消js实现的sidebar动画效果
        /*
        me._motioning = true;
        interval = setInterval(
            function () {
                step ++;
                
                if (step >= me.motionStep) {
                    clearInterval(interval);
                    finish();
                    return;
                }
                
                var pos = Math.floor(minus * me._tween(step));
                me._miniBar.style.left = startLeft + pos + 'px';
            }, 
            me.motionInterval);       
        */
    },

    /**
     * 重绘邻居元素
     * 
     * @private
     * @desc 重绘内部的控件
     */
    _repaintNeighbor: function () {
        var ctrls = esui.util.getControlsByContainer( this._getNeighbor() ),
            len   = ctrls.length,
            i,
            ctrl,
            key;
            
        for ( i = 0; i < len; i++ ) {
            ctrl = ctrls[ i ];

            if ( ctrl.refreshView ) {
                ctrl.refreshView();
            } else {
                ctrl.render();
            }
        }
    },
    
    /**
     * 获取邻居元素
     * 
     * @private
     * @return {HTMLElement}
     */
    _getNeighbor: function () {
        return baidu.dom.next( this.main );
    },
    
    /**
     * 获取mat元素
     * 
     * @private
     * @return {HTMLElement}
     */
    _getMat: function () {
        return baidu.g( this.__getId( 'mat' ) );
    },

    /**
     * 释放控件
     * 
     * @private
     */
    __dispose: function () {
        var me = this;
        var mat = me._getMat();
            
        baidu.un( window, 'resize' ,me.heightReseter );
        baidu.un( window, 'scroll', me.topReseter );
        document.body.removeChild( me._miniBar );
        document.body.removeChild( mat );

        // 释放dom引用
        me._headEl = null;
        me._bodyEl = null;
        me._miniBar = null;

        esui.Control.prototype.__dispose.call( this );
    }
    
    // TODO: 永久取消js实现的sidebar动画效果
    // ,
    /**
     * 动画函数
     * 
     * @private
     * @param {number} step 步数
     * @return {number} 完成百分比
     
    _tween : function(step) {
        return Math.pow(step/this.motionStep, 2);
    }
    */
};

baidu.inherits( esui.SideBar, esui.Control );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Tab.js
 * desc:    Tab标签控件
 * author:  zhaolei, erik, wanghuijun
 */

///import esui.Control;
///import baidu.lang.inherits;

/**
 * Tab标签控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.Tab = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'tab';
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.Control.call( this, options );
    
    this.activeIndex    = this.activeIndex || 0;
    this.allowEdit      = !!this.allowEdit;
    this.maxCount       = this.maxCount || esui.Tab.MAX_COUNT || 5;
};

esui.Tab.prototype = {
    /**
     * 渲染控件
     * 
     * @public
     */
    render: function () {
        var me = this;
        esui.Control.prototype.render.call( me );
        
        this.tabs = this.datasource || this.tabs || [];

        // 绘制内容部分
        me._renderTabs();
    },

    _tplItem    : '<li class="{1}"{2}><em>{0}</em>{3}</li>',
    _tplAdd     : '<li class="add" onclick="{0}">+</li>',
    _tplClose   : '<span onclick="{0}"></span>',
    
    /**
     * 绘制标签区
     * 
     * @private
     */
    _renderTabs: function () {
        var me        = this,
            main      = me.main,
            tabs      = me.tabs,
            len       = tabs.length,
            itemClass = me.__getClass( 'item' ),
            html      = [],
            currClass,
            i,
            tab,
            title,
            closeHtml,
            clickHandler;
        
        if ( len == 0 ) {
            main.innerHTML = '';
            return;
        } else if ( len <= me.activeIndex ) {
            me.activeIndex = 0;
        } else if ( me.activeIndex < 0 ) {
            me.activeIndex = 0;
        }
        
        for (i = 0; i < len; i++) {
            tab             = me.tabs[ i ];
            title           = tab.title;
            currClass       = itemClass;
            closeHtml       = '';
            clickHandler    = '';
            
            // 初始化关闭按钮
            if ( me.allowEdit && !tab.stable ) {
                closeHtml = esui.util.format(
                    me.tplClose,
                    me.__getStrCall( '_close', i )
                );
            }

            // 首尾节点增加特殊class
            if ( i == 0 ) { 
                currClass += ' ' + me.__getClass( 'item-first' );
            }
            if ( i == len - 1 ) {
                currClass += ' ' + me.__getClass( 'item-last' );
            }
            
            // 构建tab的样式与行为
            if ( i == me.activeIndex ) {
                currClass += ' ' + me.__getClass( 'item-active' );
            } else {
                clickHandler = ' onclick="' 
                                + me.__getStrCall( '_select', i )
                                + '"';
            }

            // 构建tab项的html
            html.push(
                esui.util.format(
                    me._tplItem, 
                    title, 
                    currClass, 
                    clickHandler, 
                    closeHtml
                ) );
        }

        // 填充tab的html
        main.innerHTML = '<ul>' + html.join('') + '</ul>';
        me._resetPanel();
    },
    
    /**
     * 重置tab对应的panel的显示隐藏状态
     * 
     * @private
     */
    _resetPanel: function () {
        var tabs        = this.tabs;
        var len         = tabs.length;
        var activeIndex = this.activeIndex;
        var i;
        var panel;

        for ( i = 0; i < len; i++ ) {
            panel = tabs[ i ].panel;
            if ( panel ) {
                baidu.g( panel ).style.display = (i == activeIndex ? '' : 'none');
            }
        }
    },

    onchange: new Function(),
    
    /**
     * 选择标签
     * 
     * @private
     * @param {number} index 标签序号
     */
    _select: function ( index ) {
        if ( this.onchange( index, this.tabs[ index ] ) !== false ) {
            this.setActiveIndex( index );
        }
    },
    
    /**
     * 选择标签
     * 
     * @public
     * @param {number} index 标签序号
     */
    setActiveIndex: function ( index ) {
        this.activeIndex = index;
        this._renderTabs();
    },

    onclose: new Function(),
    
    /**
     * 关闭标签
     * 
     * @private
     * @param {number} index 标签序号
     */
    _close: function ( index ) {
        if ( this.onclose( index, this.tabs[ index ] ) !== false ) {
            this.remove( index );
        }
    },
    
    /**
     * 移除标签
     * 
     * @private
     * @param {number} index 标签序号
     */
    remove: function ( index ) {
        var tabs = this.tabs;
        tabs.splice( index, 1 );

        // 重新设置activeIndex
        if ( this.activeIndex >= tabs.length ) {
            this.activeIndex--;
        }
        if ( this.activeIndex < 0 ) {
            this.activeIndex = 0;
        }

        this._renderTabs();
    },
    
    /**
     * 添加标签
     * 
     * @public
     * @param {Object} tab 标签数据
     */
    add: function ( tab ) {
        tab = tab || { title: '新建标签' }
        this.tabs.push( tab );
        this._renderTabs();
    }
};

baidu.inherits( esui.Tab, esui.Control );
/*
 * esui (ECOM Simple UI)
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    esui/TextInput.js
 * desc:    文本输入框控件
 * author:  erik
 */

///import esui.InputControl;
///import baidu.lang.inherits;
///import baidu.dom.addClass;
///import baidu.dom.removeClass;
///import baidu.event.on;
///import baidu.event.un;

/**
 * 文本输入框组件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.TextInput = function ( options ) {
    // 标识鼠标事件触发自动状态转换
    this._autoState = 1;

    esui.InputControl.call( this, options );
    
    // 初始化value
    this.value = this.value || '';

    // 初始化mode
    if ( this.mode && this.mode != 'textarea' && this.mode != 'password' ) {
        this.mode = 'text';
    }
};

esui.TextInput.prototype = {
    /**
     * 设置输入控件的title提示
     * 
     * @public
     * @param {string} title
     */
    setTitle: function ( title ) {
        this.main.setAttribute( 'title', title );
    },
    
    /**
     * 将文本框设置为禁用
     * 
     * @public
     */
    disable: function () {
        this.main.disabled = true;
        esui.InputControl.prototype.disable.call( this );
    },

    /**
     * 将文本框设置为可用
     * 
     * @public
     */
    enable: function () {
        this.main.disabled = false;
        esui.InputControl.prototype.enable.call( this );
    },

    /**
     * 设置控件为只读
     * 
     * @public
     * @param {Object} readOnly
     */
    setReadOnly: function ( readOnly ) {
        readOnly = !!readOnly;
        this.main.readOnly = readOnly;
        this.readOnly = readOnly;
        readOnly ? this.addState('readonly') : this.removeState('readonly');
    },
    
    /**
     * 设置控件的高度
     *
     * @public
     * @param {number} height 高度
     */
    setHeight: function ( height ) {
        this.height = height;
        height && (this.main.style.height = height + 'px');
    },
    
    /**
     * 设置控件的宽度
     *
     * @public
     * @param {number} width 宽度
     */
    setWidth: function ( width ) {
        this.width = width;
        width && (this.main.style.width = width + 'px');
    },
    
    /**
     * 获焦并选中文本
     * 
     * @public
     */
    select: function () {
        this.main.select();
    },

    /**
     * 获取文本输入框的值
     * 
     * @public
     * @return {string}
     */
    getValue: function () {
        var value = this.main.value;
        if ( this._placing ) {
            return '';
        }

        return value;
    },
    
    /**
     * 设置文本输入框的值
     * 
     * @public
     * @param {string} value
     */
    setValue: function ( value ) { 
        value = value || '';

        var main        = this.main;
        var virClass    = this.__getClass( 'virtual' );
        var placeholder = this.placeholder;
        
        // 移除输入事件的处理，设置后再重新挂载
        // ie下setValue会触发propertychange事件
        this._removeInputListener();

        main.value = value;
        if ( value ) {
            this._placing = 0;
            baidu.removeClass( main, virClass );
        } else if ( placeholder ) {
            this._placing = 1;
            main.value = placeholder;
            baidu.addClass( main, virClass );
        }

        // 重新挂载输入事件的处理
        this._addInputListener();
    },

    
    /**
     * 渲染控件
     * 
     * @public
     * @param {Object} main 控件挂载的DOM
     */
    render: function () {
        var me      = this;
        var main    = me.main;
        
        if ( !me._isRendered ) {
            esui.InputControl.prototype.render.call( me );

            // 绑定事件
            main.onkeypress = me._getPressHandler();
            me._addInputListener();
            
            // 移除press状态的自动切换器
            main.onmousedown = null;
            main.onmouseup = null;

            // 挂载获焦和失焦事件处理
            main.onfocus = me._getFocusHandler();
            main.onblur = me._getBlurHandler();

            me._isRendered = 1;
        }

        // 设置readonly和disabled状态
        me.setReadOnly( !!me.readOnly );
        me.setDisabled( !!me.disabled );

        // 绘制宽高
        me.setWidth( me.width );
        me.setHeight( me.height );

        // 刷新输入框的value
        me.setValue( me.value );
    },
    
    /**
     * 添加控件oninput事件的监听器
     * 
     * @private
     */
    _addInputListener: function () {
        var main = this.main;
        var changeHandler = this._changeHandler;

        if ( !changeHandler ) {
            changeHandler = this._getChangeHandler();
            this._changeHandler = changeHandler;
        }
        
        if ( baidu.ie ) {
            main.onpropertychange = changeHandler;
        } else {
            baidu.on( main, 'input', changeHandler );
        }
    },
    
    /**
     * 移除控件oninput事件的监听器
     * 
     * @private
     */
    _removeInputListener: function () {
        var changeHandler = this._changeHandler;
        var main = this.main;

        if ( baidu.ie ) {
            main.onpropertychange = null;
        } else {
            changeHandler && baidu.un( main, 'input', changeHandler );
        }
    },
    
    onfocus: new Function(),

    /**
     * 获取获焦事件处理函数
     * 
     * @private
     * @return {Function}
     */
    _getFocusHandler: function () {
        var me = this;
            
        return function () {
            var main = me.main;
            
            baidu.removeClass( main, me.__getClass( 'virtual' ) );
            if ( me._placing ) {
                main.value = '';
            }

            if ( me.autoSelect ) {
                main.select();
            }

            me.onfocus();
        };
    },
    
    onblur: new Function(),

    /**
     * 获取失焦事件处理函数
     * 
     * @private
     * @return {Function}
     */
    _getBlurHandler: function () {
        var me = this;
            
        return function () {
            me.setValue( me.main.value );
            me.onblur();
        };
    },
    
    onenter: new Function(),

    /**
     * 获取键盘敲击的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getPressHandler: function () {
        var me = this;
        return function ( e ) {
            e = e || window.event;
            var keyCode = e.keyCode || e.which;
            
            if ( me._type != 'text' ) {
                return;
            }
            
            if ( keyCode == 13 ) {
                return me.onenter();
            }
        };
    },
    
    onchange: new Function(),
    
    /**
     * 获取输入框value发生改变的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getChangeHandler: function() {
        var me = this;
        return function ( e ) {
            if ( baidu.ie ) {
                if ( window.event.propertyName == 'value' ) {
                    me.onchange();
                }
            } else {       
                me.onchange();
            } 
        };
    },
    
    /**
     * 构造控件
     *
     * @protected
     */
    __construct: function () {
        esui.InputControl.prototype.__construct.call( this );
        
        var me      = this;
        var main    = me.main;
        var tagName = main.tagName;
        var tagType = main.getAttribute( 'type' );

        // 判断输入框的mode
        var mode = '';
        switch ( tagName ) {
        case 'TEXTAREA':
            mode = 'textarea';
            break;
        case 'INPUT':
            switch ( tagType ) {
            case 'text':
            case 'password':
                mode = tagType;
                break;
            }
            break;
        }

        if ( !mode ) {
            throw new Error( "esui.TextInput: invalid main element!" );
        }

        me.mode = me.mode || mode;

        // 类型声明，用于生成控件子dom的id和class
        me._type = me.mode == 'textarea' ? 'textarea' : 'text';

        me.value = me.value || main.value;
        me.placeholder = me.placeholder || main.getAttribute( 'placeholder' );
        main.setAttribute( 'placeholder', '' );
    },

    /**
     * 释放控件
     * 
     * @protected
     */
    __dispose: function () {
        // 卸载main的事件
        var main = this.main;
        main.onkeypress = null;
        main.onchange = null;
        main.onfocus = null;
        main.onblur = null;

        this._removeInputListener();
        this._changeHandler = null;

        esui.InputControl.prototype.__dispose.call( this );
    },
    
    /**
     * 创建控件主元素
     *
     * @protected
     * @return {HTMLInputElement}
     */
    __createMain: function () {
        var creater = esui.InputControl.prototype.__createInput;
        var mode    = this.mode;
        mode        = mode || 'text';

        if ( mode == 'text' || mode == 'password' ) {
            return creater.call( this, {
                tagName : 'input',
                name    : this.name,
                type    : mode
            } );
        } else {
            return creater.call( this, {
                tagName : 'textarea',
                name    : this.name
            } );
        }
    }
};

baidu.inherits( esui.TextInput, esui.InputControl );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Table.js
 * desc:    表格控件
 * author:  erik, wanghuijun, linzhifeng
 * date:    $Date: 2010/12/16 13:04:00 $
 * 
 * 表格级属性：
 * columnResizable：‘true’ or ‘false’，默认为false，为true则开启列宽拖拽改变功能（计划、单元、关键词、创意中已修改为打开状态）
 * followHead：‘true’ or ‘false’，默认为false，为true则开启纵向滚动表头悬停功能，如需添加表格外部元素与表头悬浮同时锁定，可在该元素上添加class：scroll_y_top_fixed，如目前表格上方的操作和总计区域，（计划、单元、关键词、创意中已修改为打开状态）
 * 
 * 列级属性：
 * stable： true’ or ‘false’，默认为false，该值代表该列是否可伸缩，进入页面或屏宽改变时表格将自动计算用户可视区域宽度，并自动伸缩各列，当某列带stable为true时该列则别伸缩。这个值尽量少用，保存整个表格是灵活可伸缩效果最好，大家担心的列宽太窄影响显示的问题可以通过minWidth属性解决。
 * locked： true’ or ‘false’，默认为false，该值指定列锁定，锁定列在出现横向滚动条时不被滚动。
 * minWidth：number，默认自动计算为表头宽度（文字+排序图标），可设定该列被拖拽或被自适应拉伸时的最小宽度
 * resizable： true’ or ‘false’，默认为true，当表格属性columnResizable为true时该值才生效，代表该列是否开启拖拽改变列宽功能
 */

///import esui.Control;
///import esui.Layer;
///import esui.Button;
///import esui.TextInput;
///import baidu.lang.inherits;

/**
 * 表格框控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.Table = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'table';
    
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.Control.call( this, options );
    
    this.__initOption( 'noDataHtml', null, 'NODATA_HTML' );
    this.__initOption( 'followHead', null, 'FOLLOW_HEAD' );
    this.__initOption( 'sortable', null, 'SORTABLE' );
    this.__initOption( 'columnResizable', null, 'COLUMN_RESIZABLE' );
    this.__initOption( 'rowWidthOffset', null, 'ROW_WIDTH_OFFSET' );
    this.__initOption( 'subrowMutex', null, 'SUBROW_MUTEX' );
    this.__initOption( 'subEntryOpenTip', null, 'SUBENTRY_OPEN_TIP' );
    this.__initOption( 'subEntryCloseTip', null, 'SUBENTRY_CLOSE_TIP' );
    this.__initOption( 'subEntryWidth', null, 'SUBENTRY_WIDTH' );
    this.__initOption( 'breakLine', null, 'BREAK_LINE' );
    
    // 诡异的webkit
    // 表格的单元格不需要考虑边框宽度，直接加齐就行
    // 而且即使table-layout:fixed，单元格宽度也不会从前向后分配
    // 而会以未知策略将剩余宽度分配给单元格
    //
    // 但是在chrome19以上修复了此问题
    // 并且在safari5.1.4上测试未发现问题
    // if ( baidu.browser.isWebkit ) {
    //     this.rowWidthOffset = 0;
    // }

    this._followHeightArr = [0, 0];
    this._followWidthArr = [];
};

esui.Table.NODATA_HTML          = '';
esui.Table.FOLLOW_HEAD          = 0;
esui.Table.SORTABLE             = 0;
esui.Table.COLUMN_RESIZABLE     = 0;
esui.Table.ROW_WIDTH_OFFSET     = -1;
esui.Table.SUBROW_MUTEX         = 1;
esui.Table.SUBENTRY_OPEN_TIP    = '点击展开';
esui.Table.SUBENTRY_CLOSE_TIP   = '点击收起';
esui.Table.SUBENTRY_WIDTH       = 18;
esui.Table.BREAK_LINE           = 0;

esui.Table.prototype = {
    /**
     * 初始化表格的字段
     * 
     * @private
     */
    _initFields: function () {
        if ( !this.fields ) {
            return;
        }
        
        // 避免刷新时重新注入
        var fields  = this.fields,
            _fields = fields.slice( 0 ),
            len     = _fields.length;

        while ( len-- ) {
            if ( !_fields[ len ] ) {
                _fields.splice( len, 1 );
            }
        }
        this._fields = _fields;
        if ( !this.select ) {
            return;
        }
        
        switch ( this.select.toLowerCase() ) {
            case 'multi':
                _fields.unshift( this.FIELD_MULTI_SELECT );
                break;
            case 'single':
                _fields.unshift( this.FIELD_SINGLE_SELECT );
                break;
        }
    },
    
    /**
     * 获取列表体容器素
     * 
     * @public
     * @return {HTMLElement}
     */
    getBody: function () {
        return baidu.g( this.__getId( 'body' ) );
    },
    
    /**
     * 获取列表头容器元素
     * 
     * @public
     * @return {HTMLElement}
     */
    getHead: function () {
        return baidu.g( this.__getId( 'head' ) );
    },

    /**
     * 获取列表尾容器元素
     * 
     * @public
     * @return {HTMLElement}
     */
    getFoot: function () {
        return baidu.g( this.__getId( 'foot' ) );
    },
    
    /**
     * 获取表格内容行的dom元素
     * 
     * @private
     * @param {number} index 行号
     * @return {HTMLElement}
     */
    _getRow: function ( index ) {
        return baidu.g( this.__getId( 'row' ) + index );
    },
    
    /**
     * 获取checkbox选择列表格头部的checkbox表单
     * 
     * @private
     * @return {HTMLElement}
     */
    _getHeadCheckbox: function () {
        return baidu.g( this.__getId( 'selectAll' ) );
    },
    
    /**
     * 获取表格所在区域宽度
     * 
     * @private
     * @return {number}
     */
    _getWidth: function () {  
        // 如果手工设置宽度，不动态计算
        if ( this.width ) {
            return this.width;
        }  
        
        var me = this,
            width,
            rulerDiv = document.createElement( 'div' ),
            parent = me.main.parentNode;
        
        parent.appendChild( rulerDiv );    
        width = rulerDiv.offsetWidth;
        parent.removeChild( rulerDiv );
        
        return width;
    },
    
    /**
     * dom表格起始的html模板
     * 
     * @private
     */
    _tplTablePrefix: '<table cellpadding="0" cellspacing="0" width="{0}" controlTable="{1}">',
    
    /**
     * 缓存控件的核心数据
     *
     * @private
     */
    _caching: function () {
        if ( this.followHead ) {
            this._cachingFollowHead();
        }
    },
    
    /**
     * 缓存表头跟随所用的数据
     *
     * @private
     */
    _cachingFollowHead: function () {
        var me = this;
        var followDoms = me._followDoms;

        if ( !followDoms ) {
            followDoms = [];
            me._followDoms = followDoms;

            var walker = me.main.parentNode.firstChild;
            var dom;
            var i, len;
            var followWidths = me._followWidthArr;
            var followHeights = me._followHeightArr;

            // 缓存表格跟随的dom元素
            while ( walker ) {
                if ( walker.nodeType == 1 
                     && walker.getAttribute( 'followThead' )
                ) {
                    followDoms.push( walker );
                }
                walker = walker.nextSibling;
            }

            function getStyleNum( dom, styleName ) {
                var result = baidu.dom.getStyle( dom, styleName );
                return parseInt( result, 10 ) || 0;
            }

            // 读取height和width的值缓存
            followHeights[ 0 ] = 0;
            for ( i = 0, len = followDoms.length; i < len; i++ ) {
                dom = followDoms[ i ];
                followWidths[ i ] = getStyleNum( dom, 'padding-left' ) 
                                  + getStyleNum( dom, 'padding-right' )  
                                  + getStyleNum( dom, 'border-left' ) 
                                  + getStyleNum( dom, 'border-right' ); 
                followHeights[ i + 1 ] = followHeights[ i ] + dom.offsetHeight;
            }
            followHeights[ i + 1 ] = followHeights[ i ];
            followHeights.lenght = i + 2;
        }

        // 读取跟随的高度，缓存
        me._followTop = baidu.dom.getPosition( followDoms[ 0 ] || me.main ).top;
    },

    /**
     * 绘制表格
     * 
     * @public
     */
    render: function () {
        var me   = this,
            main = me.main,
            i,
            len;
        
        me._initFields();
        if ( !me._fields ) {
            return;
        }
        
        esui.Control.prototype.render.call( this );

        // 如果未绘制过，初始化列宽
        if ( !me._isInited ) {
            me._initMinColsWidth();
        }

        me._subrowIndex = null;
        me._width = me._getWidth();
        main.style.width = me._width + 'px';
        
        me._initColsWidth();
        
        // 停止编辑功能
        me.stopEdit();

        me._renderHead();   // 绘制表格头
        me._renderBody();   // 绘制列表
        me._renderFoot();   // 绘制表格尾
        
        // 如果未绘制过，初始化resize处理
        if ( !me._isInited ) {
            me._caching();
            me._initResizeHandler();
            me._initTopResetHandler();   
            me._isInited = 1;
        } else {
            // 重绘时触发onselect事件
            switch ( me.select ) {
            case 'multi':
                me.onselect( [] );
                break;
            }
        }
        
        // 如果表格的绘制导致浏览器出现纵向滚动条
        // 需要重新计算各列宽度
        // 妈的，又多一次reflow
        if ( me._width != me._getWidth() ) {
            me._handleResize();
        }
    },
    
    onselect: new Function (),
    
    /**
     * 初始最小列宽
     *
     * @private
     */
    _initMinColsWidth: function() {
        var me      = this,
            fields  = me._fields,
            len     = fields.length,
            result  = [],
            field,
            width,
            i;

        if ( !me.noHead ) {
            for ( i = 0; i < len; i++ ) {
                field = fields[ i ];
                width = field.minWidth;
                if ( !width && !field.breakLine ) {
                    // 20包括排序和外层padding
                    width = field.title.length * 13 + 20;
                }

                result[i] = width;
            }
        } else {
            for ( i = 0; i < len; i++ ) {
                result[i] = 40;
            }
        }

        me._minColsWidth = result;
    },
    
    /**
     * 初始化列宽
     * 
     * @private
     */
    _initColsWidth: function () {
        var me          = this,
            fields      = me._fields,
            len         = fields.length,
            canExpand   = [],
            leaveAverage,
            leftWidth,
            field,
            offset,
            width,
            index,
            maxCanExpandIdx = 0,
            minWidth,
            i;
        
        me._colsWidth = [];
        
        // 减去边框的宽度
        leftWidth = me._width - 1;
        
        maxCanExpandIdx = len;

        // 读取列宽并保存
        for ( i = 0; i < len; i++ ) {
            field = fields[ i ];
            width = field.width;
            
            width = (width ? parseInt( width, 10 ) : 0);
            me._colsWidth.push( width );
            leftWidth -= width;

            if ( !field.stable ) {
                canExpand.push( i );
            }
        }
        
        // 根据当前容器的宽度，计算可拉伸的每列宽度
        len = canExpand.length;                 
        leaveAverage = Math.round( leftWidth / len );
        
        for ( i = 0; i < len; i++ ) {
            index  = canExpand[ i ];
            offset = Math.abs( leftWidth ) < Math.abs( leaveAverage ) ? leftWidth : leaveAverage; 
            leftWidth -= offset;
            me._colsWidth[ index ] += offset;

            //计算最小宽度
            minWidth = me._minColsWidth[ index ];
            if ( minWidth > me._colsWidth[ index ] ) {
                leftWidth += me._colsWidth[ index ] - minWidth;
                me._colsWidth[ index ] = minWidth;
            }
        }
        
        if ( leftWidth < 0 ) {// 如果空间不够分配，需要重新从富裕的列调配空间
            i = 0;
            while ( i < len && leftWidth != 0 ) {
                index    = canExpand[ i ];
                minWidth = me._minColsWidth[ index ];

                if ( minWidth < me._colsWidth[ index ] ) {
                    offset = me._colsWidth[ canExpand[ i ] ] - minWidth;
                    offset = offset > Math.abs( leftWidth ) ? leftWidth : -offset;
                    leftWidth += Math.abs( offset );
                    me._colsWidth[ index ] += offset;
                }
                i++;
            }
        } else if ( leftWidth > 0 ) {// 如果空间富裕，则分配给第一个可调整的列
            me._colsWidth[ canExpand[ 0 ] ] += leftWidth;
        }
        
    },
    
    /**
     * 绘制表格尾
     * 
     * @private
     */
    _renderFoot: function () {
        var me      = this,
            type    = 'foot',
            id      = me.__getId( type ),
            foot    = baidu.g( id );

        if ( !( me.foot instanceof Array ) ) {
            foot && (foot.style.display = 'none');
        } else {
            if ( !foot ) {
                foot = document.createElement( 'div' );
                foot.id = id;
                foot.className = me.__getClass( type );
                foot.setAttribute( 'controlTable', me.id );
                
                me.main.appendChild( foot );
            }    
            
            foot.style.display = '';
            foot.style.width = me._width + 'px';
            foot.innerHTML = me._getFootHtml();
        }
    },
    
    /**
     * 获取表格尾的html
     * 
     * @private
     * @return {string}
     */
    _getFootHtml: function () {
        var html        = [];
        var footArray   = this.foot;
        var len         = footArray.length;
        var fieldIndex  = 0;
        var colsWidth   = this._colsWidth;
        var thCellClass = this.__getClass( 'fcell' );
        var thTextClass = this.__getClass( 'fcell-text' );
        var i, colWidth, j, footInfo, 
            colspan, thClass, contentHtml;
        
        html.push( esui.util.format( this._tplTablePrefix, '100%', this.id ) );
        for ( i = 0; i < len; i++ ) {
            footInfo    = footArray[ i ];
            colWidth    = colsWidth[ fieldIndex ];
            colspan     = footInfo.colspan || 1;
            thClass     = [ thCellClass ];
            contentHtml = footInfo.content;

            if ( 'function' == typeof contentHtml ) {
                contentHtml = contentHtml.call( this );
            }
            contentHtml = contentHtml || '&nbsp;';

            for ( j = 1; j < colspan; j++ ) {
                colWidth += colsWidth[ fieldIndex + j ];
            }
            
            fieldIndex += colspan;
            if ( footInfo.align ) {
                thClass.push( this.__getClass( 'cell-align-' + footInfo.align ) );
            }
            
            colWidth += this.rowWidthOffset; 
            (colWidth < 0) && (colWidth = 0);
            html.push('<th id="' + this._getFootCellId( i ) + '" class="' + thClass.join( ' ' ) + '"',
                        ' style="width:' + colWidth + 'px;',
                        (colWidth ? '' : 'display:none;') + '">',
                        '<div class="' + thTextClass + '">',
                        contentHtml,
                        '</div></th>');
        }

        html.push( '</tr></table>' );
        return html.join( '' );
    },

    /**
     * 绘制表格头
     * 
     * @private
     */
    _renderHead: function () {
        var me      = this,
            type    = 'head',
            id      = me.__getId( type ),
            head    = baidu.g( id );
            
        if ( me.noHead ) {
            return;
        }

        if ( !head ) {
            head = document.createElement( 'div' );
            head.id = id;
            head.className = me.__getClass( type );
            head.setAttribute( 'controlTable', me.id );

            // 绑定拖拽的事件处理
            if ( me.columnResizable ) {
                head.onmousemove = me._getHeadMoveHandler();
                head.onmousedown = me._getDragStartHandler();
            }
            me.main.appendChild( head );
        }    
        
        head.style.width = me._width + 'px';
        head.innerHTML   = me._getHeadHtml();
    },
    
    /**
     * 获取表格头的html
     * 
     * @private
     * @return {string}
     */
    _getHeadHtml: function () {
        // TODO: 使用format性能很低的哈
        var me          = this,
            fields      = this._fields,
            len         = fields.length,
            html        = [],
            thCellClass = me.__getClass( 'hcell' ),
            thTextClass = me.__getClass( 'hcell-text' ),
            breakClass  = me.__getClass( 'cell-break' ),
            sortClass   = me.__getClass( 'hsort' ),
            selClass    = me.__getClass( 'hcell-sel' ),
            tipClass    = me.__getClass( 'hhelp' ),
            i, field, title, canDragBegin, canDragEnd,
            contentHtml,
            orderClass,
            alignClass,
            thClass,
            currentSort,
            sortIconHtml,
            sortable,
            tipHtml;
        
        // 计算最开始可拖拽的单元格
        for ( i = 0; i < len; i++ ) {
            if ( !fields[i].stable ) {
                canDragBegin = i;
                break;
            }
        }
        
        // 计算最后可拖拽的单元格
        for ( i = len - 1; i >= 0; i-- ) {
            if ( !fields[ i ].stable ) {
                canDragEnd = i;
                break;
            }
        }
        
        // 拼装html
        html.push( esui.util.format( me._tplTablePrefix, '100%', me.id ) );//me._totalWidth - 2
        html.push( '<tr>' ); 
        for ( i = 0; i < len; i++ ) {
            thClass     = [ thCellClass ];
            field       = fields[ i ];
            title       = field.title;
            sortable    = (me.sortable && field.sortable);
            currentSort = (sortable 
                            && field.field 
                            && field.field == me.orderBy);
            
            // 小提示图标html
            /*
            tipHtml = '';
            if (!me.noTip && field.tip) {
                tipHtml = ui._format(me._tplTipIcon,
                                    tipClass,
                                    ui.ToolTip.getEventString(field.tip));
            }
            */

            // 计算排序图标样式
            sortIconHtml = '';
            orderClass   = '';
            if ( sortable ) {
                thClass.push( me.__getClass( 'hcell-sort' ) );
                if ( currentSort ) {
                    thClass.push( me.__getClass( 'hcell-' + me.order ) );
                }             
                sortIconHtml = esui.util.format( me._tplSortIcon, sortClass );
            }
            
            // 计算表格对齐样式
            if ( field.align ) {
                thClass.push( me.__getClass( 'cell-align-' + field.align ) );
            }

            // 判断是否breakline模式
            if (esui.Table.BREAK_LINE
                || me.breakLine
                || field.breakLine
            ) {
                thClass.push( breakClass );
            }
            
            // 计算内容html
            if ( typeof title == 'function' ) {
                contentHtml = title.call( me );
            } else {
                contentHtml = title;
            }
            contentHtml = contentHtml || '&nbsp;';
            
                                        
            html.push('<th id="' + this._getTitleCellId( i ) + '" index="' + i + '"',
                        ' class="' + thClass.join( ' ' ) + '"',
                        sortAction(field, i),
                        (i >= canDragBegin && i < canDragEnd ? ' dragright="1"' : ''),
                        (i <= canDragEnd && i > canDragBegin ? ' dragleft="1"' : ''),
                        ' style="width:' + (me._colsWidth[ i ] + me.rowWidthOffset) + 'px;',
                        (me._colsWidth[i] ? '' : 'display:none') + '">',
                        '<div class="' + thTextClass +
                        (field.select ? ' ' + selClass : '') + '">',
                        contentHtml,
                        sortIconHtml,
                        tipHtml,
                        '</div></th>');
        }
        html.push( '</tr></table>' );
        return html.join( '' );
        
        /**
         * 获取表格排序的单元格预定义属性html
         * 
         * @inner
         * @return {string}
         */
        function sortAction( field, index ) {
            if ( me.sortable && field.sortable ) {
                return esui.util.format(
                            ' onmouseover="{0}" onmouseout="{1}" onclick="{2}" sortable="1"',
                            me.__getStrRef() + '._titleOverHandler(this)',
                            me.__getStrRef() + '._titleOutHandler(this)',
                            me.__getStrRef() + '._titleClickHandler(this)');
            }
            
            return '';
        }
    },
    
    _tplSortIcon: '<div class="{0}"></div>',

    // 提示模板，此处还未定实现方式
    _tplTipIcon: '<div class="{0}" {1}></div>', 
    
    /**
     * 获取表格头单元格的id
     * 
     * @private
     * @param {number} index 单元格的序号
     * @return {string}
     */
    _getTitleCellId: function ( index ) {
        return this.__getId( 'titleCell' ) + index;
    },

    /**
     * 获取表格尾单元格的id
     * 
     * @private
     * @param {number} index 单元格的序号
     * @return {string}
     */
    _getFootCellId: function ( index ) {
        return this.__getId( 'footCell' ) + index;
    },
    
    /**
     * 表格头单元格鼠标移入的事件handler
     * 
     * @private
     * @param {HTMLElement} cell 移出的单元格
     */
    _titleOverHandler: function ( cell ) {
        if ( this._isDraging || this._dragReady ) {
            return;
        }
        
        this._sortReady = 1;
        baidu.addClass( cell, this.__getClass( 'hcell-hover' ) );
    },
    
    /**
     * 表格头单元格鼠标移出的事件handler
     * 
     * @private
     * @param {HTMLElement} cell 移出的单元格
     */
    _titleOutHandler: function ( cell ) {
        this._sortReady = 0;
        baidu.removeClass( cell, this.__getClass( 'hcell-hover' ) );
    },
    
    onsort: new Function(),
    
    /**
     * 表格头单元格点击的事件handler
     * 
     * @private
     * @param {HTMLElement} cell 点击的单元格
     */
    _titleClickHandler: function ( cell ) {
        if ( this._sortReady ) { // 避免拖拽触发排序行为
            var me      = this,
                field   = me._fields[ cell.getAttribute( 'index' ) ],
                orderBy = me.orderBy,
                order   = me.order;
            
            if ( orderBy == field.field ) {
                order = (!order || order == 'asc') ? 'desc' : 'asc';
            } else {
                order = 'desc';
            }
            me.onsort( field, order );
            me.order = order;
            me.orderBy = field.field;
            me._renderHead();
        }
    },
    
    /**
     * 获取表格头鼠标移动的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getHeadMoveHandler: function () {
        var me          = this,
            dragClass   = me.__getClass( 'startdrag' ),
            range       = 8; // 可拖拽的单元格边界范围
            
        return function ( e ) {
            if ( me._isDraging ) {
                return;
            }
            
            e = e || window.event;
            var tar     = e.srcElement || e.target,
                page    = baidu.page,
                pageX   = e.pageX || e.clientX + page.getScrollLeft(),
                pos, 
                index,
                sortable;
            
            // 寻找th节点。如果查找不到，退出
            tar = me._findDragCell( tar );
            if ( !tar ) {
                return;
            }
            
            // 获取位置与序号
            pos         = baidu.dom.getPosition( tar );
            index       = tar.getAttribute( 'index' );
            sortable    = tar.getAttribute( 'sortable' );
            
            // 如果允许拖拽，设置鼠标手型样式与当前拖拽点
            if ( tar.getAttribute( 'dragleft' ) 
                 && pageX - pos.left < range
            ) {
                sortable && ( me._titleOutHandler( tar ) ); // 清除可排序列的over样式
                baidu.addClass( this, dragClass );
                me._dragPoint = 'left';
                me._dragReady = 1;
            } else if (tar.getAttribute( 'dragright' ) 
                       && pos.left + tar.offsetWidth - pageX < range
            ) {
                sortable && ( me._titleOutHandler( tar ) ); // 清除可排序列的over样式
                baidu.addClass( this, dragClass );
                me._dragPoint = 'right';
                me._dragReady = 1;
            } else {
                baidu.removeClass( this, dragClass );
                sortable && ( me._titleOverHandler( tar ) ); // 附加可排序列的over样式
                me._dragPoint = '';
                me._dragReady = 0;
            }
        };
    },
    
    /**
     * 查询拖拽相关的表格头单元格
     * 
     * @private
     * @param {HTMLElement} target 触发事件的元素
     * @return {HTMLTHElement}
     */
    _findDragCell: function ( target ) {    
        while ( target.nodeType == 1 ) {
            if ( target.tagName == 'TH' ) {
                return target;
            }
            target = target.parentNode;
        }
        
        return null;
    },
 
    /**
     * 获取表格头鼠标点击拖拽起始的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getDragStartHandler: function () {
        var me = this,
            dragClass = me.__getClass( 'startdrag' );
            
        return function ( e ) {
            e = e || window.event;
            var tar = e.target || e.srcElement;
            
            // 寻找th节点，如果查找不到，退出
            tar = me._findDragCell( tar );
            if ( !tar ) {
                return;
            }
            
            if ( baidu.g( me.__getId( 'head' ) ).className.indexOf( dragClass ) < 0 ) {
                return;
            }            
                        
            // 获取显示区域高度
            me._htmlHeight = document.documentElement.clientHeight;
            
            // 记忆起始拖拽的状态
            me._isDraging = true;
            me._dragIndex = tar.getAttribute( 'index' );
            me._dragStart = e.pageX || e.clientX + baidu.page.getScrollLeft();
            
            // 绑定拖拽事件
            document.onmousemove = me._getDragingHandler();
            document.onmouseup   = me._getDragEndHandler();
            
            // 显示拖拽基准线
            me._showDragMark( me._dragStart );
            
            // 阻止默认行为
            baidu.event.preventDefault( e );
            return false;
        };
    },
    
    /**
     * 获取拖拽中的事件handler
     * 
     * @private
     * @desc 移动拖拽基准线
     * @return {Function}
     */
    _getDragingHandler: function () {
        var me = this;
        return function ( e ) {
            e = e || window.event;
            me._showDragMark( e.pageX || e.clientX + baidu.page.getScrollLeft() );
            baidu.event.preventDefault( e );
            return false;
        };
    },
    
    /**
     * 显示基准线
     * 
     * @private
     */
    _showDragMark: function ( left ) {
        var me      = this,
            mark    = me._getDragMark();
        
        if ( !me.top ) {
            me.top = baidu.dom.getPosition( me.main ).top;
        }    
        
        if ( !mark ) {
            mark = me._createDragMark();
        }
        
        mark.style.top = me.top + 'px';
        mark.style.left = left + 'px';
        mark.style.height = me._htmlHeight - me.top + baidu.page.getScrollTop() + 'px';
    },
    
    /**
     * 隐藏基准线
     * 
     * @private
     */
    _hideDragMark: function () {
        var mark = this._getDragMark();
        mark.style.left = '-10000px';
        mark.style.top = '-10000px';
    },
    
    /**
     * 创建拖拽基准线
     * 
     * @private
     * @return {HTMLElement}
     */
    _createDragMark: function () {
        var mark        = document.createElement( 'div' );
        mark.id         = this.__getId( 'dragMark' );
        mark.className  = this.__getClass( 'mark ');
        mark.style.top  = '-10000px';
        mark.style.left = '-10000px';
        document.body.appendChild( mark );
        
        return mark;
    },
    
    /**
     * 获取基准线的dom元素
     * 
     * @private
     * @return {HTMLElement}
     */
    _getDragMark: function () {
        return baidu.g( this.__getId( 'dragMark' ) );
    },
    
    /**
     * 获取拖拽结束的事件handler
     * 
     * @private
     * @return {Function}
     */
    _getDragEndHandler: function () {
        var me = this;
        return function (e) {
            e = e || window.event;
            var minWidth,
                index = parseInt( me._dragIndex, 10 ),
                pageX = e.pageX || e.clientX + baidu.page.getScrollLeft(),
                offsetX,
                field,
                fields      = me._fields, 
                fieldLen    = fields.length,
                alters      = [], 
                alterWidths = [], 
                alter, 
                alterLen, 
                alterWidth, 
                alterSum    = 0,
                colsWidth   = me._colsWidth,
                leave, i, 
                revise      = 0, 
                totalWidth,
                offsetWidth, 
                currentWidth, 
                roughWidth;

            // 校正拖拽元素
            // 如果是从左边缘拖动的话，拖拽元素应该上一列
            if ( me._dragPoint == 'left' ) {
                index--;
            }
            
            // 校正拖拽列的宽度
            // 不允许小于最小宽度
            minWidth        = me._minColsWidth[ index ];
            offsetX         = pageX - me._dragStart;
            currentWidth    = colsWidth[ index ] + offsetX;
            if ( currentWidth < minWidth ) {
                offsetX += (minWidth - currentWidth);
                currentWidth = minWidth;
            }
            
            //查找宽度允许改变的列
            for ( i = index + 1; i < fieldLen; i++ ) {
                if ( !fields[ i ].stable && colsWidth[i] > 0 ) {
                    alters.push( i );
                    alterWidth = colsWidth[ i ];
                    alterWidths.push( alterWidth );
                    alterSum += alterWidth;
                }
            }

            // 计算允许改变的列每列的宽度
            leave = offsetX;
            alterLen = alters.length;
            for ( i = 0; i < alterLen; i++ ) {
                alter       = alters[ i ];
                alterWidth  = alterWidths[ i ];    //当前列宽
                roughWidth  = offsetX * alterWidth / alterSum; // 变更的列宽
                
                // 校正变更的列宽
                // roughWidth可能存在小数点
                if ( leave > 0 ) {
                    offsetWidth = Math.ceil( roughWidth );
                } else {
                    offsetWidth = Math.floor( roughWidth );
                }
                offsetWidth = (Math.abs( offsetWidth ) < Math.abs( leave ) ? offsetWidth : leave);

                // 校正变更后的列宽
                // 不允许小于最小宽度
                alterWidth -= offsetWidth;
                leave -= offsetWidth;
                minWidth = me._minColsWidth[ alter ];
                if ( alterWidth < minWidth ) {
                    revise += minWidth - alterWidth;
                    alterWidth = minWidth;
                }
                
                colsWidth[ alter ] = alterWidth;
            }

            // 校正拖拽列的宽度
            // 当影响的列如果宽度小于最小宽度，会自动设置成最小宽度
            // 相应地，拖拽列的宽度也会相应减小
            currentWidth -= revise;

            colsWidth[ index ] = currentWidth;

            // 重新绘制每一列
            me._resetColumns();
            
            // 清除拖拽向全局绑定的事件
            document.onmousemove = null;
            document.onmouseup = null;
            
            me._isDraging = false;
            me._hideDragMark();
            
            baidu.event.preventDefault( e );
            return false;
        };
    },
    
    /**
     * 绘制表格主体
     * 
     * @private
     */
    _renderBody: function () {
        var me      = this,
            type    = 'body',
            id      = me.__getId( type ),
            list    = baidu.g( id ),
            style;
            
        if ( !list ) {
            list = document.createElement( 'div' );
            list.id = id;
            list.className = me.__getClass( type );
            
            // 如果设置了表格体高度
            // 表格需要出现横向滚动条
            if ( me.bodyHeight ) {
                style = list.style;
                style.height = me.bodyHeight + 'px';
                style.overflowX = 'hidden';
                style.overflowY = 'auto';
            }
            me.main.appendChild( list );
        }

        list.style.width = me._width + 'px';
        list.innerHTML   = me._getBodyHtml();
    },
    
    /**
     * 获取表格主体的html
     * 
     * @private
     * @return {string}
     */
    _getBodyHtml: function () {
        var data    = this.datasource || [],
            dataLen = data.length,
            html    = [],
            i, j, item, field;
        
        if ( !dataLen ) {
            return this.noDataHtml;
        }
        
        for ( i = 0; i < dataLen; i++ ) {
            item = data[ i ];
            html[ i ] = this._getRowHtml( item, i );
        }
        
        return html.join( '' );
    },
    
    _tplRowPrefix: '<div id="{0}" class="{1}" onmouseover="{2}" onmouseout="{3}" onclick="{4}">',
    
    /**
     * 获取表格体的单元格id
     * 
     * @private
     * @param {number} rowIndex 当前行序号
     * @param {number} fieldIndex 当前字段序号
     * @return {string}
     */
    _getBodyCellId: function ( rowIndex, fieldIndex ) {
        return this.__getId( 'cell' ) + rowIndex + "_" + fieldIndex;
    },
    
    /**
     * 获取表格行的html
     * 
     * @private
     * @param {Object} data 当前行的数据
     * @param {number} index 当前行的序号
     * @return {string}
     */
    _getRowHtml: function ( data, index ) {
        var me = this,
            html = [],
            tdCellClass     = me.__getClass( 'cell' ),
            tdBreakClass    = me.__getClass( 'cell-break' ),
            tdTextClass     = me.__getClass( 'cell-text' ),
            fields          = me._fields,
            fieldLen        = fields.length,
            cellClass,
            colWidth,
            content,
            tdClass,
            textClass,
            alignClass,
            sortClass,
            subrow = me.subrow && me.subrow != 'false',
            subentry,
            subentryHtml,
            contentHtml,
            editable,
            field,
            i;
            
        html.push(
            esui.util.format(
                me._tplRowPrefix,
                me.__getId( 'row' ) + index,
                me.__getClass( 'row' ) + ' ' 
                    + me.__getClass( 'row-' + ((index % 2) ? 'odd' : 'even') ),
                me.__getStrCall( '_rowOverHandler', index ),
                me.__getStrCall( '_rowOutHandler', index ),
                ( me.selectMode == 'line' ? me.__getStrCall( '_rowClickHandler', index ) : '' )
            ),
            esui.util.format( me._tplTablePrefix, '100%', me.id ) );//me._totalWidth - 2

        for ( i = 0; i < fieldLen; i++ ) {
            tdClass     = [ tdCellClass ];
            textClass   = [ tdTextClass ];
            field       = fields[ i ];
            content     = field.content;
            colWidth    = me._colsWidth[ i ];
            subentry    = subrow && field.subEntry;
            editable    = me.editable && field.editable && field.edittype;
            
            // 生成可换行列的样式
            if ( esui.Table.BREAK_LINE 
                 || me.breakLine 
                 || field.breakLine
            ) {
                tdClass.push( tdBreakClass );
            }
            
            // 表格可编辑的样式
            if ( editable ) {
                textClass.push( me.__getClass( 'cell-editable' ) );
            }

            // 生成选择列的样式
            if ( field.select ) {
                textClass.push( me.__getClass( 'cell-sel' ) );
            }
            
            // 计算表格对齐样式
            if ( field.align ) {
                tdClass.push( me.__getClass( 'cell-align-' + field.align ) );
            }
            
            // 计算表格排序样式
            sortClass = ''
            if ( field.field && field.field == me.orderBy ) {
                tdClass.push( me.__getClass( 'cell-sorted' ) );
            }


            // 构造内容html
            contentHtml = '<div class="' + textClass.join( ' ' ) + '">'
                            + ('function' == typeof content 
                                ? content.call( me, data, index, i ) 
                                : data[ content ])
                            + me._getEditEntryHtml( field, index, i )
                            + '</div>';

            subentryHtml = '&nbsp;';
            if ( subentry ) {
                if ( typeof field.isSubEntryShow != 'function'
                     || field.isSubEntryShow.call( me, data, index, i ) !== false
                ) {
                    subentryHtml = me._getSubEntryHtml( index );
                }
                
                tdClass.push( me.__getClass( 'subentryfield' ) );
                contentHtml = '<table width="100%" collpadding="0" collspacing="0">'
                                + '<tr><td width="' + me.subEntryWidth + '" align="right">' + subentryHtml
                                + '</td><td>' + contentHtml + '</td></tr></table>';
            }
            html.push('<td id="' + me._getBodyCellId( index, i ) + '"',
                    'class="' + tdClass.join( ' ' )  + '"',
                    ' style="width:' + ( colWidth + me.rowWidthOffset ) + 'px;',
                    ( colWidth ? '' : 'display:none' ),
                    '" controlTable="' + me.id,
                    '" row="' + index + '" col="' + i + '">',
                    contentHtml,
                    '</td>');
        }
        html.push( '</tr></table></div>' );
        
        // 子行html
        if ( subrow ) {
            html.push( me._getSubrowHtml( index ) );
        }
        
        return html.join( '' );
    },
    
    /**
     * 获取编辑入口元素的html
     *
     * @private
     * @param {Object} field 列配置信息
     * @param {number} rowIndex 行序号
     * @param {number} columnIndex 列序号
     * @return {string}
     */
    _getEditEntryHtml: function ( field, rowIndex, columnIndex ) {
        var edittype = field.edittype;
        if ( this.editable && field.editable && edittype ) {
            return '<div class="' + this.__getClass( 'cell-editentry' ) + '" onclick="' 
                        + this.__getStrCall( 'startEdit', edittype, rowIndex, columnIndex ) 
                        + '"></div>'
        }
        return '';
    },

    /**
     * 表格行鼠标移上的事件handler
     * 
     * @private
     * @param {number} index 表格行序号
     */
    _rowOverHandler: function ( index ) {
        if ( this._isDraging ) {
            return;
        }
        
        var row = this._getRow( index );
        if ( row ) {
            baidu.addClass( row, this.__getClass( 'row-hover' ) );
        }
    },
    
    /**
     * 表格行鼠标移出的事件handler
     * 
     * @private
     * @param {number} index 表格行序号
     */
    _rowOutHandler: function ( index ) {
        var row = this._getRow( index );
        if ( row ) {
            baidu.removeClass( row, this.__getClass( 'row-hover' ) );
        }
    },
    
    /**
     * 阻止行选，用于点击在行的其他元素，不希望被行选时。
     * 
     * @public
     */
    preventLineSelect: function () {
        this._dontSelectLine = 1;
    },
    
    /**
     * 表格行鼠标点击的事件handler
     * 
     * @private
     * @param {number} index 表格行序号
     */
    _rowClickHandler: function ( index ) {
        if ( this.selectMode == 'line' ) {
            if ( this._dontSelectLine ) {
                this._dontSelectLine = false;
                return;
            }
            
            var input;
            
            switch ( this.select ) {
            case 'multi':
                input = baidu.g( this.__getId( 'multiSelect' ) + index );
                // 如果点击的是checkbox，则不做checkbox反向处理
                if ( !esui.util.hasValue( this._preSelectIndex ) ) {
                    input.checked = !input.checked;
                }
                this._selectMulti( index );
                this._preSelectIndex = null;
                break;

            case 'single':
                input = baidu.g( this.__getId( 'singleSelect' ) + index );
                input.checked = true;
                this._selectSingle( index );
                break;
            }
        }
    },
    
    /**
     * subrow入口的html模板
     * 
     * @private
     */
    tplSubEntry: '<div class="{0}" onmouseover="{2}" onmouseout="{3}" onclick="{4}" id="{1}" title="{5}"></div>',
    
    /**
     * 获取子内容区域入口的html
     *
     * @private
     * @return {string}
     */
    _getSubEntryHtml: function( index ) {
        var me = this;
        return esui.util.format(
            me.tplSubEntry,
            me.__getClass( 'subentry' ),
            me._getSubentryId( index ),
            me.__getStrCall( '_entryOver', index ),
            me.__getStrCall( '_entryOut', index ),
            me.__getStrCall( 'fireSubrow', index ),
            me.subEntryOpenTip
        );
    },
    
    /**
     * 获取子内容区域的html
     *
     * @private
     * @return {string}
     */
    _getSubrowHtml: function ( index ) {
        return '<div id="' + this._getSubrowId( index )
                    + '" class="' + this.__getClass( 'subrow' ) + '"'
                    + ' style="display:none"></div>';
    },
    
    /**
     * 获取表格子行的元素
     *
     * @public
     * @param {number} index 行序号
     * @return {HTMLElement}
     */
    getSubrow: function ( index ) {
        return baidu.g( this._getSubrowId( index ) );    
    },
    
    /**
     * 获取表格子行的元素id
     *
     * @private
     * @param {number} index 行序号
     * @return {string}
     */
    _getSubrowId: function ( index ) {
        return this.__getId( 'subrow' ) + index;
    },
    
    /**
     * 获取表格子行入口元素的id
     *
     * @private
     * @param {number} index 行序号
     * @return {string}
     */
    _getSubentryId: function ( index ) {
        return this.__getId( 'subentry' ) + index;
    },
    
    /**
     * 处理子行入口元素鼠标移入的行为
     *
     * @private
     * @param {number} index 入口元素的序号
     */
    _entryOver: function ( index ) {
        var el          = baidu.g( this._getSubentryId( index ) ),
            opened      = /subentry-opened/.test( el.className ),
            classBase   = 'subentry-hover';
            
        if ( opened ) {
            classBase = 'subentry-opened-hover';
        }    
        
        baidu.addClass( el, this.__getClass( classBase ) );
    },
    
    /**
     * 处理子行入口元素鼠标移出的行为
     *
     * @private
     * @param {number} index 入口元素的序号
     */
    _entryOut: function ( index ) {
        var id = this._getSubentryId( index );
        baidu.removeClass( id, this.__getClass( 'subentry-hover' ) );
        baidu.removeClass( id, this.__getClass( 'subentry-opened-hover') );
    },
    
    /**
     * 触发subrow的打开|关闭
     *
     * @public
     * @param {number} index 入口元素的序号
     */
    fireSubrow: function ( index ) {
        var me              = this,
            entryId         = me._getSubentryId( index ),
            datasource      = me.datasource,
            dataLen         = (datasource instanceof Array && datasource.length),
            dataItem;
        
        if ( !dataLen || index >= dataLen ) {
            return;
        }
        
        if ( !baidu.g( entryId ).getAttribute( 'data-subrowopened' ) ) {
            dataItem = datasource[ index ];
            if ( me.onsubrowopen( index, dataItem ) !== false ) {
                me.openSubrow( index );
            }
        } else {
            me._closeSubrow( index );
        }
        
        me._entryOver( index );
    },
    
    /**
     * 关闭子行
     *
     * @private
     * @param {number} index 子行的序号
     */
    _closeSubrow: function ( index ) {
        var me          = this,
            entry       = baidu.g( me._getSubentryId( index ) );
        
        if ( me.onsubrowclose( index, me.datasource[ index ] ) !== false ) {
            me._entryOut( index );
            me._subrowIndex = null;
            
            baidu.removeClass( entry, me.__getClass( 'subentry-opened' ) );
            baidu.removeClass( me._getRow( index ), me.__getClass( 'row-unfolded') );
            
            entry.setAttribute( 'title', me.subEntryOpenTip );
            entry.setAttribute( 'data-subrowopened', '' );
            
            baidu.hide( me._getSubrowId( index ) );
            return true;
        }
        
        return false;
    },
    
    onsubrowopen: new Function(),
    onsubrowclose: new Function(),
    
    /**
     * 打开子行
     *
     * @private
     * @param {number} index 子行的序号
     */
    openSubrow: function ( index ) {
        var me           = this,
            currentIndex = me._subrowIndex,
            entry        = baidu.g( me._getSubentryId( index ) ),
            closeSuccess = 1;
        
        if ( esui.util.hasValue( currentIndex ) ) {
            closeSuccess = me._closeSubrow( currentIndex );
        }
        
        if ( !closeSuccess ) {
            return;
        }

        baidu.addClass( entry, me.__getClass( 'subentry-opened' ) );
        baidu.addClass( me._getRow( index ), me.__getClass( 'row-unfolded' ) );
        entry.setAttribute( 'title', me.subEntryCloseTip );
        entry.setAttribute( 'data-subrowopened', '1' );
        
        baidu.show( me._getSubrowId( index ) );
        
        me.subrowMutex && ( me._subrowIndex = index );
    },
    
    /**
     * 初始化resize的event handler
     * 
     * @private
     */
    _initResizeHandler: function () {
        var me        = this;
        me.viewWidth  = baidu.page.getViewWidth();
        me.viewHeight = baidu.page.getViewHeight();
        
        me._resizeHandler = function () {
            var viewWidth  = baidu.page.getViewWidth(),
                viewHeight = baidu.page.getViewHeight();
                
            if ( viewWidth == me.viewWidth
                 && viewHeight == me.viewHeight
            ) {
                return;
            }
            
            me.viewWidth = viewWidth;
            me.viewHeight = viewHeight;
            me._handleResize();
        };

        // 在dispose的时候会释放的哈
        baidu.on( window, 'resize', me._resizeHandler );
    },
    
    /**
     * 浏览器resize的处理
     *
     * @private
     */
    _handleResize: function () {
        var me      = this,
            head    = me.getHead(),
            foot    = me.getFoot(),
            walker,
            widthStr,
            i;

        me._width = me._getWidth();
        widthStr = me._width + 'px';
        
        // 设置主区域宽度
        me.main.style.width = widthStr;
        me.getBody().style.width = widthStr;
        head && (head.style.width = widthStr);
        foot && (foot.style.width = widthStr);
        
        // 重新绘制每一列  
        me._initColsWidth();
        me._resetColumns();    
        if ( me.followHead ) {
            walker  = me.main.parentNode.firstChild;
            i       = 0;
            while ( walker ) {
                if ( walker.nodeType == 1
                     && walker.getAttribute( 'followThead' )
                ) {
                    walker.style.width = me._width - me._followWidthArr[ i++ ] + 'px';
                }

                walker = walker.nextSibling;
            }
        }    

        me._topReseter && me._topReseter();
    },
    
    /**
     * 纵向锁定初始化
     *
     * @private
     */
    _initTopResetHandler : function() {
        if ( !this.followHead ) {
            return;
        }

        var me = this,
            walker           = me.main.parentNode.firstChild,
            domHead          = me.getHead(),
            followWidths     = me._followWidthArr,
            placeHolderId    = me.__getId( 'TopPlaceholder' ),
            domPlaceholder   = document.createElement( 'div' ),
            i, len, fWidth, temp;
        
        // 占位元素
        // 否则元素浮动后原位置空了将导致页面高度减少，影响滚动条  
        domPlaceholder.id = placeHolderId;
        domPlaceholder.style.width = '100%';
        domPlaceholder.style.display = 'none';

        baidu.dom.insertBefore( domPlaceholder, me.main );
        domPlaceholder = null;
        
        // 写入表头跟随元素的宽度样式
        for ( i = 0, len = me._followDoms.length; i < len; i++ ) {
            me._followDoms[ i ].style.width = me._width - followWidths[ i ] + 'px';
        }
        domHead && ( domHead.style.width = me._width + 'px' );
                
        me._topReseter = function () {
            var scrollTop   = baidu.page.getScrollTop(), 
                fhArr       = me._followHeightArr,
                fhLen       = fhArr.length, 
                posStyle    = '',
                followDoms  = me._followDoms,
                len         = followDoms.length,
                placeHolder = baidu.g( placeHolderId ),
                i = 0, 
                posTop;
            
            function setPos( dom, pos, top ) {
                if ( dom ) {
                    dom.style.top = top + 'px';
                    dom.style.position = pos;
                }
            }

            // 2x2的判断，真恶心
            if ( baidu.ie && baidu.ie < 7 ) {
                if ( scrollTop > me._followTop ) {
                    posStyle = 'absolute';
                    placeHolder.style.height = fhArr[ fhLen - 1 ] + domHead.offsetHeight + 'px';
                    placeHolder.style.display = '';
                    for ( ; i < len; i++ ) {
                        setPos( followDoms[ i ], posStyle, fhArr[ i ] + scrollTop );
                    }

                    setPos( domHead, posStyle, fhArr[ fhLen - 1 ] + scrollTop );
                } else {
                    placeHolder.style.height  = 0;
                    placeHolder.style.display = 'none';
                    posStyle = '';
                    
                    for ( ; i < len; i++ ) {
                        setPos( followDoms[i], posStyle, 0 );
                    }

                    setPos( domHead, posStyle, 0 );
                }
            } else {
                if ( scrollTop > me._followTop ) {
                    placeHolder.style.height = fhArr[ fhLen - 1 ] + domHead.offsetHeight + 'px';
                    placeHolder.style.display = '';
                    posStyle = 'fixed';
                        
                    for ( ; i < len; i++ ) {
                        setPos( followDoms[ i ], posStyle, fhArr[ i ] );
                    }

                    setPos( domHead, posStyle, fhArr[ fhLen - 1 ] );
                } else {
                    placeHolder.style.height  = 0;
                    placeHolder.style.display = 'none';
                    posStyle = '';
                    
                    for ( ; i < len; i++) {
                        setPos( followDoms[i], posStyle, 0 );
                    }

                    setPos( domHead, posStyle, 0 );
                }
            }
            
        };
        baidu.on( window, 'scroll', me._topReseter );    
    },
    
    /**
     * 重新设置表格每个单元格的宽度
     * 
     * @private
     */
    _resetColumns: function () {
        var me          = this,
            datasource  = me.datasource || [],
            colsWidth   = me._colsWidth,
            foot        = me.foot,
            id          = me.id,
            len         = foot instanceof Array && foot.length,
            dLen        = datasource.length,
            tds         = me.getBody().getElementsByTagName( 'td' ),
            tables      = me.main.getElementsByTagName( 'table' ),
            tdsLen      = tds.length,
            index       = 0,
            td,
            width, 
            i, 
            j,
            colIndex,
            item,
            colspan;
        
        // 重新设置表格尾的每列宽度
        if ( len ) {
            colIndex = 0;
            for ( i = 0; i < len; i++ ) {
                item    = foot[ i ];
                width   = colsWidth[ colIndex ];
                colspan = item.colspan || 1;

                for ( j = 1; j < colspan; j++ ) {
                    width += colsWidth[ colIndex + j ];
                }
                colIndex += colspan;

                td = baidu.g( me._getFootCellId( i ) );
                width = Math.max( width + me.rowWidthOffset, 0 );
                
                td.style.width      = width + 'px';
                td.style.display    = width ? '' : 'none';
            }
        }

        // 重新设置表格头的每列宽度
        len = colsWidth.length;
        if ( !me.noHead ) {
            for ( i = 0; i < len; i++ ) {
                width = Math.max( colsWidth[ i ] + me.rowWidthOffset, 0 );

                td = baidu.g( me._getTitleCellId( i ) );
                td.style.width      = width + 'px';
                td.style.display    = width ? '' : 'none';
            }
        }

        // 重新设置表格体的每列宽度
        j = 0;
        for ( i = 0; i < tdsLen; i++ ) {
            td = tds[ i ];
            if ( td.getAttribute( 'controlTable' ) == id ) {
                width = Math.max( colsWidth[ j % len ] + me.rowWidthOffset, 0 );
                td.style.width = width + 'px';
                td.style.display = width ? '' : 'none';
                j++;
            }
        }
    },
    
    /**
     * 第一列的多选框
     * 
     * @private
     */
    FIELD_MULTI_SELECT: {
        width       : 30,
        stable      : true,
        select      : true,
        title       : function () {
            return '<input type="checkbox" id="' 
                    + this.__getId( 'selectAll' ) 
                    + '" onclick="' 
                    + this.__getStrCall( '_toggleSelectAll' ) 
                    + '">';
        },
        
        content: function ( item, index ) {
            return '<input type="checkbox" id="' 
                    + this.__getId( 'multiSelect' ) + index
                    + '" onclick="' + this.__getStrCall( '_rowCheckboxClick', index ) + '">';
        }
    },
    
    /**
     * 第一列的单选框
     * 
     * @private
     */
    FIELD_SINGLE_SELECT: {
        width   : 30,
        stable  : true,
        title   : '&nbsp;',
        select  : true,
        content : function ( item, index ) {
            var id = this.__getId( 'singleSelect' );

            return '<input type="radio" id="' 
                    + id + index
                    + '" name=' + id + ' onclick="' 
                    + this.__getStrCall( '_selectSingle', index ) 
                    + '">';
        }
    },
    
    /**
     * 行的checkbox点击处理函数
     * 
     * @private
     */
    _rowCheckboxClick: function ( index ) {
        if ( this.selectMode != 'line' ) {
            this._selectMulti( index );
        } else {
            this._preSelectIndex = index;
        }
    },
    
    /**
     * 根据checkbox是否全部选中，更新头部以及body的checkbox状态
     * 
     * @private
     * @param {number} index 需要更新的body中checkbox行，不传则更新全部
     */
    _selectMulti: function ( index ) {
        var me = this,
            inputs          = me.getBody().getElementsByTagName( 'input' ),
            i               = 0,
            currentIndex    = 0,
            allChecked      = true,
            len             = inputs.length,
            selectAll       = me._getHeadCheckbox(),
            selected        = [],
            selectedClass   = me.__getClass( 'row-selected' ),
            cbIdPrefix      = me.__getId( 'multiSelect' ),
            updateAll       = !esui.util.hasValue( index ),
            input, inputId, row;
           
        for ( ; i < len; i++ ) {
            input   = inputs[ i ];
            inputId = input.id;

            if ( input.getAttribute( 'type' ) == 'checkbox' 
                 && inputId 
                 && inputId.indexOf( cbIdPrefix ) >= 0
            ) {
                // row = me.getRow(currentIndex); // faster
                if ( updateAll ) {
                    row = input.parentNode;
                    while ( 1 ) {
                        if ( row.tagName == 'DIV' // faster
                             && /^ui-table-row/.test( row.className )
                        ) {
                            break;
                        }
                        row = row.parentNode;
                    }
                }

                if ( !input.checked ) {
                    allChecked = false;
                    // faster
                    updateAll && baidu.removeClass( row, selectedClass ); 
                } else {
                    selected.push( currentIndex );
                    // faster
                    updateAll && baidu.addClass( row, selectedClass );
                }
                currentIndex++;
            }
        }
        

        this.onselect( selected );
        if ( !updateAll ) {
            row = me._getRow( index );
            input = baidu.g( cbIdPrefix + index );
            if ( input.checked ) {
                baidu.addClass( row, selectedClass );
            } else {
                baidu.removeClass( row, selectedClass );
            }
        }

        selectAll.checked = allChecked;
    },
    
    /**
     * 全选/不选 所有的checkbox表单
     * 
     * @private
     */
    _toggleSelectAll: function () {
        this._selectAll( this._getHeadCheckbox().checked );
    },
    
    /**
     * 更新所有checkbox的选择状态
     * 
     * @private
     * @param {boolean} checked 是否选中
     */
    _selectAll: function ( checked ) {
        var inputs          = this.getBody().getElementsByTagName( 'input' ),
            len             = inputs.length,
            i               = 0,
            index           = 0,
            selected        = [],
            selectedClass   = this.__getClass( 'row-selected' ),
            cbIdPrefix      = this.__getId( 'multiSelect' ),
            input, inputId;
            
        for ( ; i < len; i++ ) {
            input = inputs[ i ];
            inputId = input.id;

            if ( input.getAttribute( 'type' ) == 'checkbox' 
                 && inputId 
                 && inputId.indexOf( cbIdPrefix ) >= 0
            ) {
                inputs[ i ].checked = checked;
                
                if ( checked ) {
                    selected.push( index );
                    baidu.addClass( this._getRow( index ), selectedClass );
                } else {
                    baidu.removeClass( this._getRow( index ), selectedClass );
                }
                
                index ++;
            }
        }
        
        this.onselect( selected );
    },
    
    /**
     * 单选选取
     * 
     * @private
     * @param {number} index 选取的序号
     */
    _selectSingle: function ( index ) {
        var selectedClass = this.__getClass( 'row-selected' ),
            selectedIndex = this._selectedIndex;
        
        if (this.onselect(index)) {
            if ( 'number' == typeof selectedIndex ) {
                baidu.removeClass( this._getRow( selectedIndex ), selectedClass );
            }
            
            this._selectedIndex = index;
            baidu.addClass( this._getRow( index ), selectedClass );
        }
    },
    
    /**
     * 重置表头样式
     * 
     * @private
     */
    resetHeadStyle: function () {
        var ths = this.getHead().getElementsByTagName( 'th' ),
            len = ths.length,
            th;
            
        while ( len-- ) {
            th = ths[ len ];
            baidu.removeClass( th.firstChild, this.__getClass( 'thcell_sort' ) );
        }    
    },
    
    /**
     * 更新视图
     *
     * @public
     */
    refreshView: function () {
        this._caching();
        this._handleResize();
    },
    
    onedit: new Function(),

    /**
     * 启动编辑功能
     * 
     * @public
     * @param {string}      type        编辑器类型
     * @param {number}      rowIndex    行序号
     * @param {number}      columnIndex 列序号
     */
    startEdit: function ( type, rowIndex, columnIndex ) {
        if ( this.editable ) {
            var entrance    = baidu.g( this._getBodyCellId( rowIndex, columnIndex ) );
            var tlOffset    = -5;
            var pos         = baidu.dom.getPosition( entrance );
            var field       = this._fields[ columnIndex ];
            
            this._currentEditor = esui.Table.EditorManager.startEdit( this, type, {
                left        : pos.left + tlOffset,
                top         : pos.top + tlOffset,
                rowIndex    : rowIndex,
                columnIndex : columnIndex,
                field       : field,
                value       : this.datasource[ rowIndex ][ field.field ]
            } );
        }
    },
    
    /**
     * 停止编辑功能
     * 
     * @public
     */
    stopEdit: function () {
        if ( this._currentEditor ) {
            this._currentEditor.stop();
            this._currentEditor = null;
        }
    },

    /**
     * 设置单元格的文字
     *
     * @public
     * @param {string} text 要设置的文字
     * @param {string} rowIndex 行序号
     * @param {string} columnIndex 列序号
     * @param {boolean} opt_isEncodeHtml 是否需要进行html转义
     */
    setCellText: function ( text, rowIndex, columnIndex, opt_isEncodeHtml ) {
        if ( opt_isEncodeHtml ) {
            text = baidu.encodeHTML( text );
        }

        text += this._getEditEntryHtml( this._fields[ columnIndex ], rowIndex, columnIndex );
        baidu.g( this._getBodyCellId( rowIndex, columnIndex ) ).firstChild.innerHTML = text;
    },

    /**
     * 释放控件
     * 
     * @private
     */
    __dispose: function () {
        var head = baidu.g( this.__getId('head') ),
            mark = baidu.g( this.__getId('dragMark') );

        if ( head ) {
            head.onmousemove = null;
            head.onmousedown = null;
        }
        
        // 释放表头跟随的元素引用
        this._followDoms = null;
        
        // 停止编辑功能
        this.stopEdit();

        // 移除拖拽基准线
        if ( mark ) {
            document.body.removeChild( mark );
        }

        esui.Control.prototype.__dispose.call( this );
        
        // remove resize事件listener
        if ( this._resizeHandler ) {
            baidu.un( window, 'resize', this._resizeHandler );
            this._resizeHandler = null;
        }

        // remove scroll事件listener
        if ( this._topReseter ) {
            baidu.un( window, 'scroll', this._topReseter );
            this._topReseter = null;
        }
    }
};

baidu.inherits( esui.Table, esui.Control );

/**
 * 表格内容编辑功能的管理器
 *
 * @class
 */
esui.Table.EditorManager = function () {
    var editorMap = {};
    var currentEditor;

    return {
        /**
         * 添加编辑器
         *
         * @public
         * @param {string} type 编辑器类型
         * @param {Object} editor 编辑器对象
         */
        add: function (type, editor) {
            editorMap[type] = editor;
        },
        
        /**
         * 移除编辑器
         *
         * @public
         * @param {string} type 编辑器类型
         */
        remove: function (type) {
            delete editorMap[type];
        },
        
        /**
         * 启动编辑功能
         *
         * @public
         * @param {Object} control 控件对象
         * @param {string} type 编辑器类型
         * @param {Object} options 启动参数表
         */
        startEdit: function (control, type, options) {
            var editor = editorMap[type];
            if (editor) {
                editor.start(control, options);
            }

            return editor;
        }
    };
}();

/**
 * 表格内容编辑器
 *
 * @public
 * @class
 */
esui.Table.Editor = function (options) {
    this.type = 'null';

    for ( var key in options ) {
        this[key] = options[key];
    }

    this.okId = '_ctrlTableEditorOk' + this.type;
    this.cancelId = '_ctrlTableEditorCancel' + this.type;
    this.errorId = '_ctrlTableEditorError' + this.type;
};

esui.Table.Editor.OK_TEXT     = '确定';
esui.Table.Editor.CANCEL_TEXT = '取消';
esui.Table.Editor.prototype   = {
    _idPrefix: '__table_editor__',
    
    /**
     * 浮层内容的模板
     *
     * @public
     */
    tpl: '<div ui="id:{0};type:Button;skin:em">{2}</div><div ui="id:{1};type:Button;">{3}</div>',
    
    /**
     * 初始化表格内容编辑器
     *
     * @public
     */
    init: function () {
        if ( !this._isInit ) {
            var layer = esui.util.create( 'Layer', {
                id: this._idPrefix + this.type,
                retype: 'table-editor ui-table-editor-' + this.type
            } );
            layer.appendTo();
            this.layer = layer;
            
            this.initLayer();
            this._isInit = 1;
        }
    },
    
    /**
     * 初始化编辑器浮层
     *
     * @public
     */
    initLayer: function () {
        this.fillLayer();
        var controlMap = this.initLayerControl();
        this.initButton( controlMap );
    },
    
    /**
     * 初始化浮层的控件
     *
     * @public
     * @return {Object} 初始化的控件集合
     */
    initLayerControl: function () {
        return esui.util.init( this.layer.main );
    },
    
    /**
     * 填充浮层的内容
     *
     * @public
     * @param {Array} extraArgs 浮层模板附加参数
     */
    fillLayer: function ( extraArgs ) {
        extraArgs = extraArgs || [];

        var layerMain = this.layer.main;
        var tpl = this.tpl;

        extraArgs.unshift(
            tpl, 
            this.okId,
            this.cancelId, 
            esui.Table.Editor.OK_TEXT, 
            esui.Table.Editor.CANCEL_TEXT,
            this.errorId );

        layerMain.innerHTML = esui.util.format.apply( window, extraArgs );
    },
    
    /**
     * 初始化浮层的确定和取消按钮行为
     *
     * @public
     * @param {Object} controlMap 初始化的控件集合
     */
    initButton: function ( controlMap ) {
        var okButton = controlMap[ this.okId ];
        var cancelButton = controlMap[ this.cancelId ];

        okButton.onclick = this.getOkHandler();
        cancelButton.onclick = this.getCancelHandler();

        this.okButton = okButton;
        this.cancelButton = cancelButton;

        this.setButtonDisabled( 1 );
    },
    
    /**
     * 设置按钮的disabled状态
     *
     * @public
     * @param {boolean} disabled 按钮的disabled状态
     */
    setButtonDisabled: function ( disabled ) {
        this.okButton.setDisabled( disabled );
        this.cancelButton.setDisabled( disabled );
    },

    /**
     * 获取当前编辑器所编辑的值
     *
     * @public
     * @return {Any} 
     */
    getValue: function () { return null; },
    
    /**
     * 获取确定按钮的点击行为handler
     *
     * @private
     * @return {Function} 
     */
    getOkHandler: function () {
        var me = this;
        return function () {
            me.doOk();
        };
    },

    doOk: function () {
        if ( this.currentTable.onedit(
                this.getValue(), 
                this.currentOptions, 
                this ) !== false 
        ) {
            this.stop();
        }
    },
    
    /**
     * 获取取消按钮的点击行为handler
     *
     * @private
     * @return {Function} 
     */
    getCancelHandler: function () {
        var me = this;
        return function () {
            me.stop();
        };
    },
    
    /**
     * 停止编辑功能
     *
     * @public
     */
    stop: function () {
        this.layer.hide();
        this.setButtonDisabled( 1 );
    },
    
    /**
     * 启动编辑功能
     *
     * @public
     * @param {Object} table 表格控件实例
     * @param {Object} options 启动参数表
     */
    start: function ( table, options ) {
        this.init();
        this.currentTable   = table;
        this.currentOptions = options;
        
        var left = options.left || 0;
        var top  = options.top || 0;
        
        this.unsetError();
        this.setButtonDisabled( 0 );
        this.layer.show( left, top );
        this.setValue && this.setValue( options.value, options );
    },
    
    /**
     * 暂停编辑功能
     *
     * @public
     */
    wait: function () {
        this.setButtonDisabled( 1 );
    },
    
    /**
     * 重启编辑功能
     *
     * @public
     */
    restart: function () {
        this.setButtonDisabled( 0 );
    },

    setError: function ( error ) {
        var errorEl = baidu.g( this.errorId );
        errorEl.innerHTML = error;
        baidu.show( errorEl );
    },

    unsetError: function () {
        baidu.hide( this.errorId );
    }
};

// 初始化内建表格编辑部件 - string类型
esui.Table.EditorManager.add( 'string', 
    new esui.Table.Editor( {
        /**
         * 编辑器类型
         *
         * @public
         */
        type:'string',

        /**
         * 编辑器层内容模板
         *
         * @public
         */
        tpl: '<input type="text" ui="type:TextInput;id:{5}" />'
            + '<div ui="id:{0};type:Button;skin:em">{2}</div>'
            + '<div ui="id:{1};type:Button;">{3}</div>'
            + '<div id="{4}" class="ui-table-editor-error"></div>',
        inputId: '_ctrlTableEditorStringInput',

        /**
         * 初始化编辑器浮层
         *
         * @public
         */
        initLayer: function () {
            this.fillLayer( [ this.inputId ] );
            var controlMap = this.initLayerControl();
            this.inputCtrl = controlMap[ this.inputId ];
            this.inputCtrl.onenter = this.getOkHandler();
            this.initButton( controlMap );
        },
        
        /**
         * 设置当前编辑器的值
         *
         * @public
         * @param {string} value 值内容
         */
        setValue: function ( value ) {
            this.inputCtrl.setValue( value );
        },
        
        /**
         * 获取当前编辑器所编辑的值
         *
         * @public
         * @return {string}
         */
        getValue: function () {
            return this.inputCtrl.getValue();
        }
    }));

// 初始化内建表格编辑部件 - int类型
esui.Table.EditorManager.add( 'int', 
    new esui.Table.Editor( {
        /**
         * 编辑器类型
         *
         * @public
         */
        type:'int',

        /**
         * 编辑器层内容模板
         *
         * @public
         */
        tpl: '<input type="text" ui="type:TextInput;id:{5}" />'
            + '<div ui="id:{0};type:Button;skin:em">{2}</div>'
            + '<div ui="id:{1};type:Button;">{3}</div>'
            + '<div id="{4}" class="ui-table-editor-error"></div>',
        inputId: '_ctrlTableEditorIntInput',

        /**
         * 初始化编辑器浮层
         *
         * @public
         */
        initLayer: function () {
            this.fillLayer( [ this.inputId ] );
            var controlMap = this.initLayerControl();
            this.inputCtrl = controlMap[ this.inputId ];
            this.inputCtrl.onenter = this.getOkHandler();
            this.initButton( controlMap );
        },
        
        /**
         * 设置当前编辑器的值
         *
         * @public
         * @param {string} value 值内容
         */
        setValue: function ( value ) {
            this.inputCtrl.setValue( value );
        },
        
        /**
         * 获取当前编辑器所编辑的值
         *
         * @public
         * @return {string}
         */
        getValue: function () {
            return parseInt( this.inputCtrl.getValue(), 10 );
        },

        getOkHandler: function () {
            var me = this;

            return function () {
                var value = me.inputCtrl.getValue();
                if ( !/^\d+$/.test( value ) ) {
                    me.setError('请输入正确的整数，谢谢。');
                    return;
                }

                me.doOk();
            };
        }
    }));
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/TextLine.js
 * desc:    带行号的文本输入框控件
 * author:  zhouyu, erik
 */

///import esui.InputControl;
///import esui.TextInput;
///import baidu.lang.inherits;
///import baidu.string.trim;

/**
 * 带行号的文本输入框控件
 * 
 * @param {Object} options 参数
 */
esui.TextLine = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'textline';
   
    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;
    
    esui.InputControl.call( this, options );

    this.number = 1;
    
    this._numberId      = this.__getId( 'number' );
    this._textId        = this.__getId( 'text' );
    this._numberInnId   = this._numberId + 'Word';

    this.__initOption( 'height', null, 'HEIGHT' );
};

esui.TextLine.HEIGHT = 200;

esui.TextLine.prototype = {
    /**
     * 渲染控件
     *
     * @public
     */
    render: function () {
        var me = this;

        if ( !me._isRendered ) {
            esui.InputControl.prototype.render.call( me );
            
            me._renderMain();
            me._refreshLine();
            me._bindEvent();
            me._isRendered = 1;
        }
        
        // 绘制宽高
        me.setWidth( me.width );
        me.setHeight( me.height );

        // 写入value
        me.setValue( me.value );
    },
    
    /**
     * 显示行号区域
     *
     * @public
     */
    showNumber: function () {
        this._numberHidden = false;
        baidu.show( this._numberEl );

        this._resetLineWidth();
        this._resetScroll();
    },
    /**
     * 隐藏行号区域
     *
     * @public
     */
    hideNumber: function () {
        this._numberHidden = true;
        baidu.hide( this._numberEl );
        
        this._resetLineWidth();
    },

    /**
     * 设置控件的高度
     *
     * @public
     * @param {number} height 高度
     */
    setHeight: function ( height ) {
        this.height = height;
        
        if ( height ) {
            this._numberEl.style.height = this.main.style.height = height + 'px';
            this._controlMap.text.setHeight( height );
        }
    },

    /**
     * 设置控件的宽度
     *
     * @public
     * @param {number} width 宽度
     */
    setWidth: function ( width ) {
        this.width = width;
        
        if ( width ) {
            this.main.style.width = width + 'px';
            this._resetLineWidth();
        }
    },
    
    /**
     * 绑定事件
     *
     * @private
     */
    _bindEvent: function(){
        var me = this;

        var text = me._getTextCtrl();
        me._lineRefresher   = me._getLineRefresher();
        me._scrollRefresher = me._getScrollReseter();

        text.onchange           = me._lineRefresher;
        text.main.onscroll      = me._scrollRefresher;
        me._numberEl.onscroll   = me._getScrollLineReseter();
    },
    
    /**
     * 获取number行滚动条位置的重置器
     *
     * @private
     * @return {Function}
     */
    _getScrollLineReseter: function () {
        var me = this;
        return function () {
            me._resetScrollByLine();
        };
    },

    /**
     * 获取滚动条位置的重置器
     *
     * @private
     * @return {Function}
     */
    _getScrollReseter: function () {
        var me = this;
        return function () {
            me._resetScroll();
        };
    },
    
    /**
     * 获取行刷新的handler
     *
     * @private
     * @return {Function}
     */
    _getLineRefresher: function () {
        var me = this;

        return function () {
            var textEl = me._getTextEl();
            me._refreshLine();

            (typeof me.onchange == 'function') && me.onchange();
        };
    },
    
    _tpl: '<div id="{0}" class="{2}"><pre style="margin:0;border:0;padding:0;">1</pre></div>'
            + '<span id="{3}" class="{4}" style="left:-10000px;position:absolute;">1</span>'
            + '<textarea ui="type:TextInput;id:{1}"></textarea>',
    

    /**
     * 绘制主区域
     *
     * @private
     */
    _renderMain: function(){
        var me              = this;
        var main            = me.main;
        var numberId        = me._numberId;
        var textId          = me._textId;
        var numberInnId     = me._numberInnId;

        var propMap = {};
        var textCtrl;

        propMap[ textId ] = {
            width   : me.width,
            height  : me.height,
            value   : me.value
        };

        main.innerHTML = esui.util.format(
            me._tpl, 
            numberId, 
            textId,
            me.__getClass( 'number' ),
            numberInnId,
            me.__getClass( 'numberinner' )
        );
        me._controlMap.text = textCtrl = esui.util.init( main, propMap )[ textId ];

        // 移除text控件的hover状态自动触发
        textCtrl.main.onmouseover = null;
        textCtrl.main.onmouseout = null;

        me._numberEl = baidu.g( numberId );
        me._numberEl.style.height = me.height + "px";

        me._numberInnEl = baidu.g( numberInnId );
    },
    
    /**
     * 重置行号，增加内容和keyup时可调用
     *
     * @private
     */
    _refreshLine: function () {
        var me      = this;
        var html    = [];
        var num     = me._getTextCtrl()
                        .getValue()
                        .split( "\n" )
                        .length;
        var i;

        if ( num != me.number ) {
            me.number = num;
            for ( i = 1; i < num + 1; i++ ) {
                html.push( i );
            }

            me._numberInnEl.innerHTML = num + 1;
            
            // chrome下节点太多性能会慢：“1<br>2”是3个节点
            // IE下设置pre的innerHTML中，\n不会换行，很奇怪
            if ( baidu.ie ) {
                me._numberEl.innerHTML = html.join( "<br>" );
            } else {
                me._numberEl.firstChild.innerHTML = html.join( "\n" );
            }
            
            me._resetLineWidth();
        }

        me._resetScroll();
    },
    
    /**
     * 重置行号区域的宽度
     *
     * @private
     */
    _resetLineWidth: function () {
        var width       = Math.max( this._numberInnEl.offsetWidth, 14 );
        var left        = width + 12;
        var textWidth   = this.width - left;
    
        this._numberEl.style.width = width + 18 + 'px';

        if ( this._numberHidden ) {
            left        = 0;
            textWidth   = this.width;
        }

        this._getTextEl().style.left = left + 'px';
        this._getTextCtrl().setWidth( textWidth );
    },

    /**
     * 获取输入框元素
     *
     * @private
     * @return {HTMLElement}
     */
    _getTextEl: function () {
        return this._getTextCtrl().main;
    },

    /**
     * 获取输入框控件
     *
     * @private
     * @return {esui.TextInput}
     */
    _getTextCtrl: function () {
        return this._controlMap.text;
    },

    /**
     * 滚动文本输入框
     */
    _resetScroll: function () {
        var me = this;
        me._numberEl.scrollTop = me._getTextEl().scrollTop;
    },
    
    /**
     * 滚动数字区域
     */
    _resetScrollByLine: function () {
        var me = this;
        me._getTextEl().scrollTop = me._numberEl.scrollTop;
    },
    
    /**
     * 增加内容
     *
     * @public
     * @param {Array} lines
     */
    addLines: function ( lines ) {
        var me      = this;
        var text    = me._controlMap.text;
        var content = lines.join( '\n' );
        var value   = me.getValue();

        if ( value.lenght > 0 ) {
            content = value + '\n' + content;
        }

        text.setValue( content );
    },
    
    /**
     * 设置内容字符串形式
     *
     * @public
     * @param {string} value
     */
    setValue: function ( value ) {
        var text = this._getTextCtrl();
        text.setValue( value );

        this._refreshLine();
    },
    
    /**
     * 获取内容字符串形式
     *
     * @public
     * @return {string}
     */
    getValue: function() {
        var text = this._getTextCtrl();
        return baidu.trim( text.getValue().replace( /\r/g, '' ) );
    },
     
    /**
     * 获取内容数组形式,去重并去除空串内容
     *
     * @public
     * @return {Array}
     */
    getValueAsArray: function () {
        var items       = this.getValue().split( '\n' );
        var len         = items.length;
        var container   = {};
        var result      = [];
        var i;
        var value;
        

        for ( i = 0; i < len; i++ ) {
            value = baidu.trim( items[ i ] );
            if ( value.length === 0 || container[ value ] ) {
                continue;
            }
            container[ value ] = 1;
            result.push( value );
        }

        return result;
    },
    
    /**
     * 释放
     * 
     * @private
     */
    __dispose: function () {
        this._numberInnerEl = null;
        if ( this._numberId ) {
            this._numberId.onscroll = null;
            this._numberId = null;
        }

        var text = this._getTextCtrl();
        text && ( text.main.onscroll = null );

        esui.InputControl.prototype.__dispose.call( this );
    }
}

baidu.inherits( esui.TextLine, esui.InputControl );
/*
 * esui (ECOM Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/Tip.js
 * desc:    提示控件
 * author:  linzhifeng, erik
 */

///import esui.Control;
///import esui.Layer;
///import esui.Button;
///import baidu.lang.inherits;
///import baidu.event.on;
///import baidu.event.un;
///import baidu.dom.getPosition;

/**
 * 提示控件
 */
esui.Tip = function () {
    var LAYER_ID = '__TipLayer',
        TITLE_ID = '__TipLayerTitle',
        CLOSE_ID = '__TipLayerClose',
        ARROW_ID = '__TipLayerArrow',
        BODY_ID  = '__TipLayerBody',
        
        TITLE_CLASS = 'ui-tip-title',
        BODY_CLASS  = 'ui-tip-body',
        ARROW_CLASS = 'ui-tip-arrow',
        
        _layer,
        _isShow,
        _hideTimeout,
        _isInit;

    /**
     * 隐藏提示区
     *
     * @inner
     */
    function _hide() {
        _layer.hide();
        _isShow = false;
        
        var layerMain = _layer.main;
        layerMain.onmouseover = null;
        layerMain.onmouseout  = null;
    }
    
    /**
     * 阻止提示区隐藏
     *
     * @inner
     */
    function _preventHide() {
        if ( _hideTimeout ) {
            clearTimeout( _hideTimeout );
            _hideTimeout = null;
        }
    }
    
    /**
     * 声明Tip的Class
     *
     * @class
     * @public
     */
    function Control( options ) {
        // 类型声明，用于生成控件子dom的id和class
        this._type = 'tip-entrance';
        
        // 标识鼠标事件触发自动状态转换
        this._autoState = 0;
        
        esui.Control.call( this, options );
        
        // 提示层的行为模式，over|click|auto
        this.mode = this.mode || 'over';

        if ( this.hideDelay ) {
            this.hideDelay = parseInt( this.hideDelay, 10 );
        }
        if ( this.disabled ) {
            this.addState( 'disabled', 1 );
        }
    }
    
    Control.prototype = {
        /**
         * 渲染控件
         *
         * @public
         */
        render: function () {
            var me = this;
            var mode = me.mode;
            var main = me.main;
            var showFunc = me._getDoShow();

            if ( !me._isRendered ) {
                esui.Control.prototype.render.call( me );
                
                switch ( mode )
                {
                case 'over':
                case 'click':
                    if ( mode == 'over' ) {
                        main.onmouseover = showFunc;
                    } else {
                        main.onclick = showFunc;
                        main.style.cursor = 'pointer';
                    }
                    main.onmouseout = me._getOutHandler();
                    break;
                case 'auto':
                    showFunc();
                    break;
                }
                
                me._isRendered = 1;
            }
        },
        
        /**
         * 获取显示提示区域的handler
         *
         * @private
         */
        _getDoShow: function () {
            var me = this;

            return function () {
                // 判断tip的可用性
                if ( me.isDisabled() ) {
                    return;
                }
                
                // 构造提示的title和content
                var title   = me.title;
                var content = me.content;
                if ( typeof title == 'function' ) {
                    title = title.call( me );
                }
                if ( typeof content == 'function' ) {
                    content = content.call( me );
                }
                
                // 显示tip
                _show( me.main, {
                    title       : title,
                    content     : content,
                    arrow       : me.arrow,
                    hideDelay   : me.hideDelay,
                    mode        : me.mode
                } );
            };
        },
        
        /**
         * 获取鼠标移出的handler
         *
         * @private
         */
        _getOutHandler: function () {
            var me = this;

            return function () {
                Control.hide( me.hideDelay );
            };
        }
    };
    
    // 从控件基类派生
    baidu.inherits( Control, esui.Control );
    
    /**
     * 显示提示
     *
     * @inner
     * @param {HTMLElement} entrance 入口元素
     * @param {Object}      tipInfo 提示信息
     */
    function _show( entrance, tipInfo ) {
        if ( !tipInfo || !entrance ) {
            return;
        }

        !_isInit && Control._init();
        
        // 阻止浮动层的隐藏
        if ( _isShow ) {
            _preventHide();
        }
        
        // 填入标题与内容
        baidu.g( BODY_ID ).innerHTML = tipInfo.content;
        var title = tipInfo.title;
        if ( title ) {
            baidu.g( TITLE_ID ).innerHTML = title;
            baidu.show( TITLE_ID );
        } else {
            baidu.hide( TITLE_ID );
        }
        
        // 预初始化各种变量
        var arrow       = tipInfo.arrow, // 1|tr|rt|rb|br|bl|lb|lt|tl
            closeBtn    = tipInfo.closeButton,
            pos         = baidu.dom.getPosition( entrance ),
            mainLeft    = pos.left,
            mainTop     = pos.top,
            mainWidth   = entrance.offsetWidth,
            mainHeight  = entrance.offsetHeight,
            viewWidth   = baidu.page.getViewWidth(),
            viewHeight  = baidu.page.getViewHeight(),
            scrollLeft  = baidu.page.getScrollLeft(),
            scrollTop   = baidu.page.getScrollTop(),
            layerMain   = _layer.main,
            closeMain   = esui.util.get( CLOSE_ID ).main,
            layerWidth  = layerMain.offsetWidth,
            layerHeight = layerMain.offsetHeight,
            offsetX     = 5,
            offsetY     = 0,
            temp        = 0,
            arrowClass  = ARROW_CLASS,
            layerLeft,
            layerTop,
            tLeft,
            tRight,
            tTop,
            tBottom,
            lLeft,
            lRight,
            lTop,
            lBottom;
        
        if ( !esui.util.hasValue( arrow ) ) {
            arrow = Control.ARROW;
        }

        if ( !esui.util.hasValue( closeBtn ) ) {
            closeBtn = Control.CLOSE_BUTTON;
        }

        closeMain.style.display = closeBtn ? '' : 'none';

        if ( arrow ) {
            temp    = 1;
            arrow   = String( arrow ).toLowerCase();
            offsetX = 20;
            offsetY = 14;
            tLeft   = mainLeft + mainWidth - offsetX;
            tRight  = mainLeft + offsetX - layerWidth;
            tTop    = mainTop + mainHeight + offsetY;
            tBottom = mainTop - offsetY - layerHeight;
            lLeft   = mainLeft + mainWidth + offsetX;
            lTop    = mainTop + mainHeight - offsetY;
            lBottom = mainTop + offsetY - layerHeight;
            lRight  = mainLeft - offsetX - layerWidth;

            // 计算手工设置arrow时的位置
            switch ( arrow ) {
            case 'tr':
                layerLeft = tRight;
                layerTop = tTop;
                break;
            case 'tl':
                layerLeft = tLeft;
                layerTop = tTop;
                break;
            case 'bl':
                layerLeft = tLeft;
                layerTop = tBottom;
                break;
            case 'br':
                layerLeft = tRight;
                layerTop = tBottom;
                break;
            case 'lt':
                layerLeft = lLeft;
                layerTop = lTop;
                break;
            case 'lb':
                layerLeft = lLeft;
                layerTop = lBottom;
                break;
            case 'rb':
                layerLeft = lRight;
                layerTop = lBottom;
                break;
            case 'rt':
                layerLeft = lRight;
                layerTop = lTop;
                break;
            default:
                temp = 0;
                offsetX = - offsetX;
                break;
            }
        } 
        
        // 计算自适应的位置
        if ( !temp ) {
            layerTop = mainTop + mainHeight + offsetY;
            arrow && ( arrow = 't' );
            if ( layerTop + layerHeight > viewHeight + scrollTop ) {
                if ( ( temp = mainTop - offsetY - layerHeight ) > 0 ) {
                    layerTop = temp;
                    arrow && ( arrow = 'b' );
                }
            }

            layerLeft = mainLeft + mainWidth + offsetX;
            arrow && ( arrow += 'l' );
            if ( layerLeft + layerWidth > viewWidth + scrollLeft ) {
                if ( ( temp = mainLeft - offsetX - layerWidth ) > 0 ) {
                    layerLeft = temp;
                    arrow && ( arrow = arrow.substr( 0, 1 ) + 'r' );
                }
            }
        }
    
        arrow && ( arrowClass += ' ' + ARROW_CLASS + '-' + arrow );
        baidu.g( ARROW_ID ).className = arrowClass;
        
        // 绑定浮出层行为
        if ( tipInfo.mode != 'auto' ) {
            layerMain.onmouseover = _preventHide;
            layerMain.onmouseout = _getHider( tipInfo.hideDelay );
        }

        // 显示提示层
        _isShow = true;
        _layer.show( layerLeft, layerTop );
    };
    
    /**
     * 隐藏提示
     *
     * @static
     * @public
     * @param {number} delay 延迟隐藏时间
     */
    Control.hide = function ( delay ) {
        delay = delay || Control.HIDE_DELAY;
        _hideTimeout = setTimeout( _hide, delay );
    };
    
    Control.HIDE_DELAY = 300;
    
    /**
     * 显示提示
     *
     * @static
     * @public
     * @param {HTMLElement} entrance 入口元素
     * @param {Object}      tipInfo 提示信息
     */
    Control.show = _show;

    /**
     * 获取隐藏提示的函数
     *
     * @inner
     * @param {number} delay 延迟隐藏时间
     */
    function _getHider( delay ) {
        return function () {
            Control.hide( delay );
        };
    }
    
    /**
     * 初始化提示层
     *
     * @static
     * @private
     */
    Control._init = function () {
        if ( _isInit ) {
            return;
        }

        _isInit = 1;
        _layer = esui.util.create( 'Layer', {
                id      : LAYER_ID,
                retype  : 'tip',
                width   : 300
            } );
        _layer.appendTo();

        var layerMain = _layer.main,
            title = document.createElement( 'h3' ),
            body  = document.createElement( 'div' ),
            arrow = document.createElement( 'div' ),
            close = esui.util.create( 'Button', {
                id      : CLOSE_ID,
                skin    : 'layerclose'
            } );

        // 初始化提示标题
        title.id        = TITLE_ID;
        title.className = TITLE_CLASS;
        layerMain.appendChild( title );
        
        // 初始化提示体
        body.id         = BODY_ID;
        body.className  = BODY_CLASS;
        layerMain.appendChild( body );
        
        // 初始化箭头
        arrow.id = ARROW_ID;
        arrow.className = ARROW_CLASS;
        layerMain.appendChild(arrow);
        
        // 初始化关闭按钮
        close.appendTo( layerMain );
        close.onclick = _hide;
    };

    Control.ARROW = 0;
    Control.CLOSE_BUTTON = 0;
    return Control;
}();

baidu.on( window, 'load', esui.Tip._init );
/*
 * ESUI (Enterprise Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    esui/TreeView.js
 * desc:    树结构显示控件
 * author:  chenjincai, linzhifeng, erik
 */


///import esui.Control;
///import baidu.lang.inherits;

/**
 * 树状控件
 * 
 * @param {Object} options 控件初始化参数
 */
esui.TreeView = function ( options ) {
    // 类型声明，用于生成控件子dom的id和class
    this._type = 'treeview';

    // 标识鼠标事件触发自动状态转换
    this._autoState = 0;

    esui.Control.call( this, options );

    // 是否点击展开的参数初始化
    this.__initOption('clickExpand', null, 'CLICK_EXPAND');
    
    // 是否选中展开的参数初始化
    this.__initOption('expandSelected', null, 'EXPAND_SELECTED');
   
    // 是否收起状态参数初始化
    this.__initOption('collapsed', null, 'COLLAPSED');
    
    // id与节点数据的内部表
    this._dataMap = {};
};

esui.TreeView.COLLAPSED = 0;

// 配置点击是否展开
esui.TreeView.CLICK_EXPAND = 1;

// 配置是否展开选中的节点
esui.TreeView.EXPAND_SELECTED = 0;

esui.TreeView.prototype = {
    /**
     * 渲染控件
     *
     * @protected
     */ 
    render: function () {
        var me = this;
        
        if ( !me._isRendered ) {
            esui.Control.prototype.render.call( me );
            me.width && (me.main.style.width = me.width + 'px');
            me._isRendered = 1;
        }

        me.main.innerHTML = me._getMainHtml();
    },
    
    /**
     * 获取主区域的html
     *
     * @private
     * @return {string}
     */
    _getMainHtml: function () {
        return this._getNodeHtml( this.datasource, !!this.collapsed, 0 );
    },
    
    /**
     * 获取子节点的html
     *
     * @private
     * @param {Array}   children 子列表数据
     * @param {boolean} hideChildren 是否隐藏子列表
     * @param {number}  level 当前节点层级
     * @return {string}
     */
    _getChildsHtml: function ( children, hideChildren, level ) {
        var me = this,
            htmlArr = [],
            i,
            len;

        for ( i = 0, len = children.length; i < len; i++ ) {
            htmlArr.push(
                '<li>' 
                + me._getNodeHtml( children[i], hideChildren, level + 1 ) 
                + '</li>' );
        }

        return htmlArr.join( '' );
    },

    /**
     * 节点的html模板
     * 
     * @private
     */
    _tplNode: '<div type="{0}" value="{4}" id="{2}" class="{1}" isExpanded="{8}" '
                + 'level="{9}" onclick="{10}" onmouseover="{11}" onmouseout="{12}">'
                    + '<div class="{5}" onclick="{13}">&nbsp;</div>'
                    + '<div class="{6}">&nbsp;</div>'
                    + '<div class="{7}">{3}'
                + '</div></div>',
    
    /**
     * 获取节点的html
     *
     * @private
     * @param {Object}  dataItem 数据项
     * @param {boolean} hideChildren 是否隐藏子列表
     * @param {number}  level 节点层级
     * @return {string}
     */
    _getNodeHtml: function ( dataItem, hideChildren, level ) {
        var levelNum = level;
        level = this._getLevelTag( level );

        var me = this,
            type            = dataItem.type,
            children        = me.getChildren( dataItem ),
            hasChildren     = children && children.length > 0,
            itemId          = me.getItemId( dataItem ),
            typeClass       = me.__getClass( 'node-type' ),
            iconClass       = me.__getClass( 'node-icon' ),
            clazz           = me._getNodeClass( 'node', level ),
            childClazz      = me._getNodeClass( 'children', level ),
            nodeId          = me.__getId( 'node' + itemId ),
            itemHTML        = me.getItemHtml( dataItem ),
            ref             = me.__getStrRef(),    
            childDisplay    = '',
            _hideChildren   = hideChildren,
            nodeType,
            html;
        
        
        this._dataMap[ itemId ] = dataItem;

        // 节点基础类型解析
        if ( hasChildren ) {
            nodeType = 'branch';
        } else {
            nodeType = 'leaf';
        }
        clazz += ' ' + me.__getClass( 'node-' + nodeType );
        if ( level == 'root' ) {
            _hideChildren = false;
        }
        
        // 节点用户定义类型解析
        if ( type ) {
            typeClass += ' ' + me.__getClass( 'node-type-' + type );
        }
        
        // 根据子节点数据判断当前节点和子节点的显示状态
        if ( _hideChildren ) {
            if ( hasChildren ) {
                childDisplay = ' style="display:none";';
            }
        } else {
            clazz += ' ' + me.__getClass( 'node-expanded' );
        }

        html = esui.util.format(
                me._tplNode,
                nodeType,
                clazz,
                nodeId,
                itemHTML,
                itemId,
                iconClass,
                typeClass,
                me.__getClass( 'node-text' ),
                _hideChildren ? '' : '1',
                levelNum,
                ref + '._nodeClickHandler(this)',
                ref + '._nodeOverHandler(this)',
                ref + '._nodeOutHandler(this)',
                ref + '._iconClickHandler(this)'
            );
        
        // 构造子节点的html
        if ( hasChildren ) {
            html += esui.util.format(
                '<ul id="{2}" value="{4}" class="{3}"{1}>{0}</ul>',
                me.getChildrenHtml( children, hideChildren, levelNum ),
                childDisplay,
                me.__getId( 'children' + itemId ),
                childClazz,
                itemId
            );
        }

        return html;
    },
    
    /**
     * 获取节点的样式class
     *
     * @private
     * @param {string}  part 节点的部分，node|children
     * @param {number}  level 节点层级
     * @return {string}
     */
    _getNodeClass: function( part, level ) {
        return this.__getClass( part ) + ' ' 
               + this.__getClass( part + '-' + level );
    },
    
    /**
     * 获取节点层级的文本标识
     *
     * @private
     * @param {number} level 节点层级
     * @return {string}
     */
    _getLevelTag: function ( level ) {
        if ( level === 0 ) {
            level = 'root';
        } else {
            level = "level" + level;
        }

        return level;
    },

    /**
     * 节点mouseover的handler
     *
     * @private
     */
    _nodeOverHandler: function ( node ) {
        if ( this.isDisabled() ) {
            return;
        }

        baidu.addClass( node, this.__getClass( 'node-hover' ) );
    },
    
    /**
     * 节点mouseout的handler
     *
     * @private
     */
    _nodeOutHandler: function ( node ) {
        if ( this.isDisabled() ) {
            return;
        }

        baidu.removeClass( node, this.__getClass( 'node-hover' ) );
    },
    
    /**
     * 展开图标点击的handler
     *
     * @private
     */
    _iconClickHandler: function ( iconElement ) {
        if ( this.isDisabled() ) {
            return;
        }

        var node = iconElement.parentNode;
        this._toggle( node );
        this._isPreventClick = 1;
    },
    
    /**
     * 节点点击的handler
     *
     * @private
     */
    _nodeClickHandler: function ( node ) {
        if ( this.isDisabled() ) {
            return;
        }

        var value = node.getAttribute( 'value' ),
            item  = this._dataMap[ value ];
        
        if ( !this._isPreventClick 
             && this.onchange( value, item ) !== false
         ) {
            this.select( value );
            if ( this.expandSelected ) {
                !node.getAttribute( 'isExpanded' ) && this._expand( node );
            } else if ( this.clickExpand ) {
                this._toggle( node );
            }
        }

        this._isPreventClick = 0;
    },
    
    onchange: new Function(),
    
    /**
     * 选中节点
     * 
     * @public
     * @param {string} id 节点id
     */
    select: function ( id ) {
        if ( this._selected == id ) {
            return;
        }
        
        var selectedClass = this.__getClass( 'node-selected' ),
            selectedNode = baidu.g( this.__getId( 'node' + this._selected ) );
        
        // 移除现有选中节点的样式
        selectedNode && baidu.removeClass( selectedNode, selectedClass );

        // 选择节点
        this._selected = id;
        baidu.addClass( this.__getId( 'node' + id ), selectedClass );
    },

    /**
     * 折叠展开操作
     * 
     * @private
     * @param {HTMLElement} node
     */
    _toggle: function ( node ) {
        if ( node.getAttribute( 'isExpanded' ) ) {
            this._collapse( node );
        } else {
            this._expand( node );
        }
    },
    
    /**
     * 折叠操作
     * 
     * @private
     * @param {HTMLElement} node
     */
    _collapse: function ( node ) {
        var value = node.getAttribute( 'value' );

        if ( this.oncollapse( value ) !== false ) {
            this.collapse( value );
        }
    },
    
    /**
     * 展开操作
     * 
     * @private
     * @param {HTMLElement} node
     */
    _expand: function ( node ) {
        var value = node.getAttribute( 'value' );

        if ( this.onexpand( value ) !== false ) {
            this.expand( value );
        }
    },

    oncollapse: new Function(),
    onexpand: new Function(),

    /**
     * 展开操作
     * 
     * @public
     * @param {string} id
     */
    expand: function ( id ) {
        var node        = baidu.g( this.__getId( 'node' + id ) );
        var childWrap   = baidu.g( this.__getId( 'children' + id ) );

        if ( node ) {
            node.setAttribute( 'isExpanded', '1' );
            childWrap && (childWrap.style.display = '');
            baidu.addClass( node, this.__getClass( 'node-expanded' ) );
        }
    },
    
    /**
     * 折叠操作
     *
     * @public
     * @param {string} id
     */
    collapse: function ( id ) {
        var node        = baidu.g( this.__getId( 'node' + id ) );
        var childWrap   = baidu.g( this.__getId( 'children' + id ) );
        
        if ( node ) {
            node.setAttribute( 'isExpanded', '' );
            childWrap && (childWrap.style.display = 'none');
            baidu.removeClass( node, this.__getClass( 'node-expanded' ) );
        }
    },
    
    /**
     * 重绘节点本身
     *
     * @public
     * @param {Object} dataItem
     */
    repaintNodeText: function( dataItem ) {
        var me          = this,
            itemId      = me.getItemId( dataItem ),
            itemHtml    = me.getItemHtml( dataItem ),
            nodeEl      = baidu.g( me.__getId( 'node' + itemId ) );
        
        if ( itemHtml ){
            nodeEl.lastChild.innerHTML = itemHtml;
        }
    },

    /**
     * 重绘节点及其子树
     *
     * @public
     * @param {Object} dataItem
     */    
    repaintNode: function ( dataItem ) {
        var me          = this,
            itemId      = me.getItemId( dataItem ),
            children    = me.getChildren( dataItem ),
            nodeEl      = baidu.g( me.__getId( 'node' + itemId ) ),
            childrenId  = me.__getId( 'children' + itemId ),
            childrenEl  = baidu.g( childrenId ),
            leafClass   = me.__getClass( 'node-leaf' ),
            branchClass = me.__getClass( 'node-branch' ),
            level       = parseInt( nodeEl.getAttribute( 'level' ), 10 );
        
        // 刷新节点文字
        this.repaintNodeText( dataItem );
        
        // 绘制子节点
        if ( children instanceof Array && children.length ) {
            // 创建子节点容器元素
            if ( !childrenEl ) {
                childrenEl = document.createElement( 'ul' );
                childrenEl.id = childrenId;
                childrenEl.style.display = nodeEl.getAttribute( 'isExpanded' ) ? '' : 'none';
                childrenEl.className = me._getNodeClass( 'children', this._getLevelTag( level ) );
                nodeEl.parentNode.insertBefore( childrenEl, nodeEl.nextSibling );
            }

            childrenEl.innerHTML = me.getChildrenHtml( children, 1, level );
            baidu.addClass( nodeEl, branchClass );
            baidu.removeClass( nodeEl, leafClass );
            nodeEl.setAttribute( 'type', 'branch' );
        } else {
            baidu.removeClass( nodeEl, branchClass );
            baidu.addClass( nodeEl, leafClass );
            nodeEl.setAttribute( 'type', 'leaf' );
        }
    },

    /**
     * 获取单条节点的子节点html
     *
     * @public
     * @return {Array}
     */
    getChildrenHtml: function ( children, hideChildren, level ) {
        return this._getChildsHtml( children, hideChildren, level );
    },

    /**
     * 获取单条节点的子节点数据
     *
     * @public
     * @param {Object} item 当前节点的数据项
     * @return {Array}
     */
    getChildren: function ( item ) {
        return item.children || [];
    },

    /**
     * 获取单条节点的html
     *
     * @public
     * @param {Object} item 当前节点的数据项
     * @return {Array}
     */
    getItemHtml: function ( item ) {
        return item.text;
    },
    
    /**
     * 获取单条节点的唯一id
     *
     * @public
     * @param {Object} item 当前节点的数据项
     * @return {string}
     */
    getItemId: function ( item ) {
        if ( esui.util.hasValue( item.id ) ) {
            return item.id;
        }

        return esui.util.getGUID();
    }
}

baidu.inherits( esui.TreeView, esui.Control );
