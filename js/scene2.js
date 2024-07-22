// Function to create the scatter plot visualization
function createScene2(data) {
    console.log("Data for Scene 2:", data); // Log the data for debugging

    const width = 960;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 50, left: 70 };

    const svg = d3.select("#visualization").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the data to ensure the GDP and Life Expectancy are numbers
    data.forEach(d => {
        d.GDP = +d["GDP (current US$) [NY.GDP.MKTP.CD]"];
        d.lifeExpectancy = +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"];
    });

    // Create scales
    const x = d3.scaleLog()
        .domain([d3.min(data, d => d.GDP), d3.max(data, d => d.GDP)])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.lifeExpectancy), d3.max(data, d => d.lifeExpectancy)])
        .range([height, 0]);

    // Create color scale
    const colorScale = d3.scaleSequential()
        .domain([d3.min(data, d => d.lifeExpectancy), d3.max(data, d => d.lifeExpectancy)])
        .interpolator(d3.interpolatePlasma);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("$.2s")))
        .append("text")
        .attr("x", width)
        .attr("y", -10)
        .attr("fill", "black")
        .style("text-anchor", "end")
        .text("GDP (current US$)");

    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top)
        .attr("y", 15)
        .attr("dy", "-1em")
        .attr("fill", "black")
        .style("text-anchor", "end")
        .text("Life Expectancy at Birth (years)");

    // Add points
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.GDP))
        .attr("cy", d => y(d.lifeExpectancy))
        .attr("r", 5)
        .style("fill", d => colorScale(d.lifeExpectancy))
        .style("opacity", 0.7)
        .on("mouseover", function(event, d) {
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .html(`<strong>${d["Country Name"]}</strong><br>GDP: $${d3.format(",.2f")(d.GDP)}<br>Life Expectancy: ${d.lifeExpectancy}`);
        })
        .on("mouseout", function() {
            d3.select("#tooltip").style("display", "none");
        });

    // Handle window resize to adjust the scatter plot
    window.addEventListener('resize', () => {
        const newWidth = svg.node().parentNode.clientWidth - margin.left - margin.right;
        const newHeight = svg.node().parentNode.clientHeight - margin.top - margin.bottom;

        x.range([0, newWidth]);
        y.range([newHeight, 0]);

        svg.select(".x.axis")
            .attr("transform", `translate(0,${newHeight})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("$.2s")));

        svg.select(".y.axis")
            .call(d3.axisLeft(y));

        svg.selectAll("circle")
            .attr("cx", d => x(d.GDP))
            .attr("cy", d => y(d.lifeExpectancy));
    });
}

// Load data and initialize the visualization
d3.csv("data/lifeExpectancy.csv").then(data => {
    console.log("CSV Data Loaded:", data); // Add a log to verify data loading
    createScene2(data);
}).catch(error => {
    console.error('Error loading or processing CSV data:', error);
});
