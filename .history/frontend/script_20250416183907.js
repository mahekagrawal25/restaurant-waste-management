// 🌟 DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("username") || "User";
  const isDashboard = window.location.pathname.includes("restaurant_dashboard.html");
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
        <td colspan="5" class="loading">Loading activities...</td>
      </tr>
    `;

    // Fetch combined activities
    const response = await fetch("http://localhost:5000/api/auth/dashboard/activities", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const activities = await response.json();
    
    // Clear loading state
    activitiesTableBody.innerHTML = "";

    // Process and display activities
    if (activities.length === 0) {
      activitiesTableBody.innerHTML = `
        <tr>
          <td colspan="5">No recent activities found</td>
        </tr>
      `;
      return;
    }

    activities.forEach(activity => {
      const row = document.createElement("tr");
      
      // Common fields
      const date = new Date(activity.created_at).toLocaleDateString();
      
      // Type-specific rendering
      if (activity.type === 'waste') {
        row.innerHTML = `
          <td>🗑️ Waste</td>
          <td>${activity.description}</td>
          <td>${activity.category}</td>
          <td>${activity.quantity} ${activity.category === 'Food' ? 'kg' : 'units'}</td>
          <td>${date}</td>
        `;
      } 
      else if (activity.type === 'donation') {
        row.innerHTML = `
          <td>♻️ Donation</td>
          <td>${activity.description}</td>
          <td>Donor: ${activity.donor_name}</td>
          <td>${activity.quantity} items</td>
          <td>${date}</td>
        `;
      } 
      else if (activity.type === 'collection') {
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
      <tr>
        <td colspan="5" class="error">Failed to load activities. Please try again.</td>
      </tr>
    `;
  }
}
// 🌟 Login form submission
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
      // Save token and user details
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role); // ✅ Save role too

      message.textContent = "Login successful! Redirecting...";
      message.classList.remove("text-red-500");
      message.classList.add("text-green-500");

      // ✅ Role-based redirection
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
  const role = document.getElementById("role").value;  // ✅ GET role
  const message = document.getElementById("signupMessage");

  // ✅ Basic validation
  if (!username || !email || !password || !role) {
    message.textContent = "All fields are required.";
    message.classList.add("text-red-500");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }), // ✅ INCLUDE role
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





document.getElementById('wasteForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  // Get form data
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const quantity = document.getElementById('quantity').value;
  const image = document.getElementById('image').value || null;

  // Get the JWT token from localStorage (if logged in)
  const token = localStorage.getItem('token');

  if (!token) {
      alert('Please log in first');
      return;
  }

  // Create the data object
  const formData = { description, category, quantity, image };

  try {
      // Send the data to the backend using fetch
      const response = await fetch('http://localhost:5000/api/waste/add-waste', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`  // Send token in Authorization header
          },
          body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
          alert('Waste added successfully');
      } else {
          alert(`Error: ${data.message}`);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('There was an error submitting the waste');
  }
});
