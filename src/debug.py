import json

import srnecommands
from SRNEinverter import ChargerPriority, OutputPriority, SRNEInverter

# device_id = '/dev/tty.usbserial-143240'
device_id = '/tmp/ttyUSB0'
inverter = SRNEInverter(device_id, mock=False)

record = inverter.get_record()
# val = inverter.get_inverter_output_priority()
print(record)
# print(val.value)
# inverter.set_maxmimum_charging_current(40)
# inverter.set_grid_maxmimum_charging_current(10)
# inverter.set_inverter_charger_priority(ChargerPriority.OSO)
# inverter.set_inverter_output_priority(OutputPriority.SOL)

# Serializing json
json_object = json.dumps(record, indent=4)

# Writing to sample.json
with open("output.json", "w") as outfile:
    outfile.write(json_object)

exit()