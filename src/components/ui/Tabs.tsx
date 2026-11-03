'use client'

import React, { useState } from 'react'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  content?: React.ReactNode
}

export interface TabsProps {
  tabs: TabItem[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  activeTab?: string
  variant?: 'underline' | 'pills' | 'enclosed'
  className?: string
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  activeTab: controlledActiveTab,
  variant = 'underline',
  className = '',
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id)
  const currentTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabClick = (id: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(id)
    }
    onChange?.(id)
  }

  const activeContent = tabs.find((t) => t.id === currentTab)?.content

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`flex items-center space-x-2 border-b border-gray-200 overflow-x-auto scrollbar-none ${
          variant === 'pills' ? 'border-b-0 bg-gray-100 p-1.5 rounded-xl' : ''
        }`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab

          if (variant === 'pills') {
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-primary-100 text-primary-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap -mb-px ${
                isActive
                  ? 'border-primary-600 text-primary-700 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeContent && <div className="mt-6">{activeContent}</div>}
    </div>
  )
}

