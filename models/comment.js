const mongoose = require('mongoose');
const Schema = mongoose.Schema;

commentSchema = new Schema({
  comment: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, ref: 'Book' },
});

module.exports = mongoose.model('Comment', commentSchema);
