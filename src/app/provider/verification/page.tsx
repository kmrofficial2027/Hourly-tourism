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
  Eye,
  Trash2,
  ArrowRight,
  Car,
  Bike,
  Truck,
  UserCheck,
  Sparkles,
  Check,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'

export default function ProviderVerificationPage() {
  const [status, setStatus] = useState<'unsubmitted' | 'pending' | 'verified' | 'rejected'>('unsubmitted')
  const [submittedDocs, setSubmittedDocs] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'identity' | 'driver' | 'vehicle'>('all')

  // 1. Identity & Government KYC Fields
  const [idType, setIdType] = useState('Aadhaar Card')
  const [idNumber, setIdNumber] = useState('')
  const [idCardFront, setIdCardFront] = useState<string | null>(null)
  const [idCardBack, setIdCardBack] = useState<string | null>(null)
  const [livePhoto, setLivePhoto] = useState<string | null>(null)

  // 2. Driver Details & Driving Licence
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [dlNumber, setDlNumber] = useState('')
  const [dlExpiry, setDlExpiry] = useState('')
  const [dlFront, setDlFront] = useState<string | null>(null)
  const [dlBack, setDlBack] = useState<string | null>(null)
  const [driverExperience, setDriverExperience] = useState('5')

  // 3. Vehicle Details & Registration Compliance
  const [vehicleType, setVehicleType] = useState<'bike' | 'car' | 'van'>('car')
  const [vehicleBrand, setVehicleBrand] = useState('Toyota')
  const [vehicleModel, setVehicleModel] = useState('Innova Crysta')
  const [vehicleYear, setVehicleYear] = useState('2023')
  const [vehicleRegNumber, setVehicleRegNumber] = useState('TN 38 BK 4521')
  const [vehicleCapacity, setVehicleCapacity] = useState('7')
  const [fuelType, setFuelType] = useState('Diesel')
  const [rcDocument, setRcDocument] = useState<string | null>(null)
  const [insuranceDocument, setInsuranceDocument] = useState<string | null>(null)
  const [insuranceExpiry, setInsuranceExpiry] = useState('')
  const [fitnessDocument, setFitnessDocument] = useState<string | null>(null)
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null)

  // Camera Capture State
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // File Input Refs
  const fileInputFrontRef = useRef<HTMLInputElement | null>(null)
  const fileInputBackRef = useRef<HTMLInputElement | null>(null)
  const fileInputSelfieRef = useRef<HTMLInputElement | null>(null)
  const fileInputDlFrontRef = useRef<HTMLInputElement | null>(null)
  const fileInputDlBackRef = useRef<HTMLInputElement | null>(null)
  const fileInputRcRef = useRef<HTMLInputElement | null>(null)
  const fileInputInsuranceRef = useRef<HTMLInputElement | null>(null)
  const fileInputFitnessRef = useRef<HTMLInputElement | null>(null)
  const fileInputVehiclePhotoRef = useRef<HTMLInputElement | null>(null)

  // Fetch current verification status
  const loadVerification = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/provider/verification')
      if (res.ok) {
        const data = await res.json()
        const currentStatus = data.verification_status || 'unsubmitted'
        setStatus(currentStatus === 'approved' ? 'verified' : currentStatus)

        if (data.documents) {
          const d = data.documents
          setSubmittedDocs(d)
          if (d.id_number) setIdNumber(d.id_number)
          if (d.id_type) setIdType(d.id_type)
          if (d.id_card_front) setIdCardFront(d.id_card_front)
          if (d.id_card_back) setIdCardBack(d.id_card_back)
          if (d.live_photo) setLivePhoto(d.live_photo)

          // Driver
          if (d.driver_name) setDriverName(d.driver_name)
          if (d.driver_phone) setDriverPhone(d.driver_phone)
          if (d.dl_number) setDlNumber(d.dl_number)
          if (d.dl_expiry) setDlExpiry(d.dl_expiry)
          if (d.dl_front) setDlFront(d.dl_front)
          if (d.dl_back) setDlBack(d.dl_back)
          if (d.driver_experience) setDriverExperience(String(d.driver_experience))

          // Vehicle
          if (d.vehicle_type) setVehicleType(d.vehicle_type)
          if (d.vehicle_brand) setVehicleBrand(d.vehicle_brand)
          if (d.vehicle_model) setVehicleModel(d.vehicle_model)
          if (d.vehicle_year) setVehicleYear(String(d.vehicle_year))
          if (d.registration_number) setVehicleRegNumber(d.registration_number)
          if (d.seating_capacity) setVehicleCapacity(String(d.seating_capacity))
          if (d.fuel_type) setFuelType(d.fuel_type)
          if (d.rc_document) setRcDocument(d.rc_document)
          if (d.insurance_document) setInsuranceDocument(d.insurance_document)
          if (d.insurance_expiry) setInsuranceExpiry(d.insurance_expiry)
          if (d.fitness_document) setFitnessDocument(d.fitness_document)
          if (d.vehicle_photo) setVehiclePhoto(d.vehicle_photo)
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
      showToast.error('Could not access camera. You can upload a selfie photo instead.')
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
    setter: (val: string | null) => void,
    label: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Please upload an image file (JPG, PNG, or WebP)')
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast.error('Image size must be under 8MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setter(event.target?.result as string)
      showToast.success(`${label} uploaded!`)
    }
    reader.readAsDataURL(file)
  }

  // Submit for Admin Approval
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!idNumber.trim()) {
      showToast.error('Please enter your government ID number (Aadhaar/PAN).')
      setActiveTab('identity')
      return
    }

    if (!idCardFront) {
      showToast.error('Please upload the front photo of your government ID.')
      setActiveTab('identity')
      return
    }

    if (!livePhoto) {
      showToast.error('Please take or upload a live facial selfie photo.')
      setActiveTab('identity')
      return
    }

    if (!driverName.trim() || !dlNumber.trim()) {
      showToast.error('Please provide driver name and driving licence (DL) number.')
      setActiveTab('driver')
      return
    }

    if (!vehicleRegNumber.trim()) {
      showToast.error('Please enter your vehicle registration number (e.g. TN 38 BK 4521).')
      setActiveTab('vehicle')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/provider/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Identity
          idType,
          idNumber: idNumber.trim(),
          idCardFront,
          idCardBack,
          livePhoto,

          // Driver
          driverName: driverName.trim(),
          driverPhone: driverPhone.trim(),
          dlNumber: dlNumber.trim().toUpperCase(),
          dlExpiry,
          dlFront,
          dlBack,
          driverExperience,

          // Vehicle
          vehicleType,
          vehicleBrand: vehicleBrand.trim(),
          vehicleModel: vehicleModel.trim(),
          vehicleYear: vehicleYear.trim(),
          vehicleRegNumber: vehicleRegNumber.trim().toUpperCase(),
          vehicleCapacity,
          fuelType,
          rcDocument,
          insuranceDocument,
          insuranceExpiry,
          fitnessDocument,
          vehiclePhoto,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      showToast.success('All verifications submitted! Admin will review your dossier within 2-4 hours.')
      setStatus('pending')
      loadVerification()
    } catch (err: any) {
      showToast.error(err.message || 'Error submitting verification')
    } finally {
      setSubmitting(false)
    }
  }

  // Render a document upload card
  const renderDocUploadCard = (
    label: string,
    stateVal: string | null,
    setter: (val: string | null) => void,
    inputRef: any,
    required: boolean = false
  ) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {stateVal && (
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Attached ✓
            </span>
          )}
        </div>
        <div className="border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-2xl p-3 text-center bg-gray-50/50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center min-h-[140px]">
          {stateVal ? (
            <div className="space-y-2 w-full">
              <div className="w-full h-28 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                <img src={stateVal} alt={label} className="w-full h-full object-contain" />
              </div>
              {status !== 'verified' && (
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-[11px] font-bold text-emerald-700 hover:underline px-2 py-1"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setter(null)}
                    className="text-[11px] font-bold text-red-500 hover:text-red-700 px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <UploadCloud className="w-6 h-6 text-gray-300 mx-auto" />
              <p className="text-[11px] text-gray-600 font-semibold">Upload Photo / PDF</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={status === 'verified'}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-400 text-gray-700 text-xs font-bold shadow-xs hover:bg-emerald-50 transition-colors"
              >
                Choose File
              </button>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageFile(e, setter, label)}
            className="hidden"
          />
        </div>
      </div>
    )
  }

  const identityReady = Boolean(idNumber.trim() && idCardFront && livePhoto)
  const driverReady = Boolean(driverName.trim() && dlNumber.trim())
  const vehicleReady = Boolean(vehicleRegNumber.trim() && vehicleBrand.trim())

  return (
    <DashboardLayout role="provider" title="Host, Driver & Vehicle Verifications">
      <div className="max-w-5xl space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-display">
            Provider, Driver & Vehicle Verifications
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete your host identity KYC, driver commercial licence, and vehicle registration documents for admin review to activate hourly bookings.
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
                    ? 'Dossier Pending Admin Approval'
                    : status === 'rejected'
                    ? 'Verification Requires Re-Upload'
                    : 'Verification Required to Accept Rides'}
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
                  ? 'Your identity, commercial driver licence, and vehicle registration have been verified. You can create hourly listings and accept reservations.'
                  : status === 'pending'
                  ? 'Your full dossier (Aadhaar, driver licence, vehicle RC & insurance) has been submitted. Platform Admin is actively reviewing your application.'
                  : status === 'rejected'
                  ? 'Admin requested document corrections. Please re-check the blurry photos or expired documents below and resubmit.'
                  : 'Upload your Aadhaar ID, driving licence, and vehicle RC / insurance below to submit for Admin review.'}
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

        {/* 10-Point Compliance Checklist */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-display">
                Verification & Compliance Checklist
              </h2>
              <p className="text-xs text-gray-500">
                All 3 pillars (Identity, Driver, and Vehicle) are reviewed together for marketplace activation.
              </p>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              {status === 'verified' ? '10/10 Stages Verified' : status === 'pending' ? '9/10 Under Review' : 'Incomplete'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {[
              { num: 1, label: 'Host Account Registered', done: true },
              { num: 2, label: 'Government ID Proof (Aadhaar/PAN)', done: Boolean(idCardFront) },
              { num: 3, label: 'Live Facial Selfie Match', done: Boolean(livePhoto) },
              { num: 4, label: 'Driver Personal & Contact Info', done: Boolean(driverName.trim()) },
              { num: 5, label: 'Commercial Driving Licence (DL)', done: Boolean(dlNumber.trim()) },
              { num: 6, label: 'Vehicle Asset Specs (Bike/Car/Van)', done: Boolean(vehicleRegNumber.trim()) },
              { num: 7, label: 'Registration Certificate (RC) Upload', done: Boolean(rcDocument) },
              { num: 8, label: 'Commercial Insurance Policy', done: Boolean(insuranceDocument) },
              { num: 9, label: 'Pollution / Fitness Certificate (PUC)', done: Boolean(fitnessDocument) },
              { num: 10, label: 'Admin Marketplace Activation', done: status === 'verified' },
            ].map((st) => (
              <div
                key={st.num}
                className={`p-3 rounded-2xl flex items-center justify-between text-xs ${
                  st.done
                    ? 'bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 font-semibold'
                    : 'bg-gray-50 border border-gray-200/60 text-gray-500 font-medium'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      st.done ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {st.num}
                  </span>
                  <span>{st.label}</span>
                </div>
                {st.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Verification Sections
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'identity'
                ? 'bg-[#ff7a00] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1. Host Identity & KYC</span>
            {identityReady && <Check className="w-3 h-3 text-emerald-300" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('driver')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'driver'
                ? 'bg-[#ff7a00] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. Driver Details & DL</span>
            {driverReady && <Check className="w-3 h-3 text-emerald-300" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vehicle')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'vehicle'
                ? 'bg-[#ff7a00] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>3. Vehicle Details & RC</span>
            {vehicleReady && <Check className="w-3 h-3 text-emerald-300" />}
          </button>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ========================================================= */}
          {/* SECTION 1: HOST IDENTITY & GOVERNMENT KYC                 */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'identity') && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">
                      1
                    </span>
                    Host Identity & Government KYC Proof
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload your official government ID proof and take a live selfie for facial comparison.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Step 1 of 3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Select ID Proof Document <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    disabled={status === 'verified'}
                  >
                    <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                    <option value="PAN Card">PAN Card (Income Tax Dept)</option>
                    <option value="Voter ID">Voter ID Card (EPIC)</option>
                    <option value="Passport">Indian Passport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ID Document Number <span className="text-red-500">*</span>
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

              {/* ID Proof Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {renderDocUploadCard(`${idType} Front Side`, idCardFront, setIdCardFront, fileInputFrontRef, true)}
                {renderDocUploadCard(`${idType} Back Side (Address)`, idCardBack, setIdCardBack, fileInputBackRef, false)}
              </div>

              {/* Live Selfie Facial Verification */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      Live Facial Selfie Photo <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-[11px] text-gray-400">Admin will compare this selfie with your government ID photo</p>
                  </div>
                  {livePhoto && (
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Captured ✓
                    </span>
                  )}
                </div>

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
                  <div className="p-4 bg-emerald-50/40 rounded-3xl border border-emerald-100 max-w-sm mx-auto text-center space-y-3">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-emerald-500 shadow-md mx-auto bg-white flex items-center justify-center">
                      <img src={livePhoto} alt="Live Selfie" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center justify-center space-x-1 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1" />
                      Live Photo Attached
                    </div>
                    {status !== 'verified' && (
                      <div className="flex justify-center space-x-2 pt-1">
                        <Button type="button" variant="secondary" size="sm" onClick={startCamera}>
                          <Camera className="w-3.5 h-3.5 mr-1" /> Retake Photo
                        </Button>
                        <button
                          type="button"
                          onClick={() => fileInputSelfieRef.current?.click()}
                          className="text-xs text-emerald-700 underline font-semibold px-2 py-1"
                        >
                          Upload File
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50 space-y-3 max-w-md mx-auto">
                    <Camera className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs text-gray-600 font-semibold">Take a clear, well-lit live selfie</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button type="button" variant="primary" size="sm" onClick={startCamera}>
                        <Camera className="w-3.5 h-3.5 mr-1" /> Open Camera
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputSelfieRef.current?.click()}
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1" /> Upload Selfie
                      </Button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputSelfieRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e, setLivePhoto, 'Live selfie')}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: DRIVER DETAILS & DRIVING LICENCE               */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'driver') && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">
                      2
                    </span>
                    Driver Details & Commercial Driving Licence
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Provide the driver credentials of the rider or chauffeur operating the hourly trips.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Step 2 of 3
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Driver Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. S. Karthikeyan"
                    required
                    disabled={status === 'verified'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Driver Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    required
                    disabled={status === 'verified'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Driving Experience (Years)
                  </label>
                  <Input
                    type="number"
                    value={driverExperience}
                    onChange={(e) => setDriverExperience(e.target.value)}
                    placeholder="e.g. 5"
                    disabled={status === 'verified'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Driving Licence (DL) Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={dlNumber}
                    onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. TN38 20180004521"
                    required
                    disabled={status === 'verified'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Licence Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={dlExpiry}
                    onChange={(e) => setDlExpiry(e.target.value)}
                    disabled={status === 'verified'}
                  />
                </div>
              </div>

              {/* Driving Licence Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {renderDocUploadCard('Driving Licence Front Side', dlFront, setDlFront, fileInputDlFrontRef, true)}
                {renderDocUploadCard('Driving Licence Back Side', dlBack, setDlBack, fileInputDlBackRef, false)}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 3: VEHICLE DETAILS & RC / INSURANCE COMPLIANCE     */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'vehicle') && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-black">
                      3
                    </span>
                    Vehicle Details, RC & Insurance Compliance
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Verify the vehicle (Bike, Car, Van) used for tourist services. Upload Registration Certificate (RC) and insurance.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Step 3 of 3
                </span>
              </div>

              {/* Vehicle Category Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Select Vehicle Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'bike', label: 'Bike / Two-Wheeler', icon: Bike, desc: 'Pillion tourist rides' },
                    { id: 'car', label: 'Car / Sedan / SUV', icon: Car, desc: 'Chauffeur tourist trips' },
                    { id: 'van', label: 'Passenger Van', icon: Truck, desc: 'Group & family tours' },
                  ].map((v) => {
                    const Icon = v.icon
                    const isSelected = vehicleType === v.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleType(v.id as any)}
                        disabled={status === 'verified'}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-emerald-700' : 'text-gray-500'}`} />
                        <h4 className="text-xs font-bold text-gray-900">{v.label}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{v.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Vehicle Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Make / Brand <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="e.g. Royal Enfield / Toyota"
                    required
                    disabled={status === 'verified'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Model Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Classic 350 / Innova"
                    required
                    disabled={status === 'verified'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registration Number (RC) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={vehicleRegNumber}
                    onChange={(e) => setVehicleRegNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. TN 38 BK 4521"
                    required
                    disabled={status === 'verified'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Manufacturing Year
                  </label>
                  <Input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    placeholder="e.g. 2023"
                    disabled={status === 'verified'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Passenger Seating Capacity
                  </label>
                  <Input
                    type="number"
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                    placeholder="e.g. 2 for bike, 4-7 for car, 12 for van"
                    disabled={status === 'verified'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    disabled={status === 'verified'}
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric (EV)">Electric (EV)</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Insurance Valid Until
                  </label>
                  <Input
                    type="date"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                    disabled={status === 'verified'}
                  />
                </div>
              </div>

              {/* Vehicle Compliance Documents Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {renderDocUploadCard('RC Document Photo', rcDocument, setRcDocument, fileInputRcRef, true)}
                {renderDocUploadCard('Vehicle Insurance Policy', insuranceDocument, setInsuranceDocument, fileInputInsuranceRef, true)}
                {renderDocUploadCard('Fitness / Pollution (PUC)', fitnessDocument, setFitnessDocument, fileInputFitnessRef, false)}
                {renderDocUploadCard('Exterior Vehicle Photo', vehiclePhoto, setVehiclePhoto, fileInputVehiclePhotoRef, false)}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBMIT ACTION BAR                                         */}
          {/* ========================================================= */}
          {status !== 'verified' && (
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    Ready to submit complete dossier for Admin Review?
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                    3 Sections
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Once submitted, the platform admin will audit your Aadhaar ID, driving licence, and vehicle RC/insurance to activate your marketplace listings.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={submitting}
                  className="w-full sm:w-auto px-8"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  {submitting ? 'Submitting Dossier...' : 'Send for Admin Approval'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}
