'use client'

import { Download, FileText, Image as ImageIcon } from 'lucide-react'
import { getDownloadUrl } from '@/lib/api'

interface ResultsSectionProps {
  results: any
  isProcessing: boolean
}

export default function ResultsSection({
  results,
  isProcessing,
}: ResultsSectionProps) {
  const downloadFile = (jobId: string, filePath: string, fileName?: string) => {
    const url = getDownloadUrl(jobId, filePath)
    const resolvedName = fileName ?? filePath.split('/').pop() ?? filePath
    const link = document.createElement('a')
    link.href = url
    link.download = resolvedName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isProcessing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing OMR sheets...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Results</h2>

      {/* Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-green-800 font-medium">{results.message}</p>
        </div>
        <p className="text-sm text-green-700 mt-2">
          Files processed: {results.files_processed}
        </p>
      </div>

      {/* CSV Results */}
      {results.csv_file && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            CSV Results
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {results.csv_file.split('/').pop() ?? results.csv_file}
                  </p>
                  <p className="text-xs text-gray-500">Results CSV file</p>
                </div>
              </div>
              <button
                onClick={() => downloadFile(results.job_id, results.csv_file)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Output Images */}
      {results.output_images && results.output_images.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Output Images ({results.output_images.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.output_images.map((image: string, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-700 truncate">
                      {image.split('/').pop() ?? image}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => downloadFile(results.job_id, image)}
                  className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition-colors text-sm"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download All Button */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-600 mb-4">
          Job ID: <code className="bg-gray-100 px-2 py-1 rounded">{results.job_id}</code>
        </p>
        <p className="text-xs text-gray-500">
          All processed files are stored in the outputs directory and can be
          downloaded individually above.
        </p>
      </div>
    </div>
  )
}
