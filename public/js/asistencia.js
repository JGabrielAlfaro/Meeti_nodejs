import axios from "axios";

document.addEventListener("DOMContentLoaded", () => {

    const asistencia = document.querySelector("#confirmar-asistencia");
  
    if (asistencia) {
        asistencia.addEventListener("submit", confirmarAsistencia);
    }


});

function confirmarAsistencia(e) {
    e.preventDefault();
   

    const btn = document.querySelector("#confirmar-asistencia input[type='submit']");
    let accion = document.querySelector('#accion').value;
    const mensaje = document.querySelector('#mensaje');

    //limpia la respuesta previa
    while(mensaje.firstChild) {
        mensaje.removeChild(mensaje.firstChild);
    }

    //Obtiene el valor cancelar o confirmar en el input hidden
    const datos = {
        accion
    }

   axios.post(this.action,datos)
        .then(res => {
            if(accion === "confirmar") {
                document.querySelector("#accion").value = "cancelar";
                btn.value = "Cancelar";
                btn.classList.remove("btn-azul");
                btn.classList.add("btn-rojo");
            } else {
                document.querySelector("#accion").value = "confirmar";
                btn.value = "Si";
                btn.classList.remove("btn-rojo");
                btn.classList.add("btn-azul");
            }

            //Mostrar mensaje
            mensaje.appendChild(document.createTextNode(res.data));
        })




}