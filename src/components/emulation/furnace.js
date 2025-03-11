const replaceCharAt = (s, i, ch) => {
  return s.substring(0, i) + ch + s.substring(i + 1)
}

const tempToText = val_float => {
  const val = Math.round(val_float)
  return val < 10
    ? `000${val}`
    : val < 100
    ? `00${val}`
    : val < 1000
    ? `0${val}`
    : `${val}`
}
const timeToText = val => {
  const hours = Math.floor(val / 3600).toString()
  const mins = Math.floor((val - hours * 3600) / 60).toString()
  return `${hours < 10 ? '0' + hours : hours}.${mins < 10 ? '0' + mins : mins}`
}

const degFromDigit = (temp, i, up) => {
  let tempStr = tempToText(temp)
  const currDigit = parseInt(tempStr[3 - i])
  let changedDigit = currDigit + (up ? 1 : -1)
  if (changedDigit < 0) {
    changedDigit = 9
  } else if (changedDigit > 9) {
    changedDigit = 0
  }
  tempStr = replaceCharAt(tempStr, 3 - i, changedDigit.toString())
  return parseInt(tempStr)
}

const secsFromDigit = (secs, i, up) => {
  let HHmm = timeToText(secs).replace('.', '')
  const currDigit = parseInt(HHmm[3 - i])
  const maxVal = i === 1 ? 5 : 9
  let changedDigit = currDigit + (up ? 1 : -1)
  if (changedDigit < 0) {
    changedDigit = maxVal
  } else if (changedDigit > maxVal) {
    changedDigit = 0
  }
  HHmm = replaceCharAt(HHmm, 3 - i, changedDigit.toString())
  console.log(
    parseInt(HHmm.slice(0, 2)) * 3600 + parseInt(HHmm.slice(2, 4)) * 60
  )
  return parseInt(HHmm.slice(0, 2)) * 3600 + parseInt(HHmm.slice(2, 4)) * 60
}

class Furnace {
  timeFactor = 0.1

  logs = null
  seconds = 0
  setTime = null
  secondsLeft = null
  secondsIdle = 0
  countdownActive = false
  finishedWork = false
  lastTempReachSec = null
  cycleTime = 60 * 60 * 2 // 1 hour

  counterSec = 0

  mode = 'MAIN'
  tempDelta = 5
  cycleTemp = 600
  furnaceTemp = 0
  spiralTemp = 0
  spiralLimitTemp = 1000
  spiralIsHeating = false
  powerLedBlink = false
  LOW_LIMIT_DEG = 20
  MAX_LIMIT_DEG = 1200
  FURNACE_SPIRAL_DELTA = 100

  digitIndex = 0
  blinkActiveDigit = false
  blinkTimeDot = false

  blinkTimeIndicator = false

  calibrationTemp = 0
  calibrationStepIndex = 0
  calibrationSteps = ['tp.1.1', 'tp.1.2', 'tp.2.1', 'tp.2.2']

  constructor (logs) {
    this.logs = logs
  }

  setSetStateFn (setState) {
    this.setState = setState
  }

  onButtonsUpDownClick (up) {
    if (this.mode === 'SET_CYCLE_TEMP') {
      this.cycleTemp = degFromDigit(this.cycleTemp, this.digitIndex, up)
    } else if (this.mode === 'SET_CYCLE_TIME') {
      this.cycleTime = secsFromDigit(this.cycleTime, this.digitIndex, up)
    } else if (this.mode === 'SET_TEMP_DELTA') {
      this.tempDelta = secsFromDigit(this.tempDelta, this.digitIndex, up)
    } else if (this.mode === 'SET_SPIRAL_TEMP') {
      this.spiralLimitTemp = degFromDigit(
        this.spiralLimitTemp,
        this.digitIndex,
        up
      )
    } else if (this.mode === 'CALIBRATION') {
      this.calibrationTemp = secsFromDigit(
        this.calibrationTemp,
        this.digitIndex,
        up
      )
    }
    this.applyMode()
  }

