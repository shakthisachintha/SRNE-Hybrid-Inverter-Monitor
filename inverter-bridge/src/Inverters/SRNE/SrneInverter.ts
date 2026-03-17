import ModbusRTU from "modbus-serial";
import { ReadCommandKey, InverterCommand, READ_COMMANDS } from "./types";

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
   * Reads a register and returns its human-readable enum label.
   * Throws if the command has no enumMap defined.
   */
  async getEnumValue(command: InverterCommand): Promise<string> {
    if (!command.enumMap) {
      throw new Error(`Command "${command.label}" has no enumMap defined.`);
    }
    const raw = await this.getValue(command);
    return command.enumMap[raw] ?? `UNKNOWN(${raw})`;
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
        voltage: await this.getValue(
          READ_COMMANDS[ReadCommandKey.BatteryVoltage],
        ),
        current: await this.getValue(
          READ_COMMANDS[ReadCommandKey.BatteryCurrent],
        ),
        chargePower: await this.getValue(
          READ_COMMANDS[ReadCommandKey.BatteryChargePower],
        ),
        soc: await this.getValue(READ_COMMANDS[ReadCommandKey.BatterySoc]),
        maxChargeCurrent: await this.getValue(
          READ_COMMANDS[ReadCommandKey.BatteryMaxChargeCurrent],
        ),
        type: await this.getEnumValue(
          READ_COMMANDS[ReadCommandKey.BatteryType],
        ),
        boostChargeVoltage: await this.getValue(
          READ_COMMANDS[ReadCommandKey.BatteryBoostChargeVoltage],
        ),
        boostChargeTime: await this.getValue(
          READ_COMMANDS[ReadCommandKey.BatteryBoostChargeTime],
        ),
        floatChargeVoltage: await this.getValue(
          READ_COMMANDS[ReadCommandKey.BatteryFloatChargeVoltage],
        ),
        overDischargeVoltage: await this.getValue(
          READ_COMMANDS[ReadCommandKey.BatteryOverDischargeVoltage],
        ),
      },
      pv: {
        voltage: await this.getValue(READ_COMMANDS[ReadCommandKey.PvVoltage]),
        current: await this.getValue(READ_COMMANDS[ReadCommandKey.PvCurrent]),
        chargePower: await this.getValue(
          READ_COMMANDS[ReadCommandKey.PvChargePower],
        ),
        totalPower: await this.getValue(
          READ_COMMANDS[ReadCommandKey.PvTotalPower],
        ),
      },
      grid: {
        voltage: await this.getValue(READ_COMMANDS[ReadCommandKey.GridVoltage]),
        inputCurrent: await this.getValue(
          READ_COMMANDS[ReadCommandKey.GridInputCurrent],
        ),
        batteryChargeCurrent: await this.getValue(
          READ_COMMANDS[ReadCommandKey.GridBatteryChargeCurrent],
        ),
        frequency: await this.getValue(
          READ_COMMANDS[ReadCommandKey.GridFrequency],
        ),
        batteryChargeMaxCurrent: await this.getValue(
          READ_COMMANDS[ReadCommandKey.GridBatteryChargeMaxCurrent],
        ),
      },
      inverter: {
        voltage: await this.getValue(
          READ_COMMANDS[ReadCommandKey.InverterVoltage],
        ),
        current: await this.getValue(
          READ_COMMANDS[ReadCommandKey.InverterCurrent],
        ),
        frequency: await this.getValue(
          READ_COMMANDS[ReadCommandKey.InverterFrequency],
        ),
        power: await this.getValue(READ_COMMANDS[ReadCommandKey.InverterPower]),
        outputPriority: await this.getEnumValue(
          READ_COMMANDS[ReadCommandKey.InverterOutputPriority],
        ),
        chargerPriority: await this.getEnumValue(
          READ_COMMANDS[ReadCommandKey.InverterChargerPriority],
        ),
      },
      temperature: {
        dc: await this.getValue(READ_COMMANDS[ReadCommandKey.TempDc]),
        ac: await this.getValue(READ_COMMANDS[ReadCommandKey.TempAc]),
        transformer: await this.getValue(READ_COMMANDS[ReadCommandKey.TempTr]),
      },
      faults: await this.getFaultCodes(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reads the 4 fault code slots at 0x0204–0x0207.
   * Returns only the active (non-zero) codes as an array.
   * An empty array means no active faults.
   */
  async getFaultCodes(): Promise<number[]> {
    const raw = await this.client.readHoldingRegisters(0x0204, 4);
    await this.sleep(this.interReadDelayMs);
    return raw.data.filter((code) => code !== 0);
  }

  /**
   * Writes a value to the inverter
   */
  async setSetting(setting: InverterCommand, value: number) {
    // Most settings on SRNE don't use decimals for writing simple priorities
    // But for currents (e.g. 40.0A), you usually multiply by 10
    await this.client.writeRegister(
      setting.address,
      value * Math.pow(10, setting.decimals),
    );
  }
}
