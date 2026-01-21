from time import sleep
import minimalmodbus
from srnecommands import INVERTER_COMMANDS, BATTERY_VOLTAGE
from enum import Enum
from threading import Lock


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
    
class BatteryType(Enum):
    USER = 0
    SLD = 1
    FLD = 2
    GEL = 3
    LFP = 4
    NCA = 5

BATTERY_SETUP_MULTIPLIER = int(BATTERY_VOLTAGE/12)

# region SRNE Inverter Class


class SRNEInverter():
    """
    SRNE All-in-one solar charger inverter
    Target models HF2430S80-H | HF2430U80-H
    """
    # region Private

    def __init__(self, deviceid: str, baudrate: int = 9600, slaveaddress: int = 1, debug: bool = False, serialtimeout: int = 1, mock: bool = True) -> None:
        if not mock:
            instr = minimalmodbus.Instrument(deviceid, slaveaddress)
            instr.serial.baudrate = baudrate
            instr.serial.timeout = serialtimeout
            instr.debug = debug
            self._instrument = instr
        self.mock = mock
        self._lock = Lock()

    def _write_register(self, value: [int, float], register: int, decimals: int = 0, functioncode: int = 6, signed: bool = False) -> bool:
        with self._lock:
            if self.mock:
                return self._mock_write_register()
            sleep(0.1)
            try:
                self._instrument.write_register(
                    register, value, decimals, functioncode, signed)
                return True
            except IOError:
                return False

    def _read_register(self, register: int, decimals: int, functioncode: int = 3, signed: bool = False) -> [int, float]:
        with self._lock:
            if self.mock:
                return self._mock_read_register()
            sleep(0.1)
            try:
                value = self._instrument.read_register(
                    register, decimals, functioncode, signed)
                return value
            except IOError:
                return -10

    def _mock_write_register(self) -> bool:
        sleep(0.1)
        return True

    def _mock_read_register(self) -> [int, float]:
        sleep(0.1)
        return 1
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
    def get_battery_charge_max_current(self) -> float:
        value = self._read_register(
            *INVERTER_COMMANDS.get('battery_max_charge_current'))
        return float(value)

    # Battery Type    
    def get_battery_type(self) -> str:
        value = self._read_register(
            *INVERTER_COMMANDS.get('battery_type'))
        return BatteryType(int(value)).name

    # Battery Boost Charge Voltage
    def get_battery_boost_charge_voltage(self) -> float:
        value = self._read_register(
            *INVERTER_COMMANDS.get('battery_boost_charge_voltage'))
        return float(value * BATTERY_SETUP_MULTIPLIER)
    
    # Battery Boost Charge Time
    def get_battery_boost_charge_time(self) -> int:
        value = self._read_register(
            *INVERTER_COMMANDS.get('battery_boost_charge_time'))
        return int(value)
    
    # Battery Float Charge Voltage
    def get_battery_float_charge_voltage(self) -> float:
        value = self._read_register(
            *INVERTER_COMMANDS.get('battery_float_charge_voltage'))
        return float(value * BATTERY_SETUP_MULTIPLIER)

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

    # Inverter output priority
    def get_inverter_output_priority(self) -> OutputPriority:
        value = self._read_register(
            *INVERTER_COMMANDS.get('inverter_output_priority'))
        return OutputPriority(int(value))

    # Inverter charger priority
    def get_inverter_charger_priority(self) -> ChargerPriority:
        value = self._read_register(
            *INVERTER_COMMANDS.get('inverter_charger_priority'))
        return ChargerPriority(int(value))

    # Get a complete record of all the parameters
    def get_record(self):
        record = {
            'battery': {
                'voltage': self.get_battery_voltage(),
                'current': self.get_battery_charge_current(),
                'chargePower': self.get_battery_charge_power(),
                'soc':  self.get_battery_soc(),
                'type': self.get_battery_type(),
                'boostChargeVoltage': self.get_battery_boost_charge_voltage(),
                'boostChargeTime': self.get_battery_boost_charge_time(),
                'floatChargeVoltage': self.get_battery_float_charge_voltage(),
            },
            'pv': {
                'voltage': self.get_pv_input_voltage(),
                'current': self.get_pv_input_current(),
                'power': self.get_pv_input_power(),
                'batteryChargeCurrent': self.get_pv_battery_charge_current()
            },
            'grid': {
                'voltage': self.get_grid_voltage(),
                'inputCurrent': self.get_grid_input_current(),
                'batteryChargeCurrent':  self.get_grid_battery_charge_current(),
                'frequency': self.get_grid_frequency(),
            },
            'inverter': {
                'voltage': self.get_inverter_output_voltage(),
                'current': self.get_inverter_output_current(),
                'frequency': self.get_inverter_frequency(),
                'power': self.get_inverter_output_power(),
            },
            'settings': {
                'chargerPriority': self.get_inverter_charger_priority().name,
                'outputPriority': self.get_inverter_output_priority().name,
                'maxBatteryChargeCurrent': self.get_battery_charge_max_current(),
                'maxGridChargeCurrent': self.get_grid_battery_charge_max_current()
            }
        }
        return record

    # endregion

    # region Setters

    # Set inverter output priority
    def set_inverter_output_priority(self, priority: OutputPriority) -> bool:
        params = (priority.value, *
                  INVERTER_COMMANDS.get('inverter_output_priority_write'))
        return self._write_register(*params)

    # Set inverter charging priority
    def set_inverter_charger_priority(self, priority: ChargerPriority) -> bool:
        params = (priority.value, *
                  INVERTER_COMMANDS.get('inverter_charger_priority_write'))
        return self._write_register(*params)

    # Set max charging current
    def set_battery_charge_max_current(self, current: int) -> bool:
        params = (
            current, *INVERTER_COMMANDS.get('battery_max_charge_current_write'))
        return self._write_register(*params)

    # Set max utility charging current
    def set_grid_battery_charger_maxmimum_current(self, current: int) -> bool:
        params = (
            current, *INVERTER_COMMANDS.get('grid_battery_charge_max_current_write'))
        return self._write_register(*params)
    # endregion

# endregion
