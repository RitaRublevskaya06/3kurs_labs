const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auditorium = sequelize.define('Auditorium', {
    AUDITORIUM: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    AUDITORIUM_NAME: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    AUDITORIUM_CAPACITY: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    AUDITORIUM_TYPE: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'AUDITORIUM_TYPE',
            key: 'AUDITORIUM_TYPE'
        }
    }
}, {
    tableName: 'AUDITORIUM',
    timestamps: false
});

module.exports = Auditorium;