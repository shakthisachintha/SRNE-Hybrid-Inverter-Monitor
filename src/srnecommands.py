READ_FUNCTION_CODE = 3
WRITE_FUNCTION_CODE = 6
INVERTER_COMMANDS = {
    #region Reading Commands
    'battery_voltage': (0x0101, 1, READ_FUNCTION_CODE, False),
    'battery_current': (0x0102, 1, READ_FUNCTION_CODE, True),
    'battery_charge_power':(0x010e, 0, READ_FUNCTION_CODE, False),
    'battery_soc': (0x0100, 0, READ_FUNCTION_CODE, False),
    'battery_max_charge_current': (0xe20a, 1, READ_FUNCTION_CODE, False),
    'pv_voltage': (0x0107, 1, READ_FUNCTION_CODE, False),
    'pv_current': (0x0108, 1, READ_FUNCTION_CODE, False),
    'pv_power': (0x0109, 0, READ_FUNCTION_CODE, False),
    'pv_battery_charge_current': (0x0224, 1, READ_FUNCTION_CODE, False),
    'grid_voltage': (0x0213, 1, READ_FUNCTION_CODE, False),  
    'grid_input_current': (0x0214, 1, READ_FUNCTION_CODE, False),
    'grid_battery_charge_current': (0x021E, 1, READ_FUNCTION_CODE, False),
    'grid_frequency':(0x0215, 2, READ_FUNCTION_CODE, False),
    'grid_battery_charge_max_current': (0xe205, 1, READ_FUNCTION_CODE, False),
    'inverter_voltage': (0x0216, 1, READ_FUNCTION_CODE, False),
    'inverter_current': (0x0217, 1, READ_FUNCTION_CODE, False),
    'inverter_frequency': (0x0218, 2, READ_FUNCTION_CODE, False),
    'inverter_power': (0x021B, 0, READ_FUNCTION_CODE, False),
    'inverter_output_priority': (0xe204, 0, READ_FUNCTION_CODE, False),
    'inverter_charger_priority': (0xe20f, 0, READ_FUNCTION_CODE, False), 
    'temp_dc': (0x0221, 1, READ_FUNCTION_CODE, True),
    'temp_ac': (0x0222, 1, READ_FUNCTION_CODE, True),
    'temp_tr': (0x0223, 1, READ_FUNCTION_CODE, True),
    #endregion

"""
max charge current 0-80A 5x multiples
max AC charger current 0-80A 5x multiples
"""
    #region Writing Commands
    'grid_battery_charge_max_current_write': (0xe205, 1, READ_FUNCTION_CODE, False),
    'battery_max_charge_current_write': (0xe20a, 1, WRITE_FUNCTION_CODE, False),
    'inverter_output_priority_write': (0xe204, 0, WRITE_FUNCTION_CODE, False),
    'inverter_charger_priority_write': (0xe20f, 0, WRITE_FUNCTION_CODE, False),
    #endregion

}
