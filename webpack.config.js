/**
 * Created by Administrator on 2017/9/5.
 */
var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: __dirname+"/src/main.js",
    devtool:"eval-source-map",
    output: {
        path: __dirname+'/dist',
        filename: "index.js",
        // publicPath:"//192.168.3.28/im/"
    },
    module: {
        loaders:[
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
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
    plugins: [new HtmlWebpackPlugin({
        template:'./src/index.html'
    })],
    externals:{
        jquery:"window.jQuery"
    }
};