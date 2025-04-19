# math_api/urls.py

from django.urls import path
from . import views
urlpatterns = [
    path('convert/', views.convert_image, name='convert_image'),
    path('solve/', views.solve_expression, name='solve_expression'),
    path('get_plot/', views.get_plot, name='get_plot'),
]
