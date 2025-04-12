// Services the webpage and updates fields without data from the server

webpageState = {
    lastUpdated: new Date(),
    tZero: new Date(5000),
    countdownRunning: false,
    launched: false,
    gs_staleness: 0,
    live_mode: true,
}

flightStats = {
    liftoff_time: null,
    apogee_baro: 0,
    apogee_time: 0,
    peak_acc: 0,
    max_vel: 0
}

setInterval(serviceWebpage, 1000);

function serviceWebpage() {
    
    // Update the live date and time from the system time
    // Date format is DD-MM-YYYY HH:MM:SS IST
    const currentTime = new Date();
    const formattedDate = currentTime.toLocaleString('en-IN', date_time_options).replace(/\//g, '-').replace(',', '');
    document.getElementById("datetime-display").innerHTML = formattedDate + ' IST';

    // Update the status
    staleness = (currentTime - webpageState.lastUpdated)/1000;
    if (staleness > 1) {
        // Change the status in the top right
        document.getElementById("status-display").innerHTML = config["status"][0]["status_text"];
        document.getElementById("status-display").style.color = config["status"][0]["status_color"];
        document.getElementById("status-display").style.borderColor = config["status"][0]["status_color"];
        
        // Change the server staleness timer
        document.getElementById("time-since-server-update-display").innerHTML = "Server: " + (Math.floor(staleness / 60) + "").padStart(2, "0") + ":" + (Math.floor(staleness % 60 ) + "").padStart(2, "0");
    } else {
        document.getElementById("time-since-server-update-display").innerHTML = "Server: 00:00";

        // But the ground station could be stale
        if (webpageState.gs_staleness > 1) {
            document.getElementById("status-display").innerHTML = config["status"][1]["status_text"];
            document.getElementById("status-display").style.color = config["status"][1]["status_color"];
            document.getElementById("status-display").style.borderColor = config["status"][1]["status_color"];
            document.getElementById("time-since-gs-update-display").innerHTML = "GS: " + (Math.floor(webpageState.gs_staleness / 60) + "").padStart(2, "0") + ":" + (Math.floor(webpageState.gs_staleness % 60 ) + "").padStart(2, "0");
        } else {
            document.getElementById("time-since-gs-update-display").innerHTML = "GS: 00:00";
        }
    }

    // Update the countdown
    if (webpageState.countdownRunning && !webpageState.launched) {
        const timeLeft = Math.floor((webpageState.tZero.getTime() - currentTime.getTime())/1000);
        const countdown = "T-" + (Math.floor(timeLeft / 60) + "").padStart(2, "0") + ":" + (Math.floor(timeLeft % 60 ) + "").padStart(2, "0");
        document.getElementById("countdown-display").innerHTML = countdown;
        if (timeLeft <= 0) {
            webpageState.countdownRunning = false;
            document.getElementById("countdown-display").innerHTML = "T-00:00";
        }
    }
}

// Functions for timer buttons callbacks

document.getElementById("countdown-reset-button").onclick = resetTimer;
document.getElementById("countdown-start-button").onclick = startTimer;

function startTimer() {
    if (webpageState.countdownRunning) {
        return;
    }
    console.log("Starting timer");
    webpageState.countdownRunning = true;
    webpageState.tZero = new Date(new Date().getTime() + webpageState.tZero.getTime());
}

function resetTimer() {
    console.log("Resetting timer");
    webpageState.countdownRunning = false;
    resetTime = config["countdown"]["reset"];
    webpageState.tZero = new Date(resetTime*1000);
    const countdown = "T-" + (Math.floor(resetTime / 60) + "").padStart(2, "0") + ":" + (Math.floor(resetTime % 60 ) + "").padStart(2, "0");
    document.getElementById("countdown-display").innerHTML = countdown;
}

// Reset the timer on page load
resetTimer();

// Theme toggling
document.getElementById("theme-switcher").onclick = toggleTheme;

useDarkTheme = 0; // Light theme

function toggleTheme() {
    // Toggle the toggle button
    useDarkTheme = 1 - useDarkTheme;
    applyTheme();
}

function applyTheme() {
    
    const buttonswitch = document.getElementById("theme-switcher");

    // Change the button class and the theme
    if (useDarkTheme == 0) {
        buttonswitch.className = "generic-button theme-toggle"
        document.body.classList.remove("dark-theme");
    } else {
        buttonswitch.className = "generic-button theme-toggle theme-toggle--toggled"
        document.body.classList.add("dark-theme");
    }

    const themeColors = getComputedStyle(document.body);

    const bg_color = themeColors.getPropertyValue("--tile-color").trim();
    const graph_font_color = themeColors.getPropertyValue("--graph-font-color").trim();
    const graph_axis_color = themeColors.getPropertyValue("--graph-axis-color").trim();
    const graph_grid_color = themeColors.getPropertyValue("--graph-grid-color").trim();

    const graph_colors = {
        "plot_bgcolor": bg_color,
        "font.color": graph_font_color,
        "xaxis.linecolor": graph_axis_color,
        "xaxis.gridcolor": graph_grid_color,
        "yaxis.linecolor": graph_axis_color,
        "yaxis.gridcolor": graph_grid_color,
        "legend.bgcolor": bg_color,
    }

    Plotly.relayout("altitude-graph-container", graph_colors);
    Plotly.relayout("accel-bno-graph-container", graph_colors);
    Plotly.relayout("accel-kx-graph-container", graph_colors);
    Plotly.relayout("gyro-graph-container", graph_colors);
    Plotly.relayout("vel-graph-container", graph_colors);
}

// Telemetry source selector panel

function set_telemetry_live() {

    document.getElementById("mode-selector-live").style.backgroundColor = "#00DD00";
    document.getElementById("mode-selector-replay").style.backgroundColor = "#835100";

    document.getElementById("telemetry-options-replay").style.display = "none";
    document.getElementById("telemetry-options-live").style.display = "grid";

    fetch("/set_telemetry_mode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify({ mode: "live" })
      })
      .then(response => response.json())
      .then(data => {
      });

      webpageState.live_mode = true;

}

