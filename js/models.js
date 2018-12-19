var Models = {
    getDataDTM: function getDataDTM() {
        url = 'https://proxy.hxlstandard.org/data/004c97/download/africa-dtm-baseline-assessments-topline.objects.json'
        $.getJSON(url, function (data) {
            var totalIdps = 0;
            var totalHH = 0;
            var countriesOld = [];
            var idpsHHByCountryArray = [];
            var countries = {};
            var needsDataChart;

            $.each(data, function (key, val) {
                totalIdps += val["#population+idps+ind"];
                totalHH += val["#population+hh+idps"];
                countriesOld.push(val["#country+name"]);

                if (!countries[val["#country+name"]]) {
                    countries[val["#country+name"]] = 0
                }
                countries[val["#country+name"]] += val["#population+idps+ind"]
            })


            for (var country in countries) {
                idpsHHByCountryArray.push({ country: country, idpsnumber: countries[country] })
            }

            $('#totalNumHH').text(Utility.abbreviateNumber(totalHH)).removeClass("spinner");
            $('#totalNumIDP').text(Utility.abbreviateNumber(totalIdps)).removeClass("spinner");

            var numOfCountries = new Set(countriesOld);

            $('#numOfCountries').text(numOfCountries.size).removeClass("spinner")

            idpsHHByCountryArray.sort(Utility.dynamicSort("idpsnumber"));

            objIndex = idpsHHByCountryArray.findIndex((obj => obj.country == 'Central African Republic'));
            idpsHHByCountryArray[objIndex].country = 'CAR';

            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MDG52'));
            data[objIndex]["#adm1+code"] = "MG52";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI01'));
            data[objIndex]["#adm1+code"] = "ML01";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI02'));
            data[objIndex]["#adm1+code"] = "ML02";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI03'));
            data[objIndex]["#adm1+code"] = "ML03";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI04'));
            data[objIndex]["#adm1+code"] = "ML04";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI05'));
            data[objIndex]["#adm1+code"] = "ML05";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI06'));
            data[objIndex]["#adm1+code"] = "ML06";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI07'));
            data[objIndex]["#adm1+code"] = "ML07";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI08'));
            data[objIndex]["#adm1+code"] = "ML08";
            objIndex = data.findIndex((obj => obj["#adm1+code"] == 'MLI09'));
            data[objIndex]["#adm1+code"] = "ML09";

            // Map

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
            d3.json("data/geo/topojson/africa_admin0.json").then(function (africaJson) {

                baseLayer.append("g")
                    .attr("class", "baseLayer")
                    .selectAll("path")
                    .data(topojson.feature(africaJson, africaJson.objects.africa_admin0).features)
                    .enter().append("path")
                    .attr("d", path)
            });


            // IDPs color on the map
            var color = d3.scaleThreshold()
                .domain([1, 1001, 10001, 50001, 100001, 500001, 1000001])
                .range(["#fff", "#afdbe1", "#9fd4db", "#7ec6cf", "#5fb8c3", "#4c939c", "#396e75"]);

            // Needs data color on the map
            //var needsColor = d3.scaleThreshold()
            //    .domain([1, 1001, 10001, 50001, 100001, 500001, 1000001])
            //    .range(["#fff", "#dddd81", "#d7d76c", "#d2d256", "#cccc42", "#c7c72d", "#b3b328"]);

            // The radius for needs data circles.
            var radius = d3.scaleSqrt()
                .domain([0, 500000])
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
                    needsDataChart = needsData;
                    // Loop on each Admin1-Boundaries data and add 'number of IDPs', countyr and admin1 name in the json
                    jsonData.forEach(function (jsonData) {
                        var dataFeatures = topojson.feature(jsonData, jsonData.objects.adm1_boundaries).features;

                        for (item of dataFeatures) {

                            // IDPsData is DTM data passed from model.js where this function is called.
                            // IDPsData has number of IDPs, households, countyr and admin1 names
                            for (const idp of data) {

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
                            .on("mouseout", function () {
                                document.getElementById('summary').innerHTML = '';
                                return document.getElementById('summaryHeader').classList.add("d-none");
                            })
                            .on('mouseover', function (d) {
                                document.getElementById('summaryHeader').classList.remove("d-none");
                                let idps = '-';

                                if (d.properties.idpsNumber)
                                    idps = d.properties.idpsNumber;

                                let needs = '-';
                                if (d.properties.needsTemp)
                                    needs = d.properties.needsTemp;

                                let summaryHTML = `<div class="col-12 mt-2">                                                
                                                    <span class="text-custom1 display-5" > ` + d.properties.Admin1NameTemp + `</span >    
                                                    <span class="text-white" ><small>` + d.properties.CountryNameTemp + `</small></span >
                            </div>
                             
                            <div class="col-12 mt-2">
                                <span class="text-custom1 display-5" >` + idps + `</span >
                                    <span class="text-white"><small>IDPs</small></span>
                            </div>
                            <div class="col-12 mt-2">
                                <span class="text-custom1 display-5" >` + needs + `</span >
                                    <span class="text-white"><small>PIN</small></span>
                            </div >`
                                return document.getElementById('summary').innerHTML = summaryHTML;
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
                                return radius(needs);
                            })
                            .filter(function (d) {
                                let needs = 0;
                                needs = d.properties.needsTemp;
                                return !(needs === undefined || needs === 0);
                            })
                            .style("fill", "#c7c72d");
                    });

                    // Map Legend Needs, in the begining it would be hidden
                    var needsLegendBreaks = ["> 300K", "> 100K", "> 10K"];
                    // Draw Legends of IDPS and Needs
                    var svgLegendNeeds = d3.select("#legendNeeds").append("svg").attr("width", "100px").attr("height", "100px");

                    var legendNeeds = svgLegendNeeds.append("g")
                        .attr("class", "legend bubble")
                        .attr("visibility", "hidden")
                        .attr("transform", "translate(10, 10)")
                        .selectAll("g")
                        .data([300001, 100001, 10001])
                        .enter().append("g")
                        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });;

                    legendNeeds.append("circle")
                        .attr("cx", 0)
                        .attr("r", function (d) {
                            return radius(d) * 5;
                        });

                    legendNeeds.append("text")
                        .data(needsLegendBreaks)
                        .attr("x", 12)
                        .attr("dy", ".35em")
                        .text(function (d) { return d; });

                    // IDPs color domain
                    var colorDomain = color.domain().slice();
                    colorDomain.splice(-2, 1);

                    // IDPs legend container
                    var svgLegendIDPs = d3.select("#legendIDPs").append("svg").attr("width", "100px").attr("height", "150px");

                    var idpsLegendBreaks = ["> 500K", "> 100K", "> 50K", "> 10K", " > 1K", "< 1K"];
                    var legendIDPs = svgLegendIDPs.append("g")
                        .attr("transform", "translate(0,0)")
                        .attr("class", "legend")
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
                        .attr("x", 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .text(function (d) { return d; });

                    Charts.drawIDPsByCountryChart(idpsHHByCountryArray, needsData, 0)

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
                            Charts.drawIDPsByCountryChart(idpsHHByCountryArray, needsData, 1)
                        } else {
                            d3.selectAll(".bubble").attr("visibility", "hidden");
                            Charts.drawIDPsByCountryChart(idpsHHByCountryArray, needsData, 0)
                        }
                    };
                });
            });
            $('#map').removeClass("spinner");

        }).fail(function () {
            console.log("error");
        });
    }
}