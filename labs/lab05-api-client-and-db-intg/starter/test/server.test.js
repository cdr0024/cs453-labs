import {describe, expect, test, beforeAll} from "vitest";
import request from "supertest";
import { createApp, initializeDatabase } from "../src/server.js";

const app = createApp();

describe("Items API routes", () => {
    beforeAll(async () => {
        await initializeDatabase();
    });

    test("GET /health returns status ok", async() => {
        const response = await request(app)
            .get("/health")
            .expect(200);

        expect(response.body).toEqual({
            status: "ok"
        });
    });

    test("POST /api/items creates new task", async () => {
        const response = await request(app)
            .post("/api/items")
            .send({
                name: "Test item",
                quantity: 5
            })
            .expect(201);

        expect(response.body.item).toMatchObject({
            name: "Test item",
            quantity: 5
        });
    });

    test("POST /api/items rejects invalid data", async () => {
        const response = await request(app)
            .post("/api/items")
            .send({
                name: "",
                quantity: -1
            })
            .expect(400);

        expect(response.body.error).toBe("Bad Request");
    });


    test("GET /api/items/:id return a item", async () => {
        const response = await request(app)
            .get("/api/items/999999")
            .expect(404);

        expect(response.body.message).toBe("Item not found.");
    });

    test("PUT /api/items/:id replaces an item", async () => {
        const response = await request(app)
            .put("/api/items/1")
            .send({
                name: "Updated Keyboard",
                quantity: 20
            })
            .expect(200);
        expect(response.body.item).toMatchObject({
            id: 1,
            name: "Updated Keyboard",
            quantity: 20
        });
    });


    test("PATCH /api/items/:id updates an item", async () => {
        const response = await request(app)
            .patch("/api/items/1")
            .send({
                quantity: 25
            })
            .expect(200);
        
            expect(response.body.item.quantity).toBe(25);
    });

    test("DELETE /api/items/:id delete an item", async () => {
        const create = await request(app)
            .post("/api/items")
            .send({
                name: "Delete Test",
                quantity: 1
            });

        const id = create.body.item.id;
        const response = await request(app)
            .delete(`/api/items/${id}`)
            .expect(200);

        expect(response.body.item.id).toBe(id);
    });

    test("Invalid id returns 400", async () => {
        const response = await request(app)
            .get("/api/items/not-a-number")
            .expect(400);
        expect(response.body.error).toBe("Bad Request");
    });


    test("Unknown routes return 404", async () => {
        await request(app)
            .get("/does-not-exist")
            .expect(404);
    });
});