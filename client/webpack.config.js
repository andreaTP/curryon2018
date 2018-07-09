const path = require("path")
module.exports = {
  entry: {
    main: "./main.js",
    twitterUI: "./twitterUI.js",
    twitterSocket: "./twitterSocket.js"
  },
  output: {
    path: path.join(__dirname, "js"),
    filename: "[name].out.js",
    chunkFilename: "[id].chunk.js"
  },
  resolve: {
    alias: {
      akkajs: path.resolve("./node_modules/akkajs")
    }
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  }
}
