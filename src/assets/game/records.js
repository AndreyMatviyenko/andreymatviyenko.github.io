export const RECORD_KEY = "am-portfolio-flight:v1";
const empty = () => ({ score: 0, time: 0 });
const valid = value => Number.isFinite(value) && value >= 0;

export function readRecord(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(RECORD_KEY);
    let value = empty();
    if (raw) {
      try { value = JSON.parse(raw); }
      catch { return { ...empty(), persistent: true }; }
    }
    if (!valid(value?.score) || !Number.isInteger(value.score) || value.score > 1e8 || !valid(value?.time) || value.time > 86400) return { ...empty(), persistent: true };
    return { score: value.score, time: value.time, persistent: true };
  } catch {
    return { ...empty(), persistent: false };
  }
}

export function mergeRecord(previous, round) {
  return { score: Math.max(previous.score, round.score), time: Math.max(previous.time, round.time) };
}

export function writeRecord(record, storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(RECORD_KEY, JSON.stringify({ score: record.score, time: record.time }));
    return true;
  } catch {
    return false;
  }
}
