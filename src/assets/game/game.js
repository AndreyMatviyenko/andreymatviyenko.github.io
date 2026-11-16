import { FlightEngine } from "./engine.js";
import { drawFlight } from "./draw.js";
import { readRecord, mergeRecord, writeRecord } from "./records.js";

const instances = new WeakMap();
const formatTime = seconds => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
const text = (element, value) => { if (element.textContent !== String(value)) element.textContent = value; };
const movement = new Map([
  ["ArrowLeft", [-1, 0]], ["KeyA", [-1, 0]], ["ArrowRight", [1, 0]], ["KeyD", [1, 0]],
  ["ArrowUp", [0, -1]], ["KeyW", [0, -1]], ["ArrowDown", [0, 1]], ["KeyS", [0, 1]],
]);

class FlightGame {
  constructor(dialog) {
    this.dialog = dialog;
    this.copy = JSON.parse(dialog.dataset.gameCopy);
    this.find = name => dialog.querySelector(`[data-flight-${name}]`);
    this.canvas = this.find("canvas");
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) throw new Error("Canvas is unavailable");
    this.engine = new FlightEngine();
    this.best = readRecord();
    this.keys = new Set();
    this.phase = "closed";
    this.frameId = null;
    this.motion = matchMedia("(prefers-reduced-motion: reduce)");
    this.observer = new ResizeObserver(() => this.resize());
    this.find("primary").addEventListener("click", () => this.phase === "paused" ? this.resume() : this.start());
    this.find("pause").addEventListener("click", () => this.phase === "playing" ? this.pause() : this.resume());
    this.find("restart").addEventListener("click", () => this.start());
    this.find("close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => { if (!dialog.open) this.close(); });
  }

  open(launcher) {
    if (this.dialog.open) return;
    // A native close event can still be queued when the launcher is used again.
    if (this.phase !== "closed") this.close();
    this.launcher = launcher;
    const stored = readRecord();
    this.best = { ...mergeRecord(this.best, stored), persistent: stored.persistent && this.best.persistent };
    this.dialog.showModal();
    document.documentElement.classList.add("game-open");
    this.accent = getComputedStyle(this.dialog).getPropertyValue("--profile-accent").trim();
    this.phase = "ready";
    this.resize();
    this.engine.reset();
    this.listen();
    this.observer.observe(this.find("stage"));
    this.setPhase("ready");
    this.draw();
  }

