# DeepDetect

Deepfake video detection using deep learning. A Django inference service wrapping a
ResNeXt50 + LSTM model, with a React client that talks to it over a JSON API.

## How it works

A video is sampled into frames, each frame is cropped to the detected face, and the
resulting sequence is fed through a ResNeXt50 CNN to produce per-frame feature
vectors. An LSTM consumes that sequence and classifies the clip as REAL or FAKE with
a confidence score. Because the temporal model sees the whole sequence, it picks up
frame-to-frame inconsistencies that a single-frame classifier would miss.

## Layout

```
Django Application/    inference service - model, views, JSON API
  ml_app/              views, API endpoints, forms
  project_settings/    Django settings, WSGI/ASGI
  models/              trained .pt weights (not in version control)
frontend/              React client (Vite)
  src/api/client.js    the only place that talks to the backend
Model Creation/        preprocessing and training notebooks
webui/                 standalone landing page
```

## Running the backend

Requires Python 3.6+ and a trained model. A CUDA GPU is recommended; the service
falls back to CPU automatically.

```bash
cd "Django Application"
python -m venv venv
venv\Scripts\activate          # Windows;  source venv/bin/activate on Linux/macOS
pip install -r requirements.txt
python manage.py runserver
```

Put your `.pt` weights in `Django Application/models/`. The filename encodes the
frame count as the fourth underscore-separated field — `model_93_acc_100_frames_celeb_FF_data.pt`
is a 93%-accuracy model trained on 100 frames — and the service picks the model
matching the requested sequence length.

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Served at http://localhost:5173. The dev server proxies `/api` to
`http://127.0.0.1:8000`, so both halves run together with no extra configuration.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health/` | Liveness, CPU/GPU, whether a model file is present |
| `POST` | `/api/predict/` | Multipart video upload, returns the verdict |

`POST /api/predict/` takes a `video` file and an optional `sequence_length`:

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

Errors return `{ "error": "..." }` with a 4xx/5xx status.

## Training your own model

See `Model Creation/` for the preprocessing, training, and prediction notebooks.