function set_telemetry_replay() {

    document.getElementById("mode-selector-live").style.backgroundColor = "#004E00";
    document.getElementById("mode-selector-replay").style.backgroundColor = "#FF9D00";

    document.getElementById("telemetry-options-live").style.display = "none";
    document.getElementById("telemetry-options-replay").style.display = "grid";

    fetch("/set_telemetry_mode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify({ mode: "replay" })
      })
      .then(response => response.json())
      .then(data => {
      });

    webpageState.live_mode = false;

    update_num_rows();

}

document.getElementById("mode-selector-live").onclick = set_telemetry_live;
document.getElementById("mode-selector-replay").onclick = set_telemetry_replay;

// Live Telemetry file setting and getting
function set_telemetry_filename(filename) {

    fetch("/set_telemetry_filename", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify({ filename: filename })
      })
      .then(response => response.json())
      .then(data => {
        document.getElementById("telemetry-file-in-use").innerHTML = data["filename"];
        document.getElementById("replay-file-in-use").innerHTML = data["filename"];
      });

      update_num_rows();
}

function get_telemetry_filename() {

    // Send a get request to get the filename
    fetch("/get_telemetry_filename", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
          }
      })
      .then(response => response.json())
      .then(data => {
        document.getElementById("telemetry-file-in-use").innerHTML = data["filename"];
        document.getElementById("replay-file-in-use").innerHTML = data["filename"];
      });

}

document.getElementById("telemetry-filename-set-button").onclick = () => { 
    set_telemetry_filename(document.getElementById("telemetry-filename-input").value.trim()); 
};
document.getElementById("telemetry-filename-check-button").onclick = get_telemetry_filename;

// Populate the replay file selection dropdown with available files
function populate_replay_files() {
    // Store the currently selected value before refreshing
    const dropdown = document.getElementById("replay-files-dropdown");
    const selectedValue = dropdown.value;

    fetch("/get_telemetry_files", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(data => {
        const replay_files = data["files"];
        dropdown.innerHTML = "";  // Clear existing options
        
        // Add a default empty option if needed
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "Select a file...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        dropdown.add(defaultOption);
        
        // Add all file options
        replay_files.forEach((file) => {
            const option = document.createElement("option");
            option.value = file;
            option.text = file;
            dropdown.add(option);
        });
        
        // Restore the previously selected value if it still exists
        if (selectedValue && replay_files.includes(selectedValue)) {
            dropdown.value = selectedValue;
        }
    })
    .catch(error => {
        console.error("Error fetching telemetry files:", error);
        dropdown.innerHTML = "";
        const errorOption = document.createElement("option");
        errorOption.text = "Error loading files";
        dropdown.add(errorOption);
    });
}

document.getElementById("replay-files-dropdown").onclick = populate_replay_files;

// Set the replay file to the selected file
document.getElementById("replay-filename-set-button").onclick = () => { 
    set_telemetry_filename(document.getElementById("replay-files-dropdown").value.trim()); 
};

// Pause and play the replay
function pause_replay() {
    fetch("/pause_replay", {
        method: "POST",
      })
      .then(response => response.json())
      .then(data => {
      });
}

function play_replay() {
    fetch("/play_replay", {
        method: "POST",
      })
      .then(response => response.json())
      .then(data => {
      });
}

document.getElementById("telemetry-replay-pause-button").onclick = pause_replay;
document.getElementById("telemetry-replay-play-button").onclick = play_replay;

function update_num_rows(){
    fetch("/get_num_rows", {
        method: "GET",
      })
    .then(response => response.json())
    .then(data => {
        document.getElementById("telemetry-max-rowid").innerHTML = "/" + data["rows"];
    });
}

function set_telemetry_rowid(){
    fetch("/set_replay_row", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
          },
        body: JSON.stringify({ row: document.getElementById("telemetry-rowid-input").value })
      })
      .then(response => response.json())
      .then(data => {
      });
}

document.getElementById("replay-rowid-set-button").onclick = set_telemetry_rowid;