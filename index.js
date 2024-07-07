async function loadFullList() {
  const [tab] = await chrome.tabs.query({ active: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const sleep = (ms) => new Promise((resolve) => setInterval(resolve, ms));
      const getLastItem = () => {
        const allItems = document.querySelectorAll("[data-widget='orderList']");
        return Array.from(allItems).at(-1);
      };

      let previousLastItem = null;
      let lastItem = null;

      const MAX_COUNT = 40;
      const SLEEP_INTERVAL = 50;

      outerLoop: while (true) {
        previousLastItem = lastItem;

        for (let count = 0; count < MAX_COUNT; count++) {
          if (lastItem != previousLastItem) {
            continue outerLoop;
          }
          lastItem = getLastItem();
          lastItem.scrollIntoView();
          await sleep(SLEEP_INTERVAL);
        }

        break outerLoop;
      }
    },
  });
}

document
  .getElementById("load-full-list")
  .addEventListener("click", loadFullList);

async function findNextItem() {
  const input = document.getElementById("input");

  const [tab] = await chrome.tabs.query({ active: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async (searchStr) => {
      const getItems = () => {
        const items = document.querySelectorAll(
          `[data-widget='orderList'] a[href*='${searchStr}']`
        );
        return Array.from(items);
      };

      if (!window.searchState || window.searchState.searchStr != searchStr) {
        window.searchState = {
          searchStr,
          index: 0,
          items: getItems(),
        };
      }
      const state = window.searchState;
      if (state.index > state.items.length - 1) {
        state.index = 0;
      }
      const item = state.items[state.index++];
      if (item) {
        item.style.border = "8px solid red";
        item.scrollIntoView({ block: "center" });
      }
    },
    args: [input.value],
  });
}

document.getElementById("find-next").addEventListener("click", findNextItem);
