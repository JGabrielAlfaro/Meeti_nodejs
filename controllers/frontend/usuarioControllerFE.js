const Usuarios = require('../../models/Usuarios');
const Grupos = require('../../models/Grupos');

exports.mostrarUsuario = async (req, res, next) => {  
    try {
        const consultas = [];

        // Consultas al mismo tiempo
        consultas.push(Usuarios.findOne({ where: { id: req.params.id } }));
        consultas.push(Grupos.findAll({ where: { usuarioId: req.params.id } }));

        // Desestructurar los resultados de Promise.all
        const [usuario, grupos] = await Promise.all(consultas);
        console.log(usuario)
        console.log(grupos)

        if (!usuario) {
            res.redirect('/');
            return next();
        }

        // Renderizar la vista con los datos
        res.render('mostrar-perfil', {
            nombrePagina: `Perfil de Usuario: ${usuario.nombre}`,
            usuario,
            grupos
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
};
