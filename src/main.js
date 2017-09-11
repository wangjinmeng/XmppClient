/**
 * Created by Administrator on 2017/9/5.
 */
import $ from 'jquery';
import chatMain from './js/index';
import util from './plugin/util/util';
import './css/index.css';
var loginPopup= util.popup(`
                         <div class="chat-tip-box xmpp-box-shadow chat-main-box">
                         <div class="chat-tip-tt" popup-header>登录
                         <a class="chat-tip-tt-handle"><span class="xmpp-close-btn" id="js-xmpp-tip-box-close">&times;</span></a>
                         </div>
                         <div class="chat-tip-cont">
                         <div class="form-box">
                             <label class="form-name">JID</label><input class="form-input" type="text" id="js-jid">
                             <label class="form-name">password</label><input class="form-input" type="password"id="js-password">
                         </div>
                         </div>
                         <div class="chat-tip-handle">
                         <a id="js-xmpp-login" class="xmpp-button xmpp-button-main chat-tip-btn ">确定</a>
                         </div>
                         </div>`);
var $initNode=$('<span class="xmpp-contact-us xmpp-shake-animate" id="js-xmpp-chat-thumb">即时通讯</span>');
$(document).on('click',"#js-xmpp-login",function(){
    var _jid=$.trim($('#js-jid').val());
    var _password=$.trim($('#js-password').val());
    if(!_jid||!_password){
        util.toast('请填写完整');
        return
    }
    util.showLoading();
    chatMain.login({jid:_jid,password:_password})
});
chatMain.addHandler('xmppChatConnected',function(){
    util.hideLoading();
    loginPopup.close();
    $initNode.off('click.open-login');
});
chatMain.addHandler('xmppChatDisconnected',function(){
    util.hideLoading();
});
$(document).on('click',"#js-xmpp-tip-box-close",function(){
    loginPopup.hide();
    $initNode.show();
});
$initNode.on('click.open-login',function () {
    loginPopup.open();
    $initNode.hide();
});
$('body').append($initNode);