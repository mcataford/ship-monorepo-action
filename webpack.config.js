module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    output: {
        path: __dirname,
        filename: './lib/bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    target: 'node',
}
