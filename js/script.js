// Function to create the visualization
function createScene1(data) {
    console.log("Data for Scene 1:", data); // Add a log to verify data

    const width = 1260, height = 700; // Set initial dimensions
    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const projection = d3.geoMercator()
        .scale(65) // Adjust scale for proper fit
        .translate([width / 2, height / 1.5]); // Center the map within SVG

    const path = d3.geoPath().projection(projection);

    const maxLifeExpectancy = d3.max(data, d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxLifeExpectancy || 100]);

    d3.json("data/world-map.topojson").then(world => {
        console.log("World TopoJSON Data:", world); // Add a log to verify data
        const countries = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;
        console.log("Loaded Countries:", countries);

        svg.selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", (d, i) => {
                const testLifeExpectancy = Math.random() * maxLifeExpectancy;
                return colorScale(testLifeExpectancy);
            })
            .attr("stroke", "#fff");

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

        // No title appending here as title is in HTML

        // Create the legend
        const legendWidth = 20;
        const legendHeight = 200;
        const legendMargin = 10;
        const legend = d3.select("#legend").append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        const legendScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, maxLifeExpectancy || 100]);

        const legendAxis = d3.axisRight(d3.scaleLinear()
            .domain([0, maxLifeExpectancy || 100])
            .range([legendHeight, 0]))
            .tickSize(5)
            .ticks(10);

        legend.append("g")
            .attr("transform", `translate(${legendMargin}, 0)`)
            .call(legendAxis);

        legend.selectAll("rect")
            .data(d3.range(0, maxLifeExpectancy || 100, (maxLifeExpectancy || 100) / 10))
            .enter().append("rect")
            .attr("x", legendMargin - 10)
            .attr("y", d => legendHeight - legendHeight * (d / (maxLifeExpectancy || 100)))
            .attr("width", 10)
            .attr("height", d => legendHeight * (d / (maxLifeExpectancy || 100)))
            .style("fill", d => colorScale(d));
        
    }).catch(error => {
        console.error('Error loading or processing TopoJSON data:', error);
    });

    // Handle window resize to adjust the projection
    window.addEventListener('resize', () => {
        const newWidth = svg.node().parentNode.clientWidth;
        const newHeight = svg.node().parentNode.clientHeight;
        svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
        projection.translate([newWidth / 2, newHeight / 1.5]);
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
