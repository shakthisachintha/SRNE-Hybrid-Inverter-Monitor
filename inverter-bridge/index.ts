import mqtt from "mqtt";
import dotenv from "dotenv";
import { SrneInverter } from "./src/Inverters/SRNE/SrneInverter";
import { WRITE_COMMANDS } from "./src/Inverters/SRNE/types";

dotenv.config();

// --- CONFIGURATION ---
const SERIAL_PORT = process.env.SERIAL_PORT || "/dev/ttyUSB0";

// --- MQTT Configs ---
const MQTT_OPTIONS = {
  host: process.env.MQTT_HOST || "cloud-broker.example.com",
  port: Number(process.env.MQTT_PORT ?? 1883),
  username: process.env.MQTT_USERNAME || "your-username",
  password: process.env.MQTT_PASSWORD || "your-password",
};

// --- INITIALIZE HARDWARE ---
const inverter = new SrneInverter();
await inverter.connect(SERIAL_PORT);

// --- INITIALIZE MQTT ---
const mqttClient = mqtt.connect({
  host: MQTT_OPTIONS.host,
  port: MQTT_OPTIONS.port,
  protocol: "mqtts",
  username: MQTT_OPTIONS.username,
  password: MQTT_OPTIONS.password,
  will: {
    topic: "inverter/status",
    payload: "offline",
    retain: true,
  },
});

mqttClient.on("connect", () => {
  console.log("Connected to Cloud Broker");
  mqttClient.publish("inverter/status", "online", { retain: true });
  mqttClient.subscribe("inverter/cmd/#");
});

// --- COMMAND LISTENER (Cloud -> Inverter) ---
mqttClient.on("message", async (topic, message) => {
  const cmd = JSON.parse(message.toString());
  console.log(`Received Command: ${topic}`, cmd);

  try {
    if (topic === "inverter/cmd/priority") {
      await inverter.setSetting(WRITE_COMMANDS.outputPriority, cmd.value);
      mqttClient.publish(
        "inverter/cmd/ack",
        JSON.stringify({ status: "success", cmd: "priority" }),
      );
    } else if (topic === "inverter/cmd/charger_priority") {
      await inverter.setSetting(WRITE_COMMANDS.chargerPriority, cmd.value);
      mqttClient.publish(
        "inverter/cmd/ack",
        JSON.stringify({ status: "success", cmd: "charger_priority" }),
      );
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    mqttClient.publish(
      "inverter/cmd/ack",
      JSON.stringify({ status: "error", message: errorMessage }),
    );
  }
});

async function main() {
  console.log("Starting Inverter Bridge...");

  const record = await inverter.getFullRecord();
  console.log("Initial Data:", record);

  // --- DATA PUMP (Inverter -> Cloud) ---
  console.log("Starting Data Pump...");
  setInterval(async () => {
    try {
      const record = await inverter.getFullRecord();
      console.log("Telemetry Data on Timer:", record);
      mqttClient.publish("inverter/telemetry", JSON.stringify(record));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Modbus Read Error:", errorMessage);
    }
  }, 5000);
}

main().catch((e) => {
  const errorMessage = e instanceof Error ? e.message : String(e);
  console.error("Initialization Error:", errorMessage);
});
