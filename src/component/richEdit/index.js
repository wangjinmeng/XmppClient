/**
 * Created by Administrator on 2017/9/7.
 */
import './css/index.css'
import $ from 'jquery';
import qqFace from '../qqFace/index';
let cacheData={
    count:parseInt(Math.random()*1000)
};
function getHtmlNode(count){
    let $htmlNode=$(`<div id="js-xmpp-rich-edit-${count}" class="xmpp-rich-edit">
                <ul id="js-xmpp-rich-edit-tool" class="xmpp-rich-edit-tool">
                    <li class=" xmpp-rich-edit-tool-item-box pr">
                        <a class="js-xmpp-rich-edit-qq-face-btn  xmpp-rich-edit-tool-item">表情</a>
                        <div class="js-xmpp-rich-edit-qq-face-box xmpp-rich-edit-qq-face-box" style="display: none;"></div>
                    </li>
                    <li class="xmpp-rich-edit-tool-item-box">
                        <a class="js-xmpp-rich-edit-bold xmpp-rich-edit-tool-item">加粗</a>
                    </li>
                    <li class="fr">
                        <span class="js-xmpp-rich-edit-limit xmpp-rich-edit-text-num"></span>
                    </li>
                </ul>
                <div composing="false" id="js-xmpp-rich-edit-textarea-${count}" class="xmpp-rich-edit-textarea js-xmpp-rich-edit-textarea" contenteditable="true"></div>
            </div>`);
    return $htmlNode;
}
/**
 *
 * @constructor
 * @event:
 * xmppRichEditFocus:获得焦点
 * xmppRichEditBlur:失去焦点
 */
let RichEdit=function () {
    this.$node=null;
    this.qqFace=null;
    this.$textarea=null;
    this.$event=$('<div></div>');
};
RichEdit.prototype.init =function () {
    let _this=this;
    _this.$node=getHtmlNode(cacheData.count++);
    _this.qqFace=qqFace();
    _this.$node.find('.js-xmpp-rich-edit-qq-face-box').append(_this.qqFace.$node);
    _this.$textarea= _this.$node.find('.js-xmpp-rich-edit-textarea');
    _this.$boldBtn= _this.$node.find('.js-xmpp-rich-edit-bold');
    _this.$qqFaceBtn= _this.$node.find('.js-xmpp-rich-edit-qq-face-btn');
    _this.$textarea.on('mouseup',function(){
        var _boldStatus=document.queryCommandState('bold');
        if(_boldStatus){
            _this.$boldBtn.addClass('cur')
        }else{
            _this.$boldBtn.removeClass('cur')
        }
    });
    _this.$textarea.on('focus',function(){
        var _composing=$(this).attr('composing');
        if(_composing=='false'){
            $(this).attr('composing',true);
            _this.$event.trigger('xmppRichEditFocus');
        }
    }).on('blur',function(){
        $(this).attr('composing',false);
        _this.$event.trigger('xmppRichEditBlur');
    });
    _this.$qqFaceBtn.on('mousedown',function(){
        _this.$node.find('.js-xmpp-rich-edit-qq-face-box').toggle();
        return false
    });
    $(document).on('mousedown',function(){
        _this.$node.find('.js-xmpp-rich-edit-qq-face-box').hide();
    });
    _this.$boldBtn.on('mousedown',function(){
        document.execCommand('bold',false,null);
        $(this).toggleClass('cur');
        _this.$textarea.focus();
        return false
    });
    _this.qqFace.addHandle('qqFaceClickItem',function (data) {
        let _src=data.src;
        _this.$textarea.focus();
        document.execCommand('insertImage',false,_src);
        _this.$node.find('.js-xmpp-rich-edit-qq-face-box').toggle();
        return false
    });
    _this.$textarea.on('keyup',function(e){
        var _textNum=$(this).text().length;
        var _numText='共'+_textNum+'字';
        if(_textNum==0){
            _numText='';
        }
        _this.$node.find('.js-xmpp-rich-edit-limit').text(_numText);
    });
};
RichEdit.prototype.getText=function () {
    return this.$textarea.html();
};
RichEdit.prototype.resetTextArea=function () {
    this.$node.find('.js-xmpp-rich-edit-limit').text('');
    this.$textarea.html('');
};
RichEdit.prototype.addHandle=function (eventName,fn) {
    let _this=this;
    _this.$event.on(eventName,function (evt,data) {
        if($.isFunction(fn)){
            fn(data)
        }
    })
};
function plugIn(){
    var _richEdit=new RichEdit();
    _richEdit.init();
    return _richEdit;
}
export default plugIn;
