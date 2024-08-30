const Sequelize = require('sequelize');

const { v4: uuidv4 } = require('uuid');

//Importando las categorias.
const db = require('../config/db');
const Categorias = require('./Categorias');
const Usuarios = require('./Usuarios');

const Grupos = db.define('grupos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => uuidv4() // Genera un nuevo UUID para cada registro
    },
    nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El grupo debe tener un nombre'
            }
        }
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La descripción del grupo es obligatoria'
            }
        }
    },
    url: Sequelize.STRING,
    imagen: Sequelize.STRING

});

Grupos.belongsTo(Categorias);
Grupos.belongsTo(Usuarios);

module.exports = Grupos;