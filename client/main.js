/** @jsx h */
const { UiManager } = require("akkajs-dom/page")

new UiManager(
  new Worker("./js/twitterUI.out.js"),
  {
    name: "twitter",
    handlers: require("./dom-handlers.js")
  }
)

new UiManager(
  new Worker("./js/twitterSocket.out.js"),
  { name: "socket" }
)
