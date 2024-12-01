import timer from '../client/components/timer.js';

new timer(
    document.querySelector(".timer-container")
);

const bossModeToggle = document.getElementById("bossModeToggle");

chrome.storage.sync.get("bossMode", (data) => {
    if (data.bossMode === undefined || data.bossMode === true) {
        // Default to "Off" when first loaded or previously "On"
        chrome.storage.sync.set({ bossMode: false }, () => {
            bossModeToggle.checked = false;
            updateSwitchUI(false);
        });
    } else {
        bossModeToggle.checked = data.bossMode;
        updateSwitchUI(data.bossMode);
    }
});

bossModeToggle.addEventListener("change", async () => {
    const isBossModeOn = bossModeToggle.checked;
    chrome.storage.sync.set({ bossMode: isBossModeOn });
    updateSwitchUI(isBossModeOn);

    if (isBossModeOn) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            console.log("Camera access granted");
            
            const videoElement = document.createElement("video");
            videoElement.autoplay = true;
            videoElement.srcObject = stream;
            videoElement.style.width = "300px"; 
            videoElement.style.border = "2px solid black";
            document.body.appendChild(videoElement);
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Camera access is required to enable Boss Mode.");
        }
    } else {
        console.log("Boss Mode is OFF. Camera access not required.");
    }
});

function updateSwitchUI(isOn) {
    console.log(`Boss Mode is now ${isOn ? "ON" : "OFF"}`);
    const label = document.querySelector("label[for='bossModeToggle']");
    label.textContent = isOn ? "Boss Mode: ON" : "Boss Mode: OFF";
}