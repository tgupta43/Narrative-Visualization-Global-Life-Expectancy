// Function to create the visualization
function createScene2(data) {
    // Log the data for debugging
    console.log("Data for Scene 2:", data);

    const width = 960, height = 500;
    const svg = d3.select("#visualization").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Parse the CSV data
    data.forEach(d => {
        d["GDP (current US$) [NY.GDP.MKTP.CD]"] = +d["GDP (current US$) [NY.GDP.MKTP.CD]"];
        d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"] = +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"];
    });

    // Compute average life expectancy and average GDP for each country
    const countryDataMap = d3.rollup(data, v => {
        const nonZeroLifeExpectancy = v.map(d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]).filter(val => val > 0);
        const averageLifeExpectancy = nonZeroLifeExpectancy.length ? d3.mean(nonZeroLifeExpectancy) : 0;
        const averageGDP = d3.mean(v.map(d => d["GDP (current US$) [NY.GDP.MKTP.CD]"]));
        return { averageLifeExpectancy, averageGDP };
    }, d => d["Country Name"]);

    const values = [...countryDataMap.values()];
    const minLifeExpectancy = d3.min(values.filter(v => v.averageLifeExpectancy > 0), d => d.averageLifeExpectancy);
    const maxLifeExpectancy = d3.max(values, d => d.averageLifeExpectancy);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([minLifeExpectancy, maxLifeExpectancy]);

    // Scale and axis for GDP and life expectancy
    const xScale = d3.scaleLog()
        .domain([d3.min(values, d => d.averageGDP), d3.max(values, d => d.averageGDP)])
        .range([50, width - 50]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(values, d => d.averageLifeExpectancy)])
        .range([height - 50, 50]);

    // Add scatter plot dots
    svg.selectAll("circle")
        .data(values)
        .enter().append("circle")
        .attr("cx", d => xScale(d.averageGDP))
        .attr("cy", d => yScale(d.averageLifeExpectancy))
        .attr("r", 5)
        .attr("fill", d => d.averageLifeExpectancy > 0 ? colorScale(d.averageLifeExpectancy) : "#000")
        .on("mouseover", function(event, d) {
            const countryName = data.find(d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"] === d.averageLifeExpectancy).CountryName;
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .html(`<strong>${countryName}</strong><br>GDP: $${d.averageGDP.toLocaleString()}<br>Life Expectancy: ${d.averageLifeExpectancy}`);
        })
        .on("mouseout", function() {
            d3.select("#tooltip").style("display", "none");
        });

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".0s")).ticks(5))
        .append("text")
        .attr("x", width - 50)
        .attr("y", 30)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("GDP (current US$)");

    svg.append("g")
        .attr("transform", `translate(50, 0)`)
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("x", -30)
        .attr("y", 10)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("Life Expectancy at Birth (years)");

    // Add legend for life expectancy
    const legendWidth = 60;
    const legendHeight = height / 2;
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

    // Create color blocks for the legend
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

    // Add max and min labels to the legend
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
            note: { label: "Explore the relationship between GDP and Life Expectancy. Click next to proceed to the next scene.", title: "GDP vs Life Expectancy" },
            x: width / 2, y: height / 2, dy: -50, dx: -100
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
        .selectAll(".annotation-connector") // Remove connector lines
        .style("display", "none")
        .selectAll(".annotation-note")
        .style("stroke", "none") // Ensure no stroke
        .style("fill", "none"); // Ensure no fill
}

// Load data and initialize the visualization
d3.csv("data/lifeExpectancy.csv").then(data => {
    console.log("CSV Data Loaded:", data);
    createScene2(data);
}).catch(error => {
    console.error('Error loading or processing CSV data:', error);
});
