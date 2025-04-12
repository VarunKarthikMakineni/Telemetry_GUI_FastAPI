from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from uvicorn.config import logger
from starlette.websockets import WebSocketState
from contextlib import asynccontextmanager
import asyncio
import time
import db_handler
import json
import pydantic
import os

########################### Load the server configuration ###########################

CONFIG_FILE = "server_config.json"

try:
    with open(CONFIG_FILE, "r") as f:
        server_config = json.load(f)

except FileNotFoundError:
    print("\033[91mConfig file not found.\033[0m")
except json.JSONDecodeError:
    print("\033[91mInvalid JSON in config file.\033[0m")
    exit()

########################### Server Lifespan Events ###########################

@asynccontextmanager
async def lifespanevents(app: FastAPI):
    
    global db_handle
    global heartbeat_task

    logger.info("\033[38;2;247;146;246mRunning lifespan events at server start UwU \033")

    db_handle = db_handler.DBHandler(server_config["DEFAULT_TELEMETRY_FILE_LOCATION"] + server_config["DEFAULT_TELEMETRY_FILE"], server_config)
    heartbeat_task = asyncio.create_task(send_heartbeats())    # Heartbeat to let the clients know the server is still 
    
    logger.info("\033[38;2;247;146;246mLifespan Events at server start done UwU \033")

    yield

    # Runs when the server stops

    logger.info("\033[38;2;247;146;246mRunning lifespan events at server shutdown UwU \033")

    db_handle.close_db()            # Close the database connection

    logger.info("\033[38;2;247;146;246mLifespan events at server shutdown done UwU \033")

########################### FastAPI App ###########################

app = FastAPI(lifespan=lifespanevents)

########################### WEBSOCKETS AND LIVE DATA STREAMING ###########################

active_connections = set() # Stores all active WebSocket connections
live_data_mode = True  # Set to True to stream live data, False to stream replay data
last_heartbeat = time.time()  # Store the last heartbeat time
last_gs_update = time.time()  # Store the last time the ground station sent data

replay_controller = {
    "pause": False,
    "stop": False,
    "row": 1,                # The row which will be sent next
    "max_rows": 0           # The total number of rows in the telemetry file
}

TELEMETRY_VALIDATION_MODEL = db_handler.create_pydantic_model(server_config["DB_TABLE_SCHEMA"]["columns"])

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()
    active_connections.add(websocket)

    try:
        while True:
            # Add actual message handling here
            data = await websocket.receive_text()
            # Process data...
            
    except WebSocketDisconnect:
        logger.info("\033[38;2;247;146;246mClient disconnected normally UwU \033")
    except asyncio.CancelledError:
        logger.warning("\033[38;2;247;146;246mConnection cancelled at shutdown UwU \033")
    except Exception as e:
        logger.error(f"\033[38;2;247;146;246mUnexpected Error UwU: \033 {e}")
    finally:
        try:
            active_connections.remove(websocket)
        except KeyError:
            pass
        
        # Only close if the connection is still active
        if not websocket.client_state == WebSocketState.DISCONNECTED:
            try:
                await websocket.close()
            except RuntimeError as e:
                logger.error(f"\033[38;2;247;146;246mWarning during close: {e}\033[0m")

# Broadcast data to all WebSocket clients
async def broadcast_data(data: dict):

    for connection in list(active_connections):  # Use list to avoid set size changes during iteration
        try:
            await connection.send_json(data)
        except Exception as e:
            logger.error(f"\033[38;2;247;146;246mError during broadcast UwU: {e}\033[0m")

# Endpoint to receive data from the client
@app.post("/telemetry_update")
async def receive_telemetry_update(data: dict):

    if not live_data_mode:
        return JSONResponse(status_code=400, content={"error": "Server is in replay mode"})

    global last_gs_update
    last_gs_update = time.time()
    # Validate the data
    try:
        validated_data = TELEMETRY_VALIDATION_MODEL(**data).model_dump()
    except pydantic.ValidationError as e:
        print(f"Validation error by Pydantic.")
        print(e)
        return

    db_handle.write_row(validated_data)

    validated_data["message_type"] = "telemetry_data"
    validated_data["time_since_gs_update"] = 0

    # Broadcast the data to all WebSocket clients
    await broadcast_data(validated_data)
    return {"status": "Data received"}

