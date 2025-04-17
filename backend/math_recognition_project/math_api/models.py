# math_api/models.py

from django.db import models

class MathImage(models.Model):
    image = models.ImageField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    latex_result = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Math Image {self.id} - {self.uploaded_at}"