from SRNEinverter import SRNEInverter
from timeit import default_timer as timer
import json

device_id = '/dev/tty.usbserial-143240'

inverter = SRNEInverter(device_id)

start = timer()
record = inverter.get_record()
end = timer()

print(record)
print("Time = ", end-start)

with open("output.json", "w") as outfile:
    json.dump(record, outfile)