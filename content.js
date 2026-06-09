const STORAGE_KEY = "subitoCleanerEnabled";
const HIDDEN_ATTR = "data-subito-cleaner-hidden";

function normalizeText(text) {
  return (text || "").trim().toLowerCase();
}

function hasBadgeVetrina(listing) {
  const badges = listing.querySelectorAll("span, p, div");

  for (const badge of badges) {
    const text = normalizeText(badge.innerText || badge.textContent);

    if (text === "vetrina") {
      return true;
    }
  }

  return false;
}

function hideVetrinaListings() {
  const listings = document.querySelectorAll("article");
  let hidden = 0;

  for (const listing of listings) {
    if (hasBadgeVetrina(listing)) {
      listing.style.display = "none";
      listing.setAttribute(HIDDEN_ATTR, "true");
      hidden += 1;
    }
  }

  return hidden;
}

function showVetrinaListings() {
  const hiddenListings = document.querySelectorAll(`[${HIDDEN_ATTR}="true"]`);

  for (const listing of hiddenListings) {
    listing.style.display = "";
    listing.removeAttribute(HIDDEN_ATTR);
  }
}

function applyFilter() {
  chrome.storage.sync.get({ [STORAGE_KEY]: true }, result => {
    const filterActive = result[STORAGE_KEY];

    if (filterActive) {
      hideVetrinaListings();
      return;
    }

    showVetrinaListings();
  });
}

applyFilter();

const observer = new MutationObserver(() => {
  applyFilter();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "A_CLEANER_SUBITO_REFRESH") {
    applyFilter();
    sendResponse({ ok: true });
  }
});
