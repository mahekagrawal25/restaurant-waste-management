# ♻️ Restaurant Waste Management System 

## 🧠 Project Overview

The **Restaurant Waste Management System** is a web-based platform designed to help restaurants efficiently manage food waste, streamline food donations, and coordinate waste collection with NGOs and waste collectors. 

Built using **Node.js (Express.js)** for the backend and **MySQL** for data management, the platform provides role-specific dashboards and automates tasks like deleting uncollected food donations after 24 hours — ensuring food safety and sustainability.

---

## 👥 User Roles & Features

### 🍽️ Restaurant
- Add and manage food waste entries  
- Donate surplus food  
- Request waste pickup  
- View reports on waste and donations  

### 🏥 NGO
- View and accept available food donations  
- Track donation collection history  

### 🚛 Waste Collector
- View pending waste collection requests  
- Update collection status  
- View pickup history

---

## 📦 Key Features

| Feature | Description |
|--------|-------------|
| **Waste Entry Tracking** | Log waste type, quantity, description, and optional image |
| **Food Donation Module** | Donate food with auto-deletion of expired items |
| **Automated Cleanup** | MySQL event to delete pending food donations after 24 hours |
| **Request Collection** | Request and track waste pickups |
| **Insight Reports** | Graphical stats on waste/donation trends |
| **Role-Based Access** | Dashboards and actions based on user type |

---

## 🛠️ Technologies Used

### Backend
- [Node.js](https://nodejs.org/) (with Express.js)

### Database
- [MySQL](https://www.mysql.com/)

### Frontend
- HTML  
- CSS  
- JavaScript (for form validation)

---

## 🧱 Database Schema Overview

### Tables:
- `users`: Stores all users with role identifiers (`restaurant`, `ngo`, `waste_collector`)
- `waste_entries`: Tracks restaurant waste entries
- `food_donations`: Handles surplus food donations
- `waste_collection`: Manages pickup requests

> All tables are normalized to **3NF (Third Normal Form)**.

---

## 🔒 Business Logic & Validations

- Secure login system with hashed passwords  
- Session-based authentication per user role  
- Form validation (frontend and backend)  
- Scheduled **MySQL Event** to auto-delete food donations after 24 hours  
- Real-time status updates on requests

---

## 📊 Reports & Analytics

The system offers visual insights on:
- Total waste generated
- Quantity of food donated
- Trends over time to improve sustainability
- Collection status breakdown

---

## 🎯 Final Goal

To reduce food waste and improve sustainability in the restaurant industry by:
- Encouraging responsible food donation  
- Enabling timely waste collection  
- Supporting NGOs in distributing food  
- Empowering data-driven decision making

---

## 📚 References

- [Hospitality Insights – Food Waste in Restaurants](https://hospitalityinsights.ehl.edu/food-waste-in-restaurants)  
- [ResearchGate – Food Waste Management Practices in Restaurants](https://www.researchgate.net/publication/384083283_Food_waste_management_practices_in_restaurants_how_to_prevent_and_reduce_food_waste)  
- [ECEPL – Food Waste Management](https://www.ecepl.com/food-waste-management)  
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

