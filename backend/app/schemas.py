from pydantic import BaseModel
from datetime import datetime

class FaceBase(BaseModel):
    name: str

class FaceCreate(FaceBase):
    pass

class Face(FaceBase):
    id: int
    registered_at: datetime
    
    class Config:
        orm_mode = True