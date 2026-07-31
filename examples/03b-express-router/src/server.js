import express from "express";
import echoRouter from "./routes/echo.js";
import healthRouter from "./routes/health.js";
import helloRouter from "./routes/hello.js";
import itemsRouter from "./routes/items.js";
import requestsRouter from "./routes/requests.js";

const PORT = process.env.PORT || 3000;

const app = express();

// This middleware tells Express to parse JSON request bodies.
app.use(express.json());

app.locals.requestCount = 0;

// Simple middleware that runs before each route.
app.use((req, res, next) => {
  req.app.locals.requestCount += 1;
  console.log(`${req.method} ${req.path}`);
  next();
});

// Each router handles one part of the API. The first argument is its URL prefix.
app.use("/health", healthRouter);
app.use("/hello", helloRouter);
app.use("/requests", requestsRouter);
app.use("/echo", echoRouter);
app.use("/items", itemsRouter);

// This catches requests that did not match any router above.
app.use((req, res) => {
  res.status(404).json({
    error: "Not found"
  });
});

const server = app.listen(PORT, () => {
  console.log(`Express router example listening on port ${PORT}`);
});

server.on("error", error => {
  console.error("Unable to start server:", error.message);
});
