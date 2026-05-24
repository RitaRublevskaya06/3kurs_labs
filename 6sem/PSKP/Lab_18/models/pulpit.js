const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pulpit = sequelize.define('Pulpit', {
    PULPIT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    PULPIT_NAME: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    FACULTY: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'FACULTY',
            key: 'FACULTY'
        }
    }
}, {
    tableName: 'PULPIT',
    timestamps: false
});

module.exports = Pulpit;