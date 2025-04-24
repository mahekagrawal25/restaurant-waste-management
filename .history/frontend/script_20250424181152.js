// 🌟 DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("username") || "User";
  const isDashboard = window.location.pathname.includes("dashboard.html");
  const isLogin = window.location.pathname.includes("index.html");
  const userId = localStorage.getItem("id");

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
    window.location.href = "restaurant_dashboard.html";
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
    activitiesTableBody.innerHTML = `
      <tr><td colspan="5" class="loading">Loading activities...</td></tr>
    `;

    const response = await fetch("http://localhost:5000/api/auth/dashboard/activities", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const activities = await response.json();
    activitiesTableBody.innerHTML = "";

    if (activities.length === 0) {
      activitiesTableBody.innerHTML = `<tr><td colspan="5">No recent activities found</td></tr>`;
      return;
    }

    activities.forEach(activity => {
      const row = document.createElement("tr");
      const date = new Date(activity.created_at).toLocaleDateString();

      if (activity.type === 'waste') {
        row.innerHTML = `
          <td>🗑️ Waste</td>
          <td>${activity.description}</td>
          <td>${activity.category}</td>
          <td>${activity.quantity} ${activity.category === 'Food' ? 'kg' : 'units'}</td>
          <td>${date}</td>
        `;
      } else if (activity.type === 'donation') {
        row.innerHTML = `
          <td>♻️ Donation</td>
          <td>${activity.description}</td>
          <td>Donor: ${activity.donor_name}</td>
          <td>${activity.quantity} items</td>
          <td>${date}</td>
        `;
      } else if (activity.type === 'collection') {
        row.innerHTML = `
          <td>🚛 Collection</td>
          <td>${activity.description}</td>
          <td>${activity.status}</td>
          <td>-</td>
          <td>${new Date(activity.pickup_date).toLocaleDateString()}</td>
        `;
      }

      activitiesTableBody.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading activities:", error);
    activitiesTableBody.innerHTML = `
      <tr><td colspan="5" class="error">Failed to load activities. Please try again.</td></tr>
    `;
  }
}

// 🌟 Login form submission
document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
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
      localStorage.setItem("role", data.role);
      localStorage.setItem("id", data.id);

      message.textContent = "Login successful! Redirecting...";
      message.classList.remove("text-red-500");
      message.classList.add("text-green-500");

      setTimeout(() => {
        switch (data.role) {
          case "admin":
            window.location.href = "admin_dashboard.html";
            break;
          case "restaurant":
            window.location.href = "restaurant_dashboard.html";
            break;
          case "waste_collector":
            window.location.href = "collector_dashboard.html";
            break;
          case "ngo":
            window.location.href = "ngo_dashboard.html";
            break;
          default:
            alert("Unknown role. Contact support.");
        }
      }, 1500);
    } else {
      message.textContent = data.message || "Invalid credentials.";
      message.classList.remove("text-green-500");
      message.classList.add("text-red-500");
    }
  } catch (error) {
    console.error("Server error:", error);
    message.textContent = "Server error. Please try again later.";
    message.classList.remove("text-green-500");
    message.classList.add("text-red-500");
  }
});

// 🚀 Logout handler
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// ✅ Signup form submission
document.getElementById("signupForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const message = document.getElementById("signupMessage");

  if (!username || !email || !password || !role) {
    message.textContent = "All fields are required.";
    message.classList.add("text-red-500");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role })
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

