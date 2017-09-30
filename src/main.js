/**
 * Created by Administrator on 2017/9/5.
 */
import $ from 'jquery';
import chatMain from './js/index';
import util from './plugin/util/util';
import loginBox from './component/loginBox/index'
import './css/index.css';
import {Logger} from './js/logger'
var logger=new Logger('main');
let $initNode=$('<a class="xmpp-box xmpp-contact-us xmpp-shake-animate" id="js-xmpp-chat-thumb">即时通讯' +
                    '<span class="js-xmpp-chat-thumb-num xmpp-chat-thumb-num" style="display: none;"></span>' +
                '</a>');
$('body').append($initNode);
$initNode.hide();
function login() {
    logger.log('执行restore失败尝试 attach');
    if($.isFunction($.internalImLogin)){
        $.internalImLogin().then(function (data) {
            if(data.status==='success'){
                xmppChat.connectStatus=1;
                chatMain.attach({
                    jid:data.username,
                    rid:data.rid,
                    sid:data.sid
                });
            }else if(data.status==='failed'){
                xmppChat.connectStatus=2;
                logger.log('后台登录失败！！！');
            }else if(data.status==='notLogin'){
                xmppChat.connectStatus=3;
            }
        });
    }else {
        $initNode.show();
        $initNode.on('click.loginBox',function () {
            $initNode.hide();
            loginBox.open();
        });
        loginBox.addHandler('xmppLoginClick',function (data) {
            if(data.password&&data.jid){
                chatMain.login(data);
            }else{
                util.toast('请填写完整')
            }
        });
        loginBox.addHandler('xmppLoginClose',function (data) {
            $initNode.show();
            loginBox.hide();
        });
        chatMain.addHandler('xmppChatConnected',function(){
            loginBox.close();
            $initNode.off('click.loginBox');
        });
    }
}
chatMain.addHandler('xmppChatConnected',function(){
    $initNode.show();
    $initNode.on('click',function () {
        $initNode.hide();
        chatMain.chatPanel.show();
    });
    chatMain.addHandler('xmppChatChangeTotalUnReadMsg',function(data){
        $initNode.find('.js-xmpp-chat-thumb-num').text(data.num);
        if(data.num>0){
            $initNode.find('.js-xmpp-chat-thumb-num').show();
        }else{
            $initNode.find('.js-xmpp-chat-thumb-num').hide();
        }
    })
});
chatMain.addHandler('xmppChatHide',function(){
    $initNode.show();
});
try{
    chatMain.restore(login);
}catch(e){
    login();
}



