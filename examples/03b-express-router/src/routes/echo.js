import { Router } from "express";

const router = Router();

// This router is mounted at /echo in src/server.js.
router.post("/", (req, res) => {
  res.json({
    youSent: req.body
  });
});

export default router;
