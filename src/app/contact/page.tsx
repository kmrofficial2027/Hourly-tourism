'use client'

import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast.success('Message sent! Support will respond within 2 hours.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    }, 600)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            24/7 Support Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-display mt-3">
            Contact Hourly Tourism
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Have questions about an hourly booking or provider registration? Our support team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400">Email Us</h4>
                <p className="text-sm font-bold text-gray-900 mt-0.5">support@hourlytourism.com</p>
                <p className="text-[11px] text-gray-400">Response within 2 hours</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400">Helpline</h4>
                <p className="text-sm font-bold text-gray-900 mt-0.5">+91 1800 200 4887</p>
                <p className="text-[11px] text-gray-400">Toll-free 8am - 10pm</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-400">Headquarters</h4>
                <p className="text-sm font-bold text-gray-900 mt-0.5">Bengaluru, Karnataka, India</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  required
                  placeholder="e.g. Aditi Roy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="aditi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Input
                label="Subject / Booking ID (if applicable)"
                required
                placeholder="e.g. Question about Booking #HT-2024-000001"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <Textarea
                label="Message Details"
                required
                rows={4}
                placeholder="How can we assist your hourly travel experience?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full sm:w-auto px-8 font-bold">
                <Send className="w-4 h-4 mr-2" />
                Send Inquiry
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

