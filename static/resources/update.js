// This is the main update function
// All the updating is done in this single function to improve performance
// update_data is a JSON object containing all the data from the WebSocket

const date_time_options = { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

function update_GUI(update_data) {

    // Log this update with the webpage service
    webpageState.lastUpdated = new Date();

    // Update the countdown using the timstamp from the data
    const timestamp = update_data["timestamp"]/1000;
    const countdown = "T+" + (Math.floor(timestamp / 60) + "").padStart(2, "0") + ":" + (Math.floor(timestamp % 60 ) + "").padStart(2, "0");
    document.getElementById("countdown-display").innerHTML = countdown;

    // Update the status display
    const status = update_data["status"];
    document.getElementById("status-display").innerHTML = config["status"][status]["status_text"];
    document.getElementById("status-display").style.color = config["status"][status]["status_color"];
    document.getElementById("status-display").style.borderColor = config["status"][status]["status_color"];

    // Update the state display
    const state = update_data["state"];
    document.getElementById("state-display").innerHTML = config["state"][state];

    // Update the accel graph
    const acceldata = {x: [[timestamp],[timestamp],[timestamp],[timestamp]], y: [[update_data["acc"]['x']], [update_data['acc']["y"]], [update_data['acc']["z"]], [update_data['acc']["res"]]]};
    Plotly.extendTraces("accel-graph-container", acceldata, [0,1,2,3], 500);

    // Update the gyro graph
    const gyrodata = {x: [[timestamp],[timestamp],[timestamp],[timestamp]], y: [[update_data["gyro"]['x']], [update_data['gyro']["y"]], [update_data['gyro']["z"]], [update_data['gyro']["res"]]]};
    Plotly.extendTraces("gyro-graph-container", gyrodata, [0,1,2,3], 500);

    // Update the altitude graph
    const altitudedata = {x: [[timestamp]], y: [[update_data["altitude"]]]};
    Plotly.extendTraces("altitude-graph-container", altitudedata, [0], 500);

    // Update the G force indicator
    const gforce = update_data['acc']['res']/9.81;
    const gforce_angle = -130 + (gforce/15)*260;
    document.getElementById("g-indicator-reading").innerHTML = gforce.toFixed(1);
    document.getElementById("g-indicator-needle").style.transform = "rotate(" + gforce_angle + "deg)";

    // Update the voltage panel
    for (id in update_data["voltages"]) {
        const voltage_value_div = document.getElementById(id);
        const voltage_config = config["voltages"][id];
        const voltage_value = update_data["voltages"][id];
        voltage_value_div.innerHTML = voltage_value.toFixed(1) + voltage_config["unit"];

        // find the index of the first element in config["voltages"][id]["limits"] that is greater than voltage_value
        const index = voltage_config["limits"].findIndex((element) => element > voltage_value);
        voltage_value_div.style.color = voltage_config["colors"][index];
    }

}


// Connect to the WebSocket
const ws = new WebSocket("ws://localhost:8000/ws");

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // extendAccelGraph(data);
    update_GUI(data);
};

ws.onopen = function() {
    console.log("WebSocket connection established.");
};

ws.onclose = function() {
    console.log("WebSocket connection closed.");
};