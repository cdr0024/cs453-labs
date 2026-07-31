import { Router } from "express";

const router = Router();

// This router is mounted at /health in src/server.js.
router.get("/", (req, res) => {
  res.json({
    status: "ok"
  });
});

export default router;
