/**
 * Created by wangjinmeng on 2017/9/8.
 */
// import './css/index.css'
import $ from 'jquery';
import ChatBox from '../chatBox/index';
import util from '../../plugin/util/util'
let ttImg=require('../../img/tt.jpg');
function getNode(name){
    let nodeStr= `<div id="main-panel" class="xmpp-box  js-xmpp-chat-panel-box">
                    <div class=" xmpp-box-shadow contact-wp pr js-xmpp-chat-panel">
                        <div class="contact-tt" popup-header>
                            <div class="contact-tt-name js-name">${name}</div>
                            <select name="" class="contact-tt-status js-xmpp-chat-panel-change-status">
                                <option value="online">在线</option>
                                <option value="offline">离线</option>
                                <option value="away">离开</option>
                            </select>
                            <div class="contact-tt-handle">
                               <a class="xmpp-close-btn  js-xmpp-chat-panel-hide">&times;</a>
                            </div>
                        </div>
                        <div class="contact-cont">
                            <div class="contact-tab">
                                <a class="contact-tab-item active js-xmpp-chat-panel-contact-tab-item">会话</a>
                                <a class="contact-tab-item  js-xmpp-chat-panel-contact-tab-item">联系人</a>
                            </div>
                            <div>
                                <div class="contact-list js-xmpp-chat-panel-list js-xmpp-chat-panel-contact-chat-list ">
                                   <p class="contact-list-tip  js-xmpp-chat-panel-contact-chat-list-tip">暂无会话</p>
                                </div>
                                <div class="contact-list js-xmpp-chat-panel-list js-xmpp-chat-panel-contact-list hidden">
                                   <p class="contact-list-tip  js-xmpp-chat-panel-contact-list-tip">暂无联系人</p>
                                </div>
                            </div>
                            <!--<div class="contact-handle hidden">-->
                                <!--<a class="cursor-pointer js-xmpp-chat-panel-add-contact">+</a>-->
                            <!--</div>-->
                        </div>
                    </div>
                </div>`;
    return $(nodeStr)
}
function getContactNode(name,id,img,sub) {
    let tipMsg='';
    if(sub=='none'||!sub){
        tipMsg='<span class="js-check">等待对方审核</span>'
    }
    let nodeStr=`<div class="contact-list-item js-contact-items offline" data-jid="${id}" data-name="${name}">
                   <img class="tt" src="${img}"/>
                   <span class="name">${name}${tipMsg}</span>
                   <span class="del js-del">&times;</span>
                </div>`;
    return $(nodeStr)
}
function getChatNode(name,id) {
    let nodeStr=`<div class="contact-list-item js-contact-items offline js-chat-items" data-jid="${id}" data-name="${name}">
                   <img class="tt" src="${ttImg}"/>
                   <span class="name">${name}</span>
                   <span class="num js-num" style="display: none">0</span>
                   <span class="del js-del">&times;</span>
                </div>`;
    return $(nodeStr)
}
function addContactPopup(callback){
    let _$popup=$(`
            <div class="chat-tip-box xmpp-box-shadow">
            <div class="chat-tip-tt" popup-header>
                    添加好友
                <a class="chat-tip-tt-handle" popup-close><span class="xmpp-close-btn">&times;</span></a>
            </div>
            <div class="chat-tip-cont">
            <div class="form-box">
                <label class="form-name">名称</label>
                <input class="form-input js-xmpp-chat-panel-add-contact-name" type="text">
            </div>
            </div>
            <div class="chat-tip-handle">
                <a class="js-xmpp-chat-panel-add-contact-btn xmpp-button xmpp-button-main chat-tip-btn">确定</a>
            </div>
            </div>`);
    _$popup.find('.js-xmpp-chat-panel-add-contact-btn').on('click',function(){
        var _name=$.trim(_$popup.find('.js-xmpp-chat-panel-add-contact-name').val());
        if(!_name){
            util.toast('请填写完整');
            return
        }
        if($.isFunction(callback)){
            callback(_name);
        }
    });
    return util.popup(_$popup);
    // Gab.addContactPopups.open();
}
/**
 *
 * @param name
 * @param id
 * @constructor
 * @event
 * xmppChatMainPanelHide:隐藏面板
 * xmppChatMainPanelAddContact:添加联系人按钮
 * xmppChatMainPanelChangeStatus:改变状态
 */
