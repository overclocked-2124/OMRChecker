'use client'

import { useState } from 'react'
import Link from 'next/link'
import UploadSection from '@/components/UploadSection'
import ResultsSection from '@/components/ResultsSection'
import { FileUp, CheckCircle2, Layout, Settings, CheckSquare } from 'lucide-react'

export default function Home() {
  const [results, setResults] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">OMRChecker</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Fast and accurate OMR sheet processing
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-2">
              <Link
                href="/template-builder"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Layout className="w-4 h-4" />
                <span>Template Builder</span>
              </Link>
              <Link
                href="/config-builder"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Config Builder</span>
              </Link>
              <Link
                href="/evaluation-builder"
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Answer Key</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <FileUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                How to use OMRChecker
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                1. Create your template, config, and answer key using the builders above (or upload existing files)
                <br />
                2. Upload your OMR sheet images (PNG, JPG, JPEG)
                <br />
                3. Click &quot;Process OMR Sheets&quot; and view the results
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <UploadSection
          onResults={setResults}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />

        {/* Results Section */}
        {results && (
          <ResultsSection results={results} isProcessing={isProcessing} />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            OMRChecker - Open Source OMR Sheet Processing
            <a
              href="https://github.com/Udayraj123/OMRChecker"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}
