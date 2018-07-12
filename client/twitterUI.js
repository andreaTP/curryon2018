/** @jsx h */
import * as h from "virtual-dom/h"
import { ActorSystem } from "akkajs"
import { DomActor, WorkerProxy, ConnectedChannel } from "akkajs-dom/work"

const domHandlers = require("./dom-handlers.js")

const system = ActorSystem.create()

class TrackInput extends DomActor {
  constructor (wsActor) {
    super()
    this.wsActor = wsActor
  }
  render () {
    return <input placeholder={"track"} />
  }
  events () {
    return { "keyup": domHandlers.getTrackValue }
  }
  receive (msg) {
    if (msg !== undefined) {
      this.wsActor.tell(msg)
    }
  }
}

class TwitterUiActor extends DomActor {
  constructor (proxy) {
    super("root")
    this.proxy = proxy
  }
  postMount () {
    const wsActor = this.spawn(new TwitterSocket(this.proxy, "socket"))
    this.spawn(new TrackInput(wsActor))
  }
  render (value) {
    let from = "finger crossed"
    let msg = "not yet arrived"
    if (value) {
      from = value.from
      msg = value.text
    }

    return <div className='box'>{[
      <h3 id={"from"}>{from}</h3>,
      <p id={"msg"}>{msg}</p>
    ]}</div>
  }
  receive (msg) {
    this.update(msg)
  }
}

class TwitterSocket extends ConnectedChannel {
  operative (msg) {
    if (msg && msg.from && msg.text) { // is a tweet
      this.parent().tell(msg)
    } else {
      this.channel.tell(msg)
    }
  }
}

const proxy = system.spawn(new WorkerProxy())

system.spawn(new TwitterUiActor(proxy))

export { localPort } from "akkajs-dom/work"
