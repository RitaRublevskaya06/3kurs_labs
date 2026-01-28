const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  faculty: {
    type: String,
    required: [true, 'Код факультета обязателен'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Код факультета не может быть длиннее 10 символов']
  },
  faculty_name: {
    type: String,
    required: [true, 'Название факультета обязательно'],
    trim: true,
    maxlength: [100, 'Название факультета не может быть длиннее 100 символов']
  }
}, {
  timestamps: false,
  versionKey: false
});

// facultySchema.index({ faculty: 1 });

// const Faculty = mongoose.model('Faculty', facultySchema);
const Faculty = mongoose.model('Faculty', facultySchema, 'faculty');
module.exports = Faculty;