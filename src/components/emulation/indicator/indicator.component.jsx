import React, { useState, useEffect, useRef } from 'react'

import './indicator.component.scss'

const IndicatorComponent = ({
  className = '',
  text,
  sectionWidth,
  sectionHeight,
  digitWidth,
  digitHeight,
  hideInsignDigits = false,
  digitIndex = 0,
  blinkActiveDigit = false,
  blinkTimeDot = false,
  blink = false,
  color
}) => {
  const [activeDigit, setActiveDigit] = useState(null)
  const [showAlldigits, setShowAllDigits] = useState(true)
  const [timeDot, setTimeDot] = useState(false)
  const intervalRef = useRef(null)
  const intervalBlinkDotRef = useRef(null)
  const parsedList = text
    .toString()
    .split('.')
    .reduce(
      (acc, seqWithDot, currIndex, topLevelList) => [
        ...acc,
        ...seqWithDot.split('').map((l, i, seq) => ({
          letter: l,
          isDot: i === seq.length - 1 && currIndex < topLevelList.length - 1,
          isOne: l === '1'
        }))
      ],
      []
    )
    .map((l, i, list) =>
      hideInsignDigits &&
      !blinkActiveDigit &&
      l.letter === '0' &&
      i < 3 &&
      !list.slice(0, i).some(ll => ll.letter != '0')
        ? { ...l, letter: ' ' }
        : l
    )

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!blink) {
      return
    }
    console.log('blink', blink)
    const blinkInterval = setInterval(() => {
      setShowAllDigits(false)
      setTimeout(() => {
        setShowAllDigits(true)
      }, 500)
    }, 1000)
    return () => {
      clearInterval(blinkInterval)
    }
  }, [blink])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!blinkActiveDigit) {
      return
    }
    intervalRef.current = setInterval(() => {
      setActiveDigit(digitIndex)
      setTimeout(() => {
        setActiveDigit(null)
      }, 400)
    }, 1000)
    return () => {
      clearInterval(intervalRef.current)
    }
  }, [digitIndex, blinkActiveDigit])

  useEffect(() => {
    clearInterval(intervalBlinkDotRef.current)
    if (!blinkTimeDot) {
      return
    }
    intervalBlinkDotRef.current = setInterval(() => {
      setTimeDot(true)
      setTimeout(() => {
        setTimeDot(null)
      }, 500)
    }, 1000)
    return () => {
      clearInterval(intervalBlinkDotRef.current)
    }
  }, [blinkTimeDot])

  return (
    <section className={`Indicator ${className}`}>
      {parsedList.map(({ letter, isDot, isOne }, index) => (
        <div
          className={`letter`}
          key={index}
          style={{ width: sectionWidth, height: sectionHeight }}
        >
          <span
            className={`letter-symbol  ${
              showAlldigits &&
              (activeDigit === null || activeDigit !== 3 - index)
                ? 'active'
                : ''
            }`}
            style={{
              width: digitWidth,
              heading: digitHeight,
              left:
                0.3 * (sectionWidth - digitWidth) +
                (isOne ? 0 * digitWidth : 0),
              top: 0.3 * (sectionHeight - digitHeight),
              fontSize: digitHeight * 1.25,
              color
            }}
          >
            {letter}
          </span>
          {(showAlldigits && isDot) || (index === 1 && timeDot) ? (
            <span
              className='letter-dot'
              style={{
                width: digitWidth,
                heading: digitHeight,
                left: 1.95 * (sectionWidth - digitWidth),
                top: 0.3 * (sectionHeight - digitHeight),
                fontSize: digitHeight * 1.4,
                color
              }}
            >
              .
            </span>
          ) : null}
        </div>
      ))}
    </section>
  )
}

export default IndicatorComponent
