const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        'index': './index.ts',
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.js
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "source", to: "dist" },
                { from: "other", to: "public" },
            ],
        }),
    ],
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    externals: [nodeExternals()],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './js'),
    }
};