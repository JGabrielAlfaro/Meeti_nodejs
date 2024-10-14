const Sequelize = require('sequelize');
const db = require('../config/db');

const Categorias = db.define('categorias', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING
    },
    slug: {
        type: Sequelize.STRING
    }
},{
    timestamps: false
});

module.exports = Categorias;