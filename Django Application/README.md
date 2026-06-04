# DeepDetect — Django Inference Service

Django application serving the ResNeXt50 + LSTM deepfake detection model, both as
server-rendered pages and as a JSON API.

## Requirements

- Python >= 3.6, Django >= 3.0
- A CUDA GPU is recommended (CUDA >= 10.0, compute capability > 3.0). Without one
  the service runs on CPU, more slowly.

Full dependency list in [requirements.txt](requirements.txt).

## Directory structure

```
ml_app/            views.py (pages), api_views.py (JSON API), middleware.py (CORS)
project_settings/  Django settings and production entrypoints
static/            css, js, and face-api json assets
templates/         base layout, nav, footer
models/            trained .pt weights - create this directory
uploaded_videos/   upload scratch space - create this directory
uploaded_images/   preprocessing output - create this directory
```

`models/`, `uploaded_videos/`, and `uploaded_images/` must exist and be writable
before the first run. Their contents are excluded from version control.

## Setup

```bash
python -m venv venv
venv\Scripts\activate          # Windows;  source venv/bin/activate on Linux/macOS
pip install -r requirements.txt
python manage.py runserver
```

### Model weights

Copy your trained `.pt` file into `models/`. Train one with the notebooks in the
`Model Creation/` directory at the repository root.

The filename must follow `model_<accuracy>_acc_<frames>_frames_<dataset>.pt` — the
frame count is read from the fourth underscore-separated field, so
`model_93_acc_100_frames_celeb_FF_data.pt` is selected when 100 frames are
requested. If no exact match exists the first available model is used.

## Endpoints

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | page | Upload form |
| `/predict/` | page | Rendered result with per-frame heatmaps |
| `/about/` | page | About |
| `/api/health/` | JSON | Liveness, CPU/GPU, model availability |
| `/api/predict/` | JSON | Multipart upload, returns REAL/FAKE + confidence |

The JSON endpoints exist so a decoupled client can use the service; see the React
app in `frontend/`. `CORS_ALLOWED_ORIGINS` in `project_settings/settings.py` lists
the origins allowed to call them.
