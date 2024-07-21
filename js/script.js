// js/script.js

// Function to create the visualization
function createScene1(data) {
    const width = 960, height = 500;
    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator().scale(150).translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    // Find the max life expectancy value to set the domain of the color scale
    const maxLifeExpectancy = d3.max(data, d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxLifeExpectancy || 100]);

    // Load world map data
    d3.json("data/world-map.topojson").then(world => {
        svg.selectAll("path")
            .data(topojson.feature(world, world.objects.ne_10m_admin_0_countries).features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                const country = data.find(c => c["Country Code"] === d.id);
                if (country) {
                    console.log(`Country: ${country["Country Name"]}, Life Expectancy: ${country["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]}`);
                }
                return country ? colorScale(country["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]) : "#ccc";
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
