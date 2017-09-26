/**
 * Created by wangjinmeng on 2017/9/15.
 */
import $ from 'jquery';
import util from '../../plugin/util/util';
let login={
    $node:$(`<div class="xmpp-box chat-tip-box xmpp-box-shadow chat-main-box">
                 <div class="chat-tip-tt" popup-header>登录
                    <a class="chat-tip-tt-handle"><span class="xmpp-close-btn js-xmpp-login-close">&times;</span></a>
                 </div>
                 <div class="chat-tip-cont">
                     <div class="form-box">
                         <label class="form-name">JID</label><input class="form-input js-xmpp-login-jid" type="text">
                         <label class="form-name">password</label><input class="form-input js-xmpp-login-password" type="password">
                     </div>
                 </div>
                 <div class="chat-tip-handle">
                    <a class="xmpp-button xmpp-button-main chat-tip-btn js-xmpp-login">确定</a>
                 </div>
             </div>`),
    $event:$('<div></div>'),
    popup:null,
    open:function () {
        this.popup.open();
    },
    hide:function () {
      this.popup.hide();
    },
    close:function () {
        this.popup.close();
    },
    addHandler:function (eventName,fn) {
        this.$event.on(eventName,function (evn,data) {
            if($.isFunction(fn)){
                fn(data)
            }
        })
    },
    init:function () {
        let _this=this;
        _this.popup=util.popup(_this.$node);
        _this.$node.find('.js-xmpp-login').on('click',function () {
            let _data={
                jid:_this.$node.find('.js-xmpp-login-jid').val(),
                password:_this.$node.find('.js-xmpp-login-password').val()
            };
            _this.$event.trigger('xmppLoginClick',_data);
        })
        _this.$node.find('.js-xmpp-login-close').on('click',function () {
            _this.$event.trigger('xmppLoginClose');
        })
    }
};
login.init();
export default login;


