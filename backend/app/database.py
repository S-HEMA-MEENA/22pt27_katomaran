from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

os.makedirs(os.path.join(os.path.dirname(__file__), "..", "instance"), exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'instance', 'faces.db')}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()