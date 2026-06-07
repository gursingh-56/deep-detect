const LABELS = {
  checking: 'Checking backend…',
  online: 'Backend online',
  offline: 'Backend unreachable',
}

export default function BackendStatus({ backend }) {
  const detail =
    backend.state === 'online'
      ? `${backend.device === 'gpu' ? 'GPU' : 'CPU'}${backend.model_available ? '' : ' · no model loaded'}`
      : backend.message

  return (
    <div className={`status status-${backend.state}`} title={detail || ''}>
      <span className="status-dot" aria-hidden="true" />
      <span>{LABELS[backend.state]}</span>
      {detail && <span className="status-detail">{detail}</span>}
    </div>
  )
}
