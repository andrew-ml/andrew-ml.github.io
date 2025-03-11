import React, { useState, useEffect } from 'react'

import './led.component.scss'

const Led = ({ className = '', blink = false, active = false }) => {
  return (
    <div
      className={`Led ${className} ${blink ? 'blink' : active ? 'active' : ''}`}
    ></div>
  )
}

export default Led
