const DB_NAME = "crudApp";
const DB_VERSION = 1;
const STORE_NAME = "items";
let db;

// IndexedDB setup
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Erro ao abrir IndexedDB");
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

async function addItem(data) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.add(data);
}

async function getAllItems() {
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

async function preencherTabela() {
  const items = await getAllItems();
  const tbody = document.getElementById("preencher");
  tbody.innerHTML = ""; // Limpa antes de preencher

  items.forEach(item => {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = item.content; // Assume que "content" é o texto
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
}

// MongoDB sync
async function syncWithMongoDB() {
  const items = await getAllItems(); // espera os dados
  fetch('/recebe-sincronizacao', {
    method: "POST",
    headers: {
      "Content-Type": "application/json" // muito importante!
    },
    body: JSON.stringify(items)
  })
  .then(response => {
    if (!response.ok) throw new Error("Erro ao sincronizar");
    return response.text();
  })
  .then(msg => alert("Sincronizado com sucesso: " + msg))
  .catch(err => console.error(err));
}
