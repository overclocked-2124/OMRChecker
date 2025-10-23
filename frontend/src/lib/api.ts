import axios from 'axios'

const DEFAULT_BASE_URL = 'http://localhost:8000'

const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL).trim()
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '')
const hasApiSuffix = normalizedBaseUrl.toLowerCase().endsWith('/api')

export const SERVER_BASE_URL = hasApiSuffix
  ? normalizedBaseUrl.slice(0, -4)
  : normalizedBaseUrl

export const API_BASE_URL = hasApiSuffix
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')
const trimLeadingSlash = (value: string) => value.replace(/^\/+/, '')

const joinUrl = (base: string, path = '') => {
  const sanitizedBase = trimTrailingSlash(base)
  const sanitizedPath = trimLeadingSlash(path)
  return sanitizedPath ? `${sanitizedBase}/${sanitizedPath}` : sanitizedBase
}

export const getServerUrl = (path = '') => joinUrl(SERVER_BASE_URL, path)
export const getApiUrl = (path = '') => joinUrl(API_BASE_URL, path)

export const getDownloadUrl = (jobId: string, filePath: string) =>
  getApiUrl(`download/${jobId}/${filePath}`)

export interface ProcessResult {
  status: string
  message: string
  output_path: string
  files_processed: number
  csv_file?: string
  output_images: string[]
  job_id: string
}

export async function processOMRSheets(
  images: File[],
  template: File | null,
  config: File | null,
  evaluation: File | null
): Promise<ProcessResult> {
  const formData = new FormData()

  // Add images
  images.forEach((image) => {
    formData.append('images', image)
  })

  // Add optional files
  if (template) {
    formData.append('template', template)
  }
  if (config) {
    formData.append('config', config)
  }
  if (evaluation) {
    formData.append('evaluation', evaluation)
  }

  try {
    const response = await axios.post<ProcessResult>(
      getApiUrl('process'),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout
      }
    )

    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to process OMR sheets')
    } else if (error.request) {
      throw new Error('No response from server. Please check if the API is running.')
    } else {
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
}

export async function cleanupJob(jobId: string): Promise<void> {
  try {
    await axios.delete(getApiUrl(`cleanup/${jobId}`))
  } catch (error) {
    console.error('Failed to cleanup job:', error)
  }
}

export async function listSamples() {
  try {
    const response = await axios.get(getApiUrl('samples'))
    return response.data
  } catch (error) {
    console.error('Failed to list samples:', error)
    return { samples: [] }
  }
}

export interface AutoDetectResult {
  status: string
  template: any
  job_id: string
  marked_image: string
}

export async function autoDetectTemplate(image: File): Promise<AutoDetectResult> {
  const formData = new FormData()
  formData.append('image', image)

  try {
    const response = await axios.post<AutoDetectResult>(
      getApiUrl('auto-detect'),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute timeout
      }
    )

    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to auto-detect template')
    } else if (error.request) {
      throw new Error('No response from server. Please check if the API is running.')
    } else {
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
}
