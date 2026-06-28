import express from "express";

export function createApp() {
  const app = express();

  app.use(express.json());

  // Starter data. This data is stored in memory and will reset when the
  // server restarts.
  let nextId = 3;
  const items = [
    { id: 1, name: "keyboard", quantity: 10 },
    { id: 2, name: "mouse", quantity: 5 }
  ];

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // TODO: Return all items.
  app.get("/items", (req, res) => {
    res.json(items);
  });

  // TODO: Return one item by ID.
  app.get("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = items.find(item => item.id === id);

    if(!item){
      return res.status(404).json({error: "cannot find item"})
    }

    res.json(item);
  });

  // TODO: Create a new item.
  app.post("/items", (req, res) => {
    const {name, quantity} = req.body;

    if (name === undefined || quantity === undefined){
      return res.status(400).json({error: "name or quantity is missing"});
    }
    const newItem = {
      id: nextId++,
      name,
      quantity
    };

    items.push(newItem);
    res.status(201).json(newItem);
  });

  // TODO: Update an existing item.
  app.put("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = items.find(item => item.id === id);
    if (!item){
      return res.status(404).json({error: "cannot find item"});

    }
    const {name, quantity} = req.body;

    if (name === undefined || quantity === undefined) {
      return res.status(400).json({error: "name or quantity is missing."});
    }

    item.name = name;
    item.quantity = quantity;
    res.json(item);
  });

  // TODO: Delete an existing item.
  app.delete("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = items.findIndex(item => item.id === id);

    if (index === -1){
      return res.status(404).json({error: "Cannot find the item"});

    }
    items.splice(index, 1);
    res.status(204).send();
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

//had to make small formatting changes here for Windows because the server was closing after running
import { fileURLToPath } from "url";

const isMainModule =
  process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Lab 3 REST API listening on port ${PORT}`);
  });
}
