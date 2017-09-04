/**
 * Created by OJH on 2017/8/28.
 * 提供通用的界面操作功能
 *
 */

var util=(function () {
    const cacheData = {
        _cacheId:100,
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
        $maskContainer.css({zIndex:nextId});//累加到最大索引

        if(config.overlay){
            $maskContainer.addClass("overlay");
            var $maskOverlay = $("<div class='util-mask-overlay'></div>");
            $maskContainer.append($maskOverlay);
        }


        $maskContainer.append(config.content);

        $hostDom.append($maskContainer);

        var operation = {
            id:maskId,
            dom:$maskContainer,
            active:function(){
                this.dom.addClass("active");
                return this;
            },
            deactive:function(){
                this.dom.removeClass("active");
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
            hide:function(){
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
        var operation = createMask({
            content:$loading
        }, hostDom);

        cacheData.loadingSequence.push(operation.id);

        operation.open();
        operation.active();

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

        var $toast = $("<div class='util-mask-toast'></div>");
        $toast.addClass(config.type);
        $toast.html(config.content);

        $hostDom.append($toast);
        $toast.addClass("active");
        setTimeout(function(){
            $toast.removeClass("active").addClass("deactive");
            setTimeout(function(){
                $toast.remove();
            },200);
        }, config.delay);

        return $toast;
    }

    /**
     * 初始化可移动
     * @param target
     * @param triggerTarget
     */
    function initMoveAble(target, triggerTarget, restrictBound){
        var namespace = ".moveAble";
        var $triggerTarget = $(triggerTarget);


        var $win = $(window);

        $triggerTarget.off("mousedown" + namespace).on("mousedown" + namespace, target, function(evt){
            //全屏模式，禁止移动
            if($triggerTarget.hasClass("full-expand")){
                return false;
            }

            var targetOffset = $triggerTarget.offset();
            var relativePos = {
                x:evt.pageX - targetOffset.left,
                y:evt.pageY - targetOffset.top
            };
            var maxLeft = $win.width()  - $triggerTarget.innerWidth();
            var maxTop = $win.height() - $triggerTarget.innerHeight();

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

                $triggerTarget.css({
                    left:left,
                    top:top
                });

            });

        });

        $win.off("mouseup" + namespace).on("mouseup" + namespace, function(evt){
            $win.off("mousemove" + namespace);
        });


    }


    /**
     * 初始化全屏功能
     * @param target
     * @param triggerTarget
     */
    function initFullscreen(target, triggerTarget){
        var $triggerTarget = $(triggerTarget);

        $triggerTarget.on("click",  target, function(evt){
            var $this = $(this);
            if($triggerTarget.hasClass("full-expand")){
                $triggerTarget.removeClass("full-expand");
                $this.removeClass("active");
            }else{
                $triggerTarget.addClass("full-expand");
                $this.addClass("active");
            }

        });


    }


    /**
     * 缩小界面
     * @param target
     * @param triggerTarget
     */
    function initMinCollapse(target, triggerTarget){
        var $triggerTarget = $(triggerTarget);


        $triggerTarget.on("click", target, function(evt){
            //nothing
        });


    }

    /**
     * 居中位置
     * @param target
     */
    function centerPosition(target){
        var $target = $(target);

        var $offsetParent = $target.offsetParent();
        if($.inArray($offsetParent.prop("nodeName"), ["HTML", "BODY"]) != -1){
            $offsetParent = $(window);
        }

        var pWidth = $offsetParent.width();
        var pHeight = $offsetParent.height() + $offsetParent.scrollTop();

        var left = (pWidth - $target.width()) / 2;
        var top = (pHeight - $target.height()) / 2;
        if(top < 0){
            //防止超出界限
            top = 0;
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
            container:null,
            closeIdent:"popup-close",
            headerIdent:"popup-header",
            bodyIdent:"popup-body",
            footerIdent:"popup-footer",
            fullIdent:"popup-full",
            minIdent:"popup-min"
        };

        if(!$.isPlainObject(options)){
            var container = options;
            options = {
                container:container
            }
        }

        $.extend(config, options);

        if(config.container == null || config.container.length == 0){
            throw new Error("options container required");
        }


        var $container = $(config.container);
        $container.css({position:"absolute"});


        var operation = {
            originalOperation:{},
            dom:$container,
            open:function(){
                maskOperation.open();
                centerPosition($container);
            },
            hide:function(){
                maskOperation.hide();
            },
            close:function(){
                maskOperation.close();
            }
        };

        //可关闭
        $container.find("["+config.closeIdent+"]").click(function(evt){
            operation.close();
        });

        //可移动
        initMoveAble("["+config.headerIdent+"]", $container, true);

        //可全屏
        initFullscreen("["+config.fullIdent+"]", $container);

        //可缩小
        initMinCollapse("["+config.minIdent+"]", $container);

        var maskOperation = createMask({
            overlay:config.overlay,
            content:$container
        }, hostDom);


        cacheData.popupSequence.push(maskOperation.id);

        operation.originalOperation = maskOperation;


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
            canClose:true,
            canFullscreen:true
        };

        if(typeof options == "string"){
            var content = options;
            options = {
                content:content
            };

        }

        $.extend(config, options);


        //头部
        var $dialog = $("<div class='util-dialog'></div>");

        $dialog.css({
            width:config.width,
            height:config.height
        });

        var dialogOperation = {
            dom:$dialog,
            originalOperation:{},
            deactive:function(){
                this.originalOperation.deactive();
            },
            open:function(){
                this.originalOperation.open();
                centerPosition($dialog);
                this.originalOperation.active();
            },
            close:function(){
                this.originalOperation.close();

            }
        };


        if(config.title != null){
            var $header = $("<div class='util-dialog-header'></div>");

            $header.append(config.title);

            var $tool = $("<div class='util-dialog-tool'></div>");
            if(config.canFullscreen){
                var $fullscreen = $("<a href='javascript:;' class='util-dialog-fullscreen'></a>");

                initFullscreen($fullscreen, $dialog);


                $tool.append($fullscreen);
            }

            if(config.canClose){
                var $close = $("<a href='javascript:;' class='util-dialog-close'>&times;</a>");
                $close.on("click", function(evt){
                    var result = config.cancel && config.cancel.call(this, evt);
                    if(result !== false){
                        dialogOperation.close();
                    }
                });
                $tool.append($close);
            }


            $header.append($tool);
            initMoveAble($header, $dialog, true);
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

        var maskObj = createMask($dialog, hostDom);

        dialogOperation.originalOperation = maskObj;

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
    return util;
})()