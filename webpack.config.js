/**
 * Created by Administrator on 2017/9/5.
 */

var CleanWebpackPlugin = require("clean-webpack-plugin");

var HtmlWebpackPlugin = require('html-webpack-plugin');

var publicPath = "";
var devtool = "eval-source-map";

//注意配置的变量值是否有空白字符
if(process.env.NODE_ENV == "production"){
    publicPath = "//192.168.3.28/im/";
    devtool = "";
}


module.exports = {
    entry: __dirname+"/src/main.js",
    devtool:devtool,
    output: {
        path: __dirname+'/dist',
        filename: "index.js",
        publicPath:publicPath
    },
    module: {
        loaders:[
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader?minimize=false' ]
            },
            {
                test:/\.js$/,
                exclude:/node_modules/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:['es2015']
                    }
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
                exclude:/qqFace/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(["dist/*"], {
            root:__dirname,
            verbose:true,
            dry:false
        }),
        new HtmlWebpackPlugin({
            template:'./src/index.html'
        })
    ],
    externals:{
        jquery:"window.jQuery"
    }
};