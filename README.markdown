# Face Recognition Platform with Real-Time AI Q&A

A browser-based platform for face registration and real-time recognition, featuring a chat interface powered by Retrieval-Augmented Generation (RAG) to answer queries about registration activities. Built for the Katomaran Hackathon May 2025, this project combines face recognition, multi-face detection, and AI-driven query processing.

## Features

- **Face Registration**:
  - Capture faces via webcam using `face_recognition` library.
  - Store face encodings, names, and timestamps in SQLite (`faces.db`).
  - Log registration events for tracking and RAG indexing.
- **Live Face Recognition**:
  - Stream webcam feed at 2 frames per second.
  - Detect and identify multiple faces in real-time.
  - Overlay bounding boxes with names (or "Unknown" if unregistered).
- **Chat-Based Query Interface**:
  - Real-time chat widget using WebSockets.
  - Answer queries like "Who was the last person registered?" using RAG (LangChain + FAISS + OpenAI ChatGPT).
  - Index registration logs in FAISS with cosine similarity search.
- **Responsive UI**:
  - Built with React, TypeScript, and Vite for a modern, user-friendly interface.
  - Components: Home, Register, Live Stream, Chat.
- **Scalable Backend**:
  - FastAPI for high-performance .
  - SQLite for lightweight, efficient storage.

## API Reference

#### Register Face

```http
POST /api/register
```

| Parameter | Type   | Description                     |
|-----------|--------|---------------------------------|
| `name`    | string | **Required**. Name of the person |
| `image`   | file   | **Required**. Image with face   |

**Description**: Encodes a face from the uploaded image using `face_recognition` and stores it in `faces.db` with `id`, `name`, `image_frame_encode`, and `timestamp`. Logs the event for RAG indexing.

**Response**:
```json
{
  "status": "success",
  "message": "Face registered successfully",
  "data": {
    "id": 1,
    "name": "Karthik",
    "timestamp": "2025-05-08T10:00:00Z"
  }
}
```

---

#### Get All Faces

```http
GET /api/faces
```

| Parameter | Type | Description                  |
|-----------|------|------------------------------|
| None      | -    | No parameters required       |

**Description**: Retrieves all registered faces from `faces.db`, returning `id`, `name`, and `timestamp` for each entry.

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Karthik",
      "timestamp": "2025-05-08T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Alice",
      "timestamp": "2025-05-08T10:05:00Z"
    }
  ]
}
```

---

#### Query Registration Data

```http
POST /api/chat
```

| Parameter | Type   | Description                     |
|-----------|--------|---------------------------------|
| `query`   | string | **Required**. Natural language query |

**Description**: Processes queries (e.g., "Who was the last person registered?") using RAG with FAISS-indexed logs and OpenAI ChatGPT.

**Response**:
```json
{
  "status": "success",
  "answer": "The last person registered was Karthik at 2025-05-08 10:00:00"
}
```

---

#### Live Face Recognition

```http
WS /ws/recognize
```

| Parameter   | Type   | Description                        |
|-------------|--------|------------------------------------|
| `frame`     | string | **Required**. Base64-encoded frame |
| `timestamp` | string | **Optional**. Timestamp for logging |

**Description**: Processes webcam frames (2 FPS) via WebSocket, identifying multiple faces using encodings in `faces.db`.

**Response**:
```json
{
  "status": "success",
  "faces": [
    {
      "name": "Karthik",
      "bounding_box": {
        "top": 100,
        "right": 300,
        "bottom": 250,
        "left": 150
      }
    }
  ]
}
```

---

#### Real-Time Chat

```http
WS /ws/chat
```

| Parameter | Type   | Description                     |
|-----------|--------|---------------------------------|
| `query`   | string | **Required**. Natural language query |

**Description**: Handles real-time chat queries via WebSocket, using RAG with FAISS-indexed logs.

**Response**:
```json
{
  "status": "success",
  "answer": "There are 5 people currently registered"
}
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key (for RAG)
- Webcam for face capture and streaming

### Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/face-recognition-platform.git
   cd face-recognition-platform
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   source venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt
   ```
   - Create a `.env` file in `backend/`:
     ```env
     OPENAI_API_KEY=your-openai-api-key
     ```
   - Run the FastAPI server:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port 8000
     ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - Access the app at `http://localhost:5173`.

4. **Database**:
   - SQLite database (`faces.db`) is automatically created on first registration.

5. **Dependencies**:
   - Backend: `fastapi`, `uvicorn`, `face_recognition`, `langchain`, `faiss-cpu`, `openai`, `sqlite3`, `numpy`, `Pillow`
   - Frontend: `react`, `typescript`, `vite`, `axios`, `socket.io-client`

## Directory Structure

```
face-recognition-platform/
├── backend/
│   ├── main.py              # FastAPI app with API and WebSocket endpoints
│   ├── requirements.txt     # Backend dependencies
│   ├── faces.db            # SQLite database
│   ├── registration.log     # Event logs for RAG
│   └── .env                # Environment variables (OpenAI API key)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.tsx    # Home page
│   │   │   ├── Register.tsx # Face registration component
│   │   │   ├── LiveStream.tsx # Live recognition component
│   │   │   └── Chat.tsx    # RAG chat widget
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
├── README.md               # Project documentation
└── architecture.png        # System architecture diagram
```

## Future Enhancements

- **Image Search**: Add an API (`POST /api/search/image`) to search for faces by uploading an image and comparing encodings.
- **Advanced RAG Queries**: Support complex queries like "List all registrations today" with enhanced FAISS indexing.
- **UI Improvements**: Add animations, dark mode, and accessibility features for a polished user experience.
- **Performance Optimization**: Increase frame rate for live recognition on high-end devices and optimize FAISS for larger datasets.
- **Multi-User Support**: Scale the backend to handle concurrent users with session management.

## Assumptions

- **Authentication**: No authentication required for development, as not specified in the hackathon document.
- **Image Format**: Supports JPEG/PNG for face registration images.
- **Frame Rate**: Live recognition processes 2 frames per second to accommodate low-resource laptops.
- **Database**: SQLite is used for simplicity; `image_frame_encode` stored as BLOB.
- **Logging**: Registration and query events are logged to `registration.log` for RAG and debugging.
- **OpenAI API**: Users provide their own OpenAI ChatGPT API key for RAG.
- **WebSocket**: Used for live recognition and chat to ensure low-latency communication.

## Acknowledgment

“This project is a part of a hackathon run by https://katomaran.com ”
