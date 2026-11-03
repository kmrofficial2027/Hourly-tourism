import React from 'react'
import { Rating } from '@/components/ui/Rating'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { MessageSquareQuote, ShieldAlert } from 'lucide-react'

export interface ReviewCardProps {
  review: {
    id: string
    rating: number
    review_text: string
    created_at: string
    provider_response?: string | null
    provider_responded_at?: string | null
    customer?: {
      full_name?: string
      avatar_url?: string | null
    }
  }
  onReport?: (id: string) => void
  className?: string
}

export function ReviewCard({ review, onReport, className = '' }: ReviewCardProps) {
  const customerName = review.customer?.full_name || 'Verified Tourist'

  return (
    <div className={`p-5 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar
            src={review.customer?.avatar_url}
            name={customerName}
            size="md"
          />
          <div>
            <h4 className="text-sm font-bold text-gray-900">{customerName}</h4>
            <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Rating value={review.rating} size="sm" />
          {onReport && (
            <button
              onClick={() => onReport(review.id)}
              className="text-gray-400 hover:text-red-500 p-1 transition-colors"
              title="Report review"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Review Text */}
      <p className="text-sm text-gray-600 leading-relaxed font-normal">
        {review.review_text}
      </p>

      {/* Provider Response if present */}
      {review.provider_response && (
        <div className="mt-3 p-3.5 rounded-2xl bg-green-50/70 border border-green-200/70 text-xs space-y-1">
          <div className="flex items-center text-[#0a4d29] font-bold">
            <MessageSquareQuote className="w-3.5 h-3.5 mr-1.5 text-[#ff7a00]" />
            <span>Response from Host</span>
            {review.provider_responded_at && (
              <span className="text-gray-500 font-normal ml-2">
                ({formatDate(review.provider_responded_at)})
              </span>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed">{review.provider_response}</p>
        </div>
      )}
    </div>
  )
}

