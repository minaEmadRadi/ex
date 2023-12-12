// Initialize tabTimeTracker to store tab-specific timing information
let tabTimeTracker = {};
let tabUrlDictionary = {}; // Dictionary to store tab URLs by ID
let baseUrlDictionary = {}; // Dictionary to store base URLs and their associated tab IDs

// Function to log tab URL changes
function logTabURL(tab) {
    console.log("Tab URL changed to:", tab.url);
}

// Function to handle data from the content script
function handleContentScriptData(message) {
    if (message.pageContent && message.pageUrl) {
        console.log("Received data from content script:");
        console.log("Page URL:", message.pageUrl);
        console.log("Page Content:", message.pageContent);
        // You can further process or store the data as needed
    }
}

// Function to handle data from the page console
function handlePageConsoleData(message) {
    if (message.pageData) {
        console.log("Received data from page console:", message.pageData);
        // You can further process or store the data as needed
    }
}

// Function to log tab name with duration in minutes
function logTabDuration(tabId) {
    if (tabTimeTracker[tabId]) {
        const endTime = Date.now();
        const startTime = tabTimeTracker[tabId].startTime;
        const elapsedTime = endTime - startTime;
        const elapsedTimeMinutes = (elapsedTime / 60000).toFixed(2); // Convert to minutes with 2 decimal places

        // Retrieve the tab URL from the dictionary
        const tabUrl = tabUrlDictionary[tabId];

        console.log(`Tab URL: ${tabUrl}, Time spent on tab (Tab ID ${tabId}): ${elapsedTimeMinutes} minutes`);

        // Check if the base URL is active in another tab
        const baseUrl = new URL(tabUrl).origin;
        const activeTabsWithBaseUrl = Object.keys(tabUrlDictionary).filter(id => {
            return tabUrlDictionary[id] && new URL(tabUrlDictionary[id]).origin === baseUrl;
        });

        // If the base URL is not active in another tab, delete the data
        if (activeTabsWithBaseUrl.length === 1) {
            delete tabTimeTracker[tabId];
            delete tabUrlDictionary[tabId];
            delete baseUrlDictionary[baseUrl];
        }
    }
}

// Event listener for tab removal
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    // Use the dictionary to get the URL of the tab being removed
    const tabUrl = tabUrlDictionary[tabId];
    if (tabUrl) {
        logTabDuration(tabId);
    } else {
        console.log(`Tab (Tab ID ${tabId}) no longer exists.`);
    }
});

// Event listener for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        // Store the tab URL in the dictionary when the tab is updated
        tabUrlDictionary[tabId] = tab.url;

        // Store the base URL in the baseUrlDictionary
        const baseUrl = new URL(tab.url).origin;
        baseUrlDictionary[baseUrl] = tabId;

        logTabURL(tab);
    }
});

// Event listener for messages from content script and page console
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.pageContent || message.pageUrl) {
        handleContentScriptData(message);
    }
    if (message.pageData) {
        handlePageConsoleData(message);
    }
    if (message.keysData) {
        // Handle data from content script
        console.log("Received data from content script:", message.keysData.key);
        // You can further process or store the data as needed
    }
});

// Event listener for tab activation
chrome.tabs.onActivated.addListener(function (activeInfo) {
    const tabId = activeInfo.tabId;
    tabTimeTracker[tabId] = { startTime: Date.now() };
});

console.log("Background script is running");
// Event listener for keyboard input
chrome.input.ime.onKeyEvent.addListener(function(event) {
    if (event.type === 'keydown' || event.type === 'keyup') {
        // Process the keyboard event here
        console.log("Keyboard event:", event);
        
        // You can send the keyboard event data to your content script or handle it as needed
    }
});

