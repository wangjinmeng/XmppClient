/**
 * Created by Administrator on 2017/9/1.
 */

//表单输入值事件:inputKeyPress; 1:按键按下，2:发送
//查找聊天记录事件：queryHistory; jid:裸jid

var chatBox={
    $this:null,
    $chatBoxSlider:null,
    popups:null,
    multipleBoxCls:'chat-multiple-box',
    sliderHtmlStr:[
                '<li class="chat-box-slider-item cur js-chat-box-slider-item" data-href="{{jid_id}}" id="{{jid_id}}-nav">',
                '    <img class="tt" src="./img/tt.jpg">',
                '    <span class="name">{{name}}</span>',
                '    <span class="close js-close">&times;</span>',
                '</li>'
    ].join(''),
    nodeStr:[
            '<div class="box-wp" >',
            '    <div class="box-title fix" popup-header>',
            '        <div class="box-title-user-img fl user-img">',
            '            <img src="img/tt.jpg" />',
            '        </div>',
            '        <div class="box-title-user-info fl">',
            '            <span class="name js-name">{{name}}</span>',
            '            <span class="status js-status"></span>',
            '        </div>',
            '    </div>',
            '    <div class="box-chat">',
            '        <div class="box-chat-main">',
            '            <a class="js-query-history box-chat-query-history ">查看聊天记录</a>',
            '            <ul class="js-msg-box"></ul>',
            '        </div>',
            '        <div class="box-chat-footer pr fix">',
            '            <div class="box-chat-tool dn">',
            '           </div>',
            '            <textarea class="box-chat-textarea js-box-chat-textarea" title="发送信息...">发送信息...</textarea>',
            '            <div class="button button-main box-chat-bottom js-send-msg" >',
            '                发送',
            '            </div>',
            '        </div>',
            '    </div>',
            '    <div class="box-handle">',
            '        <a class="js-close-msg-box">&times;</a>',
            '    </div>',
            '</div>'
    ].join(""),
    sendMsgStr:['<li class="box-chat-mine fix">',
        '    <div class="box-chat-img user-img user-img-sm fr">',
        '        <img src="img/qq.jpg" alt=""/>',
        '    </div>',
        '    <div class="box-char-info">',
        '        <div class="desc">',
        '            <span class="name">{{name}}</span>',
        '            <span class="time">{{time}}</span>',
        '        </div>',
        '        <div class="msg pr">',
        '            {{msg}}',
        '            <span></span>',
        '        </div>',
        '    </div>',
        '</li>'].join(""),
    receiveMsgStr:[
        '<li class="fix">',
        '    <div class="box-chat-img user-img user-img-sm fl">',
        '        <img src="img/tt.jpg" alt=""/>',
        '    </div>',
        '    <div class="box-char-info">',
        '        <div class="desc">',
        '            <span class="name">{{name}}</span>',
        '            <span class="time">{{time}}</span>',
        '        </div>',
        '        <div class="msg pr">',
        '            {{msg}}',
        '            <span></span>',
        '        </div>',
        '    </div>',
        '</li>'].join(""),
    nodeMap:{},//存储已经生产的聊天节点
    receiveHistory:function(jid_id,data){
        $('#'+jid_id+'-item').find('.js-msg-box').html('');
        for(var i=0;i<data.length;i++){
            var _data=data[i];
            this.handleMsgDom(jid_id,_data.type,_data.msg,_data.time);
        }
    },
    handleMsgDom:function (jid_id,status,msg,time,name){
        var _name=status=='send'?'me':name;
        var _temp=status=='send'?this.sendMsgStr:this.receiveMsgStr;
        var $dom=$('#'+jid_id+'-item').find('.js-msg-box');
        var _data={
            msg: msg,
            time: time,
            name: _name
        };
        var _msgDom=_temp.replace(/\{\{(\S+)\}\}/g,function(match,key){
            if(_data[key]){
                return _data[key];
            }else{
                return '';
            }
        });
        $dom.append(_msgDom);
        var height=$dom.height();
        $dom.parent().scrollTop(height);
    },
    receiveMsg:function(jid_id,full_jid,name,time,msg,composing){
        name=name?name:full_jid;
        this.add(jid_id,full_jid,name);
        if(msg){
            this.handleMsgDom(jid_id,'receive',msg,time,name)
        }
        if(composing){
            $('#'+jid_id+'-item').find('.js-status').html('正在输入...')
        }else{
            $('#'+jid_id+'-item').find('.js-status').html('');
        }
    },
    subscribeEvent:function(event,fn){
        this.$this.on(event,fn);
    },
    initNode:function(jid_id,jid,name){
        var _this = this;
        var _node= $('<div class="box-box js-chat-box-item" composing="false" data-href="' + jid_id + '" id="' + jid_id + '-item" data-jid="'+jid+'">');
        _node.html(this.nodeStr);
        _node.find('.js-name').html(name);
        _node.find('.js-box-chat-textarea').on('focus', function () {
            var $this=$(this);
            var _val=$this.val();
            var _title=$this.attr('title');
            if(_val===_title){
                $this.val('');
            }
            return false;
        }).on('blur', function () {
            var $this=$(this);
            var _val=$this.val();
            var _title=$this.attr('title');
            if(_val===''){
                $this.val(_title);
            }
            return false;
        });
        _node.find('.js-close-msg-box').on('click', function () {});
        return _node
    },
    add:function(jid_id,jid,name){
        if($('#'+jid_id+'-item').length==0){
            var $chatBox=$('#js-chat-box');
            var $chatSliderBox=$('#js-chat-box-slider');
            // 处理导航
            var sliderHtmlStr=this.sliderHtmlStr
                .replace(/\{\{name\}\}/g,name)
                .replace(/\{\{jid_id\}\}/g,jid_id);
            $chatSliderBox.append(sliderHtmlStr);
            if(!this.nodeMap[jid_id]){
                this.nodeMap[jid_id]=this.initNode(jid_id,jid,name);
            }
            // $chatBox.find('.js-chat-box-item').addClass('hidden');
            $chatBox.append(this.nodeMap[jid_id]);
            if($chatBox.find('.js-chat-box-item').length>1){
                $chatBox.addClass(this.multipleBoxCls)
            }else{
                // $chatBox.removeClass('hidden');
                this.popups.open();
                $chatBox.removeClass(this.multipleBoxCls);
            }
        }
        this.select(jid_id);
    },
    select:function(jid_id){
        $('#'+jid_id+'-item').removeClass('hidden').siblings().addClass('hidden');
        $('#'+jid_id+'-nav').addClass('cur').siblings().removeClass('cur');
        $('#'+jid_id+'-item').find('.js-box-chat-textarea').focus();
    },
    remove:function(jid_id){
        if(!this.nodeMap[jid_id]) return;
        var _len=  this.$this.find('.js-chat-box-item').length-1;
        var _isCur=$('#'+jid_id+'-nav').hasClass('cur');
        $('#'+jid_id+'-item').detach();
        $('#'+jid_id+'-nav').remove();
        if(_len===0){
            this.popups.hide();
        }else {
            if(_len===1){
                this.$this.removeClass(this.multipleBoxCls);
            }
            if(_isCur){
                this.select(this.$this.find('.chat-box-slider-item').attr('data-href'));
            }
        }
    },
    init:function(){
        var node=$('' +
            '<div class="chat-box pr" id="js-chat-box">' +
                '<ul class="chat-box-slider" id="js-chat-box-slider"> </ul>' +
            '</div>');
        var _this=this;
        _this.popups = util.popup(node);
        _this.$this=node;
        _this.$chatBoxSlider=node.find('#js-chat-box-slider');
        _this.$this.on('click','.js-close-msg-box',function(){
            var _jid_id=$(this).parents('.js-chat-box-item').attr('data-href');
            _this.remove(_jid_id);
        });
        _this.$this.on('keypress','.js-box-chat-textarea',function(ev){
            var $parents=$(this).parents('.js-chat-box-item');
            var _jid=$parents.attr('data-jid');
            var composing=$parents.attr('composing');
            if(!composing||composing==='false'){
                _this.$this.trigger('inputKeyPress',{jid:_jid,eventVal:1});
                $parents.attr('composing',true);
            }
        });
        _this.$this.on('click','.js-send-msg',function(){
            var $parents=$(this).parents('.js-chat-box-item');
            var _jid=$parents.attr('data-jid');
            var _jid_id=$parents.attr('data-href');
            var _val=$parents.find('.js-box-chat-textarea').val();
            if(!$.trim(_val)) return;
            _this.handleMsgDom(_jid_id,'send',_val,tool.dealTime(new Date()));
            $parents.find('.js-box-chat-textarea').val('');
            $parents.attr('composing',false);
            _this.$this.trigger('inputKeyPress',{jid:_jid,val:_val,eventVal:2});
        });
        _this.$this.on('click','.js-query-history',function(){
            var _jid=$(this).parents('.js-chat-box-item').attr('data-jid');
            _this.$this.trigger('queryHistory',{jid:_jid});
            $(this).remove();
        });
        _this.$chatBoxSlider.on('click','.js-close',function(){
            var _jid_id=$(this).parent().attr('data-href');
            _this.remove(_jid_id);
            _this.$this.trigger('queryHistory',{jid:_jid_id});
        });
        _this.$chatBoxSlider.on('click','.js-chat-box-slider-item',function(){
            var _jid_id=$(this).attr('data-href');
            _this.select(_jid_id);
        });
    }
};
