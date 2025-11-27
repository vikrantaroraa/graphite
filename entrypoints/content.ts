let mediaObserver: MutationObserver | null = null;

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      // media selectors to target different media elements on the page
      const mediaSelectors = [
        "img",
        "picture",
        "picture img", // threads web app renders the image with an <img> tag inside a <picture> tag
        "source",
        "video",
        "svg",
        "canvas",
        "iframe",
        "embed",
        "object",
      ];

      // function to fix CSS background images
      const fixBackgroundImages = () => {
        document.querySelectorAll("*").forEach((el) => {
          const style = window.getComputedStyle(el);

          // if no background image, skip
          if (!style.backgroundImage || style.backgroundImage === "none")
            return;

          // apply invert to compensate page invert
          (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
        });
      };

      // function to revert CSS background images
      const revertBackgroundImages = () => {
        document.querySelectorAll("*").forEach((el) => {
          const style = window.getComputedStyle(el);

          // if no background image, skip
          if (!style.backgroundImage || style.backgroundImage === "none")
            return;

          // remove inversion
          (el as HTMLElement).style.filter = "";
        });
      };

      // --- DARK MODE ---
      if (message.command === "dark") {
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      }

      // --- DARK MODE WITH IMAGE FIX ---
      if (message.command === "darkFix") {
        // apply global invert
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";

        // function to fix all media
        const fixMedia = () => {
          mediaSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((el) => {
              (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
            });
          });

          // fix background images
          fixBackgroundImages();
        };

        // fix initial media i.e media already loaded on the page
        fixMedia();

        // watch for dynamically loaded media
        if (mediaObserver) mediaObserver.disconnect();
        mediaObserver = new MutationObserver(fixMedia);
        mediaObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }

      // --- REVERT MODE ---
      if (message.command === "revert") {
        document.documentElement.style.filter = "";

        // remove media filters
        mediaSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => {
            (el as HTMLElement).style.filter = "";
          });
        });

        // revert background images
        revertBackgroundImages();

        // stop observer
        if (mediaObserver) {
          mediaObserver.disconnect();
          mediaObserver = null;
        }
      }
    });
  },
});
