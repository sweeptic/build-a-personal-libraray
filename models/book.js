const mongoose = require('mongoose');
const Schema = mongoose.Schema;

booksSchema = new Schema(
  {
    title: { type: String, required: true },
    commentcount: { type: Number },
  },
  { versionKey: false }
);

module.exports = mongoose.model('books', booksSchema);
