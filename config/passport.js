const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Usuarios = require('../models/Usuarios');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    //done, next y callback es lo mismo en el 3 parametro.
    async(email, password, next) => {
        //Codigo se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({where: {email, activo: 1}});

        //Si el usuario no existe
        if(!usuario){
            return next(null, false, {
                message: 'Ese usuario no existe'
            })
        }

        //Si el usuario existe, comparar password
        const verificarPassword = usuario.validarPassword(password);
        if(!verificarPassword){
            return next(null, false, {
                message: 'Password Incorrecto'
            })
        }
        return next(null, usuario);
    }   

))

passport.serializeUser(function(usuario, cb) {
    cb(null, usuario);
});

passport.deserializeUser(function(usuario, cb) {
    cb(null, usuario);
});

module.exports = passport;