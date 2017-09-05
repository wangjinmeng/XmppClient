$(function(){
    chatMain();
    var loginPopup= util.popup('' +
        '<div class="chat-tip-box box-shadow">' +
        '<div class="chat-tip-tt">登录</div>' +
        '<div class="chat-tip-cont">' +
        '<div class="form-box">' +
        '    <label class="form-name">JID</label><input class="form-input" type="text" id="js-jid">'+
        '    <label class="form-name">password</label><input class="form-input" type="password"id="js-password">'+
        '</div>' +
        '</div>' +
        '<div class="chat-tip-handle">' +
        '<a id="js-login" class="button button-main chat-tip-btn ">确定</a>'+
        '</div>'+
        '</div>');
    loginPopup.open();
    $(document).on('click',"#js-login",function(){
        $(document).trigger('chat-main-connect',{
            jid:$('#js-jid').val(),
            password:$('#js-password').val()
        });
        loginPopup.close();
    });
});