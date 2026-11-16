function starPath(ctx, x, y, radius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI / 5 - Math.PI / 2;
    const r = i % 2 ? radius * 0.45 : radius;
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
}

export function drawFlight(ctx, engine, accent, reducedMotion) {
  const { width, height, unit, player } = engine;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#f5f6f3";
  ctx.fillRect(0, 0, width, height);

  // A quiet field keeps targets and collision boundaries easy to read.
  ctx.strokeStyle = "#e5e8e3";
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  for (const hazard of engine.hazards) {
    if (hazard.warning) {
      ctx.strokeStyle = "#9c4336";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(Math.max(13, Math.min(width - 13, hazard.x)), Math.max(13, Math.min(height - 13, hazard.y)), 6 * unit, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#a24e40";
      ctx.beginPath();
      ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hazard.x - hazard.r * 0.32, hazard.y);
      ctx.lineTo(hazard.x + hazard.r * 0.32, hazard.y);
      ctx.stroke();
    }
  }
  const sparkle = reducedMotion ? 1 : 1 + Math.sin(engine.elapsed * 3) * 0.06;
  starPath(ctx, engine.star.x, engine.star.y, engine.star.r * sparkle);
  ctx.fillStyle = "#a86a0c";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.scale(unit, unit);
  ctx.strokeStyle = accent;
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 2;
  if (engine.invulnerable) {
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(-13, -13); ctx.lineTo(13, 13);
  ctx.moveTo(13, -13); ctx.lineTo(-13, 13);
  ctx.stroke();
  for (const [x, y] of [[-13, -13], [13, -13], [-13, 13], [13, 13]]) {
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.stroke();
  }
  ctx.beginPath(); ctx.roundRect(-5, -9, 10, 18, 3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(0, -3, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
