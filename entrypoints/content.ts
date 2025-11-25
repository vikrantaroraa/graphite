export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "dark") {
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      }

      if (message.command === "darkFix") {
        document.documentElement.style.filter =
          "invert(1) hue-rotate(180deg) saturate(1.2)";
      }

      if (message.command === "revert") {
        document.documentElement.style.filter = "";
      }
    });
  },
});
