const STORAGE_KEY = "subitoCleanerEnabled";
const HIDDEN_ATTR = "data-subito-cleaner-hidden";
const PROMOTIONAL_WIDGET_SELECTOR = '.items__item.listing-widget';
const IN_CONTENT_AD_SELECTOR = '[id^="listing-in-content"]';
const AD_SLOT_SELECTORS = [
  "#listing-above",
  "#listing-below",
  "#listing-native-1",
  "#listing-box-1",
  '[id^="listing-in-content"]',
  '[id^="listing-native"]',
  '[id^="listing-box"]',
  '[class*="adsense-before-listing-container"]',
  '[class*="smart-adv-lira"]',
  '[class*="lira-container"]'
];

// TODO: aggiungere statistiche ad rimossi


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

function hidePromotionalWidgets() {
  const widgets = document.querySelectorAll(PROMOTIONAL_WIDGET_SELECTOR);

  for (const widget of widgets) {
    widget.remove();
  }

  const adSlots = document.querySelectorAll(AD_SLOT_SELECTORS.join(','));

  for (const adSlot of adSlots) {
    removeClosestAdContainer(adSlot);
  }
}

function removeClosestAdContainer(element) {
  const container =
      element.closest(".items__item.listing-widget") ||
      element.closest('[class*="adsense-before-listing-container"]') ||
      element.closest('[class*="smart-adv-lira"]') ||
      element.closest('[class*="lira-container"]') ||
      element;

  container.remove();
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
      hidePromotionalWidgets();
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
