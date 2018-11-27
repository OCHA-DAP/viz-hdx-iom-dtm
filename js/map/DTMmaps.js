var Maps = {

    //Frist draw Map of Africa and then pull and draw country layers.
    //Add Legends and Zoom
    drawMapDTM: function drawMapDTM(idpsData) {

        // Set width of the map on the basis of view port size TODO
        var vW = window.innerWidth;

        var svgWidth = 600;
        if (vW < 1000 && vW > 980)
            svgWidth = 500;

        // Height of the map
        var svgHeight = 600;

        // This would be used in the zoom
        var centered;

        // Map container
        var svg = d3.select("#map").append("svg").attr("width", svgWidth).attr("height", svgHeight);

        // No margins yet but could be useful, later.
        var margin = { top: 0, right: 0, bottom: 0, left: 0 };
        var width = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        // Set projection.
        var projection = d3.geoMercator()
            .center([0, 0])
            .scale(420)
            .translate([width / 4, height / 2]);

        // Set path on projection
        var path = d3.geoPath().projection(projection);

        // This layer('g') would be used to all layers of the map.
        // The class is to select this element in DTMCharts.js
        var baseLayer = svg.append("g").attr("class", "test1");

        
        // Draw Africa layer
        d3.json("data/geo/topojson/africa_admin0.json").then(function (data) {

            baseLayer.append("g")
                .attr("class", "baseLayer")
                .selectAll("path")
                .data(topojson.feature(data, data.objects.africa_admin0).features)
                .enter().append("path")
                .attr("d", path)
        });


        // IDPs color on the map
        var color = d3.scaleThreshold()
            .domain([1, 1001, 10001, 50001, 100001, 500001, 1000001])
            .range(["#fff", "#afdbe1", "#9fd4db", "#7ec6cf", "#5fb8c3", "#4c939c", "#396e75"]);

        // Needs data color on the map
        var needsColor = d3.scaleThreshold()
            .domain([1, 1001, 10001, 50001, 100001, 500001, 1000001])
            .range(["#fff", "#dddd81", "#d7d76c", "#d2d256", "#cccc42", "#c7c72d", "#b3b328"]);

        // The radius for needs data circles.
        var radius = d3.scaleSqrt()
            .domain([0, 100000])
            .range([0, 2]);

        // Admin1 boundaries URLs
        var admin1JsonFiles = [
            "data/geo/topojson/bdi_adm1.json",
            "data/geo/topojson/caf_adm1.json",
            "data/geo/topojson/cmr_adm1.json",
            "data/geo/topojson/lby_adm1.json",
            "data/geo/topojson/mdg_adm1.json",
            "data/geo/topojson/mli_adm1.json",
            "data/geo/topojson/nga_adm1.json"
        ];

        //Putll and push all topojson into 'promises' array.
        var promises = [];
        admin1JsonFiles.forEach(function (url) {
            promises.push(d3.json(url))
        });

        // All async call to topojson
        Promise.all(promises).then(function (jsonData) {

            // Need data promise.
            Promise.resolve(d3.csv("data/hno.csv")).then(function (needsData) {

                // Loop on each Admin1-Boundaries data and add 'number of IDPs', countyr and admin1 name in the json
                jsonData.forEach(function (data) {
                    var dataFeatures = topojson.feature(data, data.objects.adm1_boundaries).features;

                    for (item of dataFeatures) {

                        // IDPsData is DTM data passed from model.js where this function is called.
                        // IDPsData has number of IDPs, households, countyr and admin1 names
                        for (const idp of idpsData) {

                            // Since we have differetn json files and all files could have differnt column name
                            // so we have to check it with hasownproperty. If so then add a property 'idpsNumber'
                            if (item.properties.hasOwnProperty("admin1Pcod")) {
                                if (item.properties.admin1Pcod === idp['#adm1+code']) {
                                    let number = idp["#population+idps+ind"];
                                    number = number === undefined ? 0 : number;
                                    item.properties.idpsNumber = number;
                                }
                            }
                            if (item.properties.hasOwnProperty("ADM1_PCODE")) {
                                if (item.properties.ADM1_PCODE === idp['#adm1+code']) {
                                    let number = idp["#population+idps+ind"];
                                    number = number === undefined ? 0 : number;
                                    item.properties.idpsNumber = number;
                                }
                            }

                            if (item.properties.hasOwnProperty("ADM1_CODE")) {
                                if (item.properties.ADM1_CODE === idp['#adm1+code']) {
                                    let number = idp["#population+idps+ind"];
                                    number = number === undefined ? 0 : number;
                                    item.properties.idpsNumber = number;
                                }
                            }

                            // Add 'CountryNameTemp' and 'Admin1NameTemp' properties for consistency
                            if (item.properties.hasOwnProperty("admin0Name")) {
                                item.properties.CountryNameTemp = item.properties.admin0Name;
                            }

                            if (item.properties.hasOwnProperty("admin1Name")) {
                                item.properties.Admin1NameTemp = item.properties.admin1Name;
                            }

                            if (item.properties.hasOwnProperty("CNTRY_NAME")) {
                                item.properties.CountryNameTemp = item.properties.CNTRY_NAME;
                            }

                            if (item.properties.hasOwnProperty("ADM1_NAME")) {
                                item.properties.Admin1NameTemp = item.properties.ADM1_NAME;
                            }

                            if (item.properties.hasOwnProperty("ADM0_EN")) {
                                item.properties.CountryNameTemp = item.properties.ADM0_EN;
                            }

                            if (item.properties.hasOwnProperty("ADM1_EN")) {
                                item.properties.Admin1NameTemp = item.properties.ADM1_EN;
                            }
                        }

                        // Loop on needs adata and add number of people in need property
                        for (const needs of needsData) {
                            if (item.properties.hasOwnProperty("admin1Pcod")) {
                                if (item.properties.admin1Pcod === needs['#adm1+code']) {
                                    item.properties.needsTemp = needs["#inneed"];
                                }
                            }
                            if (item.properties.hasOwnProperty("ADM1_PCODE")) {
                                if (item.properties.ADM1_PCODE === needs['#adm1+code']) {
                                    item.properties.needsTemp = needs["#inneed"];
                                }
                            }

                            if (item.properties.hasOwnProperty("ADM1_CODE")) {
                                if (item.properties.ADM1_CODE === needs['#adm1+code']) {
                                    item.properties.needsTemp = needs["#inneed"];
                                }
                            }
                        }
                    }                    

                    // Draw number of IDPs on the map
                    baseLayer.append("g")
                        .selectAll("path")
                        .data(dataFeatures)
                        .enter().append("path")
                        .attr("d", path)
                        .attr("class", "countryLayer")
                        .style("fill", function (d, i) {
                            let idpsNumber = 0;
                            idpsNumber = d.properties.idpsNumber;

                            // That means there are no idps in this amdin1
                            if (idpsNumber === undefined || idpsNumber === 0) {
                                return 'white';
                            }
                            else {
                                // return color scale
                                return color(idpsNumber);
                            }
                        })
                        .on("click", function (d) {
                            var x, y, k;

                            if (d && centered !== d) {
                                var centroid = path.centroid(d);

                                x = centroid[0];
                                y = centroid[1];
                                k = 4;
                                centered = d;
                            } else {
                                x = width / 2;
                                y = height / 2;
                                k = 1;
                                centered = null;
                            }

                            baseLayer.transition()
                                .duration(750)
                                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                                .style("stroke-width", 1.5 / k + "px");
                        });                    

                    // Draw circles on the map
                    baseLayer.append("g")
                        .selectAll("circle")
                        .data(dataFeatures)
                        .enter().append("circle")
                        .attr("class", "bubble")
                        .attr("visibility", "hidden")
                        .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
                        .attr("r", function (d, i) {
                            let needs = 0;
                            needs = d.properties.needsTemp;
                            if (needs === undefined)
                                needs = 0;

                            needs = needs / 2;
                            if (d.properties.CountryNameTemp === "Burundi" || d.properties.CountryNameTemp === "Nigeria")
                                needs = needs / 6;

                            if (d.properties.CountryNameTemp === "Cameroon")
                                needs = needs / 2;

                            return radius(needs);
                        })
                        .filter(function (d) {
                            let needs = 0;
                            needs = d.properties.needsTemp;
                            return !(needs === undefined || needs === 0);
                        })
                        .style("fill", function (d) {
                            let needs = 0;
                            needs = d.properties.needsTemp;
                            if (!(needs === undefined || needs === 0))
                                return needsColor(needs);
                        });
                });

                

                // Needs color domain
                var needsColorDomain = needsColor.domain().slice();
                needsColorDomain.splice(-2, 1);

                // Map Legend Needs, in the begining it would be hidden
                //var needsLegendBreaks = ["> 500K", "> 100K", "> 50K", "> 10K", " > 1K", "< 1K"];
                //var legendNeeds = svgLegendNeeds.append("g")
                //    .attr("class", "bubble")
                //    .attr("visibility", "hidden")
                //    .attr("transform", "translate(0,0)")
                //    .attr("width", 140)
                //    .attr("height", 200)
                //    .selectAll("g")
                //    .data(needsColorDomain.reverse())
                //    .enter()
                //    .append("g")
                //    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

                //// Needs colors
                //legendNeeds.append("rect")
                //    .attr("width", 18)
                //    .attr("height", 18)
                //    .style("fill", needsColor);

                //// Needs text
                //legendNeeds.append("text")
                //    .data(needsLegendBreaks)
                //    .attr("fill", "#fff")
                //    .attr("x", 24)
                //    .attr("y", 9)
                //    .attr("dy", ".35em")
                //    .text(function (d) { return d; });
                //var radius = d3.scale.sqrt()
                //    .domain([0, 1e6])
                //    .range([0, 15]);

                // Draw Legends of IDPS and Needs
                var svgLegendNeeds = d3.select("#legendNeeds").append("svg").attr("width", "100px").attr("height", "100px");
               
                var legend = svgLegendNeeds.append("g")
                    .attr("class", "legend")
                    .attr("transform", "translate(50, 50)")
                    .selectAll("g")
                    .data([10000, 20000, 100000])
                    .enter().append("g");

                legend.append("circle")
                    .attr("cy", function (d) { return -radius(d); })
                    .attr("r", function (d, i) {
                        console.log((radius(i)*1000) + 5);
                        return radius(i) * 1000 + 5;
                    });

                legend.append("text")
                    .attr("y", function (d) { return -2 * radius(d); })
                    .attr("dy", "1.3em")
                    .text(d3.format(".1s"));

                // IDPs color domain
                var colorDomain = color.domain().slice();
                colorDomain.splice(-2, 1);

                // IDPs legend container
                var svgLegendIDPs = d3.select("#legendIDPs").append("svg").attr("width", "100px").attr("height", "150px");


                var idpsLegendBreaks = ["> 500K", "> 100K", "> 50K", "> 10K", " > 1K", "< 1K"];
                var legendIDPs = svgLegendIDPs.append("g")
                    .attr("transform", "translate(0,0)")
                    .attr("width", 140)
                    .attr("height", 200)
                    .selectAll("g")
                    .data(colorDomain.reverse())
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

                // Draw rectangles
                legendIDPs.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", color);

                // Draw IDPs legend text
                legendIDPs.append("text")
                    .data(idpsLegendBreaks)
                    .attr("fill", "#fff")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .text(function (d) { return d; });
            });
        });

        // zoom and pan
        const baseLayerZoom = d3.zoom()
            .on('zoom', () => {
                baseLayer.style('stroke-width', `${1.1 / d3.event.transform.k}px`)
                baseLayer.attr('transform', d3.event.transform) // updated for d3 v4
            })

        svg.call(baseLayerZoom);

        // How hide Needs layer and legend
        var rodentsCheckbox = document.querySelector('input[id="needsButton"]');
        rodentsCheckbox.onchange = function () {
            if (this.checked) {
                d3.selectAll(".bubble").attr("visibility", "visible");
            } else {
                d3.selectAll(".bubble").attr("visibility", "hidden");
            }
        };
    }
    ,


}