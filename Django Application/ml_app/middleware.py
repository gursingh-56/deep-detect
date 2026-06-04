"""Allow the React development client to call the API cross-origin.

Kept as a local middleware rather than a django-cors-headers dependency so the
service still installs from the existing requirements.txt unchanged.
"""
from django.conf import settings
from django.http import HttpResponse


class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS" and "HTTP_ACCESS_CONTROL_REQUEST_METHOD" in request.META:
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)

        origin = request.META.get("HTTP_ORIGIN")
        allowed = getattr(settings, "CORS_ALLOWED_ORIGINS", [])
        if origin and (origin in allowed or "*" in allowed):
            response["Access-Control-Allow-Origin"] = origin
            response["Vary"] = "Origin"
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
            response["Access-Control-Max-Age"] = "86400"
        return response
