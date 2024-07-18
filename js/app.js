// D3.js code for Scene 1: Global Temperature Rise
// Define SVG dimensions, scales, axes, and annotations

const svg1 = d3.select("#visualization1")
    .append("svg")
    .attr("width", 800)
    .attr("height", 400);

// Example data and scales
const data1 = [{ year: 1900, temperature: 0.5 }, /* more data */ ];
const xScale1 = d3.scaleTime().domain([new Date(1900, 0, 1), new Date(2020, 0, 1)]).range([0, 800]);
const yScale1 = d3.scaleLinear().domain([-1, 1]).range([400, 0]);

// Add axes
svg1.append("g").attr("transform", "translate(0,400)").call(d3.axisBottom(xScale1));
svg1.append("g").call(d3.axisLeft(yScale1));

// Add line
const line1 = d3.line()
    .x(d => xScale1(new Date(d.year, 0, 1)))
    .y(d => yScale1(d.temperature));

svg1.append("path")
    .datum(data1)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line1);

// D3.js code for Scene 2: CO2 Emissions
// Define SVG dimensions, scales, axes, and annotations
// Repeat similar steps for visualization2

// D3.js code for Scene 3: Sea Level Rise
// Define SVG dimensions, scales, axes, and annotations
// Repeat similar steps for visualization3
