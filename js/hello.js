/**
 * Created by Administrator on 2017/8/30.
 */
var Hello={
    connection:null,
    start_time:null,
    log:function(msg){
        $('#log').append('<p>'+msg+'</p>')
    },
    BOSH_SERVICE:"http://openfire.zhongqi.com:7070/http-bind/",
    send_pind:function(to){
        var ping=$iq({
            to:to,
            type:'get',
            id:'ping1'}).c('ping',{xmlns:'urn:xmpp:ping'});
        Hello.log('Sending ping to' +to+'.');
        Hello.start_time=(new Date()).getTime()
        Hello.connection.send(ping);
    },
    handle_pone:function (iq) {
        var elapsed=(new Date()).getTime()-Hello.start_time;
        Hello.log('Received pong from server in '+elapsed +'ms.')
        Hello.connection.disconnect();
        return false
    }
};
$(document).ready(function(){
    $('#login_dialog').dialog({
        autoOpen:true,
        draggable:false,
        modal:true,
        title:'Connect to XMPP',
        buttons:{
            'Connect':function () {
                $(document).trigger('connect',{
                    jid:$('#jid').val(),
                    password:$('#password').val()
                });
                $('#password').val('');
                $(this).dialog('close');
            }
        }
    })
});
$(document).bind('connect',function(ev,data){
    var conn=new Strophe.Connection(Hello.BOSH_SERVICE);
    conn.connect(data.jid,data.password,function (status) {
        if(status===Strophe.Status.CONNECTED){
            $(document).trigger('connected')
        }else if(status===Strophe.Status.DISCONNECTING){
            $(document).trigger('disconnected')
        }
    });
    Hello.connection=conn;
});
$(document).bind('connected',function(){
    Hello.log('连接成功');
    Hello.connection.addHandler(Hello.handle_pone,null,'iq',null,'ping1')
    var domain=Strophe.getDomainFromJid(Hello.connection.jid);
    Hello.send_pind(domain)
});
$(document).bind('disconnected',function(){
    Hello.log('连接失败');
    Hello.connection=null
});