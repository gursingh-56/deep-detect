export default function ResultCard({ result }) {
  const isReal = result.result === 'REAL'

  return (
    <section className={`result result-${isReal ? 'real' : 'fake'}`}>
      <div className="result-head">
        <span className="result-label">Verdict</span>
        <h3>{result.result}</h3>
      </div>

      <div className="meter" aria-hidden="true">
        <span className="meter-fill" style={{ width: `${result.confidence}%` }} />
      </div>
      <p className="result-confidence">
        {result.confidence}% confidence
      </p>

      <dl className="result-meta">
        <div>
          <dt>File</dt>
          <dd>{result.filename}</dd>
        </div>
        <div>
          <dt>Frames analysed</dt>
          <dd>
            {result.frames_analyzed} / {result.sequence_length}
          </dd>
        </div>
        <div>
          <dt>Inference time</dt>
          <dd>{result.processing_time_seconds}s</dd>
        </div>
      </dl>
    </section>
  )
}
