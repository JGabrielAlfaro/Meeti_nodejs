const Grupos = require('../../models/Grupos');
const Meeti = require('../../models/Meeti');
const moment = require('moment');

exports.mostrarGrupo = async (req, res) => {  
    const consultas = [];
    consultas.push( Grupos.findOne({ where : { id : req.params.id } }) );
    consultas.push( Meeti.findAll({ 
                                    where : { grupoId : req.params.id },
                                    order  : [
                                        ['fecha', 'ASC'],
                                    ]
                                     
    }) );

    const [grupos,meetis] = await Promise.all(consultas);

    
    //No hay resultados de grupos
    if(!grupos) {
        res.redirect('/');
        return next();
    }

    //Mostrar la vista
    res.render('mostrar-grupo', {   
        nombrePagina : `Información Grupo: ${grupos.nombre}`,
        grupo:grupos,
        meetis,
        moment
    });
}