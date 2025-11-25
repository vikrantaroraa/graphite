export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "dark") {
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      }

      if (message.command === "darkFix") {
        // Apply page dark mode
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";

        // Revert images/videos/icons back to normal
        const mediaSelectors = [
          "img",
          "picture",
          "video",
          "svg",
          "canvas",
          "iframe",
          "embed",
        ];

        mediaSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => {
            (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
          });
        });

        // Fix future images loaded dynamically
        const observer = new MutationObserver(() => {
          mediaSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => {
              (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
            });
          });
        });

        observer.observe(document.body, { childList: true, subtree: true });
      }

      if (message.command === "revert") {
        document.documentElement.style.filter = "";
      }
    });
  },
});
