import test from "node:test";
import assert from "node:assert/strict";
import { FlightEngine } from "../src/assets/game/engine.js";
import { RECORD_KEY, readRecord, mergeRecord, writeRecord } from "../src/assets/game/records.js";

function random(seed = 42) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
}
const engine = () => new FlightEngine(800, 420, random());
const hazard = (game, overrides = {}) => ({ x: game.player.x, y: game.player.y, r: 14, vx: 0, vy: 0, warning: 0, ...overrides });

test("movement is time-based, diagonal speed is normalised, and the player stays inside the field", () => {
  const slow = engine(), fast = engine(), diagonal = engine();
  for (let i = 0; i < 20; i++) slow.update(1 / 60, { x: 1, y: 0 });
  for (let i = 0; i < 10; i++) fast.update(1 / 30, { x: 1, y: 0 });
  assert.ok(Math.abs(slow.player.x - fast.player.x) < 0.001);
  diagonal.update(0.05, { x: 1, y: 1 });
  assert.ok(Math.abs(Math.hypot(diagonal.player.x - 400, diagonal.player.y - 302.4) - 420 * 0.95 * 0.05) < 0.001);
  for (let i = 0; i < 300; i++) fast.update(1 / 60, { x: 1, y: -1 });
  assert.ok(fast.player.x <= fast.width - fast.player.r);
  assert.ok(fast.player.y >= fast.player.r);
});

test("collecting a star awards points once and places the next star away from the player", () => {
  const game = engine();
  game.player.x = game.star.x;
  game.player.y = game.star.y;
  game.update(0.01);
  assert.equal(game.score, 10);
  assert.ok(Math.hypot(game.star.x - game.player.x, game.star.y - game.player.y) >= 90);
  game.update(0.01);
  assert.equal(game.score, 10);
});

test("warnings do not damage the player; multiple hits grant a temporary recovery period", () => {
  const game = engine();
  game.hazards = [hazard(game, { warning: 0.7 })];
  game.update(0.02);
  assert.equal(game.lives, 3);
  game.hazards = [hazard(game), hazard(game)];
  game.update(0.02);
  assert.equal(game.lives, 2);
  game.update(0.02);
  assert.equal(game.lives, 2);
});

test("a fast obstacle cannot pass through the player between frames", () => {
  const game = engine();
  game.hazards = [hazard(game, { x: game.player.x - 60, vx: 2400 })];
  game.update(0.05);
  assert.equal(game.lives, 2);
});

test("the third hit ends the round; time and score stop until a clean restart", () => {
  const game = engine();
  for (let i = 0; i < 3; i++) {
    game.invulnerable = 0;
    game.hazards = [hazard(game)];
    game.update(0.02);
  }
  assert.equal(game.lives, 0);
  assert.equal(game.finished, true);
  const elapsed = game.elapsed;
  game.update(0.05);
  assert.equal(game.elapsed, elapsed);
  game.reset();
  assert.equal(game.lives, 3);
  assert.equal(game.finished, false);
  assert.equal(game.elapsed, 0);
  assert.equal(game.score, 0);
  assert.deepEqual(game.hazards, []);
});

test("difficulty rises over time and resize preserves relative positions", () => {
  const game = engine();
  game.elapsed = 31;
  assert.equal(game.level, 3);
  game.hazards = [hazard(game, { x: 200, y: 100, vx: 100, vy: 50 })];
  game.resize(400, 210);
  assert.equal(game.player.x, 200);
  assert.equal(game.player.y, 151.2);
  assert.equal(game.hazards[0].x, 100);
  assert.equal(game.hazards[0].y, 50);
  assert.ok(Number.isFinite(game.hazards[0].vx));
});

test("invalid or unavailable browser storage never prevents play", () => {
  for (const raw of ["{broken", "null", '{"score":-1,"time":4}', '{"score":2.5,"time":3}']) {
    assert.deepEqual(readRecord({ getItem: () => raw }), { score: 0, time: 0, persistent: true });
  }
  const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.deepEqual(readRecord(blocked), { score: 0, time: 0, persistent: false });
  assert.equal(writeRecord({ score: 20, time: 30 }, blocked), false);
});

test("records survive reload and shorter rounds cannot overwrite either personal best", () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const best = mergeRecord({ score: 30, time: 45 }, { score: 10, time: 60 });
  assert.deepEqual(best, { score: 30, time: 60 });
  assert.equal(writeRecord(best, storage), true);
  assert.ok(values.has(RECORD_KEY));
  assert.deepEqual(readRecord(storage), { score: 30, time: 60, persistent: true });
});
