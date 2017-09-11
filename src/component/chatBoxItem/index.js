/**
 * Created by wangjinmeng on 2017/9/8.
 */
import './css/index.css'
import $ from 'jquery';
import tool from '../../js/tool'
import richEdit from '../richEdit/index';
import fromHtImg from './img/qq.jpg';
import myHtImg from './img/tt.jpg';

function getNode(name,id){
    let nodeStr=
        `<div class="js-xmpp-chat-box-item xmpp-chat-box-item" data-id="${id}">
            <div class="xmpp-chat-box-item-title fix" popup-header>
                <div class="box-title-user-img fl user-img">
                    <img src="${myHtImg}" />
                </div>
                <div class="box-title-user-info fl">
                    <span class="name js-name">${name}</span>
                    <span class="status js-status  js-xmpp-chat-box-item-status" style="display: none">正在输入...</span>
                </div>
            </div>
            <div class="box-chat">
                <div class="box-chat-main">
                    <a class="js-xmpp-chat-box-item-query-history box-chat-query-history ">查看聊天记录</a>
                    <ul class="js-msg-box js-xmpp-chat-box-item-msg-box"></ul>
                </div>
                <div class="box-chat-footer pr fix">
                    <div class="js-xmpp-chat-box-item-text-area xmpp-chat-box-item-text-area"></div>
                    <div class="xmpp-button xmpp-button-main box-chat-bottom js-xmpp-chat-box-item-send-msg-btn">发送</div>
                </div>
            </div>
            <div class="box-handle">
                <a class="xmpp-close-btn js-xmpp-chat-box-item-close">&times;</a>
            </div>
        </div>`;
    return $(nodeStr)
}
function getSendMsgNode(data,type){
    let _sendNodeStr=`<li class="box-chat-mine fix">
            <div class="box-chat-img user-img user-img-sm fr">
                <img src="${fromHtImg}" alt=""/>
            </div>
            <div class="box-char-info">
                <div class="desc">
                    <span class="name">${data.name}</span>
                    <span class="time">${data.time}</span>
                </div>
                <div class="msg pr">
                    ${data.msg}
                    <span></span>
                </div>
            </div>
        </li>`;
    let _receiveNodeStr=$(`
            <li class="fix">
            <div class="box-chat-img user-img user-img-sm fl">
                <img src="${myHtImg}" alt=""/>
            </div>
            <div class="box-char-info">
                <div class="desc">
                    <span class="name">${data.name}</span>
                    <span class="time">${data.time}</span>
                </div>
                <div class="msg pr js-msg">
                    ${data.msg}
                    <span></span>
                </div>
            </div>
        </li>`) ;
    return type=='send'?$(_sendNodeStr):$(_receiveNodeStr);
}
/**
 *
 @param name
 @param id
 @constructor
 @event:
    xmppChatBoxItemSendMsg:发送消息
    xmppChatBoxItemClose:关闭盒子
    xmppChatBoxItemQueryHistory:查看历史消息
    xmppChatBoxItemFocus:输入框获得焦点
    xmppChatBoxItemBlur:输入框失去焦点
 */
let ChatBoxItem=function (name,id) {
    this.$node=null;
    this.name=name;
    this.id=id;
    this.richEdit=null;
    this.scrollTimer=null;
    this.$event=$('<div></div>')
};
ChatBoxItem.prototype.init=function () {
    let _this=this;
    _this.richEdit=richEdit();
    _this.$node=getNode(_this.name,_this.id);
    _this.$node.find('.js-xmpp-chat-box-item-text-area').append(_this.richEdit.$node);
    _this.$node.find('.js-xmpp-chat-box-item-send-msg-btn').on('click',function(){
        let _text=_this.richEdit.getText();
        if(_text){
            _this.richEdit.resetTextArea();
            _this.handleMsgDom(_text,tool.dealTime(new Date()),'send');
            _this.scrollToBottom();
            _this.$event.trigger('xmppChatBoxItemSendMsg',{id:_this.id,msg:_text,time:tool.dealTime(new Date())});
        }
        return false;
    });
    _this.$node.find('.js-xmpp-chat-box-item-close').on('click',function(){
        // _this.close();
        _this.$event.trigger('xmppChatBoxItemClose',{id:_this.id});
    });
    _this.$node.find('.js-xmpp-chat-box-item-query-history').on('click',function(){
        this.remove();
        _this.$event.trigger('xmppChatBoxItemQueryHistory',{id:_this.id});
    });
    _this.richEdit.addHandle('xmppRichEditFocus',function(){
        _this.$event.trigger('xmppChatBoxItemFocus',{id:_this.id});
    });
    _this.richEdit.addHandle('xmppRichEditBlur',function(){
        _this.$event.trigger('xmppChatBoxItemBlur',{id:_this.id});
    });
};
ChatBoxItem.prototype.show=function (ele) {
    ele.append(this.$node);
};
ChatBoxItem.prototype.close=function () {
    this.$node.detach();
};
ChatBoxItem.prototype.showStatus=function () {
    this.$node.find('.js-xmpp-chat-box-item-status').show();
};
ChatBoxItem.prototype.hideStatus=function () {
    this.$node.find('.js-xmpp-chat-box-item-status').hide();
};
ChatBoxItem.prototype.scrollToBottom=function () {
    var $dom=this.$node.find('.js-xmpp-chat-box-item-msg-box');
    if(this.scrollTimer!=null){
        clearTimeout(this.scrollTimer);
    }
    this.scrollTimer=setTimeout(function () {
        var height=$dom.height();
        $dom.parent().stop(true,true).animate({
            scrollTop:height
        },600);
    },100)
};
ChatBoxItem.prototype.handleMsgDom=function (msg,time,status) {
    let _this=this;
    var _name=status=='send'?'me':_this.name;
    var _data={
        msg: msg,
        time: time,
        name: _name
    };
    var _msgDom= getSendMsgNode(_data,status);
    var $dom=_this.$node.find('.js-xmpp-chat-box-item-msg-box');
    $dom.append(_msgDom);
};
ChatBoxItem.prototype.receiveHistroyMsg=function(data){
    this.$node.find('.js-xmpp-chat-box-item-msg-box').empty();
    for(let i=0;i<data.length;i++){
        this.handleMsgDom(data[i].msg,data[i].time,data[i].type);
    }
};
ChatBoxItem.prototype.addHandler=function (eventName,fn) {
    this.$event.on(eventName,function (evt,data) {
        if($.isFunction(fn)){
            fn(data);
        }
    })
};
function plugIn(name,id){
    let chatBox=new ChatBoxItem(name,id);
    chatBox.init();
    return chatBox;
}
export default plugIn

