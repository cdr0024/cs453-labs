import amqp from "amqplib";

const rabbitUrl = process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672";
const queueName = "order-submitted";
const deadLetterQueue = "order-submitted.dead-letter";

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function start() {
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();

  await channel.assertQueue(deadLetterQueue, { durable: true });
  await channel.assertQueue(queueName, {
    durable: true,
    deadLetterExchange: "",
    deadLetterRoutingKey: deadLetterQueue
  });

  // One unacknowledged message per worker makes the work distribution visible.
  await channel.prefetch(1);

  console.log(`Waiting for messages in ${queueName}. Press Ctrl+C to exit.`);

  channel.consume(queueName, async (message) => {
    if (!message) return;

    try {
      const order = JSON.parse(message.content.toString());
      console.log(`Processing ${order.type} ${order.id}: ${order.quantity} × ${order.item}`);

      // Stand-in for work such as charging a card, sending email, or updating a database.
      await delay(1500);

      // Acknowledge only after the work succeeds, so RabbitMQ can remove it.
      channel.ack(message);
      console.log(`Completed order ${order.id}`);
    } catch (error) {
      console.error("Order failed; moving it to the dead-letter queue:", error.message);
      // reject(false) prevents an endlessly failing message from blocking the queue.
      channel.reject(message, false);
    }
  });

  connection.on("error", (error) => console.error("RabbitMQ connection error:", error.message));
  connection.on("close", () => console.error("RabbitMQ connection closed."));
}

start().catch((error) => {
  console.error("Could not start consumer:", error.message);
  process.exit(1);
});
