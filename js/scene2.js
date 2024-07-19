// Load the sea level data
d3.csv('data/seaLevel.csv').then(function(data) {
    // Parse dates and convert sea level to number
    var parseDate = d3.timeParse('%Y-%m-%d');
    data.forEach(function(d) {
        d.Year = parseDate(d.Year); // Parse date string to Date object
        d.SeaLevel = +d.SeaLevel; // Convert sea level to numeric
    });

    // Proceed with drawing the chart
    var margin = { top: 20, right: 30, bottom: 30, left: 60 },
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Define scales
    var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.Year; }))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.SeaLevel; }))
        .nice()
        .range([height, 0]);

    // Define axes
    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    // Draw X axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // Draw Y axis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // Draw line chart
    var line = d3.line()
        .x(function(d) { return x(d.Year); })
        .y(function(d) { return y(d.SeaLevel); });

    svg.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', line);
}).catch(function(error) {
    console.log('Error loading sea level data:', error);
});
