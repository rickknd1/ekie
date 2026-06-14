// Suivis & identité appareil — stockés localement (pas de login, cf décision D4).
const FOLLOW_KEY = "ekie:follows";
const DEVICE_KEY = "ekie:device";
const VILLE_KEY = "ekie:ville";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getFollows(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isFollowing(quartierId: string): boolean {
  return getFollows().includes(quartierId);
}

export function toggleFollow(quartierId: string): boolean {
  const follows = getFollows();
  const i = follows.indexOf(quartierId);
  let now: boolean;
  if (i >= 0) {
    follows.splice(i, 1);
    now = false;
  } else {
    follows.push(quartierId);
    now = true;
  }
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(follows));
  return now;
}

export function getSelectedVille(): string {
  if (typeof window === "undefined") return "yaounde";
  return localStorage.getItem(VILLE_KEY) || "yaounde";
}

export function setSelectedVille(id: string) {
  if (typeof window !== "undefined") localStorage.setItem(VILLE_KEY, id);
}
