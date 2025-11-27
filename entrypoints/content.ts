let mediaObserver: MutationObserver | null = null;

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      // dark mode
      if (message.command === "dark") {
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      }

      // dark mode with image fix
      if (message.command === "darkFix") {
        // apply global invert
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";

        const mediaSelectors = [
          "img",
          "picture",
          "picture img", // threads web app renders the image with an img tag inside a picture tag
          "source",
          "video",
          "svg",
          "canvas",
          "iframe",
          "embed",
          "object",
        ];

        // function to fix media
        const fixMedia = () => {
          mediaSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => {
              (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
            });
          });
        };

        // fix initial media
        fixMedia();

        // watch for dynamically loaded media
        if (mediaObserver) mediaObserver.disconnect();
        mediaObserver = new MutationObserver(fixMedia);
        mediaObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }

      // revert back to normal mode
      if (message.command === "revert") {
        document.documentElement.style.filter = "";

        // remove media filters
        const mediaSelectors = [
          "img",
          "picture",
          "picture img", // threads web app renders the image with an img tag inside a picture tag
          "source",
          "video",
          "svg",
          "canvas",
          "iframe",
          "embed",
          "object",
        ];

        mediaSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => {
            (el as HTMLElement).style.filter = "";
          });
        });

        // stop observer
        if (mediaObserver) {
          mediaObserver.disconnect();
          mediaObserver = null;
        }
      }
    });
  },
});
