import { Router } from "express";

const router = Router();

// This router is mounted at /items in src/server.js.
router.get("/", (req, res) => {
  res.json({
    items: [
      {
        id: 1,
        name: "keyboard"
      },
      {
        id: 2,
        name: "mouse"
      },
      {
        id: 3,
        name: "monitor"
      }
    ]
  });
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  res.json({
    id,
    name: `Item ${id}`
  });
});

export default router;
