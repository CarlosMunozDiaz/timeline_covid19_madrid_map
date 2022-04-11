//Desarrollo de la visualización
import * as d3 from 'd3';
import * as topojson from "topojson-client";
let d3_composite = require("d3-composite-projections");

//Necesario para importar los estilos de forma automática en la etiqueta 'style' del html final
import '../css/main.scss';

///// VISUALIZACIÓN DEL GRÁFICO //////
let map = d3.select('#map');

const width = parseInt(map.style('width'));
const height = parseInt(map.style('height'));

let mapLayer = map.append('svg').attr('width', width).attr('height', height);
let distritos;
let projection, path;

d3.queue()
    .defer(d3.json, 'https://raw.githubusercontent.com/carlosmunozdiaz/timeline_covid19_madrid_map/main/data/distritos_v2.json')
    .defer(d3.csv, 'https://raw.githubusercontent.com/carlosmunozdiaz/timeline_covid19_madrid_map/main/data/covid19_settimana_v2.csv')
    .await(main);

function main(error, distritosAux, data) {
    if (error) throw error;

    ////////
    //////
    // LÓGICA DEL SLIDER
    //////
    ///////
    let currentValue = 94;
    const firstValue = 1;
    const lastValue = 94;

    let sliderRange = document.getElementById('slider');
    let sliderDate = document.getElementById('sliderDate');
    let playButton = document.getElementById('btnPlay');
    let pauseButton = document.getElementById('btnPause');
    let sliderInterval;

    function createTimeslider(){        
        /* Los siguientes eventos tienen la capacidad de modificar lo que se muestra en el mapa */
        playButton.onclick = function () {
            sliderInterval = setInterval(setNewValue,1000);
            playButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';    
        }
    
        pauseButton.onclick = function () {
            clearInterval(sliderInterval);
            playButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        }
    
        sliderRange.oninput = function () {
            sliderDate.innerHTML = setDate(this.value);
            setNewValue('input');                
        }
    }
    
    /* Da nuevos valores al slider */
    function setNewValue(type = undefined) {
        let value = parseInt(sliderRange.value);
        if (value == lastValue && !type) {
            sliderRange.value = firstValue;
        } else if (value == firstValue && type) {
            sliderRange.value = value;
        } else {
            sliderRange.value = value + 1;
        }
        currentValue = sliderRange.value;
        sliderDate.innerHTML = setDate(currentValue);
    
        updateMap(currentValue);
    
        if (currentValue == 94) {
            clearInterval(sliderInterval);
            playButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        }
    }

    function setDate(index) {
        let auxData = distritos.features[0].data[index - 1];
        return auxData.fecha_informe;
    }

    ////////
    //////
    // LÓGICA DEL MAPA
    //////
    ///////

    distritos = topojson.feature(distritosAux, distritosAux.objects.distritos);    

    ///HACEMOS EL JOIN
    distritos.features.forEach(function(item) {
        let join = data.filter(function(subItem) {
            if(subItem.municipio_distrito.substr(7) == item.properties.NOMBRE) {
                return subItem;
            }
        });
        item.data = join;
    });

    projection = d3_composite.geoConicConformalSpain().scale(2000).fitSize([width,height], distritos);
    path = d3.geoPath(projection);

    function initMap() { //Index - 94 - 1 > 93
        //Disposición del mapa
        mapLayer.selectAll(".dist")
            .data(distritos.features)
            .enter()
            .append("path")
            .attr("class", "dist")
            .style('stroke','#262626')
            .style('stroke-width','0.6px')
            .style('opacity', '1')
            .style("fill", function(d) {
                if(parseInt(d.data[93].casos_semanales) >= 0 & parseInt(d.data[93].casos_semanales) < 885) {
                    return '#ffe6b7';
                } else if (parseInt(d.data[93].casos_semanales) >= 885 & parseInt(d.data[93].casos_semanales) < 1770) {
                    return '#fecc7b';
                } else if (parseInt(d.data[93].casos_semanales) >= 1770 & parseInt(d.data[93].casos_semanales) < 2655) {
                    return '#f8b05c';
                } else if (parseInt(d.data[93].casos_semanales) >= 2655 & parseInt(d.data[93].casos_semanales) < 3540) {
                    return '#f1944d';
                } else if (parseInt(d.data[93].casos_semanales) >= 3540) {
                    return '#e37a42';
                }
            })
            .attr("d", path);
    }

    function updateMap(index) {
        console.log(index);
        //Disposición del mapa
        mapLayer.selectAll(".dist")
            .style("fill", function(d) {
                if(parseInt(d.data[index].casos_semanales) >= 0 & parseInt(d.data[index].casos_semanales) < 885) {
                    return '#ffe6b7';
                } else if (parseInt(d.data[index].casos_semanales) >= 885 & parseInt(d.data[index].casos_semanales) < 1770) {
                    return '#fecc7b';
                } else if (parseInt(d.data[index].casos_semanales) >= 1770 & parseInt(d.data[index].casos_semanales) < 2655) {
                    return '#f8b05c';
                } else if (parseInt(d.data[index].casos_semanales) >= 2655 & parseInt(d.data[index].casos_semanales) < 3540) {
                    return '#f1944d';
                } else if (parseInt(d.data[index].casos_semanales) >= 3540) {
                    return '#e37a42';
                }
            })
    }

    ///Inicio
    initMap();
    createTimeslider();
}