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

      // const hasBackgroundImage = (style: CSSStyleDeclaration) => {
      //   return (
      //     style.backgroundImage &&
      //     style.backgroundImage !== "none" &&
      //     style.backgroundImage.includes("url")
      //   );
      // };

      // const hasAnyImageContent = (style: CSSStyleDeclaration) => {
      //   return (
      //     (style.backgroundImage && style.backgroundImage.includes("url")) ||
      //     (style.maskImage && style.maskImage.includes("url")) ||
      //     (style.listStyleImage && style.listStyleImage.includes("url"))
      //   );
      // };

      // Note:- list-style-image must NOT be read for pseudo-elements
      // Pseudo-elements (::before, ::after) sometimes simulate bullets using background-image.
      // If we don't differentiate pseudo-elements, we will incorrectly invert bullets and decorations.

      // Helper function to check if element OR pseudo-element has a background image
      const hasAnyImageContent = (
        style: CSSStyleDeclaration,
        tag: string,
        isPseudo: boolean
      ) => {
        const hasBg = style.backgroundImage?.includes("url");
        const hasMask = style.maskImage?.includes("url");

        // list-style-image should ONLY apply to UL/OL and NOT on pseudo-elements
        const hasList =
          !isPseudo &&
          (tag === "ul" || tag === "ol") &&
          style.listStyleImage?.includes("url");

        return hasBg || hasMask || hasList;
      };

      // const fixBackgroundImages = () => {
      //   document.querySelectorAll("*").forEach((el) => {
      //     const normal = window.getComputedStyle(el);
      //     const before = window.getComputedStyle(el, "::before");
      //     const after = window.getComputedStyle(el, "::after");

      //     // const hasAnyBg =
      //     //   hasBackgroundImage(normal) ||
      //     //   hasBackgroundImage(before) ||
      //     //   hasBackgroundImage(after);

      //     const hasAnyImg =
      //       hasAnyImageContent(normal) ||
      //       hasAnyImageContent(before) ||
      //       hasAnyImageContent(after);

      //     if (!hasAnyImg) return;

      //     (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
      //   });
      // };

      // Fix real + pseudo-element background images
      const fixBackgroundImages = () => {
        document.querySelectorAll("*").forEach((el) => {
          const tag = el.tagName.toLowerCase();

          const normal = getComputedStyle(el);
          const before = getComputedStyle(el, "::before");
          const after = getComputedStyle(el, "::after");

          const hasAnyImg =
            hasAnyImageContent(normal, tag, false) ||
            hasAnyImageContent(before, tag, true) ||
            hasAnyImageContent(after, tag, true);

          // Avoid accidental bullet inversion (critical!)
          if (tag === "li") return;

          if (!hasAnyImg) return;

          (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
        });
      };

      // const revertBackgroundImages = () => {
      //   document.querySelectorAll("*").forEach((el) => {
      //     const normal = window.getComputedStyle(el);
      //     const before = window.getComputedStyle(el, "::before");
      //     const after = window.getComputedStyle(el, "::after");

      //     // const hasAnyBg =
      //     //   hasBackgroundImage(normal) ||
      //     //   hasBackgroundImage(before) ||
      //     //   hasBackgroundImage(after);

      //     const hasAnyImg =
      //       hasAnyImageContent(normal) ||
      //       hasAnyImageContent(before) ||
      //       hasAnyImageContent(after);

      //     if (!hasAnyImg) return;

      //     (el as HTMLElement).style.filter = "";
      //   });
      // };

      // Function to revert background-image inversion
      const revertBackgroundImages = () => {
        document.querySelectorAll("*").forEach((el) => {
          const tag = el.tagName.toLowerCase();

          const normal = getComputedStyle(el);
          const before = getComputedStyle(el, "::before");
          const after = getComputedStyle(el, "::after");

          const hasAnyImg =
            hasAnyImageContent(normal, tag, false) ||
            hasAnyImageContent(before, tag, true) ||
            hasAnyImageContent(after, tag, true);

          if (tag === "li") return;

          if (!hasAnyImg) return;

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
