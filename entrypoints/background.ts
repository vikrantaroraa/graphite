// export default defineBackground(() => {
//   console.log("Dark Mode Extension Loaded");

//   // Create main parent item
//   browser.contextMenus.create({
//     id: "darkRoot",
//     title: "Graphite",
//     contexts: ["all"],
//   });

//   // Sub-option: Dark Mode
//   browser.contextMenus.create({
//     id: "darkFix",
//     parentId: "darkRoot",
//     title: "Dark Mode",
//     contexts: ["all"],
//   });

//   // Sub-option: Revert
//   browser.contextMenus.create({
//     id: "revert",
//     parentId: "darkRoot",
//     title: "Revert",
//     contexts: ["all"],
//   });
//   // Handle click
//   browser.contextMenus.onClicked.addListener((info, tab) => {
//     if (!tab?.id) return;

//     browser.tabs.sendMessage(tab.id, {
//       command: info.menuItemId,
//     });
//   });
// });

export default defineBackground(() => {
  let darkEnabled = false;
  browser.runtime.onMessage.addListener(async (message, sender) => {
    if (message.type === "TOGGLE_DARK") {
      darkEnabled = message.enabled;

      // Get active tab
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) return;

      browser.tabs.sendMessage(tab.id, {
        command: darkEnabled ? "darkFix" : "revert",
      });
    }

    if (message.type === "GET_STATE") {
      return Promise.resolve({ darkEnabled });
    }
  });
});
