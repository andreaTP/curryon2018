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
      for (let i in this.listeners) {
        this.listeners[i].tell(tweet)
      }
    })
  }
  postStop () {
    this.twitter.untrackAll()
  }
  receive (msg) {
    if (msg) {
      if (msg.subscribe) {
        this.listeners.push(msg.subscribe)
      } else if (msg.unsubscribe) {
        for (let i = 0; i < this.listeners.length; i++) {
          if (this.listeners[i].path() === msg.unsubscribe.path()) {
            this.listeners.splice(i, 1)
            break
          }
        }
      } else if (msg.track) {
        this.twitter.track(msg.track)
      }
    }
  }
}

class TwitterService extends Actor {
  constructor (ws, twitterListener) {
    super()
    this.ws = ws
    this.twitterListener = twitterListener
    this.preStart = this.preStart.bind(this)
    this.receive = this.receive.bind(this)
    this.topics = []
  }
  preStart () {
    this.twitterListener.tell({subscribe: this.self()})
    this.ws.on("message", (msg) => {
      this.topics.push(msg)
      this.twitterListener.tell({track: msg})
    })
    this.ws.on("close", () => {
      this.twitterListener.tell({unsubscribe: this.self()})
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
    system.spawn(new TwitterService(client.ws(), twitterListener))
  })
}

main()
  .catch(e => console.error(e))
