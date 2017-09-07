/**
 * Created by OJH on 2017/9/7.
 */

import { Strophe } from "strophe.js";

//连接状态翻译
const Status = Strophe.Status;
const statusMap = {

};
statusMap[Status.ERROR] = "发生了一个错误";
statusMap[Status.CONNECTING] = "当前正在连接";
statusMap[Status.CONNFAIL] = "连接请求失败";
statusMap[Status.AUTHENTICATING] = "连接进行身份验证";
statusMap[Status.AUTHFAIL] = "身份验证请求失败";
statusMap[Status.CONNECTED] = "连接成功";
statusMap[Status.DISCONNECTED] = "连接已终止";
statusMap[Status.DISCONNECTING] = "目前连接被终止";
statusMap[Status.ATTACHED] = "已附加的连接";
statusMap[Status.REDIRECT] = "连接被重定向";
statusMap[Status.CONNTIMEOUT] = "连接已超时";


export default statusMap;
