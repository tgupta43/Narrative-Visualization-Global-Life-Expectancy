// Function to create the visualization
function createScene1(data) {
    console.log("Data for Scene 1:", data); // Add a log to verify data

    const width = 960, height = 500; // Set to standard dimensions
    const svg = d3.select("#visualization").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const projection = d3.geoMercator()
        .scale(150) // Adjust scale for standard dimensions
        .translate([width / 2, height / 1.5]); // Center the map within SVG

    const path = d3.geoPath().projection(projection);

    // Create a map from country names to averaged life expectancy values
    const countryDataMap = new Map();

    data.forEach(d => {
        const countryName = d["Country Name"].trim();
        const lifeExpectancy = parseFloat(d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);

        if (!isNaN(lifeExpectancy)) {
            if (countryDataMap.has(countryName)) {
                const currentData = countryDataMap.get(countryName);
                const count = currentData.count + 1;
                const average = (currentData.sum + lifeExpectancy) / count;
                countryDataMap.set(countryName, { sum: average * count, count: count });
            } else {
                countryDataMap.set(countryName, { sum: lifeExpectancy, count: 1 });
            }
        }
    });

    // Finalize the map with averaged values
    const finalCountryDataMap = new Map();
    countryDataMap.forEach((value, key) => {
        finalCountryDataMap.set(key, value.sum / value.count);
    });

    const values = [...finalCountryDataMap.values()];
    const minLifeExpectancy = d3.min(values);
    const maxLifeExpectancy = d3.max(values);

    console.log("Min Life Expectancy:", minLifeExpectancy);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([minLifeExpectancy, maxLifeExpectancy]);

    // Load world map data
    d3.json("data/world-map.topojson").then(world => {
        console.log("World TopoJSON Data:", world); // Add a log to verify data
        const countries = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;
        console.log("Loaded Countries:", countries);

        // Add countries to the map with color based on life expectancy
        svg.selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                // Find life expectancy for each country
                const countryName = d.properties.NAME; // Using `NAME` property
                const lifeExpectancy = finalCountryDataMap.get(countryName);
                console.log(`Country: ${countryName}, Life Expectancy: ${lifeExpectancy}`); // Log for verification
                return lifeExpectancy !== undefined ? colorScale(lifeExpectancy) : "#000"; // Fill with black if not found
            })
            .attr("stroke", "#fff")
            .on("mouseover", function(event, d) {
                const countryName = d.properties.NAME;
                const lifeExpectancy = finalCountryDataMap.get(countryName);
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .html(`<strong>${countryName}</strong><br>Life Expectancy: ${lifeExpectancy}`);
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("display", "none");
            });

        // Annotations
        const annotations = [
            {
                note: { label: "North America and Europe have higher life expectancies than the other continents. What can be the reason for this? Click next to explore.", title: "Notable Differences Between Continents" },
                x: 50, y: 100, dy: 37, dx: 62
            }
        ];

        const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(annotations);

        d3.select("#annotations")
            .append("svg")
            .attr("width", 200)
            .attr("height", 500)
            .call(makeAnnotations)
            .selectAll(".annotation-connector") // Remove connector lines
            .style("display", "none")
            .selectAll(".annotation-note")
            .style("stroke", "none") // Ensure no stroke
            .style("fill", "none"); // Ensure no fill

        // Create the legend
        const legendWidth = 60; // Increase legend width
        const legendHeight = height / 1.5; // Adjust height for larger legend
        const legend = d3.select("#legend").append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        const legendScale = d3.scaleLinear()
            .domain([minLifeExpectancy, maxLifeExpectancy])
            .range([legendHeight, 0]);

        const legendAxis = d3.axisRight(legendScale)
            .ticks(10)
            .tickSize(5);

        legend.append("g")
            .attr("transform", `translate(${legendWidth - 10}, 0)`)
            .call(legendAxis);

        // Create color blocks for the legend
        const numBlocks = 10;
        const blockHeight = legendHeight / numBlocks;
        legend.selectAll("rect")
            .data(d3.range(minLifeExpectancy, maxLifeExpectancy, (maxLifeExpectancy - minLifeExpectancy) / numBlocks))
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => legendHeight - (i + 1) * blockHeight)
            .attr("width", legendWidth - 5)
            .attr("height", blockHeight)
            .style("fill", d => colorScale(d));

        // Add max and min labels to the legend
        legend.append("text")
            .attr("x", legendWidth + 5)
            .attr("y", 20)
            .attr("text-anchor", "start")
            .attr("font-size", "12px")
            .text("Max: " + maxLifeExpectancy);

        legend.append("text")
            .attr("x", legendWidth + 5)
            .attr("y", legendHeight - 5)
            .attr("text-anchor", "start")
            .attr("font-size", "12px")
            .text("Min: " + minLifeExpectancy);

    }).catch(error => {
        console.error('Error loading or processing TopoJSON data:', error);
    });

    // Handle window resize to adjust the projection
    window.addEventListener('resize', () => {
        const newWidth = svg.node().parentNode.clientWidth;
        const newHeight = svg.node().parentNode.clientHeight;
        svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
        projection.translate([newWidth / 2, newHeight / 1.5]); // Adjust to keep map centered
        svg.selectAll("path").attr("d", path);
    });
}

// Load data and initialize the visualization
d3.csv("data/lifeExpectancy.csv").then(data => {
    console.log("CSV Data Loaded:", data); // Add a log to verify data loading
    createScene1(data);
}).catch(error => {
    console.error('Error loading or processing CSV data:', error);
});
