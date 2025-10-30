const express = require("express");
const dotenv = require("dotenv");
const notes = require("./data/notes");
const connectDB = require("./config/db");
const userRoutes=require('./routes/userRoutes');
const noteRoutes=require('./routes/noteRoutes');
const { notFound, errorHandler } = require("./middlewares/errorhandlemiddlewares");



dotenv.config();
connectDB();

const app = express();
app.use(express.json())


// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// app.get("/api/notes", (req, res) => {
//   res.json(notes);
// });

// app.get("/api/notes/:id", (req, res) => {
//   const note = notes.find((n) => n._id === req.params.id);
//   res.send(note);
// });

 app.use("/api/users",userRoutes)
 app.use("/api/notes",noteRoutes)
 app.use(notFound)
 app.use(errorHandler)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
