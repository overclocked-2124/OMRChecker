'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, FileText, Settings, CheckSquare, X, Check } from 'lucide-react'
import { processOMRSheets } from '@/lib/api'
import { useBuilder } from '@/contexts/BuilderContext'

interface UploadSectionProps {
  onResults: (results: any) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

export default function UploadSection({
  onResults,
  isProcessing,
  setIsProcessing,
}: UploadSectionProps) {
  const { savedTemplate, savedConfig, savedEvaluation } = useBuilder()
  const [images, setImages] = useState<File[]>([])
  const [template, setTemplate] = useState<File | null>(null)
  const [config, setConfig] = useState<File | null>(null)
  const [evaluation, setEvaluation] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [useBuilderFiles, setUseBuilderFiles] = useState({
    template: false,
    config: false,
    evaluation: false
  })

  // Check if builder files are available
  useEffect(() => {
    if (savedTemplate && !template) {
      setUseBuilderFiles(prev => ({ ...prev, template: true }))
    }
    if (savedConfig && !config) {
      setUseBuilderFiles(prev => ({ ...prev, config: true }))
    }
    if (savedEvaluation && !evaluation) {
      setUseBuilderFiles(prev => ({ ...prev, evaluation: true }))
    }
  }, [savedTemplate, savedConfig, savedEvaluation])

  // Image dropzone
  const onDropImages = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles])
    setError(null)
  }, [])

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: true,
  })

  // Template dropzone
  const onDropTemplate = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setTemplate(acceptedFiles[0])
    }
  }, [])

  const {
    getRootProps: getTemplateRootProps,
    getInputProps: getTemplateInputProps,
    isDragActive: isTemplateDragActive,
  } = useDropzone({
    onDrop: onDropTemplate,
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
  })

  // Config dropzone
  const onDropConfig = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setConfig(acceptedFiles[0])
    }
  }, [])

  const {
    getRootProps: getConfigRootProps,
    getInputProps: getConfigInputProps,
    isDragActive: isConfigDragActive,
  } = useDropzone({
    onDrop: onDropConfig,
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
  })

  // Evaluation dropzone
  const onDropEvaluation = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setEvaluation(acceptedFiles[0])
    }
  }, [])

  const {
    getRootProps: getEvaluationRootProps,
    getInputProps: getEvaluationInputProps,
    isDragActive: isEvaluationDragActive,
  } = useDropzone({
    onDrop: onDropEvaluation,
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
  })

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (images.length === 0) {
      setError('Please upload at least one OMR sheet image')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Convert builder objects to Files if using them
      let templateFile = template
      let configFile = config
      let evaluationFile = evaluation

      if (useBuilderFiles.template && savedTemplate && !template) {
        const blob = new Blob([JSON.stringify(savedTemplate, null, 2)], { type: 'application/json' })
        templateFile = new File([blob], 'template.json', { type: 'application/json' })
      }

      if (useBuilderFiles.config && savedConfig && !config) {
        const blob = new Blob([JSON.stringify(savedConfig, null, 2)], { type: 'application/json' })
        configFile = new File([blob], 'config.json', { type: 'application/json' })
      }

      if (useBuilderFiles.evaluation && savedEvaluation && !evaluation) {
        const blob = new Blob([JSON.stringify(savedEvaluation, null, 2)], { type: 'application/json' })
        evaluationFile = new File([blob], 'evaluation.json', { type: 'application/json' })
      }

      const results = await processOMRSheets(images, templateFile, configFile, evaluationFile)
      onResults(results)
    } catch (err: any) {
      setError(err.message || 'Failed to process OMR sheets')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Files</h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Images Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OMR Sheet Images *
        </label>
        <div
          {...getImageRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isImageDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getImageInputProps()} />
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {isImageDragActive
              ? 'Drop the images here...'
              : 'Drag & drop OMR sheet images here, or click to select'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Supports PNG, JPG, JPEG</p>
        </div>

        {/* Image List */}
        {images.length > 0 && (
          <div className="mt-4 space-y-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded"
              >
                <div className="flex items-center space-x-2">
                  <File className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{image.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(image.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optional Files */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Template Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template (Optional)
          </label>
          {useBuilderFiles.template && savedTemplate && !template ? (
            <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 text-center">
              <Check className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-xs text-green-700 font-medium">Using Builder Template</p>
              <button
                onClick={() => setUseBuilderFiles(prev => ({ ...prev, template: false }))}
                className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
              >
                Upload different file
              </button>
            </div>
          ) : (
            <div
              {...getTemplateRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isTemplateDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getTemplateInputProps()} />
              <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-600">
                {template ? template.name : 'template.json'}
              </p>
            </div>
          )}
        </div>

        {/* Config Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Config (Optional)
          </label>
          {useBuilderFiles.config && savedConfig && !config ? (
            <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 text-center">
              <Check className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-xs text-green-700 font-medium">Using Builder Config</p>
              <button
                onClick={() => setUseBuilderFiles(prev => ({ ...prev, config: false }))}
                className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
              >
                Upload different file
              </button>
            </div>
          ) : (
            <div
              {...getConfigRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isConfigDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getConfigInputProps()} />
              <Settings className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-600">
                {config ? config.name : 'config.json'}
              </p>
            </div>
          )}
        </div>

        {/* Evaluation Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evaluation (Optional)
          </label>
          {useBuilderFiles.evaluation && savedEvaluation && !evaluation ? (
            <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 text-center">
              <Check className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-xs text-green-700 font-medium">Using Builder Answer Key</p>
              <button
                onClick={() => setUseBuilderFiles(prev => ({ ...prev, evaluation: false }))}
                className="text-xs text-green-600 hover:text-green-800 mt-1 underline"
              >
                Upload different file
              </button>
            </div>
          ) : (
            <div
              {...getEvaluationRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isEvaluationDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getEvaluationInputProps()} />
              <CheckSquare className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-600">
                {evaluation ? evaluation.name : 'evaluation.json'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isProcessing || images.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          isProcessing || images.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Process OMR Sheets'}
      </button>
    </div>
  )
}
