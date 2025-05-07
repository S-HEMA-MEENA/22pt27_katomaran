import re
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

def parse_log(file_path):
    """Parse registration log into a list of entries."""
    registrations = []
    with open(file_path, 'r') as f:
        for line in f:
            match = re.match(r"Registered (.+?) at (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})", line.strip())
            if match:
                name, timestamp = match.groups()
                registrations.append({"name": name, "timestamp": timestamp, "text": line.strip()})
    return registrations

def create_vector_store(registrations):
    """Create a FAISS index from registration log entries."""
    model = SentenceTransformer('all-MiniLM-L6-v2')
    texts = [reg["text"] for reg in registrations]
    embeddings = model.encode(texts, convert_to_numpy=True)
    
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    
    return index, model, registrations