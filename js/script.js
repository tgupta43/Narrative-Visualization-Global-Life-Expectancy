// Function to create the visualization
function createScene1(data) {
    const width = 960, height = 500; // Adjust if necessary
    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define the projection with adjusted scale and translation
    const projection = d3.geoMercator()
        .scale(150) // Adjust scale for proper fit
        .translate([width / 2, height / 2]); // Center the map within SVG

    const path = d3.geoPath().projection(projection);

    // Find the max life expectancy value to set the domain of the color scale
    const maxLifeExpectancy = d3.max(data, d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxLifeExpectancy || 100]);

    // Load world map data
    d3.json("data/world-map.topojson").then(world => {
        const countries = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;
        console.log("Loaded Countries:", countries.length);

        // Append paths for each country
        svg.selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", (d, i) => {
                // Assign a random life expectancy value for testing
                const testLifeExpectancy = Math.random() * maxLifeExpectancy;
                console.log(`Test Value for Country: ${d.id}, Test Life Expectancy: ${testLifeExpectancy}`);
                return colorScale(testLifeExpectancy);
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

        // Create annotation object
        const makeAnnotations = d3.annotation()
            .annotations(annotations);

        // Add annotations to the SVG
        svg.append("g")
            .call(makeAnnotations);

        // Add a title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 40) // Position the title above the map
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .text("Global Life Expectancy");

    }).catch(error => {
        console.error('Error loading or processing data:', error);
    });
}
