const VIDEO_SESSION_STORAGE_KEY = 'seedance:last-video-session';
const VIDEO_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24;

export interface StoredVideoSession {
  id: string;
  status?: string;
  updatedAt: number;
}

export function isPersistableVideoId(id?: string | null) {
  if (!id) return false;
  return id.length >= 16 && /[A-Za-z]/.test(id);
}

export function saveVideoSession(id: string, status?: string) {
  if (typeof window === 'undefined' || !isPersistableVideoId(id)) {
    return;
  }

  const payload: StoredVideoSession = {
    id,
    status,
    updatedAt: Date.now(),
  };

  window.localStorage.setItem(
    VIDEO_SESSION_STORAGE_KEY,
    JSON.stringify(payload)
  );
}

export function loadVideoSession(): StoredVideoSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(VIDEO_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredVideoSession;
    if (
      !parsed?.id ||
      !parsed.updatedAt ||
      Date.now() - parsed.updatedAt > VIDEO_SESSION_MAX_AGE_MS
    ) {
      clearVideoSession();
      return null;
    }

    return parsed;
  } catch {
    clearVideoSession();
    return null;
  }
}

export function clearVideoSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(VIDEO_SESSION_STORAGE_KEY);
}
