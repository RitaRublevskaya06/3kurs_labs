const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
    TEACHER: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    TEACHER_NAME: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    PULPIT: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'PULPIT',
            key: 'PULPIT'
        }
    }
}, {
    tableName: 'TEACHER',
    timestamps: false
});

module.exports = Teacher;