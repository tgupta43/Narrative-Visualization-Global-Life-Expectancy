function createScene1(data) {
    console.log("Data for Scene 1:", data);

    const svg = d3.select("#visualization").select("svg");
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);

    const maxLifeExpectancy = d3.max(data, d => d["Life expectancy at birth, total (years) [SP.DYN.LE00.IN]"]);
    console.log("Max Life Expectancy:", maxLifeExpectancy);

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxLifeExpectancy || 100]);

    d3.json("data/world-map.topojson").then(world => {
        console.log("World TopoJSON Data:", world);

        const geojson = topojson.feature(world, world.objects.ne_10m_admin_0_countries);
        console.log("GeoJSON Data:", geojson);

        const countries = geojson.features;
        console.log("Countries Data:", countries);

        const bounds = path.bounds({type: "FeatureCollection", features: countries});
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = Math.min(width / dx, height / dy) * 0.9;
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        projection
            .scale(scale)
            .translate(translate);

        svg.selectAll("path").remove();

        svg.selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("d", d => {
                const pathData = path(d);
                console.log("Path Data:", pathData);
                return pathData;
            })
            .attr("fill", d => {
                const testLifeExpectancy = Math.random() * maxLifeExpectancy;
                return colorScale(testLifeExpectancy);
            })
            .attr("stroke", "#fff");

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
