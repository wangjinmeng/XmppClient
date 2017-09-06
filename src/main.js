/**
 * Created by Administrator on 2017/9/5.
 */
import $ from 'jquery';
import chatMain from './js/chatMain';
import utilStyle from './plugin/util/util.css';
import util from './plugin/util/util';
import style from './css/index.css';

var loginPopup= util.popup(
    '<div class="chat-tip-box box-shadow chat-main-box">' +
    '<div class="chat-tip-tt">登录</div>' +
    '<div class="chat-tip-cont">' +
    '<div class="form-box">' +
    '    <label class="form-name">JID</label><input class="form-input" type="text" id="js-jid">'+
    '    <label class="form-name">password</label><input class="form-input" type="password"id="js-password">' +
    '</div>' +
    '</div>' +
    '<div class="chat-tip-handle">' +
    '<a id="js-xmpp-login" class="xmpp-button xmpp-button-main chat-tip-btn ">确定</a>'+
    '</div>'+
    '</div>');
var $initNode=$('<span id="js-chat-tip" class="xmpp-contact-us">联系我们</span>');
loginPopup.hide();
$(document).on('click',"#js-xmpp-login",function(){
    chatMain.login({
        jid:$('#js-jid').val(),
        password:$('#js-password').val()
    },function(){
        loginPopup.close();
        $initNode.remove();
    })
});
$initNode.on('click',function () {
    loginPopup.open();
    $initNode.hide();
});
$('body').append($initNode);

window.util = util;
