const Note = require("../models/notemodel");
const asyncHandler = require("express-async-handler");

const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id });
  res.json(notes);
});
const createNote = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;
  console.log(req);

  if (!title || !content || !category) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  const note = new Note({
    user: req.user._id,
    title,
    content,
    category,
  });

  const createdNote = await note.save();
  res.status(201).json(createdNote);
});
const toggleNoteCompletion = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (note.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You can't perform this action");
  }

  note.completed = !note.completed; // ✅ Toggle the state
  const updatedNote = await note.save();

  res.json(updatedNote);
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({ message: "Note not found" });
  }
});


const updateNote = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  // Check if the logged-in user owns this note
  if (note.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You can't perform this action");
  }

  // Update note fields
  note.title = title || note.title;
  note.content = content || note.content;
  note.category = category || note.category;

  const updatedNote = await note.save(); // ✅ correct variable name
  res.json(updatedNote); // ✅ return the updated note
});

const DeleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }

  if (note.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You can't perform this action");
  }

  await note.deleteOne();

  res.json({ message: "Note removed successfully" });
});
const reorderNotes = asyncHandler(async (req, res) => {
  const { order } = req.body; // array of note IDs in the new order
  const userId = req.user._id;

  if (!order || !Array.isArray(order)) {
    res.status(400);
    throw new Error("Invalid order array");
  }

  // Update positions for each note
  const bulkOps = order.map((noteId, index) => ({
    updateOne: {
      filter: { _id: noteId, user: userId },
      update: { $set: { position: index } },
    },
  }));

  await Note.bulkWrite(bulkOps);
  res.json({ message: "Notes reordered successfully" });
});






module.exports = { getNotes, createNote, getNoteById,updateNote,DeleteNote,toggleNoteCompletion,reorderNotes };
