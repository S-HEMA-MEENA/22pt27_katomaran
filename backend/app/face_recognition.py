import face_recognition
import numpy as np
from PIL import Image
import io

def process_face_image(image_bytes):
    try:

        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        image_np = np.array(image)
        
        face_locations = face_recognition.face_locations(image_np)
        
        if not face_locations:
            return None
            
        face_encodings = face_recognition.face_encodings(image_np, known_face_locations=face_locations)
        
        if not face_encodings:
            return None
            
        return face_encodings[0]
        
    except Exception as e:
        print(f"Error processing face image: {e}")
        return None