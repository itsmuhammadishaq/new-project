const { Router } = require("express");
const { getNotes, createNote, getNoteById, updateNote, deleteNote, DeleteNote, toggleNoteCompletion } = require("../controllers/noteControllers");
const { protect } = require("../middlewares/authMidlewares");

const router = Router();
router.route('/').get(protect,getNotes)

router.route('/create').post(protect,createNote)
router.route('/:id').get(getNoteById).put(protect,updateNote).delete(protect,DeleteNote);
router.put("/:id/toggle", protect, toggleNoteCompletion);

module.exports = router;