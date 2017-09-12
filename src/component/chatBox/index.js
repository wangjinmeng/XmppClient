/**
 * Created by wangjinmeng on 2017/9/8.
 */
import $ from 'jquery';
import chatBoxItem from '../chatBoxItem/index';
import util from '../../plugin/util/util'
import tt from '../../img/tt.jpg'
function getNode(){
    let nodeStr=`<div class="xmpp-chat-box pr xmpp-box-shadow js-xmpp-chat-box" >
                    <ul class="xmpp-chat-box-slider js-xmpp-chat-box-slider"></ul>
                    <div class="js-xmpp-chat-box-main xmpp-chat-box-main"></div>
                </div>`;
    return $(nodeStr)
}
function getSlideNode(name,domId){
    let nodeStr=`        
        <li class="xmpp-chat-box-slider-item js-xmpp-chat-box-slider-item" data-href="${domId}" id="${domId}-nav">
            <img class="tt" src="${tt}">
            <span class="name">${name}</span>
            <span class="num js-xmpp-chat-box-slider-item-num hidden"></span>
            <span class="close js-xmpp-chat-box-slider-item-close">&times;</span>
        </li>
    `;
    return $(nodeStr)
}
function idToDomId(id){
    var _res=id.replace('@','-')
            .replace(/\./g,'-');
    return _res;
}
let ChatBox=function () {
    this.$node=null;
    this.$event=$('<div></div>')
    this.popup=null;
    this.chatBoxItemsCache={};
    this.openStatus=false;//当前盒子是否打开
    this.singlePattern=true;//判断当前是否只有一个对话框
    this.activeItemId=null;//当前显示的id
};
ChatBox.prototype.init=function () {
    let _this=this;
    _this.$node=getNode();
    _this.popup=util.popup(_this.$node);
};
ChatBox.prototype.initChatBoxItem=function (name,id) {
    var _this=this;
    var domId=idToDomId(id)
    var _chatBoxItem=chatBoxItem(name,id);
    var _slideNavNode=getSlideNode(name,domId);
    _slideNavNode.on('click',function(){
        _this.chatBoxItemsCache[id].show();
    });
    _slideNavNode.find('.js-xmpp-chat-box-slider-item-close').on('click',function(){
        _this.chatBoxItemsCache[id].close();
        return false
    });
    this.chatBoxItemsCache[id]={
        boxNode:_chatBoxItem.$node,
        navNode:_slideNavNode,
        main:_chatBoxItem,
        show:function(){
            //将节点添加到页面
            if(!this.pattern){
                this.pattern=true;
                _this.$node.find('.js-xmpp-chat-box-main').append(this.boxNode);
                _this.$node.find('.js-xmpp-chat-box-slider').append(this.navNode);
            }
            this.boxNode.removeClass('hidden').siblings().addClass('hidden');
            this.navNode.addClass('cur').siblings().removeClass('cur');
            _this.activeItemId=id;
            this.main.scrollToBottom();
            _slideNavNode.find('.js-xmpp-chat-box-slider-item-num').addClass('hidden').html(0);
        },
        close:function () {
            this.pattern=false;
            this.navNode.detach();
            this.boxNode.detach();
            if(_this.singlePattern){
                _this.close();
            }else{
                _this.$node.find('.js-xmpp-chat-box-slider-item').click();
            }
            _this.togglePattern();
        },
        pattern:false//状态，是否从对话框中关闭:false,开启:true
    };
    //关闭单个对话框
    _chatBoxItem.addHandler('xmppChatBoxItemClose',function (data) {

        _this.chatBoxItemsCache[data.id].close();
    });
    //发送消息
    _chatBoxItem.addHandler('xmppChatBoxItemSendMsg',function (data) {
        _this.$event.trigger('xmppChatBoxSendMsg',data)
    });
    //查看历史消息
    _chatBoxItem.addHandler('xmppChatBoxItemQueryHistory',function (data) {
        _this.$event.trigger('xmppChatBoxQueryHistory',data)
    });
    // 输入框获得焦点
    _chatBoxItem.addHandler('xmppChatBoxItemFocus',function (data) {
        _this.$event.trigger('xmppChatBoxFocus',data)
    });
    // 输入框失去焦点
    _chatBoxItem.addHandler('xmppChatBoxItemBlur',function (data) {
        _this.$event.trigger('xmppChatBoxBlur',data)
    });
};
ChatBox.prototype.showItem=function (name,id) {
    var _this=this;
    if(!_this.chatBoxItemsCache[id]){
        _this.initChatBoxItem(name,id);
    }
    this.chatBoxItemsCache[id].show();
    if(!_this.openStatus){
        _this.open();
    }
    _this.togglePattern();
//    判判断Item是否已经在 chatbox中，是：切换，否：判断是否已经初始化，是：添加到chatbox中，否：初始化在 添加到chatbox中 =》切换
//    执行togglePattern 切换盒子的状态
};
ChatBox.prototype.open=function () {
    this.openStatus=true;
    this.popup.open()
};
ChatBox.prototype.close=function () {
    this.activeItemId='';
    this.openStatus=false;
    this.popup.hide();
};
ChatBox.prototype.togglePattern=function () {
    if(this.$node.find('.js-xmpp-chat-box-item').length>1){
        this.singlePattern=false;
        this.$node.addClass('chat-multiple-box');
    }else{
        this.singlePattern=true;
        this.$node.removeClass('chat-multiple-box');
    }
};
ChatBox.prototype.addHandler=function (eventName,fn) {
    this.$event.on(eventName,function (evt,data) {
        if($.isFunction(fn)){
            fn(data);
        }
    })
};
//收到消息
ChatBox.prototype.receiveMsg=function (name,id,data) {
    let _this=this;
    if(!_this.chatBoxItemsCache[id]){
        _this.initChatBoxItem(name,id);
    }
    let _chatBoxItem=_this.chatBoxItemsCache[id];
    _chatBoxItem.main.handleMsgDom(data.msg,data.time);
    if(_this.activeItemId===id){
        _chatBoxItem.main.scrollToBottom();
    }else{
        if(_chatBoxItem.pattern){
            let _chatBoxItemNavNodeNum=_chatBoxItem.navNode.find('.js-xmpp-chat-box-slider-item-num');
            var _num=parseInt(_chatBoxItemNavNodeNum.html())+1;
            _chatBoxItemNavNodeNum.removeClass('hidden').html(_num);
        }else{
            return false
        }
    }
    return true;
};
//展示正在输入状态
ChatBox.prototype.showStatus=function (id) {
    if(!this.chatBoxItemsCache[id]){
        return;
    }
    this.chatBoxItemsCache[id].main.showStatus()
};
//收起正在输入状态
ChatBox.prototype.hideStatus=function (id) {
    if(!this.chatBoxItemsCache[id]){
        return;
    }
    this.chatBoxItemsCache[id].main.hideStatus()
};
//接受到历史消息
ChatBox.prototype.receiveHistroyMsg=function (name,id,data) {
    var _this=this;
    if(!_this.chatBoxItemsCache[id]){
        _this.initChatBoxItem(name,id);
    }
    let _chatBoxItem=_this.chatBoxItemsCache[id];
    _chatBoxItem.main.receiveHistroyMsg(data);
    if(_this.activeItemId===id){
        _chatBoxItem.main.scrollToBottom();
    }
};
function plugIn(){
    let chatBox=new ChatBox();
    chatBox.init();
    return chatBox;
}
export default plugIn

