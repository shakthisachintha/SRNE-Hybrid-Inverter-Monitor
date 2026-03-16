export enum BatteryType {
  USER = 0,
  SLD = 1,
  FLD = 2,
  GEL = 3,
  LFP = 4,
  NCA = 5,
}

export enum OutputPriority {
  SOL = 0,
  UTI = 1,
  SBU = 2,
}

export enum ChargerPriority {
  CSO = 0,
  CUB = 1,
  SNU = 2,
  OSO = 3,
}

export enum CommandKey {
  BatteryVoltage,
  BatteryCurrent,
  BatteryChargePower,
  BatterySoc,
  BatteryMaxChargeCurrent,
  BatteryType,
  BatteryBoostChargeVoltage,
  BatteryBoostChargeTime,
  BatteryFloatChargeVoltage,
  BatteryOverDischargeVoltage,
  PvVoltage,
  PvCurrent,
  PvPower,
  GridVoltage,
  GridInputCurrent,
  GridBatteryChargeCurrent,
  GridFrequency,
  GridBatteryChargeMaxCurrent,
  InverterVoltage,
  InverterCurrent,
  InverterFrequency,
  InverterPower,
  InverterOutputPriority,
  InverterChargerPriority,
  TempDc,
  TempAc,
  TempTr,
}

export interface InverterCommand {
  address: number;
  decimals: number;
  signed: boolean;
  label: string;
  /** Register value is calibrated for a 12V base system;
   *  multiply by (systemVoltage / 12) to get the real value */
  systemScaled?: boolean;
  /** Negate the final value (positive = charging, negative = discharging) */
  negate?: boolean;
  /** Maps raw integer values to human-readable labels */
  enumMap?: Record<number, string>;
}

export const READ_COMMANDS: Record<CommandKey, InverterCommand> = {
  [CommandKey.BatteryVoltage]: {
    address: 0x0101,
    decimals: 1,
    signed: false,
    label: "Battery Voltage",
  },
  [CommandKey.BatteryCurrent]: {
    address: 0x0102,
    decimals: 1,
    signed: true,
    negate: true,
    label: "Battery Current",
  },
  [CommandKey.BatteryChargePower]: {
    address: 0x010e,
    decimals: 0,
    signed: false,
    label: "Battery Charge Power",
  },
  [CommandKey.BatterySoc]: {
    address: 0x0100,
    decimals: 0,
    signed: false,
    label: "Battery SOC",
  },
  [CommandKey.BatteryMaxChargeCurrent]: {
    address: 0xe20a,
    decimals: 1,
    signed: false,
    label: "Battery Max Charge Current",
  },
  [CommandKey.BatteryType]: {
    address: 0xe004,
    decimals: 0,
    signed: false,
    label: "Battery Type",
    enumMap: {
      [BatteryType.USER]: "USER",
      [BatteryType.SLD]: "SLD",
      [BatteryType.FLD]: "FLD",
      [BatteryType.GEL]: "GEL",
      [BatteryType.LFP]: "LFP",
      [BatteryType.NCA]: "NCA",
    },
  },
  [CommandKey.BatteryBoostChargeVoltage]: {
    address: 0xe008,
    decimals: 1,
    signed: false,
    systemScaled: true,
    label: "Battery Boost Charge Voltage",
  },
  [CommandKey.BatteryBoostChargeTime]: {
    address: 0xe012,
    decimals: 0,
    signed: false,
    label: "Battery Boost Charge Time",
  },
  [CommandKey.BatteryFloatChargeVoltage]: {
    address: 0xe009,
    decimals: 1,
    signed: false,
    systemScaled: true,
    label: "Battery Float Charge Voltage",
  },
  [CommandKey.BatteryOverDischargeVoltage]: {
    address: 0xe00d,
    decimals: 1,
    signed: false,
    systemScaled: true,
    label: "Battery Over Discharge Voltage",
  },
  [CommandKey.PvVoltage]: {
    address: 0x0107,
    decimals: 1,
    signed: false,
    label: "PV Voltage",
  },
  [CommandKey.PvCurrent]: {
    address: 0x0108,
    decimals: 1,
    signed: false,
    label: "PV Current",
  },
  [CommandKey.PvPower]: {
    address: 0x0109,
    decimals: 0,
    signed: false,
    label: "PV Power",
  },
  [CommandKey.GridVoltage]: {
    address: 0x0213,
    decimals: 1,
    signed: false,
    label: "Grid Voltage",
  },
  [CommandKey.GridInputCurrent]: {
    address: 0x0214,
    decimals: 1,
    signed: false,
    label: "Grid Input Current",
  },
  [CommandKey.GridBatteryChargeCurrent]: {
    address: 0x021e,
    decimals: 1,
    signed: false,
    label: "Grid Battery Charge Current",
  },
  [CommandKey.GridFrequency]: {
    address: 0x0215,
    decimals: 2,
    signed: false,
    label: "Grid Frequency",
  },
  [CommandKey.GridBatteryChargeMaxCurrent]: {
    address: 0xe205,
    decimals: 1,
    signed: false,
    label: "Grid Battery Charge Max Current",
  },
  [CommandKey.InverterVoltage]: {
    address: 0x0216,
    decimals: 1,
    signed: false,
    label: "Inverter Voltage",
  },
  [CommandKey.InverterCurrent]: {
    address: 0x0219,
    decimals: 1,
    signed: false,
    label: "Inverter Current",
  },
  [CommandKey.InverterFrequency]: {
    address: 0x0218,
    decimals: 2,
    signed: false,
    label: "Inverter Frequency",
  },
  [CommandKey.InverterPower]: {
    address: 0x021b,
    decimals: 0,
    signed: false,
    label: "Inverter Power",
  },
  [CommandKey.InverterOutputPriority]: {
    address: 0xe204,
    decimals: 0,
    signed: false,
    label: "Output Priority",
    enumMap: {
      [OutputPriority.SOL]: "SOL",
      [OutputPriority.UTI]: "UTI",
      [OutputPriority.SBU]: "SBU",
    },
  },
  [CommandKey.InverterChargerPriority]: {
    address: 0xe20f,
    decimals: 0,
    signed: false,
    label: "Charger Priority",
    enumMap: {
      [ChargerPriority.CSO]: "CSO",
      [ChargerPriority.CUB]: "CUB",
      [ChargerPriority.SNU]: "SNU",
      [ChargerPriority.OSO]: "OSO",
    },
  },
  [CommandKey.TempDc]: {
    address: 0x0221,
    decimals: 1,
    signed: true,
    label: "DC Temperature",
  },
  [CommandKey.TempAc]: {
    address: 0x0222,
    decimals: 1,
    signed: true,
    label: "AC Temperature",
  },
  [CommandKey.TempTr]: {
    address: 0x0223,
    decimals: 1,
    signed: true,
    label: "Transformer Temperature",
  },
};

export const WRITE_COMMANDS = {
  gridMaxCurrent: 0xe205,
  batteryMaxCurrent: 0xe20a,
  outputPriority: 0xe204,
  chargerPriority: 0xe20f,
};
