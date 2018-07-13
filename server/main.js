import * as fs from "fs"
import * as TwitterModule from "node-tweet-stream"
import { ActorSystem, Actor } from "akkajs"
import { Server } from "promise-ws"

const credentials =
  JSON.parse(fs.readFileSync(".credentials", "utf8"))

class TwitterListener extends Actor {
  constructor () {
    super()
    this.preStart = this.preStart.bind(this)
    this.postStop = this.postStop.bind(this)
    this.receive = this.receive.bind(this)
    this.listeners = []
  }
  preStart () {
    this.twitter = new TwitterModule(credentials)
    this.twitter.on("tweet", (tweet) => {
      const children = this.children()
      for (let i in children) {
        children[i].tell(tweet)
      }
    })
  }
  postStop () {
    this.twitter.untrackAll()
  }
  receive (msg) {
    if (msg) {
      if (msg.ws) {
        this.spawn(new TwitterService(msg.ws))
      } else if (msg.track) {
        this.twitter.track(msg.track)
      }
    }
  }
}

class TwitterService extends Actor {
  constructor (ws) {
    super()
    this.ws = ws
    this.preStart = this.preStart.bind(this)
    this.receive = this.receive.bind(this)
    this.topics = []
  }
  preStart () {
    this.ws.on("message", (msg) => {
      this.topics.push(msg)
      this.parent().tell({track: msg})
    })
    this.ws.on("close", () => {
      this.self().kill()
    })
  }
  receive (msg) {
    let contains = false
    for (let i in this.topics) {
      if (msg.text.includes(this.topics[i])) {
        contains = true
        break
      }
    }

    if (contains) {
      this.ws.send(JSON.stringify(msg))
    }
  }
}

const system = ActorSystem.create()

const twitterListener = system.spawn(new TwitterListener())

const main = async () => {
  const port = 9002
  const server = await Server.create({ port })

  server.onConnection((client) => {
    twitterListener.tell({ ws: client.ws() })
  })
}

main()
  .catch(e => console.error(e))
