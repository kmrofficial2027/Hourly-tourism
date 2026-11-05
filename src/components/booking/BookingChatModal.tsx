'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Image, Paperclip, CheckCheck, Clock, AlertCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { formatTime } from '@/lib/utils'
import type { BookingMessage } from '@/types'

export interface BookingChatModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
  bookingNumber: string
  currentUserRole: 'customer' | 'provider' | 'admin'
  currentUserId: string
  recipientName: string
}

export function BookingChatModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
  currentUserRole,
  currentUserId,
  recipientName,
}: BookingChatModalProps) {
  const [messages, setMessages] = useState<BookingMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickTemplates =
    currentUserRole === 'provider'
      ? [
          "I have arrived at the pickup location.",
          "Running ~10 mins late due to city traffic.",
          "Please bring a valid Government ID / License.",
          "Vehicle is sanitized and ready with fuel.",
        ]
      : [
          "I am waiting at the pickup spot.",
          "Can you please share your vehicle live color / landmark?",
          "We are walking out of the hotel lobby now.",
          "Thank you, see you soon!",
        ]

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.warn('Failed to fetch messages:', err)
    }
  }

  useEffect(() => {
    if (!isOpen) return
    loadMessages()
    const interval = setInterval(loadMessages, 4000)
    return () => clearInterval(interval)
  }, [isOpen, bookingId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim()
    if (!text) return

    setSending(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          senderRole: currentUserRole,
        }),
      })

      if (res.ok) {
        setInputText('')
        loadMessages()
      } else {
        showToast.error('Failed to send message.')
      }
    } catch {
      showToast.error('Network error sending message.')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chat with ${recipientName} • #${bookingNumber}`}
    >
      <div className="flex flex-col h-[480px]">
        {/* Safe Communication Notice */}
        <div className="p-2.5 rounded-xl bg-green-50 border border-green-200 text-[11px] text-[#0a4d29] flex items-center justify-between mb-3 flex-shrink-0">
          <span>🔒 Secured in-app chat. Transcripts are retained for trip safety & dispute support.</span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50/70 rounded-2xl border border-gray-100">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <p className="text-xs font-semibold">No messages yet.</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Coordinate pickup landmarks, arrival timing, or luggage instructions safely.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId || msg.sender_role === currentUserRole
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#0a4d29] text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.message}</p>
                    {msg.attachment_url && (
                      <img
                        src={msg.attachment_url}
                        alt="Attachment"
                        className="mt-2 rounded-lg max-h-40 w-auto object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-[10px] text-gray-400">
                    <span>{formatTime(msg.created_at)}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Message Templates */}
        <div className="pt-2 pb-1 flex flex-wrap gap-1.5 flex-shrink-0">
          {quickTemplates.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(t)}
              className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-[10px] font-bold text-gray-700 transition-colors"
            >
              + {t}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="pt-2 flex items-center space-x-2 flex-shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or instruction..."
            className="flex-1 text-xs p-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#0a4d29] bg-white font-medium"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={sending}
            disabled={!inputText.trim()}
            className="rounded-2xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Modal>
  )
}

