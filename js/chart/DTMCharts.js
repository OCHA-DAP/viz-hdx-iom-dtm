var Charts = {

    drawIDPsByCountryChart: function drawIDPsByCountryChart(data) {

        // Sort the array
        //data.sort(function (a, b) { return a.IDPs - b.IDPs; });
        var centered;

        var vW = window.innerWidth;

        var svgWidth = 350;
        if (vW < 1000 && vW > 980)
            svgWidth = 300;
        else if (vW < 980)
            svgWidth = 500;

        var svgHeight = 420;

        // Add svg main container
        var svg = d3.select("#chart").append("svg").attr("width", svgWidth).attr("height", svgHeight);

        // Margins
        var margin = { left: 80, top: 10, right: 30, bottom: 30 };
        var width = svg.attr("width") - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        // Create a container to group chart, and axis
        var chart = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // tooltips
        var div = d3.select("#chart").append('div').attr("class", "tooltip1").style("opacity", 0);

        //// Create scale
        // x scale which will be number of IDPs
        var x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.idpsnumber)])
            .range([1, width]);

        //  x scale whic hwill be countries so scale band
        var y = d3.scaleBand()
            .domain(data.map(d => d.country))
            .range([height, 0])
            .padding(0.1);
            

        //// Create Axis
        // X axis which will be number of Idps and on x scale and set it on height
        chart.append("g")
            .call(d3.axisBottom(x).tickValues(x.ticks(3).concat(x.domain())).tickFormat(d3.formatPrefix(".1", 1e8)))
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axisColor");

        // Y axis which will be number of IDPs and on y scale
        chart.append("g")
            .call(d3.axisLeft(y).tickSizeOuter(0))
            .attr("class", "axisColor");

        // Draw chart
        var bars = chart.selectAll("rec")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.country)) // countries
            .attr("width", d => x(d.idpsnumber)) // IDPs
            .attr("height", y.bandwidth())
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click);

        // Add label on the bars
        chart.append("g")
            .attr("fill", "black")
            //.attr("text-anchor", "end")
            .style("font", "12px sans-serif")
            .selectAll("text")
            .data(data)
            .enter().append("text")
            .attr("x", function (d, i) {
                if (x(d.idpsnumber) < 60) {
                    return x(d.idpsnumber) + 4;
                }
                else {
                    return x(d.idpsnumber) - 40;
                }

            })
            .attr("y", d => y(d.country) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .text(d => Utility.abbreviateNumber(d.idpsnumber))
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", click);

        function mouseover(d) {
            div.transition()
                .duration(50)
                .style("opacity", .9);
            div.html(`<div class="card bg-warning" style="width: 12rem;">
                    
                    <div class=text-center><b>` + d.country + `</b></div>
       <ul class="list-unstyled ml-2"><li><div>Households : ` + d.idpsnumber + `</div></li>
                    <li><div>IDPs : ` + d.idpsnumber + `</div>
                    <ul><li>Male: 29%</li>
                                    <li>Children: 55%</li>
                    <li>Female: 38%</li>
                    </ul></li>
                </div>`)
                .style("left", x(d.idpsnumber) + "px")
                .style("top", (y(d.country) - 95) + "px")

        }

        function mouseout(d) {
            console.log(div);
            div.transition()
                .duration(200)
                .style("opacity", 0);
        }

        function click(d) {
            var baseLayer = d3.select(".test1");
            var x, y, k;

            if (d && centered !== d) {
                var centroid = [382.6978911335704, 58.38692777016687];

                x = centroid[0];
                y = centroid[1];
                k = 4;
                centered = d;
            } else {
                x = 300;
                y = 210;
                k = 1;
                centered = null;
            }

            //baseLayer.selectAll("path")
            //    .classed("active", centered && function (d) { return d === centered; });

            console.log(baseLayer)
            baseLayer.transition()
                .duration(750)
                .attr("transform", "translate(" + 600 / 2 + "," + 420 / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .style("stroke-width", 1.5 / k + "px");
        }
    }
}