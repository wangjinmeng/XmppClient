/**
 * Created by Administrator on 2017/9/5.
 */
import $ from 'jquery';
import chatMain from './js/index';
import util from './plugin/util/util';
import loginBox from './component/loginBox/index'
import './css/index.css';
let $initNode=$('<span class="xmpp-box xmpp-contact-us xmpp-shake-animate" id="js-xmpp-chat-thumb">即时通讯</span>');
function login() {
    console.log('登陆中。。。');
    if($.trim($.imProSessionData) != ""){
        var _sessionData=$.parseJSON(decodeURIComponent($.imProSessionData));
        chatMain.attach({
            jid:_sessionData.username,
            rid:_sessionData.rid,
            sid:_sessionData.sid
        });
    }else {
        chatMain.connectFail=true;
        return;
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



