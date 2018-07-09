import { ActorSystem } from "akkajs"
import { WorkerProxy, ConnectedChannel } from "akkajs-dom/work"

const system = ActorSystem.create("socket")

const proxy = system.spawn(new WorkerProxy())

class TwitterChannel extends ConnectedChannel {
  postAvailable () {
    this.ws = new WebSocket("ws://localhost:9002")
    this.ws.onmessage = (event) => {
      const json = JSON.parse(event.data)
      this.channel.tell({
        from: json.user.name,
        text: json.text
      })
    }
  }
  operative (msg) {
    this.ws.send(msg)
  }
}

system.spawn(new TwitterChannel(proxy, "twitter"))

export { localPort } from "akkajs-dom/work"
