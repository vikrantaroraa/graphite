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

      // Helper function to check if element OR pseudo-element has a background image
      const hasBackgroundImage = (style: CSSStyleDeclaration) => {
        return (
          style.backgroundImage &&
          style.backgroundImage !== "none" &&
          style.backgroundImage.includes("url")
        );
      };

      // Fix real + pseudo-element background images
      const fixBackgroundImages = () => {
        document.querySelectorAll("*").forEach((el) => {
          const normal = window.getComputedStyle(el);
          const before = window.getComputedStyle(el, "::before");
          const after = window.getComputedStyle(el, "::after");

          const hasAnyBg =
            hasBackgroundImage(normal) ||
            hasBackgroundImage(before) ||
            hasBackgroundImage(after);

          if (!hasAnyBg) return;

          (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
        });
      };

      // Function to revert background-image inversion
      const revertBackgroundImages = () => {
        document.querySelectorAll("*").forEach((el) => {
          const normal = window.getComputedStyle(el);
          const before = window.getComputedStyle(el, "::before");
          const after = window.getComputedStyle(el, "::after");

          const hasAnyBg =
            hasBackgroundImage(normal) ||
            hasBackgroundImage(before) ||
            hasBackgroundImage(after);

          if (!hasAnyBg) return;

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
