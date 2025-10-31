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
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-six-orpin-57.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Apply CORS globally (must be first!)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "null");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors(corsOptions));

/* ----------------------------- SESSION CONFIG ----------------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "long-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

/* ----------------------------- PARSERS ----------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ----------------------------- PASSPORT (OPTIONAL) ----------------------------- */
try {
  const passport = require("./config/facebookAuth");
  app.use(passport.initialize());
  app.use(passport.session());
  console.log("✅ Passport initialized");
} catch (err) {
  console.log("⚠️ Passport not configured, continuing...");
}

/* ----------------------------- ROUTES ----------------------------- */
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
  res.send("🚀 API is running successfully...");
});

/* ----------------------------- ERRORS ----------------------------- */
app.use(notFound);
app.use(errorHandler);

/* ----------------------------- SERVER / EXPORT ----------------------------- */
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
} else {
  module.exports = app;
}