let ChatMainPanel=function (name,id) {
    this.$node=null;
    this.name=name;
    this.id=id;
    this.$event=$('<div></div>');
    this.contactListCache=[];
    this.chatListCache=[];
    this.popup=null;
    this.chatBox=null;
    this.addContactPopup=null;
    this.unReadMsg=0;
};
//传入消息增减数量
ChatMainPanel.prototype.changeTotalUnReadMsg=function (before,afer) {
    this.unReadMsg-=before;
    this.unReadMsg+=afer;
    this.$event.trigger('xmppChatMainPanelChangeTotalUnReadMsg',{num:this.unReadMsg});
};
ChatMainPanel.prototype.init=function () {
    let _this=this;
    _this.chatBox=ChatBox();
    _this.$node=getNode(_this.name,_this.id);
    _this.$node.find('.js-xmpp-chat-panel-hide').on('click',function(){
        _this.hide();
        _this.$event.trigger('xmppChatMainPanelHide',{id:_this.id});
    });
    _this.$node.find('.js-xmpp-chat-panel-add-contact').on('click',function(){
        _this.addContactPopup=addContactPopup(function(name){
            _this.$event.trigger('xmppChatMainPanelAddContact',{id:_this.id,name:name});
        });
        _this.addContactPopup.open();
    });
    _this.$node.find('.js-xmpp-chat-panel-change-status').on('change',function () {
        let _statua=$(this).val();
        _this.$event.trigger('xmppChatMainPanelChangeStatus',{status:_statua,id:_this.id});
        return false;
    });
    _this.$node.find('.js-xmpp-chat-panel-contact-tab-item').on('click',function () {
        var _index=$(this).index();
        if($(this).hasClass('active')) return;
        $(this).addClass('active').siblings().removeClass('active');
        _this.$node.find('.js-xmpp-chat-panel-list').addClass('hidden');
        _this.$node.find('.js-xmpp-chat-panel-list').eq(_index).removeClass('hidden');
        return false
    });
    _this.$node.on('click','.js-contact-items',function () {
        let _name=$(this).attr('data-name');
        let _id=$(this).attr('data-jid');
        _this.showItem(_name,_id);
        _this.changeChatItemUnReadMsgNum(_id,0);
        return false;
    });
    _this.popup=util.popup({
        content:_this.$node,
        position:'bottom right'
    });
//    发送消息
    _this.chatBox.addHandler('xmppChatBoxSendMsg',function (data) {
        _this.$event.trigger('xmppChatPanelSendMsg',data)
    });
//    发送获取正在输入消息
    _this.chatBox.addHandler('xmppChatBoxFocus',function (data) {
        _this.$event.trigger('xmppChatPanelFocus',data)
    });
//    发送取消正在输入消息
    _this.chatBox.addHandler('xmppChatBoxBlur',function (data) {
        _this.$event.trigger('xmppChatPanelBlur',data)
    });
    _this.chatBox.addHandler('xmppChatBoxQueryHistory',function (data) {
        _this.$event.trigger('xmppChatPanelQueryHistory',data)
    });
    _this.chatBox.addHandler('xmppChatBoxAdd',function (data) {
        _this.$event.trigger('xmppChatPanelAdd',data)
    });
};
ChatMainPanel.prototype.show=function () {
    this.popup.open();
};
ChatMainPanel.prototype.hide=function () {
    this.popup.hide();
};
ChatMainPanel.prototype.showItem=function (name,id) {
    var _flag=false;
    if(this.contactListCache[id]){
        _flag=true
    }
    this.chatBox.showItem(name,id,_flag);
};
ChatMainPanel.prototype.addContact=function (name,id,img,sub) {
    let _this=this;
    if(_this.contactListCache[id]){return false}
    let _$contactNode=getContactNode(name,id,img,sub);
    _$contactNode.find('.js-del').on('click',function(){
        _this.$event.trigger('xmppMainPanelDelContace',{id:id});
        return false;
    });
    _this.contactListCache[id]=_$contactNode;
    _this.$node.find('.js-xmpp-chat-panel-contact-list-tip').addClass('hidden');
    _this.$node.find('.js-xmpp-chat-panel-contact-list').append(_$contactNode);
    return true
};
ChatMainPanel.prototype.addChatItem=function (name,id) {
    // 添加会话
    let _this=this;
    if(_this.chatListCache[id]){return false}
    let _$chatNode=getChatNode(name,id);
    _$chatNode.find('.js-del').on('click',function () {
        _this.$event.trigger('xmppChatMainPanelDelChatItem',{jid:id})
    });
    _this.chatListCache[id]={
        unReadMsg:0,
        $node:_$chatNode
    };
    _this.$node.find('.js-xmpp-chat-panel-contact-chat-list-tip').addClass('hidden');
    _this.$node.find('.js-xmpp-chat-panel-contact-chat-list').append(_$chatNode);
    return true
};
ChatMainPanel.prototype.delChatItem=function (id) {
    //删除会话
    let _this=this;
    let _$chatItem=_this.chatListCache[id];
    if(!_$chatItem) return;
    _$chatItem.$node.remove();
    _this.chatListCache[id]=null;
    if(this.$node.find('.js-chat-items').length==0){
        this.$node.find('.js-xmpp-chat-panel-contact-chat-list-tip').removeClass('hidden');
    }
};
ChatMainPanel.prototype.changeChatItemUnReadMsgNum=function (id,num) {
    let _chatItem=this.chatListCache[id];
    if(!_chatItem) return false;
    this.changeTotalUnReadMsg(_chatItem.unReadMsg,num);
    _chatItem.unReadMsg=num;
    let _$chatItemNode=_chatItem.$node.find('.js-num');
    _$chatItemNode.html(num);
    if(num==0){
        _$chatItemNode.hide();
    }else{
        _$chatItemNode.show();
    }

    return true
};

