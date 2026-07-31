import { Router } from "express";

const router = Router();

// This router is mounted at /requests in src/server.js.
router.get("/", (req, res) => {
  res.json({
    count: req.app.locals.requestCount
  });
});

export default router;
