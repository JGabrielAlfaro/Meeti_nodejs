const { Sequelize } = require('sequelize');

module.exports = new Sequelize('verceldb', 'default', process.env.DB_PASS, {
    host:  process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false ,// Desactiva los logs de consultas
    define: {  // Crear las columnas createdAt y updatedAt en las tablas.
        timestamps: true
    }
});
