from fastapi import FastAPI, UploadFile, Form
from database import SessionLocal, Face
from utils import extract_face_encoding
import datetime
import numpy as np
import face_recognition

app = FastAPI()

@app.post("/register/")
async def register_face(name: str = Form(...), file: UploadFile = Form(...)):
    image_bytes = await file.read()
    new_encoding = extract_face_encoding(image_bytes)

    if new_encoding is None:
        return {"status": "error", "message": "No face found"}

    db = SessionLocal()
    existing_faces = db.query(Face).filter(Face.name == name).all()

    for face in existing_faces:
        stored_encoding = np.frombuffer(face.encoding, dtype=np.float64)
        match = face_recognition.compare_faces([stored_encoding], new_encoding, tolerance=0.5)[0]
        if match:
            db.close()
            return {
                "status": "duplicate",
                "message": f"Face already registered for {name} on {face.timestamp}"
            }

    face_entry = Face(
        name=name,
        encoding=new_encoding.tobytes(),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(face_entry)
    db.commit()
    db.close()

    return {"status": "success", "message": f"New face registered for {name}"}
