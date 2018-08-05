const LimitChunkCountPlugin = require("webpack/lib/optimize/LimitChunkCountPlugin");
const IgnorePlugin = require("webpack/lib/IgnorePlugin");
const NormalModuleWebpackReplacementPlugin = require("webpack/lib/NormalModuleReplacementPlugin");
const path = require("path");
const nls = require.resolve("./nls-replace.js");

module.exports = {
    entry: {
        "editor": "./index.js",
        "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
        "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
        "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
        "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
        "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
    },

    mode: "production",
    output: {
        globalObject: "this",
        path: path.resolve(__dirname, "..", "..", "target", "generated-sources", "npm"),
        filename: "[name].js",
        library: "monaco",
        libraryTarget: "this",
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        }]
    },
    plugins: [
        new NormalModuleWebpackReplacementPlugin(/\/(vscode\-)?nls\.js/, function(resource) {
            resource.request = nls;
            resource.resource = nls;
        }),
        // Ignore require() calls in vs/language/typescript/lib/typescriptServices.js
        new IgnorePlugin(
            /^((fs)|(path)|(os)|(crypto)|(source-map-support))$/,
            /vs(\/|\\)language(\/|\\)typescript(\/|\\)lib/
        ),
        new LimitChunkCountPlugin({
            maxChunks: 1,
        })
    ],
    optimization: {
        splitChunks: {
            minSize: 9999999999999999,
        },
    }
};
