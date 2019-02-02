const path = require('path');

module.exports = {
    entry: './src/js/script.js',
    mode: 'production',
    output: {
        filename: 'js/script.js',
        chunkFilename: 'js/print.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/
        }]
    }
};