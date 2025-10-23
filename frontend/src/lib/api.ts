import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
      `${API_BASE_URL}/api/process`,
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
    await axios.delete(`${API_BASE_URL}/api/cleanup/${jobId}`)
  } catch (error) {
    console.error('Failed to cleanup job:', error)
  }
}

export async function listSamples() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/samples`)
    return response.data
  } catch (error) {
    console.error('Failed to list samples:', error)
    return { samples: [] }
  }
}
