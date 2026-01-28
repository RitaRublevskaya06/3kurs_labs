const mongoose = require('mongoose');

const pulpitSchema = new mongoose.Schema({
  pulpit: {
    type: String,
    required: [true, 'Код кафедры обязателен'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Код кафедры не может быть длиннее 10 символов']
  },
  pulpit_name: {
    type: String,
    required: [true, 'Название кафедры обязательно'],
    trim: true,
    maxlength: [100, 'Название кафедры не может быть длиннее 100 символов']
  },
  faculty: {
    type: String,
    required: [true, 'Код факультета обязателен'],
    trim: true,
    uppercase: true,
    maxlength: [10, 'Код факультета не может быть длиннее 10 символов']
  }
}, {
  timestamps: false,
  versionKey: false
});

// pulpitSchema.index({ pulpit: 1 });
// pulpitSchema.index({ faculty: 1 });

// const Pulpit = mongoose.model('Pulpit', pulpitSchema);
const Pulpit = mongoose.model('Pulpit', pulpitSchema, 'pulpit');
module.exports = Pulpit;