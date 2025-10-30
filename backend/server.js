const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { notFound, errorHandler } = require("./middlewares/errorhandlemiddlewares");
const session = require('express-session');

// Load environment variables first
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Session middleware - must come before passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key-here-make-it-long',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Body parser middleware - must come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport (only if you have passport configured)
try {
  const passport = require('./config/facebookAuth');
  app.use(passport.initialize());
  app.use(passport.session());
  console.log('Passport initialized successfully');
} catch (error) {
  console.log('Passport configuration not found, continuing without it');
}

// Routes
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware (should be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});