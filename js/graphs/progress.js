export const LineGraph = (data) =>{
    let cumulativeSum = 0;
    const parsedData = data.map((d, index) => {
        cumulativeSum += d.amount;
        return {
            ...d,
            cumulativeAmount: cumulativeSum,
            timestamp: new Date(d.createdAt).getTime()
        };
    });

    // Graph dimensions
    const width = 1024;
    const height = 500;
    const padding = 50;

    // Calculate scale factors
    const xMin = Math.min(...parsedData.map(d => d.timestamp));
    const xMax = Math.max(...parsedData.map(d => d.timestamp));
    const yMin = 0; // Start from 0 for cumulative sum
    const yMax = Math.max(...parsedData.map(d => d.cumulativeAmount));
    const xScale = (width - 2 * padding) / (xMax - xMin);
    const yScale = (height - 2 * padding) / (yMax - yMin);

    // Create the SVG container
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    // Draw axes
    const axesGroup = document.createElementNS(svgNamespace, "g");

    // X-axis
    const xAxis = document.createElementNS(svgNamespace, "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding);
    xAxis.setAttribute("stroke", "black");
    axesGroup.appendChild(xAxis);

    // Y-axis
    const yAxis = document.createElementNS(svgNamespace, "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding);
    yAxis.setAttribute("stroke", "black");
    axesGroup.appendChild(yAxis);

    svg.appendChild(axesGroup);

    // Tooltip
    const tooltip = document.getElementById("tooltip");

    // Plot points and lines
    const lineGroup = document.createElementNS(svgNamespace, "g");
    let pathData = "";

    parsedData.forEach((point, index) => {
        const x = padding + (point.timestamp - xMin) * xScale;
        const y = height - padding - (point.cumulativeAmount - yMin) * yScale;

        // Add point as a circle
        const circle = document.createElementNS(svgNamespace, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 4);
        circle.setAttribute("fill", "blue");

        // Add hover interaction
        circle.addEventListener("mouseover", () => {
            tooltip.style.display = "block";
            tooltip.textContent = `Date: ${new Date(point.timestamp).toLocaleString()}, Cumulative Amount: ${point.cumulativeAmount}, Path: ${point.path}`;
        });

        circle.addEventListener("mousemove", e => {
            tooltip.style.left = e.pageX + 10 + "px";
            tooltip.style.top = e.pageY - 20 + "px";
        });

        circle.addEventListener("mouseout", () => {
            tooltip.style.display = "none";
        });

        lineGroup.appendChild(circle);

        // Add line segments
        if (index === 0) {
            pathData += `M${x},${y}`;
        } else {
            pathData += ` L${x},${y}`;
        }
    });

    // Create the path for the line
    const linePath = document.createElementNS(svgNamespace, "path");
    linePath.setAttribute("d", pathData);
    linePath.setAttribute("fill", "none");
    linePath.setAttribute("stroke", "blue");
    linePath.setAttribute("stroke-width", 2);
    lineGroup.appendChild(linePath);

    svg.appendChild(lineGroup);

    // Add SVG to the DOM
    document.getElementById("chart-container").appendChild(svg);
}