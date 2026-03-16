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

/**
 * Verifies a write command by:
 * 1. Reading the current value
 * 2. Writing a test value
 * 3. Reading back to confirm
 * 4. Restoring the original value
 */
async function verifyWriteCommand(
  label: string,
  writeAddress: number,
  readCommand: (typeof READ_COMMANDS)[CommandKey],
  testValue: number,
): Promise<void> {
  console.log(`\n--- Verifying: ${label} ---`);

  const original = await inverter.getValue(readCommand);
  console.log(`  Current value : ${original}`);
  await sleep(500); // brief pause before writing

  console.log(`  Writing test value: ${testValue}`);
  await inverter.setSetting(writeAddress, testValue);
  await sleep(500); // brief pause before reading back

  const readBack = await inverter.getValue(readCommand);
  console.log(`  Read-back value   : ${readBack}`);

  // The register stores the raw integer (no decimal scaling applied on write),
  // so compare against the scaled test value
  const scaledTest = testValue / Math.pow(10, readCommand.decimals);
  if (readBack === scaledTest) {
    console.log(`  ✓ PASS — value confirmed as ${readBack}`);
  } else {
    console.log(
      `  ✗ FAIL — expected ${scaledTest}, got ${readBack}`,
    );
  }

  console.log(`  Restoring original value: ${original}`);
  // Re-scale back to raw integer for writing
  const rawOriginal = Math.round(original * Math.pow(10, readCommand.decimals));
  await inverter.setSetting(writeAddress, rawOriginal);
  await sleep(500); // brief pause before reading back

  const restored = await inverter.getValue(readCommand);
  console.log(`  Restored value    : ${restored}`);
}

async function main() {
  console.log("=== Inverter Write Command Verification ===\n");

  const record = await inverter.getFullRecord();
  console.log("Initial snapshot:", record);

  // Output Priority: cycle through a known-different value and back
  const currentOutputPriority = record.inverter.outputPriority;
  const testOutputPriority =
    currentOutputPriority === OutputPriority.SOL
      ? OutputPriority.UTI
      : OutputPriority.SOL;
  await verifyWriteCommand(
    "Output Priority",
    WRITE_COMMANDS.outputPriority,
    READ_COMMANDS[CommandKey.InverterOutputPriority],
    testOutputPriority,
  );

  // Charger Priority: cycle through a known-different value and back
//   const currentChargerPriority = record.inverter.chargerPriority;
//   const testChargerPriority =
//     currentChargerPriority === ChargerPriority.OSO
//       ? ChargerPriority.CSO
//       : ChargerPriority.OSO;
//   await verifyWriteCommand(
//     "Charger Priority",
//     WRITE_COMMANDS.chargerPriority,
//     READ_COMMANDS[CommandKey.InverterChargerPriority],
//     testChargerPriority,
//   );

  // Grid Max Charge Current: nudge by +5A (raw register stores value × 10)
//   const currentGridMax = record.grid.batteryChargeMaxCurrent;
//   const testGridMax = currentGridMax === 80 ? 75 : currentGridMax + 5;
//   await verifyWriteCommand(
//     "Grid Max Charge Current",
//     WRITE_COMMANDS.gridMaxCurrent,
//     READ_COMMANDS[CommandKey.GridBatteryChargeMaxCurrent],
//     Math.round(testGridMax * 10), // register stores tenths
//   );

  // Battery Max Charge Current: nudge by +5A (raw register stores value × 10)
//   const currentBattMax = record.battery.maxChargeCurrent;
//   const testBattMax = currentBattMax === 80 ? 75 : currentBattMax + 5;
//   await verifyWriteCommand(
//     "Battery Max Charge Current",
//     WRITE_COMMANDS.batteryMaxCurrent,
//     READ_COMMANDS[CommandKey.BatteryMaxChargeCurrent],
//     Math.round(testBattMax * 10), // register stores tenths
//   );

  console.log("\n=== Verification Complete ===");
}

main().catch((e) => {
  const errorMessage = e instanceof Error ? e.message : String(e);
  console.error("Error:", errorMessage);
});
