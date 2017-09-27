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
let $initNode=$('<span class="xmpp-box xmpp-contact-us xmpp-shake-animate" id="js-xmpp-chat-thumb">即时通讯</span>');
function login() {
    logger.log('执行restore失败尝试 attach')
    if($.isFunction($.internalImLogin)){
        $.internalImLogin().then(function (data) {
            if(data.status==='success'){
                chatMain.attach({
                    jid:data.username,
                    rid:data.rid,
                    sid:data.sid
                });
            }else if(data.status==='failed'){
                logger.log('后台登录失败！！！')
            }else{
                xmppChat.connectFail=true;
                return;
            }
        });
    }else {
        loginBox.open();
        loginBox.addHandler('xmppLoginClick',function (data) {
            if(data.password&&data.jid){
                chatMain.login(data);
            }else{
                util.toast('请填写完整')
            }
        });
        chatMain.addHandler('xmppChatConnected',function(){
            loginBox.close();
        });
    }
}
chatMain.addHandler('xmppChatConnected',function(){
    $('body').append($initNode);
    $initNode.show();
    $initNode.on('click',function () {
        $initNode.hide();
        chatMain.chatPanel.show();
    });
});
chatMain.addHandler('xmppChatHide',function(){
    $initNode.show();
});
try{
    chatMain.restore(login);
}catch(e){
    login();
}



