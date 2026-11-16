const launcher = document.querySelector("[data-game-launch]");
const dialog = document.querySelector("[data-flight-game]");
const error = document.querySelector("[data-game-load-error]");
let modulePromise;

if (launcher && dialog && typeof dialog.showModal === "function") {
  launcher.hidden = false;
  launcher.addEventListener("click", async () => {
    launcher.disabled = true;
    launcher.setAttribute("aria-busy", "true");
    error.hidden = true;
    try {
      modulePromise ??= import("./game.js");
      const { openGame } = await modulePromise;
      openGame(dialog, launcher);
    } catch {
      modulePromise = null;
      error.hidden = false;
    } finally {
      launcher.disabled = false;
      launcher.removeAttribute("aria-busy");
    }
  });
}
