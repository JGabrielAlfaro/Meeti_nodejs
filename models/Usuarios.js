const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(60),
    },
    imagen: {
        type: Sequelize.STRING(100),
    },
    email: {
        type: Sequelize.STRING(60),
        allowNull: false,
        unique: {
            args: true,
            msg: 'Ese correo ya existe'
        },
        validate: {
            notEmpty: {
                msg: 'Agrega un correo válido'
            }
        }
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El password no puede ir vacío'
            }
        }
    },
    activo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    tokenPassword: {
        type: Sequelize.STRING,
    },
    expiraToken: {
        type: Sequelize.DATE,
    },
    token: {
        type: Sequelize.STRING(12),
    },
    confirmado: {
        type: Sequelize.BOOLEAN,
    }
}, {
    hooks: {
        beforeCreate(usuario) {
            usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(10), null);
        }
    }
});

// Métodos para comparar los password
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = Usuarios;
