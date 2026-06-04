"""project_settings URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from . import views
from . import api_views
from .views import about, index, predict_page,cuda_full

app_name = 'ml_app'
handler404 = views.handler404

urlpatterns = [
    path('', index, name='home'),
    path('about/', about, name='about'),
    path('predict/', predict_page, name='predict'),
    path('cuda_full/',cuda_full,name='cuda_full'),
    # JSON API consumed by the React frontend
    path('api/health/', api_views.health, name='api_health'),
    path('api/predict/', api_views.predict_api, name='api_predict'),
]
