const path = require('path');

module.exports = {
    entry: './src/js/script.js',
    mode: 'production',
    output: {
        filename: 'js/script-old.js',
        chunkFilename: 'js/print-old.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
            }
        }]
    }
};