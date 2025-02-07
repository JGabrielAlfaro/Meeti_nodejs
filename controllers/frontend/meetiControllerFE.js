const Meeti = require('../../models/Meeti');
const Grupos     = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');

const Op = Sequelize.Op;


exports.mostrarMeeti = async (req, res, next) => {
    try {
        // Buscar el meeti específico usando el slug
        const meeti = await Meeti.findOne({
            where: { slug: req.params.slug },
            include: [
                { model: Grupos },
                { model: Usuarios, attributes: ['id', 'nombre', 'imagen'] }
            ]
        });

        if (!meeti) {
            return res.redirect('/'); // Si no se encuentra el meeti, redirigir al inicio
        }

        // Crear la ubicación del meeti a partir de sus coordenadas
        const ubicacion = Sequelize.literal(
            `ST_GeomFromText('POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})')`
        );

        // Calcular la distancia para encontrar meetis cercanos
        const distancia = Sequelize.fn(
            'ST_Distance',
            Sequelize.col('meeti.ubicacion'),
            Sequelize.fn('ST_GeomFromText', `POINT(${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]})`)
        );

        // Buscar meetis cercanos, limitados a 3 resultados
        const cercanos = await Meeti.findAll({
            order: [['distancia', 'ASC']], // Ordenar por distancia
            where: Sequelize.where(distancia, { [Op.lte]: 2000 }), // Filtrar por distancia dentro de 2000 metros
            limit: 3,
            offset: 1, // Ignorar el primer resultado
            include: [
                { model: Grupos },
                { model: Usuarios, attributes: ['id', 'nombre', 'imagen'] }
            ],
            attributes: {
                include: [
                    [distancia, 'distancia'] // Incluir la columna de distancia
                ]
            }
        });

        // Consultar los comentarios asociados al meeti
        const comentarios = await Comentarios.findAll({
            where: { meetiId: meeti.id },
            order: [['id', 'DESC']],
            include: [{ model: Usuarios, attributes: ['id', 'nombre', 'imagen'] }]
        });

        // Renderizar la vista con los datos obtenidos
        res.render('mostrar-meeti', {
            nombrePagina: meeti.titulo,
            meeti,
            comentarios,
            moment,
            cercanos
        });
    } catch (error) {
        console.error("Error al mostrar meeti:", error);
        next(error); // Pasar el error al manejador de errores
    }
};


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

exports.muestraCategoria = async (req, res,next) => { 
    const categoria = await Categorias.findOne({
        attributes : ['id', 'nombre'],// Nos trae el campo id de categoria.
        where: {
            slug : req.params.categoria
        }
    });

    const meetis = await Meeti.findAll({
        order : [['fecha', 'ASC'],['hora', 'ASC']],
        include: [
            {
                model : Grupos,
                where : {categoriaId : categoria.id}
            },
            {
                model : Usuarios
            }
        ]
    });

    res.render ('categoria', {
        nombrePagina : 'Categoria: ' + categoria.nombre,
        meetis,
        moment
    });
}