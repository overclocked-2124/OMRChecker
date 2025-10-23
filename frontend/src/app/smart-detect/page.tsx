'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, Upload, Sparkles, Download, Save, Check, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { autoDetectTemplate, getDownloadUrl, getServerUrl } from '@/lib/api'
import { useBuilder } from '@/contexts/BuilderContext'

export default function SmartDetection() {
  const router = useRouter()
  const { setSavedTemplate, setSavedEvaluation } = useBuilder()
  
  const [step, setStep] = useState<'upload' | 'detecting' | 'review' | 'answers'>('upload')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [detectedTemplate, setDetectedTemplate] = useState<any>(null)
  const [markedImageUrl, setMarkedImageUrl] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [templateName, setTemplateName] = useState('Auto-Detected Template')
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  // Check API health on mount
  useEffect(() => {
    const checkApi = async () => {
      const healthUrl = getServerUrl()
      try {
        const response = await fetch(healthUrl)
        if (response.ok) {
          setApiOnline(true)
        } else {
          setApiOnline(false)
        }
      } catch {
        setApiOnline(false)
      }
    }
    checkApi()
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setUploadedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: false,
  })

  const handleDetect = async () => {
    if (!uploadedImage) return

    setStep('detecting')
    setError(null)

    try {
      console.log('Starting auto-detection for:', uploadedImage.name)
      const result = await autoDetectTemplate(uploadedImage)
      console.log('Detection result:', result)
      
      setDetectedTemplate(result.template)
      setJobId(result.job_id)
  setMarkedImageUrl(getDownloadUrl(result.job_id, result.marked_image))
      
      // Initialize answers array
      const numQuestions = result.template.detected_info.valid_questions
      setAnswers(new Array(numQuestions).fill('A'))
      
      setStep('review')
    } catch (err: any) {
      console.error('Detection error:', err)
      const serverUrl = getServerUrl()
      setError(
        err.message ||
          `Failed to detect template. Make sure the backend API is running on ${serverUrl}`
      )
      setStep('upload')
    }
  }

  const handleEditTemplate = () => {
    setSavedTemplate(detectedTemplate)
    router.push('/template-builder')
  }

  const handleProceedToAnswers = () => {
    setStep('answers')
  }

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  const handleSaveAndUse = () => {
    // Save template
    setSavedTemplate(detectedTemplate)
    
    // Create evaluation
    const evaluation = {
      answers_in_order: true,
      should_explain_scoring: true,
      marking_scheme: {
        correct: 4,
        incorrect: -1,
        unmarked: 0
      },
      answers: answers.map((answer, index) => ({
        question: `Q${index + 1}`,
        answer: answer,
        score: 4
      }))
    }
    setSavedEvaluation(evaluation)
    
    // Navigate to main page
    router.push('/')
  }

  const exportTemplate = () => {
    if (!detectedTemplate) return
    
    const blob = new Blob([JSON.stringify(detectedTemplate, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'auto-detected-template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAnswerKey = () => {
    const evaluation = {
      answers_in_order: true,
      should_explain_scoring: true,
      marking_scheme: {
        correct: 4,
        incorrect: -1,
        unmarked: 0
      },
      answers: answers.map((answer, index) => ({
        question: `Q${index + 1}`,
        answer: answer,
        score: 4
      }))
    }
    
    const blob = new Blob([JSON.stringify(evaluation, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'answer-key.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Smart OMR Detection</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium">Upload</span>
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'detecting' || step === 'review' || step === 'answers' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'detecting' || step === 'review' || step === 'answers' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">Detect</span>
            </div>
            <div className="w-16 h-1 bg-gray-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'answers' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'answers' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-medium">Answers</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Sample OMR Sheet
            </h2>
            <p className="text-gray-600 mb-6">
              Upload a clear image of your OMR sheet. Our AI will automatically detect the layout, bubbles, and questions.
            </p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                {isDragActive
                  ? 'Drop the image here...'
                  : 'Drag & drop an OMR sheet image here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">Supports PNG, JPG, JPEG</p>
            </div>

            {previewUrl && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={handleDetect}
                  className="mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Auto-Detect Layout</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Detecting Step */}
        {step === 'detecting' && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing OMR Sheet...</h3>
            <p className="text-gray-600">
              Our AI is detecting bubbles, questions, and layout. This may take a moment.
            </p>
          </div>
        )}

        {/* Review Step */}
        {step === 'review' && detectedTemplate && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detection Results</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Detected Layout:</h3>
                  {markedImageUrl && (
                    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                      <img
                        src={markedImageUrl}
                        alt="Detected Layout"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Detected Information:</h3>
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Questions Detected</span>
                      </div>
                      <p className="text-3xl font-bold text-green-600">
                        {detectedTemplate.detected_info.valid_questions}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Options per Question</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {detectedTemplate.detected_info.options_per_question}
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Bubbles</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {detectedTemplate.detected_info.total_bubbles}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleEditTemplate}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit Template</span>
                    </button>
                    <button
                      onClick={exportTemplate}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Template</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToAnswers}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                <span>Continue to Answer Entry</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* Answers Step */}
        {step === 'answers' && detectedTemplate && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Enter Answer Key</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Set the correct answer for each of the {detectedTemplate.detected_info.valid_questions} questions
                </p>
              </div>
              <button
                onClick={exportAnswerKey}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6 max-h-96 overflow-y-auto p-2">
              {answers.map((answer, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-700 w-12">Q{index + 1}:</label>
                  <select
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    {Array.from({ length: detectedTemplate.detected_info.options_per_question }, (_, i) => (
                      <option key={i} value={String.fromCharCode(65 + i)}>
                        {String.fromCharCode(65 + i)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name (Optional)
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My OMR Template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleSaveAndUse}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <Save className="w-5 h-5" />
                <span>Save & Use for Batch Processing</span>
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                This will save the template and answer key for use on the main page
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
