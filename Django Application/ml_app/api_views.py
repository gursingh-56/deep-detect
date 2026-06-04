"""JSON API endpoints consumed by the React frontend.

These wrap the same model pipeline used by the server-rendered pages in
views.py, but return JSON instead of a template so a decoupled client can
talk to the service over HTTP.
"""
import os
import time

import torch
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .views import (
    Model,
    allowed_video_file,
    device,
    get_accurate_model,
    sm,
    train_transforms,
    validation_dataset,
)

# Cache the loaded network across requests: a cold load of the .pt file costs
# several seconds and the weights never change between calls.
_model_cache = {}


def _load_model(sequence_length):
    path_to_model = get_accurate_model(sequence_length)
    if not path_to_model or not os.path.exists(path_to_model):
        return None, (
            f"No model found for sequence length {sequence_length}. "
            "Place a .pt file in the models directory."
        )
    if path_to_model in _model_cache:
        return _model_cache[path_to_model], None

    model = Model(2).cuda() if device == "gpu" else Model(2).cpu()
    model.load_state_dict(torch.load(path_to_model, map_location=torch.device("cpu")))
    model.eval()
    _model_cache[path_to_model] = model
    return model, None


@require_http_methods(["GET"])
def health(request):
    """Cheap liveness probe so the frontend can show connection status."""
    return JsonResponse({
        "status": "ok",
        "device": device,
        "model_available": bool(get_accurate_model(100)),
    })


@csrf_exempt
@require_http_methods(["POST"])
def predict_api(request):
    """Run deepfake detection on an uploaded video and return the verdict.

    Expects multipart/form-data with a `video` file and an optional
    `sequence_length` (number of frames to sample, default 100).
    """
    upload = request.FILES.get("video")
    if upload is None:
        return JsonResponse({"error": "No video file supplied under key 'video'."}, status=400)

    if "." not in upload.name or not allowed_video_file(upload.name):
        return JsonResponse({"error": f"Unsupported video format: {upload.name}"}, status=400)

    try:
        sequence_length = int(request.POST.get("sequence_length", 100))
    except (TypeError, ValueError):
        return JsonResponse({"error": "sequence_length must be an integer."}, status=400)
    if sequence_length <= 0:
        return JsonResponse({"error": "sequence_length must be positive."}, status=400)

    saved_name = f"api_upload_{int(time.time())}{os.path.splitext(upload.name)[1]}"
    saved_path = os.path.join(settings.MEDIA_ROOT, saved_name)
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
    with open(saved_path, "wb") as handle:
        for chunk in upload.chunks():
            handle.write(chunk)

    try:
        model, error = _load_model(sequence_length)
        if error:
            return JsonResponse({"error": error}, status=503)

        dataset = validation_dataset(
            [saved_path], sequence_length=sequence_length, transform=train_transforms
        )
        try:
            # __getitem__ already returns a batched tensor: (1, frames, C, H, W)
            frames = dataset[0]
        except RuntimeError:
            return JsonResponse(
                {"error": "No readable frames were found in the uploaded video."}, status=422
            )

        started = time.time()
        with torch.no_grad():
            _fmap, logits = model(frames.to(device))
            probabilities = sm(logits)
            confidence, prediction = torch.max(probabilities, 1)

        return JsonResponse({
            "result": "REAL" if int(prediction.item()) == 1 else "FAKE",
            "confidence": round(confidence.item() * 100, 2),
            "sequence_length": sequence_length,
            "frames_analyzed": int(frames.shape[1]),
            "processing_time_seconds": round(time.time() - started, 2),
            "filename": upload.name,
        })
    except Exception as exc:  # surface the failure to the client rather than a 500 page
        return JsonResponse({"error": f"Inference failed: {exc}"}, status=500)
    finally:
        if os.path.exists(saved_path):
            os.remove(saved_path)
