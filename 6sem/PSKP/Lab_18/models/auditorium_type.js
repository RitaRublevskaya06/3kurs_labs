const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditoriumType = sequelize.define('AuditoriumType', {
    AUDITORIUM_TYPE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    AUDITORIUM_TYPENAME: {
        type: DataTypes.STRING(30),
        allowNull: true
    }
}, {
    tableName: 'AUDITORIUM_TYPE',
    timestamps: false
});

module.exports = AuditoriumType;