/**
* Created by OJH on 2017/8/28.
* 提供通用的界面操作功能
*
*/

import './util.css';

const cacheData = {
    _cacheId:1000,
    loadingSequence:[],
    popupSequence:[],
    nextId:function(prefix){
        this._cacheId++;
        return $.trim(prefix) + this._cacheId;
    }
};

const maskCacheName = "cache-maskOp";

/**
 * 创建遮罩骨架
 * @param content
 * @param hostDom
 * @returns {{id: string, dom: (jQuery|HTMLElement), active: active, deactive: deactive, open: open, hide: hide}}
 */
function createMask(options, hostDom){
    var config = {
        overlay:true,
        content:""
    };

    if(!$.isPlainObject(options)){
        var content = options;
        options = {
            content:content
        }
    }

    $.extend(config, options);

    var $hostDom = $("body");
    if(hostDom != null){
        $hostDom = $(hostDom);
        $hostDom.addClass("util-mask");
    }

    var nextId = cacheData.nextId();
    var maskId = "mask_" + nextId;
    var $maskContainer = $("<div class='util-mask-container'></div>");
    $maskContainer.attr("id", maskId);

    if(config.overlay){
        $maskContainer.addClass("overlay");
        $maskContainer.css({zIndex:nextId});//累加到最大索引
        var $maskOverlay = $("<div class='util-mask-overlay'></div>");
        $maskContainer.append($maskOverlay);
    }

    var $maskContent = $("<div class='util-mask-content'></div>");
    $maskContent.html(config.content);
    $maskContainer.append($maskContent);
    $maskContent.css({zIndex:nextId});//累加到最大索引

    $hostDom.append($maskContainer);

    var operation = {
        id:maskId,
        dom:$maskContainer,
        content:$maskContent,
        active:function(){
            $maskContent.addClass("xmpp-util-active");
            return this;
        },
        deactive:function(callback){
            var isCall = false;
            $maskContent.removeClass("xmpp-util-active");
            callback && callback();

            return this;
        },
        open:function(){
            this.dom.show();
            return this;
        },
        close:function(){
            this.dom.hide();
            this.dom.remove();
            return this;
        },
        hide:function(callBack){
            this.dom.hide();

        }
    };

    $maskContainer.data(maskCacheName, operation);

    return operation;

}
/**
 * 显示加载提示
 * @param msg
 * @param hostDom
 * @returns {*}
 */
function showLoading(msg, hostDom){
    if(msg == null){
        msg = "正在加载...";
    }
    var $loading = $("<div class='util-mask-loading'></div>");
    var $msg = $("<div class='util-mask-loading-msg'></div>");
    $msg.html(msg);
    $loading.append($msg);
    var operation = popup({
        overlay:true,
        content:$loading
    }, hostDom);

    cacheData.loadingSequence.push(operation.getId());

    operation.open();

    return operation;

}


function hideLoading(){
    var id = cacheData.loadingSequence.pop();
    if(id != null){
        var operation = $("#" + id).data(maskCacheName);
        if(operation != null){
            operation.close();
        }
    }

    return id;
}

/**
 * 提示
 * @param msg
 * @param hostDom
 */
function toast(options, hostDom){
    //info warn error
    var config = {
        content:"",
        type:"info",
        delay:3000
    };

    if(!$.isPlainObject(options)){
        var content = options;
        options = {
            content:content
        }
    }

    $.extend(config, options);

    if(hostDom == null){
        hostDom = $("body");
    }

    var $hostDom = $(hostDom);

    var nextId = cacheData.nextId();
    var toastId = "toast_" + nextId;
    var $toast = $("<div class='util-mask-toast'></div>");
    $toast.attr("id",toastId);
    $toast.addClass(config.type);
    $toast.css({zIndex:nextId});
    $toast.html(config.content);

    $hostDom.append($toast);
    $toast.addClass("xmpp-util-active");
    setTimeout(function(){
        $toast.remove();
    }, config.delay);

    return $toast;
}
/**
 * 初始化可移动
 * @param target
 * @param triggerTarget
 */
