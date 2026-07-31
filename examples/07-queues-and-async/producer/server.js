import express from "express";
import amqp from "amqplib";
import { randomUUID } from "node:crypto";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const rabbitUrl = process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672";
const queueName = "order-submitted";
const deadLetterQueue = "order-submitted.dead-letter";

let channel;

async function connectToBroker() {
  const connection = await amqp.connect(rabbitUrl);
  channel = await connection.createChannel();

  await channel.assertQueue(deadLetterQueue, { durable: true });
  await channel.assertQueue(queueName, {
    durable: true,
    deadLetterExchange: "",
    deadLetterRoutingKey: deadLetterQueue
  });

  connection.on("error", (error) => console.error("RabbitMQ connection error:", error.message));
  connection.on("close", () => {
    channel = undefined;
    console.error("RabbitMQ connection closed; restart the producer after RabbitMQ is available.");
  });
}

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(channel ? 200 : 503).json({
    status: channel ? "ok" : "unavailable",
    broker: channel ? "connected" : "disconnected"
  });
});

app.post("/api/orders", (req, res) => {
  const item = req.body?.item?.trim();
  const quantity = Number(req.body?.quantity);

  if (!item || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Send a non-empty item and a positive integer quantity."
    });
  }

  if (!channel) {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "The message broker is not connected."
    });
  }

  const order = {
    id: randomUUID(),
    type: "OrderSubmitted",
    item,
    quantity,
    submittedAt: new Date().toISOString()
  };

  // persistent asks RabbitMQ to save the message to a durable queue.
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(order)), {
    persistent: true,
    contentType: "application/json",
    messageId: order.id,
    type: order.type
  });

  // The worker has not processed the order yet. 202 captures that distinction.
  res.status(202).json({
    message: "Order accepted for asynchronous processing.",
    order
  });
});

async function start() {
  try {
    await connectToBroker();
    app.listen(port, () => console.log(`Producer API listening at http://localhost:${port}`));
  } catch (error) {
    console.error("Could not connect to RabbitMQ:", error.message);
    process.exit(1);
  }
}

start();
