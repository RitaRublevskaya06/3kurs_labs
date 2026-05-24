const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
    SUBJECT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    SUBJECT_NAME: {
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
    tableName: 'SUBJECT',
    timestamps: false
});

module.exports = Subject;