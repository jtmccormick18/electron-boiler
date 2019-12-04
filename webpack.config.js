const webpack = require('webpack');
const path = require('path');
const fs=require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './app/index.js'
    },
    output: {
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, './public'),
        publicPath: '/'
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: require.resolve('babel-loader'),
            options: {
                // plugins: ['lodash'],
                presets: [
                    "@babel/preset-env",
                    "@babel/preset-react"
                ],
                plugins: [
                    [
                        "@babel/plugin-proposal-class-properties"
                    ]
                ],
            }
        }, {
            test: /\.css$/,
            loader: ['style-loader', 'css-loader?importLoaders=1&sourceMap', 'postcss-loader']
        }, {
            test: /\.(png|jpg|jpeg|gif|svg)$/,
            loader: 'file-loader?limit=8192&name=assets/[name].[ext]?[hash]'
        },{
            test:/\.(zip|shp)$/,
            loader:'file-loader?name=assets/gis/[name].[ext]?[hash]'
        }]
    },
    devServer: {
        historyApiFallback: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './app/index.ejs'
        }),
        new CopyWebpackPlugin([
            { from: './app/favicon.ico' },
            { from: './app/assets', to: 'assets' },
        ]),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
    ],
    devtool: 'eval',
    target: 'electron-main'

};
