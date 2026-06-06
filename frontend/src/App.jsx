import { useCallback, useEffect, useRef, useState } from 'react'
import { checkHealth, predictVideo } from './api/client.js'
import UploadPanel from './components/UploadPanel.jsx'
import ResultCard from './components/ResultCard.jsx'
import BackendStatus from './components/BackendStatus.jsx'

const ACCEPTED = ['mp4', 'mov', 'gif', 'webm', 'avi', '3gp', 'wmv', 'flv', 'mkv']

export default function App() {
  const [file, setFile] = useState(null)
  const [sequenceLength, setSequenceLength] = useState(100)
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [backend, setBackend] = useState({ state: 'checking' })
  const abortRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    checkHealth()
      .then((data) => !cancelled && setBackend({ state: 'online', ...data }))
      .catch((err) => !cancelled && setBackend({ state: 'offline', message: err.message }))
    return () => {
      cancelled = true
    }
  }, [])

  // Abort any in-flight upload if the component goes away mid-analysis.
  useEffect(() => () => abortRef.current?.abort(), [])

  const handleSelect = useCallback((selected) => {
    setResult(null)
    setError(null)
    setStatus('idle')

    if (!selected) {
      setFile(null)
      return
    }
    const extension = selected.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED.includes(extension)) {
      setFile(null)
      setError(`Unsupported format ".${extension}". Accepted: ${ACCEPTED.join(', ')}`)
      setStatus('error')
      return
    }
    setFile(selected)
  }, [])

  const handleAnalyse = useCallback(async () => {
    if (!file) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setError(null)
    setResult(null)
    try {
      const data = await predictVideo(file, sequenceLength, controller.signal)
      setResult(data)
      setStatus('done')
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setStatus('error')
    }
  }, [file, sequenceLength])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <h1>DeepDetect</h1>
        </div>
        <BackendStatus backend={backend} />
      </header>

      <main className="main">
        <section className="intro">
          <h2>Is this video real?</h2>
          <p>
            Upload a clip and the ResNeXt&nbsp;+&nbsp;LSTM model behind the API samples its
            frames, isolates the faces, and returns a confidence-scored verdict.
          </p>
        </section>

        <UploadPanel
          file={file}
          sequenceLength={sequenceLength}
          status={status}
          onSelect={handleSelect}
          onSequenceLengthChange={setSequenceLength}
          onAnalyse={handleAnalyse}
          onCancel={handleCancel}
          disabled={backend.state === 'offline'}
        />

        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        {result && <ResultCard result={result} />}
      </main>

      <footer className="footer">
        Deepfake Detection using Deep Learning · React client over the Django inference API
      </footer>
    </div>
  )
}
