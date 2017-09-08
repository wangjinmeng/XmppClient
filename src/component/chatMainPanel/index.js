/**
 * Created by wangjinmeng on 2017/9/8.
 */
// import './css/index.css'
import $ from 'jquery';
import util from '../../plugin/util/util'
function getNode(name){
    let nodeStr= `<div id="main-panel" class="chat-main-box contact-main-box js-xmpp-chat-panel-box">
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
                            <div class="contact-list js-xmpp-chat-panel-contact-list"></div>
                            <div class="contact-handle">
                                <a class="cursor-pointer js-xmpp-chat-panel-add-contact">+</a>
                            </div>
                        </div>
                    </div>
                </div>`;
    return $(nodeStr)
}
function getContactNode(name,id,img) {
    let nodeStr=`<div class="contact-list-item js-contact-items offline" data-jid="${id}">
                   <img class="tt" src="${img}"/>
                   <span class="name">${name}</span>
                   <span class="del js-del">&times;</span>
                </div>`;
    return $(nodeStr)
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
    this.popup=null;
};
ChatMainPanel.prototype.init=function () {
    let _this=this;
    _this.$node=getNode(_this.name,_this.id);
    _this.$node.find('.js-xmpp-chat-panel-hide').on('click',function(){
        _this.hide();
        _this.$event.trigger('xmppChatMainPanelHide',{id:_this.id});
    });
    _this.$node.find('.js-xmpp-chat-panel-add-contact').on('click',function(){
        _this.$event.trigger('xmppChatMainPanelAddContact',{id:_this.id});
    });
    _this.$node.find('.js-xmpp-chat-panel-change-status').on('change',function () {
        let _statua=$(this).val();
        _this.$event.trigger('xmppChatMainPanelChangeStatus',{status:_statua,id:_this.id});
        return false;
    });
    _this.popup=util.popup({
        content:_this.$node,
        position:'bottom right'
    });
};
ChatMainPanel.prototype.show=function () {
    this.popup.open();
};
ChatMainPanel.prototype.hide=function () {
    this.popup.hide();
};
ChatMainPanel.prototype.addContact=function (name,id,img) {
    let _this=this;
    let _$contactNode=getContactNode(name,id,img);
    _$contactNode.find().on('click',function(){
        _this.$event.trigger('xmppMainPanelDelContace',{id:id});
    });
    _this.contactListCache[id]=_$contactNode;
    _this.$node.find('.js-xmpp-chat-panel-contact-list').append(_$contactNode);
};
ChatMainPanel.prototype.delContact=function (id) {
    var _$contactItem=this.contactListCache[id];
    if(!_$contactItem) return;
    _$contactItem.remove();
    this.contactListCache[id]=null;
};
//status: offline/away/online
ChatMainPanel.prototype.changeContactStatus=function (id,status) {
    let _$contactItem=this.contactListCache[id];
    _$contactItem.removeClass('offline').removeClass('away').removeClass('online').addClass(status);
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
window.cM=plugIn();
cM.show();
export default plugIn

