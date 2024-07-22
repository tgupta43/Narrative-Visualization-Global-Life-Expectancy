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

    // Calculate max life expectancy
    const maxLifeExpectancy = d3.max(data, d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxLifeExpectancy || 100]);

    // Create a map from country names to life expectancy values
    const countryDataMap = new Map();
    data.forEach(d => {
        countryDataMap.set(d["Country Name"], d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    });

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
                const countryName = d.properties.name; // Assuming `d.properties.name` is the country name
                const lifeExpectancy = countryDataMap.get(countryName);
                return colorScale(lifeExpectancy || 0);
            })
            .attr("stroke", "#fff");

        // Define and add annotations
        const annotations = [{
            note: {
                label: "Global average life expectancy has increased significantly.",
                align: "left"
            },
            x: width / 2,
            y: height / 2,
            dx: 10,
            dy: 50,
            subject: {
                radius: 10,
                radiusPadding: 10
            }
        }];

        const makeAnnotations = d3.annotation()
            .annotations(annotations);

        svg.append("g")
            .call(makeAnnotations);

        // Create the legend
        const legendWidth = 40;
        const legendHeight = height / 1.5;
        const legend = d3.select("#legend").append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        const legendScale = d3.scaleLinear()
            .domain([0, maxLifeExpectancy || 100])
            .range([legendHeight, 0]);

        const legendAxis = d3.axisRight(legendScale)
            .ticks(10)
            .tickSize(5);

        legend.append("g")
            .attr("transform", `translate(${legendWidth - 10}, 0)`)
            .call(legendAxis);

        legend.selectAll("rect")
            .data(d3.range(0, maxLifeExpectancy || 100, (maxLifeExpectancy || 100) / 10))
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", d => legendHeight - (d / (maxLifeExpectancy || 100)) * legendHeight)
            .attr("width", legendWidth - 5)
            .attr("height", (d, i) => i === 0 ? 0 : (d / (maxLifeExpectancy || 100)) * legendHeight - ((d - (maxLifeExpectancy || 100) / 10) / (maxLifeExpectancy || 100)) * legendHeight)
            .style("fill", d => colorScale(d));

        // Add max and min labels to the legend
        legend.append("text")
            .attr("x", legendWidth + 5)
            .attr("y", 20)
            .attr("text-anchor", "start")
            .attr("font-size", "12px")
            .text("Max: " + (maxLifeExpectancy));

        legend.append("text")
            .attr("x", legendWidth + 5)
            .attr("y", legendHeight - 5)
            .attr("text-anchor", "start")
            .attr("font-size", "12px")
            .text("Min: 0");
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
    data.forEach(d => {
        d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"] = +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"];
    });

    createScene1(data);
}).catch(error => {
    console.error('Error loading or processing CSV data:', error);
});
