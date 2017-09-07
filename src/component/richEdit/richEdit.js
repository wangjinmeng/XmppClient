/**
 * Created by Administrator on 2017/9/7.
 */
import './css/index.css'
import $ from 'jquery';
import qqFace from '../qqFace/qqFace';

var cacheData={
    count:parseInt(Math.random()*1000)
};
function getHtmlStr(count){
    let _htmlStr=`<div id="js-xmpp-rich-edit-${count}" class="xmpp-rich-edit">
                <div id="js-xmpp-rich-edit-tool" class="xmpp-rich-edit-tool">
                    <span class="js-qqface">表情</span>
                    <span class="js-bold">加粗</span>
                </div>
                <div id="js-xmpp-rich-edit-textarea-${count}" class="xmpp-rich-edit-textarea js-xmpp-rich-edit-textarea" contenteditable="true"></div>
            </div>`;
    return _htmlStr;
}
function setQQFace(){
    qqFace.subscribeEvent('selectImg',function (data) {
        document.execCommand('insetImage',false,data.src);
    })
}
function toggleBold() {
    document.execCommand('bold',false,null)
}
function init(options){
    var _count=cacheData.count++;
    var _htmlStr=getHtmlStr(_count);
    var $node=$(_htmlStr);
    var $textarea=$node.find('.js-xmpp-rich-edit-textarea');
    var $boldBtn= $node.find('.js-bold');
    $textarea.on('mouseup',function(){
        var _boldStatus=document.queryCommandState('bold');
        if(_boldStatus){
            $boldBtn.addClass('cur')
        }else{
            $boldBtn.removeClass('cur')
        }
    });
    options.container.append($node);
    $boldBtn.on('mousedown',function(e){
        document.execCommand('bold',false,null);
        $(this).toggleClass('cur');
        $textarea.focus();
        return false
    });
}
init({
    container:$('body')
});
// export default init;
