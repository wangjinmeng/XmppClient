/**
 * Created by OJH on 2017/8/23.
 */

var LevelType = {
    fatal:0,
    error:1,
    info:2,
    warn:3,
    debug:4
};

var globalLogLevel = LevelType.debug;

function Logger(name, logLevel){
    if(this instanceof Logger){
        //标识名称
        this.name = name;
        if(logLevel != null){
            this.logLevel = logLevel;
        }

    }else{
        throw new Error("Please use the new  Logger object creation");
    }
}

Logger.prototype.logLevel = globalLogLevel;

/**
 * 普通消息
 * @param msg
 */
Logger.prototype.log = function(msg){
    if(this.logLevel >= LevelType.info){
        console.log("["+this.name+" log ] - " + msg);
    }

}


/**
 * 普通消息
 * @param msg
 */
Logger.prototype.info = function(msg){
    if(this.logLevel >= LevelType.info) {
        console.log("[" + this.name + " info ] - " + msg);
    }
}

/**
 * 调试信息
 * @param msg
 */
Logger.prototype.debug = function(msg){
    if(this.logLevel >= LevelType.debug){
        var debugInfo = "["+this.name+" debug ] - " + msg;
        if(console.debug != null){
            console.debug(debugInfo);
        }else{
            console.log(debugInfo);
        }

    }
}

/**
 * 错误信息
 * @param msg
 * @param e
 */
Logger.prototype.error= function(msg, e){
    if(this.logLevel >= LevelType.error) {
        console.error("[" + this.name + " error] - " + msg, (e ? e.stack : ""));
    }
}


/**
 * 警告级别日志
 * @param msg
 */
Logger.prototype.warn = function(msg){
    if(this.logLevel >= LevelType.warn) {
        var warnInfo = "[" + this.name + "  warn] - " + msg;
        if (console.warn != null) {
            console.warn(warnInfo);
        } else {
            console.log(warnInfo);
        }
    }

}


/**
 * 致命级别日志
 * @param msg
 */
Logger.prototype.fatal = function(msg){
    if(this.logLevel >= LevelType.fatal) {
        console.error("[" + this.name + " fatal] - " + msg);
    }
}

export {
    Logger,
    LevelType
};
