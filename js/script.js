// Function to create the visualization
function createScene1(data) {
    console.log("Data for Scene 1:", data);

    const width = document.getElementById("visualization").clientWidth;
    const height = document.getElementById("visualization").clientHeight;

    const svg = d3.select("#map")
        .attr("width", width)
        .attr("height", height)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const projection = d3.geoMercator()
        .scale(120) // Adjust scale for proper fit
        .translate([width / 2, height / 1.5]); // Center the map within SVG

    const path = d3.geoPath().projection(projection);

    // Calculate max life expectancy
    const maxLifeExpectancy = d3.max(data, d => +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    // Calculate min life expectancy greater than zero
    const minLifeExpectancy = d3.min(data, d => {
        const value = +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"];
        return value > 0 ? value : undefined;
    });

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

    console.log("Final Country Data Map:", [...finalCountryDataMap.entries()]);

    // Load world map data
    d3.json("data/world-map.topojson").then(world => {
        console.log("World TopoJSON Data:", world);
        const countries = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;
        console.log("Loaded Countries:", countries);

        // Add countries to the map with color based on life expectancy
        svg.selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                // Find life expectancy for each country
                const countryName = d.properties.NAME;
                const lifeExpectancy = finalCountryDataMap.get(countryName);
                return lifeExpectancy ? colorScale(lifeExpectancy) : "#000";
            })
            .attr("stroke", "#fff")
            .on("mouseover", function(event, d) {
                const countryName = d.properties.NAME;
                const lifeExpectancy = finalCountryDataMap.get(countryName);
                d3.select("#tooltip")
                    .style("display", "block")
                    .html(`<strong>${countryName}</strong><br>Life Expectancy: ${lifeExpectancy ? lifeExpectancy.toFixed(2) : "N/A"}`);
            })
            .on("mousemove", function(event) {
                d3.select("#tooltip")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                d3.select("#tooltip")
                    .style("display", "none");
            });

        // Create the legend
        const legendWidth = 40;
        const legendHeight = 300;
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

        // Gradient for legend
        const defs = legend.append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        linearGradient.selectAll("stop")
            .data(colorScale.ticks().map((t, i, n) => ({
                offset: `${100 * i / n.length}%`,
                color: colorScale(t)
            })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        legend.append("rect")
            .attr("width", legendWidth - 20)
            .attr("height", legendHeight)
            .style("fill", "url(#linear-gradient)")
            .attr("transform", `translate(0, 0)`);
    }).catch(error => console.error('Error loading world map data:', error));
}

// Load data and create the visualization
d3.csv("data/lifeExpectancy.csv").then(createScene1).catch(error => console.error('Error loading data:', error));
