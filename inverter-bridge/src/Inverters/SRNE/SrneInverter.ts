import ModbusRTU from "modbus-serial";
import { CommandKey, InverterCommand, READ_COMMANDS } from "./types";

export class SrneInverter {
  private client: ModbusRTU;
  /** Multiplier for registers calibrated to a 12V base system (e.g. 2 for 24V, 4 for 48V) */
  private readonly batterySetupMultiplier: number;

  constructor(
    private readonly baudRate: number = 9600,
    private readonly slaveId: number = 1,
    systemVoltage: number = 24,
    private readonly interReadDelayMs: number = 100,
  ) {
    this.client = new ModbusRTU();
    this.baudRate = baudRate;
    this.slaveId = slaveId;
    /** Multiplier for registers calibrated to a 12V base system (e.g. 2 for 24V, 4 for 48V) */
    this.batterySetupMultiplier = systemVoltage / 12;
    this.interReadDelayMs = interReadDelayMs;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async connect(port: string) {
    await this.client.connectRTUBuffered(port, { baudRate: this.baudRate });
    this.client.setID(this.slaveId);
    this.client.setTimeout(2000);
  }

  /**
   * Reads a specific register and applies decimal/sign logic
   */
  async getValue(command: InverterCommand): Promise<number> {
    const raw = await this.client.readHoldingRegisters(command.address, 1);
    await this.sleep(this.interReadDelayMs);
    let value = raw.data[0];

    if (value === undefined) {
      throw new Error(
        `Failed to read register at address ${command.address.toString(
          16,
        )}. Raw response: ${JSON.stringify(raw)}`,
      );
    }

    // Handle Signed Integers (2's complement)
    if (command.signed && value > 32767) {
      value -= 65536;
    }

    // Handle Decimals
    const scaled = value / Math.pow(10, command.decimals);
    const result = command.systemScaled
      ? scaled * this.batterySetupMultiplier
      : scaled;
    return command.negate ? -result : result;
  }

  /**
   * Get the full status record
   */
  async getFullRecord() {
    return {
      battery: {
        voltage: await this.getValue(READ_COMMANDS[CommandKey.BatteryVoltage]),
        current: await this.getValue(READ_COMMANDS[CommandKey.BatteryCurrent]),
        chargePower: await this.getValue(
          READ_COMMANDS[CommandKey.BatteryChargePower],
        ),
        soc: await this.getValue(READ_COMMANDS[CommandKey.BatterySoc]),
        maxChargeCurrent: await this.getValue(
          READ_COMMANDS[CommandKey.BatteryMaxChargeCurrent],
        ),
        type: await this.getValue(READ_COMMANDS[CommandKey.BatteryType]),
        boostChargeVoltage: await this.getValue(
          READ_COMMANDS[CommandKey.BatteryBoostChargeVoltage],
        ),
        boostChargeTime: await this.getValue(
          READ_COMMANDS[CommandKey.BatteryBoostChargeTime],
        ),
        floatChargeVoltage: await this.getValue(
          READ_COMMANDS[CommandKey.BatteryFloatChargeVoltage],
        ),
        overDischargeVoltage: await this.getValue(
          READ_COMMANDS[CommandKey.BatteryOverDischargeVoltage],
        ),
      },
      pv: {
        voltage: await this.getValue(READ_COMMANDS[CommandKey.PvVoltage]),
        current: await this.getValue(READ_COMMANDS[CommandKey.PvCurrent]),
        power: await this.getValue(READ_COMMANDS[CommandKey.PvPower]),
      },
      grid: {
        voltage: await this.getValue(READ_COMMANDS[CommandKey.GridVoltage]),
        inputCurrent: await this.getValue(
          READ_COMMANDS[CommandKey.GridInputCurrent],
        ),
        batteryChargeCurrent: await this.getValue(
          READ_COMMANDS[CommandKey.GridBatteryChargeCurrent],
        ),
        frequency: await this.getValue(READ_COMMANDS[CommandKey.GridFrequency]),
        batteryChargeMaxCurrent: await this.getValue(
          READ_COMMANDS[CommandKey.GridBatteryChargeMaxCurrent],
        ),
      },
      inverter: {
        voltage: await this.getValue(READ_COMMANDS[CommandKey.InverterVoltage]),
        current: await this.getValue(READ_COMMANDS[CommandKey.InverterCurrent]),
        frequency: await this.getValue(
          READ_COMMANDS[CommandKey.InverterFrequency],
        ),
        power: await this.getValue(READ_COMMANDS[CommandKey.InverterPower]),
        outputPriority: await this.getValue(
          READ_COMMANDS[CommandKey.InverterOutputPriority],
        ),
        chargerPriority: await this.getValue(
          READ_COMMANDS[CommandKey.InverterChargerPriority],
        ),
      },
      temperature: {
        dc: await this.getValue(READ_COMMANDS[CommandKey.TempDc]),
        ac: await this.getValue(READ_COMMANDS[CommandKey.TempAc]),
        transformer: await this.getValue(READ_COMMANDS[CommandKey.TempTr]),
      },
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
