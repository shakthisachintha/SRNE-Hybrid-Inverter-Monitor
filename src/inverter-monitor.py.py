#!/usr/bin/python3
from time import sleep
import minimalmodbus
import json


instr = minimalmodbus.Instrument('COM5', 1)
instr.serial.baudrate = 9600
instr.serial.timeout = 2
# instr.debug = True

cmds = {
    'inverter_voltage': {
        'cmd': (0x0216, 1, 3, True),
        'name': 'Inverter Output Voltage',
        'unit_of_measurement': 'v',
        'device_class': 'voltage'
    },
    'battery_voltage': {
        'cmd': (0x0101, 1, 3, True),
        'name': 'Battery Voltage',
        'unit_of_measurement': 'v',
        'device_class': 'voltage'
    },
    'battery_amps': {
        'cmd': (0x0102, 1, 3, True),
        'name': 'Battery Amps',
        'unit_of_measurement': 'a',
        'device_class': 'current',
        'value_template': '{{value | float * -1}}'
    },
    'shore_power_watts': {
        'cmd': (0x010e, 0, 3, True),
        'name': 'Power In',
        'unit_of_measurement': 'w',
        'device_class': 'power'
    },
    'solar_voltage': {
        'cmd': (0x0107, 1, 3, True),
        'name': 'Solar Voltage',
        'unit_of_measurement': 'v',
        'device_class': 'voltage'
    },
    'solar_amps': {
        'cmd': (0x0108, 1, 3, True),
        'name': 'Solar Amps',
        'unit_of_measurement': 'a',
        'device_class': 'current',
    },
    'solar_watts': {
        'cmd': (0x0109, 0, 3, True),
        'name': 'Solar Power',
        'unit_of_measurement': 'w',
        'device_class': 'power'
    },
    'charger_status': {
        'cmd': (0x0204, 0, 3, False),
        'name': 'Charger Status Code'
    },
    'temp_dc': {
        'cmd': (0x0221, 1, 3, True),
        'name': 'Temperature DC',
        'unit_of_measurement': 'C',
        'device_class': 'temperature'
    },
    'temp_ac': {
        'cmd': (0x0222, 1, 3, True),
        'name': 'Temperature AC',
        'unit_of_measurement': 'C',
        'device_class': 'temperature'
    },
    'temp_tr': {
        'cmd': (0x0223, 1, 3, True),
        'name': 'Temperature TR',
        'unit_of_measurement': 'C',
        'device_class': 'temperature'
    }

}

for name, vals in cmds.items():
    print(name)
    value = instr.read_register(*vals['cmd'])
    print(value)
    sleep(3)
