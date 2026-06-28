# Lab 3 REST API

lab ran and tested on Visual Studio Code on Windows 11

## How to Run

```bash
npm install
npm run server
```

The server runs on:

```text
http://localhost:3000
```

## How to Test

```bash
npm test
```

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/items` | Return all items |
| GET | `/items/:id` | Return one item |
| POST | `/items` | Create one item |
| PUT | `/items/:id` | Update one item |
| DELETE | `/items/:id` | Delete one item |

## Reflection Answers

### 1. What makes this API more REST-like than the previous HTTP/JSON lab?

What makes this API more REST-like than the previous HTTP/JSON lab is that the client interacts with resources using standard HTTP methods. REST APIs expose resources not function calls. This lab demonstrates that concept more than our previous HTTP/JSON lab.

### 2. What is the purpose of a route parameter such as `/items/:id`?

A route parameter such as '/items/:id' lets the server get specifc items using the id from the URL. Also, a route parameter structured like '/items/:id' is using good design practices by using nouns and not exposing the internal working of the server.

### 3. Why should `POST`, `PUT`, and `DELETE` use different HTTP methods?

'POST', 'PUT', and 'DELETE' should use different HTTP methods because they have different purposes. 'POST' creates a new item, 'PUT' updates an item, and 'DELETE' removes an item. Since they have differing purposes, using different methods makes the API easier to understand and follows REST protocols.

### 4. What is the difference between a `400` error and a `404` error?

A '400' error indicates the request body is invalid while a '404' error indicates that a requested item was not found.

### 5. How does the OpenAPI file relate to your Express server code?

The OpenAPI file is the written promise about how the Express server behaves. It is the contract that helps humans, clients, tests and tools agree on what the server should do. Essentially, the OpenAPI file describes the Express server code to guide the client application in what services the server provides and the parameters the services take and respond with. The file helps the client know what is allowed and keeps the server responses predictable.

## Graduate Extension

TODO: Graduate students should describe their extension here.
