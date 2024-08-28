const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuariosController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');

module.exports = function () {
    router.get ('/', homeController.home);

    //Crear Cuenta Y Confirmar Cuenta
    router.get ('/crear-cuenta', usuarioController.formCrearCuenta );
    router.post ('/crear-cuenta', usuarioController.crearNuevaCuenta );
    router.get('/confirmar-cuenta/:correo', usuarioController.confirmarCuenta);

    //Iniciar Sesión
    router.get ('/iniciar-sesion', usuarioController.formIniciarSesion );
    router.post('/iniciar-sesion', authController.autenticarUsuario );

    //Panel de administracion
    router.get('/administracion',authController.usuarioAutenticado,  adminController.panelAdministracion );

    // NUEVOS GRUPOS
    router.get('/nuevo-grupo', authController.usuarioAutenticado, gruposController.formNuevoGrupo );
    router.post('/nuevo-grupo', authController.usuarioAutenticado, gruposController.subirImagen, gruposController.crearGrupo );

    return router;
}