// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");
const { notFound, errorHandler } = require("./middlewares/errorhandlemiddlewares");

dotenv.config();
connectDB();

const app = express();

/* ----------------------------- CORS CONFIG ----------------------------- */
// ✅ Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-zeta-black-88.vercel.app/",
  "https://new-project-gold-pi.vercel.app", // ✅ added your frontend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Set headers manually to handle Vercel proxy behavior
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors(corsOptions));

/* ----------------------------- SESSION CONFIG ----------------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

/* ----------------------------- PARSERS ----------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ----------------------------- PASSPORT CONFIG (Optional) ----------------------------- */
try {
  const passport = require("./config/facebookAuth");
  app.use(passport.initialize());
  app.use(passport.session());
  console.log("✅ Passport initialized");
} catch (err) {
  console.log("⚠️ Passport not configured, continuing...");
}

/* ----------------------------- ROUTES ----------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully...");
});

app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

/* ----------------------------- ERROR HANDLERS ----------------------------- */
app.use(notFound);
app.use(errorHandler);

/* ----------------------------- SERVER START ----------------------------- */
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
} else {
  module.exports = app;
}
