function createScene1(data) {
    console.log("Data for Scene 1:", data); // Log data for debugging

    const svg = d3.select("#visualization").select("svg");
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    // Set up projection and path
    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);

    // Calculate max life expectancy for color scaling
    const maxLifeExpectancy = d3.max(data, d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxLifeExpectancy || 100]);

    d3.json("data/world-map.topojson").then(world => {
        console.log("World TopoJSON Data:", world); // Log TopoJSON data

        const countries = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;
        console.log("Loaded Countries:", countries);

        // Compute bounds and adjust projection
        const bounds = path.bounds({type: "FeatureCollection", features: countries});
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = Math.min(width / dx, height / dy) * 0.9; // Adjust scale to fit the container
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        projection
            .scale(scale)
            .translate(translate);

        // Clear any existing paths
        svg.selectAll("path").remove();

        // Render map paths
        svg.selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                const testLifeExpectancy = Math.random() * maxLifeExpectancy;
                return colorScale(testLifeExpectancy);
            })
            .attr("stroke", "#fff");

        // Render annotations
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
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "24px")
            .attr("font-weight", "bold")
            .text("Global Life Expectancy");

    }).catch(error => {
        console.error('Error loading or processing TopoJSON data:', error);
    });
}

// Load data and initialize the visualization
function loadAndCreate() {
    d3.csv("data/lifeExpectancy.csv").then(data => {
        console.log("CSV Data Loaded:", data); // Log CSV data for debugging
        data.forEach(d => {
            d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"] = +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"];
        });

        createScene1(data);
    }).catch(error => {
        console.error('Error loading or processing CSV data:', error);
    });
}

// Initial load
loadAndCreate();

// Handle window resize
window.addEventListener("resize", loadAndCreate);
