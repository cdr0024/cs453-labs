import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5433),
  database: process.env.PGDATABASE ?? "lab05",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres"
});

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ]
  }));

  app.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        message: "Database connection failed."
      });
    }
  });

  // Starter route: return every item from the database.
  app.get("/api/items", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, quantity
        FROM items
        ORDER BY id ASC
      `);

      res.json({ items: result.rows });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  });

  // Starter route: create one item so the client can demonstrate a write.
  app.post("/api/items", async (req, res) => {
    const name = req.body?.name?.trim();
    const quantity = Number(req.body?.quantity);

    if (!name || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "A name and non-negative integer quantity are required."
      });
    }

    try {
      const result = await pool.query(
        `
          INSERT INTO items (name, quantity)
          VALUES ($1, $2)
          RETURNING id, name, quantity
        `,
        [name, quantity]
      );

      res.status(201).json({ item: result.rows[0] });
    } catch (error) {
      console.error("Failed to add item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to add item."
      });
    }
  });

  // TODO: Return one item by ID.
  app.get("/api/items/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "ID must be an integer"
      });
    }

    try {
      const result = await pool.query(
        `
        SELECT id, name, quantity
        FROM items
        WHERE id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not found",
          message: "Item not found."
        });
      }

      res.json({ item: result.rows[0] });
    } catch (error) {
      console.error("Failed to load item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load item."
      });
    }
  });

  // TODO: Replace one item by ID.
  app.put("/api/items/:id", async (req, res) => {
    const id = Number(req.params.id);
    const name = req.body?.name?.trim();
    const quantity = Number(req.body?.quantity);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "ID must be an integer."
      });
    }

    if (!name || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "A name and positive integer are required"
      });
    }


    try {
      const result = await pool.query(
        `
        UPDATE items
        SET name = $1, quantity = $2
        WHERE id = $3
        RETURNING id, name, quantity
        `,
        [name, quantity, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Item not found"
        });
      }

      res.json({ item: result.rows[0]});
    } catch (error) {
      console.error("Failed to update item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update item"
      });
    }
  });

  // TODO: Partially update one item by ID.
  app.patch("/api/items/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Bad Reuqest",
        message: "ID must be an integer"
      });
    }

    const name = req.body?.name?.trim();
    const quantity = req.body?.quantity !== undefined
      ? Number(req.body.quantity)
      : undefined;

    if (name === undefined && quantity === undefined) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Provide a field to update"
      });
    }
    if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 0)) {
      return res.status(400).json({
        error: "Bad Request", 
        message: "Quantity must be a non-negative integer."
      });
    }


    try {
      const current = await pool.query(
        `
        
        SELECT id, name, quantity
        FROM items
        WHERE id = $1
        `,
        [id]
      );

      if (current.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Item not found"
        });
      }

      const updatedName = name ?? current.rows[0].name;
      const updatedQuantity = quantity ?? current.rows[0].quantity;
      const result = await pool.query(
        `
        UPDATE items
        SET name = $1, quantity = $2
        WHERE id = $3
        RETURNING id, name, quantity
        `,
        [updatedName, updatedQuantity, id]
      );

      res.json({ item: result.rows[0] });
    } catch (error) {
      console.error("Failed to patch item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update item"
      });
    }
  });

  // TODO: Delete one item by ID.
  app.delete("/api/items/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "ID must be an integer"
      });
    }

    try {
      const result = await pool.query(
        `
        DELETE FROM items
        WHERE id = $1
        RETURNING id, name, quantity
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Item not found"
        });
      }
      res.json({ item: result.rows[0] });

    } catch (error) {
      console.error("Failed to delete item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to delete item"
      });
    }
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity >= 0)
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM items");

  if (rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO items (name, quantity)
        VALUES ($1, $2), ($3, $4), ($5, $6)
      `,
      ["Keyboard", 10, "Mouse", 5, "Monitor", 3]
    );
  }
}

//fix for windows closing after starting server
import { fileURLToPath } from "url";

const isMainModule =
  process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  const app = createApp();

  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Lab 5 API listening on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error);
      process.exit(1);
    });
}
