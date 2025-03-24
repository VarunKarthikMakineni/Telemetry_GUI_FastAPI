// ######################## FETCH RESOURCES ########################

async function loadFile(url) {
    try {
      // Wait for the fetch request to complete
      const response = await fetch(url);
  
      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Wait for the response to be parsed (e.g., as JSON, text, etc.)
      const data = await response.json(); // or .text(), .blob(), etc.
  
      // Return the loaded data
      return data;
    } catch (error) {
      console.error("Error loading file:", error);
    }
}

function loadJS(url) {
    return new Promise((resolve, reject) => {
        // Create a new <script> element
        const script = document.createElement("script");

        // Set the src attribute to the JS file URL
        script.src = url;

        // Resolve the promise when the script is loaded
        script.onload = () => {
            console.log("JS file loaded:", url);
            resolve();
        };

        // Reject the promise if the script fails to load
        script.onerror = () => {
            console.error("Failed to load JS file:", url);
            reject(new Error(`Failed to load script: ${url}`));
        };

        // Append the <script> element to the document's <head>
        document.head.appendChild(script);
    });
}