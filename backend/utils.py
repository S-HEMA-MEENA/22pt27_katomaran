import face_recognition
import numpy as np
import io
from PIL import Image

def extract_face_encoding(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    face_locations = face_recognition.face_locations(image_np)
    if not face_locations:
        return None

    encodings = face_recognition.face_encodings(image_np, face_locations)
    return encodings[0] if encodings else None
