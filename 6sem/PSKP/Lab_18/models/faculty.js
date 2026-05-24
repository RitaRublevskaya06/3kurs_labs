const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Faculty = sequelize.define('Faculty', {
    FACULTY: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    FACULTY_NAME: {
        type: DataTypes.STRING(30),
        allowNull: true
    }
}, {
    tableName: 'FACULTY',
    timestamps: false
});

module.exports = Faculty;