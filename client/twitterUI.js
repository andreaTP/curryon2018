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
  constructor (wsActor) {
    super("root")
    this.wsActor = wsActor
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
  postMount () {
    this.spawn(new TrackInput(this.wsActor))
  }
  receive (msg) {
    this.update(msg)
  }
}

class TwitterSocket extends ConnectedChannel {
  operative (msg) {
    if (msg && msg.from && msg.text) { // is a tweet
      ui.tell(msg)
    } else {
      this.channel.tell(msg)
    }
  }
}

const proxy = system.spawn(new WorkerProxy())

const wsActor = system.spawn(new TwitterSocket(proxy, "socket"))

const ui = system.spawn(new TwitterUiActor(wsActor))

export { localPort } from "akkajs-dom/work"
