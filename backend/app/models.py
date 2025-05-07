from sqlalchemy import Column, Integer, String, DateTime
from .database import Base

class Face(Base):
    __tablename__ = "faces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    face_encoding = Column(String)  
    registered_at = Column(DateTime)