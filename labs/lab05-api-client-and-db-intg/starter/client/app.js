const API_BASE_URL = "http://localhost:3000";

const loadButton = document.querySelector("#load-items");
const itemList = document.querySelector("#items");
const form = document.querySelector("#add-item-form");
const itemNameInput = document.querySelector("#item-name");
const itemQuantityInput = document.querySelector("#item-quantity");
const statusBox = document.querySelector("#status");
const updateIdInput = document.querySelector("#update-item-id");
const updateNameInput = document.querySelector("#update-item-name");
const updateQuantityInput = document.querySelector("#update-item-quantity");
const putButton = document.querySelector("#put-item");
const patchButton = document.querySelector("#patch-item");
const deleteButton = document.querySelector("#delete-item");
const getIdInput = document.querySelector("#get-item-id");
const getButton = document.querySelector("#get-item-button");

function setStatus(message) {
  statusBox.textContent = message;
}

function renderItems(items) {
  itemList.replaceChildren();

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = `${item.id}: ${item.name} (${item.quantity})`;
    itemList.appendChild(li);
  }
}

async function loadItems() {
  setStatus("Loading items...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items`);

    if (!response.ok) {
      throw new Error(`GET /api/items failed with status ${response.status}`);
    }

    const data = await response.json();
    renderItems(data.items);
    setStatus("Items loaded.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function getItem() {
  const id = Number(getIdInput.value);
  setStatus("Loading item...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "GET item failed");
    }

    itemList.replaceChildren();

    const li = document.createElement("li");
    li.textContent = `${data.item.id}: ${data.item.name} (${data.item.quantity})`;

    itemList.appendChild(li);

    setStatus("Item loaded");
  } catch (error) {
    setStatus(error.message);
  }
}

async function addItem(name, quantity) {
  setStatus("Adding item...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, quantity })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? `POST /api/items failed with status ${response.status}`);
    }

    setStatus(`Added item: ${data.item.name}`);
    await loadItems();
  } catch (error) {
    setStatus(error.message);
  }
}

async function putItem() {
  const id = Number(updateIdInput.value);
  const name = updateNameInput.value.trim();
  const quantity = Number(updateQuantityInput.value);
  try {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, quantity })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message ?? "PUT failed");
    }

    setStatus(`Updated item: ${data.item.name}`);
    await loadItems();
  } catch (error) {
    setStatus(error.message);
  }
}


async function patchItem() {
  const id = Number(updateIdInput.value);
  const name = updateNameInput.value.trim();
  const quantityText = updateQuantityInput.value;
  const body = {};

  if (name) {
    body.name = name;
  }

  if (quantityText !== "") {
    body.quantity = Number(quantityText);
  }


  try {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message ?? "PATCH failed");
    }

    setStatus(`Updated Item: ${data.item.name}`);

    await loadItems();
  } catch (error) {
    setStatus(error.message);
  }
}

async function deleteItem() {
  const id = Number(updateIdInput.value);
  try {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "DELETE failed");
    }
    setStatus(`Deleted item: ${data.item.name}`);
    await loadItems();
  } catch (error) {
    setStatus(error.message);
  }
}

loadButton.addEventListener("click", loadItems);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = itemNameInput.value.trim();
  const quantity = Number(itemQuantityInput.value);

  if (!name || !Number.isInteger(quantity) || quantity < 0) {
    setStatus("Enter a name and a non-negative integer quantity.");
    return;
  }

  itemNameInput.value = "";
  itemQuantityInput.value = "0";
  await addItem(name, quantity);
});

putButton.addEventListener("click", putItem);
patchButton.addEventListener("click", patchItem);
deleteButton.addEventListener("click", deleteItem);
getButton.addEventListener("click", getItem);
