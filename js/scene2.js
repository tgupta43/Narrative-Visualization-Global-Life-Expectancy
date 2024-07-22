// Scene 2: Scatter Plot of GDP vs Life Expectancy

// Set dimensions and margins for the scatter plot
const margin = { top: 20, right: 30, bottom: 50, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Append SVG object to the body
const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip element
const tooltip = d3.select("#tooltip");

// Load data
d3.csv("data/lifeExpectancy.csv").then(data => {

    // Parse data
    data.forEach(d => {
        d.GDP = +d["GDP (current US$) [NY.GDP.MKTP.CD]"];
        d.LifeExpectancy = +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"];
    });

    // X scale
    const x = d3.scaleLog()
        .domain([d3.min(data, d => d.GDP), d3.max(data, d => d.GDP)])
        .range([0, width]);

    // Y scale
    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.LifeExpectancy), d3.max(data, d => d.LifeExpectancy)])
        .range([height, 0]);

    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format(".0s")))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width)
        .attr("y", 40)
        .style("text-anchor", "end")
        .text("GDP (current US$)");

    // Y axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top)
        .attr("y", -50)
        .style("text-anchor", "end")
        .text("Life Expectancy at Birth (years)");

    // Add dots
    svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.GDP))
        .attr("cy", d => y(d.LifeExpectancy))
        .attr("r", 5)
        .style("fill", "#69b3a2")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Country: ${d["Country Name"]}<br>GDP: ${d.GDP}<br>Life Expectancy: ${d.LifeExpectancy}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("display", "block");
        })
        .on("mouseout", d => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("display", "none");
        });

}).catch(error => console.error(error));
