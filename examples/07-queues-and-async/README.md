# Example 07 — Queues and Asynchronous Work

This example implements the producer → queue → consumer model from Week 7.
An Express API accepts an order, publishes an `OrderSubmitted` message to
RabbitMQ, and immediately returns `202 Accepted`. A separate worker processes
the order later. The API and worker do not call one another directly.

It demonstrates:

- a producer service publishing a command to a durable RabbitMQ queue
- a consumer service that independently pulls and processes work
- `202 Accepted` when work has been queued but is not complete yet
- durable messages, manual acknowledgements, and `prefetch(1)` work distribution
- a dead-letter queue for messages the worker cannot process
- starting multiple consumers to scale processing independently of the producer

## Start RabbitMQ

```bash
npm install
docker compose up -d
```

RabbitMQ's management UI is available at <http://localhost:15672> with the
classroom credentials `guest` / `guest`. It shows the ready, unacknowledged,
and dead-letter message counts.

## Run the services

In two terminals from this directory, start the producer API and consumer:

```bash
npm run producer
```

```bash
npm run consumer
```

The producer runs at <http://localhost:3000>. Submit an order from a third
terminal:

```bash
curl -i http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"item":"notebook","quantity":2}'
```

The API responds before the worker's simulated 1.5-second processing delay.
Watch the worker terminal for the processing and acknowledgement messages.

To make the queue visibly absorb a burst, send several requests quickly or
start a second worker with `npm run consumer`. Each consumer receives a share
of the queued work; `prefetch(1)` limits each worker to one unacknowledged
message at a time.

## Flow

```text
client --POST /api/orders--> producer API --OrderSubmitted--> RabbitMQ queue
                                                             |
                                                             v
                                                      consumer worker
                                                             |
                                                       ack or reject
                                                             |
                                                 dead-letter queue on failure
```

The order message is a **command**: it asks a worker to perform work. The API
does not claim that the work is finished; it only confirms the message was
accepted for later processing. This is the time decoupling central to an
asynchronous system.

## Reliability notes

The queue and published messages are durable, so RabbitMQ can persist them
across a broker restart. The worker calls `ack` only after its work succeeds.
If the worker process dies before that acknowledgement, RabbitMQ can redeliver
the unacknowledged message to another consumer. A malformed message is rejected
without requeueing and lands in `order-submitted.dead-letter` rather than
blocking normal work forever.

These mechanisms do not make a real-world operation exactly-once. A worker may
complete an external side effect just before it crashes, then receive the
message again. Production consumers should make side effects idempotent, often
by recording and checking the message ID.

## Stop RabbitMQ

```bash
docker compose down
```
