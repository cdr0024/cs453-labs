import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const port = 3000;
const { Pool } = pg;
// In a real deployment, set JWT_SECRET to a long random value kept outside git.
// The fallback keeps this classroom example runnable without cloud infrastructure.
const jwtSecret = process.env.JWT_SECRET ?? "development-only-change-me";
const jwtExpiresIn = "1h";

const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5433),
  database: process.env.PGDATABASE ?? "cs453",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres"
});

app.use(express.json());

// This allows the browser client at localhost:5173 to read API responses.
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin: allowedOrigins
}));

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'admin'))
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM items");

  if (rows[0].count === 0) {
    await pool.query(
      "INSERT INTO items (name) VALUES ($1), ($2), ($3)",
      ["Notebook", "Pencil", "Coffee"]
    );
  }

  const userCount = await pool.query("SELECT COUNT(*)::int AS count FROM users");

  if (userCount.rows[0].count === 0) {
    const passwordHash = await bcrypt.hash("user-password", 10);
    const adminPasswordHash = await bcrypt.hash("admin-password", 10);

    await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3), ($4, $5, $6)",
      ["user", passwordHash, "user", "admin", adminPasswordHash, "admin"]
    );
  }
}

function authenticateToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Send a Bearer token in the Authorization header."
    });
  }

  const token = authorization.slice("Bearer ".length);

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({
      error: "Unauthorized",
      message: "The access token is missing, invalid, or expired."
    });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `This action requires one of these roles: ${roles.join(", ")}.`
      });
    }

    next();
  };
}

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

app.post("/api/auth/login", async (req, res) => {
  const username = req.body?.username?.trim();
  const password = req.body?.password;

  if (!username || !password) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Username and password are required."
    });
  }

  try {
    const result = await pool.query(
      "SELECT id, username, password_hash, role FROM users WHERE username = $1",
      [username]
    );
    const user = result.rows[0];

    // Use the same response for an unknown username and a wrong password.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid username or password."
      });
    }

    const token = jwt.sign(
      { sub: String(user.id), username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    res.json({
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: jwtExpiresIn,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Login failed." });
  }
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/items", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM items ORDER BY id ASC"
    );

    res.json({ items: result.rows });
  } catch (error) {
    console.error("Failed to load items:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to load items from the database."
    });
  }
});

app.post("/api/items", authenticateToken, requireRole("admin"), async (req, res) => {
  const name = req.body?.name?.trim();

  if (!name) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Item name is required."
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO items (name) VALUES ($1) RETURNING id, name",
      [name]
    );

    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    console.error("Failed to add item:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to save item to the database."
    });
  }
});

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn("JWT_SECRET is not set; using the development-only secret.");
    }
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Demo API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
