import React, { useState, useEffect } from 'react'

import './button.component.scss'

const Button = ({ className = '', color = 'grey', text = null, ...props }) => {
  return (
    <section className={`Button color-${color} ${className}`}>
      <button {...props}></button>
      {text && <span>{text}</span>}
    </section>
  )
}

export default Button
