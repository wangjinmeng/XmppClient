/**
 * Created by wangjinmeng on 2017/9/8.
 */
import $ from 'jquery';
import tool from '../js/tool';
import util from '../plugin/util/util';
import {Strophe,$iq,$msg,$pres} from 'strophe.js';
import ChatPanel from '../component/chatPanel/index';
let ttImg=require('../img/tt.jpg');
import connectStatus from './connectStatus'
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
        xmppChat.connection.connect(data.jid+'@'+xmppChat.domain,data.password,function (status) {
            util.toast(connectStatus[status]);
            if(status===Strophe.Status.CONNECTED){
                    xmppChat.$event.trigger('xmppChatConnected');
            }else if(status===Strophe.Status.AUTHFAIL){
                xmppChat.$event.trigger('xmppChatDisconnected');
            }else if(status===Strophe.Status.DISCONNECTED){
                xmppChat.login({
                    jid:xmppChat.connection.jid,
                    password:xmppChat.connection.pass
                });
            }
        });
    },
    attach:function (data) {
        let timer=null;
        xmppChat.connection.attach(data.jid,data.sid,data.rid,function(status){
            if(status===Strophe.Status.ATTACHED){
                timer=setTimeout(function () {
                    xmppChat.$event.trigger('xmppChatConnected');
                },1000)
            }else if(status===Strophe.Status.CONNFAIL){
                clearTimeout(timer);
                sessionStorage.removeItem("xmppCache");
                console.log('链接失败');
            }
        });
    },
    restore:function (failFun) {
        var timer=null;
        xmppChat.connection.restore(null,function(status){
            if(status===Strophe.Status.ATTACHED){
                timer=setTimeout(function () {
                    xmppChat.$event.trigger('xmppChatConnected');
                },1000)
            }else if(status===Strophe.Status.CONNFAIL){
                clearTimeout(timer);
                console.log('链接失败');
                if($.isFunction(failFun)){
                    failFun()
                }
            }else if(status===Strophe.Status.DISCONNECTED){
                xmppChat.login({
                    jid:xmppChat.connection.jid,
                    password:xmppChat.connection.pass
                });
            }
        })
    },
    on_roster:function (iq) {
        $(iq).find('item').each(function (){
            let _name=$(this).attr('name');
            let _jid=$(this).attr('jid');
            let _subscript=$(this).attr('subscription');
            let _img=ttImg;
            xmppChat.chatPanel.addContact(_name?_name:Strophe.getNodeFromJid(_jid),_jid,_img,_subscript);
        });
        xmppChat.change_status('offline');
        setTimeout(function () {
            xmppChat.change_status('online');
        },2000)
    },
    on_message:function (msg) {
        console.log(msg);
        let $msg=$(msg);
        let _$msgItem=$msg.find('body');
        let _$composing=$msg.find('composing');
        let _fromJid=Strophe.getBareJidFromJid($msg.attr('from'));
        if(_fromJid==xmppChat.domain){
            if(_$msgItem.length>0){
                util.toast(_$msgItem.text());
            }
            return true;
        }
        if(_$composing.length>0){
            //正在输入
            xmppChat.chatPanel.showStatus(_fromJid);
        }else if(_$msgItem.length>0){
            util.toast('收到'+Strophe.getNodeFromJid(_fromJid)+'发来的新消息');
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
        let $pre=$(pre);
        let _pType=$pre.attr('type');
        let _fromJid=Strophe.getBareJidFromJid($pre.attr('from'));
        let _name=Strophe.getNodeFromJid(_fromJid);
        if(_fromJid==xmppChat.jid){
            console.log(pre)
            //此处处理与自己相关的出席通知
            if(_pType!=='error'&&_pType!=='subscribe'&&_pType!=='subscribed'){
                if(_pType){
                    _pType='offline';
                }else if(!_pType){
                    var show=$pre.find('show').text();
                    _pType=show?'away':'online';
                }
                xmppChat.chatPanel.changeSelfStatus(_pType);
            }
        }else{
            if(_pType==='subscribe'){
                //收到订阅通知出席通知
                let _contactCache=xmppChat.chatPanel.contactListCache[_fromJid];
                if(_contactCache){
                    xmppChat.connection.send($pres({
                        to:_fromJid,
                        type:'subscribed'
                    }));
                }else{
                    util.confirm('接受'+_name +'发来的好友请求吗？',function (flag) {
                        //   接受处理
                        if(flag){
                            xmppChat.accept_contact(_name,_fromJid);
                            return true;
                        }
                    });
                }
            }else if(_pType==='subscribed'){
                //收到接受订阅出席通知
                let _contactCache=xmppChat.chatPanel.contactListCache[_fromJid];
                if(_contactCache){
                    let _checkDom=_contactCache.find('.js-check');
                    if(_checkDom.length>0){
                        _checkDom.remove();
                        util.toast(_name+'同意了你的好友请求');
                    }
                }
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
    del_contact:function(jid){
        let iq=$iq({type:'set'}).c('query',{xmlns:'jabber:iq:roster'}).c('item',{
            jid:jid,
            subscription:'remove'
        });
        xmppChat.connection.sendIQ(iq,function(d){
            util.toast('删除成功');
            xmppChat.chatPanel.delContact(jid);
        });
    },
    add_contact:function (data) {
        data.jid=data.name+'@'+xmppChat.domain;
        let res=xmppChat.chatPanel.addContact(data.name,data.jid,ttImg,'none');//添加好友失败返回false
        if(!res) {
            util.toast('请勿重复添加');
            return false
        }
        let iq=$iq({type:'set'}).c('query',{xmlns:'jabber:iq:roster'}).c('item',data);
        xmppChat.connection.sendIQ(iq);
        let subscribe=$pres({to:data.jid,'type':'subscribe'});
        xmppChat.connection.send(subscribe);
        util.toast('发送成功,等待对方确认');
        return true
    },
    accept_contact:function(name,id){
        console.log(id);
        xmppChat.connection.send($pres({
            to:id,
            type:'subscribed'
        }));
        xmppChat.connection.send($pres({
            to:id,
            type:'subscribe'
        }));
        xmppChat.chatPanel.addContact(name,id,ttImg,'both')
    },
    change_status:function (status) {
        var _pre;
        if(status=='online'){
            _pre=$pres()
        }else if(status=='offline'){
            _pre=$pres({
                type:'unavailable'
            })
        }else if(status=='away'){
            _pre=$pres().c('show').t('away')
        }
        xmppChat.connection.send(_pre);
    },
    init:function(){
        xmppChat.name=Strophe.getNodeFromJid(xmppChat.connection.jid);
        xmppChat.jid=Strophe.getBareJidFromJid(xmppChat.connection.jid);
        let iq=$iq({type:'get'}).c('query',{xmlns:'jabber:iq:roster'});
        xmppChat.connection.sendIQ(iq,xmppChat.on_roster);
        xmppChat.connection.addHandler(xmppChat.on_presence,null,'presence');
        xmppChat.connection.addHandler(xmppChat.on_message,null,'message');
        xmppChat.connection.addHandler(xmppChat.on_roster_changed,'jabber:iq:roster','iq','set');
        xmppChat.chatPanel=ChatPanel(Strophe.getNodeFromJid(xmppChat.connection.jid),xmppChat.connection.jid);
        xmppChat.chatPanel.addHandler('xmppChatPanelSendMsg',function(data){
            xmppChat.send_message('chat',data);
        });
        xmppChat.chatPanel.addHandler('xmppChatPanelFocus',function (data) {
            xmppChat.send_message('focus',data);
        });
        xmppChat.chatPanel.addHandler('xmppChatPanelBlur',function (data) {
            xmppChat.send_message('blur',data);
        });
        xmppChat.chatPanel.addHandler('xmppChatPanelQueryHistory',function (data) {
            xmppChat.chatPanel.receiveHistroyMsg(Strophe.getNodeFromJid(data.id),data.id,xmppChat.storeMsg.get(data.id))
        });
        xmppChat.chatPanel.addHandler('xmppChatPanelAdd',function (data) {
            xmppChat.add_contact(data);
        });
        xmppChat.chatPanel.addHandler('xmppMainPanelDelContace',function (data) {
            util.confirm("你确定删除"+Strophe.getNodeFromJid(data.id)+"吗？",function (flag) {
                if(flag){
                    xmppChat.del_contact(data.id);
                }
            });
        });
        xmppChat.chatPanel.addHandler('xmppChatMainPanelAddContact',function (data) {
            if(xmppChat.add_contact(data)){
                xmppChat.chatPanel.addContactPopup.close();
            }
        });
        xmppChat.chatPanel.addHandler('xmppChatMainPanelChangeStatus',function (data) {
            xmppChat.change_status(data.status)
        });
        xmppChat.chatPanel.addHandler('xmppChatMainPanelHide',function (data) {
            // xmppChat.change_status(data.status);
            xmppChat.$event.trigger('xmppChatHide')
        });
    },
    storeMsg:{
        maxLen:500,
        push:function(jid,data){
            let localData=this.get(jid);
            if(localData.constructor!=Array){
                localData=[]
            }
            if(localData.length>this.maxLen){
                localData.splice(0,1)
            }
            localData.push(data);
            let myJid=Strophe.getBareJidFromJid(xmppChat.connection.jid);
            let keyName=myJid+'&'+jid;
            window.localStorage[keyName]=JSON.stringify(localData);
        },
        get:function(jid){
            let myJid=Strophe.getBareJidFromJid(xmppChat.connection.jid);
            let keyName=myJid+'&'+jid;
            let msg=window.localStorage[keyName];
            if(!msg){
                return [];
            }
            return JSON.parse(msg);
        }
    }
};
xmppChat.connection=new Strophe.Connection(xmppChat.bosh_service,{'keepalive': true});
xmppChat.$event.on('xmppChatConnected',xmppChat.init);
$(document).on('click','[xmpp-data-chat]',function(){
    let _name=$(this).attr('xmpp-data-chat');
    if(!_name) return;
    if(!xmppChat.jid){
        util.toast('暂未登录');
        return
    }
    xmppChat.chatPanel.showItem(_name,_name+'@'+xmppChat.domain);
    return false
});
$(document).on('click','[xmpp-data-add]',function(){
    let _name=$(this).attr('xmpp-data-add');
    if(!_name) return;
    if(!xmppChat.jid){
        util.toast('暂未登录');
        return
    }
    xmppChat.add_contact({
        name:_name,
        id:_name+'@'+xmppChat.domain
    });
    return false
});

export default xmppChat
