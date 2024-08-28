
const { body, validationResult } = require('express-validator');
const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

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