import { useRef, useState } from 'react'

const SEQUENCE_OPTIONS = [10, 20, 40, 60, 80, 100]

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}

export default function UploadPanel({
  file,
  sequenceLength,
  status,
  onSelect,
  onSequenceLengthChange,
  onAnalyse,
  onCancel,
  disabled,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const loading = status === 'loading'

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (disabled || loading) return
    onSelect(event.dataTransfer.files?.[0] ?? null)
  }

  return (
    <section className="panel">
      <div
        className={`dropzone${dragging ? ' dropzone-active' : ''}${file ? ' dropzone-filled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <p className="dropzone-title">{file.name}</p>
            <p className="dropzone-hint">{formatSize(file.size)} · click to replace</p>
          </>
        ) : (
          <>
            <p className="dropzone-title">Drop a video here</p>
            <p className="dropzone-hint">or click to browse — mp4, mov, avi, webm, mkv…</p>
          </>
        )}
      </div>

      <div className="controls">
        <label className="field">
          <span>Frames sampled</span>
          <select
            value={sequenceLength}
            disabled={loading}
            onChange={(e) => onSequenceLengthChange(Number(e.target.value))}
          >
            {SEQUENCE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        {loading ? (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAnalyse}
            disabled={!file || disabled}
          >
            Analyse video
          </button>
        )}
      </div>

      {loading && (
        <div className="progress" role="status">
          <span className="progress-bar" />
          <span>Sampling {sequenceLength} frames and running inference…</span>
        </div>
      )}
    </section>
  )
}
