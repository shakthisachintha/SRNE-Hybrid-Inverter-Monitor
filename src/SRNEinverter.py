from time import sleep
import minimalmodbus
from srnecommands import INVERTER_COMMANDS
from enum import Enum


class Units(Enum):
    POWER = 1
    CURRRENT = 2
    VOLTAGE = 3
    PERCENTAGE = 4
    TEMPERATURE = 5
    FREQUENCY = 6


class OutputPriority(Enum):
    SOL = 0
    UTI = 1
    SBU = 2


class ChargerPriority(Enum):
    CSO = 0
    CUB = 1
    SNU = 2
    OSO = 3


# region SRNE Inverter Class


class SRNEInverter():

    # region Private
    def __init__(self, deviceid: str, baudrate: int = 9600, slaveaddress: int = 1, debug: bool = False, serialtimeout: int = 1) -> None:
        instr = minimalmodbus.Instrument(deviceid, slaveaddress)
        instr.serial.baudrate = baudrate
        instr.serial.timeout = serialtimeout
        instr.debug = debug
        self._instrument = instr

    def _write_register(self, value: [int, float], register: int, decimals: int = 0, functioncode: int = 6, signed: bool = False) -> bool:
        sleep(0.1)
        try:
            self._instrument.write_register(
                register, value, decimals, functioncode, signed)
            return True
        except IOError:
            return False

    def _read_register(self, register: int, decimals: int, functioncode: int = 3, signed: bool = False) -> [int, float]:
        sleep(0.1)
        try:
            value = self._instrument.read_register(
                register, decimals, functioncode, signed)
            return value
        except IOError:
            return -10
