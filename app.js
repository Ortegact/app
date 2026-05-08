// Importar Firebase (versión modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ TU CONFIGURACIÓN REAL DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBifN1AXU6rBEOwKv42c4kQgyOMwB-K6EA",
  authDomain: "proyectoprofe-fd5cf.firebaseapp.com",
  projectId: "proyectoprofe-fd5cf",
  storageBucket: "proyectoprofe-fd5cf.firebasestorage.app",
  messagingSenderId: "865075998559",
  appId: "1:865075998559:web:9a2709ce77217f2ff750ea",
  measurementId: "G-V96P90BR1T"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productsCollection = collection(db, "productos");

// Elementos del DOM
const form = document.getElementById("productForm");
const nameInput = document.getElementById("productName");
const priceInput = document.getElementById("productPrice");
const idInput = document.getElementById("productId");
const productsBody = document.getElementById("productsBody");
const searchInput = document.getElementById("searchInput");

let productos = [];

// Cargar productos desde Firebase
async function loadProducts() {
    const querySnapshot = await getDocs(productsCollection);
    productos = [];
    querySnapshot.forEach((doc) => {
        productos.push({ id: doc.id, ...doc.data() });
    });
    renderTable();
}

// Renderizar tabla con búsqueda
function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = productos.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        productsBody.innerHTML = '<tr><td colspan="3">No hay productos</td></tr>';
        return;
    }

    productsBody.innerHTML = filtered.map(p => `
        <tr>
            <td>${p.nombre}</td>
            <td>$${parseFloat(p.precio).toFixed(2)}</td>
            <td>
                <button class="edit" data-id="${p.id}">✏️ Editar</button>
                <button class="delete" data-id="${p.id}">🗑️ Eliminar</button>
            </td>
        </tr>
    `).join("");

    // Eventos para botones dinámicos
    document.querySelectorAll(".edit").forEach(btn => {
        btn.addEventListener("click", () => editProduct(btn.dataset.id));
    });
    document.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
    });
}

// Agregar o actualizar producto
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = nameInput.value.trim();
    const precio = parseFloat(priceInput.value);

    if (!nombre || isNaN(precio)) return alert("Datos inválidos");

    if (idInput.value === "") {
        // Agregar nuevo
        await addDoc(productsCollection, { nombre, precio });
    } else {
        // Actualizar existente
        const docRef = doc(db, "productos", idInput.value);
        await updateDoc(docRef, { nombre, precio });
        idInput.value = "";
    }

    form.reset();
    await loadProducts();
});

// Editar producto (cargar en formulario)
async function editProduct(id) {
    const product = productos.find(p => p.id === id);
    if (product) {
        nameInput.value = product.nombre;
        priceInput.value = product.precio;
        idInput.value = product.id;
    }
}

// Eliminar producto
async function deleteProduct(id) {
    if (confirm("¿Eliminar este producto?")) {
        const docRef = doc(db, "productos", id);
        await deleteDoc(docRef);
        await loadProducts();
    }
}

// Búsqueda en tiempo real
searchInput.addEventListener("input", renderTable);

// Inicializar
loadProducts();
