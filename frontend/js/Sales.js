const SALES_API_BASE = "http://localhost:8080/api/sales";
const token = localStorage.getItem("token");

if (!token) {
  alert("Session expired. Please log in.");
  window.location.href = "../index.html";
}

document.getElementById("recordSaleBtn")?.addEventListener("click", () => {
  const form = document.getElementById("salesForm");
  const sale = {
    productName: form.productName.value,
    quantity: parseInt(form.quantity.value),
    price: parseFloat(form.price.value),
    date: form.date.value
  };

  fetch(`${SALES_API_BASE}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(sale)
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to record sale");
      return res.json();
    })
    .then(() => {
      alert("Sale recorded successfully!");
      form.reset();
    })
    .catch(err => alert("Error: " + err.message));
});

function fetchSales() {
  fetch(`${SALES_API_BASE}/all`, {
    headers: { Authorization: "Bearer " + token }
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#salesTable tbody");
      tbody.innerHTML = "";
      data.forEach(sale => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${sale.productName}</td>
          <td>${sale.quantity}</td>
          <td>₹${sale.price}</td>
          <td>${sale.date}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => console.error("Failed to fetch sales:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("salesTable")) {
    fetchSales();
  }
});
