const PRODUCT_API_BASE = "http://localhost:8080/api/products";
const token = localStorage.getItem("token");

if (!token) {
  alert("Session expired. Please log in again.");
  window.location.href = "../index.html";
}

function fetchProducts() {
  fetch(`${PRODUCT_API_BASE}/all`, {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => res.json())
    .then(products => {
      const tbody = document.querySelector("#productsTable tbody");
      tbody.innerHTML = "";
      products.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.brand}</td>
          <td>${product.category}</td>
          <td>${product.stock}</td>
          <td>₹${product.price}</td>
          <td>${product.expiryDate}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" onclick="editProduct(${product.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => console.error("Failed to load products:", error));
}

document.getElementById("saveProduct")?.addEventListener("click", () => {
  const form = document.getElementById("addProductForm");
  const product = {
    name: form.productName.value,
    brand: form.brand.value,
    category: form.category.value,
    stock: parseInt(form.stock.value),
    price: parseFloat(form.price.value),
    expiryDate: form.expiryDate.value
  };

  fetch(`${PRODUCT_API_BASE}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(product)
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to add product");
      return res.json();
    })
    .then(() => {
      alert("Product added!");
      document.getElementById("addProductModal").querySelector(".btn-close").click();
      fetchProducts();
    })
    .catch(err => alert("Failed to add product: " + err.message));
});

function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  fetch(`${PRODUCT_API_BASE}/delete/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => {
      if (!res.ok) throw new Error("Delete failed");
      fetchProducts();
    })
    .catch(err => alert("Error deleting product: " + err.message));
}

function editProduct(id) {
  window.location.href = `edit-product.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", fetchProducts);
