'use client'

import React, { useState, useEffect } from 'react'
import { Star, ShieldCheck, Heart } from 'lucide-react'
import { DEFAULT_HOMEPAGE_REVIEWS, HomepageShowcaseReview } from '@/lib/homepageReviews'

export function LovedByTouristsSection() {
  const [reviews, setReviews] = useState<HomepageShowcaseReview[]>(DEFAULT_HOMEPAGE_REVIEWS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/homepage-reviews?t=${Date.now()}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(data.reviews.filter((r: any) => r.is_active !== false))
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic homepage reviews:', err)
      }
    }
    loadReviews()
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Trips Only
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0a4d29] font-display mt-3">
            Loved by Tourists Across India
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
            Real experiences from travelers exploring Tamil Nadu by the hour with certified local rider hosts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((t, idx) => (
            <div
              key={t.id || idx}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between space-y-4 hover:shadow-lg hover:border-emerald-300 transition-all group"
            >
              <div>
                <div className="flex items-center space-x-1 text-amber-400 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic font-medium line-clamp-4">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80">
                <p className="font-extrabold text-sm text-slate-900 font-display">{t.name}</p>
                <p className="text-xs text-slate-400">
                  {t.role} • {t.city}
                </p>
                <p className="text-[11px] font-bold text-orange-600 mt-1 line-clamp-1">
                  Booked: {t.service}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

