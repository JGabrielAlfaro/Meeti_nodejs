
const Comentarios = require("../../models/Comentarios");
const Meeti = require("../../models/Meeti");


exports.agregarComentario = async (req, res, next) => {
    //obtener el comentario
    const { comentario } = req.body;
    

    await Comentarios.create({ //Guardar el comentario en la base de datos
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id,
    });
    //Redireccionar
    res.redirect('back');
    next();
}

exports.eliminarComentario = async (req, res, next) => {



    //Tomar el id del comentario
    const { comentarioId } = req.body;

    //Consultar el comentario
    const comentario = await Comentarios.findOne({ where: { id: comentarioId } });

    //verificar si el comentario existe
    if (!comentario) {
        res.status(404).send('Accion no valida');
        return next();
    }

    //Consultar el meeti al que pertece el comentario
    const meeti = await Meeti.findOne({ where: { id: comentario.meetiId  } });


    //Verificar que el que lo borra es el creador
    if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        //Eliminar el comentario
        await Comentarios.destroy({
            where: {
                id: comentario.id
            }
        });
        res.status(200).send('Comentario eliminado correctamente');
        return next();
    }else {
        res.send('Accion no valida');
        return next();
    }

}