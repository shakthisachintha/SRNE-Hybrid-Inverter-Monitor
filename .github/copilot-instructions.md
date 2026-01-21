# SRNE Hybrid Inverter Monitor - Copilot Instructions

## Project Overview
Python application for monitoring SRNE All-in-one solar charger inverters (models HF2430S80-H, HF2430U80-H) via Modbus RTU protocol. Reads inverter data and prepares for cloud monitoring (FastAPI backend currently commented out).

## Core Architecture

### Hardware Communication Layer
- **Modbus RTU Protocol**: Serial communication at 9600 baud, 1s timeout
- **Threading**: `Lock()` used in `SRNEInverter` to prevent concurrent register access (critical - Modbus is not thread-safe)
- **Timing**: 0.1s sleep between operations to avoid overwhelming the inverter

### Module Structure
- **`SRNEinverter.py`**: Main class with mock mode for testing without hardware
- **`srnecommands.py`**: Register map dictionary `INVERTER_COMMANDS` - all Modbus addresses defined here
- **`main.py`**: Entry point with FastAPI endpoints (currently disabled)
- **`inverter-monitor.py`**: Legacy/alternative implementation with different command format
- **`validator.py`**: Fluent validation chain for user inputs

### Register Address Pattern
```python
# Format: (register_address, decimals, function_code, signed)
'battery_voltage': (0x0101, 1, 3, False)  # Read
'inverter_output_priority_write': (0xe204, 0, 6, False)  # Write
```
- Function code 3 = Read, 6 = Write
- Decimals determine value precision (e.g., 1 = divide by 10)
- Signed=True for bidirectional values (charge/discharge current)

## Critical Conventions

### Battery Voltage Scaling
```python
BATTERY_SETUP_MULTIPLIER = int(BATTERY_VOLTAGE/12)  # Currently 24V system
```
Multi-battery systems require voltage values to be multiplied. Always apply this to boost/float charge voltage getters.

### Current Sign Convention
Battery current is **negated** (`* -1`) in getters:
- Negative = Discharging
- Positive = Charging

This convention differs from raw Modbus values - maintain consistency in new getters.

### Enum Usage
Use `Enum` classes for inverter settings (not magic numbers):
```python
OutputPriority.SBU  # Solar-Battery-Utility priority
ChargerPriority.OSO  # Only Solar Only charging
```

## Development Workflows

### Testing Without Hardware
```python
inverter = SRNEInverter(device_id, mock=True)
```
Mock mode returns dummy values (1, True) with realistic delays. Use for API/logic testing.

### Device Path Configuration
- macOS: `/dev/tty.usbserial-*`
- Linux: `/tmp/ttyUSB0` or `/dev/ttyUSB0`
Update `device_id` in `main.py` for your platform.

### Adding New Parameters
1. Add register tuple to `INVERTER_COMMANDS` in `srnecommands.py`
2. Create getter in `SRNEinverter.py` following naming: `get_<component>_<parameter>()`
3. Update `get_record()` to include in JSON structure
4. Apply appropriate type conversion (`int()`, `float()`)
5. Consider if `BATTERY_SETUP_MULTIPLIER` applies

### FastAPI Integration (Commented Out)
Endpoints follow pattern:
- `GET /stream`: SSE for real-time data
- `POST /set/<setting>`: Validate with `Validator` chain before writing
Example: Setting must pass `.maximum().minimum().multiple()` validation

## Dependencies & Installation

### Required Python Packages
```bash
pip install minimalmodbus fastapi sse-starlette uvicorn
```

**Core dependencies:**
- `minimalmodbus`: Modbus RTU communication library for serial communication with inverter
- `fastapi`: Modern async web framework for REST API endpoints
- `sse-starlette`: Server-Sent Events support for real-time data streaming
- `uvicorn`: ASGI server for running FastAPI (configured on port 5004)

### Running the Application
```bash
cd src/
python main.py
```
Server will start on `http://localhost:5004` with these endpoints:
- `GET /`: Health check
- `GET /stream`: Server-Sent Events stream for real-time inverter data (1s updates)
- `POST /set/output-priority`: Set inverter output priority (0-2)
- `POST /set/charger-priority`: Set charger priority (0-3)
- `POST /set/grid-charge-current`: Set grid charging current (0-80A, multiples of 5)
- `POST /set/max-charge-current`: Set max battery charging current (0-80A, multiples of 5)
- `GET /get/all-configs`: Get all current inverter settings

## Important Notes
- **Never skip the 0.1s sleep** between Modbus operations - causes communication errors
- **Always use the lock** when adding new read/write operations
- Reference PDFs in `Resources/` for official register documentation
- Original inspiration: https://github.com/jgimbel/snre-solar-inverter-mqtt
- Two implementations exist (`main.py` vs `inverter-monitor.py`) - `main.py` is the OOP version with class abstraction
