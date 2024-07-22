// Load the data from the CSV file
d3.csv("data/lifeExpectancy.csv").then(data => {
    // Parse the data and calculate the required metrics
    const countryData = {};

    data.forEach(d => {
        const country = d["Country Name"].trim();
        const lifeExpectancy = parseFloat(d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
        const gdp = parseFloat(d["GDP (current US$) [NY.GDP.MKTP.CD]"]);

        if (!isNaN(lifeExpectancy) && !isNaN(gdp)) {
            if (!countryData[country]) {
                countryData[country] = { totalLifeExpectancy: 0, count: 0, totalGDP: 0 };
            }
            countryData[country].totalLifeExpectancy += lifeExpectancy;
            countryData[country].count += 1;
            countryData[country].totalGDP += gdp;
        }
    });

    // Compute average GDP and life expectancy
    const formattedData = Object.keys(countryData).map(country => {
        const { totalLifeExpectancy, count, totalGDP } = countryData[country];
        return {
            country: country,
            averageLifeExpectancy: totalLifeExpectancy / count,
            averageGDP: totalGDP / count
        };
    });

    // Find min and max for color scale and x/y scales
    const minLifeExpectancy = d3.min(formattedData, d => d.averageLifeExpectancy);
    const maxLifeExpectancy = d3.max(formattedData, d => d.averageLifeExpectancy);
    const minGDP = d3.min(formattedData, d => d.averageGDP);
    const maxGDP = d3.max(formattedData, d => d.averageGDP);

    console.log("Formatted Data:", formattedData); // Debugging the formatted data
    console.log("Min Life Expectancy:", minLifeExpectancy);
    console.log("Max Life Expectancy:", maxLifeExpectancy);
    console.log("Min GDP:", minGDP);
    console.log("Max GDP:", maxGDP);

    // Set up the SVG dimensions
    const svg = d3.select("#visualization").append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    // Define the scales
    const xScale = d3.scaleLinear()
        .domain([minGDP, maxGDP])
        .range([0, width]); // Map to SVG width

    const yScale = d3.scaleLinear()
        .domain([0, maxLifeExpectancy])
        .range([height, 0]); // Map to SVG height

    console.log("xScale domain:", xScale.domain()); // Debugging the scale domain
    console.log("xScale range:", xScale.range()); // Debugging the scale range
    console.log("yScale domain:", yScale.domain()); // Debugging the scale domain
    console.log("yScale range:", yScale.range()); // Debugging the scale range

    // Define the color scale based on life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([minLifeExpectancy, maxLifeExpectancy]);

    // Create tooltip element
    const tooltip = d3.select("#tooltip");

    // Plot the data
    svg.selectAll("circle")
        .data(formattedData)
        .enter().append("circle")
        .attr("cx", d => {
            const x = xScale(d.averageGDP);
            console.log(`GDP: ${d.averageGDP}, x: ${x}`); // Debugging the x position
            return isNaN(x) ? 0 : x; // Use 0 as fallback for NaN
        })
        .attr("cy", d => {
            const y = yScale(d.averageLifeExpectancy);
            console.log(`Life Expectancy: ${d.averageLifeExpectancy}, y: ${y}`); // Debugging the y position
            return isNaN(y) ? height : y; // Use height as fallback for NaN
        })
        .attr("r", 5) // Adjust size as needed
        .style("fill", d => {
            const lifeExpectancyColor = colorScale(d.averageLifeExpectancy);
            console.log(`Life Expectancy: ${d.averageLifeExpectancy}, Color: ${lifeExpectancyColor}`); // Debugging color
            return lifeExpectancyColor;
        })
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px")
                .html(`<strong>${d.country}</strong><br>Average GDP: $${d.averageGDP.toLocaleString()}<br>Life Expectancy: ${d.averageLifeExpectancy} yr`);
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    // Add axes for clarity
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".0s"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
}).catch(error => {
    console.error('Error loading or processing CSV data:', error);
});
