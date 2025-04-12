//  ###################### GRAPHS SECTION ######################

function drawAccelBNOGraph(){

    const accelPlotData = [
        { x: [], y: [], mode: "lines", name: "x", line: { color: "rgba(200,50,50,1)" }, fill: "tozeroy", fillcolor: "rgba(200,50,50,0.25)" },
        { x: [], y: [], mode: "lines", name: "y", line: { color: "rgba(50,200,50,1)" }, fill: "tozeroy", fillcolor: "rgba(50,200,50,0.25)" },
        { x: [], y: [], mode: "lines", name: "z", line: { color: "rgba(50,50,200,1)" }, fill: "tozeroy", fillcolor: "rgba(50,50,200,0.25)" },
        { x: [], y: [], mode: "lines", name: "res", line: { color: "rgba(127,127,127,1)" }, fill: "tozeroy", fillcolor: "rgba(127,127,127,0.25)" },
    ];

    const accelPlotLayout = {
        paper_bgcolor: "transparent",
        plot_bgcolor: "#141414",
        font: { size: 10, color: "darkseagreen" },
        margin: { t: 5, b: 0, l: 0, r: 5 },
        xaxis: { automargin: true,
                 linecolor: "rgb(255,255,255)",
                 gridcolor: "rgb(120,120,120)", tickfont: { size: 10 },},
                //  title: {text: "Time (s)", standoff: 5, font: {size: 10}}},
        yaxis: { automargin: true,
                 linecolor: "rgb(255,255,255)",
                 gridcolor: "rgb(120,120,120)",
                 tickfont: { size: 10 },
                 title: {text: " BNO Acc (m/s^2)", standoff: 10, font: {size: 10}},
                 side: "right"},
        showlegend: true,
        legend: {
            // place the legend in the middle at the top outside the graph
            x: 0.5,
            y: 1.2,
            xanchor: "center",
            bgcolor: "#141414",
            orientation: "h",
        }
    };

    const accelPLotConfig = {
        staticPlot: true,
        responsive: true,
    };

    Plotly.newPlot("accel-bno-graph-container", accelPlotData, accelPlotLayout, accelPLotConfig);

}

function drawAccelKxGraph(){

    const accelPlotData = [
        { x: [], y: [], mode: "lines", name: "x", line: { color: "rgba(200,50,50,1)" }, fill: "tozeroy", fillcolor: "rgba(200,50,50,0.25)" },
        { x: [], y: [], mode: "lines", name: "y", line: { color: "rgba(50,200,50,1)" }, fill: "tozeroy", fillcolor: "rgba(50,200,50,0.25)" },
        { x: [], y: [], mode: "lines", name: "z", line: { color: "rgba(50,50,200,1)" }, fill: "tozeroy", fillcolor: "rgba(50,50,200,0.25)" },
        { x: [], y: [], mode: "lines", name: "res", line: { color: "rgba(127,127,127,1)" }, fill: "tozeroy", fillcolor: "rgba(127,127,127,0.25)" },
    ];

    const accelPlotLayout = {
        paper_bgcolor: "transparent",
        plot_bgcolor: "#141414",
        font: { size: 10, color: "darkseagreen" },
        margin: { t: 5, b: 0, l: 0, r: 5 },
        xaxis: { automargin: true,
                 linecolor: "rgb(255,255,255)",
                 gridcolor: "rgb(120,120,120)", tickfont: { size: 10 },},
                //  title: {text: "Time (s)", standoff: 5, font: {size: 10}}},
        yaxis: { automargin: true,
                 linecolor: "rgb(255,255,255)",
                 gridcolor: "rgb(120,120,120)",
                 tickfont: { size: 10 },
                 title: {text: "Kx Acc (m/s^2)", standoff: 10, font: {size: 10}},
                 side: "right"},
        showlegend: true,
        legend: {
            // place the legend in the middle at the top outside the graph
            x: 0.5,
            y: 1.2,
            xanchor: "center",
            bgcolor: "#141414",
            orientation: "h",
        }
    };

    const accelPLotConfig = {
        staticPlot: true,
        responsive: true,
    };

    Plotly.newPlot("accel-kx-graph-container", accelPlotData, accelPlotLayout, accelPLotConfig);

}

