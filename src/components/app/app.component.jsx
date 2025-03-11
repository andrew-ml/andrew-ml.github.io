import './app.component.scss'

import React, { useState, useEffect, lazy, Suspense } from 'react'
import EmulationComponent from '../emulation/emulation.component'
function AppComponent () {
  return (
    <div className='AppComponent'>
      <EmulationComponent />
    </div>
  )
}

export default AppComponent
