const STORAGE_KEY = "subitoCleanerEnabled";
const toggle = document.getElementById("toggle");
const refreshButton = document.getElementById("refresh");

function updateCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];

    if (!tab || !tab.id) {
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "A_CLEANER_SUBITO_REFRESH" });
  });
}

chrome.storage.sync.get({ [STORAGE_KEY]: true }, result => {
  toggle.checked = result[STORAGE_KEY];
});

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ [STORAGE_KEY]: toggle.checked }, () => {
    updateCurrentTab();
  });
});

refreshButton.addEventListener("click", () => {
  updateCurrentTab();
});
