import { Router } from "express";

const router = Router();

// This router is mounted at /hello in src/server.js.
router.get("/", (req, res) => {
  res.json({
    message: "Hello from Express"
  });
});

export default router;