ChatMainPanel.prototype.delContact=function (id) {
    var _this=this;
    var _$contactItem=this.contactListCache[id];
    if(!_$contactItem) return;
    _$contactItem.remove();
    this.contactListCache[id]=null;
    if(this.$node.find('.js-contact-items').length==0){
        this.$node.find('.js-xmpp-chat-panel-contact-list-tip').removeClass('hidden');
    }
};
//status: offline/away/online
ChatMainPanel.prototype.changeContactStatus=function (id,status) {
    let _$contactItem=this.contactListCache[id];
    let _$chatItem=this.chatListCache[id];
    _$contactItem.removeClass('offline').removeClass('away').removeClass('online').addClass(status);
    _$chatItem.$node.removeClass('offline').removeClass('away').removeClass('online').addClass(status);
};

ChatMainPanel.prototype.receiveMsg=function (name,id,data) {
    let _res=this.chatBox.receiveMsg(name,id,data,this.contactListCache[id]?true:false);//false 表示盒子未显示 true表示盒子已经显示
    if(!this.chatListCache[id]){
        this.addChatItem(name,id);
    }
    let _num=0;
    if(!_res){
        _num=this.chatListCache[id].unReadMsg+1;
    }
    this.changeChatItemUnReadMsgNum(id,_num)
};
ChatMainPanel.prototype.receiveHistroyMsg=function (name,id,data) {
    this.chatBox.receiveHistroyMsg(name,id,data);
};
ChatMainPanel.prototype.changeSelfStatus=function (status) {
    this.$node.find('.js-xmpp-chat-panel-change-status').val(status);
};
//展示正在输入状态
ChatMainPanel.prototype.showStatus=function (id) {
    this.chatBox.showStatus(id)
};
//收起正在输入状态
ChatMainPanel.prototype.hideStatus=function (id) {
    this.chatBox.hideStatus(id)
};
ChatMainPanel.prototype.addHandler=function (eventName,fn) {
    this.$event.on(eventName,function (evt,data) {
        if($.isFunction(fn)){
            fn(data);
        }
    })
};
function plugIn(name,id){
    var chatMainPanel=new ChatMainPanel(name,id);
    chatMainPanel.init();
    return chatMainPanel
}
export default plugIn

