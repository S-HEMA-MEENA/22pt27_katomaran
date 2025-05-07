from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine
from .models import Base, Face
from .face_recognition import process_face_image
from sqlalchemy.orm import Session
from datetime import datetime
import os
from typing import List
from pydantic import BaseModel
import face_recognition
import numpy as np
import base64
import io
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RecognizeRequest(BaseModel):
    image: str
    known_faces: List[dict]

class LogRegistrationRequest(BaseModel):
    name: str
    timestamp: str

@app.post("/register/")
async def register_face(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        face_encoding = process_face_image(await file.read())
        
        if face_encoding is None:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
        existing_face = db.query(Face).filter(Face.name == name).first()
        if existing_face:
            raise HTTPException(status_code=400, detail="Name already registered")
        
        new_face = Face(
            name=name,
            face_encoding=str(face_encoding.tolist()), 
            registered_at=datetime.utcnow()
        )
        
        db.add(new_face)
        db.commit()
        db.refresh(new_face)
        
        return {
            "status": "success",
            "message": "Face registered successfully",
            "data": {
                "id": new_face.id,
                "name": new_face.name,
                "registered_at": new_face.registered_at.isoformat()
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/faces/")
async def get_registered_faces(db: Session = Depends(get_db)):
    faces = db.query(Face).all()
    return {
        "status": "success",
        "count": len(faces),
        "data": [
            {
                "id": face.id,
                "name": face.name,
                "face_encoding": face.face_encoding,
                "registered_at": face.registered_at.isoformat()
            }
            for face in faces
        ]
    }

@app.post("/recognize/")
async def recognize_faces(request: RecognizeRequest, db: Session = Depends(get_db)):
    try:
        image_bytes = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        image_np = np.array(image)

        face_locations = face_recognition.face_locations(image_np)
        face_encodings = face_recognition.face_encodings(image_np, face_locations)

        detected_faces = []
        for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):
            face_data = {
                "location": {"top": top, "right": right, "bottom": bottom, "left": left},
                "name": None,
                "confidence": 0.0
            }

            known_encodings = [np.array(face["encoding"]) for face in request.known_faces]
            known_names = [face["name"] for face in request.known_faces]
            
            if known_encodings:
                distances = face_recognition.face_distance(known_encodings, encoding)
                min_distance = min(distances) if distances.size > 0 else 1.0
                confidence = 1.0 - min_distance 
                
                if min_distance < 0.6:
                    best_match_index = np.argmin(distances)
                    face_data["name"] = known_names[best_match_index]
                    face_data["confidence"] = float(confidence)

            detected_faces.append(face_data)

        return {
            "status": "success",
            "detected_faces": detected_faces
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/log_registration/")
async def log_registration(request: LogRegistrationRequest):
    try:
        # Define log file path in the instance directory
        log_file_path = os.path.join(os.path.dirname(__file__), '..', 'instance', 'registration_log.txt')
        
        # Format timestamp from ISO string to YYYY-MM-DD HH:MM:SS
        timestamp = datetime.fromisoformat(request.timestamp.replace('Z', '+00:00'))
        formatted_timestamp = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        
        # Log entry
        log_entry = f"Registered {request.name} at {formatted_timestamp}\n"
        
        # Append to log file (thread-safe)
        with open(log_file_path, 'a', encoding='utf-8') as f:
            f.write(log_entry)
        
        return {
            "status": "success",
            "message": "Registration logged successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log registration: {str(e)}")