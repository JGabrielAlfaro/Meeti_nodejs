const path = require("path")
const webpack = require("webpack")

module.exports = {
    entry: {
        app: './public/js/app.js',  // Primera entrada
        meeti: './public/js/meeti.js' // Segunda entrada
    },
    output: {
        filename: '[name].bundle.js', // Esto generará app.bundle.js y meeti.bundle.js
        path: path.join(__dirname, "./public/dist")
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};