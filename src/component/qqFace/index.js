/**
 * Created by Administrator on 2017/9/7.
 */
import $ from 'jquery';
import './style/main.css'
const qqFaceLen=75;
function getHtmlNode(){
    let $node=$('<table class="xmpp-qq-face"></table>');
    for(let i=0;i<qqFaceLen/15;i++){
        let $tr=$('<tr></tr>');
        for(let j=0;j<15;j++){
            let imgUrl = require('file-loader?name=qqFace/[name].[ext]!./img/'+(i*15+j+1)+'.gif');
            $tr.append('<td><img class="js-xmpp-qq-face-item xmpp-qq-face-item" src="'+imgUrl+'"></td>')
        }
        $node.append($tr);
    }
    return $node;
}
function QqFace(){
    this.$node=getHtmlNode();
    this.$event=$('<div></div>')
}
QqFace.prototype.init = function(){
    var _this=this;
    _this.$node.find('.xmpp-qq-face-item').on('mousedown',function(){
        var _src=$(this).attr('src');
        _this.$event.trigger('qqFaceClickItem',{src:_src});
        return false
    })
};
QqFace.prototype.show=function () {
    this.$node.slideUp()
};
QqFace.prototype.hide=function () {
    this.$node.slideDown()
};
QqFace.prototype.addHandle=function (eventName,fn) {
    let _this=this;
    _this.$event.on(eventName,function (evt,data) {
        if($.isFunction(fn)){
            fn(data)
        }
    })
};
function plugIn(){
    let _res=new QqFace();
    _res.init();
    return _res
}
export default plugIn;

