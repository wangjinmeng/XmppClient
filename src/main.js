/**
 * Created by Administrator on 2017/9/5.
 */
import $ from 'jquery';
import chatMain from './js/chatMain';
import util from './plugin/util/util';
import style from './css/index.css';
var loginPopup= util.popup(
    '<div class="chat-tip-box xmpp-box-shadow chat-main-box">' +
    '<div class="chat-tip-tt">登录' +
    '<span class="xmpp-close-btn" id="js-xmpp-tip-box-close">&times;</span>' +
    '</div>' +
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
var $initNode=$('<span class="xmpp-contact-us xmpp-shake-animate">联系我们</span>');
$(document).on('click',"#js-xmpp-login",function(){
    util.showLoading();
    chatMain.login({
        jid:$('#js-jid').val(),
        password:$('#js-password').val()
    },function(){
        util.hideLoading();
        loginPopup.close();
        $initNode.remove();
    },function(){
        util.hideLoading();
    })
});
$(document).on('click',"#js-xmpp-tip-box-close",function(){
    loginPopup.hide();
    $initNode.show();
});
$initNode.on('click',function () {
    loginPopup.open();
    $initNode.hide();
});
$('body').append($initNode);