function initMoveAble(target, container, restrictBound){
    var namespace = ".moveAble";
    var $container = $(container);


    var $win = $(window);

    var handler = function(evt){
        //全屏模式，禁止移动
        if($container.hasClass("full-expand")){
            return false;
        }

        var targetOffset = $container.offset();
        var relativePos = {
            x:evt.pageX - targetOffset.left,
            y:evt.pageY - targetOffset.top
        };
        var maxLeft = $win.width()  - $container.innerWidth();
        var maxTop = $win.height() - $container.innerHeight();

        $win.off("mousemove" + namespace).on("mousemove" + namespace, function(evt){
            var left = evt.clientX - relativePos.x;
            var top = evt.clientY - relativePos.y;
            if(restrictBound){
                if(left > maxLeft){
                    left = maxLeft;
                }
                if(left < 0){
                    left = 0;
                }


                if(top > maxTop){
                    top = maxTop;
                }
                if(top < 0){
                    top = 0;
                }

            }

            $container.css({
                left:left,
                top:top
            });

        });

    };


    if(typeof target == "string"){
        $container.off("mousedown" + namespace).on("mousedown" + namespace, target, handler );
    }else{
        var $target = $container.find(target);
        $target.off("mousedown" + namespace).on("mousedown" + namespace, handler );
    }




    $win.off("mouseup" + namespace).on("mouseup" + namespace, function(evt){
        $win.off("mousemove" + namespace);
    });


}



/**
 * 初始化弹框位置
 * @param target
 */
function initPosition(target, position){
    var $target = $(target);

    var posList = $.trim(position).split(/\s+/);

    var $offsetParent = $target.offsetParent();
    if($.inArray($offsetParent.prop("nodeName"), ["HTML", "BODY"]) != -1){
        $offsetParent = $(window);
    }

    var pWidth = $offsetParent.width();
    var pHeight = $offsetParent.height();
    var left = (pWidth - $target.width()) / 2;
    var top = (pHeight - $target.height()) / 2;;
    for(let i = 0 ; i < posList.length; i++){
        let pos = posList[i];
        switch(pos){
            case "left":
                left = 0;
                break;
            case "center":
                if(i == 0){
                    left = (pWidth - $target.width()) / 2;
                }else{
                    top = (pHeight - $target.height()) / 2;
                }
                break;
            case "right":
                left = pWidth - $target.width();
                break;
            case "top":
                top = 0;
                break;
            case "bottom":
                top = pHeight - $target.height();
                break;

        }

        if(top < 0){
            //防止超出界限
            top = 0;
        }

        if(left < 0){
            left = 0;
        }
    }


    $target.css({
        left:left,
        top:top
    });

}
/**
 * 弹出层
 * @param options
 * @param hostDom
 * @returns {{originalOperation: {id: string, dom: (jQuery|HTMLElement), active: active, deactive: deactive, open: open, hide: hide}, open: open, close: close}}
 */
function popup(options, hostDom){
    var config = {
        overlay:false,
        content:null,
        closeIdent:"popup-close",
        headerIdent:"popup-header",
        position:"center"
    };

    if(!$.isPlainObject(options)){
        var content = options;
        options = {
            content:content
        }
    }

    $.extend(config, options);

    if(config.content == null || config.content.length == 0){
        throw new Error("options content required");
    }


    var operation = {
        originalOperation:{},
        getId:function(){
            return this.originalOperation.id;
        },
        getContent:function(){
          return this.originalOperation.content;
        },
        open:function(){
            this.originalOperation.open();
            initPosition(this.originalOperation.content, config.position);
            this.originalOperation.active();
        },
        hide:function(){
            var _this = this;
            _this.originalOperation.deactive(function(){
                _this.originalOperation.hide();
            });


        },
        close:function(){
            var _this = this;
            _this.originalOperation.deactive(function(){
                _this.originalOperation.close();
            });

        }
    };


    var maskOperation = createMask({
        overlay:config.overlay,
        content:config.content
    }, hostDom);


    cacheData.popupSequence.push(maskOperation.id);

    operation.originalOperation = maskOperation;


    var $content  = maskOperation.content;
    //可关闭
    $content.find("["+config.closeIdent+"]").click(function(evt){
        operation.close();
    });

    //可移动
    initMoveAble("["+config.headerIdent+"]", $content, true);

    return operation;

}
/**
 * 关闭弹出层
 * @returns {*}
 */
