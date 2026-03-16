import { SrneInverter } from "./src/Inverters/SRNE/SrneInverter";
import {
  CommandKey,
  READ_COMMANDS,
  WRITE_COMMANDS,
  OutputPriority,
  ChargerPriority,
} from "./src/Inverters/SRNE/types";

// --- CONFIGURATION ---
const SERIAL_PORT = process.env.SERIAL_PORT || "/dev/ttyUSB0";

// --- INITIALIZE HARDWARE ---
const inverter = new SrneInverter();
await inverter.connect(SERIAL_PORT);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const testOutputPriority = async () => {
  const current = await inverter.getEnumValue(
    READ_COMMANDS[CommandKey.InverterOutputPriority],
  );
  const testValue = OutputPriority.SBU;

  console.log(`Current Output Priority: ${current}`);
  console.log(`Setting Output Priority to: ${testValue}`);
  await inverter.setSetting(WRITE_COMMANDS.outputPriority, testValue);
  await sleep(500);

  const readBack = await inverter.getEnumValue(
    READ_COMMANDS[CommandKey.InverterOutputPriority],
  );
  console.log(`Read-back Output Priority: ${readBack}`);

  console.log(`Restoring original Output Priority: ${current}`);
  await inverter.setSetting(WRITE_COMMANDS.outputPriority, OutputPriority.SOL);
  await sleep(500);

  const restored = await inverter.getEnumValue(
    READ_COMMANDS[CommandKey.InverterOutputPriority],
  );
  console.log(`Restored Output Priority: ${restored}`);
};

async function main() {
  console.log("=== Inverter Write Command Verification ===\n");

  await testOutputPriority();

  console.log("\n=== Verification Complete ===");
}

main().catch((e) => {
  const errorMessage = e instanceof Error ? e.message : String(e);
  console.error("Error:", errorMessage);
});
