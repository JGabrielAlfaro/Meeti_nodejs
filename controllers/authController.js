const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos Campos son Obligatorios',
}) 

//Revisa si el usuario autenticado tiene una sesion activa
exports.usuarioAutenticado = (req, res, next) => {
    //Si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
    }
    //Si no esta autenticado, redireccionar al formulario de inicio de sesion
    return res.redirect('/iniciar-sesion');
}