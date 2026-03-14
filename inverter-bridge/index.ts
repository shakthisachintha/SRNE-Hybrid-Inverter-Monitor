import mqtt from "mqtt";
import ModbusRTU from "modbus-serial";

// --- CONFIGURATION ---
const SERIAL_PORT = "/dev/ttyUSB0";
const INVERTER_ID = 1;

// --- MQTT Configs ---
const MQTT_OPTIONS = {
  host: process.env.MQTT_HOST || "cloud-broker.example.com",
  port: Number(process.env.MQTT_PORT ?? 1883),
  username: process.env.MQTT_USERNAME || "your-username",
  password: process.env.MQTT_PASSWORD || "your-password",
  protocol: "mqtt",
};
// --- INITIALIZE HARDWARE ---
const modbusClient = new ModbusRTU();
await modbusClient.connectRTUBuffered(SERIAL_PORT, { baudRate: 9600 });
modbusClient.setID(INVERTER_ID);

// --- INITIALIZE MQTT ---
const mqttClient = mqtt.connect({
  host: MQTT_OPTIONS.host,
  port: MQTT_OPTIONS.port,
  protocol: "mqtt",
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
  // Subscribe to the command topic for setting changes
  mqttClient.subscribe("inverter/cmd/#");
});

// --- 1. THE DATA PUMP (Inverter -> Cloud) ---
setInterval(async () => {
  try {
    const data = await modbusClient.readHoldingRegisters(0x0100, 10); // Adjust range as needed
    const payload = {
      soc: data.data[0] ?? 0,
      voltage: (data.data[1] ?? 0) / 10,
      timestamp: Date.now(),
    };

    mqttClient.publish("inverter/telemetry", JSON.stringify(payload));
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Modbus Read Error:", errorMessage);
  }
}, 5000);

// --- 2. THE COMMAND LISTENER (Cloud -> Inverter) ---
mqttClient.on("message", async (topic, message) => {
  const cmd = JSON.parse(message.toString());
  console.log(`Received Command: ${topic}`, cmd);

  try {
    if (topic === "inverter/cmd/priority") {
      // Example: Setting Output Priority (Register 0xE204)
      await modbusClient.writeRegister(0xe204, cmd.value);
      mqttClient.publish(
        "inverter/cmd/ack",
        JSON.stringify({ status: "success", cmd: "priority" }),
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
