# SRNE Hybrid Inverter Monitor

![Python](https://img.shields.io/badge/python-3.7+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A Python-based monitoring and control system for SRNE All-in-one hybrid solar inverters using Modbus RTU communication protocol. This application enables real-time data collection, remote monitoring, and configuration of solar inverter systems through a REST API with Server-Sent Events (SSE) streaming.

## 🎯 Features

- **Real-time Monitoring**: Stream live inverter data via Server-Sent Events (SSE)
- **Modbus RTU Communication**: Direct serial communication with SRNE inverters
- **REST API**: Control inverter settings remotely via HTTP endpoints
- **Multi-parameter Tracking**: Monitor battery, solar, grid, and inverter metrics
- **Remote Configuration**: Adjust charging priorities, current limits, and output settings
- **Mock Mode**: Test and develop without physical hardware
- **Thread-safe Operations**: Concurrent-safe Modbus communication

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
- Python 3.7 or higher
- USB to RS485/RS232 adapter for serial communication
- SRNE compatible inverter with Modbus RTU support

### Install Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:
```bash
pip install minimalmodbus fastapi sse-starlette uvicorn
```

### Dependencies
- **minimalmodbus**: Modbus RTU communication library
- **fastapi**: Modern async web framework
- **sse-starlette**: Server-Sent Events support
- **uvicorn**: ASGI server

## 🎮 Usage

### Basic Usage

```python
from SRNEinverter import SRNEInverter

# Initialize inverter (replace with your device path)
device_id = '/dev/tty.usbserial-143240'  # macOS
# device_id = '/dev/ttyUSB0'  # Linux

inverter = SRNEInverter(device_id, mock=False)

# Get all inverter data
data = inverter.get_record()
print(data)
```

### Running the REST API Server

```bash
cd src/
python main.py
```

Server runs on `http://localhost:5004`

### Mock Mode (Testing without Hardware)

```python
inverter = SRNEInverter(device_id, mock=True)
```

## 📡 API Endpoints

### GET Endpoints

| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /` | Health check | `{"message": "Hello World"}` |
| `GET /stream` | SSE real-time data stream | JSON stream (1s updates) |
| `GET /get/all-configs` | Get all inverter settings | Configuration object |

### POST Endpoints

| Endpoint | Parameters | Description |
|----------|------------|-------------|
| `POST /set/output-priority` | `value`: 0-2 | Set inverter output priority<br>0=SOL, 1=UTI, 2=SBU |
| `POST /set/charger-priority` | `value`: 0-3 | Set charger priority<br>0=CSO, 1=CUB, 2=SNU, 3=OSO |
| `POST /set/grid-charge-current` | `value`: 0-80A (multiples of 5) | Set grid charging current limit |
| `POST /set/max-charge-current` | `value`: 0-80A (multiples of 5) | Set max battery charging current |

### Example API Calls

```bash
# Stream real-time data
curl http://localhost:5004/stream

# Set output priority to Solar-Battery-Utility (SBU)
curl -X POST http://localhost:5004/set/output-priority \
  -H "Content-Type: application/json" \
  -d '{"value": 2}'

# Set max charging current to 40A
curl -X POST http://localhost:5004/set/max-charge-current \
  -H "Content-Type: application/json" \
  -d '{"value": 40}'

# Get all configurations
curl http://localhost:5004/get/all-configs
```

## 🔧 Configuration

### Device Path Configuration
Update the `device_id` in `src/main.py`:
- **macOS**: `/dev/tty.usbserial-*`
- **Linux**: `/dev/ttyUSB0` or `/tmp/ttyUSB0`

### Battery Voltage Configuration
Modify `BATTERY_VOLTAGE` in `src/srnecommands.py` for multi-battery systems:
```python
BATTERY_VOLTAGE = 24  # 24V system (2 x 12V batteries)
# BATTERY_VOLTAGE = 48  # 48V system (4 x 12V batteries)
```

## 📁 Project Structure

```
SRNE-Hybrid-Inverter-Monitor/
├── src/
│   ├── main.py                 # FastAPI server & entry point
│   ├── SRNEinverter.py         # Main inverter class with mock mode
│   ├── srnecommands.py         # Modbus register definitions
│   ├── validator.py            # Input validation utilities
│   └── inverter-monitor.py     # Legacy implementation
├── Resources/                  # Modbus protocol documentation (PDFs)
├── requirements.txt            # Python dependencies
└── README.md
```

## 🛠️ Development

### Adding New Parameters

1. Add register definition to `INVERTER_COMMANDS` in `srnecommands.py`:
```python
'new_parameter': (0x0123, 1, 3, False)  # (address, decimals, function_code, signed)
```

2. Create getter method in `SRNEinverter.py`:
```python
def get_new_parameter(self) -> float:
    value = self._read_register(*INVERTER_COMMANDS.get('new_parameter'))
    return float(value)
```

3. Update `get_record()` to include the new parameter in JSON output

## 🔍 Keywords

Solar inverter monitoring, SRNE inverter, hybrid inverter, Modbus RTU, RS485, solar power monitoring, battery monitoring, PV system, Python Modbus, FastAPI monitoring, real-time solar data, inverter API, solar charge controller, off-grid solar, grid-tied inverter, IoT solar monitoring, remote inverter control, HF2430S80-H, HF2430U80-H

## 📚 Resources

- Official SRNE Modbus documentation available in `Resources/` directory
- Register definitions and protocol specifications included

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, fork the repository, and create pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

This project is based on [jgimbel/snre-solar-inverter-mqtt](https://github.com/jgimbel/snre-solar-inverter-mqtt)

## ⚠️ Disclaimer

This is an unofficial monitoring tool. Use at your own risk. Always refer to manufacturer documentation and ensure proper electrical safety when working with inverters and solar systems.
