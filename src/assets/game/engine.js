const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function sweptCollision(start, end, radius) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = dx * dx + dy * dy;
  const t = length ? clamp(-(start.x * dx + start.y * dy) / length, 0, 1) : 0;
  return (start.x + dx * t) ** 2 + (start.y + dy * t) ** 2 <= radius * radius;
}

export class FlightEngine {
  constructor(width = 800, height = 420, random = Math.random) {
    this.random = random;
    this.width = width;
    this.height = height;
    this.reset();
  }

  get unit() { return clamp(Math.min(this.width, this.height) / 420, 0.65, 1.15); }
  get level() { return Math.min(8, 1 + Math.floor(this.elapsed / 15)); }

  reset() {
    this.elapsed = 0;
    this.score = 0;
    this.lives = 3;
    this.finished = false;
    this.invulnerable = 0;
    this.spawnIn = 2;
    this.hazards = [];
    this.target = null;
    this.player = { x: this.width / 2, y: this.height * 0.72, r: 12 * this.unit };
    this.star = { x: this.width / 2, y: this.height * 0.3, r: 10 * this.unit };
  }

  resize(width, height) {
    const sx = width / this.width;
    const sy = height / this.height;
    const oldUnit = this.unit;
    this.width = width;
    this.height = height;
    const scale = this.unit / oldUnit;
    for (const item of [this.player, this.star, ...this.hazards]) {
      item.x *= sx;
      item.y *= sy;
      item.r *= scale;
      if (item.vx !== undefined) { item.vx *= scale; item.vy *= scale; }
    }
    if (this.target) { this.target.x *= sx; this.target.y *= sy; }
    this.boundPlayer();
  }

  boundPlayer() {
    const margin = this.player.r + 8 * this.unit;
    this.player.x = clamp(this.player.x, margin, this.width - margin);
    this.player.y = clamp(this.player.y, margin, this.height - margin);
  }

  placeStar() {
    const margin = 30 * this.unit;
    let best = this.star;
    let bestClearance = -Infinity;
    // Bounded retries keep small arenas and dense later waves responsive.
    for (let i = 0; i < 24; i++) {
      const candidate = {
        x: margin + this.random() * (this.width - margin * 2),
        y: margin + this.random() * (this.height - margin * 2),
        r: 10 * this.unit,
      };
      const playerClearance = Math.hypot(candidate.x - this.player.x, candidate.y - this.player.y) - 90 * this.unit;
      const hazardClearance = Math.min(Infinity, ...this.hazards.map(h => Math.hypot(candidate.x - h.x, candidate.y - h.y) - h.r - 38 * this.unit));
      const clearance = Math.min(playerClearance, hazardClearance);
      if (clearance > bestClearance) { best = candidate; bestClearance = clearance; }
      if (clearance >= 0) break;
    }
    this.star = best;
  }

  spawnHazard() {
    const r = (11 + this.random() * 7) * this.unit;
    const side = Math.floor(this.random() * 4);
    const x = side === 0 ? -r : side === 1 ? this.width + r : this.random() * this.width;
    const y = side === 2 ? -r : side === 3 ? this.height + r : this.random() * this.height;
    const angle = Math.atan2(this.player.y - y, this.player.x - x) + (this.random() - 0.5) * 0.5;
    const speed = Math.min(this.width, this.height) * (0.22 + this.level * 0.035);
    this.hazards.push({ x, y, r, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, warning: 0.7 });
  }

  update(delta, direction = { x: 0, y: 0 }) {
    if (this.finished) return;
    const dt = clamp(delta, 0, 0.05);
    this.elapsed += dt;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    const previousPlayer = { ...this.player };
    const speed = Math.min(this.width, this.height) * 0.95;
    const length = Math.hypot(direction.x, direction.y);
    if (length) {
      this.target = null;
      this.player.x += direction.x / length * speed * dt;
      this.player.y += direction.y / length * speed * dt;
    } else if (this.target) {
      const dx = this.target.x - this.player.x;
      const dy = this.target.y - this.player.y;
      const distance = Math.hypot(dx, dy);
      const travel = Math.min(distance * (1 - Math.exp(-16 * dt)), speed * 1.5 * dt);
      if (distance) { this.player.x += dx / distance * travel; this.player.y += dy / distance * travel; }
    }
    this.boundPlayer();
    this.spawnIn -= dt;
    if (this.spawnIn <= 0) {
      this.spawnHazard();
      this.spawnIn = Math.max(0.32, 1.15 - (this.level - 1) * 0.12);
    }
    let hit = null;
    for (const hazard of this.hazards) {
      const previous = { x: hazard.x - previousPlayer.x, y: hazard.y - previousPlayer.y };
      const activeTime = Math.max(0, dt - hazard.warning);
      hazard.warning = Math.max(0, hazard.warning - dt);
      hazard.x += hazard.vx * activeTime;
      hazard.y += hazard.vy * activeTime;
      if (!hazard.warning && !this.invulnerable && sweptCollision(previous, { x: hazard.x - this.player.x, y: hazard.y - this.player.y }, hazard.r + this.player.r)) hit ??= hazard;
    }
    if (hit) {
      this.hazards = this.hazards.filter(hazard => hazard !== hit);
      this.lives--;
      this.invulnerable = 1.6;
      if (!this.lives) { this.finished = true; return; }
    }
    this.hazards = this.hazards.filter(h => h.x > -80 && h.x < this.width + 80 && h.y > -80 && h.y < this.height + 80);
    if (Math.hypot(this.player.x - this.star.x, this.player.y - this.star.y) <= this.player.r + this.star.r) {
      this.score += 10;
      this.placeStar();
    }
  }
}
