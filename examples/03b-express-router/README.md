# Example 03b - Express Routers

This companion to Example 03 has the same small HTTP JSON API, but the route handlers are split into modules in `src/routes/`.

Example 03 keeps every route in one file so the basics are easy to see. As an application grows, putting related handlers in `Router` modules keeps `server.js` focused on application setup: middleware, router mounting, and error handling.

## Project Structure

```text
src/
├── server.js
└── routes/
    ├── echo.js
    ├── health.js
    ├── hello.js
    ├── items.js
    └── requests.js
```

Each file in `src/routes/` creates and exports an Express `Router`. In `src/server.js`, `app.use()` mounts that router at a URL prefix:

```js
import itemsRouter from "./routes/items.js";

app.use("/items", itemsRouter);
```

The `items` router then uses paths relative to that prefix:

```js
router.get("/", handler);       // GET /items
router.get("/:id", handler);    // GET /items/:id
```

## Running the Example

```bash
cd examples/03b-express-router
npm install
npm run server
```

The server listens on port `3000` by default.

## Try It

The endpoints behave like Example 03:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/hello
curl http://localhost:3000/requests
curl http://localhost:3000/items
curl http://localhost:3000/items/7
curl -X POST http://localhost:3000/echo \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
```

An unknown route still returns a JSON 404 response:

```bash
curl http://localhost:3000/missing
```

## Things to Notice

1. `server.js` owns app-wide middleware and mounts routers with `app.use()`.
2. A route module imports `Router`, adds handlers with `router.get()` or `router.post()`, and exports the router.
3. The mount path and the router path are combined. Mounting a router at `/items` and using `router.get("/:id")` creates `GET /items/:id`.
4. The request counter is stored in `app.locals` so the middleware in `server.js` and the `/requests` router can share it.
