# Lab 5 Starter  
edited and developed on Visual STudio code on windows 11

## How to Run

```bash
npm install
docker compose up -d
npm run api
npm run client
```

Open:

```text
http://localhost:5173
```

Postgres is exposed on:

```text
postgres://postgres:postgres@localhost:5433/lab05
```

## What Already Works

- Postgres runs in Docker.
- The Express server connects to Postgres.
- The server creates and seeds an `items` table on startup.
- `GET /health`, `GET /api/items`, and `POST /api/items` are implemented.
- The browser client can load items and add a new item.

## What You Need to Add

- `GET /api/items/:id`
- `PUT /api/items/:id`
- `PATCH /api/items/:id`
- `DELETE /api/items/:id`
- Better validation and error handling
- Client-side UI for at least some of the new routes

## Graduate Extension

Add one more resource or relationship, such as categories, projects, or tags,
and connect it to the database.

## Reflection Answers

### 1. What changed when the API moved from in-memory data to Postgres?

The data changed from temporary to persistent with the change. The in-memory data restarted with the server. Using Postgres allows the data to stay even when the server restarts

### 2. When should you use `PUT` instead of `PATCH`?

PUT is used for replacing an entire item while PATCH should be used when you want to only change part of an item.

### 3. What kinds of validation belong in the API even if the browser client also validates input?

The API needs to validate thing like required fields, correct types and valid values. The API needs this validation even if the browser client also validates it because clients can sometimes be bypassed. The added protection keeps verything valid across the board.

### 4. How does the browser client help you test the API differently than `curl` alone?

The browser client helps you test the API by giving you a more realistic way a user would interact with it. It also helps tie frontend to backend so that you can see everything works cohesively together.

### 5. If you added an extension, what did you add and why?

I did not add an optonal extension, since they were labeled as optional and I did not have extra time since still developing the midterm and the checkpoint 1 projects
