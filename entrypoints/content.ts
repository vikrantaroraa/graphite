// let mediaObserver: MutationObserver | null = null;

// export default defineContentScript({
//   matches: ["<all_urls>"],
//   main() {
//     browser.runtime.onMessage.addListener((message) => {
//       // media selectors to target different media elements on the page
//       const mediaSelectors = [
//         "img",
//         "picture img", // threads web app renders the image with an <img> tag inside a <picture> tag
//         "source",
//         "video",
//         "svg",
//         "canvas",
//         "iframe",
//         "embed",
//         "object",
//       ];

//       // --- NEW: Detect whether an element contains real media inside it ---
//       const containsMedia = (el: Element) => {
//         return el.querySelector("img, video, svg, canvas") !== null;
//       };

//       // Note:- list-style-image must NOT be read for pseudo-elements
//       // Pseudo-elements (::before, ::after) sometimes simulate bullets using background-image.
//       // If we don't differentiate pseudo-elements, we will incorrectly invert bullets and decorations.

//       // Helper function to check if element OR pseudo-element has a background image
//       const hasAnyImageContent = (
//         style: CSSStyleDeclaration,
//         tag: string,
//         isPseudo: boolean
//       ) => {
//         const hasBg = style.backgroundImage?.includes("url");
//         const hasMask = style.maskImage?.includes("url");

//         // list-style-image should ONLY apply to UL/OL and NOT on pseudo-elements
//         const hasList =
//           !isPseudo &&
//           (tag === "ul" || tag === "ol") &&
//           style.listStyleImage?.includes("url");

//         return hasBg || hasMask || hasList;
//       };

//       // Fix real + pseudo-element background images
//       const fixBackgroundImages = () => {
//         document.querySelectorAll("*").forEach((el) => {
//           const tag = el.tagName.toLowerCase();

//           const normal = getComputedStyle(el);
//           const before = getComputedStyle(el, "::before");
//           const after = getComputedStyle(el, "::after");

//           const hasAnyImg =
//             hasAnyImageContent(normal, tag, false) ||
//             hasAnyImageContent(before, tag, true) ||
//             hasAnyImageContent(after, tag, true);

//           // Avoid accidental bullet inversion (critical!)
//           if (tag === "li") return;

//           // NEW FIX:
//           // If this element contains real media (img/video/canvas/svg),
//           // we MUST NOT apply invert on the parent, otherwise it double-inverts children.
//           if (containsMedia(el)) return;

//           if (!hasAnyImg) return;

//           (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
//         });
//       };

//       // Function to revert background-image inversion
//       const revertBackgroundImages = () => {
//         document.querySelectorAll("*").forEach((el) => {
//           const tag = el.tagName.toLowerCase();

//           const normal = getComputedStyle(el);
//           const before = getComputedStyle(el, "::before");
//           const after = getComputedStyle(el, "::after");

//           const hasAnyImg =
//             hasAnyImageContent(normal, tag, false) ||
//             hasAnyImageContent(before, tag, true) ||
//             hasAnyImageContent(after, tag, true);

//           if (tag === "li") return;

//           // Same rule for revert
//           if (containsMedia(el)) return;

//           if (!hasAnyImg) return;

//           (el as HTMLElement).style.filter = "";
//         });
//       };

//       // --- DARK MODE ---
//       if (message.command === "dark") {
//         document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
//       }

//       // --- DARK MODE WITH IMAGE FIX ---
//       if (message.command === "darkFix") {
//         // apply global invert
//         document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";

//         // function to fix all media
//         const fixMedia = () => {
//           mediaSelectors.forEach((selector) => {
//             document.querySelectorAll(selector).forEach((el) => {
//               (el as HTMLElement).style.filter = "invert(1) hue-rotate(180deg)";
//             });
//           });

//           // fix background images
//           fixBackgroundImages();
//         };

//         // fix initial media i.e media already loaded on the page
//         fixMedia();

//         // watch for dynamically loaded media
//         if (mediaObserver) mediaObserver.disconnect();
//         mediaObserver = new MutationObserver(fixMedia);
//         mediaObserver.observe(document.body, {
//           childList: true,
//           subtree: true,
//         });
//       }

//       // --- REVERT MODE ---
//       if (message.command === "revert") {
//         document.documentElement.style.filter = "";

//         // remove media filters
//         mediaSelectors.forEach((selector) => {
//           document.querySelectorAll(selector).forEach((el) => {
//             (el as HTMLElement).style.filter = "";
//           });
//         });

//         // revert background images
//         revertBackgroundImages();

