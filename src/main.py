from SRNEinverter import SRNEInverter
import asyncio
import uvicorn
from fastapi import FastAPI, Request
from sse_starlette.sse import EventSourceResponse
from threading import Thread, Lock
import json

device_id = '/dev/tty.usbserial-143240'
inverter = SRNEInverter(device_id)

record = inverter.get_record()

# Serializing json
json_object = json.dumps(record, indent=4)

# Writing to sample.json
with open("output.json", "w") as outfile:
    outfile.write(json_object)

exit()

STREAM_DELAY = 1  # second
RETRY_TIMEOUT = 15000  # milisecond

app = FastAPI()

mutex = Lock()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get('/stream')
async def message_stream(request: Request):

    def new_messages():
        # Add logic here to check for new messages
        mutex.acquire()
        try:
            record = inverter.get_record()
            mutex.release()
            return record
        except:
            mutex.release()
            return {}

    async def event_generator():
        while True:
            # If client closes connection, stop sending events
            if await request.is_disconnected():
                break

            # Checks for new messages and return them to client if any
            yield {
                "event": "message",
                "id": "message_id",
                "retry": RETRY_TIMEOUT,
                "data": json.dumps(new_messages())
            }

            await asyncio.sleep(STREAM_DELAY)

    return EventSourceResponse(event_generator())


@app.post("/set/output-priority")
async def set_output_priority(request: Request):
    return {'success': True,
            'value': 'SOL'
        }


@app.post("set/charger-priority")
async def set_charger_priority(request: Request):
    return {'success': True,
            'value': 'SNU'
        }


@app.post("set/grid-charge-current")
async def set_grid_charge_current(request: Request):
    return {
        'success': True,
        'value': 10
    }

@app.post("set/max-charge-current")
async def set_max_charge_current(request: Request):
    return {
        'success': True,
        'value': 10
    }


if __name__ == "__main__":
    config = uvicorn.Config("main:app", port=5004, log_level="info")
    server = uvicorn.Server(config)
    server.run()
