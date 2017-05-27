var path = require("path");
var webpack = require("webpack");

var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var isProd = process.env.npm_lifecycle_event == 'build';

module.exports = function () {
    var config = {};

    if (isProd) config.devtool = 'source-map';
    else config.devtool = 'eval-source-map';

    config.entry = {
        polyfills: './web/polyfills.ts',
        vendor: './web/vendor.ts',
        app: './web/main.ts'
    };

    config.output = {
        path: root('web-dist'),
        publicPath: isProd ? '/' : 'http://localhost:8080',
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
                loaders: ['awesome-typescript-loader', 'angular2-template-loader', '@angularclass/hmr-loader'],
                exclude: [/node_modules\/(?!(ng2-.+))/]
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=fonts/[name].[hash].[ext]?'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.css$/,
                exclude: root('web', 'app'),
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader', 'postcss-loader']})
            },
            {
                test: /\.css$/,
                include: root('web', 'app'), loader: 'raw-loader!postcss-loader'
            },
            {
                test: /\.(scss|sass)$/,
                exclude: root('web', 'app'),
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'sass-loader']
                })
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
        ), new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: false,
                    failOnHint: false
                },
                sassLoader: {
                    //includePaths: [path.resolve(__dirname, "node_modules/foundation-sites/scss")]
                },
                postcss: [
                    autoprefixer({
                        browsers: ['last 2 version']
                    })
                ]
            }
        }),
        new CommonsChunkPlugin({
            name: ['vendor', 'polyfills']
        }), new HtmlWebpackPlugin({
            template: './web/public/index.html',
            chunksSortMode: 'dependency'
        }),
        new ExtractTextPlugin({filename: 'css/[name].[hash].css', disable: !isProd})
    ];

    if (isProd) {
        config.plugins.push(
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.optimize.UglifyJsPlugin({sourceMap: true, mangle: {keep_fnames: true}}),
            new CopyWebpackPlugin([{
                from: root('web/public')
            }])
        );
    }

    config.devServer = {
        contentBase: './web/public',
        historyApiFallback: true,
        quiet: true,
        stats: 'minimal',
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