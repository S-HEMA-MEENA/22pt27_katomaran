import asyncio
import websockets
import json
from parse import parse_log, create_vector_store
from rag import retrieve_and_augment
from llm import query_grok3

# Initialize data and vector store
registrations = parse_log("registration_log.txt")
index, model, registrations = create_vector_store(registrations)
api_key = "your_xai_api_key"  # Replace with your xAI API key

async def handle_connection(websocket, path):
    """Handle WebSocket connections and process messages."""
    try:
        async for message in websocket:
            data = json.loads(message)
            if "query" in data:
                # Handle text query
                prompt = retrieve_and_augment(data["query"], index, model, registrations)
                response = query_grok3(prompt, api_key)
                await websocket.send(json.dumps({"text": response, "image": None, "graph": None}))
            elif "image" in data:
                # Handle image upload (placeholder)
                response = "Image-based person search not implemented in this RAG setup."
                await websocket.send(json.dumps({"text": response, "image": None, "graph": None}))
            else:
                await websocket.send(json.dumps({"text": "Invalid message format", "image": None, "graph": None}))
    except Exception as e:
        await websocket.send(json.dumps({"text": f"Error: {str(e)}", "image": None, "graph": None}))

# Start WebSocket server
start_server = websockets.serve(handle_connection, "localhost", 8000)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()