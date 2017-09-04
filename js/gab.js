/**
 * Created by Administrator on 2017/8/31.
 */
var Gab={
    connection:null,
    pending_subscriber:null,
    addContactPopups:null,
    approvePopups:null,
    contactList:[],
    domain:'openfire.zhongqi.com',
    BOSH_SERVICE:"http://openfire.zhongqi.com:7070/http-bind/",
    on_roster:function (iq) {
        $(iq).find('item').each(function () {
            var $this=$(this);
            var jid=$this.attr('jid');
            var bareJid=Strophe.getBareJidFromJid(jid);
            var ask=$this.attr('ask');
            var subscription=$this.attr('subscription');
            if($.inArray(bareJid,Gab.contactList)==-1){
                Gab.contactList.push(bareJid);
            }
            var name=$(this).attr('name')||jid;
            if(ask=='subscribe'&&subscription=='none'){
                name+=' <span class="js-tip-msg">等待对方审核</span>';
            }
            var jid_id=Gab.jid_to_id(jid);
            var htmlStr=' ' +
                '<div class="contact-list-item js-contact-items offline"  id="'+jid_id+'" data-jid="'+jid+'" data-type="'+subscription+'">'+
                '   <img class="tt" src="./img/tt.jpg"/>'+
                '   <span class="name">'+name+'</span>'+
                '   <span class="del js-del">&times;</span>'+
                '</div>';
            var contact=$(htmlStr);
            if($('#'+jid_id).length==0){
                $('#js-contact-list').append(contact);
            }
        });
        Gab.connection.addHandler(Gab.on_presence,null,'presence');
        Gab.connection.send($pres());
    },
    on_presence:function(pre){
        var $pre=$(pre);
        var pType=$pre.attr('type');
        var from=$pre.attr('from');
        var myJid=Gab.connection.jid;
        var fromBareJid=Strophe.getBareJidFromJid(from);
        if(fromBareJid===Strophe.getBareJidFromJid(myJid)){
            if(pType=='unavailable'){
                console.log('您已掉线，请重新登录')
            }
            return true;
        }
        if(pType==='subscribe'){
            if($.inArray(fromBareJid,Gab.contactList)==-1){
                Gab.contactList.push(fromBareJid);
                Gab.pending_subscriber=fromBareJid;
                Gab.approvePopups=util.popup(
                    '<div class="chat-tip-box box-shadow">' +
                    '<div class="chat-tip-tt">好友请求</div>' +
                    '<div class="chat-tip-cont">' +
                    Strophe.getNodeFromJid(fromBareJid)+'请求加你为好友' +
                    '</div>' +
                    '<div class="chat-tip-handle">' +
                        '<a id="js-approve-btn-submit" class="button button-main chat-tip-btn ">接受</a>'+
                        '<a id="js-approve-btn-close"  class="button button-default  chat-tip-btn ">拒绝</a>'+
                    '</div>'+
                    '</div>'
                );
                Gab.approvePopups.open();
            }else{
                var dataType=$('#'+Gab.jid_to_id(fromBareJid)).attr('data-type');
                if(dataType!='both'||dataType!='to'){
                    Gab.connection.send($pres({to:fromBareJid,'type':'subscribed'}));
                }
            }
        }else if(pType==='subscribed'){
            if($.inArray(fromBareJid,Gab.contactList)==-1){
                Gab.contactList.push(fromBareJid);
            }
            var dataType=$('#'+Gab.jid_to_id(fromBareJid)).attr('data-type');
            if(dataType=='none'){
                Gab.tipMsg(Strophe.getNodeFromJid(from)+'通过了您的好友申请');
                $('#'+Gab.jid_to_id(fromBareJid)).find('.js-tip-msg').remove();
            }
        }else if(pType==='unsubscribed'){
            var arrIndex=$.inArray(fromBareJid,Gab.contactList)
            if(arrIndex!=-1){
                Gab.contactList.splice(arrIndex, 1);
            }
            Gab.tipMsg(Strophe.getNodeFromJid(from)+'拒绝了您的好友申请');
            $('#'+Gab.jid_to_id(fromBareJid)).remove();
        }else if(pType!=='error'){
            var contact=$('#'+Gab.jid_to_id(from))
                .removeClass('online')
                .removeClass('away')
                .removeClass('offline');
            if(pType=='unavailable'){
                contact.addClass('offline');
            }else{
                var show=$pre.find('show').text();
                if(show===''||show==='chat'){
                    contact.addClass('online');
                }else{
                    contact.addClass('away');
                }
            }
        }
        var jid_id=Gab.jid_to_id(from);
        $('#chat-'+jid_id).attr('jid',Strophe.getBareJidFromJid(from));
        return true
    },
    on_message:function (msg) {
        var _$msg=$(msg);
        var full_jid=_$msg.attr('from');
        var jid=Strophe.getBareJidFromJid(full_jid);
        var name=Strophe.getNodeFromJid(jid);
        var jid_id=Gab.jid_to_id(jid);
        var composing=_$msg.find('composing').length;
        var msg=_$msg.find('body').text();
        var time=tool.dealTime(new Date())
        if(msg){
            Gab.storeMsg.push(jid,{
                type:'receive',
                msg:msg,
                time:time
            })
        }
        chatBox.receiveMsg(jid_id,full_jid,name,time,msg,composing>0?true:false);
        return true;
    },
    jid_to_id:function(jid){
        var _res=Strophe.getBareJidFromJid(jid)
            .replace('@','-')
            .replace(/\./g,'-');
        return _res;
    },
    on_roster_changed:function (iq) {
        var $iq=$(iq);
        $iq.find('item').each(function () {
            var sub=$(this).attr('subscription');
            var jid=$(this).attr('jid');
            var bareJid=Strophe.getBareJidFromJid(jid);
            var name=$(this).attr('name')||jid;
            var jid_id=Gab.jid_to_id(jid);
            var arrIndex=$.inArray(bareJid,Gab.contactList);
            if(sub==='remove'){
                if(arrIndex!=-1){
                    Gab.contactList.splice(arrIndex,1);
                }
                $('#'+jid_id).remove();
            }else{
                if(arrIndex==-1){
                    arrIndex.push(bareJid);
                }
                if($('#'+jid_id).length==0){
                    if(sub=='none'){
                        name+=' <span class="js-tip-msg">等待对方审核</span>';
                    }
                    var contact_html=' ' +
                        '<div class="contact-list-item js-contact-items offline"  id="'+jid_id+'" data-jid="'+jid+'"  data-type="'+sub+'">'+
                        '   <img class="tt" src="./img/tt.jpg"/>'+
                        '   <span class="name">'+name+'</span>'+
                        '   <span class="del js-del">&times;</span>'+
                        '</div>';
                    $('#js-contact-list').append(contact_html);
                }
            }
        });
        return true;
    },
    tipMsg:function (str){
        var tipMsg='<span class="tip-msg">'+str+'</span>';
        var _popup=util.popup(tipMsg);
        _popup.open();
        setTimeout( _popup.close,1500)
    },
    storeMsg:{
        maxLen:500,
        push:function(jid,data){
            var localData=this.get(jid);
            if(localData.constructor!=Array){
                localData=[]
            }
            if(localData.length>this.maxLen){
                localData.splice(0,1)
            }
            localData.push(data);
            window.localStorage[jid]=JSON.stringify(localData);
        },
        get:function(jid){
            var msg=window.localStorage[jid];
            if(!msg){
                return [];
            }
            return JSON.parse(msg);
        }
    }
};
$(document).ready(function(){
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
        $(document).trigger('connect',{
            jid:$('#js-jid').val()+'@'+Gab.domain,
            password:$('#js-password').val()
        });
        loginPopup.close();
    });



    $(document).on('click','#js-approve-btn-close',function () {
        Gab.connection.send($pres({
            to:Gab.pending_subscriber,
            'type':'unsubscribed'
        }));
        Gab.pending_subscriber=null;
        Gab.approvePopups.close();
    });
    $(document).on('click','#js-approve-btn-submit',function () {
        Gab.connection.send($pres({
            to:Gab.pending_subscriber,
            type:'subscribed'
        }));
        Gab.connection.send($pres({
            to:Gab.pending_subscriber,
            type:'subscribe'
        }));
        Gab.pending_subscriber=null;
        Gab.approvePopups.close();
    });
    $(document).on('click','.js-contact-items',function(){
        var _jid=$(this).attr('data-jid');
        var _jid_id=Gab.jid_to_id(_jid);
        chatBox.add(_jid_id,_jid,Strophe.getNodeFromJid(_jid));
    });
    $(document).on('change','#js-change-status',function(){
        var val=$(this).val();
        var _pre;
        if(val=='online'){
            _pre=$pres()
        }else if(val=='offline'){
            _pre=$pres({
                type:'unavailable'
            })
        }else if(val=='away'){
            _pre=$pres().c('show').t('away')
        }
        Gab.connection.send(_pre);
    });
    $(document).on('click','#js-add-contact',function(){
        if(!Gab.addContactPopups){
            Gab.addContactPopups=util.popup('' +
                '<div class="chat-tip-box box-shadow">' +
                    '<div class="chat-tip-tt">添加好友</div>' +
                    '<div class="chat-tip-cont">' +
                        '<div class="form-box">' +
                        '    <label class="form-name">名称</label>'+
                        '    <input class="form-input" type="text" id="js-add-contact-name">'+
                        '</div>' +
                    '</div>' +
                    '<div class="chat-tip-handle">' +
                        '<a id="js-add-contact-btn-submit" class="button button-main chat-tip-btn ">确定</a>'+
                        '<a id="js-add-contact-btn-close"  class="button button-default  chat-tip-btn ">关闭</a>'+
                    '</div>'+
                '</div>' );
        }
        Gab.addContactPopups.open();
    });
    $(document).on('click','#js-add-contact-btn-close',function () {
        $('#js-add-contact-name').val('');
        Gab.addContactPopups.hide();
    });
    $(document).on('click','#js-add-contact-btn-submit',function () {
        var $contactName=$('#js-add-contact-name');
        var _val=$contactName.val();
        if(!$.trim(_val)){
            $contactName.focus();
            return
        }
        $contactName.val('');
        $(document).trigger('contact_added',{
            name:_val
        });
        Gab.addContactPopups.hide();
    });
    $(document).on('click','.js-contact-items .js-del',function () {
        var jid=$(this).parent().attr('data-jid');
        $(document).trigger('contact_del',{jid:jid});
        return false;
    });
    chatBox.init();
    chatBox.subscribeEvent('inputKeyPress',function (ev,data) {
        var _jid=data.jid;
        var _eventType=data.eventVal;
        if(_eventType==1){
            var notify=$msg({
                to:_jid,
                type:'chat'
            }).c('composing',{xmlns:'http://jabber.org/protocol/chatstates'});
            Gab.connection.send(notify);
        }else if (_eventType==2){
            var message=$msg({
                to:_jid,
                'type':'chat'
            }).c('body').t(data.val).up()
                .c('active',{xmlns:'http://jabber.org/protocol/chatstates'});
            Gab.storeMsg.push(_jid,{
                type:'send',
                msg:data.val,
                time:tool.dealTime(new Date())
            });
            Gab.connection.send(message);
        }
    });
    chatBox.subscribeEvent('queryHistory',function (ev,data) {
        chatBox.receiveHistory(Gab.jid_to_id(data.jid),Gab.storeMsg.get(data.jid))
    });
});
$(document).bind('connect',function(ev,data){
    var conn=new Strophe.Connection(Gab.BOSH_SERVICE);
    conn.connect(data.jid,data.password,function (status) {
        if(status===Strophe.Status.CONNECTED){
            $(document).trigger('connected')
        }else if(status===Strophe.Status.DISCONNECTING){
            $(document).trigger('disconnected')
        }
    });
    Gab.connection=conn;
});
$(document).bind('connected',function(){
    $('#main-panel').removeClass('hidden');
    $('#roster-area').find('.js-name').text(Strophe.getNodeFromJid(Gab.connection.jid));
    var iq=$iq({type:'get'}).c('query',{xmlns:'jabber:iq:roster'});
    Gab.connection.sendIQ(iq,Gab.on_roster);
    Gab.connection.addHandler(Gab.on_message,null,'message');
    Gab.connection.addHandler(Gab.on_roster_changed,'jabber:iq:roster','iq','set');
});
$(document).bind('disconnected',function(){
    Gab.connection=null
});
$(document).bind('contact_added',function(ev,data){
    data.jid= data.name + '@'+Gab.domain;
    if($.inArray(data.jid,Gab.contactList)==-1){
        Gab.contactList.push( data.jid);
    }
    var iq=$iq({type:'set'}).c('query',{xmlns:'jabber:iq:roster'}).c('item',data);
    Gab.connection.sendIQ(iq);
    var subscribe=$pres({to:data.jid,'type':'subscribe'});
    Gab.connection.send(subscribe);
    Gab.tipMsg('发送成功,等待对方确认');
});
$(document).bind('contact_del',function (ev,data) {
    var arrIndex=$.inArray(data.jid,Gab.contactList);
    if(arrIndex!=-1){
        Gab.contactList.splice(arrIndex,1)
    }
    var iq=$iq({type:'set'}).c('query',{xmlns:'jabber:iq:roster'}).c('item',{
        jid:data.jid,
        subscription:'remove'
    });
    Gab.connection.sendIQ(iq,function(d){
        $('#'+Gab.jid_to_id(data.jid)).remove();
        Gab.tipMsg('已删除');
    });
});
