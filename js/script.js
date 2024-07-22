// Function to create the visualization
function createScene1(data) {
    console.log("Data for Scene 1:", data); // Add a log to verify data

    const width = 800, height = 600; // Adjust size for better fit
    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const projection = d3.geoMercator()
        .scale(65) // Adjust scale for proper fit
        .translate([width / 2, height / 2]); // Center the map within SVG

    const path = d3.geoPath().projection(projection);

    // Calculate min and max life expectancy
    const lifeExpectancies = data.map(d => +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]).filter(value => !isNaN(value));
    const minLifeExpectancy = d3.min(lifeExpectancies.filter(val => val > 0)) || 0; // Exclude zero
    const maxLifeExpectancy = d3.max(lifeExpectancies) || 100;

    console.log("Min Life Expectancy:", minLifeExpectancy);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([minLifeExpectancy, maxLifeExpectancy]);

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

    console.log("Final Country Data Map:", [...finalCountryDataMap.entries()]); // Log the map for verification

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
                return lifeExpectancy < minLifeExpectancy ? "black" : colorScale(lifeExpectancy);
            })
            .attr("stroke", "#fff");

        // Create the legend
        const legendWidth = 40;
        const legendHeight = height / 1.5;
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

        legend.selectAll("rect")
            .data(d3.range(minLifeExpectancy, maxLifeExpectancy, (maxLifeExpectancy - minLifeExpectancy) / 10))
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", d => legendHeight - (d - minLifeExpectancy) / (maxLifeExpectancy - minLifeExpectancy) * legendHeight)
            .attr("width", legendWidth - 5)
            .attr("height", (d, i) => i === 0 ? 0 : (d - minLifeExpectancy) / (maxLifeExpectancy - minLifeExpectancy) * legendHeight - ((d - (maxLifeExpectancy - minLifeExpectancy) / 10) - minLifeExpectancy) / (maxLifeExpectancy - minLifeExpectancy) * legendHeight)
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
        projection.translate([newWidth / 2, newHeight / 2]);
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
