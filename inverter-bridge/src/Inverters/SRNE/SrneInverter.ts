import ModbusRTU from "modbus-serial";
import {
  READ_COMMANDS,
  WRITE_COMMANDS,
  InverterCommand,
  CommandKey,
} from "./types";

export class SRNEInverter {
  private client: ModbusRTU;

  constructor(port: string, baudRate: number = 9600, slaveId: number = 1) {
    this.client = new ModbusRTU();
    // We'll call connect separately to handle async correctly
  }

  async connect(port: string) {
    await this.client.connectRTUBuffered(port, { baudRate: 9600 });
    this.client.setID(1);
    this.client.setTimeout(2000);
  }

  /**
   * Reads a specific register and applies decimal/sign logic
   */
  async getValue(command: InverterCommand): Promise<number> {
    const raw = await this.client.readHoldingRegisters(command.address, 1);
    let value = raw.data[0];

    // Handle Signed Integers (2's complement)
    if (command.signed && value > 32767) {
      value -= 65536;
    }

    // Handle Decimals
    return value / Math.pow(10, command.decimals);
  }

  /**
   * Get the full status record
   */
  async getFullRecord() {
    return {
      battery: {
        voltage: await this.getValue(READ_COMMANDS[CommandKey.BatteryVoltage]),
        soc: await this.getValue(READ_COMMANDS[CommandKey.BatterySoc]),
        current: await this.getValue(READ_COMMANDS[CommandKey.BatteryCurrent]),
        chargePower: await this.getValue(READ_COMMANDS[CommandKey.BatteryChargePower]),
        type: await this.getValue(READ_COMMANDS[CommandKey.BatteryType]),
      },
      pv: {
        power: await this.getValue(READ_COMMANDS[CommandKey.PvPower]),
        voltage: await this.getValue(READ_COMMANDS[CommandKey.PvVoltage]),
        current: await this.getValue(READ_COMMANDS[CommandKey.PvCurrent]),
      },
      grid: {
        voltage: await this.getValue(READ_COMMANDS[CommandKey.GridVoltage]),
        freq: await this.getValue(READ_COMMANDS[CommandKey.GridFrequency]),
      },
      inverter: {
        power: await this.getValue(READ_COMMANDS[CommandKey.InverterPower]),
      },
      settings: {
        outputPriority: await this.getValue(
          READ_COMMANDS[CommandKey.InverterOutputPriority],
        ),
        chargerPriority: await this.getValue(
          READ_COMMANDS[CommandKey.InverterChargerPriority],
        ),
      },
      tempDc: await this.getValue(READ_COMMANDS[CommandKey.TempDc]),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Writes a value to the inverter
   */
  async setSetting(address: number, value: number) {
    // Most settings on SRNE don't use decimals for writing simple priorities
    // But for currents (e.g. 40.0A), you usually multiply by 10
    await this.client.writeRegister(address, value);
  }
}
