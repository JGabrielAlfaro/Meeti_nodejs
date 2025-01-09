
import { OpenStreetMapProvider } from "leaflet-geosearch";

let map;
let markers;
let marker;


document.addEventListener('DOMContentLoaded', function() {
    const mapElement = document.getElementById('ubicacion-meeti');
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

    function success(position) {
        const latString = document.querySelector('#lat').value;
        const lngString = document.querySelector('#lng').value;
        
        // Convertir a números
        const lat = parseFloat(latString);
        const lng = parseFloat(lngString);
    
        // Verificar si los valores son válidos
        if (isNaN(lat) || isNaN(lng)) {
            console.error('Las coordenadas no son válidas:', latString, lngString);
            // Puedes establecer valores predeterminados o manejar el error
            iniciarMapa(9.748917, -83.753428); // Por ejemplo, ubicación predeterminada
            return;
        }
    

        iniciarMapa(lng, lat);
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
    
            geocodeService.reverse().latlng(position, 16).run(function (error, result) {
             
                marker.bindPopup(result.address.LongLabel );
            });
        });

        const buscador = document.querySelector('#ubicacion-meeti');
        buscador.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarDireccion(e);
            }
        });
    }

    function buscarDireccion(e) {
        const inputValue = e.target.value.trim();
    
        // Solo ejecuta la búsqueda si el valor es mayor a 8 caracteres
        if (inputValue.length > 8) {
            markers.clearLayers();
            const provider = new OpenStreetMapProvider();
    
            // Realiza la búsqueda de la dirección
            provider.search({ query: inputValue })
                .then((resultados) => {
                    if (resultados.length > 0) {
                        const resultado = resultados[0];
                        const { x: lng, y: lat, label } = resultado;
    
                        // Centrar el mapa en la ubicación encontrada
                        map.setView([lat, lng], 16);
    
                        // Agregar marcador al mapa
                        let marker = L.marker([lat, lng], {
                            draggable: true,
                            autoPan: true,
                        })
                        .bindPopup(label)
                        .openPopup();
                        
                        markers.addLayer(marker);
    
                        // Mover el mapa a la posición del marcador
                        map.panTo(new L.LatLng(lat, lng));
    
                        // Evento cuando se mueve el marcador
                        marker.on('moveend', function (event) {
                            const markerPosition = event.target.getLatLng();
    
                            // Actualiza la vista del mapa y realiza la búsqueda inversa
                            map.panTo(new L.LatLng(markerPosition.lat, markerPosition.lng));
    
                            geocodeService.reverse().latlng(markerPosition, 13).run(function (error, result) {
                                if (error) {
                                    console.error('Error al obtener la dirección inversa:', error);
                                    return;
                                }
    
              
                                if (result && result.address) {
                                    marker.bindPopup(result.address.LongLabel || 'Dirección no disponible');
                                } else {
                                    console.warn('No se pudo obtener la dirección.');
                                }
                            });
                        });
    
                        // Realizar búsqueda inversa de inmediato sin mover el marcador
                        geocodeService.reverse().latlng({ lat, lng }, 13).run(function (error, result) {
                            if (error) {
                                console.error('Error al obtener la dirección inversa:', error);
                                return;
                            }
    
                         
                            if (result && result.address) {
                                marker.bindPopup(result.address.LongLabel || 'Dirección no disponible');
                            } else {
                                console.warn('No se pudo obtener la dirección.');
                            }
                        });
                    } else {
                        console.warn('No se encontraron resultados para la búsqueda.');
                    }
                })
                .catch((error) => {
                    console.error('Error en la búsqueda de dirección:', error);
                });
        }
    }
        
});


