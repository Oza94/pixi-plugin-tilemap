var HtmlWebpackPlugin = require("html-webpack-plugin");
var path = require("path");

module.exports = {
  entry: "./demo/index.js",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.png$/i,
        use: ["file-loader"],
      },
    ],
  },
  context: path.resolve(__dirname, ".."),
  plugins: [new HtmlWebpackPlugin()],
};
