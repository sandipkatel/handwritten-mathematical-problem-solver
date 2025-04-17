# math_api/views.py

import os
import sys
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import MathImage
import io
import contextlib
from PIL import Image

# Import your existing functions
# You may need to adjust these imports based on your project structure
from .utils.convert_img_to_latex import convert_image_to_latex
from .utils.solve import solve_common_latex_problem


@api_view(['POST'])
def convert_image(request):
    """
    Process uploaded image to recognize mathematical expressions and convert to LaTeX
    """
    if 'image' not in request.FILES:
        return Response({'error': 'No image file provided'}, status=400)

    try:
        # Save the uploaded image
        image_file = request.FILES['image']
        math_image = MathImage(image=image_file)
        math_image.save()

        image_path = math_image.image.path

        # Use your existing function to recognize expressions
        result = convert_image_to_latex(image_path)

        # Save the recognized LaTeX
        math_image.latex_result = result["latex"]
        math_image.save()

        return Response({
            'latex': result["latex"],
            'message': 'Successfully converted image to LaTeX'
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def solve_expression(request):
    """
    Solve a mathematical expression provided in LaTeX format
    """
    try:
        data = request.data
        if 'latex' not in data:
            return Response({'error': 'No LaTeX expression provided'}, status=400)

        result = solve_common_latex_problem(data['latex'])

        if 'error' in result:
            return Response({'error': result['error']}, status=400)

        return Response({'solution': result['solution']})

    except Exception as e:
        return Response({'error': str(e)}, status=500)
