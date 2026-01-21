from SRNEinverter import SRNEInverter, OutputPriority, ChargerPriority
import srnecommands
import asyncio
import uvicorn
from fastapi import FastAPI, Request
from sse_starlette.sse import EventSourceResponse
from validator import Validator
import json

# device_id = '/dev/tty.usbserial-143240'
device_id = '/tmp/ttyUSB0'
inverter = SRNEInverter(device_id, mock=False)

STREAM_DELAY = 1  # second
RETRY_TIMEOUT = 15000  # milisecond

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get('/stream')
async def message_stream(request: Request):
    def new_messages():
        try:
            record = inverter.get_record()
            return record
        except:
            return {}

    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
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
    request_data = await request.json()
    value = request_data.get('value')
    validation = Validator(value).maximum(2).minimum(0).validate()
    if validation == True:
        if (inverter.set_inverter_output_priority(OutputPriority(value))):
            new_value = inverter.get_inverter_output_priority()
            return {'success': True,
                    'value': value
                    }
        else:
            return {
                'success': False,
                'message': 'Error occured when setting the value.'
            }
    else:
        return {
            'success': False,
            'message': validation.get('message')
        }


@app.post("/set/charger-priority")
async def set_charger_priority(request: Request):
    request_data = await request.json()
    value = request_data.get('value')
    validation = Validator(value).maximum(3).minimum(0).validate()
    if validation == True:
        if (inverter.set_inverter_charger_priority(ChargerPriority(value))):
            new_value = inverter.get_inverter_charger_priority()
            return {'success': True,
                    'value': value
                    }
        else:
            return {
                'success': False,
                'message': 'Error occured when setting the value.'
            }
    else:
        return {
            'success': False,
            'message': validation.get('message')
        }


@app.post("/set/grid-charge-current")
async def set_grid_charge_current(request: Request):
    request_data = await request.json()
    value = request_data.get('value')
    validation = Validator(value).maximum(
        srnecommands.MAX_UTILITY_CHARGE_CURRENT).minimum(
        srnecommands.MIN_UTILITY_CHARGE_CURRENT).multiple(
        srnecommands.MULTIPLIER_UTILITY_CHARGE_CURRENT).validate()
    if validation == True:
        if (inverter.set_grid_battery_charger_maxmimum_current(value)):
            new_value = inverter.get_grid_battery_charge_max_current()
            return {'success': True,
                    'value': value
                    }
        else:
            return {
                'success': False,
                'message': 'Error occured when setting the value.'
            }
    else:
        return {
            'success': False,
            'message': validation.get('message')
        }


@app.post("/set/max-charge-current")
async def set_max_charge_current(request: Request):
    request_data = await request.json()
    value = request_data.get('value')
    validation = Validator(value).maximum(
        srnecommands.MAX_CHARGE_CURRENT).minimum(
        srnecommands.MIN_CHARGE_CURRENT).multiple(
        srnecommands.MULTIPLIER_CHARGE_CURRENT).validate()
    if validation == True:
        if (inverter.set_battery_charge_max_current(value)):
            new_value = inverter.get_battery_charge_max_current()
            return {'success': True,
                    'value': value
                    }
        else:
            return {
                'success': False,
                'message': 'Error occured when setting the value.'
            }
    else:
        return {
            'success': False,
            'message': validation.get('message')
        }


@app.get("/get/all-configs")
async def get_all_config(request: Request):
    try:
        return {
        "success": True,
        "chargerPriority": inverter.get_inverter_charger_priority(),
        "outputPriority": inverter.get_inverter_output_priority(),
        "maxBatteryChargeCurrent": inverter.get_battery_charge_max_current(),
        "maxGridChargeCurrent": inverter.get_grid_battery_charge_max_current()
    }
    except:
        return {
            "success": False,
            "message": "Some unknown error occured when reading data."
        }


if __name__ == "__main__":
    config = uvicorn.Config("main:app", port=5004, log_level="info")
    server = uvicorn.Server(config)
    server.run()
