import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: ["storage", "tabs", "activeTab"],
    host_permissions: ["<all_urls>"],
  },
});
