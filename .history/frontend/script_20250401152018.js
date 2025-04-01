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
// 🔥 Load dashboard data with error handling (UPDATED VERSION)
async function loadDashboardData(token) {
  const activitiesTableBody = document.getElementById("activitiesTableBody");
  
  if (!activitiesTableBody) {
    console.error("Error: Couldn't find the activities table");
    return;
  }

  try {
    // Show loading state
    activitiesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">Loading activities...</td>
      </tr>
    `;

    // Fetch data from all endpoints in parallel
    const [wasteRes, donationsRes, collectionsRes] = await Promise.all([
      fetch("http://localhost:5000/api/waste-entries?limit=3", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch("http://localhost:5000/api/food-donations?limit=3", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch("http://localhost:5000/api/waste-collection?limit=3", {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    // Check all responses
    if (!wasteRes.ok || !donationsRes.ok || !collectionsRes.ok) {
      throw new Error("Failed to fetch some data");
    }

    // Parse responses
    const [wasteEntries, foodDonations, wasteCollections] = await Promise.all([
      wasteRes.json(),
      donationsRes.json(),
      collectionsRes.json()
    ]);

    // Clear table
    activitiesTableBody.innerHTML = "";

    // Process Waste Entries
    wasteEntries.forEach(entry => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>🗑️ Waste</td>
        <td>${entry.description}</td>
        <td>${entry.category}</td>
        <td>${entry.quantity} ${entry.category === 'Food' ? 'kg' : 'units'}</td>
        <td>${new Date(entry.created_at).toLocaleDateString()}</td>
      `;
      activitiesTableBody.appendChild(row);
    });

    // Process Food Donations
    foodDonations.forEach(donation => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>♻️ Donation</td>
        <td>${donation.description}</td>
        <td>Donor: ${donation.donor_name}</td>
        <td>${donation.quantity} items</td>
        <td>${new Date(donation.created_at).toLocaleDateString()}</td>
      `;
      activitiesTableBody.appendChild(row);
    });

    // Process Waste Collections
    wasteCollections.forEach(collection => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>🚛 Collection</td>
        <td>${collection.description}</td>
        <td>${collection.status}</td>
        <td>-</td>
        <td>${new Date(collection.pickup_date).toLocaleDateString()}</td>
      `;
      activitiesTableBody.appendChild(row);
    });

    // If no data found
    if (activitiesTableBody.children.length === 0) {
      activitiesTableBody.innerHTML = `
        <tr>
          <td colspan="5">No recent activities found</td>
        </tr>
      `;
    }

  } catch (error) {
    console.error("Error loading data:", error);
    activitiesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="error">Failed to load activities. Please try again.</td>
      </tr>
    `;
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
