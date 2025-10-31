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
app.use(cors({
  origin: ['http://localhost:3000', 'https://frontend-six-orpin-57.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-session-secret-key-here-make-it-long",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
  const passport = require("./config/facebookAuth");
  app.use(passport.initialize());
  app.use(passport.session());
  console.log("✅ Passport initialized successfully");
} catch {
  console.log("⚠️ Passport configuration not found, continuing without it");
}

app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
