
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

// Configuración de Multer para el manejo de archivos
const configuracionMulter = {
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, '/../public/uploads/grupos');
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

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();
    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
}
 

// Crear nuevo grupo
exports.crearGrupo = async (req, res) => {
    
    // Definir las reglas de validación
    const rules = [
        body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
        body('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
        body('url').notEmpty().withMessage('La URL es obligatoria'),
    ];

    // Ejecutar las validaciones
    await Promise.all(rules.map(validation => validation.run(req)));

    // Leer los errores de express-validator
    const erroresExpress = validationResult(req);

    // Crear el objeto 'grupo' con los datos del formulario
    const grupo = req.body;
    grupo.usuarioId = req.user.id; // Asignar el ID del usuario que tiene la sesión iniciada
    grupo.categoriaId = req.body.categoria; // Asignar el ID de la categoría desde el formulario

    // Leer imagen
    if(req.file) {
        grupo.imagen = req.file.filename
    }

    if (!erroresExpress.isEmpty()) {
        // Si hay errores de validación, mostrar mensajes y redirigir
        const errExp = erroresExpress.array().map(err => err.msg);
        req.flash('error', errExp);
        return res.redirect('/nuevo-grupo');
    }

    try {
        // Almacenar el grupo en la base de datos
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');
    } catch (error) {
        // Extraer los errores de Sequelize
        const erroresSequelize = error.errors ? error.errors.map(err => err.message) : [];
        
        // Unir los errores de Sequelize y de express-validator
        const listaErrores = [...erroresSequelize, ...erroresExpress.array().map(err => err.msg)];

        // Verifica que exista un mensaje antes de acceder a él
        if (listaErrores.length > 0) {
            req.flash('error', listaErrores);
        }
        
        res.redirect('/nuevo-grupo');
        console.log("Ocurrió un error:", error);
    }
};