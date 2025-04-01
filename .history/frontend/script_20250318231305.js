document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("username") || "User";

  // ✅ Display username across pages
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = userName;
  }

  // ✅ Redirect logic
  const isDashboard = window.location.pathname.includes("dashboard.html");
  const isLogin = window.location.pathname.includes("index.html");

  if (!token && isDashboard) {
    console.log("No token found, redirecting to login...");
    window.location.href = "index.html";
  } else if (token && isLogin) {
    console.log("User already logged in, redirecting to dashboard...");
    window.location.href = "dashboard.html";
  }

  // ✅ Load recent activities and stats
  if (isDashboard && token) {
    try {
      const statsResponse = await fetch("http://localhost:5000/api/dashboard", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch dashboard data: ${statsResponse.status}`);
      }

      const stats = await statsResponse.json();

      document.getElementById("wasteCount").textContent = stats.totalWaste || 0;
      document.getElementById("donationCount").textContent = stats.totalDonations || 0;
      document.getElementById("pickupCount").textContent = stats.totalCollections || 0;

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }
});

// ✅ Login form submission
document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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

// ✅ Logout functionality
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
});
