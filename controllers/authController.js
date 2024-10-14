const passport = require('passport');

exports.autenticarUsuario = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.redirect('/iniciar-sesion'); // Redirige si los campos están vacíos
    } 

   //Autenticar el usuario
    passport.authenticate('local', {
        successRedirect: '/administracion',
        failureRedirect: '/iniciar-sesion',
        failureFlash: true,
        badRequestMessage: 'Ambos Campos son Obligatorios',
    })(req, res, next);
};
//Revisa si el usuario autenticado tiene una sesion activa
exports.usuarioAutenticado = (req, res, next) => {
    //Si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
    }
    //Si no esta autenticado, redireccionar al formulario de inicio de sesion
    return res.redirect('/iniciar-sesion');
} 

//Cierre de sesion
exports.cerrarSesion = (req, res, next) => {
    console.log('Iniciando el proceso de cierre de sesión...');
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return next(err);
        }
        // Destruir la sesión
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al destruir la sesión:', err);
                return next(err);
            }

            res.redirect('/iniciar-sesion'); // Redirigir después de cerrar sesión
        });
    });
};