
import { OpenStreetMapProvider } from "leaflet-geosearch";

let map;
let markers;
let marker;


document.addEventListener('DOMContentLoaded', function() {
    const mapElement = document.getElementById('mapId');
    // console.log(L); // Verifica si L está definido
  
    let geocodeService;
    if (L.esri && L.esri.Geocoding) {
        geocodeService = L.esri.Geocoding.geocodeService();
    } else {
        console.error('L.esri.Geocoding no está definido');
        return;
    }
    
    if (mapElement) {
        // Verifica si el navegador soporta la API de Geolocalización
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
            
        } else {
            // Si no se permite geolocalización, usar una ubicación por defecto
            iniciarMapa(9.748917, -83.753428); // Latitud y longitud para Costa Rica
            
        }
    }
    console.log("Paso por aqui 3")
    function success(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        iniciarMapa(lat, lng);
    }

    function error() {
        // Si el usuario deniega el permiso, usar una ubicación por defecto
        iniciarMapa(9.748917, -83.753428); // Latitud y longitud para Costa Rica
    }

    function iniciarMapa(lat, lng) {
        map = L.map(mapElement).setView([lat, lng], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        markers = new L.FeatureGroup().addTo(map);
        marker = new L.marker([lat, lng], { draggable: true, autoPan: true })
            .bindPopup('Tu ubicación actual')
            .openPopup();
        markers.addLayer(marker);

        marker.on('moveend', function(e) {
            const position = e.target.getLatLng();
            map.panTo(new L.LatLng(position.lat, position.lng));
            // console.log(`Nuevo marcador en: [${position.lat}, ${position.lng}]`);
    
            geocodeService.reverse().latlng(position, 13).run(function (error, result) {
                llenarInformacion(result);
                marker.bindPopup(result.address.LongLabel );
            });
        });

        const buscador = document.querySelector('#formbuscador');
        buscador.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarDireccion(e);
            }
        });
    }

    function buscarDireccion(e) {
        
        if (e.target.value.length > 8) {
            markers.clearLayers();
            const provider = new OpenStreetMapProvider();
    
            provider.search({ query: e.target.value }).then((resultado) => {
                
                if (resultado.length > 0) {  // Cambiado a verificar si hay resultados
                    map.setView([resultado[0].y, resultado[0].x], 16);
                    marker = new L.marker([resultado[0].y, resultado[0].x], {
                        draggable: true,
                        autoPan: true,
                    })
                    .bindPopup(resultado[0].label)
                    .openPopup();
                    markers.addLayer(marker);
                    
                    marker.on('moveend', function(e) {
                        const position = e.target.getLatLng();
                        map.panTo(new L.LatLng(position.lat, position.lng));
                        geocodeService.reverse().latlng(position, 13).run(function (error, result) {
                            llenarInformacion(result);
                            if (result && result.address) {
                                marker.bindPopup(result.address.LongLabel);
                            } else {
                                console.error('No se pudo obtener la dirección.');
                            }
                        });
                    });
                } else {
                    console.error('No se encontraron resultados para la búsqueda.');
                }
            }).catch((error) => {
                console.error('Error en la búsqueda:', error);
            });
        }
    }
});


function llenarInformacion(resultado) {
    console.log(resultado)
   document.querySelector('#direccion').value = resultado.address.Address ||  resultado.address.LongLabel || '';
   document.querySelector('#ciudad').value = resultado.address.City + ', ' + resultado.address.Subregion || '';
   document.querySelector('#estado').value = resultado.address.Region || '';
   document.querySelector('#pais').value = resultado.address.CountryCode || '';
   document.querySelector('#lat').value = resultado.latlng.lat || '';
   document.querySelector('#lng').value = resultado.latlng.lng || '';

}