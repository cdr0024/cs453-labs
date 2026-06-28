import { describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";

describe("Lab 3 starter", () => {
  test("GET /health returns status ok", async () => {
    const app = createApp();

    const response = await request(app)
        .get("/health")
        .expect(200);

    expect(response.body).toEqual({ status: "ok" });
  });
  //TODO: test for GET all items
  test("GET /items returns all the current items", async () => {
    const app = createApp();
    const response = await request(app)
      .get("/items")
      .expect(200);

    expect(response.body).toEqual([
      {id: 1, name: "keyboard", quantity: 10},
      {id : 2, name: "mouse", quantity: 5}
    ]);
  });

  //TODO: test for GET one item
  test("GET /items/:id returns one of the specified items", async() => {
    const app = createApp();
    const response = await request(app)
      .get("/items/1")
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      name: "keyboard",
      quantity: 10

    });
  });
  //TODO: missing item returns 404
  test("GET /item/:id returns 404 for missing item", async () =>{
    const app = createApp();
    await request(app)
      .get("/items/50")
      .expect(404);
  });

  //TODO: test for POST to create new item
  test("POST /items adds a new item", async () => {
    const app = createApp();

    const response = await request(app)
      .post("/items")
      .send({
        name: "desk",
        quantity: 2
      })
      .expect(201);

    expect(response.body).toEqual({
      id: 3,
      name: "desk",
      quantity: 2
    });
  });
  //TODO: POST returns 400 when fields are missing
  test("POST /items returns 400 when fields are missing", async () => {
    const app = createApp();
    await request(app)
      .post("/items")
      .send({
        name: "monitor"
      })
      .expect(400);
  });

  //TODO: test for PUT to update an item
  test("PUT /items/:id updates an item", async () => {
    const app = createApp();
    const response = await request(app)
      .put("/items/2")
      .send({
        name: "monitor",
        quantity: 6
      })
      .expect(200);

    expect(response.body).toEqual({
      id: 2,
      name: "monitor",
      quantity: 6
    });
  });

  //TODO: test PUT returns 404 for missing item
  test("PUT /items/:id returns 404 for missing item", async () =>{
    const app = createApp();

    await request(app)
      .put("/items/50")
      .send({
        name: "monitor",
        quantity: 3
      })
      .expect(404)
  });

  //TODO: Test for DELETE to remove an item
  test("DELETE /items/:id deletes a item", async() => {
    const app = createApp();

    await request(app)
      .delete("/items/1")
      .expect(204);

    const response = await request(app)
      .get("/items")
      .expect(200);

    expect(response.body).toEqual([
      {
        id: 2,
        name: "mouse", 
        quantity: 5
      }
    ]);
  });
  
  //TODO: DELETE returns 404 for missing item
  test("DELETE /items/:id returns 404 for missing item", async () => {
    const app = createApp()

    await request(app)
      .delete("/items/50")
      .expect(404);
  });
  //TODO: test that invalid routes return 404
  test("Invalid route returns 404", async() => {
    const app = createApp()
    await request(app)
      .get("/invalid-route")
      .expect(404);
  });

});
