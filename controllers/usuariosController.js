const { sync } = require('../config/db');
const Usuarios = require('../models/Usuarios');

const { body, validationResult } = require('express-validator');
const enviarEmail = require('../handlers/email');

//Multer (subir imagen)
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const fs = require('fs');



//SUBIR IMAGEN
// Configuración de Multer para el manejo de archivos
const configuracionMulter = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, '/../public/uploads/perfiles');
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            const uniqueName = `${shortid.generate()}.${extension}`;
            cb(null, uniqueName);
        }
    }),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB  (bytes, convertimos a MB)
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); 
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
};

const upload = multer(configuracionMulter).single('imagen'); // "imagen" es el nombre del campo del formulario.

// Middleware para subir imagen
exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                // Error de Multer (ej. archivo demasiado grande)
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es demasiado grande');
                } else {
                    req.flash('error', error.message);
                }
            } else if (error.message) {
                // Error personalizado (tipo de archivo no permitido)
                req.flash('error', error.message);
            } else {
                req.flash('error', 'Error desconocido al subir la imagen');
            }
            return res.redirect('back');
        }
        // Continua al siguiente middleware si no hay errores
        next();
    });
};
//**FIN SUBIR IMAGEN */


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

exports.formEditarPerfil = async(req, res) => {

    const usuario = await Usuarios.findOne({where: {id: req.user.id}});
    res.render('editar-perfil', {       
        nombrePagina: 'Editar Perfil',
        usuario 
    });
}

//Actualiza el perfil del usuario
exports.editarPerfil = async(req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Sanitizando los datos
    body('nombre').trim().escape();
    body('email').trim().escape();

    //Leer datos del formulario
    const {nombre,descripcion,email} = req.body;
    
    // Asignar los valores
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    usuario.descripcion = req.body.descripcion;

    //Guardar en la base de datos
    await usuario.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');

}

exports.formCambiarPassword = async(req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar password'
    });
}

exports.cambiarPassword = async(req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);


    //Verifiar que el password sea correcto
    if(!await usuario.validarPassword(req.body.anterior)) {
        req.flash('error', 'Password incorrecto');
        res.redirect('/administracion');
        return next();
    }

    //si el password es correcto, hashear el nuevo password
    const hash = usuario.hashPassword(req.body.nuevo);
    console.log(hash)

   //asignar el password al usuario
   usuario.password = hash;

   //guardar en la base de datos
   usuario.save();

   //redireccionar al administrador
   req.logout(req.user, (err) => {
            if (err) return next(err);
            req.flash(
            "exito",
            "Password Modificado Correctamente, vuelve a iniciar sesión"
            );
        }
    );
    res.redirect('/administracion');
}

exports.formSubirImagen = async(req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);
    res.render('imagen-perfil', {
        nombrePagina: 'Subir Imagen perfil',
        usuario
    });
}

//Guarda la imagen nueva
exports.guardarImagenPerfil = async(req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Si hay una imagen anterior, la eliminamos
    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = path.join(__dirname, '../public/uploads/perfiles', usuario.imagen);
        // Eliminar imagen anterior
        fs.unlinkSync(imagenAnteriorPath, (err) => {
            if(err){
                console.log(err);
            }
            return;
        });
    }

    //Si hay una imagen nueva, la guardamos.
    if(req.file){
        usuario.imagen = req.file.filename;
    }

    // Almacenar en la base de datos
    await usuario.save();
    req.flash('exito', 'Se ha actualizado el perfil correctamente');
    res.redirect('/administracion');
}