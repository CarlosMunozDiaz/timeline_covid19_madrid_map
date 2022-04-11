//Desarrollo de la visualización
import * as d3 from 'd3';
import * as topojson from "topojson-client";
let d3_composite = require("d3-composite-projections");

//Necesario para importar los estilos de forma automática en la etiqueta 'style' del html final
import '../css/main.scss';

///// VISUALIZACIÓN DEL GRÁFICO //////
let map1 = d3.select('#map1'), map2 = d3.select('#map2');

const width = parseInt(map1.style('width'));
const height = parseInt(map1.style('height'));

let mapLayer1 = map1.append('svg').attr('width', width).attr('height', height),
    mapLayer2 = map2.append('svg').attr('width', width).attr('height', height);
    let distritos;
let projection, path;

d3.queue()
    .defer(d3.json, 'https://raw.githubusercontent.com/carlosmunozdiaz/simple_covid19_madrid_map/main/data/distritos_topo.json')
    .defer(d3.csv, 'https://raw.githubusercontent.com/carlosmunozdiaz/simple_covid19_madrid_map/main/data/covid19_anni.csv')
    .await(main);

function main(error, distritosAux, data) {
    if (error) throw error;

    distritos = topojson.feature(distritosAux, municipios.objects.distritos);

    console.log(data);

    ///HACEMOS EL JOIN
    // muni.features.forEach(function(item) {
    //     let join = data.filter(function(subItem) {
    //         if(subItem.Municipios.substr(0,5) == item.properties.Codigo) {
    //             return subItem;
    //         }
    //     });
    //     join = join[0];
    //     item.data = join;
    // });

    projection = d3_composite.geoConicConformalSpain().scale(2000).fitSize([width,height], distritos);
    path = d3.geoPath(projection);

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

    mapLayer.append('path')
        .style('fill', 'none')
        .style('stroke', '#000')
        .attr('d', projection.getCompositionBorders());

    mapLayer.selectAll('.prov')
        .data(provs.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('stroke-width','0.25px')
        .style('stroke', '#000')
        .style('fill', 'transparent');

    setChartCanvas();
}