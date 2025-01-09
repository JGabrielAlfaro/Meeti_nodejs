const Meeti = require('../../models/Meeti');
const Grupos     = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.mostrarMeeti = async (req, res,next) => {
    const meeti = await Meeti.findOne({ 
        where : {
            slug : req.params.slug          
        }, 
        include : [
            { 
                model: Grupos
            }, 
            {
                model : Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
    });
    if (!meeti) {
        res.redirect('/');
        return next();
    }   
    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo, 
        meeti,
        moment,
    })
}