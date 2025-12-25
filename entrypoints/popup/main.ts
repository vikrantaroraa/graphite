const toggle = document.getElementById("toggle") as HTMLInputElement;

// Ask background for current state
browser.runtime.sendMessage({ type: "GET_STATE" }).then((res) => {
  toggle.checked = res.darkEnabled;
});

// When user toggles
toggle.addEventListener("change", () => {
  browser.runtime.sendMessage({
    type: "TOGGLE_DARK",
    enabled: toggle.checked,
  });
});
