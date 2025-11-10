const mongoose = require("mongoose");

const noteSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // ✅ Make sure 'User' matches your user model name
    },
    completed: {
      type: Boolean,
      default: false, // ✅ this stores checkbox state (true = checked)
    },
        position: {
      type: Number,
      default: 0, // 👈 new field for ordering
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