function drawGyroGraph(){

    const gyroPlotData = [
        { x: [], y: [], mode: "lines", name: "x", line: { color: "rgba(200,50,50,1)" }, fill: "tozeroy", fillcolor: "rgba(200,50,50,0.25)" },
        { x: [], y: [], mode: "lines", name: "y", line: { color: "rgba(50,200,50,1)" }, fill: "tozeroy", fillcolor: "rgba(50,200,50,0.25)" },
        { x: [], y: [], mode: "lines", name: "z", line: { color: "rgba(50,50,200,1)" }, fill: "tozeroy", fillcolor: "rgba(50,50,200,0.25)" },
        { x: [], y: [], mode: "lines", name: "res", line: { color: "rgba(127,127,127,1)" }, fill: "tozeroy", fillcolor: "rgba(127,127,127,0.25)" },
    ];

    const gyroPlotLayout = {
        paper_bgcolor: "transparent",
        plot_bgcolor: "#141414",
        font: { size: 10, color: "darkseagreen" },
        margin: { t: 5, b: 0, l: 0, r: 5 },
        xaxis: { automargin: true, linecolor: "rgb(255,255,255)", gridcolor: "rgb(120,120,120)", tickfont: { size: 10 },},// title: {text: "Time (s)", standoff: 5}},
        yaxis: { automargin: true, linecolor: "rgb(255,255,255)", gridcolor: "rgb(120,120,120)", tickfont: { size: 10 }, title: {text: "Gyro (deg/s)", standoff: 10}, side: "right"},
        showlegend: true,
        legend: {
            // place the legend in the middle at the top outside the graph
            x: 0.5,
            y: 1.2,
            xanchor: "center",
            bgcolor: "#141414",
            orientation: "h",
        }
    };

    const gyroPLotConfig = {
        staticPlot: true,
        responsive: true,
    };

    Plotly.newPlot("gyro-graph-container", gyroPlotData, gyroPlotLayout, gyroPLotConfig);

}

function drawAltitudeGraph(){

    const altitudePlotData = [
        { x: [], y: [], mode: "lines", name: "Altitude", line: { color: "rgba(127,127,127,1)" }, fill: "tozeroy" },
    ];

    const altitudePlotLayout = {
        paper_bgcolor: "transparent",
        plot_bgcolor: "#141414",
        font: { size: 10, color: "darkseagreen" },
        margin: { t: 5, b: 0, l: 0, r: 5 },
        xaxis: { automargin: true, linecolor: "rgb(255,255,255)", gridcolor: "rgb(120,120,120)", tickfont: { size: 10 },},// title: {text: "Time (s)", standoff: 5}},
        yaxis: { automargin: true, linecolor: "rgb(255,255,255)", gridcolor: "rgb(120,120,120)", tickfont: { size: 10 }, title: {text: "Altitude (m)", standoff: 10}, side: "right"},
        showlegend: false
    };

    const altitudePLotConfig = {
        staticPlot: true,
        responsive: true,
    };

    Plotly.newPlot("altitude-graph-container", altitudePlotData, altitudePlotLayout, altitudePLotConfig);

}

function drawVelGraph(){

    const velPlotData = [
        { x: [], y: [], mode: "lines", name: "vert_vel", line: { color: "rgba(200,50,50,1)" }, fill: "tozeroy", fillcolor: "rgba(200,50,50,0.25)" },
        { x: [], y: [], mode: "lines", name: "airspeed", line: { color: "rgba(50,50,200,1)" }, fill: "tozeroy", fillcolor: "rgba(50,50,200,0.25)" },
    ];

    const velPlotLayout = {
        paper_bgcolor: "transparent",
        plot_bgcolor: "#141414",
        font: { size: 10, color: "darkseagreen" },
        margin: { t: 5, b: 0, l: 0, r: 5 },
        xaxis: { automargin: true,
                 linecolor: "rgb(255,255,255)",
                 gridcolor: "rgb(120,120,120)", tickfont: { size: 10 },},
                //  title: {text: "Time (s)", standoff: 5, font: {size: 10}}},
        yaxis: { automargin: true,
                 linecolor: "rgb(255,255,255)",
                 gridcolor: "rgb(120,120,120)",
                 tickfont: { size: 10 },
                 title: {text: "Velocity (m/s)", standoff: 10, font: {size: 10}},
                 side: "right"},
        showlegend: true,
        legend: {
            // place the legend in the middle at the top outside the graph
            x: 0.5,
            y: 1.2,
            xanchor: "center",
            bgcolor: "#141414",
            orientation: "h",
        }
    };

    const velPLotConfig = {
        staticPlot: true,
        responsive: true,
    };

    Plotly.newPlot("vel-graph-container", velPlotData, velPlotLayout, velPLotConfig);

}

