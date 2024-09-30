const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuariosController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');

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

    //EDITAR GRUPOS
    router.get('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarGrupo );
    router.post('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.editarGrupo );

    //Editar imagen del grupo
    router.get('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarImagen );
    router.post('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.subirImagen,gruposController.editarImagen );


    //Eliminar Grupos
    router.get('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEliminarGrupo );
    router.post('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.eliminarGrupo );    
    

    //Nuevos Meeti's
    router.get('/nuevo-meeti', authController.usuarioAutenticado, meetiController.formNuevoMeeti );
    router.post('/nuevo-meeti', authController.usuarioAutenticado,meetiController.sanitizarMeeti,  meetiController.crearMeeti );

    //Editar Meeti
    router.get('/editar-meeti/:Id', authController.usuarioAutenticado, meetiController.formEditarMeeti );
     router.post('/editar-meeti/:Id', authController.usuarioAutenticado, meetiController.sanitizarMeeti, meetiController.editarMeeti );

    //Eliminar Meeti
    router.get('/eliminar-meeti/:Id', authController.usuarioAutenticado, meetiController.formEliminarMeeti );
    router.post('/eliminar-meeti/:Id', authController.usuarioAutenticado, meetiController.eliminarMeeti );

    //Siempre debe ir al final.
    return router;

}