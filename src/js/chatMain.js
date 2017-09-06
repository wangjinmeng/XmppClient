/**
 * Created by Administrator on 2017/9/4.
 */
import $ from 'jquery';
import {Strophe,$iq,$msg,$pres} from 'strophe.js';
import util from '../plugin/util/util';
import qq from '../img/qq.jpg';
import tt from '../img/tt.jpg';
import tool from './tool';
var $node=$([
    '<div id="main-panel" class="chat-main-box contact-main-box">',
    '        <div class=" xmpp-box-shadow contact-wp" id="js-xmpp-chat-panel">',
    '            <div class="contact-tt" popup-header>',
    '                <div class="contact-tt-name js-name">-_-</div>',
    '                <select name="" id="js-change-status" class="contact-tt-status ">',
    '                    <option value="online">在线</option>',
    '                    <option value="offline">离线</option>',
    '                    <option value="away">离开</option>',
    '                </select>',
    '                <div class="contact-tt-handle">',
    '                   <a class="xmpp-close-btn  js-xmpp-chat-panel-toggle-status">&times;</a>',
    '                </div>',
    '            </div>',
    '            <div class="contact-cont">',
    '                <div class="contact-list" id="js-contact-list"></div>',
    '                <div class="contact-handle">',
    '                    <a id="js-add-contact" class="cursor-pointer">+</a>',
    '                </div>',
    '            </div>',
    '        </div>',
    '</div>'].join(""));
