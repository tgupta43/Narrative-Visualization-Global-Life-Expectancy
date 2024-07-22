// Function to create the scatter plot visualization
function createScene2(data) {
    console.log("Data for Scene 2:", data); // Add a log to verify data

    const width = 960, height = 500; // Set to standard dimensions
    const svg = d3.select("#visualization").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Process the data to compute average life expectancy and GDP per country
    const countryDataMap = new Map();

    data.forEach(d => {
        const countryName = d["Country Name"].trim();
        const gdp = parseFloat(d["GDP (current US$) [NY.GDP.MKTP.CD]"]);
        const lifeExpectancy = parseFloat(d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);

        if (!isNaN(gdp) && !isNaN(lifeExpectancy) && gdp > 0 && lifeExpectancy > 0) {
            if (!countryDataMap.has(countryName)) {
                countryDataMap.set(countryName, { gdpSum: 0, lifeExpectancySum: 0, count: 0 });
            }
            const countryData = countryDataMap.get(countryName);
            countryData.gdpSum += gdp;
            countryData.lifeExpectancySum += lifeExpectancy;
            countryData.count += 1;
            countryDataMap.set(countryName, countryData);
        }
    });

    // Compute the average values and determine min/max life expectancy for color scaling
    const finalCountryDataMap = new Map();
    const lifeExpectancyValues = [];
    countryDataMap.forEach((value, key) => {
        const avgGDP = value.gdpSum / value.count;
        const avgLifeExpectancy = value.lifeExpectancySum / value.count;
        if (avgLifeExpectancy > 0) {
            finalCountryDataMap.set(key, { avgGDP, avgLifeExpectancy });
            lifeExpectancyValues.push(avgLifeExpectancy);
        }
    });

    const minLifeExpectancy = d3.min(lifeExpectancyValues);
    const maxLifeExpectancy = d3.max(lifeExpectancyValues);
    console.log("Min Life Expectancy:", minLifeExpectancy);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([minLifeExpectancy, maxLifeExpectancy]);

    // Load world map data
    d3.json("data/world-map.topojson").then(world => {
        console.log("World TopoJSON Data:", world); // Add a log to verify data
        const countries = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;
        console.log("Loaded Countries:", countries);

        // Add scatter plot points
        svg.selectAll("circle")
            .data(countries)
            .enter().append("circle")
            .attr("cx", d => projection([d.properties.longitude, d.properties.latitude])[0])
            .attr("cy", d => projection([d.properties.longitude, d.properties.latitude])[1])
            .attr("r", 5)
            .attr("fill", d => {
                const countryName = d.properties.NAME;
                const data = finalCountryDataMap.get(countryName);
                const color = data && data.avgLifeExpectancy > 0 ? colorScale(data.avgLifeExpectancy) : "#000";
                return color;
            })
            .on("mouseover", function(event, d) {
                const countryName = d.properties.NAME;
                const data = finalCountryDataMap.get(countryName);
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .html(`<strong>${countryName}</strong><br>GDP: ${data ? data.avgGDP.toFixed(2) : 'N/A'}<br>Life Expectancy: ${data ? data.avgLifeExpectancy.toFixed(2) : 'N/A'}`);
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("display", "none");
            });

        // Create the color legend
        const legendWidth = 60;
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

        const numBlocks = 10;
        const blockHeight = legendHeight / numBlocks;
        legend.selectAll("rect")
            .data(d3.range(minLifeExpectancy, maxLifeExpectancy, (maxLifeExpectancy - minLifeExpectancy) / numBlocks))
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => legendHeight - (i + 1) * blockHeight)
            .attr("width", legendWidth - 5)
            .attr("height", blockHeight)
            .style("fill", d => colorScale(d));

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

        // Annotations
        const annotations = [
            {
                note: { label: "Countries with higher GDP generally have higher life expectancy. See how various countries compare.", title: "GDP vs Life Expectancy" },
                x: width / 2, y: height / 2, dy: 37, dx: 62
            }
        ];

        const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(annotations);

        d3.select("#annotations")
            .append("svg")
            .attr("width", 200)
            .attr("height", 500)
            .call(makeAnnotations)
            .selectAll(".annotation-connector")
            .style("display", "none")
            .selectAll(".annotation-note")
            .style("stroke", "none")
            .style("fill", "none");

        // Create and add the axes for the scatter plot
        const xAxisScale = d3.scaleLog()
            .domain([d3.min([...finalCountryDataMap.values()].map(d => d.avgGDP)), d3.max([...finalCountryDataMap.values()].map(d => d.avgGDP))])
            .range([0, width]);

        const yAxisScale = d3.scaleLinear()
            .domain([d3.min(lifeExpectancyValues), d3.max(lifeExpectancyValues)])
            .range([height, 0]);

        const xAxis = d3.axisBottom(xAxisScale).ticks(10, ",.0s");
        const yAxis = d3.axisLeft(yAxisScale).ticks(10);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .append("text")
            .attr("fill", "#000")
            .attr("x", width - 10)
            .attr("y", -6)
            .attr("text-anchor", "end")
            .text("GDP (current US$)");

        svg.append("g")
            .call(yAxis)
            .append("text")
            .attr("fill", "#000")
            .attr("x", 10)
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "start")
            .text("Life Expectancy (years)");
    }).catch(error => {
        console.error('Error loading or processing TopoJSON data:', error);
    });

    // Handle window resize to adjust the projection
    window.addEventListener('resize', () => {
        const newWidth = svg.node().parentNode.clientWidth;
        const newHeight = svg.node().parentNode.clientHeight;
        svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
    });
}

// Load data and initialize the visualization
d3.csv("data/lifeExpectancy.csv").then(data => {
    console.log("CSV Data Loaded:", data); // Add a log to verify data loading
    createScene2(data);
}).catch(error => {
    console.error('Error loading or processing CSV data:', error);
});