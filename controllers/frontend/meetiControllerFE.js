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

//Confirma o cancela si el usuario asistirá al meeti
exports.confirmarAsistencia = async (req, res) => {
   

    const {accion} = req.body;

    if(accion === "confirmar") {
        await Meeti.update(
            {'interesados' : Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)},
            {where : {'slug' : req.params.slug}}
        )
        //Mensaje
        res.send('Has confirmado tu asistencia');
    } else {
        await Meeti.update(
            {'interesados' : Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)},
            {where : {'slug' : req.params.slug}}
        )
        //Mensaje
        res.send('Has cancelado tu asistencia');
    }
    
}

//Muestra los asistentes al meeti
exports.mostrarAsistentes = async (req, res) => {
    const meet = await Meeti.findOne({
        where : {
            slug : req.params.slug
        },
        attributes : ['interesados']
    });
    //Extraer interesados
    const {interesados} = meet;
    const asistentes = await Usuarios.findAll({
        attributes : ['nombre', 'imagen'],
        where : {id : interesados}
    });

    //Crear la vista  pasar los datos
    res.render('asistentes-meeti', {
        nombrePagina : 'Listado de Asistentes Meeti',
        asistentes
    })
}