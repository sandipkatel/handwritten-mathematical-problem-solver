# math_api/views.py

import os
import sys
from django.conf import settings
from django.http import FileResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import MathImage
import io
import contextlib
from PIL import Image

# Import your existing functions
# You may need to adjust these imports based on your project structure
from .utils.convert_img_to_latex import convert_image_to_latex
from .utils.solver.main import solve


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

        # Call the solver function
        # It should handle plot clearing and adding plot_url internally now
        result_dict = solve(data['latex']) # Get the full result dictionary

        # --- DEBUGGING ---
        print(f"DEBUG [views.py]: Result from main.solve: {result_dict}")
        # ---------------

        # Check if the solver returned an error dictionary
        if isinstance(result_dict, dict) and 'error' in result_dict:
             # Pass the solver's error back to the frontend
             # Use status 400 for client-related errors (like bad LaTeX)
             # or 500 if it indicates an internal solver issue
             status_code = 400 # Or determine dynamically if possible
             return Response(result_dict, status=status_code)

        # Validate that the result is actually a dictionary before sending
        if not isinstance(result_dict, dict):
            print(f"ERROR [views.py]: main.solve did not return a dict! Type: {type(result_dict)}")
            return Response({'error': 'Internal server error: Solver returned unexpected format.'}, status=500)

        # Directly return the full dictionary from the solver.
        # Response() will serialize it correctly to JSON.
        print(f"DEBUG [views.py]: Sending Response with: {result_dict}") # Log final response
        return Response(result_dict)

    except Exception as e:
        # Catch exceptions that happen within the view itself
        print(f"ERROR [views.py solve_expression]: Exception occurred: {e}")
        import traceback
        traceback.print_exc() # Print full traceback for debugging
        return Response({'error': f'An unexpected error occurred in the API endpoint: {str(e)}'}, status=500)


@api_view(['GET'])
def get_plot(request):
    # Define plot path consistently
    plot_path = os.path.join(settings.BASE_DIR, 'math_api', 'image', 'result.png') # Ensure this matches main.py
    if os.path.exists(plot_path):
        try:
            return FileResponse(open(plot_path, 'rb'), content_type='image/png')
        except Exception as e:
             print(f"ERROR [views.py get_plot]: Failed to serve plot: {e}")
             return Response({'error': 'Failed to serve plot image.'}, status=500)
    return Response({'error': 'Plot not found.'}, status=404)