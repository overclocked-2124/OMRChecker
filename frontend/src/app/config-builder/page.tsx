'use client'

import { useState } from 'react'
import { ArrowLeft, Download, Upload, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBuilder } from '@/contexts/BuilderContext'

interface Config {
  dimensions: {
    processing_height: number
    processing_width: number
    display_height: number
    display_width: number
  }
  alignment_params: {
    auto_align: boolean
    max_matching_variation: number
  }
  thresholding_params: {
    MIN_GAP: number
    GLOBAL_PAGE_THRESHOLD_WHITE: number
    GLOBAL_PAGE_THRESHOLD_BLACK: number
  }
  outputs: {
    save_image_level: number
    show_image_level: number
    save_detections: boolean
  }
}

export default function ConfigBuilder() {
  const router = useRouter()
  const { setSavedConfig } = useBuilder()
  const [config, setConfig] = useState<Config>({
    dimensions: {
      processing_height: 1700,
      processing_width: 1200,
      display_height: 960,
      display_width: 720
    },
    alignment_params: {
      auto_align: true,
      max_matching_variation: 10
    },
    thresholding_params: {
      MIN_GAP: 30,
      GLOBAL_PAGE_THRESHOLD_WHITE: 200,
      GLOBAL_PAGE_THRESHOLD_BLACK: 100
    },
    outputs: {
      save_image_level: 2,
      show_image_level: 0,
      save_detections: true
    }
  })

  const updateDimensions = (key: keyof Config['dimensions'], value: number) => {
    setConfig({
      ...config,
      dimensions: { ...config.dimensions, [key]: value }
    })
  }

  const updateAlignmentParams = (key: keyof Config['alignment_params'], value: boolean | number) => {
    setConfig({
      ...config,
      alignment_params: { ...config.alignment_params, [key]: value }
    })
  }

  const updateThresholdingParams = (key: keyof Config['thresholding_params'], value: number) => {
    setConfig({
      ...config,
      thresholding_params: { ...config.thresholding_params, [key]: value }
    })
  }

  const updateOutputs = (key: keyof Config['outputs'], value: number | boolean) => {
    setConfig({
      ...config,
      outputs: { ...config.outputs, [key]: value }
    })
  }

  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveAndUse = () => {
    setSavedConfig(config)
    router.push('/')
  }

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string)
        setConfig(importedConfig)
      } catch (error) {
        alert('Invalid config file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <h1 className="text-2xl font-bold text-gray-900">Config Builder</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={saveAndUse}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                <span>Save & Use</span>
              </button>
              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfig}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportConfig}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export Config</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Dimensions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Dimensions</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure the processing and display dimensions for OMR sheets.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Width (px)
                </label>
                <input
                  type="number"
                  value={config.dimensions.processing_width}
                  onChange={(e) => updateDimensions('processing_width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Height (px)
                </label>
                <input
                  type="number"
                  value={config.dimensions.processing_height}
                  onChange={(e) => updateDimensions('processing_height', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Width (px)
                </label>
                <input
                  type="number"
                  value={config.dimensions.display_width}
                  onChange={(e) => updateDimensions('display_width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Height (px)
                </label>
                <input
                  type="number"
                  value={config.dimensions.display_height}
                  onChange={(e) => updateDimensions('display_height', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Alignment Parameters */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alignment Parameters</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure automatic alignment and rotation correction settings.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Auto Align
                  </label>
                  <p className="text-xs text-gray-600">
                    Automatically align and rotate OMR sheets
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.alignment_params.auto_align}
                    onChange={(e) => updateAlignmentParams('auto_align', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Matching Variation
                </label>
                <input
                  type="number"
                  value={config.alignment_params.max_matching_variation}
                  onChange={(e) => updateAlignmentParams('max_matching_variation', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum variation allowed for feature matching (pixels)
                </p>
              </div>
            </div>
          </div>

          {/* Thresholding Parameters */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thresholding Parameters</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure bubble detection thresholds for optimal recognition.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Gap
                </label>
                <input
                  type="number"
                  value={config.thresholding_params.MIN_GAP}
                  onChange={(e) => updateThresholdingParams('MIN_GAP', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum gap between filled and empty bubbles
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Global Page Threshold (White)
                </label>
                <input
                  type="number"
                  value={config.thresholding_params.GLOBAL_PAGE_THRESHOLD_WHITE}
                  onChange={(e) => updateThresholdingParams('GLOBAL_PAGE_THRESHOLD_WHITE', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="255"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Threshold for white pixels (0-255)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Global Page Threshold (Black)
                </label>
                <input
                  type="number"
                  value={config.thresholding_params.GLOBAL_PAGE_THRESHOLD_BLACK}
                  onChange={(e) => updateThresholdingParams('GLOBAL_PAGE_THRESHOLD_BLACK', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="255"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Threshold for black pixels (0-255)
                </p>
              </div>
            </div>
          </div>

          {/* Output Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Output Settings</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure what outputs to generate during processing.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Save Image Level
                </label>
                <select
                  value={config.outputs.save_image_level}
                  onChange={(e) => updateOutputs('save_image_level', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>None</option>
                  <option value={1}>Final only</option>
                  <option value={2}>Intermediate + Final</option>
                  <option value={3}>All images</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Level of detail for saved images
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Image Level
                </label>
                <select
                  value={config.outputs.show_image_level}
                  onChange={(e) => updateOutputs('show_image_level', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>None</option>
                  <option value={1}>Final only</option>
                  <option value={2}>Intermediate + Final</option>
                  <option value={3}>All images</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Level of detail for displayed images during processing
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Save Detections
                  </label>
                  <p className="text-xs text-gray-600">
                    Save detailed detection data to JSON
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.outputs.save_detections}
                    onChange={(e) => updateOutputs('save_detections', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
