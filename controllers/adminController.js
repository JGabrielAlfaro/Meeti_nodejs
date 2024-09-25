const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');

exports.panelAdministracion = async (req, res) => {

    const consultas = [];
    consultas.push(Grupos.findAll({ where:{usuarioId: req.user.id}} ));
    consultas.push(Meeti.findAll({ where:{usuarioId: req.user.id}} ));
    const [ grupos, meeti ] = await Promise.all(consultas);

    res.render('administracion', {  
        nombrePagina: 'Panel de administración',
        grupos,
        meeti
    })
} 