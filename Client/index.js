import timer from './components/timer.js';

// Initialize Socket.IO connection with explicit transports
const socket = io('http://localhost:3000', {
    transports: ['websocket'],
    upgrade: false,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    console.log('Connection error:', error);
});

socket.on('detection', (data) => {
    if (data.personCount === 2) {
        console.log('Two people detected!');
        bossModeToggle.checked = true;
        updateSwitchUI(true);
        
        // Switch to a "safe" tab
        chrome.tabs.query({}, function(tabs) {
            // Find a "safe" tab (e.g., Google)
            const safeTab = tabs.find(tab => 
                tab.url.includes('google.com') || 
                tab.url.includes('docs.google.com') ||
                tab.url.includes('mail.google.com')
            );
            
            if (safeTab) {
                // Switch to the safe tab
                chrome.tabs.update(safeTab.id, { active: true });
            } else {
                // If no safe tab exists, create one
                chrome.tabs.create({ 
                    url: 'https://www.google.com',
                    active: true 
                });
            }
            
            // Focus the window containing the tab
            chrome.windows.update(safeTab ? safeTab.windowId : null, { focused: true });
        });
    }
});

new timer(
    document.querySelector(".timer-container")
);

const bossModeToggle = document.getElementById("bossModeToggle");

chrome.storage.sync.get("bossMode", (data) => {
    if (data.bossMode === undefined || data.bossMode === true) {
        chrome.storage.sync.set({ bossMode: false }, () => {
            bossModeToggle.checked = false;
            updateSwitchUI(false);
        });
    } else {
        bossModeToggle.checked = data.bossMode;
        updateSwitchUI(data.bossMode);
    }
});

bossModeToggle.addEventListener("change", async (e) => {
    e.stopPropagation();
    const isBossModeOn = bossModeToggle.checked;

    if (isBossModeOn) {
        try {
            // Create a persistent window for camera access
            const width = 320;
            const height = 240;
            
            // Get the current window position
            const currentWindow = await chrome.windows.getCurrent();
            
            // Create a small window for camera access
            const cameraWindow = await chrome.windows.create({
                url: 'camera.html',
                type: 'popup',
                width: width,
                height: height,
                left: currentWindow.left + currentWindow.width - width,
                top: currentWindow.top,
                focused: false
            });

            // Listen for messages from the camera window
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === 'cameraStream') {
                    if (message.error) {
                        console.error('Camera error:', message.error);
                        bossModeToggle.checked = false;
                        updateSwitchUI(false);
                        chrome.storage.sync.set({ bossMode: false });
                    }
                }
            });

            chrome.storage.sync.set({ bossMode: true });
            updateSwitchUI(true);

        } catch (error) {
            console.error("Error accessing camera:", error);
            
            let errorMessage = "Camera access is required to enable Boss Mode. ";
            if (error.name === 'NotAllowedError') {
                errorMessage += "Please enable camera access in Chrome settings.";
            } else if (error.name === 'NotFoundError') {
                errorMessage += "No camera was found on your device.";
            } else if (error.name === 'NotReadableError') {
                errorMessage += "Camera may be in use by another application.";
            } else {
                errorMessage += error.message || "Please check your camera settings and try again.";
            }
            
            alert(errorMessage);
            bossModeToggle.checked = false;
            updateSwitchUI(false);
            chrome.storage.sync.set({ bossMode: false });
        }
    } else {
        console.log("Boss Mode is OFF. Stopping camera...");
        // Close any existing camera windows
        const windows = await chrome.windows.getAll();
        for (const window of windows) {
            const tabs = await chrome.tabs.query({ windowId: window.id });
            if (tabs.some(tab => tab.url.includes('camera.html'))) {
                await chrome.windows.remove(window.id);
            }
        }
        chrome.storage.sync.set({ bossMode: false });
        updateSwitchUI(false);
    }
});

function updateSwitchUI(isOn) {
    console.log(`Boss Mode is now ${isOn ? "ON" : "OFF"}`);
    const label = document.querySelector("label[for='bossModeToggle']");
    label.textContent = isOn ? "Boss Mode: ON" : "Boss Mode: OFF";
}