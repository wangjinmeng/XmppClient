/**
 * Created by Administrator on 2017/9/7.
 */
import $ from 'jquery';
import './style/qqFace.css'
const qqFaceLen=75;
function getNode(){
    var $node=$('<table class="xmpp-qq-face"></table>');
    for(var i=0;i<qqFaceLen/15;i++){
        var $tr=$('<tr></tr>');
        for(var j=0;j<15;j++){
            let imgUrl = require('file-loader?name=qqFace/[name].[ext]!./img/'+(i*15+j+1)+'.gif');
            $tr.append('<td><img class="js-xmpp-qq-face-item xmpp-qq-face-item" src="'+imgUrl+'"></td>')
        }
        $node.append($tr);
    }
    return $node;
}

$node.on('click','.js-xmpp-qq-face-item',function(){
    var imgSrc=$(this).prop('src');
    $eventHandle.trigger('selectImg',{src:imgSrc});
});
function subscribeEvent(eventName, fn) {
    $eventHandle.on(eventName, function(evt,data){
        fn(data);
    })
}
function init() {
    var $eventHandle=$('<div></div>');
    var $qqFaceNode=getNode();
    return {
        $node:$node,
        subscribeEvent:subscribeEvent
    }
}
export default {
    $node:$node,
    subscribeEvent:subscribeEvent
};

