const mongoose = require('mongoose');
const Schema = mongoose.Schema;

booksSchema = new Schema(
  {
    title: { type: String, required: true },
    commentcount: { type: Number },
    comments: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Comment' }],
  },
  { versionKey: false }
);

module.exports = mongoose.model('Book', booksSchema);
