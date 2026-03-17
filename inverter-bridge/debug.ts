import { SrneInverter } from "./src/Inverters/SRNE/SrneInverter";
import {
  ReadCommandKey,
  READ_COMMANDS,
  WRITE_COMMANDS,
  OutputPriority,
  ChargerPriority,
  WriteCommandKey,
} from "./src/Inverters/SRNE/types";

// --- CONFIGURATION ---
const SERIAL_PORT = process.env.SERIAL_PORT || "/dev/ttyUSB0";

// --- INITIALIZE HARDWARE ---
const inverter = new SrneInverter();
await inverter.connect(SERIAL_PORT);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const testOutputPriority = async () => {
  const current = await inverter.getEnumValue(
    READ_COMMANDS[ReadCommandKey.InverterOutputPriority],
  );
  const testValue = OutputPriority.SBU;

  console.log(`Current Output Priority: ${current}`);
  console.log(`Setting Output Priority to: ${testValue}`);
  await inverter.setSetting(
    WRITE_COMMANDS[WriteCommandKey.OutputPriority],
    testValue,
  );
  await sleep(500);

  const readBack = await inverter.getEnumValue(
    READ_COMMANDS[ReadCommandKey.InverterOutputPriority],
  );
  console.log(`Read-back Output Priority: ${readBack}`);

  console.log(`Restoring original Output Priority: ${current}`);
  await inverter.setSetting(
    WRITE_COMMANDS[WriteCommandKey.OutputPriority],
    OutputPriority.SOL,
  );
  await sleep(500);

  const restored = await inverter.getEnumValue(
    READ_COMMANDS[ReadCommandKey.InverterOutputPriority],
  );
  console.log(`Restored Output Priority: ${restored}`);
};

const testChargerPriority = async () => {
  const current = await inverter.getEnumValue(
    READ_COMMANDS[ReadCommandKey.InverterChargerPriority],
  );
  const testValue = ChargerPriority.SNU;

  console.log(`Current Charger Priority: ${current}`);
  console.log(`Setting Charger Priority to: SNU`);
  await inverter.setSetting(
    WRITE_COMMANDS[WriteCommandKey.ChargerPriority],
    testValue,
  );
  await sleep(500);

  const readBack = await inverter.getEnumValue(
    READ_COMMANDS[ReadCommandKey.InverterChargerPriority],
  );
  console.log(`Read-back Charger Priority: ${readBack}`);

  console.log(`Restoring original Charger Priority: ${current}`);
  await inverter.setSetting(
    WRITE_COMMANDS[WriteCommandKey.ChargerPriority],
    ChargerPriority.OSO,
  );
  await sleep(500);

  const restored = await inverter.getEnumValue(
    READ_COMMANDS[ReadCommandKey.InverterChargerPriority],
  );
  console.log(`Restored Charger Priority: ${restored}`);
};

const testGridMaxChargeCurrent = async () => {
  const current = await inverter.getValue(
    READ_COMMANDS[ReadCommandKey.GridBatteryChargeMaxCurrent],
  );
  const testValue = 10;

  console.log(`Current Grid Max Charge Current: ${current}A`);
  console.log(`Setting Grid Max Charge Current to: ${testValue}A`);
  await inverter.setSetting(
    WRITE_COMMANDS[WriteCommandKey.GridMaxChargeCurrent],
    testValue,
  );
  await sleep(500);

  const readBack = await inverter.getValue(
    READ_COMMANDS[ReadCommandKey.GridBatteryChargeMaxCurrent],
  );
  console.log(`Read-back Grid Max Charge Current: ${readBack}A`);

  console.log(`Restoring original Grid Max Charge Current: ${current}A`);
  await inverter.setSetting(
    WRITE_COMMANDS[WriteCommandKey.GridMaxChargeCurrent],
    current,
  );
  await sleep(500);

  const restored = await inverter.getValue(
    READ_COMMANDS[ReadCommandKey.GridBatteryChargeMaxCurrent],
  );
  console.log(`Restored Grid Max Charge Current: ${restored}A`);
};

const testBatteryMaxChargeCurrent = async () => {
  const current = await inverter.getValue(
    READ_COMMANDS[ReadCommandKey.BatteryMaxChargeCurrent],
  );
  const testValue = 10;

  console.log(`Current Battery Max Charge Current: ${current}A`);
  console.log(`Setting Battery Max Charge Current to: ${testValue}A`);
  await inverter.setSetting(
    WRITE_COMMANDS[WriteCommandKey.BatteryMaxChargeCurrent],
    testValue,
  );
  await sleep(500);

  const readBack = await inverter.getValue(
    READ_COMMANDS[ReadCommandKey.BatteryMaxChargeCurrent],
  );
  console.log(`Read-back Battery Max Charge Current: ${readBack}A`);

  console.log(`Restoring original Battery Max Charge Current: ${current}A`);
  await inverter.setSetting(
    WRITE_COMMANDS[WriteCommandKey.BatteryMaxChargeCurrent],
    current,
  );
  await sleep(500);

  const restored = await inverter.getValue(
    READ_COMMANDS[ReadCommandKey.BatteryMaxChargeCurrent],
  );
  console.log(`Restored Battery Max Charge Current: ${restored}A`);
}

async function main() {
  console.log("=== Inverter Write Command Verification ===\n");

  //   await testOutputPriority();
  //   await testChargerPriority();
//   await testGridMaxChargeCurrent();
  await testBatteryMaxChargeCurrent();
  console.log("\n=== Verification Complete ===");
}

main().catch((e) => {
  const errorMessage = e instanceof Error ? e.message : String(e);
  console.error("Error:", errorMessage);
});