// ✅ Waste form submission
document.getElementById('wasteForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value.trim();
  const quantity = document.getElementById('quantity').value.trim();
  const image = document.getElementById('image').value.trim() || null;
  const user_id = localStorage.getItem('id');
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please log in first.');
    return;
  }

  const formData = { description, category, quantity, image, user_id };

  try {
    const response = await fetch('http://localhost:5000/api/waste/addWaste', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ Waste added successfully!');
      document.getElementById('wasteForm').reset();
    } else {
      alert(`❌ Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error submitting waste:', error);
    alert('There was an error submitting the waste.');
  }
});



// ✅ Handle Request Collection Form Submission
document.getElementById("requestCollectionForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const statusMsg = document.getElementById("statusMsg");

  const waste_entry_id = document.getElementById("waste_entry_id").value;
  const description = document.getElementById("description").value.trim();

  try {
    const res = await fetch("http://localhost:5000/api/request-collection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ waste_entry_id, description }),
    });

    const data = await res.json();

    if (res.ok) {
      statusMsg.textContent = data.message;
      statusMsg.className = "status-msg success";
      document.getElementById("requestCollectionForm").reset();
    } else {
      statusMsg.textContent = data.message;
      statusMsg.className = "status-msg error";
    }
  } catch (err) {
    console.error("Error submitting request:", err);
    statusMsg.textContent = "Something went wrong.";
    statusMsg.className = "status-msg error";
  }
});

// ✅ Populate dropdown with user's waste entries
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const dropdown = document.getElementById("waste_entry_id");

  if (!dropdown) return;

  try {
    const res = await fetch("http://localhost:5000/api/waste-entries", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      data.forEach((entry) => {
        const option = document.createElement("option");
        option.value = entry.id;
        option.textContent = `${entry.id} - ${entry.description}`;
        dropdown.appendChild(option);
      });
    }
  } catch (err) {
    console.error("Error loading waste entries:", err);
  }
});






// ✅ Handle Donate Food Form Submission
document.getElementById("foodDonationForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const statusMsg = document.getElementById("statusMsg");

  const description = document.getElementById("description").value.trim();
  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const donor_name = document.getElementById("donor_name").value.trim();
  const contact = document.getElementById("contact").value.trim();

  try {
    const res = await fetch("http://localhost:5000/api/food-donations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        description,
        quantity,
        donor_name,
        contact,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      statusMsg.textContent = data.message || "Donation submitted successfully!";
      statusMsg.className = "status-msg success";
      document.getElementById("foodDonationForm").reset();
    } else {
      statusMsg.textContent = data.message || "Failed to submit donation.";
      statusMsg.className = "status-msg error";
    }
  } catch (err) {
    console.error("Error submitting donation:", err);
    statusMsg.textContent = "Something went wrong.";
    statusMsg.className = "status-msg error";
  }
});










document.addEventListener("DOMContentLoaded", () => {
  const pickupContainer = document.getElementById("pickupTable").getElementsByTagName('tbody')[0];

  // Fetch pending pickup requests
  async function loadPickupRequests() {
    try {
      const res = await fetch("http://localhost:5000/api/waste-collection/pending", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!res.ok) throw new Error("Failed to fetch pickup requests");
  
      const pickups = await res.json();
      pickupContainer.innerHTML = ""; // Clear the current table rows
  
      if (pickups.length === 0) {
        pickupContainer.innerHTML = `<tr><td colspan="6" class="status-msg">No pending pickup requests.</td></tr>`;
        return;
      }
  
      pickups.forEach((pickup, index) => {
        const row = document.createElement("tr");
  
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${pickup.description}</td>
          <td>${pickup.category}</td>
          <td>${pickup.quantity}</td>
          <td>${new Date(pickup.created_at).toLocaleString()}</td>
          <td>
            <button class="btn-collect" data-id="${pickup.id}">
              Mark as Collected
            </button>
          </td>
        `;
  
        pickupContainer.appendChild(row);
      });
    } catch (err) {
      console.error("Error loading pickup requests:", err);
      pickupContainer.innerHTML = `<tr><td colspan="6" class="status-msg error">Unable to load pickup requests.</td></tr>`;
    }
  }
  

  // Mark as Collected
 // Mark as Collected
pickupContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-collect")) {
    const id = e.target.dataset.id;

    try {
      const res = await fetch(`http://localhost:5000/api/waste-collection/mark-collected/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to update status");
        return;
      }

      const data = await res.json();
      alert(data.message || "Marked as collected!");
      loadPickupRequests(); // Refresh list
    } catch (err) {
      console.error("Error marking as collected:", err);
      alert("Server error occurred");
    }
  }
});

  loadPickupRequests();
});
