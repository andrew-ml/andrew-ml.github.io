import React, { useState, useEffect, useRef, useCallback } from 'react'
import { DateTime } from 'luxon'

import './emulation.component.scss'
import IndicatorComponent from './indicator/indicator.component'
import Button from './button/button.component'
import Led from './led/led.component'
import Chart from './chart/chart.component'
import Furnace, { timeFactor } from './furnace'

let Ptimeout = null
let Dtimeout = null

const furnace = new Furnace()

const onBtnUpRelease = () => {
  furnace.onBtnUpClick()
}

const onBtnDownRelease = () => {
  furnace.onBtnDownClick()
}

const onBtnDDown = () => {
  Dtimeout = setTimeout(() => {}, 2000)
}

const onBtnPDown = () => {
  Ptimeout = setTimeout(() => {
    if (Dtimeout === null) {
      console.log('onBtnPLongClick')
      furnace.onBtnPLongClick()
      clearTimeout(Ptimeout)
      Ptimeout = null
    } else {
      console.log('onBtnPDLongClick')
      clearTimeout(Ptimeout)
      clearTimeout(Dtimeout)
      Ptimeout = null
      Dtimeout = null
      furnace.onBtnPDLongClick()
    }
  }, 2000)
}

const onBtnDRelease = () => {
  if (Dtimeout !== null) {
    furnace.onBtnDClick()
  }
  clearTimeout(Dtimeout)
}

const onBtnPRelease = () => {
  if (Ptimeout !== null) {
    furnace.onBtnPClick()
  }
  clearTimeout(Ptimeout)
}

const EmulationComponent = () => {
  const [timeFactor, setTimeFactor] = useState(1)
  const [state, setState] = useState({
    logs: [],
    indicatorTemp: 0,
    indicatorTempIsBlinking: false,
    indicatorTime: 0,
    blinkTimeIndicator: false,
    powerLedActive: false,
    digitIndex: 0,
    blinkActiveDigit: false,
    blinkTimeDot: true,
    furnaceTemp: 0,
    spiralTemp: 0,
    mode: null
  })
  const intervalRef = useRef(null)

  useEffect(() => {
    furnace.setSetStateFn(setState)

    intervalRef.current = setInterval(() => {
      furnace.tick()
    }, 100)

    const keypressHanlerDown = e => {
      if (e.key === 'Shift') {
        onBtnDDown()
      }
      if (e.key === 'Control') {
        onBtnPDown()
      }
      console.log('e', e.key)
    }
    const keypressHanlerUp = e => {
      if (e.key === 'ArrowUp') {
        onBtnUpRelease()
      }
      if (e.key === 'ArrowDown') {
        onBtnDownRelease()
      }
      if (e.key === 'Shift') {
        onBtnDRelease()
      }
      if (e.key === 'Control') {
        onBtnPRelease()
      }
    }
    window.addEventListener('keydown', keypressHanlerDown)
    window.addEventListener('keyup', keypressHanlerUp)

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <section className='EmulationComponentWrapper'>
      <section className='EmulationComponent'>
        <IndicatorComponent
          className='temp-indicator'
          hideInsignDigits
          digitIndex={state.digitIndex}
          blinkActiveDigit={state.blinkActiveDigit}
          blink={state.indicatorTempIsBlinking}
          text={state.indicatorTemp}
          sectionWidth={24}
          sectionHeight={34}
          digitWidth={14}
          digitHeight={25.4}
          color='red'
        />
        <IndicatorComponent
          className='timer-indicator'
          blink={state.blinkTimeIndicator}
          text={state.indicatorTime}
          blinkTimeDot={state.blinkTimeDot}
          sectionWidth={20}
          sectionHeight={27.7}
          digitWidth={12}
          digitHeight={20.4}
          color='green'
        />
        <section className='btn-container'>
          <Button
            text='↑'
            className='btn-up'
            color='black'
            onMouseUp={onBtnUpRelease}
          />
          <Button
            text='↓'
            className='btn-down'
            color='black'
            onMouseUp={onBtnDownRelease}
          />
          <Button
            text='D'
            className='btn-D'
            color='yellow'
            onMouseDown={onBtnDDown}
            onMouseUp={onBtnDRelease}
          />
          <Button
            text='P'
            className='btn-P'
            color='red'
            onMouseDown={onBtnPDown}
            onMouseUp={onBtnPRelease}
          />
        </section>
        <Led
          className='power-led'
          active={state.powerLedActive}
          blink={state.powerLedBlink}
        />
      </section>
      <section className='toolbar'>
        <section className='toolbar-top'>
          <div className='time-factor'>
            <span>speed: x{timeFactor}</span>
            <input
              type='range'
              className='time-factor-range'
              min={1}
              max={200}
              value={timeFactor}
              onChange={e => {
                setTimeFactor(e.target.value)
                furnace.timeFactor = e.target.value * 0.1 // because setInterval runs each 100ms
              }}
            />
          </div>
          <button
            className='reload-btn'
            onClick={() => {
              window.location.reload()
            }}
          >
            Reload
          </button>
        </section>

        <div className='toolbar-text'>
          <p>кнопка P - дублюється кнопкою Ctrl на клавіатурі</p>
          <p>кнопка D - дублюється кнопкою Shift на клавіатурі</p>
          <p>вхід в режими налаштування циклу - коротке натискання "P"</p>
          <p>
            вхід в режими налаштування дельти та спіралі - затиснути "P" на 5
            секунд
          </p>
          <p>вхід в режим калібровки - затиснути "P" + "D" на 5 секунд</p>
          <p>для спрощення емуляції вважаємо що t_камери = t_спіралі - 100°C</p>
        </div>
      </section>
      <Chart className='emulation-chart' state={state} />
    </section>
  )
}

export default EmulationComponent
