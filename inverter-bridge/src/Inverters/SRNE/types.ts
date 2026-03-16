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

export enum ReadCommandKey {
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

export enum WriteCommandKey {
  GridMaxChargeCurrent,
  BatteryMaxChargeCurrent,
  OutputPriority,
  ChargerPriority,
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

export const READ_COMMANDS: Record<ReadCommandKey, InverterCommand> = {
  [ReadCommandKey.BatteryVoltage]: {
    address: 0x0101,
    decimals: 1,
    signed: false,
    label: "Battery Voltage",
  },
  [ReadCommandKey.BatteryCurrent]: {
    address: 0x0102,
    decimals: 1,
    signed: true,
    negate: true,
    label: "Battery Current",
  },
  [ReadCommandKey.BatteryChargePower]: {
    address: 0x010e,
    decimals: 0,
    signed: false,
    label: "Battery Charge Power",
  },
  [ReadCommandKey.BatterySoc]: {
    address: 0x0100,
    decimals: 0,
    signed: false,
    label: "Battery SOC",
  },
  [ReadCommandKey.BatteryMaxChargeCurrent]: {
    address: 0xe20a,
    decimals: 1,
    signed: false,
    label: "Battery Max Charge Current",
  },
  [ReadCommandKey.BatteryType]: {
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
  [ReadCommandKey.BatteryBoostChargeVoltage]: {
    address: 0xe008,
    decimals: 1,
    signed: false,
    systemScaled: true,
    label: "Battery Boost Charge Voltage",
  },
  [ReadCommandKey.BatteryBoostChargeTime]: {
    address: 0xe012,
    decimals: 0,
    signed: false,
    label: "Battery Boost Charge Time",
  },
  [ReadCommandKey.BatteryFloatChargeVoltage]: {
    address: 0xe009,
    decimals: 1,
    signed: false,
    systemScaled: true,
    label: "Battery Float Charge Voltage",
  },
  [ReadCommandKey.BatteryOverDischargeVoltage]: {
    address: 0xe00d,
    decimals: 1,
    signed: false,
    systemScaled: true,
    label: "Battery Over Discharge Voltage",
  },
  [ReadCommandKey.PvVoltage]: {
    address: 0x0107,
    decimals: 1,
    signed: false,
    label: "PV Voltage",
  },
  [ReadCommandKey.PvCurrent]: {
    address: 0x0108,
    decimals: 1,
    signed: false,
    label: "PV Current",
  },
  [ReadCommandKey.PvPower]: {
    address: 0x0109,
    decimals: 0,
    signed: false,
    label: "PV Power",
  },
  [ReadCommandKey.GridVoltage]: {
    address: 0x0213,
    decimals: 1,
    signed: false,
    label: "Grid Voltage",
  },
  [ReadCommandKey.GridInputCurrent]: {
    address: 0x0214,
    decimals: 1,
    signed: false,
    label: "Grid Input Current",
  },
  [ReadCommandKey.GridBatteryChargeCurrent]: {
    address: 0x021e,
    decimals: 1,
    signed: false,
    label: "Grid Battery Charge Current",
  },
  [ReadCommandKey.GridFrequency]: {
    address: 0x0215,
    decimals: 2,
    signed: false,
    label: "Grid Frequency",
  },
  [ReadCommandKey.GridBatteryChargeMaxCurrent]: {
    address: 0xe205,
    decimals: 1,
    signed: false,
    label: "Grid Battery Charge Max Current",
  },
  [ReadCommandKey.InverterVoltage]: {
    address: 0x0216,
    decimals: 1,
    signed: false,
    label: "Inverter Voltage",
  },
  [ReadCommandKey.InverterCurrent]: {
    address: 0x0219,
    decimals: 1,
    signed: false,
    label: "Inverter Current",
  },
  [ReadCommandKey.InverterFrequency]: {
    address: 0x0218,
    decimals: 2,
    signed: false,
    label: "Inverter Frequency",
  },
  [ReadCommandKey.InverterPower]: {
    address: 0x021b,
    decimals: 0,
    signed: false,
    label: "Inverter Power",
  },
  [ReadCommandKey.InverterOutputPriority]: {
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
  [ReadCommandKey.InverterChargerPriority]: {
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
  [ReadCommandKey.TempDc]: {
    address: 0x0221,
    decimals: 1,
    signed: true,
    label: "DC Temperature",
  },
  [ReadCommandKey.TempAc]: {
    address: 0x0222,
    decimals: 1,
    signed: true,
    label: "AC Temperature",
  },
  [ReadCommandKey.TempTr]: {
    address: 0x0223,
    decimals: 1,
    signed: true,
    label: "Transformer Temperature",
  },
};

export const WRITE_COMMANDS: Record<WriteCommandKey, InverterCommand> = {
  [WriteCommandKey.GridMaxChargeCurrent]: {
    address: 0xe205,
    decimals: 1,
    signed: false,
    label: "Grid Battery Charge Max Current",
  },
  [WriteCommandKey.BatteryMaxChargeCurrent]: {
    address: 0xe20a,
    decimals: 1,
    signed: false,
    label: "Battery Max Charge Current",
  },
  [WriteCommandKey.OutputPriority]: {
    address: 0xe204,
    decimals: 0,
    signed: false,
    label: "Output Priority",
  },
  [WriteCommandKey.ChargerPriority]: {
    address: 0xe20f,
    decimals: 0,
    signed: false,
    label: "Charger Priority",
  },
};
