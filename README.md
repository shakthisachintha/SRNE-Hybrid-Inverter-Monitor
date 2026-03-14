# SRNE Hybrid Inverter Monitor

![Bun](https://img.shields.io/badge/bun-typescript-black.svg)
![Python](https://img.shields.io/badge/python-legacy-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A monitoring and control project for SRNE All-in-one hybrid solar inverters using Modbus RTU communication. The current direction is a Bun/TypeScript control layer that runs close to the inverter, publishes telemetry to MQTT, and consumes control commands from MQTT. A separate middle-tier server will expose the external API for applications and dashboards.

## 🎯 Features

- **Bun/TypeScript Control Layer**: The active implementation direction is a Bun-based runtime for device-side control
- **Modbus RTU Communication**: Direct serial communication with SRNE inverters
- **MQTT Telemetry Publishing**: Inverter data is intended to be published to an MQTT broker
- **MQTT Command Consumption**: Control commands are intended to be received from the MQTT broker
- **Separated API Layer**: Public API responsibilities move to a middle-tier server, not the inverter-side process
- **Multi-parameter Tracking**: Monitor battery, solar, grid, and inverter metrics
- **Remote Configuration Path**: Commands can be relayed through the broker to the inverter control layer
- **Legacy Python Reference**: The previous Python implementation remains in the repository under `python/`
- **Thread-safe Operations**: Concurrent-safe Modbus communication

## 🧭 Architecture Direction

The repository is moving toward a split architecture:

1. **Device-side control layer** in Bun/TypeScript
2. **MQTT broker** as the messaging backbone
3. **Middle-tier server** exposing HTTP/Web API for clients
4. **Apps/dashboards/services** interacting with the middle-tier server rather than the inverter process directly

### Planned Flow

- The Bun/TypeScript process connects to the inverter over Modbus RTU
- It reads inverter state and publishes telemetry to MQTT topics
- It subscribes to command topics and applies control changes to the inverter
- A separate server consumes telemetry and exposes application-facing APIs
- Client applications send commands to that server, which then relays them through MQTT

This means the inverter-side process will **not expose its own server or public API**.

## 🔌 Supported Hardware

- **SRNE HF2430S80-H** (24V, 3000W, 80A Solar Charger)
- **SRNE HF2430U80-H** (24V, 3000W, 80A Solar Charger)
- Other SRNE All-in-one hybrid inverters with Modbus RTU support

## 📊 Monitored Parameters

### Battery Metrics
- Voltage, Current (charge/discharge)
- State of Charge (SoC)
- Charge Power, Max Charge Current
- Boost/Float Charge Voltage & Time
- Battery Type

### Solar (PV) Metrics
- Input Voltage, Current, Power
- Battery Charge Current from PV

### Grid Metrics
- Voltage, Current, Frequency
- Battery Charge Current from Grid
- Max Grid Charge Current

### Inverter Output
- Output Voltage, Current, Power
- Output Frequency
- Output Priority Settings
- Charger Priority Settings

## 🚀 Installation

### Prerequisites
- Bun
- TypeScript
- Python 3.7 or higher for the legacy implementation under `python/`
- USB to RS485/RS232 adapter for serial communication
- SRNE compatible inverter with Modbus RTU support

### Current Repository Layout

```text
SRNE-Hybrid-Inverter-Monitor/
├── bun/                        # Active Bun/TypeScript control-layer work
├── python/                     # Legacy Python implementation moved here
│   ├── src/
│   ├── requirements.txt
│   └── .venv/
├── Resources/                  # Modbus protocol documentation (PDFs)
└── README.md
```

### Bun/TypeScript Control Layer

The Bun project lives under `bun/` and is the main direction for ongoing development.

```bash
cd bun
bun install
```

### Legacy Python Implementation

The old Python codebase has been moved under `python/` and is retained for reference, migration support, and parity checking while the Bun/TypeScript layer is being built.

```bash
cd python
pip install -r requirements.txt
```

## 🎮 Usage

### Current Status

- The **Bun/TypeScript control layer** is the active path forward
- The inverter-side process is expected to communicate through **MQTT**, not HTTP
- The externally accessible API will live in a **separate middle-tier server**
- The **Python implementation** remains available in `python/` as the older approach

### Legacy Python Usage

```python
from SRNEinverter import SRNEInverter

# Initialize inverter (replace with your device path)
device_id = '/dev/tty.usbserial-143240'  # macOS
# device_id = '/dev/ttyUSB0'  # Linux

inverter = SRNEInverter(device_id)

# Get all inverter data
data = inverter.get_record()
print(data)
```

### Legacy Python Server

The Python FastAPI server exists only in the legacy implementation under `python/`. It is no longer the target architecture for the project.

```bash
cd python/src
python main.py
```

Server runs on `http://localhost:5004` if you still use the old Python stack.

## 🔧 Configuration

### Device Path Configuration
Update the device path in the relevant runtime:
- **macOS**: `/dev/tty.usbserial-*`
- **Linux**: `/dev/ttyUSB0` or `/tmp/ttyUSB0`

### Battery Voltage Configuration
Modify `BATTERY_VOLTAGE` in `python/src/srnecommands.py` for the legacy Python implementation:
```python
BATTERY_VOLTAGE = 24  # 24V system (2 x 12V batteries)
# BATTERY_VOLTAGE = 48  # 48V system (4 x 12V batteries)
```

## 🛠️ Development

### Current Development Focus

- Build the Bun/TypeScript inverter control layer in `bun/`
- Publish inverter telemetry to MQTT
- Consume control commands from MQTT topics
- Keep the middle-tier API server separate from the inverter-side process
- Use the Python code in `python/` as a reference implementation during migration

### Legacy Python: Adding New Parameters

1. Add register definition to `INVERTER_COMMANDS` in `python/src/srnecommands.py`:
```python
'new_parameter': (0x0123, 1, 3, False)  # (address, decimals, function_code, signed)
```

2. Create getter method in `python/src/SRNEinverter.py`:
```python
def get_new_parameter(self) -> float:
    value = self._read_register(*INVERTER_COMMANDS.get('new_parameter'))
    return float(value)
```

3. Update `get_record()` to include the new parameter in JSON output

## 🔍 Keywords

Solar inverter monitoring, SRNE inverter, hybrid inverter, Modbus RTU, RS485, MQTT inverter telemetry, MQTT command handling, Bun TypeScript, solar power monitoring, battery monitoring, PV system, Python legacy implementation, real-time solar data, inverter control layer, solar charge controller, off-grid solar, grid-tied inverter, IoT solar monitoring, HF2430S80-H, HF2430U80-H

## 📚 Resources

- Official SRNE Modbus documentation available in `Resources/` directory
- Legacy register definitions and protocol handling remain in `python/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, fork the repository, and create pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

This project is based on [jgimbel/snre-solar-inverter-mqtt](https://github.com/jgimbel/snre-solar-inverter-mqtt)

## ⚠️ Disclaimer

This is an unofficial monitoring tool. Use at your own risk. Always refer to manufacturer documentation and ensure proper electrical safety when working with inverters and solar systems.
