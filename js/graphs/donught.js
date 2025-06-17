export function generateDonutChart(totalDown, totalUp) {
    const total = totalDown + totalUp;
    const downPercentage = (totalDown / total) * 100;
    const upPercentage = (totalUp / total) * 100;

    const container = document.getElementById('donught');
    const svgNS = "http://www.w3.org/2000/svg";
    const chartSize = 300;
    const radius = chartSize / 2 - 50;
    const center = chartSize / 2;
    const innerRadius = radius - 30;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", chartSize);
    svg.setAttribute("height", chartSize);
    svg.setAttribute("viewBox", `0 0 ${chartSize} ${chartSize}`);

    let cumulativeAngle = 0;

    const sections = [
        { value: totalDown, color: "#f44336" },
        { value: totalUp, color: "#4caf50" }
    ];

    sections.forEach((section) => {
        const sliceAngle = (section.value / total) * 360;
        const x1 = center + radius * Math.cos((cumulativeAngle * Math.PI) / 180);
        const y1 = center + radius * Math.sin((cumulativeAngle * Math.PI) / 180);
        cumulativeAngle += sliceAngle;
        const x2 = center + radius * Math.cos((cumulativeAngle * Math.PI) / 180);
        const y2 = center + radius * Math.sin((cumulativeAngle * Math.PI) / 180);

        const largeArcFlag = sliceAngle > 180 ? 1 : 0;

        const pathData = [
            `M ${center} ${center}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            "Z",
        ].join(" ");

        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", section.color);
        svg.appendChild(path);
    });

    // Inner circle for the donut
    const innerCircle = document.createElementNS(svgNS, "circle");
    innerCircle.setAttribute("cx", center);
    innerCircle.setAttribute("cy", center);
    innerCircle.setAttribute("r", innerRadius);
    innerCircle.setAttribute("fill", "#fff");
    svg.appendChild(innerCircle);

    container.appendChild(svg);
}