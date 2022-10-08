// eslint-disable-next-line max-len
// FRom https://github.com/hKaspy/joystick-linux/blob/08ac344d92350e82ee62777ee5902abce16e63e3/src/parseEvent.js
// Linux Kernel Joystick API Docs:
// https://www.kernel.org/doc/Documentation/input/joystick-api.txt

const JS_EVENT_TYPE = {
  // button pressed/released
  JS_EVENT_BUTTON: 0x01,
  // joystick moved
  JS_EVENT_AXIS: 0x02,
  // initial state of device (bitwise mixed with BUTTON/AXIS)
  JS_EVENT_INIT: 0x80
}

function getEvType (typeNo) {
  if ((typeNo & JS_EVENT_TYPE.JS_EVENT_AXIS) === JS_EVENT_TYPE.JS_EVENT_AXIS) {
    // joystick moved
    return 'AXIS'
  }

  if ((typeNo & JS_EVENT_TYPE.JS_EVENT_BUTTON) === JS_EVENT_TYPE.JS_EVENT_BUTTON) {
    // button pressed/released
    return 'BUTTON'
  }

  return 'unknown'
}

function parseEvent (buff) {
  const time = buff.readUInt32LE(0)
  const value = buff.readInt16LE(4)
  const typeNo = buff.readUInt8(6)
  const number = buff.readUInt8(7)

  const type = getEvType(typeNo)

  const isInitial = ((typeNo & JS_EVENT_TYPE.JS_EVENT_INIT) === JS_EVENT_TYPE.JS_EVENT_INIT)

  return {
    isInitial,
    number,
    time,
    type,
    value
  }
}

export default parseEvent
