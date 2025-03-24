from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
import asyncio

active_connections = set() # Store all active WebSocket connections

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        while True:
            # Keep the connection alive
            await asyncio.sleep(1)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        active_connections.remove(websocket)

async def broadcast_data(data: dict):
    for connection in list(active_connections):  # Use list to avoid set size changes during iteration
        try:
            await connection.send_json(data)
        except WebSocketDisconnect:
            active_connections.remove(connection)
        except Exception as e:
            print(f"Error sending data: {e}")

@app.post("/update/")
async def generate_data(data: dict):
    # Broadcast the data to all WebSocket clients
    await broadcast_data(data)
    # return {"status": "Data received"}

app.mount("/", StaticFiles(directory="static", html=True), name="static")