// Function to create the visualization
function createScene1(data) {
    console.log("Data for Scene 1:", data); // Add a log to verify data

    const width = 1260, height = 700; // Adjust if necessary
    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Set up projection and path
    const projection = d3.geoMercator()
        .scale(65) // Adjust scale for proper fit
        .translate([width / 2, height / 2]); // Center the map

    const path = d3.geoPath().projection(projection);

    // Find the max life expectancy value
    const maxLifeExpectancy = d3.max(data, d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxLifeExpectancy || 100]);

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
                const lifeExpectancy = data.find(item => item.Country === d.properties.name)?.["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"] || 0;
                return colorScale(lifeExpectancy);
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

        // Add title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .text("Global Life Expectancy");

        // Add legend
        const legendWidth = 200;
        const legendHeight = height / 1.5;

        const legend = d3.legendColor()
            .scale(colorScale)
            .labels(colorScale.ticks().map(d => Math.round(d)))
            .shapeWidth(30)
            .orient('vertical');

        svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - legendWidth - 30}, 50)`) // Adjust position as needed
            .call(legend);

    }).catch(error => {
        console.error('Error loading or processing TopoJSON data:', error);
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
