var Maps = {

    drawMapDTM: function drawMapDTM(idpsData) {

        var vW = window.innerWidth;

        var svgWidth = 600;
        if (vW < 1000 && vW > 980)
            svgWidth = 550;
        else if (vW < 980)
            svgWidth = 750;

        var svgHeight = 420;

        var svg = d3.select("#map").append("svg").attr("width", svgWidth).attr("height", svgHeight);

        var margin = { top: 0, right: 0, bottom: 0, left: 0 };
        var width = svg.attr("width") - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        var projection = d3.geoMercator()
            .center([0, 0])
            .scale(300)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath().projection(projection);

        // Base map layer group
        var baseLayer = svg.append("g");

        // Africa Countries Layer as BaseLayer
        var url = "data/geo/topojson/africa_admin0.json";

        // Draw Base Layer
        d3.json(url).then(function (data) {
            var boundaries = topojson.feature(data, data.objects.africa_admin0);
            baseLayer.append("g")
                .attr("class", "baseLayer")
                .selectAll("path")
                .data(boundaries.features)
                .enter().append("path")
                .attr("d", path)
        });

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var color = d3.scaleThreshold()
            .domain([1, 1001, 10001, 50001, 100001, 500001, 1000001])
            .range(["#fff", "#ede5f2", "#c9b2d9", "#a57fc0", "#814ca7", "#5d198e", "#4b0082"]);

        var needsColor = d3.scaleThreshold()
            .domain([1, 1001, 10001, 50001, 100001, 500001, 1000001])
            .range(["#fff", "#ebb9b9", "#e5a2a2", "#de8b8b", "#d15c5c", "#cb4545", "#be1717"]);

        var countryLayer = svg.append("g").attr("class", "countryLayer");
        var needsLayer = svg.append("g").attr("class", "bubble").attr("visibility", "hidden");

        var files = [
            "data/geo/topojson/bdi_adm1.json",
            "data/geo/topojson/caf_adm1.json",
            "data/geo/topojson/cmr_adm1.json",
            "data/geo/topojson/lby_adm1.json",
            "data/geo/topojson/mdg_adm1.json",
            "data/geo/topojson/mli_adm1.json",
            "data/geo/topojson/nga_adm1.json"
        ];

        var promises = [];

        files.forEach(function (url) {
            promises.push(d3.json(url))
        });

        Promise.all(promises).then(function (values) {
            //console.log(values);

            Promise.resolve(d3.csv("data/mli_hno_2018.csv")).then(function (needsData) {

                values.forEach(function (data, index, array) {
                    var dataFeatures = topojson.feature(data, data.objects.adm1_boundaries).features;

                    //console.log(dataFeatures);

                    for (item of dataFeatures) {
                        //console.log(item);
                        var j = 0;
                        for (const idp of idpsData) {
                            if (item.properties.hasOwnProperty("admin1Pcod")) {
                                if (item.properties.admin1Pcod === idp['#adm1+code']) {
                                    item.properties.idpsNumber = idp["#population+idps+ind"];
                                }
                            }
                            if (item.properties.hasOwnProperty("ADM1_PCODE")) {
                                if (item.properties.ADM1_PCODE === idp['#adm1+code']) {
                                    item.properties.idpsNumber = idp["#population+idps+ind"];
                                }
                            }

                            if (item.properties.hasOwnProperty("ADM1_CODE")) {
                                if (item.properties.ADM1_CODE === idp['#adm1+code']) {
                                    item.properties.idpsNumber = idp["#population+idps+ind"];
                                }
                            }

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

                        //if (item.properties.hasOwnProperty("admin0Name")) {
                        //    //console.log('has property');
                        //    if (item.properties.admin0Name === "Mali") {
                        //        //console.log(idp["#population+idps+ind"]);
                        //        console.log(item.properties);
                        //        //console.log(j);
                        //    }
                        //}
                    }

                    var radius = d3.scaleSqrt()
                        .domain([0, 10000])
                        .range([0, 2]);

                    countryLayer.append("g")
                        .selectAll("path")
                        .data(dataFeatures)
                        .enter().append("path")
                        .attr("d", path)
                        .style("fill", function (d, i) {
                            let idpsNumber = 0;
                            idpsNumber = d.properties.idpsNumber;
                            if (idpsNumber === undefined || idpsNumber === 0)
                                return 'white';
                            return color(idpsNumber);
                            
                        })
                        .on("mouseover", function (d, i) {
                            tooltip.transition()
                                .duration(200)
                                .style("opacity", .9);
                            //tooltip.html(dataFeatures[i].properties.idpsNumber)
                            tooltip.html(`<div class="card bg-warning" style="width: 12rem;">

                    <div class=text-center><h4>` + dataFeatures[i].properties.CountryNameTemp + `</h4><h5>` + dataFeatures[i].properties.Admin1NameTemp + `</h5></div>
       <ul class="list-unstyled ml-2"><li><div>Households : ` + dataFeatures[i].properties.idpsNumber + `</div></li>
                    <li><div>IDPs : ` + dataFeatures[i].properties.idpsNumber + `</div>
                    </li>
                </div>`)

                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 28) + "px");
                        })
                        .on("mouseout", function (d) {
                            tooltip.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });

                    var centroids = dataFeatures.map(function (feature) {
                        return path.centroid(feature);
                    });

                    //needsLayer.selectAll(".centroid").data(centroids)
                    //    .enter().append("circle")
                    //    .attr("class", "centroid")
                    //    .attr("fill", "red")
                    //    .attr("stroke", "black")
                    //    .attr("stroke-width", 0.1)
                    //    .attr("r", 8)
                    //    .attr("cx", function (d) { return d[0]; })
                    //    .attr("cy", function (d) { return d[1]; });

                    //needsLayer.append("g")
                    //    //.attr("class", "bubble")
                    //    .selectAll("circle")
                    //    .data(dataFeatures)
                    //    .enter().append("circle")
                    //    .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
                    //    .attr("r", function (d, i) {
                    //        let needs = 0;
                    //        needs = dataFeatures[i].properties.needsTemp;
                    //        if (needs === undefined)
                    //            needs = 0;
                    //        return radius(needs);
                    //        //console.log(dataFeatures[i].properties.CountryNameTemp + " - " + dataFeatures[i].properties.Admin1NameTemp + " - " + dataFeatures[i].properties.needsTemp);
                    //        //return 1;
                    //    });

                    //svg.append("path")
                    //    .datum(topojson.merge(us, us.objects.states.geometries.filter(d => d.id > 25)))
                    //    .attr("fill", "#ddd")
                    //    .attr("d", d3.geoPath());

                    //needsLayer.append("path")
                    //    //.selectAll("path")
                    //    //.datum(topojson.merge(us, us.objects.states.geometries.filter(d => d.id > 25)))
                    //    .datum(function (d, i) {
                    //        //console.log(dataFeatures[i].properties);
                    //        dataFeatures[i].properties.filter(d => d.CountryNameTemp !== 'Mali' || d.CountryNameTemp !== 'mali')
                    //    })
                    //    //.enter().append("path")
                    //    .attr("d", d3.geoPath())
                    //    .style("fill", "red")

                    needsLayer.append("g")
                        .selectAll("path")
                        .data(dataFeatures)
                        .enter().append("path")
                        .filter(function (d) {
                            let needs = 0;
                            needs = d.properties.needsTemp;
                            return !(needs === undefined || needs === 0);
                        })
                        .attr("d", path)
                        .style("fill", function (d) {
                            let needs = 0;
                            needs = d.properties.needsTemp;
                            if (!(needs === undefined || needs === 0))
                                return needsColor(needs);
                        });
                        
                });

                var colorDomain = color.domain().slice();
                colorDomain.splice(-2, 1);

                // Map Legend
                var legendText = ["> 500K", "> 100K", "> 50K", "> 10K", " > 1K", "< 1K"];
                var legend = svg.append("g")
                    .attr("transform", "translate(0,0)")
                    .attr("width", 140)
                    .attr("height", 200)
                    .selectAll("g")
                    .data(colorDomain.reverse())
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

                legend.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", color);

                legend.append("text")
                    .data(legendText)
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .text(function (d) { return d; });


                // Needs color domain
                var needsColorDomain = needsColor.domain().slice();
                needsColorDomain.splice(-2, 1);

                // Map Legend
                var legendText2 = ["> 500K", "> 100K", "> 50K", "> 10K", " > 1K", "< 1K"];
                var legend2 = svg.append("g")
                    .attr("class", "bubble")
                    .attr("visibility", "hidden")
                    .attr("transform", "translate(0,150)")
                    .attr("width", 140)
                    .attr("height", 200)
                    .selectAll("g")
                    .data(needsColorDomain.reverse())
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

                legend2.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", needsColor);

                legend2.append("text")
                    .data(legendText2)
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .text(function (d) { return d; });
            });
        });

        //var needsPromises = [];

        ////files.forEach(function (url) {
        //    needsPromises.push(d3.csv("data/mli_hno_2018.csv"))
        ////});

        //Promise.all(needsPromises).then(function (values) {
        //    console.log(values);

        //values.forEach(function (data, index, array) {
        //    var dataFeatures = topojson.feature(data, data.objects.adm1_boundaries).features;
        //});

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