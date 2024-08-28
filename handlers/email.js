const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');
const path = require('path');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');


let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

exports.enviarEmail = async (opciones) => {
   
    //Leer el archivo para el email
    const archivo = path.join(__dirname, '../views/emails/confirmar-cuenta.ejs');
   
    //Compilarlo
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));
    
     //Crear el HTML
    const html = compilado({url: opciones.url});

    //Configurar las opciones del email
    const opcionesEmail = {
        from: 'Meeti <support@pjs360.com>',
        to: opciones.usuario.email,
        subject: opciones.subject,
        html
    }

    //Enviar el email
    const sendEmail = util.promisify(transport.sendMail, transport);
    return sendEmail.call(transport,opcionesEmail);

}