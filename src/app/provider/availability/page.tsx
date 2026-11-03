'use client'

import React, { useState } from 'react'
import { Clock, Calendar, ShieldCheck, Check, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'

export default function ProviderAvailabilityPage() {
  const [workingDays, setWorkingDays] = useState([
    { day: 'Monday', active: true, start: '08:00', end: '20:00' },
    { day: 'Tuesday', active: true, start: '08:00', end: '20:00' },
    { day: 'Wednesday', active: true, start: '08:00', end: '20:00' },
    { day: 'Thursday', active: true, start: '08:00', end: '20:00' },
    { day: 'Friday', active: true, start: '08:00', end: '20:00' },
    { day: 'Saturday', active: true, start: '08:00', end: '22:00' },
    { day: 'Sunday', active: true, start: '08:00', end: '22:00' },
  ])

  const [bufferTime, setBufferTime] = useState('30')
  const [blockedDate, setBlockedDate] = useState('')
  const [blockedList, setBlockedList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleAddBlockedDate = () => {
    if (blockedDate && !blockedList.includes(blockedDate)) {
      setBlockedList([...blockedList, blockedDate])
      setBlockedDate('')
      showToast.success('Date blocked from new reservations')
    }
  }

  const handleRemoveBlockedDate = (d: string) => {
    setBlockedList(blockedList.filter((item) => item !== d))
  }

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast.success('Availability schedule saved successfully!')
    }, 600)
  }

  return (
    <DashboardLayout role="provider" title="Availability & Working Hours">
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display">
            Operating Schedule & Buffer Rules
          </h1>
          <p className="text-xs text-gray-500">
            Configure when tourists can book your hourly services to prevent double bookings.
          </p>
        </div>

        {/* Weekly Schedule */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 font-display">
              Weekly Operating Hours
            </h2>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
              Automatic Overlap Prevention
            </span>
          </div>

          <div className="space-y-3">
            {workingDays.map((d, idx) => (
              <div
                key={d.day}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 gap-3"
              >
                <div className="flex items-center space-x-3 w-36">
                  <input
                    type="checkbox"
                    checked={d.active}
                    onChange={(e) => {
                      const copy = [...workingDays]
                      copy[idx].active = e.target.checked
                      setWorkingDays(copy)
                    }}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                  />
                  <span className={`text-sm font-bold ${d.active ? 'text-gray-900' : 'text-gray-400'}`}>
                    {d.day}
                  </span>
                </div>

                {d.active ? (
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-gray-500">From</span>
                    <input
                      type="time"
                      value={d.start}
                      onChange={(e) => {
                        const copy = [...workingDays]
                        copy[idx].start = e.target.value
                        setWorkingDays(copy)
                      }}
                      className="px-2.5 py-1.5 rounded-xl border bg-white font-medium outline-none text-xs"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={d.end}
                      onChange={(e) => {
                        const copy = [...workingDays]
                        copy[idx].end = e.target.value
                        setWorkingDays(copy)
                      }}
                      className="px-2.5 py-1.5 rounded-xl border bg-white font-medium outline-none text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">Day Off (Unavailable)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Turnaround / Buffer Time */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 font-display">
            Buffer Time Between Bookings
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Minimum resting, cleaning, or transit time needed between two consecutive customer bookings.
          </p>
          <div className="flex items-center space-x-3 max-w-xs">
            <select
              value={bufferTime}
              onChange={(e) => setBufferTime(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-white"
            >
              <option value="15">15 Minutes Buffer</option>
              <option value="30">30 Minutes Buffer (Recommended)</option>
              <option value="45">45 Minutes Buffer</option>
              <option value="60">1 Hour Buffer</option>
            </select>
          </div>
        </div>

        {/* Block Off Dates */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 font-display">
            Block Specific Dates
          </h2>
          <p className="text-xs text-gray-500">
            Block off specific holidays, vehicle service days, or personal leave.
          </p>

          <div className="flex items-center space-x-3 max-w-sm">
            <input
              type="date"
              value={blockedDate}
              onChange={(e) => setBlockedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
            />
            <Button variant="secondary" size="sm" onClick={handleAddBlockedDate}>
              Block Date
            </Button>
          </div>

          {blockedList.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {blockedList.map((d) => (
                <span
                  key={d}
                  className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold flex items-center space-x-1.5"
                >
                  <span>{d}</span>
                  <button
                    onClick={() => handleRemoveBlockedDate(d)}
                    className="hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="lg" isLoading={loading} onClick={handleSave}>
            Save Availability Rules
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

