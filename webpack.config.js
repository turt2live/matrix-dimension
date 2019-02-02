const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProd = process.env.npm_lifecycle_event.startsWith('build');

module.exports = function () {
    const config = {};

    if (isProd) config.devtool = 'source-map';
    else config.devtool = 'eval-source-map';

    config.entry = {
        polyfills: './web/polyfills.ts',
        vendor: './web/vendor.ts',
        app: './web/main.ts'
    };

    config.output = {
        path: path.join(root('build'), 'web'),
        publicPath: isProd ? '/' : '/', //http://0.0.0.0:8080',
        filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
        chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js'
    };

    config.resolve = {
        extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html'],
    };

    config.module = {
        rules: [
            {
                test: /\.ts$/,
                loaders: [{
                    loader: 'awesome-typescript-loader',
                    options: {
                        useCache: true,
                        useBabel: true,
                        babelOptions: {
                            babelrc: false,
                            presets: [
                                ["@babel/preset-env", {"targets": "last 2 versions, ie 11", "modules": false}]
                            ],
                        },
                        babelCore: "@babel/core",
                    },
                }, 'angular2-template-loader', '@angularclass/hmr-loader'],
                exclude: [/node_modules\/(?!(ng2-.+))/]
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=fonts/[name].[hash].[ext]?'
            },
            {
                test: /\.css$/,
                exclude: root('web', 'app'),
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {}
                    },
                    "css-loader",
                    "postcss-loader"
                ]
            },
            {
                test: /\.css$/,
                include: root('web', 'app'), loader: 'raw-loader!postcss-loader'
            },
            {
                test: /\.(scss|sass)$/,
                exclude: root('web', 'app'),
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {}
                    },
                    "css-loader",
                    "postcss-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.(scss|sass)$/,
                exclude: root('web', 'style'), loader: 'raw-loader!postcss-loader!sass-loader'
            },
            {
                test: /\.html$/, loader: 'raw-loader',
                exclude: root('web', 'public')
            },
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader'
            }
        ]
    };

    config.plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                ENV: JSON.stringify(process.env.npm_lifecycle_event)
            }
        }),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            root('./web') // location of your src
        ),
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: false,
                    failOnHint: false
                },
                sassLoader: {
                    //includePaths: [path.resolve(__dirname, "node_modules/foundation-sites/scss")]
                }
            }
        }),
        new HtmlWebpackPlugin({
            template: './web/public/index.html',
            chunksSortMode: 'dependency'
        }),
        new CopyWebpackPlugin([{
            from: root('web/public')
        }]),
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
        })
    ];

    config.devServer = {
        contentBase: './web/public',
        historyApiFallback: true,
        disableHostCheck: true,
        quiet: false,
        //stats: 'minimal',
        proxy: {
            '/api': {
                target: 'http://localhost:8184',
                secure: false
            }
        }
    };

    return config;
};

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}