

const { body, validationResult } = require('express-validator');

const { sync } = require('../config/db');
const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');


exports.formNuevoMeeti = async (req,res) => {

    const grupos = await Grupos.findAll({ where : {usuarioId: req.user.id}});
    res.render('nuevo-meeti',{
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    })
}

exports.crearMeeti = async (req, res) => {
    const { titulo, lng, lat, cupo } = req.body;
    
    // Verifica que el título no esté vacío
    if (!titulo || titulo.trim() === '') {
        req.flash('error', 'El título es obligatorio');
        return res.redirect('/nuevo-meeti');
    }

    const meeti = req.body;

    // Asignar el usuario al meeti
    meeti.usuarioId = req.user.id;

    // Almacenar la ubicación como un Point
    const point = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
    meeti.ubicacion = point;

    // Cupo opcional
    meeti.cupo = cupo === '' ? 0 : cupo;

    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Meeti creado correctamente');
        res.redirect('/administracion');
    } catch (error) {
        const erroresSequelize = error.errors ? error.errors.map(err => err.message) : [];
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
        console.error("Ocurrió un error:", error);
    }
};


// sanitiza los meeti
exports.sanitizarMeeti = (req, res, next) => {
    [
        body('titulo').trim().escape(),
        body('invitado').trim().escape(),
        body('cupo').toInt(),
        body('fecha').trim().escape(),
        body('hora').trim().escape(),
        body('direccion').trim().escape(),
        body('ciudad').trim().escape(),
        body('estado').trim().escape(),
        body('pais').trim().escape(),
        body('lat').toFloat(),
        body('lng').toFloat(),
        body('grupoId').trim().escape(),
    ];

    next();
};