@app.post("/pause_replay")
async def pause_replay():
    global replay_controller
    replay_controller["pause"] = True
    return JSONResponse(status_code=200, content={"status": "paused"})

@app.post("/play_replay")
async def resume_replay():
    global replay_controller
    replay_controller["pause"] = False
    return JSONResponse(status_code=200, content={"status": "playing"})

@app.post("/stop_replay")
async def stop_replay():
    global replay_controller
    replay_controller["stop"] = True
    return JSONResponse(status_code=200, content={"status": "stopped"})

async def send_heartbeats():
        # Ensure messages are sent at least every 0.5 seconds
        while True:
            await asyncio.sleep(server_config["SERVER_HEARTBEAT_INTERVAL"])
            current_time = time.time()
            await broadcast_data({"message_type": "server_heartbeat", "time_since_gs_update": current_time - last_gs_update})

async def replay_telemetry_data():
    
    global replay_controller

    replay_controller["max_rows"] = db_handle.get_row_count()
    time = db_handle.get_row(1)["time"]

    while True:

        if replay_controller['pause']:
            await asyncio.sleep(1)
            continue
        elif replay_controller['stop']:
            break

        row = db_handle.get_row(replay_controller['row'])

        await asyncio.sleep((row['time'] - time)/1000)

        row["message_type"] = "telemetry_data"
        row["time_since_gs_update"] = 0

        time = row["time"]

        await broadcast_data(row)
        
        if replay_controller['row'] >= replay_controller['max_rows']:
            replay_controller['stop'] = True
            break

        replay_controller['row'] += 1

########################### Telemetry Source Control ###########################

@app.get("/get_telemetry_mode")
async def get_telemetry_mode():
    return JSONResponse(status_code=200, content={"telemetry-mode": "live" if live_data_mode else "replay"})

@app.post("/set_telemetry_mode")
async def set_telemetry_mode(mode: str = Body(..., embed=True)):
    global live_data_mode, replay_controller

    if mode == "live":
        live_data_mode = True
        replay_controller["stop"] = True

    elif mode == "replay":
        live_data_mode = False
        replay_controller = {
            "pause": True,
            "stop": False,
            "row": 1,
            "max_rows": 1
        }
        asyncio.create_task(replay_telemetry_data())

    return JSONResponse(status_code=200, content={"telemetry-mode": "live" if live_data_mode else "replay"})

@app.post("/set_telemetry_filename")
async def set_telemetry_filename(filename: str = Body(...,embed=True) ):
    global db_handle

    status_code = 500
    
    try:
        new_db_handle = db_handler.DBHandler(server_config["DEFAULT_TELEMETRY_FILE_LOCATION"] + filename, server_config)
        db_handle.close_db()
        db_handle = new_db_handle
        status_code = 200

    except Exception as e:
        print(e)
    
    return JSONResponse(status_code=status_code, content={"filename":db_handle.filename.split("/")[-1]})

@app.get("/get_telemetry_filename")
async def get_telemetry_filename():

    return JSONResponse(
        status_code=200,
        content={"filename":db_handle.filename.split("/")[-1]}
    )

@app.get("/get_telemetry_files")
async def get_telemetry_files():
    
    # Send a list of files with extension .sqlite in the ./logs/telemetry directory
    files = [f for f in os.listdir(server_config["DEFAULT_TELEMETRY_FILE_LOCATION"]) if f.endswith(".sqlite")]
    return JSONResponse(status_code=200, content={"files": files})

@app.get("/get_num_rows")
async def get_telemetry_rows():
    return JSONResponse(status_code=200, content={"rows": db_handle.get_row_count()})

@app.post("/set_replay_row")
async def set_replay_row(row: int = Body(..., embed=True)):
    global replay_controller
    if row < 1 or row > replay_controller["max_rows"]:
        return JSONResponse(status_code=400, content={"error": "Invalid row number"})
    replay_controller["row"] = row
    return JSONResponse(status_code=200, content={"row": replay_controller["row"]})


app.mount("/", StaticFiles(directory="static", html=True), name="static")