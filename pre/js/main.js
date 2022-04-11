//Desarrollo de la visualización
import * as d3 from 'd3';
import * as topojson from "topojson-client";
let d3_composite = require("d3-composite-projections");

//Necesario para importar los estilos de forma automática en la etiqueta 'style' del html final
import '../css/main.scss';

///// VISUALIZACIÓN DEL GRÁFICO //////
let map = d3.select('#map1');

const width = parseInt(map1.style('width'));
const height = parseInt(map1.style('height'));

let mapLayer = map.append('svg').attr('width', width).attr('height', height);
let distritos;
let projection, path;

d3.queue()
    .defer(d3.json, 'https://raw.githubusercontent.com/carlosmunozdiaz/timeline_covid19_madrid_map/main/data/distritos_topo.json')
    .defer(d3.csv, 'https://raw.githubusercontent.com/carlosmunozdiaz/timeline_covid19_madrid_map/main/data/covid19_settimana_v2.csv')
    .await(main);

function main(error, distritosAux, data) {
    if (error) throw error;

    distritos = topojson.feature(distritosAux, municipios.objects.distritos);

    console.log(data);

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
            sliderInterval = setInterval(setNewValue,1500);
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
    
        if (currentValue == 2035) {
            clearInterval(sliderInterval);
            playButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        }
    }

    function setDate(index) {
        console.log(index);
    }

    ////////
    //////
    // LÓGICA DEL MAPA
    //////
    ///////

    ///HACEMOS EL JOIN
    distritos.features.forEach(function(item) {
        let join = data.filter(function(subItem) {
            console.log(subItem.municipio_distrito.substr(5));
            if(subItem.municipio_distrito.substr(5) == item.properties.NOMBRE) {
                return subItem;
            }
        });
        join = join[0];
        item.data = join;
    });

    console.log(distritos);

    projection = d3_composite.geoConicConformalSpain().scale(2000).fitSize([width,height], distritos);
    path = d3.geoPath(projection);

    function initMap() { //Index - 94
        //Filtrado de datos
        let auxData = data.filter(function(item) {
            if(item.week == currentValue) {
                return item;
            }
        });

        //Disposición del mapa

    }

    function updateMap(index) {
        //Filtrado de datos

        //Disposición del mapa

    }

    mapLayer.selectAll(".dist")
        .data(distritos.features)
        .enter()
        .append("path")
        .attr("class", "dist")
        .style('stroke','none')
        .style('opacity', '1')
        .style('fill', function(d) {
            if(d.data) {
                if (d.data.porc_envejecido != 'NA') {
                    let color = '';
                    let env = +d.data.porc_envejecido.replace(',','.');
                    let total = +d.data.total;

                    if ( total < 1000) {
                        if (env < 15) {
                            color = '#e8e8e8';
                        } else if (env >= 15 && env < 30) {
                            color = '#b5c0da';
                        } else {
                            color = '#6c83b5';
                        }
                    } else if ( total >= 1000 && total < 20000) {
                        if (env < 15) {
                            color = '#b8d6be';
                        } else if (env >= 15 && env < 30) {
                            color = '#8fb2b3';
                        } else {
                            color = '#567994';
                        }
                    } else {
                        if (env < 15) {
                            color = '#73ae7f';
                        } else if (env >= 15 && env < 30) {
                            color = '#5a9178';
                        } else {
                            color = '#2b5a5b';
                        }
                    }

                    return color;


                } else {
                    return '#ccc';
                }                
            } else {
                return '#ccc';
            }            
        })
        .attr("d", path);
}