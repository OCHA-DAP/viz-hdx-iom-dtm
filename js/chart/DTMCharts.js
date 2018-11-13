var Charts = {

    drawIDPsByCountryChart: function drawIDPsByCountryChart(data) {

        // Sort the array
        //data.sort(function (a, b) { return a.IDPs - b.IDPs; });

        var vW = $(window).width();

        var svgWidth = 350;


        //if (vW < 576)
        //    svgWidth = 250;
        //else if (vW < 768)
        //    svgWidth = 300;



        // Add svg main container
        var svg = d3.select("#chart").append("svg").attr("width", svgWidth).attr("height", 300);

        // Margins
        var margin = { left: 80, top: 10, right: 30, bottom: 30 };
        var width = svg.attr("width") - margin.left - margin.right;
        var height = svg.attr("height") - margin.top - margin.bottom;

        // Create a container to group chart, and axis
        var chart = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //// Create scale
        // x scale which will be number of IDPs
        var x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.idpsnumber)])
            .range([0, width]);

        //  x scale whic hwill be countries so scale band
        var y = d3.scaleBand()
            .domain(data.map(d => d.country))
            .range([height, 0])
            .padding(0.1);

        //// Create Axis
        // X axis which will be number of Idps and on x scale and set it on height
        chart.append("g")
            .call(d3.axisBottom(x).tickValues(x.ticks(3).concat(x.domain())).tickFormat(d3.formatPrefix(".1", 1e8)))
            .attr("transform", "translate(0," + height + ")");

        // Y axis which will be number of IDPs and on y scale
        chart.append("g")
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Draw chart
        var bars = chart.selectAll("rec")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.country)) // countries
            .attr("width", d => x(d.idpsnumber)) // IDPs
            .attr("height", y.bandwidth());
    }
}