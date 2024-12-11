import cv2
image_path = "../../public/tu_logo.png"

def preprocess_image(image_path):
    # Read original image
    original_image = cv2.imread(image_path)
    
    # Convert to grayscale
    grayscale_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)
    
    # Optional: Additional preprocessing
    # Noise reduction
    denoised_image = cv2.fastNlMeansDenoising(grayscale_image)
    
    # Adaptive thresholding
    binary_image = cv2.adaptiveThreshold(
        denoised_image, 
        255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 
        11, 
        2
    )
    
    return binary_image

img = preprocess_image(image_path)

cv2.imshow('Grayscale Image', img)
cv2.waitKey(0)

# Distroy window waiting any key pressing event
cv2.destroyAllWindows()