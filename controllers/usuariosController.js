const { sync } = require('../config/db');
const Usuarios = require('../models/Usuarios');

const { body, validationResult } = require('express-validator');
const enviarEmail = require('../handlers/email');


exports.formCrearCuenta = (req, res) => {
    res.render ('crear-cuenta',{
        nombrePagina: 'Crear cuenta'
    });
}

exports.crearNuevaCuenta = async(req, res) => {
    const usuario = req.body;

    const rules = [
        body('confirmar').notEmpty().withMessage('Debes de confirmar tu password'),
        body('confirmar').equals(req.body.password).withMessage('El password es diferente')
      ]
    await Promise.all(rules.map(validation => validation.run(req)))
    
    //Leer los errores de express
    const erroresExpress =validationResult(req);

    try {
       await Usuarios.create(req.body);

       //URL de confirmación
       const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
    
      
       //Enviar email de confirmación.
       await enviarEmail.enviarEmail({
        usuario,
        url,
        subject: 'Confirma tu cuenta en Meeti',
        archivo: 'confirmar-cuenta'
       });

         //Flash Message y Redirección
         req.flash('exito', 'Hemos enviado un Email, favor confirmar tu cuenta');
         res.redirect('/iniciar-sesion'); 

    } catch (error) {
        //Extrae el campo message de los errores.
        const erroresSequelize = error.errors ? error.errors.map(err => err.message) : [];

        //Extrae el campo msg de los errores.
        const errExp = erroresExpress.array().map(err=>err.msg);

        //Unir errores 
        const listaErrores = [...erroresSequelize, ...errExp];

       // Verifica que exista un mensaje antes de acceder a él
       if (listaErrores.length > 0) {
            req.flash('error', listaErrores);
       }
        res.redirect('/crear-cuenta');
        console.log("Ocurrio un error", error);
    }
   
}

exports.confirmarCuenta = async(req, res,next) => {
    const usuario = await Usuarios.findOne({where: {email: req.params.correo}});

    //Si el usuario no existe, redireccionar al formulario de crear cuenta
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }
     //Si el usuario , redireccionar al formulario de inicio de sesion
    usuario.activo = 1;
    await usuario.save();
    req.flash('exito', 'Cuenta activada correctamente');
    res.redirect('/iniciar-sesion');
}

exports.formIniciarSesion = async(req, res) => {
    res.render ('iniciar-sesion',{
        nombrePagina: 'Iniciar Sesión'
    });
}

