'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Camera,
  RefreshCw,
  Eye,
  Trash2,
  ArrowRight,
  UserCheck,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { showToast } from '@/components/ui/Toast'

export default function ProviderVerificationPage() {
  const [status, setStatus] = useState<'unsubmitted' | 'pending' | 'verified' | 'rejected'>('unsubmitted')
  const [submittedDocs, setSubmittedDocs] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [idType, setIdType] = useState('Aadhaar Card')
  const [idNumber, setIdNumber] = useState('')
  const [idCardFront, setIdCardFront] = useState<string | null>(null)
  const [idCardBack, setIdCardBack] = useState<string | null>(null)
  const [livePhoto, setLivePhoto] = useState<string | null>(null)

  // Camera Capture State
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputFrontRef = useRef<HTMLInputElement | null>(null)
  const fileInputBackRef = useRef<HTMLInputElement | null>(null)
  const fileInputSelfieRef = useRef<HTMLInputElement | null>(null)

  // Fetch current verification status
  const loadVerification = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/provider/verification')
      if (res.ok) {
        const data = await res.json()
        const currentStatus = data.verification_status || 'unsubmitted'
        setStatus(currentStatus)
        if (data.documents) {
          setSubmittedDocs(data.documents)
          if (data.documents.id_number) setIdNumber(data.documents.id_number)
          if (data.documents.id_type) setIdType(data.documents.id_type)
          if (data.documents.id_card_front) setIdCardFront(data.documents.id_card_front)
          if (data.documents.id_card_back) setIdCardBack(data.documents.id_card_back)
          if (data.documents.live_photo) setLivePhoto(data.documents.live_photo)
        }
      }
    } catch (err) {
      console.error('Error loading verification status:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVerification()
    return () => {
      stopCamera()
    }
  }, [])

  // Start Camera for Live Selfie
  const startCamera = async () => {
    setIsCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err: any) {
      console.error('Webcam error:', err)
      showToast.error('Could not access camera. You can upload a live selfie photo instead.')
      setIsCameraActive(false)
    }
  }

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  // Capture Photo from Camera
  const capturePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Mirror flip for selfie
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      setLivePhoto(dataUrl)
      showToast.success('Live photo captured successfully!')
      stopCamera()
    }
  }

  // File Upload Helper
  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file (JPG, PNG, or WebP)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Image size must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setter(event.target?.result as string)
      showToast.success('Document uploaded!')
    }
    reader.readAsDataURL(file)
  }

  // Submit for Admin Approval
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!idNumber.trim()) {
      showToast.error('Please enter your ID document number')
      return
    }

    if (!idCardFront) {
      showToast.error('Please upload the front side of your ID proof (Aadhaar Card)')
      return
    }

    if (!livePhoto) {
      showToast.error('Please take or upload a live selfie photo for facial verification')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/provider/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idType,
          idNumber: idNumber.trim(),
          idCardFront,
          idCardBack,
          livePhoto,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      showToast.success('Verification submitted! Admin will review within 2-4 hours.')
      setStatus('pending')
      loadVerification()
    } catch (err: any) {
      showToast.error(err.message || 'Error submitting verification')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="provider" title="Identity & Fleet Verification">
      <div className="max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Provider Identity Verification
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            To provide hourly services and list vehicles or tours in the Hourly Tourism marketplace,
            you must upload your government ID proof and a live selfie for Admin review.
          </p>
        </div>

        {/* Verification Status Banner */}
        <div
          className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            status === 'verified'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : status === 'pending'
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : status === 'rejected'
              ? 'bg-red-50/80 border-red-200 text-red-900'
              : 'bg-blue-50/80 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                status === 'verified'
                  ? 'bg-emerald-600 text-white'
                  : status === 'pending'
                  ? 'bg-amber-600 text-white'
                  : status === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {status === 'verified' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : status === 'pending' ? (
                <Clock className="w-6 h-6 animate-pulse" />
              ) : status === 'rejected' ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base">
                  {status === 'verified'
                    ? 'Verified & Approved Partner'
                    : status === 'pending'
                    ? 'Documents Pending Admin Approval'
                    : status === 'rejected'
                    ? 'Verification Rejected'
                    : 'Verification Required'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    status === 'verified'
                      ? 'bg-emerald-200 text-emerald-900'
                      : status === 'pending'
                      ? 'bg-amber-200 text-amber-900'
                      : status === 'rejected'
                      ? 'bg-red-200 text-red-900'
                      : 'bg-blue-200 text-blue-900'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-1">
                {status === 'verified'
                  ? 'Your identity has been verified. You can create hourly listings and accept customer reservations.'
                  : status === 'pending'
                  ? 'Your Aadhaar card and live selfie have been submitted. Admin is currently reviewing your documents.'
                  : status === 'rejected'
                  ? 'Your previous submission could not be verified. Please re-upload clear photos of your ID and live selfie.'
                  : 'Upload your Aadhaar or ID proof and take a live selfie below to submit for Admin approval.'}
              </p>
            </div>
          </div>

          {status === 'verified' && (
            <Link href="/provider/listings/new">
              <Button variant="primary" size="sm">
                Add New Listing
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          )}
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Document Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 font-display flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center mr-2 font-black">
                1
              </span>
              Government ID Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select ID Proof Document
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  disabled={status === 'verified'}
                >
                  <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                  <option value="Driving License">Commercial Driving License (DL)</option>
                  <option value="Voter ID">Voter ID Card (EPIC)</option>
                  <option value="Passport">Indian Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ID Number (e.g. 12-digit Aadhaar / DL Number)
                </label>
                <Input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. 4521 8901 2345"
                  required
                  disabled={status === 'verified'}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Upload Aadhaar / ID Card Front & Back */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 font-display flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center mr-2 font-black">
                2
              </span>
              Upload {idType} Photo
            </h2>
            <p className="text-xs text-gray-500">
              Upload a clear, readable image of your ID proof. Make sure your name, photo, and number are clearly visible.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Front Side */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Front Side (Required)</span>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[180px]">
                  {idCardFront ? (
                    <div className="space-y-3 w-full">
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                        <img
                          src={idCardFront}
                          alt="ID Front"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {status !== 'verified' && (
                        <div className="flex justify-center space-x-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputFrontRef.current?.click()}
                          >
                            Replace
                          </Button>
                          <button
                            type="button"
                            onClick={() => setIdCardFront(null)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-xs text-gray-600 font-semibold">Upload ID Front</p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputFrontRef.current?.click()}
                        disabled={status === 'verified'}
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1" />
                        Choose Photo
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputFrontRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, setIdCardFront)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Back Side (Optional for Aadhaar) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Back Side (Optional for Address)</span>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col items-center justify-center min-h-[180px]">
                  {idCardBack ? (
                    <div className="space-y-3 w-full">
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
                        <img
                          src={idCardBack}
                          alt="ID Back"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {status !== 'verified' && (
                        <div className="flex justify-center space-x-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputBackRef.current?.click()}
                          >
                            Replace
                          </Button>
                          <button
                            type="button"
                            onClick={() => setIdCardBack(null)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileText className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-xs text-gray-600 font-semibold">Upload ID Back</p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputBackRef.current?.click()}
                        disabled={status === 'verified'}
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1" />
                        Choose Photo
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputBackRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, setIdCardBack)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Take Live Photo / Selfie */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 font-display flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center mr-2 font-black">
                3
              </span>
              Take Live Photo / Live Selfie
            </h2>
            <p className="text-xs text-gray-500">
              Admin will compare your live selfie with your government ID photo to confirm your identity.
            </p>

            <div className="pt-2">
              {isCameraActive ? (
                <div className="p-4 bg-gray-900 rounded-3xl max-w-md mx-auto space-y-4 text-center">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <Button type="button" variant="primary" size="md" onClick={capturePhoto}>
                      <Camera className="w-4 h-4 mr-1.5" />
                      Capture Live Selfie
                    </Button>
                    <Button type="button" variant="secondary" size="md" onClick={stopCamera}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : livePhoto ? (
                <div className="p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100 max-w-sm mx-auto text-center space-y-3">
                  <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-emerald-500 shadow-md mx-auto bg-white flex items-center justify-center">
                    <img
                      src={livePhoto}
                      alt="Live Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1" />
                    Live Photo Captured
                  </div>
                  {status !== 'verified' && (
                    <div className="flex justify-center space-x-2 pt-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={startCamera}
                      >
                        <Camera className="w-3.5 h-3.5 mr-1" />
                        Retake Photo
                      </Button>
                      <button
                        type="button"
                        onClick={() => fileInputSelfieRef.current?.click()}
                        className="text-xs text-emerald-700 underline font-semibold px-2 py-1"
                      >
                        Upload Photo Instead
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50 space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">Capture Live Facial Photo</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Open device camera or upload a clear, front-facing selfie
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={startCamera}
                      disabled={status === 'verified'}
                    >
                      <Camera className="w-4 h-4 mr-1.5" />
                      Open Camera
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => fileInputSelfieRef.current?.click()}
                      disabled={status === 'verified'}
                    >
                      <UploadCloud className="w-4 h-4 mr-1.5" />
                      Upload Selfie
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputSelfieRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleImageFile(e, setLivePhoto)}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit Action */}
          {status !== 'verified' && (
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-900">
                  Ready to submit for Admin Approval?
                </p>
                <p className="text-[11px] text-gray-500">
                  By submitting, you certify that the provided Aadhaar ID and live selfie are your authentic credentials.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={submitting}
                className="w-full sm:w-auto"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                {submitting ? 'Submitting...' : 'Send for Admin Approval'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}