var flagMap={
    init:false
};
var jqueryMap={};
//表单输入值事件:inputKeyPress; 1:按键按下，2:发送
//查找聊天记录事件：queryHistory; jid:裸jid
var chatBox={
    $this:null,
    $chatBoxSlider:null,
    popups:null,
    multipleBoxCls:'chat-multiple-box',
    sliderHtmlStr:[
        '<li class="chat-box-slider-item cur js-chat-box-slider-item" data-href="{{jid_id}}" id="{{jid_id}}-nav">',
        '    <img class="tt" src="'+tt+'">',
        '    <span class="name">{{name}}</span>',
        '    <span class="close js-close">&times;</span>',
        '</li>'
    ].join(''),
    nodeStr:[
        '<div class="box-wp" >',
        '    <div class="box-title fix" popup-header>',
        '        <div class="box-title-user-img fl user-img">',
        '            <img src="'+tt+'" />',
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
        '            <textarea class="box-chat-textarea js-box-chat-textarea" placeholder="发送信息..."></textarea>',
        '            <div class="xmpp-button xmpp-button-main box-chat-bottom js-send-msg" >',
        '                发送',
        '            </div>',
        '        </div>',
        '    </div>',
        '    <div class="box-handle">',
        '        <a class="js-close-msg-box xmpp-close-btn">&times;</a>',
        '    </div>',
        '</div>'
    ].join(""),
    sendMsgStr:['<li class="box-chat-mine fix">',
        '    <div class="box-chat-img user-img user-img-sm fr">',
        '        <img src="'+qq+'" alt=""/>',
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
        '        <img src="'+tt+'" alt=""/>',
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
        var _node= $('<div class="box-box js-chat-box-item" composing="false" data-href="' + jid_id + '" id="' + jid_id + '-item" data-jid="'+jid+'"></div>');
        _node.html(this.nodeStr);
        _node.find('.js-name').html(name);
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
            '<div class="chat-box pr chat-main-box xmpp-box-shadow" id="js-chat-box">' +
            '<ul class="chat-box-slider" id="js-chat-box-slider"> </ul>' +
            '</div>');
        var _this=this;
        _this.popups = util.popup(node);
        _this.popups.hide();
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
var Gab={
    connection:null,
    pending_subscriber:null,
    addContactPopups:null,
    approvePopups:null,
    contactList:[],
    domain:'openfire.zhongqi.com',
    BOSH_SERVICE:"http://192.168.3.28:7070/http-bind/",
    storeMsg:{
        maxLen:500,
        push:function(jid,data){
            var localData=this.get(jid);
            if(localData.constructor!=Array){
                localData=[]
            }
            if(localData.length>this.maxLen){
                localData.splice(0,1)
            }
            localData.push(data);
            var myJid=Strophe.getBareJidFromJid(Gab.connection.jid);
            var keyName=myJid+'&'+jid;
            window.localStorage[keyName]=JSON.stringify(localData);
        },
        get:function(jid){
            var myJid=Strophe.getBareJidFromJid(Gab.connection.jid);
            var keyName=myJid+'&'+jid;
            var msg=window.localStorage[keyName];
            if(!msg){
                return [];
            }
            return JSON.parse(msg);
        }
    },
    addContactDom:function(jid,sub){
        var name=Strophe.getNodeFromJid(jid);
        var jid_id=Gab.jid_to_id(jid);
        if(sub=='none'){
            name+=' <span class="js-tip-msg">等待对方审核</span>';
        }
        var resHtml= ' ' +
            '<div class="contact-list-item js-contact-items offline"  id="'+jid_id+'" data-jid="'+jid+'"  data-type="'+sub+'">'+
            '   <img class="tt" src="'+tt+'"/>'+
            '   <span class="name">'+name+'</span>'+
            '   <span class="del js-del">&times;</span>'+
            '</div>';
        return resHtml
    },
    on_roster:function (iq) {
        $(iq).find('item').each(function () {
            var $this=$(this);
            var jid=$this.attr('jid');
            var bareJid=Strophe.getBareJidFromJid(jid);
            var ask=$this.attr('ask');
            var subscription=$this.attr('subscription');
            if($.inArray(bareJid,Gab.contactList)==-1){
                Gab.contactList.push(bareJid);
            }
            var name=$(this).attr('name')||jid;
            if(ask=='subscribe'&&subscription=='none'){
                name+=' <span class="js-tip-msg">等待对方审核</span>';
            }
            var jid_id=Gab.jid_to_id(jid);
            var htmlStr=' ' +
                '<div class="contact-list-item js-contact-items offline"  id="'+jid_id+'" data-jid="'+jid+'" data-type="'+subscription+'">'+
                '   <img class="tt" src="'+tt+'"/>'+
                '   <span class="name">'+name+'</span>'+
                '   <span class="del js-del">&times;</span>'+
                '</div>';
            var contact=$(htmlStr);
            if($('#'+jid_id).length==0){
                $('#js-contact-list').append(Gab.addContactDom());
            }
        });
        Gab.connection.send($pres());
    },
    on_presence:function(pre){
        var $pre=$(pre);
        var pType=$pre.attr('type');
        var from=$pre.attr('from');
        var myJid=Gab.connection.jid;
        var fromBareJid=Strophe.getBareJidFromJid(from);
        if(fromBareJid===Strophe.getBareJidFromJid(myJid)){
            if(pType=='unavailable'){
                util.toast('您已掉线，请重新登录')
            }
            return true;
        }
        if(pType==='subscribe'){
            if($.inArray(fromBareJid,Gab.contactList)==-1){
                Gab.contactList.push(fromBareJid);
                Gab.pending_subscriber=fromBareJid;
                Gab.approvePopups=util.popup(
                    '<div class="chat-tip-box xmpp-box-shadow">' +
                    '<div class="chat-tip-tt" popup-header>好友请求</div>' +
                    '<div class="chat-tip-cont">' +
                    Strophe.getNodeFromJid(fromBareJid)+'请求加你为好友' +
                    '</div>' +
                    '<div class="chat-tip-handle">' +
                    '<a id="js-approve-btn-submit" class="xmpp-button xmpp-button-main chat-tip-btn ">接受</a>'+
                    '<a id="js-approve-btn-close"  class="xmpp-button xmpp-button-default  chat-tip-btn ">拒绝</a>'+
                    '</div>'+
                    '</div>'
                );
                Gab.approvePopups.open();
            }else{
                var dataType=$('#'+Gab.jid_to_id(fromBareJid)).attr('data-type');
                if(dataType!='both'||dataType!='to'){
                    Gab.connection.send($pres({to:fromBareJid,'type':'subscribed'}));
                }
            }
        }else if(pType==='subscribed'){
            if($.inArray(fromBareJid,Gab.contactList)==-1){
                Gab.contactList.push(fromBareJid);
            }
            var dataType=$('#'+Gab.jid_to_id(fromBareJid)).attr('data-type');
            if(dataType=='none'){
                util.toast(Strophe.getNodeFromJid(from)+'通过了您的好友申请');
                $('#'+Gab.jid_to_id(fromBareJid)).find('.js-tip-msg').remove();
            }
        }else if(pType==='unsubscribed'){
            var arrIndex=$.inArray(fromBareJid,Gab.contactList)
            if(arrIndex!=-1){
                Gab.contactList.splice(arrIndex, 1);
            }
            util.toast(Strophe.getNodeFromJid(from)+'拒绝了您的好友申请');
            $('#'+Gab.jid_to_id(fromBareJid)).remove();
        }else if(pType!=='error'){
            var contact=$('#'+Gab.jid_to_id(from))
                .removeClass('online')
                .removeClass('away')
                .removeClass('offline');
            if(pType=='unavailable'){
                contact.addClass('offline');
            }else{

                var show=$pre.find('show').text();
                if(show===''||show==='chat'){
                    contact.addClass('online');
                }else{
                    contact.addClass('away');
                }
            }
        }
        var jid_id=Gab.jid_to_id(from);
        $('#chat-'+jid_id).attr('jid',Strophe.getBareJidFromJid(from));
        return true
    },
    on_message:function (msg) {
        var _$msg=$(msg);
        var full_jid=_$msg.attr('from');
        var jid=Strophe.getBareJidFromJid(full_jid);
        var name=Strophe.getNodeFromJid(jid);
        name=name?name:'系统';
        var jid_id=Gab.jid_to_id(jid);
        var composing=_$msg.find('composing').length;
        var msg=_$msg.find('body').text();
        var time=tool.dealTime(new Date());
        if(msg){
            util.toast('收到的'+ name +'发来新消息');
            Gab.storeMsg.push(jid,{
                type:'receive',
                msg:msg,
                time:time
            })
        }
        chatBox.receiveMsg(jid_id,full_jid,name,time,msg,composing>0?true:false);
        return true;
    },
    jid_to_id:function(jid){
        var _res=Strophe.getBareJidFromJid(jid)
            .replace('@','-')
            .replace(/\./g,'-');
        return _res;
    },
    on_roster_changed:function (iq) {
        var $iq=$(iq);
        $iq.find('item').each(function () {
            var sub=$(this).attr('subscription');
            var jid=$(this).attr('jid');
            var bareJid=Strophe.getBareJidFromJid(jid);
            var name=$(this).attr('name')||jid;
            var jid_id=Gab.jid_to_id(jid);
            var arrIndex=$.inArray(bareJid,Gab.contactList);
            if(sub==='remove'){
                if(arrIndex!=-1){
                    Gab.contactList.splice(arrIndex,1);
                }
                $('#'+jid_id).remove();
            }else{
                if(arrIndex==-1){
                    arrIndex.push(bareJid);
                }
                if($('#'+jid_id).length==0){
                    $('#js-contact-list').append(Gab.addContactDom(jid,sub));
                }
            }
        });
        return true;
    }
};
function initJqueryMap(){
    jqueryMap={
        $chatPanel:$node.find('#js-xmpp-chat-panel'),
        $togglePanelStatus:$node.find('.js-xmpp-chat-panel-toggle-status'),
        $changeStatus:$node.find('#js-change-status'),
    }
}
function init(){
    if(flagMap.init)return;
    flagMap.init=true;
    initJqueryMap();
    $(document).on('click','#js-approve-btn-close',function () {
        Gab.connection.send($pres({
            to:Gab.pending_subscriber,
            'type':'unsubscribed'
        }));
        Gab.pending_subscriber=null;
        Gab.approvePopups.close();
    });
    $(document).on('click','#js-approve-btn-submit',function () {
        Gab.connection.send($pres({
            to:Gab.pending_subscriber,
            type:'subscribed'
        }));
        Gab.connection.send($pres({
            to:Gab.pending_subscriber,
            type:'subscribe'
        }));
        Gab.pending_subscriber=null;
        Gab.approvePopups.close();
    });
    $(document).on('click','.js-contact-items',function(){
        var _jid=$(this).attr('data-jid');
        var _jid_id=Gab.jid_to_id(_jid);
        chatBox.add(_jid_id,_jid,Strophe.getNodeFromJid(_jid));
    });
    $(document).on('click','#js-add-contact',function(){
        if(!Gab.addContactPopups){
            Gab.addContactPopups=util.popup('' +
                '<div class="chat-tip-box xmpp-box-shadow">' +
                '<div class="chat-tip-tt" popup-header>添加好友' +
                '<a id="js-add-contact-btn-close" class="chat-tip-tt-handle"><span class="xmpp-close-btn">&times;</span></a>' +
                '</div>' +
                '<div class="chat-tip-cont">' +
                '<div class="form-box">' +
                '    <label class="form-name">名称</label>'+
                '    <input class="form-input" type="text" id="js-add-contact-name">'+
                '</div>' +
                '</div>' +
                '<div class="chat-tip-handle">' +
                '<a id="js-add-contact-btn-submit" class="xmpp-button xmpp-button-main chat-tip-btn ">确定</a>'+
                '</div>'+
                '</div>' );
        }
        Gab.addContactPopups.open();
    });
    $(document).on('click','#js-add-contact-btn-close',function () {
        $('#js-add-contact-name').val('');
        Gab.addContactPopups.hide();
    });
    $(document).on('click','#js-add-contact-btn-submit',function () {
        var $contactName=$('#js-add-contact-name');
        var _val=$contactName.val();
        if(!$.trim(_val)){
            $contactName.focus();
            return
        }
        $contactName.val('');
        $(document).trigger('contact_added',{
            name:_val
        });
        Gab.addContactPopups.hide();
    });
    $(document).on('click','.js-contact-items .js-del',function () {
        var jid=$(this).parent().attr('data-jid');
        $(document).trigger('contact_del',{jid:jid});
        return false;
    });
    jqueryMap.$changeStatus.on('change',function(){
        var val=$(this).val();
        var _pre;
        if(val=='online'){
            _pre=$pres()
        }else if(val=='offline'){
            _pre=$pres({
                type:'unavailable'
            })
        }else if(val=='away'){
            _pre=$pres().c('show').t('away')
        }
        Gab.connection.send(_pre);
    });
    jqueryMap.$togglePanelStatus.on('click',function(){
        jqueryMap.$chatPanel.fadeToggle('fast');
        $('#js-xmpp-chat-thumb').show();
    });
    $('#js-xmpp-chat-thumb').on('click',function(){
        jqueryMap.$chatPanel.fadeToggle('fast');
        $('#js-xmpp-chat-thumb').hide();
    });
    $(document).bind('connected',function(){
        // $('body').append($node);
        util.popup({
            content:$node,
            position:'bottom right'
        }).open();
        util.toast('登录成功');
        chatBox.init();
        chatBox.subscribeEvent('inputKeyPress',function (ev,data) {
            var _jid=data.jid;
            var _eventType=data.eventVal;
            if(_eventType==1){
                var notify=$msg({
                    to:_jid,
                    type:'chat'
                }).c('composing',{xmlns:'http://jabber.org/protocol/chatstates'});
                Gab.connection.send(notify);
            }else if (_eventType==2){
                var message=$msg({
                    to:_jid,
                    'type':'chat'
                }).c('body').t(data.val).up()
                    .c('active',{xmlns:'http://jabber.org/protocol/chatstates'});
                Gab.storeMsg.push(_jid,{
                    type:'send',
                    msg:data.val,
                    time:tool.dealTime(new Date())
                });
                Gab.connection.send(message);
            }
        });
        chatBox.subscribeEvent('queryHistory',function (ev,data) {
            chatBox.receiveHistory(Gab.jid_to_id(data.jid),Gab.storeMsg.get(data.jid));
        });
        $('#main-panel').find('.js-name').text(Strophe.getNodeFromJid(Gab.connection.jid));
        var iq=$iq({type:'get'}).c('query',{xmlns:'jabber:iq:roster'});
        Gab.connection.sendIQ(iq,Gab.on_roster);
        Gab.connection.addHandler(Gab.on_presence,null,'presence');
        Gab.connection.addHandler(Gab.on_message,null,'message');
        Gab.connection.addHandler(Gab.on_roster_changed,'jabber:iq:roster','iq','set');
    });
    $(document).bind('disconnected',function(){
        Gab.connection=null;
        util.toast('登录失败');
    });
    $(document).bind('contact_added',function(ev,data){
        data.jid= data.name + '@'+Gab.domain;
        if($.inArray(data.jid,Gab.contactList)==-1){
            Gab.contactList.push( data.jid);
        }
        var iq=$iq({type:'set'}).c('query',{xmlns:'jabber:iq:roster'}).c('item',data);
        Gab.connection.sendIQ(iq);
        var subscribe=$pres({to:data.jid,'type':'subscribe'});
        Gab.connection.send(subscribe);
        util.toast('发送成功,等待对方确认');
    });
    $(document).bind('contact_del',function (ev,data) {
        debugger
        var arrIndex=$.inArray(data.jid,Gab.contactList);
        if(arrIndex!=-1){
            Gab.contactList.splice(arrIndex,1)
        }
        var iq=$iq({type:'set'}).c('query',{xmlns:'jabber:iq:roster'}).c('item',{
            jid:data.jid,
            subscription:'remove'
        });
        Gab.connection.sendIQ(iq,function(d){
            $('#'+Gab.jid_to_id(data.jid)).remove();
            util.toast('已删除');
        });
    });
}
function login(data,successFun,errFun){
    if(!flagMap.init){
        init();
    }
    data=$.extend({
        jid:'',
        password:''
    },data);
    var conn=new Strophe.Connection(Gab.BOSH_SERVICE);
    conn.connect(data.jid+'@'+Gab.domain,data.password,function (status) {
        if(status===Strophe.Status.CONNECTED){
            $(document).trigger('connected');
            if($.isFunction(successFun)){
                successFun();
            }
        }else if(status===Strophe.Status.AUTHFAIL){
            $(document).trigger('disconnected');
            if($.isFunction(errFun)){
                errFun();
            }
        }
    });
    Gab.connection=conn;
}
export default{
    init:init,
    login:login
}

