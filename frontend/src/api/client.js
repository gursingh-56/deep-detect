/**
 * HTTP client for the Deepfake Detection Django backend.
 *
 * In development VITE_API_BASE_URL is empty and requests go to /api/... , which
 * the Vite dev server proxies to http://127.0.0.1:8000. In production it is set
 * to the deployed backend origin and requests go there cross-origin (the Django
 * CorsMiddleware allows it).
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const endpoint = (path) => `${BASE_URL}${path}`

/** Pull a useful message out of the backend's JSON error envelope. */
async function readError(response) {
  try {
    const body = await response.json()
    if (body && body.error) return body.error
  } catch {
    // Non-JSON body (a proxy error page, say) — fall through to the status text.
  }
  return `Request failed with status ${response.status}`
}

/** GET /api/health/ — used to show whether the backend is reachable. */
export async function checkHealth() {
  const response = await fetch(endpoint('/api/health/'), { method: 'GET' })
  if (!response.ok) throw new Error(await readError(response))
  return response.json()
}

/**
 * POST /api/predict/ — upload a video and get the REAL/FAKE verdict.
 *
 * @param {File} file            the video to analyse
 * @param {number} sequenceLength how many frames the model should sample
 * @param {AbortSignal} [signal] lets the caller cancel an in-flight analysis
 * @returns {Promise<{result: string, confidence: number, frames_analyzed: number,
 *                    sequence_length: number, processing_time_seconds: number,
 *                    filename: string}>}
 */
export async function predictVideo(file, sequenceLength, signal) {
  const body = new FormData()
  body.append('video', file)
  body.append('sequence_length', String(sequenceLength))

  const response = await fetch(endpoint('/api/predict/'), {
    method: 'POST',
    body,
    signal,
  })

  if (!response.ok) throw new Error(await readError(response))
  return response.json()
}
