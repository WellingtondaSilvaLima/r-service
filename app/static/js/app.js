const DB_NAME = "crudApp";
const DB_VERSION = 1;
const STORE_NAME = "items";
let db;

openDB().then(() => {
  console.log("DB pronto");
  preencherTabela(); // Mostra dados ao carregar a página
});

function saveData() {
  const val = document.getElementById("dataInput").value;
  if (!val.trim()) return alert("Digite algo antes de salvar.");
  addItem({ nome: val }).then(() => {
    alert("Salvo localmente!");
    document.getElementById("dataInput").value = "";
    preencherTabela(); // Atualiza a tabela
  });
}

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
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

async function preencherTabela() {
  const items = await getAllItems();
  const tbody = document.getElementById("preencher");
  tbody.innerHTML = ""; // Limpa antes de preencher

  items.forEach(item => {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = item.content || item.nome || "Sem conteúdo";
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

async function importarDoMongo() {
  const jsonText = document.getElementById("dados-json").textContent;
  const dadosMongo = JSON.parse(jsonText);

  for (const item of dadosMongo) {
    const jaExiste = await itemExiste(item.nome); // adapte se for outro campo
    if (!jaExiste) {
      await addItem(item);
    }
  }
}

async function itemExiste(nome) {
  const todos = await getAllItems();
  return todos.some(el => el.nome === nome); // ou outro campo único
}


document.addEventListener("DOMContentLoaded", async () => {
  await openDB();         // Garante que o DB está pronto
  await importarDoMongo(); // Puxa dados do Flask e insere se ainda não existirem
  await preencherTabela(); // Exibe na tabela
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/static/js/sw.js')
    .then(reg => console.log('✅ Service Worker registrado:', reg.scope))
    .catch(err => console.error('❌ Erro ao registrar Service Worker:', err));
}