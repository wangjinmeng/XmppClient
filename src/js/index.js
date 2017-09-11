/**
 * Created by wangjinmeng on 2017/9/8.
 */
import $ from 'jquery';
import tool from '../js/tool'
import {Strophe,$iq,$msg,$pres} from 'strophe.js';
import ChatPanel from '../component/chatPanel/index';
let ttImg=require('../img/tt.jpg');
let xmppChat={
    jid:'',
    name:'',
    connection:null,
    $event:$('<div></div>'),
    domain:'openfire.zhongqi.com',
    bosh_service:"http://192.168.3.28:7070/http-bind/",
    chatPanel:null,
    addHandler:function (eventName,fn) {
        this.$event.on(eventName,function (evt,data) {
            if($.isFunction(fn)){
                fn(data);
            }
        })
    },
    login:function(data){
        data=$.extend({
            jid:'',
            password:''
        },data);
        xmppChat.connection=new Strophe.Connection(xmppChat.bosh_service);
        xmppChat.connection.connect(data.jid+'@'+xmppChat.domain,data.password,function (status) {
            if(status===Strophe.Status.CONNECTED){
                xmppChat.name=data.jid;
                xmppChat.jid=data.jid+'@'+xmppChat.domain;
                xmppChat.$event.trigger('xmppChatConnected');
            }else if(status===Strophe.Status.AUTHFAIL){
                xmppChat.$event.trigger('xmppChatDisconnected');
            }
        });
    },
    on_roster:function (iq) {
        $(iq).find('item').each(function (){
            console.log($(this));
            let _name=$(this).attr('name');
            let _jid=$(this).attr('jid');
            let _subscript=$(this).attr('subscription');
            let _img=ttImg;
            xmppChat.chatPanel.addContact(_name?_name:Strophe.getNodeFromJid(_jid),_jid,_img,_subscript);
        });
        xmppChat.chatPanel.show();
        xmppChat.connection.send($pres());
    },
    on_message:function (msg) {
        console.log(msg);
        let $msg=$(msg);
        let _$msgItem=$msg.find('body');
        let _$composing=$msg.find('composing');
        let _fromJid=Strophe.getBareJidFromJid($msg.attr('from'));
        if(_fromJid==xmppChat.domain){
            return true;
        }
        if(_$composing.length>0){
            //正在输入
            xmppChat.chatPanel.showStatus(_fromJid);
        }else if(_$msgItem.length>0){
            //收到消息
            let _msgData={
                msg:_$msgItem.text(),
                time:tool.dealTime(new Date()),
            };
            xmppChat.storeMsg.push(_fromJid,$.extend({},_msgData,{type:'receive'}));
            xmppChat.chatPanel.receiveMsg(Strophe.getNodeFromJid(_fromJid),_fromJid,_msgData);
        }else{
            //取消正在输入
            xmppChat.chatPanel.hideStatus(_fromJid);
        }
        return true;
    },
    on_presence:function (pre) {
        console.log(pre);
        var $pre=$(pre);
        var _pType=$pre.attr('type');
        var _fromJid=Strophe.getBareJidFromJid($pre.attr('from'));
        if(_fromJid==xmppChat.jid){
            //此处处理与自己相关的出席通知
        }else{
            if(_pType==='subscribe'){
                //收到订阅通知出席通知
            }else if(_pType==='subscribed'){
                //收到接受订阅出席通知
            }else if(_pType!=='error'){
                let _status;
                if(_pType=='unavailable'){
                    _status='offline';
                }else{
                    let show=$pre.find('show').text();
                    if(show===''||show==='chat'){
                        _status='online';
                    }else{
                        _status='away';
                    }
                }
                xmppChat.chatPanel.changeContactStatus(_fromJid,_status);
            }
        }
        return true;
    },
    on_roster_changed:function () {
    },
    send_message:function (type,msgData) {
        let msg=$msg({
            to:msgData.id,
            'type':'chat'
        });
        if(type==='chat'){
            xmppChat.storeMsg.push(msgData.id,{type:'send',msg:msgData.msg,time:msgData.time});
            msg.c('body').t(msgData.msg).up().c('active',{xmlns:'http://jabber.org/protocol/chatstates'});
        }else if(type=='focus'){
            msg.c('composing',{xmlns:'http://jabber.org/protocol/chatstates'});
        }
        //失去焦点发送空消息
        xmppChat.connection.send(msg);
    },
    init:function(){
        let iq=$iq({type:'get'}).c('query',{xmlns:'jabber:iq:roster'});
        xmppChat.connection.sendIQ(iq,xmppChat.on_roster);
        xmppChat.connection.addHandler(xmppChat.on_presence,null,'presence');
        xmppChat.connection.addHandler(xmppChat.on_message,null,'message');
        xmppChat.connection.addHandler(xmppChat.on_roster_changed,'jabber:iq:roster','iq','set');
        xmppChat.chatPanel=ChatPanel(xmppChat.name,xmppChat.jid);
        xmppChat.chatPanel.addHandler('xmppChatPanelSendMsg',function(data){
            xmppChat.send_message('chat',data);
        });
        xmppChat.chatPanel.addHandler('xmppChatPanelFocus',function (data) {
            xmppChat.send_message('focus',data);
        });
        xmppChat.chatPanel.addHandler('xmppChatPanelBlur',function (data) {
            xmppChat.send_message('blur',data);
        });
    },
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
            var myJid=Strophe.getBareJidFromJid(xmppChat.connection.jid);
            var keyName=myJid+'&'+jid;
            window.localStorage[keyName]=JSON.stringify(localData);
        },
        get:function(jid){
            var myJid=Strophe.getBareJidFromJid(xmppChat.connection.jid);
            var keyName=myJid+'&'+jid;
            var msg=window.localStorage[keyName];
            if(!msg){
                return [];
            }
            return JSON.parse(msg);
        }
    },
};
xmppChat.$event.on('xmppChatConnected',xmppChat.init);




export default xmppChat




