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
  const endpoints = [
    "/api/dashboard/activities",  // Try new endpoint first
    "/api/dashboard"             // Fallback to old endpoint
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        renderActivities(data);  // Your rendering function
        return;  // Exit if successful
      }
    } catch (e) { /* Continue to next endpoint */ }
  }
  
  showError("Failed to load activities");
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

// ✅ Signup form submission
document.getElementById("signupForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("signupMessage");

  // ✅ Basic validation
  if (!username || !email || !password) {
    message.textContent = "All fields are required.";
    message.classList.add("text-red-500");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      message.textContent = "Signup successful! Redirecting to login...";
      message.classList.remove("text-red-500");
      message.classList.add("text-green-500");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      message.textContent = data.message || "Signup failed. Please try again.";
      message.classList.add("text-red-500");
    }
  } catch (error) {
    console.error("Server error:", error);
    message.textContent = "Server error. Please try again later.";
    message.classList.add("text-red-500");
  }
});
