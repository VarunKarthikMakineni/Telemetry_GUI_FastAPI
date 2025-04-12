// This is the main update function
// All the updating is done in this single function to improve performance
// update_data is a JSON object containing all the data from the WebSocket

const date_time_options = { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

function update_GUI(update_data) {

    // Update the lift-off time if liftoff is detected
    if (flightStats.liftoff_time == null && update_data["state"] == 1) {
        flightStats.liftoff_time = update_data["time"] / 1000;
    }

    // Update the countdown using the timstamp from the data
    const time = update_data["time"]/1000;
    let countdown = "";
    if (flightStats.liftoff_time != null) {
        // If liftoff time is set, use it to calculate the countdown
        countdown = "T+" + (Math.floor((time - flightStats.liftoff_time) / 60) + "").padStart(2, "0") + ":" + (Math.floor((time - flightStats.liftoff_time) % 60 ) + "").padStart(2, "0");
    } else {
        // If liftoff time is not set, use the current time to calculate the countdown
        countdown = "ST+" + (Math.floor((time) / 60) + "").padStart(2, "0") + ":" + (Math.floor(time % 60 ) + "").padStart(2, "0");
    }
    document.getElementById("countdown-display").innerHTML = countdown;

    // Update the status display
    // const status = update_data["status"];
    const status = 3;
    document.getElementById("status-display").innerHTML = config["status"][status]["status_text"];
    document.getElementById("status-display").style.color = config["status"][status]["status_color"];
    document.getElementById("status-display").style.borderColor = config["status"][status]["status_color"];

    // Update the state display
    const state = update_data["state"];
    document.getElementById("state-display").innerHTML = config["state"][state];

    // Update the accel graph
    const accelbnodata = {x: [[time],[time],[time],[time]], y: [[update_data['bno_x']], [update_data['bno_y']], [update_data['bno_z']], [Math.sqrt(update_data['bno_x']**2 + update_data['bno_y']**2 + update_data['bno_z']**2)] ]};
    Plotly.extendTraces("accel-bno-graph-container", accelbnodata, [0,1,2,3], 60);

    const accelkxdata = {x: [[time],[time],[time],[time]], y: [[update_data['kx_x']], [update_data['kx_y']], [update_data['kx_z']], [Math.sqrt(update_data['kx_x']**2 + update_data['kx_y']**2 + update_data['kx_z']**2)] ]};
    Plotly.extendTraces("accel-kx-graph-container", accelkxdata, [0,1,2,3], 60);

    // Update the gyro graph
    const gyrodata = {x: [[time],[time],[time],[time]], y: [[update_data['gyro_x']], [update_data['gyro_y']], [update_data['gyro_z']], [Math.sqrt(update_data['gyro_x']**2 + update_data['gyro_y']**2 + update_data['gyro_z']**2)] ]};
    Plotly.extendTraces("gyro-graph-container", gyrodata, [0,1,2,3], 60);

    // Update the altitude graph
    const altitudedata = {x: [[time]], y: [[update_data["alt"]]]};
    Plotly.extendTraces("altitude-graph-container", altitudedata, [0], 60);

    const veldata = {x: [[time],[time]], y: [[update_data["v_speed"]],[update_data["airspeed"]]]};
    Plotly.extendTraces("vel-graph-container", veldata, [0,1], 60);

    // Update the G force indicator
    const gforce = Math.sqrt(update_data['bno_x']**2 + update_data['bno_y']**2 + update_data['bno_z']**2) /9.81;
    const gforce_angle = -130 + (gforce/15)*260;
    document.getElementById("g-indicator-reading").innerHTML = gforce.toFixed(1);
    document.getElementById("g-indicator-needle").style.transform = "rotate(" + gforce_angle + "deg)";

    // Update the Temp indicator
    const temp = update_data["temp"];
    const temp_angle = -130 + ((temp-20)/50)*260;   // temperature range is 20 to 70
    document.getElementById("temp-reading").innerHTML = temp.toFixed(1);
    document.getElementById("temp-needle").style.transform = "rotate(" + temp_angle + "deg)";

    // Update the airspeed indicator
    const airspeed = update_data["airspeed"];
    const airspeed_angle = -130 + ((airspeed-0)/300)*260;   // airspeed range is 0 to 300 m/s
    document.getElementById("airspeed-reading").innerHTML = airspeed.toFixed(1);
    document.getElementById("airspeed-needle").style.transform = "rotate(" + airspeed_angle + "deg)";


    // Update the voltage panel
    for (id in update_data) {
        // Skip if it is not a voltage
        if (!id.startsWith("volt_")) {
            continue;
        }
        const voltage_value_div = document.getElementById(id);
        const voltage_config = config["voltages"][id];
        const voltage_value = update_data[id];
        voltage_value_div.innerHTML = voltage_value.toFixed(1) + voltage_config["unit"];

        // find the index of the first element in config["voltages"][id]["limits"] that is greater than voltage_value
        const index = voltage_config["limits"].findIndex((element) => element > voltage_value);
        voltage_value_div.style.color = voltage_config["colors"][index];
    }

    // Update the GPS panel
    document.getElementById("gps-latitude").innerHTML = (update_data["lat"]*180/Math.PI).toFixed(6);
    document.getElementById("gps-longitude").innerHTML = (update_data["lon"]*180/Math.PI).toFixed(6);

    // Update flight stats
    if (update_data["alt"] > flightStats.apogee_baro) {
        flightStats.apogee_baro = update_data["alt"];
        flightStats.apogee_time = time;
    }

    flightStats.peak_acc = Math.max(flightStats.peak_acc, gforce);
    flightStats.max_vel = Math.max(flightStats.max_vel, update_data["airspeed"]);

    document.getElementById("flight-stats-apogee-baro").innerHTML = flightStats.apogee_baro.toFixed(1) + "m";
    document.getElementById("flight-stats-apogee-time").innerHTML = flightStats.apogee_time.toFixed(0) + "s";
    document.getElementById("flight-stats-peak-acc").innerHTML = flightStats.peak_acc.toFixed(1) + "g";
    document.getElementById("flight-stats-max-vel").innerHTML = flightStats.max_vel.toFixed(1) + "m/s";

    if(!webpageState.live_mode){
        // Update rowid
        document.getElementById("telemetry-rowid-input").value = update_data["id"];
    }

}

function update_times(data){
    // Log this update with the webpage service
    webpageState.lastUpdated = new Date();

    // Update gs_staleness
    webpageState.gs_staleness = data["time_since_gs_update"];
}

// Connect to the WebSocket. Try every 5 seconds if the connection fails

ws = null;

function connect() {
    
    // DOnt print error if the connection cannot be establisehd because server is down
    ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
        console.log("Websocket connection established");
    }

    ws.onclose = () => {
        console.log("Websocket connection closed, retrying in 5 seconds");
        setTimeout(connect, 5000);
    }
}
connect();

ws.onmessage = (event) => {

    const data = JSON.parse(event.data);

    webpageState.lastUpdated = new Date();
    webpageState.gs_staleness = data["time_since_gs_update"];
    
    switch (data["message_type"]) {
        case "telemetry_data":
            update_GUI(data);
            break;
        case "server_heartbeat":
            break;
        default:
            console.log("Unknown message type: " + data["message_type"]);
    }
};