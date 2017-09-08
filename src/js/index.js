/**
 * Created by wangjinmeng on 2017/9/8.
 */
import $ from 'jquery';
import {Strophe,$iq,$msg,$pres} from 'strophe.js';
import ChatBox from '../component/chatBox/index'
import ChatMainPanel from '../component/chatMainPanel/index';
var xmppChatMain={
    jid:'',
    name:'',
    connection:null,
    $event:$('<div></div>'),
    domain:'openfire.zhongqi.com',
    chatBox:ChatBox(),
    chatMainPanel:ChatMainPanel(),
    bosh_service:"http://192.168.3.28:7070/http-bind/",
    on_roster:function (iq) {
        this.chatMainPanel.show();
        $(iq).find('item').each(function () {
        });
        Gab.connection.send($pres());
    },
    on_presence:function(pre){
        var $pre=$(pre);
        var pType=$pre.attr('type');
        var from=$pre.attr('from');
        return true
    },
    on_message:function (msg) {
        var _$msg=$(msg);
        return true;
    },
    on_roster_changed:function (iq) {
        var $iq=$(iq);
        $iq.find('item').each(function () {
        });
        return true;
    }
};
xmppChatMain.$event.on('xmppChatConnected',function () {
    var iq=$iq({type:'get'}).c('query',{xmlns:'jabber:iq:roster'});
    xmppChatMain.connection.sendIQ(iq);
    xmppChatMain.connection.addHandler(xmppChatMain.on_presence,null,'presence');
    xmppChatMain.connection.addHandler(xmppChatMain.on_message,null,'message');
    xmppChatMain.connection.addHandler(xmppChatMain.on_roster_changed,'jabber:iq:roster','iq','set');
});
function addHandler(eventName,fn) {
    xmppChatMain.$event.on(eventName,function (evt,data) {
        if($.isFunction(fn)){
            fn(data);
        }
    })
}
function login(data){
    data=$.extend({
        jid:'',
        password:''
    },data);
    xmppChatMain.connection=new Strophe.Connection(boshService);
    xmppChatMain.connection.connect(data.jid+'@'+xmppChatMain.domain,data.password,function (status) {
        if(status===Strophe.Status.CONNECTED){
            xmppChatMain.name=data.jid;
            xmppChatMain.jid=data.jid+'@'+xmppChatMain.domain;
            xmppChatMain.$event.trigger('xmppChatConnected');
        }else if(status===Strophe.Status.AUTHFAIL){
            xmppChatMain.$event.trigger('xmppChatDisconnected');
        }
    });
}
export default  {
    login,
    addHandler
}




