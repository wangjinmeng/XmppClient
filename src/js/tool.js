/**
 * Created by Administrator on 2017/9/4.
 */
import $ from 'jquery';
var tool={
    dealTime:function (time,format){
        if(!(time instanceof Date)){
            console.error('time 参数必须是 Date类型');
            return
        }
        var _format='yy-MM-dd hh:mm:ss';
        if(format){
            _format=format;
        }
        var _y=time.getFullYear();
        var _M=time.getMonth()+1;
        var _d=time.getDate();
        var _h=time.getHours();
        var _m=time.getMinutes();
        var _s=time.getSeconds();
        return _format.replace('yy',_y)
            .replace('MM',_M)
            .replace('dd',_d)
            .replace('hh',_h)
            .replace('mm',_m)
            .replace('ss',_s)
    }
};
export default tool;