/**
 * Created by OJH on 2017/8/28.
 * 提供通用的界面操作功能
 *
 */
import $ from 'jquery';
    const cacheData = {
        _cacheId:990,
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
            var maxLeft = $win.width()  - $triggerTarget.innerWidth() + $win.scrollLeft();
            var maxTop = $win.height() - $triggerTarget.innerHeight() + $win.scrollTop();

            $win.off("mousemove" + namespace).on("mousemove" + namespace, function(evt){
                var left = evt.pageX - relativePos.x;
                var top = evt.pageY - relativePos.y;
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
        var top = ((pHeight - $target.height()) / 2) + $offsetParent.scrollTop();
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

        var maskOperation = createMask({
            overlay:config.overlay,
            content:$container
        }, hostDom);


        cacheData.popupSequence.push(maskOperation.id);

        operation.originalOperation = maskOperation;


        return operation;

    }

    //工具对象
    var util = {
        popup:popup
    };
    export default util;