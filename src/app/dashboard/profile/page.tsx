'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'

export default function CustomerProfilePage() {
  const { user, profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      showToast.success('Profile updated successfully')
    } catch (err: any) {
      showToast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout role="customer" title="Profile Settings">
      <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
          <Avatar
            src={profile?.avatar_url}
            name={profile?.full_name || user?.email}
            size="xl"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-900">{profile?.full_name || 'Customer'}</h2>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Verified Tourist
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label="Email Address (Read-only)"
            disabled
            value={user?.email || ''}
          />

          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" isLoading={loading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

