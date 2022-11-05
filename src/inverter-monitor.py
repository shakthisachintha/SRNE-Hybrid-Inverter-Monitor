#!/usr/local/bin/python3
from time import sleep
import minimalmodbus

instr = minimalmodbus.Instrument('/dev/tty.usbserial-143240', 1)
instr.serial.baudrate = 9600
instr.serial.timeout = 1
# instr.debug = True

'''
Command format
(RegisterAddress, NumberOfDecimals, FunctionCode, Signed) => (0x0216, 1, 3, True)

#1 Battery Voltage
#2 Battery Current (Charge/Discharge)
#3 Battery Charge Power
#4 Battery SoC
#5 Battery Max Charge Current

#6 PV Input Voltage
#7 PV Input Current
#8 PV Input Power
#9 PV Charge Current

#10  Grid Voltage
#11 Grid Input Current
#12 Grid Charge Current
#13 Grid Frequency
#14 Grid Charge Max Current

#15 Inverter Voltage
#16 Inverter Output Current
#17 Inverter Output Frequency
#18 Inverter Output Power

#18 Temp A
#19 Temp B
'''
cmds = {
    # 1 Battery Voltage
    'battery_voltage': {
        'cmd': (0x0101, 1, 3, False),
        'name': 'Battery Voltage',
        'unit_of_measurement': 'v',
        'device_class': 'voltage'
    },
    # 2 Battey Current (Charge/Discharge)
    'battery_current': {
        'cmd': (0x0102, 1, 3, True),
        'name': 'Battery Current(Charging/Discharge)',
        'unit_of_measurement': 'a',
        'device_class': 'current',
        'value_template': '{{value | float * -1}}'
    },
    # 3 Battery Charge Power (Grid + PV)
    'battery_charge_power': {
        'cmd': (0x010e, 0, 3, False),
        'name': 'Battery Charge Power(Grid + PV)',
        'unit_of_measurement': 'w',
        'device_class': 'power'
    },
    # 4 Battery SoC
    'battery_soc': {
        'cmd': (0x0100, 0, 3, False),
        'name': 'Battery State of Charge',
        'unit_of_measurement': '%',
        'device_class': 'percentage'
    },
    # 5 Battery Max Charging Current
    'battery_max_charge_current': {
        'cmd': (0xe20a, 1, 3, False),
        'name': 'Battery Max Charging Current',
        'unit_of_measurement': 'a',
        'device_class': 'current'
    },
    # 5 PV Input Voltage
    'solar_voltage': {
        'cmd': (0x0107, 1, 3, False),
        'name': 'PV Voltage',
        'unit_of_measurement': 'v',
        'device_class': 'voltage'
    },
    # 6 PV Input Current
    'solar_amps': {
        'cmd': (0x0108, 1, 3, False),
        'name': 'PV Amps',
        'unit_of_measurement': 'a',
        'device_class': 'current',
    },
    # 7 PV Input Power
    'solar_watts': {
        'cmd': (0x0109, 1, 3, False),
        'name': 'Solar Power',
        'unit_of_measurement': 'w',
        'device_class': 'power'
    },
    # 8 PV Charge Current
    'pv_battery_charge_current': {
        'cmd': (0x0224, 1, 3, False),
        'name': 'PV Battery Charging Amps',
        'unit_of_measurement': 'a',
        'device_class': 'current',
        'value_template': '{{value | float * -1}}'
    },
    # 9  Grid Voltage
    'grid_voltage': {
        'cmd': (0x0213, 1, 3, False),
        'name': 'Grid Voltage',
        'unit_of_measurement': 'v',
        'device_class': 'voltage'
    },
    # 10 Grid Input Current
    'grid_input_current': {
        'cmd': (0x0214, 1, 3, False),
        'name': 'Grid Input Current',
        'unit_of_measurement': 'a',
        'device_class': 'current'
    },
    # 12 Grid Charge Current
    'grid_battery_charge_current': {
        'cmd': (0x021e, 1, 3, False),
        'name': 'Grid Battery Charging Amps',
        'unit_of_measurement': 'a',
        'device_class': 'current',
        'value_template': '{{value | float * -1}}'
    },
    # 13 Grid Frequency
    'grid_frequency': {
        'cmd': (0x0215, 2, 3, False),
        'name': 'Grid Frequency Hz',
        'unit_of_measurement': 'Hz',
        'device_class': 'frequency',
    },

    # 14 Inverter Output Voltage
    'inverter_voltage': {
        'cmd': (0x0216, 1, 3, False),
        'name': 'Inverter Output Voltage',
        'unit_of_measurement': 'v',
        'device_class': 'voltage'
    },
    # 15 Inverter Output Current
    'inverter_current': {
        'cmd': (0x0217, 1, 3, False),
        'name': 'Inverter Output Current',
        'unit_of_measurement': 'a',
        'device_class': 'current'
    },
    # 16 Inverter Output Frequency
    'inverter_frequency': {
        'cmd': (0x0218, 2, 3, False),
        'name': 'Inverter Output Frequency',
        'unit_of_measurement': 'Hz',
        'device_class': 'frequency',
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

# for name, vals in cmds.items():
#     print(name)
#     try:
#         value = instr.read_register(*vals['cmd']) #unpack operator
#         print(value)
#     except IOError:
#         print("Failed to read from instrument")
#     sleep(0.1)

# Writing / Modifying Settings
value = instr.write_register(0xe204, 2, 0, functioncode=6)
print(value)
