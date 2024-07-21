// Function to create the visualization
function createScene1(data) {
    const width = 960, height = 500;
    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(data, d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]) || 100]);

    // Load world map data
    d3.json("data/world-map.topojson").then(world => {
        // Log the world data to check its structure
        console.log(world);

        svg.selectAll("path")
            .data(topojson.feature(world, world.objects.ne_10m_admin_0_countries).features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                const country = data.find(c => c["Country Code"] === d.id);
                return country ? colorScale(country["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]) : "#ccc";
            })
            .attr("stroke", "#fff");

        // Add annotations
        const annotations = [{
            note: { label: "Global average life expectancy has increased significantly." },
            x: width / 2, y: height / 2, dx: 10, dy: 50
        }];
        const makeAnnotations = d3.annotation().annotations(annotations);
        svg.append("g").call(makeAnnotations);
    }).catch(error => {
        console.error('Error loading or processing data:', error);
    });
}

// Load data and initialize the visualization
d3.csv("data/lifeExpectancy.csv").then(data => {
    // Parse data as needed (e.g., convert life expectancy to numbers)
    data.forEach(d => {
        d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"] = +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"];
    });

    createScene1(data);
}).catch(error => {
    console.error('Error loading or processing CSV data:', error);
});
