const Sequelize = require('sequelize');
const db = require('../config/db');
const Usuarios = require('./Usuarios');
const Meeti = require('./Meeti');


const Comentarios = db.define('comentario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mensaje: {
        type: Sequelize.TEXT
    },
  },  {
    timestamps: false
});

Comentarios.belongsTo(Usuarios);//Cada comentario tiene un usuario
Comentarios.belongsTo(Meeti);//Cada comentario tiene un meeti

module.exports = Comentarios;