//         // stop observer
//         if (mediaObserver) {
//           mediaObserver.disconnect();
//           mediaObserver = null;
//         }
//       }
//     });
//   },
// });

// let mediaObserver: MutationObserver | null = null;

// export default defineContentScript({
//   matches: ["<all_urls>"],
//   main() {
//     browser.runtime.onMessage.addListener((message) => {
//       injectStyles();

//       const mediaSelectors = [
//         "img",
//         "picture img",
//         "source",
//         "video",
//         "svg",
//         "canvas",
//         "iframe",
//         "embed",
//         "object",
//       ];

//       const containsMedia = (el: Element) => {
//         return el.querySelector("img, video, svg, canvas") !== null;
//       };

//       const hasAnyImageContent = (
//         style: CSSStyleDeclaration,
//         tag: string,
//         isPseudo: boolean
//       ) => {
//         const hasBg = style.backgroundImage?.includes("url");
//         const hasMask = style.maskImage?.includes("url");

//         const hasList =
//           !isPseudo &&
//           (tag === "ul" || tag === "ol") &&
//           style.listStyleImage?.includes("url");

//         return hasBg || hasMask || hasList;
//       };

//       const fixBackgroundImages = () => {
//         document.querySelectorAll("*").forEach((el) => {
//           const tag = el.tagName.toLowerCase();

//           if (tag === "li") return;
//           if (containsMedia(el)) return;

//           const normal = getComputedStyle(el);
//           const before = getComputedStyle(el, "::before");
//           const after = getComputedStyle(el, "::after");

//           const hasAnyImg =
//             hasAnyImageContent(normal, tag, false) ||
//             hasAnyImageContent(before, tag, true) ||
//             hasAnyImageContent(after, tag, true);

//           if (!hasAnyImg) return;

//           el.classList.add("darkfix-bg");
//         });
//       };

//       const revertBackgroundImages = () => {
//         document.querySelectorAll(".darkfix-bg").forEach((el) => {
//           el.classList.remove("darkfix-bg");
//         });
//       };

//       // --- DARK MODE ---
//       if (message.command === "dark") {
//         document.documentElement.classList.add("darkfix-root");
//       }

//       // --- DARK MODE WITH IMAGE FIX ---
//       if (message.command === "darkFix") {
//         document.documentElement.classList.add("darkfix-root");

//         const fixMedia = () => {
//           mediaSelectors.forEach((selector) => {
//             document.querySelectorAll(selector).forEach((el) => {
//               el.classList.add("darkfix-media");
//             });
//           });

//           fixBackgroundImages();
//         };

//         fixMedia();

//         if (mediaObserver) mediaObserver.disconnect();
//         mediaObserver = new MutationObserver(fixMedia);
//         mediaObserver.observe(document.body, {
//           childList: true,
//           subtree: true,
//         });
//       }

//       // --- REVERT MODE ---
//       if (message.command === "revert") {
//         document.documentElement.classList.remove("darkfix-root");

//         document.querySelectorAll(".darkfix-media").forEach((el) => {
//           el.classList.remove("darkfix-media");
//         });

//         revertBackgroundImages();

//         if (mediaObserver) {
//           mediaObserver.disconnect();
//           mediaObserver = null;
//         }
//       }
//     });

//     function injectStyles() {
//       if (document.getElementById("darkfix-styles")) return;

//       const style = document.createElement("style");
//       style.id = "darkfix-styles";
//       style.textContent = `
//         .darkfix-root {
//           filter: invert(1) hue-rotate(180deg) !important;
//         }
//         .darkfix-media {
//           filter: invert(1) hue-rotate(180deg) !important;
//         }
//         .darkfix-bg {
//           filter: invert(1) hue-rotate(180deg) !important;
//         }
//       `;
//       document.head.appendChild(style);
//     }
//   },
// });

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      injectStyles();

      // --- ENABLE DARK MODE ---
      if (message.command === "darkFix") {
        document.documentElement.classList.add("darkfix");
      }

      // --- DISABLE DARK MODE ---
      if (message.command === "revert") {
        document.documentElement.classList.remove("darkfix");
      }
    });

    function injectStyles() {
      if (document.getElementById("darkfix-styles")) return;

      const style = document.createElement("style");
      style.id = "darkfix-styles";
      style.textContent = `
        /* Root inversion */
        html.darkfix {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* Re-invert visual media */
        html.darkfix img,
        html.darkfix video,
        html.darkfix canvas,
        html.darkfix iframe,
        html.darkfix svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      `;
      document.head.appendChild(style);
    }
  },
});
