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
  browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === "GET_TAB_ID") {
      return Promise.resolve(sender.tab?.id);
    }
  });
});
