from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine
from .models import Base, Face
from .face_recognition import process_face_image
from sqlalchemy.orm import Session
from datetime import datetime
import os

Base.metadata.create_all(bind=engine)

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
                "registered_at": face.registered_at.isoformat()
            }
            for face in faces
        ]
    }