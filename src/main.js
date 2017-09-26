/**
 * Created by Administrator on 2017/9/5.
 */
import $ from 'jquery';
import chatMain from './js/index';
import util from './plugin/util/util';
import loginBox from './component/loginBox/index'
import './css/index.css';
let $initNode=$('<span class="xmpp-box xmpp-contact-us xmpp-shake-animate" id="js-xmpp-chat-thumb">即时通讯</span>');
$('body').append($initNode);

function login() {
    loginBox.addHandler('xmppLoginClick',function (data) {
        if(!data.jid||!data.password){
            util.toast('请填写完整');
            return
        }
        util.showLoading();
        chatMain.login(data)
    });
    loginBox.addHandler('xmppLoginClose',function () {
        console.log('close');
        loginBox.hide();
        $initNode.show();
    });
    chatMain.addHandler('xmppChatConnected',function(){
        util.hideLoading();
        loginBox.close();
        $initNode.off('click.open-login');
    });
    chatMain.addHandler('xmppChatDisconnected',function(){
        util.hideLoading();
    });
    $initNode.on('click.open-login',function () {
        loginBox.open();
        $initNode.hide();
    });
}
chatMain.addHandler('xmppChatConnected',function(){
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



