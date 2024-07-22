// Function to create the visualization
function createScene1(data) {
    console.log("Data for Scene 1:", data); // Add a log to verify data

    const initialWidth = 1260, initialHeight = 700;
    const svg = d3.select("#visualization").append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `0 0 ${initialWidth} ${initialHeight}`);

    const projection = d3.geoMercator()
        .scale(75) // Adjust scale to make the map smaller
        .translate([initialWidth / 2, initialHeight / 1.5]); // Initial translation to center the map

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
            x: initialWidth / 2,
            y: initialHeight / 2,
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

        svg.append("text")
            .attr("id", "map-title") // Add an ID for easier selection in CSS
            .attr("x", initialWidth / 2)
            .attr("y", 30) // Adjust y position for better visibility
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .text("Global Life Expectancy");

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
        svg.select("#map-title").attr("x", newWidth / 2); // Adjust title position on resize
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
