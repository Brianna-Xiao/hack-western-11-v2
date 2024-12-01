// Background script for ProActive extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('ProActive Extension installed');
});

// Initialize default state
chrome.storage.sync.get("bossMode", (data) => {
  if (data.bossMode === undefined) {
    chrome.storage.sync.set({ bossMode: false });
  }
}); 