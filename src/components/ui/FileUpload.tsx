'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, X, File, Image as ImageIcon } from 'lucide-react'

export interface FileUploadProps {
  onUpload: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSizeMB?: number
  currentFiles?: string[]
  onRemoveCurrent?: (index: number) => void
  label?: string
  helperText?: string
  className?: string
}

export function FileUpload({
  onUpload,
  accept = 'image/*',
  maxFiles = 5,
  maxSizeMB = 5,
  currentFiles = [],
  onRemoveCurrent,
  label,
  helperText,
  className = '',
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndAddFiles = (selectedFiles: FileList | null) => {
    setError(null)
    if (!selectedFiles || selectedFiles.length === 0) return

    const fileList = Array.from(selectedFiles)

    if (currentFiles.length + fileList.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} files`)
      return
    }

    const invalidSize = fileList.some((f) => f.size > maxSizeMB * 1024 * 1024)
    if (invalidSize) {
      setError(`File size cannot exceed ${maxSizeMB}MB`)
      return
    }

    onUpload(fileList)
  }

  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          validateAndAddFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-primary-500 bg-primary-50/50'
            : 'border-gray-300 hover:border-primary-400 bg-gray-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => validateAndAddFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            Click to upload <span className="font-normal text-gray-500">or drag and drop</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {accept.includes('image') ? 'PNG, JPG, WEBP' : 'Files'} up to {maxSizeMB}MB (Max {maxFiles} files)
          </p>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400 mt-1.5">{helperText}</p>}

      {currentFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {currentFiles.map((url, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
              <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
              {onRemoveCurrent && (
                <button
                  type="button"
                  onClick={() => onRemoveCurrent(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

