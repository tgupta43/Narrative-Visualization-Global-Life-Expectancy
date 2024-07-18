// Load the data
d3.csv('data/GlobalLandTemperaturesByCountry.csv').then(function(data) {
    // Parse dates and convert temperature to number
    var parseDate = d3.timeParse('%Y-%m-%d');
    data.forEach(function(d) {
        d.dt = parseDate(d.dt); // Parse date string to Date object
        d.AverageTemperature = +d.AverageTemperature; // Convert temperature to numeric
    });

    // Group data by year and calculate average temperature
    var dataByYear = d3.nest()
        .key(function(d) { return d.dt.getFullYear(); }) // Group by year
        .rollup(function(v) {
            return d3.mean(v, function(d) { return d.AverageTemperature; }); // Calculate average temperature
        })
        .entries(data);

    // Convert dataByYear format to match original data structure
    var averagedData = dataByYear.map(function(d) {
        return {
            dt: new Date(d.key, 0, 1), // Create a Date object for January 1st of each year
            AverageTemperature: d.value // Average temperature for the year
        };
    });

    console.log(averagedData); // Check the averaged data in console

    // Proceed with drawing the chart using averagedData
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
        .domain(d3.extent(averagedData, function(d) { return d.dt; }))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(averagedData, function(d) { return d.AverageTemperature; })) // Set domain to averagedData
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
        .x(function(d) { return x(d.dt); })
        .y(function(d) { return y(d.AverageTemperature); });

    svg.append('path')
        .datum(averagedData)
        .attr('class', 'line')
        .attr('d', line);
}).catch(function(error) {
    console.log('Error loading data:', error);
});
