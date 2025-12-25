// const toggle = document.getElementById("toggle") as HTMLInputElement;

// // Ask background for current state
// browser.runtime.sendMessage({ type: "GET_STATE" }).then((res) => {
//   toggle.checked = res.darkEnabled;
// });

// // When user toggles
// toggle.addEventListener("change", () => {
//   browser.runtime.sendMessage({
//     type: "TOGGLE_DARK",
//     enabled: toggle.checked,
//   });
// });

const toggle = document.getElementById("toggle") as HTMLInputElement;
if (!toggle) throw new Error("Toggle not found");

async function getCurrentTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function loadState() {
  const tab = await getCurrentTab();
  if (!tab?.id) return;

  const key = `darkfix:${tab.id}`;
  const stored = await browser.storage.local.get(key);

  toggle.checked = Boolean(stored[key]);
}

toggle.addEventListener("change", async () => {
  const tab = await getCurrentTab();
  if (!tab?.id) return;

  const enabled = toggle.checked;
  const key = `darkfix:${tab.id}`;

  // Persist state
  await browser.storage.local.set({ [key]: enabled });

  // Notify content script
  try {
    await browser.tabs.sendMessage(tab.id, {
      command: enabled ? "enable" : "disable",
    });
  } catch {
    // Content script not ready yet — page reload will fix it
  }
});

// Load state when popup opens
loadState();