function closePopup(){
    var id = cacheData.popupSequence.pop();
    if(id != null){
        var operation = $("#" + id).data(maskCacheName);
        if(operation != null){
            operation.close();
        }
    }

    return id;

}
/**
 * 对话框
 * 按钮定义格式：{text:xx, className:"xx",handler:fn}
 * @param options
 * @param hostDom
 * @returns {{dom: (jQuery|HTMLElement), originalOperation: {}, deactive: deactive, open: open, close: close}}
 */
function dialog(options, hostDom){
    var config = {
        title:"提示信息",
        content:"",
        buttons:[],
        okText:"确认",
        ok:null,
        cancelText:"取消",
        cancel:null,
        width:480,
        height:"auto",
        isOpen:true,
        canClose:true
    };

    if(typeof options == "string"){
        var content = options;
        options = {
            content:content
        };

    }

    $.extend(config, options);


    //头部
    var $dialog = $("<div class='util-dialog' ></div>");

    $dialog.css({
        width:config.width,
        height:config.height
    });

    var dialogOperation = {
        dom:$dialog,
        originalOperation:{},
        open:function(){
            this.originalOperation.open();
        },
        close:function(){
            this.originalOperation.close();

        }
    };


    if(config.title != null){
        var $header = $("<div class='util-dialog-header' popup-header ></div>");

        $header.append(config.title);

        var $tool = $("<div class='util-dialog-tool'></div>");
        if(config.canClose){
            var $close = $("<a href='javascript:;' class='util-dialog-close' popup-close >&times;</a>");
            $tool.append($close);
        }


        $header.append($tool);
        $dialog.append($header);


    }

    //内容
    var $content = $("<div class='util-dialog-content'></div>");

    $content.html(config.content);

    $dialog.append($content);

    //底部
    if(config.ok != null){
        config.buttons.push({text:config.okText, className:"ok",handler:config.ok});
    }
    if(config.cancel != null){
        config.buttons.push({text:config.cancelText, className:"",handler:config.cancel});
    }

    if(config.buttons.length > 0){
        var $footer = $("<div class='util-dialog-footer'></div>");
        $.each(config.buttons, function(index, obj){
            var $btn = $("<a href='javascript:;' class='util-dialog-btn'></a>");
            $btn.addClass(obj.className);
            $btn.html(obj.text);
            $btn.on("click", function(evt){
                var result = obj.handler.call(this, evt);
                if(result !== false){
                    dialogOperation.close();
                }
            });

            $footer.append($btn);
        });

        $dialog.append($footer);

    }

    var popupObj = popup({
        overlay:true,
        content:$dialog
    }, hostDom);

    dialogOperation.originalOperation = popupObj;

    if(config.isOpen){
        dialogOperation.open();
    }

    return dialogOperation;

}
/**
 * 提示信息
 * @param msg
 * @param callback
 */
function alert(msg, callback){

    util.dialog({
        content:msg,
        ok:function(){
            callback && callback.call(this);
        }
    });

}
/**
 * 转化表单数据为对象
 * @param form
 * @returns {{}}
 */


function formData(form){
    var $form = $(form);
    var data = {};
    $.each($form.serializeArray(), function(index, obj){
        data[obj.name ] = obj.value;
    });
    return data;
}
/**
 * 判断数据是否为空
 * @param str
 */
function isEmpty(str){
    if(str == null){
        return true;
    }
    if(typeof str == "string" && $.trim(str).length == 0){
        return true;
    }

    return $.isEmptyObject(str);
}
/**
 * 延迟对象封装,默认错误处理
 * @param promise
 */
function additionErrorHandler(promise, noMask){
    if(promise instanceof Promise){
        if(!noMask){
            util.showLoading();
        }

        promise.then(function(data){
            if(!noMask){
                util.hideLoading();
            }
        },function(error){
            util.showError(error);
            if(!noMask){
                util.hideLoading();
            }
        });

    }

    return promise;

}
/**
 * 显示错误信息
 * @param error
 */
function showError(error){
    var errorMsg = error;
    if(error instanceof Error){
        errorMsg = error.message;
    }

    util.toast({
        content:errorMsg,
        type:"error"
    });
}
//工具对象
var util = {
    showLoading:showLoading,
    hideLoading:hideLoading,
    toast:toast,
    popup:popup,
    closePopup:closePopup,
    dialog:dialog,
    alert:alert,
    initMoveAble:initMoveAble,
    formData:formData,
    isEmpty:isEmpty,
    showError:showError,
    additionErrorHandler:additionErrorHandler
};

export default  util;