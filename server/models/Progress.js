const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user', required: true },
  completedLessons: [{ type: String }],
  passedQuizzes: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', ProgressSchema);
