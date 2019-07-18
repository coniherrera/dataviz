// Definir atributos iniciales para el Mapa
const MAP_ZOOM = 4
const MAP_CENTER = [-38.593745547, -72.391516408]

// Crear instancia del Mapa
var map = L.map('myMap').setView(MAP_CENTER, MAP_ZOOM)

var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

// Crear capa de sectores y Copyright del Mapa
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)


// Se establece una constante como referencia para mostrar "Información Adicional"
const mas_info = document.getElementById("mas_info")

function MostrarDato(feature, layer) {
  // Se valida si el objeto tiene la propiedad "properties"
  if (feature.properties) {
    let dato_a_mostrar = `<p>
      <h5>Region: ${feature.properties.Region}</h5><br/>
      <span><b>Defunciones</b>: ${feature.properties.Defunciones}</span><br/>
    </p>`
    layer.bindPopup(dato_a_mostrar);
    layer.on({
      click: (event)=>{
        // Se obtienen los datos desde las propiedades del JSON
        let Region = event.target.feature.properties.Region
        let Defunciones = event.target.feature.properties.Defunciones


        // Se genera el HTML para representar la acción de Click sobre un marcador
        let html_defunciones = `
          <div class="alert alert-primary" role="alert">
            <p>
              Defunciones para la región: ${Region} <br/>
              Numero de defunciones: <span class=>${Defunciones}</span> <br/>
            </p>
          </div>
        `
        // Se "escribe" el HTML en la página
        mas_info.innerHTML = html_defunciones
      }
    })
  }
}

// Se agrega data al Mapa
d3.json('./mapa.json', function(error, collection) {
  if (error) throw error;
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }
  var transform = d3.geo.transform({point: projectPoint}),
    path = d3.geo.path().projection(transform);

    var feature = g.selectAll("path")
    .data(collection.features)
  .enter().append("path");
  
  feature.attr("d", path);

  then((geojson) => {
    L.geoJSON(geojson, {
      onEachFeature: MostrarDato,
      pointToLayer: function (geoJsonPoint, latlng) {
        return L.circleMarker(latlng).bindPopup(`Region: ${geoJsonPoint.Region}`)
      },
      
      style: function (geoJsonPoint) {
        let color = (geoJsonPoint.Region > 20) ? 'red' : 'green'
        return { fillColor: color}
      }
    }).addTo(map)
  })
});