  onBtnUpClick () {
    if (this.mode === 'MAIN') {
      this.mode = 'SHOW_CYCLE_TEMP'
      this.applyMode()
      setTimeout(() => {
        if (this.mode === 'SHOW_CYCLE_TEMP') {
          this.mode = 'MAIN'
          this.applyMode()
        }
      }, 1500)
    } else {
      this.onButtonsUpDownClick(true)
    }
  }

  onBtnDownClick () {
    if (this.mode === 'MAIN') {
      this.mode = 'SHOW_SPIRAL_TEMP'
      this.applyMode()
      setTimeout(() => {
        if (this.mode === 'SHOW_SPIRAL_TEMP') {
          this.mode = 'MAIN'
          this.applyMode()
        }
      }, 1500)
    } else {
      this.onButtonsUpDownClick(false)
    }
  }

  onBtnDClick () {
    if (
      [
        'SET_CYCLE_TEMP',
        'SET_CYCLE_TIME',
        'SET_TEMP_DELTA',
        'SET_SPIRAL_TEMP',
        'CALIBRATION'
      ].includes(this.mode)
    ) {
      this.digitIndex = this.digitIndex === 3 ? 0 : this.digitIndex + 1
      this.applyMode()
    }
  }

  onBtnPClick () {
    this.blinkTimeDot = false

    if (this.mode === 'MAIN') {
      this.mode = 'SET_CYCLE_TEMP'
      this.blinkActiveDigit = true
    } else if (this.mode === 'SET_CYCLE_TEMP') {
      this.mode = 'SET_CYCLE_TIME'
      this.blinkActiveDigit = true
      this.blinkTimeDot = true
      this.digitIndex = 0
    } else if (this.mode === 'SET_CYCLE_TIME') {
      this.mode = 'MAIN'
      this.blinkActiveDigit = false
      this.digitIndex = 0
    } else if (this.mode === 'SET_SPIRAL_TEMP') {
      this.mode = 'SET_TEMP_DELTA'
      this.blinkActiveDigit = true
      this.digitIndex = 0
    } else if (this.mode === 'SET_TEMP_DELTA') {
      this.mode = 'MAIN'
      this.blinkActiveDigit = false
    } else if (this.mode === 'CALIBRATION') {
      if (this.calibrationStepIndex < 3) {
        this.calibrationStepIndex += 1
      } else {
        this.calibrationStepIndex = 0
        this.mode = 'MAIN'
        this.blinkActiveDigit = false
      }
    }
    this.applyMode()
  }

  onBtnPLongClick () {
    if (this.mode === 'MAIN') {
      this.mode = 'SET_SPIRAL_TEMP'
      this.blinkActiveDigit = true
      this.digitIndex = 0
      this.applyMode()
    }
  }

  onBtnPDLongClick () {
    if (this.mode === 'MAIN') {
      this.mode = 'CALIBRATION'
      this.blinkActiveDigit = true
      this.digitIndex = 0
      this.applyMode()
    }
  }

