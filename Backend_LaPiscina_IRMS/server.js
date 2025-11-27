const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", // Ito ang Frontend mo sa Laptop
    "https://irms-testing.vercel.app" // Dito mo ilalagay ang Live link sa future
  ],
  credentials: true, // Importante ito dahil naka-true din sa axios.js
  methods: ["GET", "POST", "PUT", "DELETE"], // Payagan lahat ng methods
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Serve Static Images
app.use('/uploads/am_images', express.static(path.join(__dirname, 'uploads', 'am_images')));

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/auth');

// Owner Routes
const ownerSalesRoutes = require('./routes/owner/ownerSales');
const ownerFeedbackRoutes = require('./routes/owner/ownerFeedback');
const ownerAmenitiesRoutes = require('./routes/owner/ownerAmenities');
// ETO YUNG BAGO:
const ownerDashboardRoutes = require('./routes/owner/ownerDashboard'); 

// Client Routes
const clientAmenitiesRoutes = require('./routes/customer/amenities');

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);

// Owner Endpoints
app.use('/api/owner/sales', ownerSalesRoutes);         
app.use('/api/owner/feedback', ownerFeedbackRoutes);   
app.use('/api/owner/amenities', ownerAmenitiesRoutes); 
// MOUNT THE DASHBOARD ROUTE HERE:
app.use('/api/owner/dashboard', ownerDashboardRoutes); 

// Client Endpoints
app.use('/api/amenities', clientAmenitiesRoutes);

// Basic server check
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});