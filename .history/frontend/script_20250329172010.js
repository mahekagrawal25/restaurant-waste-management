// 🌟 DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("username") || "User";
  const isDashboard = window.location.pathname.includes("dashboard.html");
  const isLogin = window.location.pathname.includes("index.html");

  // ✅ Display username dynamically
  const userNameElement = document.getElementById("userName");
  if (userNameElement) userNameElement.textContent = userName;

  // ✅ Redirect logic based on token
  handleRedirection(token, isDashboard, isLogin);

  // ✅ Load dashboard data if logged in
  if (isDashboard && token) {
    loadDashboardData(token);
  }
});

// 🚀 Reusable redirection handler
function handleRedirection(token, isDashboard, isLogin) {
  if (!token && isDashboard) {
    console.log("No token, redirecting to login...");
    window.location.href = "index.html";
  } else if (token && isLogin) {
    console.log("User already logged in, redirecting to dashboard...");
    window.location.href = "dashboard.html";
  }
}

// 🔥 Load dashboard data with error handling
async function loadDashboardData(token) {
  const activitiesContainer = document.getElementById("recentActivities");
  const wasteCountElement = document.getElementById("wasteCount");
  const donationCountElement = document.getElementById("donationCount");
  const pickupCountElement = document.getElementById("pickupCount");

  try {
    const response = await fetch("http://localhost:5000/api/dashboard", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log("Token expired or invalid. Redirecting to login...");
        logoutUser();
      }
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const stats = await response.json();

    // ✅ Update the dashboard with fetched data
    wasteCountElement.textContent = stats.totalWaste || 0;
    donationCountElement.textContent = stats.totalDonations || 0;
    pickupCountElement.textContent = stats.totalCollections || 0;

    activitiesContainer.innerHTML = `
      <p>Waste entries: ${stats.totalWaste}</p>
      <p>Donations: ${stats.totalDonations}</p>
      <p>Pickups: ${stats.totalCollections}</p>
    `;

  } catch (error) {
    console.error("Error loading data:", error);
    activitiesContainer.innerHTML = `<p class="error-msg">Failed to load data. Please try again later.</p>`;
  }
}

// 🌟 Login form submission
document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      message.textContent = "Login successful! Redirecting...";
      message.classList.remove("text-red-500");
      message.classList.add("text-green-500");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      message.textContent = data.message || "Invalid credentials.";
      message.classList.add("text-red-500");
    }
  } catch (error) {
    console.error("Server error:", error);
    message.textContent = "Server error. Please try again later.";
    message.classList.add("text-red-500");
  }
});

// 🚀 Logout handler
document.getElementById("logoutBtn")?.addEventListener("click", logoutUser);

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}
