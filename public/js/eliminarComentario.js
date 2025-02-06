import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {   
    const formsEliminar = document.querySelectorAll('.eliminar-comentario');

    if (formsEliminar.length > 0) {
        formsEliminar.forEach(form => {
            form.addEventListener('submit', eliminarComentario);
        });
    }
});

function eliminarComentario(e) {
    e.preventDefault();
    
    Swal.fire({
        title: "Eliminar comentario?",
        text: "Un comentario eliminado no se puede recuperar!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, borrar!",
        cancelButtonText: "Cancelar!"
      }).then((result) => {
        if (result.value) {

            //Tomar el ID del comentario a eliminar
            const comentarioId = this.children[0].value;

            //Crear el objeto
            const datos = {
                comentarioId
            }

            //Ejecutar axios y pasar  los datos.
            axios.post(this.action,datos).then(respuesta => {
                Swal.fire({
                    title: "Eliminado",
                    text: respuesta.data,
                    icon: "success"
                  });

                //Eliminar el comentario de la interfaz
                this.parentElement.parentElement.remove();
            }).catch(error => {
                if (error.response.status === 403 || error.response.status === 404) {
                    Swal.fire({
                        title: "Error",
                        text: error.response.data,
                        icon: "error"
                      });
                }
            })
          
        }
      });
}