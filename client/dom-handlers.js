
const getTrackValue = function (event) {
  event.preventDefault()
  if (event.keyCode === 13) {
    return event.srcElement.value
  }
}

module.exports = {
  getTrackValue
}
