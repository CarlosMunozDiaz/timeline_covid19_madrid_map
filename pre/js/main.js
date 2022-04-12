//Desarrollo de la visualización
import * as d3 from 'd3';
import * as d3Chromatic from 'd3-scale-chromatic';
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
    .defer(d3.csv, 'https://raw.githubusercontent.com/carlosmunozdiaz/timeline_covid19_madrid_map/main/data/covid19_settimana_v3.csv')
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
            sliderInterval = setInterval(setNewValue,750);
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

    let color = d3.scaleQuantile()
        .domain([0,1800])
        .range(['#56f9ff', '#4bdfe5', '#40c6cc', '#36adb4', '#2b959c', '#217d84', '#17666e', '#0e5158', '#053c43', '#00282f']);

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
                console.log(d.data[93]);
                return color(+d.data[93].tasa_incidencia_semanal);
            })
            .attr("d", path);

        mapLayer.append("g")
            .selectAll("labels")
            .data(distritos.features)
            .enter()
            .append("text")
            .attr("x", function(d){return path.centroid(d)[0]})
            .attr("y", function(d){return path.centroid(d)[1]})
            .text(function(d){ return d.data[0].id_distrito; })
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .style("font-size", 11)
            .style("fill", "white");
    }

    function updateMap(index) {
        //Disposición del mapa
        console.log(index);
        mapLayer.selectAll(".dist")
            .style("fill", function(d) {
                return color(+d.data[index - 1].tasa_incidencia_semanal);
            })
    }

    ///Inicio
    initMap();
    createTimeslider();
}