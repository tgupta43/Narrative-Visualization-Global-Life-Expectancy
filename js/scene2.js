// Load the CO2 emissions data
d3.csv('data/co2_emission.csv').then(function(data) {
    // Log the raw data
    console.log('Raw data:', data);

    // Parse dates and convert CO2 emissions to number
    var parseDate = d3.timeParse('%Y'); // Adjust this format as needed
    data.forEach(function(d) {
        d.Year = parseDate(d.Year); // Parse date string to Date object
        d.CO2Emissions = +d.CO2Emissions; // Convert CO2 emissions to numeric
        console.log('Parsed row:', d.Year, d.CO2Emissions);
    });

    // Filter out invalid data points
    var filteredData = data.filter(function(d) {
        var isValid = d.Year instanceof Date && !isNaN(d.CO2Emissions);
        if (!isValid) {
            console.log('Invalid row:', d);
        }
        return isValid;
    });

    // Log the filtered data
    console.log('Filtered data:', filteredData);

    // If filteredData is empty, log an error message
    if (filteredData.length === 0) {
        console.error('Filtered data is empty. Please check the data format and parsing logic.');
        return;
    }

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
        .domain(d3.extent(filteredData, function(d) { return d.Year; }))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(filteredData, function(d) { return d.CO2Emissions; }))
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
        .y(function(d) { return y(d.CO2Emissions); });

    svg.append('path')
        .datum(filteredData)
        .attr('class', 'line')
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5);
}).catch(function(error) {
    console.log('Error loading CO2 emissions data:', error);
});

// Handle button click to navigate to Scene 3
document.getElementById('scene3-button').addEventListener('click', function() {
    window.location.href = 'scene3.html'; // Navigate to Scene 3
});
