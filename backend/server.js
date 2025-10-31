const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");
const session = require("express-session");
const { notFound, errorHandler } = require("./middlewares/errorhandlemiddlewares");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ----------------------
// ✅ CORS Configuration
// ----------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000", // local dev
      "https://frontend-six-orpin-57.vercel.app", // vercel frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ----------------------
// ✅ Session Middleware
// ----------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-session-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // only secure cookies in prod
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// ----------------------
// ✅ JSON Body Parsing
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------
// ✅ Passport Setup (Optional Facebook Login)
// ----------------------
try {
  const passport = require("./config/facebookAuth");
  app.use(passport.initialize());
  app.use(passport.session());
  console.log("✅ Passport initialized successfully");
} catch (err) {
  console.log("⚠️ Passport configuration not found, continuing without it");
}

// ----------------------
// ✅ Routes
// ----------------------
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
  res.send("✅ API is running successfully...");
});

// ----------------------
// ✅ Error Handlers
// ----------------------
app.use(notFound);
app.use(errorHandler);

// ----------------------
// ✅ Export for Vercel
// ----------------------
module.exports = app;

// ----------------------
// ✅ Local Development Server
// ----------------------
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  );
}
