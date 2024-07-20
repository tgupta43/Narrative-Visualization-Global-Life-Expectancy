// Load the sea level data
d3.csv('data/seaLevel.csv').then(function(data) {
    // Log the raw data
    console.log('Raw data:', data);

    // Parse dates and convert sea level to number
    var parseDate = d3.timeParse('%Y-%m-%d');
    data.forEach(function(d) {
        d.Time = parseDate(d.Time); // Parse date string to Date object
        d.SeaLevel = +d.SeaLevel; // Convert sea level to numeric
    });

    // Log the parsed data
    console.log('Parsed data:', data);

    // Filter out invalid data points
    var filteredData = data.filter(function(d) {
        return d.Time instanceof Date && !isNaN(d.Time) && !isNaN(d.SeaLevel);
    });

    // Log the filtered data
    console.log('Filtered data:', filteredData);

    // Proceed with drawing the chart using filteredData
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
        .domain(d3.extent(filteredData, function(d) { return d.Time; }))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(filteredData, function(d) { return d.SeaLevel; }))
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
        .x(function(d) { return x(d.Time); })
        .y(function(d) { return y(d.SeaLevel); });

    svg.append('path')
        .datum(filteredData)
        .attr('class', 'line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5);
}).catch(function(error) {
    console.log('Error loading sea level data:', error);
});
