const sequelize = require('../config/database');
const Faculty = require('./faculty');
const Pulpit = require('./pulpit');
const Teacher = require('./teacher');
const Subject = require('./subject');
const AuditoriumType = require('./auditorium_type');
const Auditorium = require('./auditorium');

Faculty.hasMany(Pulpit, { 
    foreignKey: 'FACULTY', 
    as: 'pulpits',
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE' 
});

Pulpit.belongsTo(Faculty, { 
    foreignKey: 'FACULTY', 
    as: 'faculty' 
});

Pulpit.hasMany(Teacher, { 
    foreignKey: 'PULPIT', 
    as: 'teachers',
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE' 
});

Teacher.belongsTo(Pulpit, { 
    foreignKey: 'PULPIT', 
    as: 'pulpit' 
});

Pulpit.hasMany(Subject, { 
    foreignKey: 'PULPIT', 
    as: 'subjects',
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE' 
});

Subject.belongsTo(Pulpit, { 
    foreignKey: 'PULPIT', 
    as: 'pulpit' 
});

AuditoriumType.hasMany(Auditorium, { 
    foreignKey: 'AUDITORIUM_TYPE', 
    as: 'auditoriums',
    onDelete: 'CASCADE', 
    onUpdate: 'CASCADE' 
});

Auditorium.belongsTo(AuditoriumType, { 
    foreignKey: 'AUDITORIUM_TYPE', 
    as: 'auditoriumType' 
});

module.exports = {
    sequelize,
    Faculty,
    Pulpit,
    Teacher,
    Subject,
    AuditoriumType,
    Auditorium
};