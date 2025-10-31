const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");
const {
  notFound,
  errorHandler,
} = require("./middlewares/errorhandlemiddlewares");
const session = require("express-session");

dotenv.config();
connectDB();

const app = express();

/* ----------------------------- CORS Configuration ----------------------------- */
// Define allowed origins for production + local
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-six-orpin-57.vercel.app",
];

// Create a dynamic CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ✅ Explicitly handle preflight requests (important for Vercel)
app.options("*", cors(corsOptions));

/* ----------------------------- Session Configuration ----------------------------- */
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-session-secret-key-here-make-it-long",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true only in HTTPS
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

/* ----------------------------- Middleware Setup ----------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ----------------------------- Passport (Optional) ----------------------------- */
try {
  const passport = require("./config/facebookAuth");
  app.use(passport.initialize());
  app.use(passport.session());
  console.log("✅ Passport initialized successfully");
} catch (err) {
  console.log("⚠️ Passport configuration not found, continuing without it");
}

/* ----------------------------- API Routes ----------------------------- */
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

/* ----------------------------- Root Route ----------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully...");
});

/* ----------------------------- Error Handling ----------------------------- */
app.use(notFound);
app.use(errorHandler);

/* ----------------------------- Export / Start Server ----------------------------- */
// When running locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
} else {
  // For Vercel serverless function
  module.exports = app;
}
