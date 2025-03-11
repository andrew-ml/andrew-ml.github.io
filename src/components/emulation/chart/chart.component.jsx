import React, { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { DateTime } from 'luxon'
import 'chartjs-adapter-date-fns'
import './chart.component.scss'

const ChartComponent = ({ state, className = '' }) => {
  const chartRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    Chart.register(...registerables)

    // Prepare the data

    const chartData = {
      labels: [],
      datasets: [
        {
          label: 'Камера пічі (°C)',
          data: [],
          borderColor: 'rgb(192, 75, 75)',
          backgroundColor: 'rgba(255, 196, 196, 0.2)',
          borderWidth: 2,
          pointRadius: 0
        },
        {
          label: 'Спіраль (°C)',
          data: [],
          borderColor: 'rgb(8, 0, 242)',
          backgroundColor: 'rgba(133, 155, 255, 0.2)',
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    }

    // Configure the chart
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0
      },
      spanGaps: false,
      elements: {
        line: {
          tension: 0.01
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          // min: new Date(),
          suggestedMax: DateTime.now().plus({ minute: 120 }).toJSDate(),
          type: 'time',
          time: {
            // unit: 'hour',
            displayFormats: {
              millisecond: 'HH:mm',
              second: 'HH:mm',
              minute: 'HH:mm',
              hour: 'HH:mm',
              day: 'HH:mm',
              week: 'HH:mm',
              month: 'HH:mm',
              quarter: 'HH:mm',
              year: 'HH:mm'
            }
          },
          title: {
            display: true,
            text: 'Time'
          },
          ticks: {
            beginAtZero: false
          }
        },
        y: {
          min: 0,
          max: 1250,
          title: {
            display: true,
            text: 'Temperature (°C)'
          },
          ticks: {
            beginAtZero: false
          }
        }
      }
    }

    // Create the chart
    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions
    })
  }, [])

  useEffect(() => {
    const logs = state.logs
    const dates = logs.map(row => row.date)
    const furnaceTemps = logs.map(row => row.furnaceTemp)
    const spiralTemps = logs.map(row => row.spiralTemp)
    chartRef.current.data.datasets[0].data = furnaceTemps
    chartRef.current.data.datasets[1].data = spiralTemps

    var startMs = new Date().valueOf()
    chartRef.current.data.labels = dates.map(i => startMs + i * 1000)
    chartRef.current.update() // Refresh the chart
  }, [state])

  return (
    <section className={`Chart ${className}`}>
      <div className='canvas-wrapper'>
        <canvas ref={canvasRef}></canvas>
      </div>

      <section className='info-rows'>
        <p className='info-row'>Mode: {state.mode}</p>
        <p className='info-row'>
          blinkActiveDigit: {state.blinkActiveDigit ? 'true' : 'false'}
        </p>
        <p className='info-row'>digitIndex: {state.digitIndex}</p>
        <p className='info-row'>
          blinkTimeDot: {state.blinkTimeDot ? 'true' : 'false'}
        </p>
        <p className='info-row'>Cycle temp: {state.cycleTemp}</p>
        <p className='info-row'>Camera temp: {Math.round(state.furnaceTemp)}</p>
        <p className='info-row'>Spiral temp: {Math.round(state.spiralTemp)}</p>
      </section>
    </section>
  )
}

export default ChartComponent
