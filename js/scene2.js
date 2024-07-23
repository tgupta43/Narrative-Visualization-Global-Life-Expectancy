// Function to create the scatter plot visualization
function createScene2(data) {
    console.log("Data for Scene 2:", data); // Add a log to verify data

    const width = 800; // Adjusted width for smaller scatterplot
    const height = 500; // Adjusted height for smaller scatterplot
    const margin = { top: 20, right: 140, bottom: 50, left: 120 }; // Increased right margin for legend

    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Create a map from country names to averaged GDP and life expectancy values
    const countryDataMap = d3.rollup(data, v => {
        const nonZeroLifeExpectancy = v.map(d => +d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]).filter(val => val > 0);
        const averageLifeExpectancy = nonZeroLifeExpectancy.length ? d3.mean(nonZeroLifeExpectancy) : 0;
        const averageGDP = d3.mean(v.map(d => +d["GDP (current US$) [NY.GDP.MKTP.CD]"]));
        return { averageLifeExpectancy, averageGDP };
    }, d => d["Country Name"]);

    console.log("Country Data Map:", countryDataMap); // Log to verify calculations

    const values = [...countryDataMap.entries()].map(([countryName, { averageLifeExpectancy, averageGDP }]) => ({
        countryName,
        averageLifeExpectancy,
        averageGDP
    }));

    // Find Chad's average life expectancy
    const chadData = values.find(d => d.countryName === "Chad");
    const chadLifeExpectancy = chadData ? chadData.averageLifeExpectancy : 0;

    // Define the range for the legend and color scale
    const minLifeExpectancy = Math.max(chadLifeExpectancy, d3.min(values, d => d.averageLifeExpectancy));
    const maxLifeExpectancy = d3.max(values, d => d.averageLifeExpectancy);
    const minGDP = d3.min(values.filter(d => !isNaN(d.averageGDP)), d => d.averageGDP);
    const maxGDP = d3.max(values.filter(d => !isNaN(d.averageGDP)), d => d.averageGDP);

    console.log("Chad's Life Expectancy:", chadLifeExpectancy);
    console.log("Min Life Expectancy:", minLifeExpectancy);
    console.log("Max Life Expectancy:", maxLifeExpectancy);
    console.log("Min GDP:", minGDP);
    console.log("Max GDP:", maxGDP);

    // Color scale for life expectancy
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([minLifeExpectancy, maxLifeExpectancy]);

    const xScale = d3.scaleLinear()
        .domain([minGDP, maxGDP])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, maxLifeExpectancy])
        .range([height - margin.bottom, margin.top]);

    // Custom logarithmic transformation function
    function logTransform(x) {
        return Math.log(x + 1); // Adding 1 to avoid log(0)
    }

    // Apply the transformation to the xScale domain
    const xTransformedScale = d3.scaleLinear()
        .domain([logTransform(minGDP), logTransform(maxGDP)])
        .range([margin.left, width - margin.right]);

    // Test xScale manually with hardcoded values
    const testValues = [minGDP, maxGDP, (minGDP + maxGDP) / 2];
    testValues.forEach(value => {
        const x = xTransformedScale(logTransform(value));
        console.log(`Test value: ${value}, xTransformedScale result: ${x}`);
    });

    // Add scatter plot dots, filtering out entries with NaN or null GDP
    svg.selectAll("circle")
        .data(values.filter(d => !isNaN(d.averageGDP) && d.averageGDP !== null)) // Filter out points with NaN or null GDP
        .enter().append("circle")
        .attr("cx", d => {
            const x = xTransformedScale(logTransform(d.averageGDP));
            console.log(`GDP: ${d.averageGDP}, xTransformedScale Domain: ${xTransformedScale.domain()}, x: ${x}`); // Log to debug
            return isNaN(x) ? 0 : x; // Fallback if x is NaN
        })
        .attr("cy", d => {
            const y = yScale(d.averageLifeExpectancy);
            console.log(`Life Expectancy: ${d.averageLifeExpectancy}, yScale Domain: ${yScale.domain()}, y: ${y}`); // Log to debug
            return isNaN(y) ? 0 : y; // Fallback if y is NaN
        })
        .attr("r", 5)
        .attr("fill", d => d.averageLifeExpectancy ? colorScale(d.averageLifeExpectancy) : "#ccc") // Handle null or undefined values
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .style("display", "inline-block")
                .html(`Country: ${d.countryName}<br>Life Expectancy: ${d.averageLifeExpectancy}`);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("display", "none");
        });

    // Append x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xTransformedScale).tickFormat(d => Math.exp(d) - 1).ticks(5))
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 10)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .text("GDP (Current US$)");

    // Append y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5))
        .append("text")
        .attr("x", -margin.top)
        .attr("y", margin.top - 10)
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Life Expectancy (Years)");

    // Append legend
    const legend = d3.select("#legend");
    legend.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("class", "legend-label")
        .text("Life Expectancy (Years)");

    const legendScale = d3.scaleLinear()
        .domain([minLifeExpectancy, maxLifeExpectancy])
        .range([0, 300]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(5)
        .tickSize(10)
        .tickFormat(d => Math.round(d));

    legend.append("g")
        .attr("transform", "translate(20, 20)")
        .call(legendAxis);
}
