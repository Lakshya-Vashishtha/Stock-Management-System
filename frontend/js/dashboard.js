// Path: /js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized. Redirecting to login.");
    window.location.href = "login.html";
    return;
  }

  fetchDashboardStats(token);
  fetchTopProducts(token);
});

function fetchDashboardStats(token) {
  fetch("http://localhost:8080/api/dashboard/stats", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("totalProducts").innerText = data.totalProducts || 0;
      document.getElementById("totalSales").innerText = data.totalSales || 0;
      document.getElementById("totalBrands").innerText = data.totalBrands || 0;
      document.getElementById("totalCategories").innerText = data.totalCategories || 0;
    })
    .catch(err => console.error("Error fetching stats:", err));
}

function fetchTopProducts(token) {
  fetch("http://localhost:8080/api/dashboard/top-products", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("topProductsBody");
      tbody.innerHTML = "";
      if (data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3'>No data available</td></tr>";
        return;
      }
      data.forEach((prod, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${prod[0]}</td>
            <td>${prod[1]}</td>
          </tr>`;
        tbody.innerHTML += row;
      });
    })
    .catch(err => console.error("Error fetching top products:", err));
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
