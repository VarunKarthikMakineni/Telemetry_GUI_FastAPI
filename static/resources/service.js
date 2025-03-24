// Services the webpage and updates fields without data from the server

webpageState = {
    lastUpdated: new Date(),
    tZero: new Date(5000),
    countdownRunning: false,
    launched: false
}

setInterval(serviceWebpage, 1000);

function serviceWebpage() {
    
    // Update the live date and time from the system time
    // Date format is DD-MM-YYYY HH:MM:SS IST
    const currentTime = new Date();
    const formattedDate = currentTime.toLocaleString('en-IN', date_time_options).replace(/\//g, '-').replace(',', '');
    document.getElementById("datetime-display").innerHTML = formattedDate + ' IST';

    // Update the ground station status
    staleness = (currentTime - webpageState.lastUpdated)/1000;
    if (staleness > 1) {
        // Change the status in the top right
        document.getElementById("status-display").innerHTML = config["status"][0]["status_text"];
        document.getElementById("status-display").style.color = config["status"][0]["status_color"];
        document.getElementById("status-display").style.borderColor = config["status"][0]["status_color"];
        
        // Change the GS staleness timer
        document.getElementById("time-since-gs-update-display").innerHTML = "GS: " + (Math.floor(staleness / 60) + "").padStart(2, "0") + ":" + (Math.floor(staleness % 60 ) + "").padStart(2, "0");
    } else {
        document.getElementById("time-since-gs-update-display").innerHTML = "GS: 00:00";
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
        buttonswitch.className = "theme-switcher theme-toggle"
        document.body.classList.remove("dark-theme");
    } else {
        buttonswitch.className = "theme-switcher theme-toggle theme-toggle--toggled"
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
    Plotly.relayout("accel-graph-container", graph_colors);
    Plotly.relayout("gyro-graph-container", graph_colors);
}