import sys
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image, ImageEnhance
import os
import json


def convert_image_to_latex(image_path):

    # current_dir = os.path.dirname(__file__)
    # model_dir = os.path.join(
    #     current_dir, '../../model/checkpoint_eval_2014_small_stage1_new_image/checkpoint-19000')

    # # Load the processor and model
    # processor = TrOCRProcessor.from_pretrained(
    #     "microsoft/trocr-base-handwritten")
    # model = VisionEncoderDecoderModel.from_pretrained(model_dir)

    # # Use CUDA if available

    # device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # model.to(device)

    # # Load and preprocess the image
    # img = Image.open(image_path).convert("RGB")
    # img = ImageEnhance.Sharpness(img).enhance(2.0)
    # pixel_values = processor(img, return_tensors="pt").pixel_values.to(device)

    # # Generate LaTeX text
    # generated_ids = model.generate(pixel_values)
    # generated_text = processor.batch_decode(
    #     generated_ids, skip_special_tokens=True)[0]
    generated_text = ' \frac {d } { d x } ( \sin ^ { 3 } x )'
    return {"latex": generated_text}


if __name__ == "__main__":

    if len(sys.argv) != 2:

        print("Usage: python convert_script.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):

        print(f"Error: Image path {image_path} does not exist")
        sys.exit(1)

    try:

        latex_text = convert_image_to_latex(image_path)
        print(json.dumps(latex_text))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