//  ###################### LOAD VOLTAGE PANEL ######################

const voltages_panel = document.getElementById("voltages-panel");

function loadVoltagePanel(){
    
    for (id in config["voltages"]){
        
        // Create the voltage card
        const voltage_card = document.createElement("div");
        voltage_card.className = "voltage-card";

        // Create the voltage title and its colon        
        const voltage_title = document.createElement("div");
        voltage_title.className = "voltage-title";

        const voltage_title_name = document.createElement("span");
        voltage_title_name.style.textAlign = "left";
        voltage_title_name.style.float = "left";
        voltage_title_name.innerHTML = config["voltages"][id]["name"];

        const voltage_title_colon = document.createElement("span");
        voltage_title_colon.style.textAlign = "right";
        voltage_title_colon.style.float = "right";
        voltage_title_colon.innerHTML = ":";
        voltage_title.appendChild(voltage_title_name);
        voltage_title.appendChild(voltage_title_colon);

        // Create the voltage value
        const voltage_value = document.createElement("div");
        voltage_value.className = "voltage-value";
        voltage_value.id = id;
        voltage_value.innerHTML = "0.00" + config["voltages"][id]["unit"];

        voltages_panel.appendChild(voltage_card);
        voltage_card.appendChild(voltage_title);
        voltage_card.appendChild(voltage_value);
    }

}

// ########################### POPULATE INDICATOR CONTAINERS ###########################

// Function to populate the indicator containers
function populateIndicatorContainers(){
    document.querySelectorAll(".dial-indicator-container").forEach(indicator => {
        
        // Skip if the container is already populated
        if(indicator.dataset.populated) return;
        indicator.dataset.populated = true;

        // Get the custom attributes
        const name = indicator.getAttribute("name");
        const needlecolor = indicator.getAttribute("needlecolor");
        const dialcolor = indicator.getAttribute("dialcolor");
        const title = indicator.getAttribute("title");

        // Create the indicator

        svgNS = "http://www.w3.org/2000/svg";

        indicator.id = name + "-container";

        const needle = document.createElementNS(svgNS,"svg");
        needle.className = "dial-indicator-needle";
        needle.id = name + "-needle";
        needle.setAttribute("viewBox", "0 0 220 220");
        needle.setAttribute("fill", "none");

        needle.innerHTML = `<path d="M105 38L102 6H118L115 38H105Z" fill="${needlecolor}"/>`;
        
        const dial = document.createElementNS(svgNS,"svg");
        dial.className = "dial-indicator-dial";
        dial.id = name + "-dial";
        dial.setAttribute("viewBox", "0 0 220 220");
        dial.setAttribute("fill", "none");

        dial.innerHTML = `<circle cx="110" cy="110" r="90" stroke="${dialcolor}" stroke-width="20"/>
        <path d="M110.5 123L217.454 213H3.54586L110.5 123Z" fill="currentColor"/>`;

        const reading = document.createElement("div");
        reading.className = "dial-indicator-reading";
        reading.id = name + "-reading";
        reading.innerHTML = "0.0";

        const label = document.createElement("div");
        label.className = "dial-indicator-label";
        label.id = name + "-label";
        label.innerHTML = title;

        indicator.appendChild(dial);
        indicator.appendChild(needle);
        indicator.appendChild(reading);
        indicator.appendChild(label);
    });
}