  listen() {
    this.events = new AbortController();
    const options = { signal: this.events.signal };
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pause(); }, options);
    window.addEventListener("blur", () => this.pause(), options);
    window.addEventListener("pagehide", () => { this.pause(); this.commitRecord(); }, options);
    window.addEventListener("resize", () => this.resize(), options);
    this.motion.addEventListener("change", () => this.draw(), options);
    window.addEventListener("keydown", event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("input, textarea, select")) return;
      if (event.code === "KeyP" && (this.phase === "playing" || this.phase === "paused")) {
        event.preventDefault();
        if (!event.repeat) this.phase === "playing" ? this.pause() : this.resume();
        return;
      }
      if (event.target.closest("button, a")) return;
      if (movement.has(event.code) && this.phase === "playing") {
        event.preventDefault(); this.keys.add(event.code);
      } else if (event.code === "Space" && (this.phase === "playing" || this.phase === "paused")) {
        event.preventDefault();
        if (!event.repeat) this.phase === "playing" ? this.pause() : this.resume();
      }
    }, options);
    window.addEventListener("keyup", event => this.keys.delete(event.code), options);
    this.canvas.addEventListener("pointerdown", event => {
      if (this.phase !== "playing" || (this.pointer !== undefined && this.pointer !== event.pointerId)) return;
      event.preventDefault();
      this.canvas.focus({ preventScroll: true });
      this.pointer = event.pointerId;
      this.canvas.setPointerCapture(event.pointerId);
      const point = this.pointerPosition(event);
      this.offset = event.pointerType === "mouse" ? { x: 0, y: 0 } : { x: this.engine.player.x - point.x, y: this.engine.player.y - point.y };
      this.engine.target = { x: point.x + this.offset.x, y: point.y + this.offset.y };
    }, options);
    this.canvas.addEventListener("pointermove", event => {
      if (this.phase !== "playing" || (event.pointerType !== "mouse" && this.pointer !== event.pointerId)) return;
      const point = this.pointerPosition(event);
      const offset = this.pointer === event.pointerId ? this.offset : { x: 0, y: 0 };
      this.engine.target = { x: point.x + offset.x, y: point.y + offset.y };
    }, options);
    const release = event => {
      if (this.pointer !== undefined && event.pointerId !== this.pointer) return;
      if (event.type === "pointerleave" && this.pointer !== undefined) return;
      this.pointer = undefined;
      this.engine.target = null;
    };
    for (const type of ["pointerup", "pointercancel", "lostpointercapture", "pointerleave"]) this.canvas.addEventListener(type, release, options);
  }

  pointerPosition(event) {
    const bounds = this.canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * this.engine.width / bounds.width, y: (event.clientY - bounds.top) * this.engine.height / bounds.height };
  }

  resize() {
    if (!this.dialog.open) return;
    const rect = this.find("stage").getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const changed = width !== this.engine.width || height !== this.engine.height;
    if (changed && this.phase === "playing") this.pause();
    this.engine.resize(width, height);
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.draw();
  }

  setPhase(phase) {
    this.phase = phase;
    this.dialog.dataset.gameState = phase;
    this.find("panel").hidden = phase === "playing";
    this.find("pause").disabled = phase === "ready" || phase === "over";
    this.find("restart").disabled = phase === "ready";
    text(this.find("pause-label"), phase === "paused" ? this.copy.resume : this.copy.pause);
    this.find("pause-icon").hidden = phase === "paused";
    this.find("resume-icon").hidden = phase !== "paused";
    if (phase !== "playing") {
      text(this.find("panel-title"), this.copy[`${phase}Title`]);
      text(this.find("panel-text"), phase === "over"
        ? `${this.engine.score} ${this.copy.pointsUnit} · ${formatTime(this.engine.elapsed)}. ${this.newRecord ? this.copy.newRecord : this.copy.overText}`
        : this.copy[`${phase}Text`]);
      text(this.find("primary-label"), phase === "paused" ? this.copy.resume : phase === "over" ? this.copy.replay : this.copy.start);
      this.find("primary").focus({ preventScroll: true });
      this.announce(this.find("panel-title").textContent);
    } else {
      this.canvas.focus({ preventScroll: true });
      this.announce(this.copy.playing);
    }
    this.updateHUD();
  }

  start() {
    this.stop();
    if (this.phase !== "ready") this.commitRecord();
    this.engine.reset();
    this.newRecord = false;
    this.setPhase("playing");
    this.run();
  }

  run() {
    this.lastFrame = null;
    const frame = timestamp => {
      if (this.phase !== "playing") return;
      const delta = this.lastFrame === null ? 0 : (timestamp - this.lastFrame) / 1000;
      this.lastFrame = timestamp;
      const previousScore = this.engine.score;
      const previousLives = this.engine.lives;
      const direction = { x: 0, y: 0 };
      for (const key of this.keys) { const [x, y] = movement.get(key); direction.x += x; direction.y += y; }
      this.engine.update(delta, direction);
      if (this.engine.lives !== previousLives) this.announce(`${this.copy.lives}: ${this.engine.lives}`);
      else if (this.engine.score !== previousScore) this.announce(`+10. ${this.copy.score}: ${this.engine.score}`);
      this.updateHUD();
      this.draw();
      if (this.engine.finished) {
        this.newRecord = this.engine.score > this.best.score || this.engine.elapsed > this.best.time;
        this.commitRecord();
        this.stop();
        this.setPhase("over");
      } else this.frameId = requestAnimationFrame(frame);
    };
    this.frameId = requestAnimationFrame(frame);
  }

  stop() {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.keys.clear();
    this.engine.target = null;
    if (this.pointer !== undefined && this.canvas.hasPointerCapture(this.pointer)) this.canvas.releasePointerCapture(this.pointer);
    this.pointer = undefined;
  }

  pause() {
    if (this.phase !== "playing") return;
    this.stop();
    this.setPhase("paused");
    this.draw();
  }

  resume() {
    if (this.phase !== "paused") return;
    this.setPhase("playing");
    this.run();
  }

  commitRecord() {
    if (!this.engine.elapsed) return;
    this.best = { ...mergeRecord(this.best, { score: this.engine.score, time: this.engine.elapsed }), persistent: this.best.persistent };
    this.best.persistent = writeRecord(this.best);
  }

  updateHUD() {
    text(this.find("score"), this.engine.score);
    text(this.find("time"), formatTime(this.engine.elapsed));
    text(this.find("lives"), this.engine.lives);
    text(this.find("best"), this.best.score);
    text(this.find("best-time"), formatTime(this.best.time));
    text(this.find("record-note"), this.best.persistent ? this.copy.recordNote : this.copy.sessionNote);
  }

  announce(message) { text(this.find("announcement"), message); }
  draw() { drawFlight(this.ctx, this.engine, this.accent || "#294b3e", this.motion.matches); }

  close() {
    this.commitRecord();
    this.stop();
    this.events?.abort();
    this.observer.disconnect();
    this.phase = "closed";
    this.dialog.dataset.gameState = "closed";
    document.documentElement.classList.remove("game-open");
    this.launcher?.focus({ preventScroll: true });
  }
}

export function openGame(dialog, launcher) {
  if (!instances.has(dialog)) instances.set(dialog, new FlightGame(dialog));
  instances.get(dialog).open(launcher);
}
