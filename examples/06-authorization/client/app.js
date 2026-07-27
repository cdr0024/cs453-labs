const API_BASE_URL = "http://localhost:3000";

const loginForm = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const logoutButton = document.querySelector("#logout");
const identity = document.querySelector("#identity");
const loadButton = document.querySelector("#load-items");
const itemList = document.querySelector("#items");
const form = document.querySelector("#add-item-form");
const itemNameInput = document.querySelector("#item-name");
const statusBox = document.querySelector("#status");
let accessToken;
let currentUser;

function setStatus(message) {
  statusBox.textContent = message;
}

function updateIdentity() {
  identity.textContent = currentUser
    ? `Logged in as ${currentUser.username} (${currentUser.role}).`
    : "Not logged in.";
}

function authHeaders(headers = {}) {
  return accessToken
    ? { ...headers, Authorization: `Bearer ${accessToken}` }
    : headers;
}

async function readResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      accessToken = undefined;
      currentUser = undefined;
      updateIdentity();
    }
    throw new Error(data.message ?? `Request failed with status ${response.status}`);
  }

  return data;
}

function renderItems(items) {
  itemList.replaceChildren();

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = `${item.id}: ${item.name}`;
    itemList.appendChild(li);
  }
}

async function loadItems() {
  setStatus("Loading items...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      headers: authHeaders()
    });
    const data = await readResponse(response);
    renderItems(data.items);
    setStatus("Items loaded.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function addItem(name) {
  setStatus("Adding item...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      method: "POST",
      headers: authHeaders({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({ name })
    });

    const data = await readResponse(response);

    setStatus(`Added item: ${data.item.name}`);
    await loadItems();
  } catch (error) {
    setStatus(error.message);
  }
}

async function login(username, password) {
  setStatus("Logging in...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await readResponse(response);

    accessToken = data.accessToken;
    currentUser = data.user;
    updateIdentity();
    setStatus(`Logged in as ${currentUser.username}. Token expires in ${data.expiresIn}.`);
  } catch (error) {
    setStatus(error.message);
  }
}

loadButton.addEventListener("click", loadItems);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await login(usernameInput.value.trim(), passwordInput.value);
  passwordInput.value = "";
});

logoutButton.addEventListener("click", () => {
  accessToken = undefined;
  currentUser = undefined;
  updateIdentity();
  setStatus("Logged out. The token was removed from this page's memory.");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = itemNameInput.value.trim();
  if (!name) {
    setStatus("Item name is required.");
    return;
  }

  itemNameInput.value = "";
  await addItem(name);
});
