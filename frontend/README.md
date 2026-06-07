# DeepDetect — React Frontend

React client for the Deepfake Detection Django service. Upload a video, the
backend samples its frames through the ResNeXt + LSTM model, and the UI shows a
REAL/FAKE verdict with a confidence score.

## Requirements

- Node 18+
- The Django backend running on `http://127.0.0.1:8000` (see `Django Application/README.md`)

## Getting started

```bash
cd frontend
npm install
npm run dev
```

The app is served at http://localhost:5173.

## How it talks to the backend

All backend access lives in [`src/api/client.js`](src/api/client.js):

| Function | Endpoint | Purpose |
| --- | --- | --- |
| `checkHealth()` | `GET /api/health/` | Reports whether the service is up, on CPU or GPU, and whether a model file is present |
| `predictVideo(file, sequenceLength, signal)` | `POST /api/predict/` | Uploads the video as `multipart/form-data` and returns the verdict |

`POST /api/predict/` responds with:

```json
{
  "result": "FAKE",
  "confidence": 93.41,
  "sequence_length": 100,
  "frames_analyzed": 100,
  "processing_time_seconds": 12.7,
  "filename": "clip.mp4"
}
```

Errors come back as `{ "error": "..." }` with a 4xx/5xx status, which the client
surfaces to the UI.

## Configuration

In development, `vite.config.js` proxies `/api` to `http://127.0.0.1:8000`, so no
configuration is needed. Override the target with `VITE_PROXY_TARGET`.

For a production build, copy `.env.example` to `.env` and set
`VITE_API_BASE_URL` to the deployed backend origin. Requests then go
cross-origin, which the backend's `CorsMiddleware` permits — add the frontend's
origin to `CORS_ALLOWED_ORIGINS` in `project_settings/settings.py`.

## Build

```bash
npm run build   # emits dist/
npm run preview
```
