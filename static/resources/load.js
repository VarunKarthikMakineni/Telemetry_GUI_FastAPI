(async () => {

    // Load the config file
    config = await loadFile('./resources/config.json');
    console.log("Config loaded");

    // Load JS files
    await loadJS('./resources/load_graphics.js');
    await loadJS('./resources/service.js');
    await loadJS('./resources/update.js');
    
    // Draw the graphs
    drawAccelGraph();
    drawGyroGraph();
    drawAltitudeGraph();
    
    // Load the voltage panel
    loadVoltagePanel();

    // Populate the indicator containers
    populateIndicatorContainers();

    // Load the theme
    applyTheme();
})();