  applyMode () {
    this.setState(s => ({
      ...s,
      furnaceTemp: this.furnaceTemp,
      spiralTemp: this.spiralTemp,
      cycleTemp: this.cycleTemp,
      powerLedActive: this.spiralIsHeating,
      powerLedBlink: this.powerLedBlink,
      blinkActiveDigit: this.blinkActiveDigit,
      blinkTimeDot: this.blinkTimeDot,
      blinkTimeIndicator: this.blinkTimeIndicator,
      digitIndex: this.digitIndex,
      activeDigit: this.activeDigit,
      finishedWork: this.finishedWork,
      mode: this.mode
    }))
    this.setState(s => {
      if (this.mode === 'MAIN') {
        return {
          ...s,
          indicatorTemp: tempToText(this.furnaceTemp),
          indicatorTime: timeToText(
            this.finishedWork
              ? this.secondsIdle
              : this.countdownActive
              ? this.secondsLeft
              : this.cycleTime
          )
        }
      } else if (this.mode === 'SHOW_CYCLE_TEMP') {
        return {
          ...s,
          indicatorTemp: tempToText(this.cycleTemp),
          indicatorTime: 't°  '
        }
      } else if (this.mode === 'SHOW_SPIRAL_TEMP') {
        return {
          ...s,
          indicatorTemp: tempToText(this.spiralTemp),
          indicatorTime: 'sp  '
        }
      } else if (this.mode === 'SET_CYCLE_TEMP') {
        return {
          ...s,
          indicatorTemp: tempToText(this.cycleTemp),
          indicatorTime: 't°  '
        }
      } else if (this.mode === 'SET_CYCLE_TIME') {
        return {
          ...s,
          indicatorTemp: timeToText(this.cycleTime),
          indicatorTime: 'HH.nn'
        }
      } else if (this.mode === 'SET_TEMP_DELTA') {
        return {
          ...s,
          indicatorTemp: tempToText(this.tempDelta),
          indicatorTime: 'dt° '
        }
      } else if (this.mode === 'SET_SPIRAL_TEMP') {
        return {
          ...s,
          indicatorTemp: tempToText(this.spiralLimitTemp),
          indicatorTime: 'sp  '
        }
      } else if (this.mode === 'CALIBRATION') {
        return {
          ...s,
          indicatorTemp: tempToText(this.calibrationTemp),
          indicatorTime: this.calibrationSteps[this.calibrationStepIndex]
        }
      }
      return s
    })
  }

  tick () {
    if (!this.finishedWork) {
      if (this.furnaceTemp >= this.cycleTemp - 2 * this.tempDelta) {
        if (this.lastTempReachSec === null) {
          this.lastTempReachSec = this.counterSec
        }
        if (
          !this.countdownActive &&
          this.lastTempReachSec !== null &&
          this.counterSec - this.lastTempReachSec > 1 * 60 // 1 minute
        ) {
          this.countdownActive = true
          this.secondsLeft = this.cycleTime
        }
      } else {
        this.lastTempReachSec = null
      }
    }
    if (this.spiralIsHeating) {
      this.spiralTemp += 1 * this.timeFactor
      if (this.furnaceTemp > this.cycleTemp) {
        this.spiralIsHeating = false
      } else if (this.spiralTemp > this.spiralLimitTemp) {
        this.spiralIsHeating = false
      }
    } else {
      this.spiralTemp =
        this.spiralTemp <= this.LOW_LIMIT_DEG
          ? this.LOW_LIMIT_DEG
          : this.spiralTemp - 1 * this.timeFactor
      if (
        !this.finishedWork &&
        this.furnaceTemp < this.cycleTemp - this.tempDelta &&
        this.spiralTemp < this.spiralLimitTemp - this.tempDelta
      ) {
        this.spiralIsHeating = true
      }
    }
    if (
      !this.finishedWork &&
      !this.spiralIsHeating &&
      this.furnaceTemp < this.cycleTemp - this.tempDelta
    ) {
      this.powerLedBlink = true
    } else {
      this.powerLedBlink = false
    }

    this.spiralTemp = Math.max(20, this.spiralTemp)
    this.furnaceTemp = Math.max(20, this.spiralTemp - this.FURNACE_SPIRAL_DELTA)

    if (this.countdownActive) {
      this.secondsLeft = Math.max(0, this.secondsLeft - 1 * this.timeFactor)

      if (this.secondsLeft === 0) {
        this.finishedWork = true
        this.secondsIdle += 1 * this.timeFactor
        this.blinkTimeIndicator = true
        this.applyMode()
      }
    }

    this.applyMode()
    this.setState(s => ({
      ...s,
      logs: [
        ...s.logs.slice(-100),
        {
          date: this.counterSec,
          furnaceTemp: this.furnaceTemp,
          spiralTemp: this.spiralTemp
        }
      ]
    }))
    this.counterSec += 1 * this.timeFactor
  }
}

export default Furnace