# endregion

    # region Getters

    # Battery Voltage
    def get_battery_voltage(self) -> float:
        value = self._read_register(*INVERTER_COMMANDS.get('battery_voltage'))
        return float(value)

    # Battery Current (Charge/Discharge)
    def get_battery_charge_current(self) -> float:
        """Returns charging/dischargin current value
        Negative value if discharging
        Positive value if charging
        """
        value = self._read_register(*INVERTER_COMMANDS.get('battery_current'))
        return (-1) * float(value)

    # Battery Charge Power
    def get_battery_charge_power(self) -> int:
        """Battery Charge Power(Grid + PV)"""
        value = self._read_register(
            *INVERTER_COMMANDS.get('battery_charge_power'))
        return int(value)

    # Battery State of Charge
    def get_battery_soc(self) -> int:
        value = self._read_register(*INVERTER_COMMANDS.get('battery_soc'))
        return int(value)

    # Battery Max Charge Current
    def get_battery_max_charge_current(self) -> float:
        value = self._read_register(
            *INVERTER_COMMANDS.get('battery_max_charge_current'))
        return float(value)

    # PV Input Voltage
    def get_pv_input_voltage(self) -> float:
        value = self._read_register(*INVERTER_COMMANDS.get('pv_voltage'))
        return float(value)

    # PV Input Current
    def get_pv_input_current(self) -> float:
        value = self._read_register(*INVERTER_COMMANDS.get('pv_current'))
        return float(value)

    # PV Input Power
    def get_pv_input_power(self) -> int:
        value = self._read_register(*INVERTER_COMMANDS.get('pv_power'))
        return int(value)

    # PV Battery Charge Current
    def get_pv_battery_charge_current(self) -> float:
        value = self._read_register(
            *INVERTER_COMMANDS.get('pv_battery_charge_current'))
        return float(value)

    # Grid Voltage
    def get_grid_voltage(self) -> float:
        value = self._read_register(*INVERTER_COMMANDS.get('grid_voltage'))
        return float(value)

    # Grid Input Current
    def get_grid_input_current(self) -> float:
        value = self._read_register(
            *INVERTER_COMMANDS.get('grid_input_current'))
        return float(value)

    # Grid Battery Charge Current
    def get_grid_battery_charge_current(self) -> float:
        value = self._read_register(
            *INVERTER_COMMANDS.get('grid_battery_charge_current'))
        return float(value)

    # Grid Frequency
    def get_grid_frequency(self) -> float:
        value = self._read_register(*INVERTER_COMMANDS.get('grid_frequency'))
        return float(value)

    # Grid Battery Charge Max Current
    def get_grid_battery_charge_max_current(self) -> int:
        value = self._read_register(
            *INVERTER_COMMANDS.get('grid_battery_charge_max_current'))
        return float(value)

    # Inverter Output Voltage
    def get_inverter_output_voltage(self) -> float:
        value = self._read_register(*INVERTER_COMMANDS.get('inverter_voltage'))
        return float(value)

    # Inverter Output Current
    def get_inverter_output_current(self) -> float:
        value = self._read_register(*INVERTER_COMMANDS.get('inverter_current'))
        return float(value)

    # Inverter Output Frequency
    def get_inverter_frequency(self) -> float:
        value = self._read_register(
            *INVERTER_COMMANDS.get('inverter_frequency'))
        return float(value)

    # Inverter Output Power
    def get_inverter_output_power(self) -> int:
        value = self._read_register(*INVERTER_COMMANDS.get('inverter_power'))
        return int(value)

    # Get a complete record of all the parameters
    def get_record(self):
        record = {
            'batteryVoltage': {
                'value': self.get_battery_voltage(),
                'unit': Units.VOLTAGE.value
            },
            'batteryCurrent': {
                'value': self.get_battery_charge_current(),
                'unit': Units.CURRRENT.value
            },
            'batteryChargePower': {
                'value': self.get_battery_charge_power(),
                'unit': Units.POWER.value
            },
            'batterySoc': {
                'value': self.get_battery_soc(),
                'unit': Units.PERCENTAGE.value
            },
            'batteryMaxChargeCurrent': {
                'value': self.get_battery_max_charge_current(),
                'unit': Units.CURRRENT.value
            },
            'pvVoltage': {
                'value': self.get_pv_input_voltage(),
                'unit': Units.VOLTAGE.value
            },
            'pvCurrent': {
                'value': self.get_pv_input_current(),
                'unit': Units.CURRRENT.value
            },
            'pvPower': {
                'value': self.get_pv_input_power(),
                'unit': Units.POWER.value
            },
            'pvBatteryChargeCurrent': {
                'value': self.get_pv_battery_charge_current(),
                'unit': Units.CURRRENT.value
            },
            'gridVoltage': {
                'value': self.get_grid_voltage(),
                'unit': Units.VOLTAGE.value
            },
            'gridInputCurrent': {
                'value': self.get_grid_input_current(),
                'unit': Units.CURRRENT.value
            },
            'gridBatteryChargeCurrent': {
                'value': self.get_grid_battery_charge_current(),
                'unit': Units.CURRRENT.value
            },
            'gridFrequency': {
                'value': self.get_grid_frequency(),
                'unit': Units.FREQUENCY.value
            },
            'gridBatteryChargeMaxCurrent': {
                'value': self.get_grid_battery_charge_max_current(),
                'unit': Units.CURRRENT.value
            },
            'inverterVoltage': {
                'value': self.get_inverter_output_voltage(),
                'unit': Units.VOLTAGE.value
            },
            'inverterCurrent': {
                'value': self.get_inverter_output_current(),
                'unit': Units.CURRRENT.value
            },
            'inverterFrequency': {
                'value': self.get_inverter_frequency(),
                'unit': Units.FREQUENCY.value
            },
            'inverterPower': {
                'value': self.get_inverter_output_power(),
                'unit': Units.POWER.value
            },
            'tempDc': {
                'value': 0,
                'unit': Units.VOLTAGE.value
            },
            'tempAc': {
                'value': 0,
                'unit': Units.VOLTAGE.value
            },
            'tempTr': {
                'value': 0,
                'unit': Units.VOLTAGE.value
            }
        }
        return record

    # endregion

    # region Setters

    # Set inverter output priority 
    def set_inverter_output_priority(self, priority: OutputPriority) -> bool:
        params = (priority.value, *INVERTER_COMMANDS.get('inverter_output_priority_write'))
        return self._write_register(*params)

    # Set inverter charging priority
    def set_inverter_charger_priority(self, priority: ChargerPriority) -> bool:
        params = (priority.value, *INVERTER_COMMANDS.get('inverter_charger_priority_write'))
        return self._write_register(*params)

    # Set max charging current
    def set_maxmimum_charging_current(self, current: int) ->bool:
        params = (current, *INVERTER_COMMANDS.get('battery_max_charge_current_write'))
        return self._write_register(*params)

    # Set max utility charging current
    def set_grid_maxmimum_charging_current(self, current: int) ->bool:
        params = (current, *INVERTER_COMMANDS.get('grid_battery_charge_max_current_write'))
        return self._write_register(*params)
    # endregion

# endregion

# x = (OutputPriority['UTI'].value, *INVERTER_COMMANDS.get('inverter_output_priority_write'))
# print(x)