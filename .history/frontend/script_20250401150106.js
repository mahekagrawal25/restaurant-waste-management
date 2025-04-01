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
  const activitiesTableBody = document.getElementById("activitiesTableBody");
  
  if (!activitiesTableBody) {
    console.error("Error: Couldn't find the activities table");
    return;
  }

  try {
    // Show loading state
    activitiesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Loading activities...
        </td>
      </tr>
    `;

    // Fetch data from all endpoints
    const [wasteEntries, donations, collections] = await Promise.all([
      fetchData('http://localhost:5000/api/waste-entries', token),
      fetchData('http://localhost:5000/api/food-donations', token),
      fetchData('http://localhost:5000/api/waste-collection', token)
    ]);

    // Clear and display data
    activitiesTableBody.innerHTML = '';
    
    // Combine all activities with type identifiers
    const allActivities = [
      ...wasteEntries.map(item => ({ ...item, type: 'waste' })),
      ...donations.map(item => ({ ...item, type: 'donation' })),
      ...collections.map(item => ({ ...item, type: 'collection' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Display each activity
    allActivities.forEach(activity => {
      const row = document.createElement("tr");
      
      if (activity.type === 'waste') {
        row.innerHTML = `
          <td>🗑️ Waste</td>
          <td>${activity.description}</td>
          <td>${activity.category}</td>
          <td>${activity.quantity} ${activity.category === 'Food' ? 'kg' : 'units'}</td>
          <td>${formatDate(activity.created_at)}</td>
        `;
      } 
      else if (activity.type === 'donation') {
        row.innerHTML = `
          <td>♻️ Donation</td>
          <td>${activity.description}</td>
          <td>Donor: ${activity.donor_name}</td>
          <td>${activity.quantity} items</td>
          <td>${formatDate(activity.created_at)}</td>
        `;
      }
      else if (activity.type === 'collection') {
        row.innerHTML = `
          <td>🚛 Collection</td>
          <td>${activity.description}</td>
          <td>${activity.status}</td>
          <td>${activity.collector_name || '-'}</td>
          <td>${formatDate(activity.pickup_date)}</td>
        `;
      }

      activitiesTableBody.appendChild(row);
    });

    if (allActivities.length === 0) {
      activitiesTableBody.innerHTML = `
        <tr>
          <td colspan="5">No activities found</td>
        </tr>
      `;
    }

  } catch (error) {
    console.error("Error loading data:", error);
    activitiesTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="error">
          <i class="fas fa-exclamation-circle"></i> Failed to load activities
        </td>
      </tr>
    `;
  }
}

// Helper function to fetch data
async function fetchData(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
  return await response.json();
}

// Helper function to format dates
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
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
