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
  BatteryType,
  PvVoltage,
  PvCurrent,
  PvPower,
  GridVoltage,
  GridFrequency,
  InverterPower,
  InverterOutputPriority,
  InverterChargerPriority,
  TempDc,
}

export interface InverterCommand {
  address: number;
  decimals: number;
  signed: boolean;
  label: string;
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
  [CommandKey.BatteryType]: {
    address: 0xe004,
    decimals: 0,
    signed: false,
    label: "Battery Type",
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
  [CommandKey.GridFrequency]: {
    address: 0x0215,
    decimals: 2,
    signed: false,
    label: "Grid Frequency",
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
  },
  [CommandKey.InverterChargerPriority]: {
    address: 0xe20f,
    decimals: 0,
    signed: false,
    label: "Charger Priority",
  },
  [CommandKey.TempDc]: {
    address: 0x0221,
    decimals: 1,
    signed: true,
    label: "DC Temperature",
  },
};

export const WRITE_COMMANDS = {
  gridMaxCurrent: 0xe205,
  batteryMaxCurrent: 0xe20a,
  outputPriority: 0xe204,
  chargerPriority: 0xe20f,
};
